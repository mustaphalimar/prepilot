package db

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	dbsqlc "github.com/mustaphalimar/prepilot/internal/store"
)

// New creates a new database connection
func New(dsn string, maxOpenConns, maxIdleConns int, maxIdleTime string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)

	duration, err := time.ParseDuration(maxIdleTime)
	if err != nil {
		return nil, fmt.Errorf("invalid maxIdleTime: %w", err)
	}
	db.SetConnMaxIdleTime(duration)

	// Verify connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping db: %w", err)
	}

	return db, nil
}

func NewQuerier(db *sql.DB) *dbsqlc.Queries {
	return dbsqlc.New(db)
}
