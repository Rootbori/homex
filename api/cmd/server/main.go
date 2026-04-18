package main

import (
	"log"
	"net/http"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/database"
	deliveryHTTP "github.com/rootbeer/homex/api/internal/delivery/http"
	"github.com/rootbeer/homex/api/internal/repository"
	"github.com/rootbeer/homex/api/internal/usecase"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}

	// 1. Repositories
	userRepo := repository.NewUserRepository(db)
	storeRepo := repository.NewStoreRepository(db)
	jobRepo := repository.NewJobRepository(db)
	geoRepo := repository.NewGeoRepository(db)

	// 2. Usecases
	authUC := usecase.NewAuthUsecase(userRepo, storeRepo)
	userUC := usecase.NewUserUsecase(userRepo)
	jobUC := usecase.NewJobUsecase(jobRepo)
	storeUC := usecase.NewStoreUsecase(storeRepo, userRepo)
	geoUC := usecase.NewGeoUsecase(geoRepo)

	// 3. HTTP Handler
	handler := deliveryHTTP.NewHandler(cfg, authUC, userUC, jobUC, storeUC, geoUC)

	log.Printf("homex api listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, handler.Routes()); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
