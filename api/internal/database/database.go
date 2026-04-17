package database

import (
	"log"

	"github.com/rootbeer/homex/api/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Open(cfg config.Config) (*gorm.DB, error) {
	if cfg.DatabaseURL == "" {
		log.Println("DATABASE_URL is empty, booting in fixture-only mode")
		return nil, nil
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := runMigrations(db, cfg.MigrationsPath); err != nil {
		return nil, err
	}

	if err := Seed(db); err != nil {
		log.Printf("warning: seed failed: %v", err)
	}

	return db, nil
}
