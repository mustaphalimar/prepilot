package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/mustaphalimar/prepilot/internal/app"
	"github.com/mustaphalimar/prepilot/internal/env"
)

// serve sets up the router and starts the HTTP server.
func serve(app *app.Application) error {
	r := chi.NewRouter()

	// middlewares
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{env.GetString("CLIENT_ORIGIN", "http://localhost:3000")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Middlewares
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Timeout(60 * time.Second))

	// Register all routes
	app.RegisterRoutes(r)

	srv := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      r,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  10 * time.Second,
		IdleTimeout:  time.Minute,
	}

	log.Printf("Server started on %s", app.Config.Addr)
	app.Logger.Infow("Server has started", "addr", app.Config.Addr, "env", app.Config.Env)
	return srv.ListenAndServe()
}
