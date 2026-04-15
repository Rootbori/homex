package main

import (
	"log"
	"net/http"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/database"
	"github.com/rootbeer/homex/api/internal/httpapi"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}

	server := httpapi.NewServer(cfg, db)

	log.Printf("homex api listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, server.Router()); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
