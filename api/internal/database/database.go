package database

import (
	"log"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/domain"
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

	if err := db.AutoMigrate(
		&domain.Store{},
		&domain.StoreMembership{},
		&domain.TechnicianProfile{},
		&domain.TechnicianService{},
		&domain.ServiceArea{},
		&domain.Customer{},
		&domain.CustomerAddress{},
		&domain.Lead{},
		&domain.LeadUnit{},
		&domain.Quotation{},
		&domain.QuotationItem{},
		&domain.Job{},
		&domain.JobPhoto{},
		&domain.JobTimelineEvent{},
		&domain.Review{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
