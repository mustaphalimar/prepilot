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
			// Add authentication middleware
			r.Use(app.AuthMiddleware)

			// User routes
			r.Route("/user", func(r chi.Router) {
				r.Post("/initialize", app.WithAuth(app.InitializeUserHandler))
				r.Get("/profile", app.WithAuth(app.GetUserProfileHandler))
			})

			// Study plans routes
			r.Route("/study-plans", func(r chi.Router) {
				r.Post("/", app.WithAuth(app.createStudyPlanHandler))
				r.Get("/", app.WithAuth(app.GetStudyPlansHandler))
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", app.WithAuth(app.GetStudyPlanHandler))
					r.Get("/tasks", app.WithAuth(app.GetStudyPlanTasksHandler))
				})
			})

			// Study tasks routes
			r.Route("/study-tasks", func(r chi.Router) {
				r.Post("/", app.WithAuth(app.CreateStudyTaskHandler))
				r.Get("/", app.WithAuth(app.GetStudyTasksHandler))
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", app.WithAuth(app.GetStudyTaskHandler))
					r.Put("/", app.WithAuth(app.UpdateStudyTaskHandler))
					r.Delete("/", app.WithAuth(app.DeleteStudyTaskHandler))
					r.Patch("/status", app.WithAuth(app.UpdateStudyTaskStatusHandler))
				})
			})
		})
	})
}
