package app

import (
	"net/http"
)

// InitializeUserHandler ensures user exists in database and returns profile
// This is called immediately after sign-in to trigger user creation
func (app *Application) InitializeUserHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	// At this point, the middleware has already ensured the user exists
	// Now fetch the complete user information from the database
	dbUser, err := app.Queries.GetUserByClerkID(r.Context(), user.ClerkID)
	if err != nil {
		app.internalServerResponse(w, r, err)
		return
	}

	// Create response with user information
	response := map[string]any{
		"id":             dbUser.ID,
		"clerk_id":       dbUser.ClerkID,
		"email":          dbUser.Email,
		"name":           dbUser.Name,
		"first_name":     dbUser.FirstName,
		"last_name":      dbUser.LastName,
		"image_url":      dbUser.ImageUrl,
		"email_verified": dbUser.EmailVerified,
		"last_sign_in":   dbUser.LastSignInAt,
		"created_at":     dbUser.CreatedAt,
		"updated_at":     dbUser.UpdatedAt,
		"message":        "User initialized successfully",
	}

	app.writeJSON(w, http.StatusOK, response)
}

// GetUserProfileHandler retrieves the current user's profile
func (app *Application) GetUserProfileHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	// Fetch the complete user information from the database
	dbUser, err := app.Queries.GetUserByClerkID(r.Context(), user.ClerkID)
	if err != nil {
		app.internalServerResponse(w, r, err)
		return
	}

	// Create response with user information
	response := map[string]interface{}{
		"id":             dbUser.ID,
		"clerk_id":       dbUser.ClerkID,
		"email":          dbUser.Email,
		"name":           dbUser.Name,
		"first_name":     dbUser.FirstName,
		"last_name":      dbUser.LastName,
		"image_url":      dbUser.ImageUrl,
		"email_verified": dbUser.EmailVerified,
		"last_sign_in":   dbUser.LastSignInAt,
		"created_at":     dbUser.CreatedAt,
		"updated_at":     dbUser.UpdatedAt,
	}

	app.writeJSON(w, http.StatusOK, response)
}
