package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/mustaphalimar/prepilot/internal/db"
	_ "github.com/lib/pq"
)

func main() {
	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	sqlDB, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer sqlDB.Close()

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("🔗 Connected to database successfully")

	// Run migrations
	migrationRunner := db.NewMigrationRunner(sqlDB)
	if err := migrationRunner.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	fmt.Println("🎉 Migration process completed successfully!")
}