package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gorm.io/gorm"
)

const migrationTable = "schema_migrations"

func runMigrations(db *gorm.DB, migrationsPath string) error {
	if migrationsPath == "" {
		return nil
	}

	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`).Error; err != nil {
		return fmt.Errorf("create migration table: %w", err)
	}

	entries, err := os.ReadDir(migrationsPath)
	if err != nil {
		return fmt.Errorf("read migrations dir %q: %w", migrationsPath, err)
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		files = append(files, entry.Name())
	}
	sort.Strings(files)

	var applied []string
	if err := db.Table(migrationTable).Pluck("version", &applied).Error; err != nil {
		return fmt.Errorf("load applied migrations: %w", err)
	}

	appliedSet := make(map[string]struct{}, len(applied))
	for _, version := range applied {
		appliedSet[version] = struct{}{}
	}

	for _, filename := range files {
		if _, ok := appliedSet[filename]; ok {
			continue
		}

		path := filepath.Join(migrationsPath, filename)
		sqlBytes, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %q: %w", filename, err)
		}

		sqlText := strings.TrimSpace(string(sqlBytes))
		if sqlText == "" {
			continue
		}

		if err := db.Transaction(func(tx *gorm.DB) error {
			for _, statement := range splitSQLStatements(sqlText) {
				if err := tx.Exec(statement).Error; err != nil {
					return fmt.Errorf("execute migration %q: %w", filename, err)
				}
			}

			if err := tx.Exec(
				"INSERT INTO schema_migrations (version) VALUES (?)",
				filename,
			).Error; err != nil {
				return fmt.Errorf("record migration %q: %w", filename, err)
			}

			return nil
		}); err != nil {
			return err
		}

		log.Printf("applied migration %s", filename)
	}

	return nil
}

// splitSQLStatements keeps the migration runner lightweight for the MVP.
// Our migrations are simple DDL files where `;` terminates each statement.
func splitSQLStatements(sqlText string) []string {
	parts := strings.Split(sqlText, ";")
	statements := make([]string, 0, len(parts))
	for _, part := range parts {
		statement := strings.TrimSpace(part)
		if statement == "" {
			continue
		}
		statements = append(statements, statement)
	}

	return statements
}
