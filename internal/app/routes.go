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

		// Debug routes for checking user sync
		r.Get("/debug/users", app.DebugListUsersHandler)
		r.Get("/debug/user/{clerkId}", app.DebugGetUserHandler)
		r.Get("/debug/db", app.DebugDatabaseConnectionHandler)
		r.Get("/debug/webhook-config", app.DebugClerkWebhookConfigHandler)
		r.Post("/debug/webhook-test", app.DebugWebhookTestHandler)

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
