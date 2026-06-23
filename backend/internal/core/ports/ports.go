package ports

import (
	"context"
	"time"

	"booking-system-app/backend/internal/core/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user domain.User) (domain.User, error)
	FindByEmailOrUsername(ctx context.Context, identifier string) (domain.User, error)
	FindByID(ctx context.Context, id string) (domain.User, error)
}

type CatalogRepository interface {
	ListRooms(ctx context.Context) ([]domain.Room, error)
	ListSeats(ctx context.Context, roomID string) ([]domain.Seat, error)
}

type ReservationRepository interface {
	Create(ctx context.Context, reservation domain.Reservation) (domain.Reservation, error)
	List(ctx context.Context, filter ReservationFilter) ([]domain.Reservation, error)
	Cancel(ctx context.Context, reservationID string, actorID string, actorRole domain.Role) error
}

type ReservationFilter struct {
	UserID    string
	RoomID    string
	SeatID    string
	Date      *time.Time
	StartDate *time.Time
	EndDate   *time.Time
	Month     string
}
