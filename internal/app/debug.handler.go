package app

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/mustaphalimar/prepilot/internal/store"
)

// DebugListUsersHandler returns all users in the database for debugging
func (app *Application) DebugListUsersHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("🔍 Debug: Listing all users in database\n")

	queries := store.New(app.DB)
	
	// Get all users from database
	query := `
		SELECT id, name, email, created_at, updated_at, clerk_id, 
		       first_name, last_name, image_url, email_verified, 
		       last_sign_in_at, banned 
		FROM users 
		ORDER BY created_at DESC 
		LIMIT 100
	`

	rows, err := app.DB.QueryContext(r.Context(), query)
	if err != nil {
		fmt.Printf("❌ Database query error: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Database error: %v", err))
		return
	}
	defer rows.Close()

	var users []store.User
	for rows.Next() {
		var user store.User
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.ClerkID,
			&user.FirstName,
			&user.LastName,
			&user.ImageUrl,
			&user.EmailVerified,
			&user.LastSignInAt,
			&user.Banned,
		)
		if err != nil {
			fmt.Printf("❌ Row scan error: %v\n", err)
			app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Row scan error: %v", err))
			return
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		fmt.Printf("❌ Rows iteration error: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Rows error: %v", err))
		return
	}

	fmt.Printf("📊 Found %d users in database\n", len(users))

	response := map[string]interface{}{
		"users":         users,
		"count":         len(users),
		"database_url":  app.Config.Env, // Don't expose actual URL
		"message":       fmt.Sprintf("Found %d users in database", len(users)),
	}

	app.jsonResponse(w, http.StatusOK, response)
}

// DebugGetUserHandler returns a specific user by Clerk ID for debugging
func (app *Application) DebugGetUserHandler(w http.ResponseWriter, r *http.Request) {
	clerkID := chi.URLParam(r, "clerkId")
	if clerkID == "" {
		app.writeJSONError(w, http.StatusBadRequest, "clerk_id parameter is required")
		return
	}

	fmt.Printf("🔍 Debug: Looking for user with Clerk ID: %s\n", clerkID)

	queries := store.New(app.DB)
	user, err := queries.GetUserByClerkID(r.Context(), clerkID)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("❌ User not found with Clerk ID: %s\n", clerkID)
			app.writeJSONError(w, http.StatusNotFound, fmt.Sprintf("User with clerk_id %s not found in database", clerkID))
			return
		}
		fmt.Printf("❌ Database error when fetching user %s: %v\n", clerkID, err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Database error: %v", err))
		return
	}

	fmt.Printf("✅ Found user: ID=%s, Email=%s, ClerkID=%s\n", user.ID, user.Email, user.ClerkID)

	response := map[string]interface{}{
		"user":    user,
		"message": fmt.Sprintf("User found with clerk_id %s", clerkID),
	}

	app.jsonResponse(w, http.StatusOK, response)
}

// DebugWebhookTestHandler allows manual testing of webhook functionality
func (app *Application) DebugWebhookTestHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow in development
	if app.Config.Env != "development" {
		app.writeJSONError(w, http.StatusForbidden, "This endpoint is only available in development")
		return
	}

	fmt.Printf("🧪 Debug: Manual webhook test triggered\n")

	// Sample user data for testing
	testUserData := `{
		"id": "user_test123",
		"email_addresses": [
			{
				"id": "email_123",
				"email_address": "test@example.com",
				"verification": {
					"status": "verified"
				}
			}
		],
		"first_name": "Test",
		"last_name": "User",
		"image_url": "https://example.com/avatar.jpg",
		"banned": false,
		"created_at": 1609459200000,
		"updated_at": 1609459200000,
		"last_sign_in_at": 1609459200000
	}`

	// Create a test webhook event
	testEvent := map[string]interface{}{
		"type":   "user.created",
		"object": "event",
		"data":   testUserData,
	}

	// Process the test event
	app.handleUserCreated(w, r, []byte(testUserData))
}

// DebugDatabaseConnectionHandler checks database connectivity
func (app *Application) DebugDatabaseConnectionHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("🔍 Debug: Testing database connection\n")

	// Test basic connectivity
	if err := app.DB.PingContext(r.Context()); err != nil {
		fmt.Printf("❌ Database ping failed: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Database ping failed: %v", err))
		return
	}

	// Test schema_migrations table
	var migrationCount int
	err := app.DB.QueryRowContext(r.Context(), "SELECT COUNT(*) FROM schema_migrations").Scan(&migrationCount)
	if err != nil {
		fmt.Printf("❌ Failed to query schema_migrations: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Schema migrations check failed: %v", err))
		return
	}

	// Test users table
	var userCount int
	err = app.DB.QueryRowContext(r.Context(), "SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		fmt.Printf("❌ Failed to query users table: %v\n", err)
		app.writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Users table check failed: %v", err))
		return
	}

	// Get current migration version
	var currentVersion int
	err = app.DB.QueryRowContext(r.Context(), "SELECT COALESCE(MAX(version), 0) FROM schema_migrations").Scan(&currentVersion)
	if err != nil {
		fmt.Printf("❌ Failed to get migration version: %v\n", err)
		currentVersion = -1
	}

	fmt.Printf("✅ Database connection test successful\n")
	fmt.Printf("📊 Migration count: %d, User count: %d, Current version: %d\n", migrationCount, userCount, currentVersion)

	response := map[string]interface{}{
		"database_connected":    true,
		"migrations_applied":    migrationCount,
		"users_count":          userCount,
		"current_migration":    currentVersion,
		"message":              "Database connection and schema check successful",
	}

	app.jsonResponse(w, http.StatusOK, response)
}

// DebugClerkWebhookConfigHandler shows webhook configuration status
func (app *Application) DebugClerkWebhookConfigHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("🔍 Debug: Checking Clerk webhook configuration\n")

	response := map[string]interface{}{
		"webhook_secret_configured": app.Config.ClerkWebhookSecret != "",
		"environment":              app.Config.Env,
		"webhook_endpoint":         "/v1/webhooks/clerk",
		"verification_enabled":     app.Config.ClerkWebhookSecret != "" || app.Config.Env == "development",
		"message":                  "Webhook configuration status",
	}

	if app.Config.ClerkWebhookSecret == "" {
		response["warning"] = "No webhook secret configured - using development mode verification"
	}

	fmt.Printf("🔧 Webhook config: Secret=%v, Env=%s\n", app.Config.ClerkWebhookSecret != "", app.Config.Env)

	app.jsonResponse(w, http.StatusOK, response)
}