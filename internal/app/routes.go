package app

import (
	"github.com/go-chi/chi/v5"
)

// RegisterRoutes sets up all the routes for the application
func (app *Application) RegisterRoutes(r chi.Router) {
	// Public routes
	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		// Webhook routes (before auth to avoid middleware)
		r.Post("/webhooks/clerk", app.ClerkWebhookHandler)

		// Auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", app.RegisterHandler)
			// r.Post("/login", a.LoginHandler)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			// Add authentication middleware here when implemented
			// r.Use(a.AuthMiddleware)

			// Example future routes
			// r.Route("/flashcards", func(r chi.Router) {
			//     r.Post("/", a.CreateFlashcardHandler)
			//     r.Get("/", a.ListFlashcardsHandler)
			// })
		})
	})
}
