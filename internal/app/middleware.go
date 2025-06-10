package app

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
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
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			app.writeJSONError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		// Extract the token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "Bearer" {
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		token := tokenParts[1]

		// Verify the JWT token with Clerk
		claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{
			Token: token,
		})
		if err != nil {
			fmt.Printf("❌ JWT verification failed: %v\n", err)
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Extract user information from claims
		clerkID := claims.Subject
		if clerkID == "" {
			app.writeJSONError(w, http.StatusUnauthorized, "Invalid token claims")
			return
		}

		// Get email from claims - for now we'll leave it empty as we need to check the actual field names
		var email string
		// TODO: Extract email from claims when the correct field is identified

		// Create user claims object
		userClaims := &UserClaims{
			ClerkID: clerkID,
			Email:   email,
		}

		// Ensure user exists in database (for development compatibility)
		if err := app.ensureUserExists(r.Context(), userClaims); err != nil {
			fmt.Printf("❌ Failed to ensure user exists: %v\n", err)
			app.writeJSONError(w, http.StatusInternalServerError, "Failed to process user authentication")
			return
		}

		// Add user claims to request context
		ctx := context.WithValue(r.Context(), userContextKey, userClaims)
		r = r.WithContext(ctx)

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
	
	params := store.UpsertUserByClerkIDParams{
		ClerkID:       userClaims.ClerkID,
		Email:         userClaims.Email,
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
