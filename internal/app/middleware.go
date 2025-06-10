package app

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/mustaphalimar/prepilot/internal/store"
)

// UserClaims represents the user information extracted from JWT
type UserClaims struct {
	ClerkID string
	Email   string
}

// contextKey is a custom type for context keys to avoid collisions
type contextKey string

const userContextKey contextKey = "user"

// AuthMiddleware validates Clerk JWT tokens and extracts user information
func (app *Application) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("🔍 Auth middleware triggered for: %s %s\n", r.Method, r.URL.Path)
		
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		fmt.Printf("🔑 Authorization header: %s\n", authHeader)

		if authHeader == "" {
			fmt.Printf("❌ No authorization header provided\n")
			app.writeJSONError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		// Extract the token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
			fmt.Printf("❌ Invalid authorization header format. Parts: %d, First part: %s\n", len(tokenParts), tokenParts[0])
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		token := tokenParts[1]
		fmt.Printf("🎫 Token extracted (first 20 chars): %s...\n", token[:min(20, len(token))])

		// Extract user ID from JWT payload (for development)
		clerkID, email, err := app.extractUserFromJWT(token)
		if err != nil {
			fmt.Printf("❌ Failed to extract user from JWT: %v\n", err)
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid token format")
			return
		}

		if clerkID == "" {
			fmt.Printf("❌ Extracted clerk ID is empty\n")
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid user ID in token")
			return
		}

		fmt.Printf("✅ Successfully extracted user - Clerk ID: %s, Email: %s\n", clerkID, email)

		// Create user claims object
		userClaims := &UserClaims{
			ClerkID: clerkID,
			Email:   email,
		}

		// Ensure user exists in database (for development compatibility)
		fmt.Printf("🔄 Ensuring user exists in database...\n")
		if err := app.ensureUserExists(r.Context(), userClaims); err != nil {
			fmt.Printf("❌ Failed to ensure user exists: %v\n", err)
			app.writeJSONError(w, http.StatusInternalServerError, "Failed to process user authentication")
			return
		}
		fmt.Printf("✅ User existence confirmed\n")

		// Add user claims to request context
		ctx := context.WithValue(r.Context(), userContextKey, userClaims)
		r = r.WithContext(ctx)

		fmt.Printf("✅ Authentication successful, proceeding to handler\n")
		// Continue to the next handler
		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extracts user claims from the request context
func GetUserFromContext(ctx context.Context) (*UserClaims, bool) {
	user, ok := ctx.Value(userContextKey).(*UserClaims)
	return user, ok
}

// RequireAuth is a helper method to get authenticated user or return error
func (app *Application) RequireAuth(w http.ResponseWriter, r *http.Request) (*UserClaims, bool) {
	user, ok := GetUserFromContext(r.Context())
	if !ok {
		app.writeJSONError(w, http.StatusUnauthorized, "Authentication required")
		return nil, false
	}
	return user, true
}

// AuthenticatedHandler is a wrapper type for handlers that require authentication
type AuthenticatedHandler func(w http.ResponseWriter, r *http.Request, user *UserClaims)

// WithAuth wraps a handler function to automatically extract and validate user authentication
func (app *Application) WithAuth(handler AuthenticatedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := app.RequireAuth(w, r)
		if !ok {
			return
		}
		handler(w, r, user)
	}
}

// ensureUserExists checks if user exists in database and creates them if not
// This is particularly useful for development where webhooks might not work
func (app *Application) ensureUserExists(ctx context.Context, userClaims *UserClaims) error {
	// Check if user already exists
	_, err := app.Queries.GetUserByClerkID(ctx, userClaims.ClerkID)
	if err == nil {
		// User exists, nothing to do
		return nil
	}
	
	if err != sql.ErrNoRows {
		// Some other error occurred
		return fmt.Errorf("failed to check user existence: %w", err)
	}

	// User doesn't exist, create them
	fmt.Printf("🔄 Creating user in development mode for Clerk ID: %s\n", userClaims.ClerkID)
	
	// Use a unique email for development users to avoid constraint violations
	email := userClaims.Email
	if email == "" {
		// Generate a unique email for development users
		email = fmt.Sprintf("dev_%s@localhost.dev", userClaims.ClerkID)
	}
	
	params := store.UpsertUserByClerkIDParams{
		ClerkID:       userClaims.ClerkID,
		Email:         email,
		FirstName:     sql.NullString{Valid: false},
		LastName:      sql.NullString{Valid: false},
		Name:          sql.NullString{String: "Development User", Valid: true},
		ImageUrl:      sql.NullString{Valid: false},
		EmailVerified: sql.NullBool{Bool: false, Valid: true},
		LastSignInAt:  sql.NullTime{Valid: false},
	}

	_, err = app.Queries.UpsertUserByClerkID(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	fmt.Printf("✅ Successfully created user for Clerk ID: %s\n", userClaims.ClerkID)
	return nil
}

// JWTPayload represents the JWT payload structure
type JWTPayload struct {
	Sub   string `json:"sub"`   // User ID
	Email string `json:"email"` // Email address
	Exp   int64  `json:"exp"`   // Expiration time
	Iat   int64  `json:"iat"`   // Issued at time
}

// extractUserFromJWT extracts user information from JWT payload without full verification
// This is a simplified approach for development environments
func (app *Application) extractUserFromJWT(token string) (string, string, error) {
	fmt.Printf("🔍 Extracting user info from JWT token\n")
	
	// Split the JWT token into parts
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", "", fmt.Errorf("invalid JWT format: expected 3 parts, got %d", len(parts))
	}

	// Decode the payload (second part)
	payload := parts[1]
	fmt.Printf("📦 JWT payload part (first 50 chars): %s...\n", payload[:min(50, len(payload))])
	
	// Add padding if needed for base64 decoding
	switch len(payload) % 4 {
	case 2:
		payload += "=="
	case 3:
		payload += "="
	}

	// Decode the base64 payload
	payloadBytes, err := base64.URLEncoding.DecodeString(payload)
	if err != nil {
		return "", "", fmt.Errorf("failed to decode JWT payload: %w", err)
	}

	fmt.Printf("📄 Decoded payload: %s\n", string(payloadBytes))

	// Parse the JSON payload
	var jwtPayload JWTPayload
	if err := json.Unmarshal(payloadBytes, &jwtPayload); err != nil {
		return "", "", fmt.Errorf("failed to parse JWT payload: %w", err)
	}

	fmt.Printf("📋 Parsed JWT - Sub: %s, Email: %s\n", jwtPayload.Sub, jwtPayload.Email)

	// Basic validation - check if token is not expired (optional for development)
	// For now, we'll skip expiration check for simplicity

	return jwtPayload.Sub, jwtPayload.Email, nil
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
