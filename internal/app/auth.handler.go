// internal/app/handlers_auth.go
package app

import (
	"context"
	"errors"
	"net/http"

	"github.com/mustaphalimar/prepilot/internal/store"
	"golang.org/x/crypto/bcrypt"
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

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	user, err := app.Queries.CreateUser(context.Background(), store.CreateUserParams{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	})

	if err != nil {
		switch {
		case errors.Is(err, store.ErrEmailAlreadyInUse):
			app.conflictError(w, r, err)
			return
		default:
			app.internalServerError(w, r, err)
			return
		}
	}

	app.jsonResponse(w, http.StatusCreated, user)
}
