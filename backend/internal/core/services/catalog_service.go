package services

import (
	"context"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/core/ports"
)

type CatalogService struct {
	catalog ports.CatalogRepository
}

func NewCatalogService(catalog ports.CatalogRepository) CatalogService {
	return CatalogService{catalog: catalog}
}

func (s CatalogService) ListRooms(ctx context.Context) ([]domain.Room, error) {
	return s.catalog.ListRooms(ctx)
}

func (s CatalogService) ListSeats(ctx context.Context, roomID string) ([]domain.Seat, error) {
	return s.catalog.ListSeats(ctx, roomID)
}
