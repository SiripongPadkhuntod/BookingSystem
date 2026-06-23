package postgres

import (
	"context"

	"booking-system-app/backend/internal/core/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CatalogRepository struct {
	db *pgxpool.Pool
}

func NewCatalogRepository(db *pgxpool.Pool) CatalogRepository {
	return CatalogRepository{db: db}
}

func (r CatalogRepository) ListRooms(ctx context.Context) ([]domain.Room, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, code, name, description, floor, is_active
		FROM rooms
		WHERE is_active = true
		ORDER BY code
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []domain.Room{}
	for rows.Next() {
		room := domain.Room{}
		if err := rows.Scan(&room.ID, &room.Code, &room.Name, &room.Description, &room.Floor, &room.IsActive); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	return rooms, rows.Err()
}

func (r CatalogRepository) ListSeats(ctx context.Context, roomID string) ([]domain.Seat, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, room_id, label, zone, position_x, position_y, is_active
		FROM seats
		WHERE room_id = $1 AND is_active = true
		ORDER BY zone, label
	`, roomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	seats := []domain.Seat{}
	for rows.Next() {
		seat := domain.Seat{}
		if err := rows.Scan(&seat.ID, &seat.RoomID, &seat.Label, &seat.Zone, &seat.Position.X, &seat.Position.Y, &seat.IsActive); err != nil {
			return nil, err
		}
		seats = append(seats, seat)
	}
	return seats, rows.Err()
}
