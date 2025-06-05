package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/mustaphalimar/prepilot/internal/app"
)

// serve sets up the router and starts the HTTP server.
func serve(app *app.Application) error {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
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
	return srv.ListenAndServe()
}
