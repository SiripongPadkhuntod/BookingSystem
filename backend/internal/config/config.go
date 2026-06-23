package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv      string
	Port        string
	DatabaseURL string
	JWTSecret   string
	TokenTTL    time.Duration
	CORSOrigins []string
}

func Load() (Config, error) {
	tokenHours, _ := strconv.Atoi(getenv("JWT_TTL_HOURS", "24"))
	cfg := Config{
		AppEnv:      getenv("APP_ENV", "development"),
		Port:        getenv("PORT", "8080"),
		DatabaseURL: getenv("DATABASE_URL", "postgres://booking:booking@localhost:5432/booking_system?sslmode=disable"),
		JWTSecret:   getenv("JWT_SECRET", "change-me-in-production-32-characters"),
		TokenTTL:    time.Duration(tokenHours) * time.Hour,
		CORSOrigins: splitCSV(getenv("CORS_ORIGINS", "http://localhost:3000")),
	}
	if len(cfg.JWTSecret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}
	return cfg, nil
}

func getenv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
