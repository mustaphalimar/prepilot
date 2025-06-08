package app

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/mustaphalimar/prepilot/internal/store"
)

// Helper functions to convert to SQL types
func stringToNullString(s *string) sql.NullString {
	if s == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: *s, Valid: true}
}

func boolToNullBool(b *bool) sql.NullBool {
	if b == nil {
		return sql.NullBool{Valid: false}
	}
	return sql.NullBool{Bool: *b, Valid: true}
}

func timeToNullTime(t *time.Time) sql.NullTime {
	if t == nil {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{Time: *t, Valid: true}
}

func stringValueToNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// ClerkWebhookEvent represents the structure of Clerk webhook events
type ClerkWebhookEvent struct {
	Type   string          `json:"type"`
	Object string          `json:"object"`
	Data   json.RawMessage `json:"data"`
}

// ClerkUser represents user data from Clerk webhooks
type ClerkUser struct {
	ID                string                 `json:"id"`
	EmailAddresses    []ClerkEmailAddress    `json:"email_addresses"`
	FirstName         *string                `json:"first_name"`
	LastName          *string                `json:"last_name"`
	ImageURL          string                 `json:"image_url"`
	Banned            bool                   `json:"banned"`
	CreatedAt         int64                  `json:"created_at"`
	UpdatedAt         int64                  `json:"updated_at"`
	LastSignInAt      *int64                 `json:"last_sign_in_at"`
	ExternalAccounts  []ClerkExternalAccount `json:"external_accounts"`
}

type ClerkEmailAddress struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
	Verification struct {
		Status string `json:"status"`
	} `json:"verification"`
}

type ClerkExternalAccount struct {
	ID               string `json:"id"`
	Provider         string `json:"provider"`
	IdentificationID string `json:"identification_id"`
	EmailAddress     string `json:"email_address"`
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	ImageURL         string `json:"image_url"`
}

// ClerkWebhookHandler handles webhook events from Clerk
func (app *Application) ClerkWebhookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("🔔 Clerk webhook received: %s %s\n", r.Method, r.URL.Path)
	fmt.Printf("📋 Headers: %+v\n", r.Header)

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Printf("❌ Failed to read request body: %v\n", err)
		app.writeJSONError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer r.Body.Close()

	fmt.Printf("📄 Raw webhook body: %s\n", string(body))

	// Verify the webhook signature
	if !app.verifyClerkWebhook(r, body) {
		fmt.Printf("❌ Webhook signature verification failed\n")
		app.writeJSONError(w, http.StatusUnauthorized, "Invalid webhook signature")
		return
	}

	fmt.Printf("✅ Webhook signature verified\n")

	// Parse the webhook event
	var event ClerkWebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		fmt.Printf("❌ Failed to parse JSON: %v\n", err)
		app.writeJSONError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	fmt.Printf("📦 Parsed event - Type: %s, Object: %s\n", event.Type, event.Object)

	// Handle different event types
	switch event.Type {
	case "user.created":
		fmt.Printf("👤 Processing user.created event\n")
		app.handleUserCreated(w, r, event.Data)
	case "user.updated":
		fmt.Printf("👤 Processing user.updated event\n")
		app.handleUserUpdated(w, r, event.Data)
	case "user.deleted":
		fmt.Printf("👤 Processing user.deleted event\n")
		app.handleUserDeleted(w, r, event.Data)
	case "session.created":
		fmt.Printf("🔐 Processing session.created event\n")
		app.handleSessionCreated(w, r, event.Data)
	default:
		fmt.Printf("⚠️ Unhandled event type: %s\n", event.Type)
		// Return 200 for unhandled events to acknowledge receipt
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": fmt.Sprintf("Event type %s received but not handled", event.Type),
		})
	}
}

// verifyClerkWebhook verifies that the webhook request is from Clerk
func (app *Application) verifyClerkWebhook(r *http.Request, body []byte) bool {
	// Get the webhook secret from environment variables
	webhookSecret := app.Config.ClerkWebhookSecret
	fmt.Printf("🔐 Webhook secret configured: %v\n", webhookSecret != "")
	
	if webhookSecret == "" {
		// In development, you might want to skip verification
		if app.Config.Env == "development" {
			fmt.Printf("⚠️ Skipping webhook verification in development mode\n")
			return true
		}
		fmt.Printf("❌ No webhook secret configured for production\n")
		return false
	}

	// Get the signature from headers
	signature := r.Header.Get("svix-signature")
	if signature == "" {
		fmt.Printf("❌ No svix-signature header found\n")
		return false
	}

	fmt.Printf("🔑 Signature header: %s\n", signature)

	// Parse the signature header - Clerk format: "v1,signature_value"
	signatures := make(map[string]string)
	
	// Clerk sends signature in format: "v1,actual_signature_value"
	if strings.Contains(signature, ",") {
		parts := strings.SplitN(signature, ",", 2)
		if len(parts) == 2 {
			version := strings.TrimSpace(parts[0])
			signatureValue := strings.TrimSpace(parts[1])
			signatures[version] = signatureValue
			fmt.Printf("🔧 Parsed signature - Version: %s, Value: %s\n", version, signatureValue[:10]+"...")
		}
	} else {
		// Fallback for other formats
		for _, sig := range strings.Split(signature, " ") {
			if strings.Contains(sig, "=") {
				parts := strings.SplitN(sig, "=", 2)
				if len(parts) == 2 {
					signatures[parts[0]] = parts[1]
				}
			}
		}
	}

	// Get the timestamp
	timestamp := r.Header.Get("svix-timestamp")
	if timestamp == "" {
		fmt.Printf("❌ No svix-timestamp header found\n")
		return false
	}

	fmt.Printf("⏰ Timestamp: %s\n", timestamp)

	// Verify the timestamp is recent (within 5 minutes)
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		fmt.Printf("❌ Invalid timestamp format: %v\n", err)
		return false
	}
	if time.Now().Unix()-ts > 300 {
		fmt.Printf("❌ Timestamp too old: %d seconds ago\n", time.Now().Unix()-ts)
		return false
	}

	// Create the expected signature using Clerk's algorithm
	id := r.Header.Get("svix-id")
	payload := fmt.Sprintf("%s.%s.%s", id, timestamp, string(body))
	
	// Decode the webhook secret from base64 (Clerk secrets are base64 encoded)
	secretBytes := []byte(webhookSecret)
	if strings.HasPrefix(webhookSecret, "whsec_") {
		// Remove the whsec_ prefix and decode from base64
		secretWithoutPrefix := strings.TrimPrefix(webhookSecret, "whsec_")
		decoded, err := base64.StdEncoding.DecodeString(secretWithoutPrefix)
		if err == nil {
			secretBytes = decoded
		}
	}
	
	mac := hmac.New(sha256.New, secretBytes)
	mac.Write([]byte(payload))
	expectedSignature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	// Compare with provided signature
	providedSignature, exists := signatures["v1"]
	if !exists {
		fmt.Printf("❌ No v1 signature found in header\n")
		return false
	}

	isValid := hmac.Equal([]byte(expectedSignature), []byte(providedSignature))
	fmt.Printf("🔍 Expected signature: %s\n", expectedSignature[:10]+"...")
	fmt.Printf("🔍 Provided signature: %s\n", providedSignature[:10]+"...")
	fmt.Printf("🔍 Signature verification result: %v\n", isValid)
	
	return isValid
}

// handleUserCreated processes user.created webhook events
func (app *Application) handleUserCreated(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	fmt.Printf("🔄 Starting handleUserCreated\n")
	fmt.Printf("📄 User data JSON: %s\n", string(data))

	var user ClerkUser
	if err := json.Unmarshal(data, &user); err != nil {
		fmt.Printf("❌ Failed to unmarshal user data: %v\n", err)
		app.writeJSONError(w, http.StatusBadRequest, "Invalid user data")
		return
	}

	fmt.Printf("👤 Parsed user: ID=%s, FirstName=%v, LastName=%v, ImageURL=%s\n", 
		user.ID, user.FirstName, user.LastName, user.ImageURL)
	fmt.Printf("📧 Email addresses: %+v\n", user.EmailAddresses)

	// Get primary email address
	primaryEmail := app.getPrimaryEmail(user.EmailAddresses)
	if primaryEmail == "" {
		fmt.Printf("❌ No primary email found for user %s\n", user.ID)
		app.writeJSONError(w, http.StatusBadRequest, "User has no email address")
		return
	}

	fmt.Printf("📧 Primary email: %s\n", primaryEmail)

	// Prepare user data for database
	emailVerified := app.isEmailVerified(user.EmailAddresses)
	fullName := app.getFullName(user.FirstName, user.LastName)
	
	fmt.Printf("✅ Email verified: %v\n", emailVerified)
	fmt.Printf("👤 Full name: %v\n", fullName)

	params := store.UpsertUserByClerkIDParams{
		ClerkID:       user.ID,
		Email:         primaryEmail,
		FirstName:     stringToNullString(user.FirstName),
		LastName:      stringToNullString(user.LastName),
		Name:          stringToNullString(fullName),
		ImageUrl:      stringValueToNullString(user.ImageURL),
		EmailVerified: boolToNullBool(&emailVerified),
		LastSignInAt:  timeToNullTime(app.convertTimestamp(user.LastSignInAt)),
	}

	fmt.Printf("🔧 Database params prepared: ClerkID=%s, Email=%s\n", params.ClerkID, params.Email)

	// Save user to database
	fmt.Printf("💾 Attempting to save user to database...\n")
	queries := store.New(app.DB)
	dbUser, err := queries.UpsertUserByClerkID(r.Context(), params)
	if err != nil {
		fmt.Printf("❌ Database error: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to save user: %v", err))
		return
	}

	fmt.Printf("✅ User saved successfully! Database ID: %s\n", dbUser.ID)

	// Return success response
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"message": "User created successfully",
		"user_id": dbUser.ID,
		"clerk_id": dbUser.ClerkID,
	}
	
	fmt.Printf("📤 Sending response: %+v\n", response)
	json.NewEncoder(w).Encode(response)
}

// handleUserUpdated processes user.updated webhook events
func (app *Application) handleUserUpdated(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	var user ClerkUser
	if err := json.Unmarshal(data, &user); err != nil {
		app.writeJSONError(w, http.StatusBadRequest, "Invalid user data")
		return
	}

	// Get primary email address
	primaryEmail := app.getPrimaryEmail(user.EmailAddresses)
	if primaryEmail == "" {
		app.writeJSONError(w, http.StatusBadRequest, "User has no email address")
		return
	}

	// Update user in database
	emailVerified := app.isEmailVerified(user.EmailAddresses)
	params := store.UpdateUserParams{
		ClerkID:       user.ID,
		Email:         primaryEmail,
		FirstName:     stringToNullString(user.FirstName),
		LastName:      stringToNullString(user.LastName),
		Name:          stringToNullString(app.getFullName(user.FirstName, user.LastName)),
		ImageUrl:      stringValueToNullString(user.ImageURL),
		EmailVerified: boolToNullBool(&emailVerified),
		LastSignInAt:  timeToNullTime(app.convertTimestamp(user.LastSignInAt)),
	}

	queries := store.New(app.DB)
	_, err := queries.UpdateUser(r.Context(), params)
	if err != nil {
		app.writeJSONError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	// Handle ban/unban
	if user.Banned {
		queries.BanUser(r.Context(), user.ID)
	} else {
		queries.UnbanUser(r.Context(), user.ID)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User updated successfully",
	})
}

// handleUserDeleted processes user.deleted webhook events
func (app *Application) handleUserDeleted(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	var user ClerkUser
	if err := json.Unmarshal(data, &user); err != nil {
		app.writeJSONError(w, http.StatusBadRequest, "Invalid user data")
		return
	}

	// Delete user from database
	queries := store.New(app.DB)
	err := queries.DeleteUserByClerkID(r.Context(), user.ID)
	if err != nil {
		app.writeJSONError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User deleted successfully",
	})
}

// handleSessionCreated processes session.created webhook events
func (app *Application) handleSessionCreated(w http.ResponseWriter, r *http.Request, data json.RawMessage) {
	// Parse session data if needed
	var sessionData map[string]interface{}
	if err := json.Unmarshal(data, &sessionData); err != nil {
		app.writeJSONError(w, http.StatusBadRequest, "Invalid session data")
		return
	}

	// Extract user_id from session data
	userID, ok := sessionData["user_id"].(string)
	if !ok {
		app.writeJSONError(w, http.StatusBadRequest, "Missing user_id in session data")
		return
	}

	// Update last sign in time
	queries := store.New(app.DB)
	now := time.Now()
	params := store.UpdateUserParams{
		ClerkID:      userID,
		Email:        "", // Required field, will be handled by COALESCE in SQL
		FirstName:    sql.NullString{Valid: false},
		LastName:     sql.NullString{Valid: false},
		Name:         sql.NullString{Valid: false},
		ImageUrl:     sql.NullString{Valid: false},
		EmailVerified: sql.NullBool{Valid: false},
		LastSignInAt: timeToNullTime(&now),
	}

	_, err := queries.UpdateUser(r.Context(), params)
	if err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to update last sign in time for user %s: %v\n", userID, err)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Session created successfully",
	})
}

// Helper functions

func (app *Application) getPrimaryEmail(emails []ClerkEmailAddress) string {
	for _, email := range emails {
		if email.EmailAddress != "" {
			return email.EmailAddress
		}
	}
	return ""
}

func (app *Application) isEmailVerified(emails []ClerkEmailAddress) bool {
	for _, email := range emails {
		if email.Verification.Status == "verified" {
			return true
		}
	}
	return false
}

func (app *Application) getFullName(firstName, lastName *string) *string {
	if firstName == nil && lastName == nil {
		return nil
	}
	
	var parts []string
	if firstName != nil && *firstName != "" {
		parts = append(parts, *firstName)
	}
	if lastName != nil && *lastName != "" {
		parts = append(parts, *lastName)
	}
	
	if len(parts) == 0 {
		return nil
	}
	
	fullName := strings.Join(parts, " ")
	return &fullName
}

func (app *Application) convertTimestamp(ts *int64) *time.Time {
	if ts == nil {
		return nil
	}
	t := time.Unix(*ts/1000, 0) // Clerk timestamps are in milliseconds
	return &t
}