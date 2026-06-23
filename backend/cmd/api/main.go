package main

// @title Booking System API
// @version 1.0
// @description This is the backend API for the Booking System Application.
// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	httpHandlers "booking-system-app/backend/internal/adapters/http/handlers"
	"booking-system-app/backend/internal/adapters/http/router"
	"booking-system-app/backend/internal/adapters/postgres"
	"booking-system-app/backend/internal/config"
	"booking-system-app/backend/internal/core/services"
	"booking-system-app/backend/internal/platform/security"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx := context.Background()
	db, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	tokenService := security.NewTokenService(cfg.JWTSecret, cfg.TokenTTL)
	userRepo := postgres.NewUserRepository(db)
	catalogRepo := postgres.NewCatalogRepository(db)
	reservationRepo := postgres.NewReservationRepository(db)
	adminRepo := postgres.NewAdminRepository(db)

	authService := services.NewAuthService(userRepo, tokenService)
	catalogService := services.NewCatalogService(catalogRepo)
	reservationService := services.NewReservationService(reservationRepo)
	adminService := services.NewAdminService(adminRepo)

	corsMiddleware := cors.New(cors.Config{
		AllowOrigins:     cfg.CORSOrigins,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	engine := router.New(router.Handlers{
		Auth:         httpHandlers.NewAuthHandler(authService),
		Catalog:      httpHandlers.NewCatalogHandler(catalogService),
		Reservations: httpHandlers.NewReservationHandler(reservationService),
		Admin:        httpHandlers.NewAdminHandler(adminService),
	}, tokenService, corsMiddleware)

	if err := engine.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
