package db

import (
	"database/sql"
	"fmt"
	"io/fs"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/mustaphalimar/prepilot/internal/db/migrations"
)

// MigrationRunner handles database migrations
type MigrationRunner struct {
	db *sql.DB
}

// NewMigrationRunner creates a new migration runner
func NewMigrationRunner(db *sql.DB) *MigrationRunner {
	return &MigrationRunner{db: db}
}

// Migration represents a database migration
type Migration struct {
	Version     int
	Name        string
	UpScript    string
	DownScript  string
	AppliedAt   *time.Time
}

// RunMigrations executes all pending migrations
func (mr *MigrationRunner) RunMigrations() error {
	fmt.Println("🔄 Starting database migration process...")

	// Create migrations table if it doesn't exist
	if err := mr.createMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get available migrations
	availableMigrations, err := mr.getAvailableMigrations()
	if err != nil {
		return fmt.Errorf("failed to get available migrations: %w", err)
	}

	// Get applied migrations
	appliedMigrations, err := mr.getAppliedMigrations()
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Find pending migrations
	pendingMigrations := mr.findPendingMigrations(availableMigrations, appliedMigrations)

	if len(pendingMigrations) == 0 {
		fmt.Println("✅ No pending migrations found. Database is up to date.")
		return nil
	}

	fmt.Printf("📋 Found %d pending migrations\n", len(pendingMigrations))

	// Execute pending migrations
	for _, migration := range pendingMigrations {
		if err := mr.executeMigration(migration); err != nil {
			return fmt.Errorf("failed to execute migration %d_%s: %w", migration.Version, migration.Name, err)
		}
		fmt.Printf("✅ Applied migration %d_%s\n", migration.Version, migration.Name)
	}

	fmt.Println("🎉 All migrations completed successfully!")
	return nil
}

// createMigrationsTable creates the migrations tracking table
func (mr *MigrationRunner) createMigrationsTable() error {
	// First ensure the table exists
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TIMESTAMP NOT NULL DEFAULT NOW()
		);
	`
	_, err := mr.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}
	
	fmt.Println("✅ Schema migrations table ready")
	return nil
}

// getAvailableMigrations reads migration files from embedded filesystem
func (mr *MigrationRunner) getAvailableMigrations() ([]Migration, error) {
	var migrationList []Migration

	err := fs.WalkDir(migrations.FS, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() || !strings.HasSuffix(path, ".up.sql") {
			return nil
		}

		// Parse migration filename: 000001_initial_schema.up.sql
		filename := filepath.Base(path)
		parts := strings.SplitN(filename, "_", 2)
		if len(parts) < 2 {
			return fmt.Errorf("invalid migration filename format: %s", filename)
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			return fmt.Errorf("invalid migration version in filename %s: %w", filename, err)
		}

		name := strings.TrimSuffix(parts[1], ".up.sql")

		// Read up script
		upContent, err := fs.ReadFile(migrations.FS, path)
		if err != nil {
			return fmt.Errorf("failed to read up migration %s: %w", path, err)
		}

		// Try to read down script
		downPath := strings.Replace(path, ".up.sql", ".down.sql", 1)
		var downContent []byte
		if downFile, err := fs.ReadFile(migrations.FS, downPath); err == nil {
			downContent = downFile
		}

		migration := Migration{
			Version:    version,
			Name:       name,
			UpScript:   string(upContent),
			DownScript: string(downContent),
		}

		migrationList = append(migrationList, migration)
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort migrations by version
	sort.Slice(migrationList, func(i, j int) bool {
		return migrationList[i].Version < migrationList[j].Version
	})

	return migrationList, nil
}

// getAppliedMigrations gets list of already applied migrations
func (mr *MigrationRunner) getAppliedMigrations() (map[int]Migration, error) {
	// First check if schema_migrations table exists
	var tableExists bool
	err := mr.db.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'schema_migrations'
		)
	`).Scan(&tableExists)
	
	if err != nil {
		return nil, err
	}
	
	if !tableExists {
		// If table doesn't exist, return empty map (no migrations applied)
		return make(map[int]Migration), nil
	}

	query := `
		SELECT version, name, applied_at 
		FROM schema_migrations 
		ORDER BY version
	`

	rows, err := mr.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[int]Migration)
	for rows.Next() {
		var migration Migration
		err := rows.Scan(&migration.Version, &migration.Name, &migration.AppliedAt)
		if err != nil {
			return nil, err
		}
		applied[migration.Version] = migration
	}

	return applied, rows.Err()
}

// findPendingMigrations compares available vs applied migrations
func (mr *MigrationRunner) findPendingMigrations(available []Migration, applied map[int]Migration) []Migration {
	var pending []Migration

	for _, migration := range available {
		if _, exists := applied[migration.Version]; !exists {
			pending = append(pending, migration)
		}
	}

	return pending
}

// executeMigration runs a single migration
func (mr *MigrationRunner) executeMigration(migration Migration) error {
	// Start transaction
	tx, err := mr.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute the migration script
	if _, err := tx.Exec(migration.UpScript); err != nil {
		return fmt.Errorf("failed to execute migration script: %w", err)
	}

	// Record the migration as applied
	_, err = tx.Exec(`
		INSERT INTO schema_migrations (version, name, applied_at) 
		VALUES ($1, $2, NOW())
	`, migration.Version, migration.Name)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit migration transaction: %w", err)
	}

	return nil
}

// GetCurrentVersion returns the current migration version
func (mr *MigrationRunner) GetCurrentVersion() (int, error) {
	var version int
	err := mr.db.QueryRow(`
		SELECT COALESCE(MAX(version), 0) 
		FROM schema_migrations
	`).Scan(&version)
	
	if err != nil && err != sql.ErrNoRows {
		return 0, err
	}
	
	return version, nil
}

// RollbackMigration rolls back a specific migration (for development)
func (mr *MigrationRunner) RollbackMigration(targetVersion int) error {
	fmt.Printf("🔄 Rolling back to version %d...\n", targetVersion)

	// Get current version
	currentVersion, err := mr.GetCurrentVersion()
	if err != nil {
		return fmt.Errorf("failed to get current version: %w", err)
	}

	if currentVersion <= targetVersion {
		fmt.Println("✅ Already at or below target version")
		return nil
	}

	// Get available migrations
	availableMigrations, err := mr.getAvailableMigrations()
	if err != nil {
		return fmt.Errorf("failed to get available migrations: %w", err)
	}

	// Create map for quick lookup
	migrationMap := make(map[int]Migration)
	for _, m := range availableMigrations {
		migrationMap[m.Version] = m
	}

	// Rollback migrations in reverse order
	for version := currentVersion; version > targetVersion; version-- {
		migration, exists := migrationMap[version]
		if !exists {
			return fmt.Errorf("migration version %d not found", version)
		}

		if migration.DownScript == "" {
			return fmt.Errorf("no down script for migration %d", version)
		}

		if err := mr.executeRollback(migration); err != nil {
			return fmt.Errorf("failed to rollback migration %d: %w", version, err)
		}

		fmt.Printf("✅ Rolled back migration %d_%s\n", migration.Version, migration.Name)
	}

	fmt.Println("🎉 Rollback completed successfully!")
	return nil
}

// executeRollback executes a migration rollback
func (mr *MigrationRunner) executeRollback(migration Migration) error {
	// Start transaction
	tx, err := mr.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute the rollback script
	if _, err := tx.Exec(migration.DownScript); err != nil {
		return fmt.Errorf("failed to execute rollback script: %w", err)
	}

	// Remove the migration record
	_, err = tx.Exec(`
		DELETE FROM schema_migrations 
		WHERE version = $1
	`, migration.Version)
	if err != nil {
		return fmt.Errorf("failed to remove migration record: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback transaction: %w", err)
	}

	return nil
}