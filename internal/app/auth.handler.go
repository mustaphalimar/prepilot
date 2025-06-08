// internal/app/handlers_auth.go
package app

import (
	"net/http"
)

type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

func (app *Application) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := app.readJSON(w, r, &req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// This handler is now deprecated as user creation is handled by Clerk webhooks
	// Return an error indicating that registration should be done through Clerk
	app.writeJSONError(w, http.StatusBadRequest, "User registration is handled through Clerk authentication")
}
