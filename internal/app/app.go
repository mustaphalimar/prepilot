package app

import (
	"database/sql"

	dbsqlc "github.com/mustaphalimar/prepilot/internal/store"
)

// Config holds application configuration
type Config struct {
	Addr              string
	Env               string
	ClerkWebhookSecret string
}

// Application holds dependencies for the application
type Application struct {
	Config  Config
	DB      *sql.DB
	Queries *dbsqlc.Queries
	Version string
}

// NewApplication creates a new Application instance
func NewApplication(config Config, db *sql.DB) *Application {
	return &Application{
		Config:  config,
		DB:      db,
		Queries: dbsqlc.New(db),
		Version: "0.0.1",
	}
}
