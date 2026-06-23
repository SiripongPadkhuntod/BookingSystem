package postgres

import (
	"context"
	"errors"

	"booking-system-app/backend/internal/core/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminRepository struct {
	db *pgxpool.Pool
}

func NewAdminRepository(db *pgxpool.Pool) AdminRepository {
	return AdminRepository{db: db}
}

func (r AdminRepository) ListRooms(ctx context.Context) ([]domain.Room, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, code, name, description, floor, svg_map, is_active
		FROM rooms
		ORDER BY code
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []domain.Room{}
	for rows.Next() {
		room := domain.Room{}
		if err := rows.Scan(&room.ID, &room.Code, &room.Name, &room.Description, &room.Floor, &room.SvgMap, &room.IsActive); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	return rooms, rows.Err()
}

func (r AdminRepository) CreateRoom(ctx context.Context, room domain.Room) (domain.Room, error) {
	query := `
		INSERT INTO rooms (id, code, name, description, floor, svg_map, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, code, name, description, floor, svg_map, is_active
	`
	return scanRoom(r.db.QueryRow(ctx, query, room.ID, room.Code, room.Name, room.Description, room.Floor, room.SvgMap, room.IsActive))
}

func (r AdminRepository) UpdateRoom(ctx context.Context, room domain.Room) (domain.Room, error) {
	query := `
		UPDATE rooms
		SET code = $2, name = $3, description = $4, floor = $5, svg_map = $6, is_active = $7
		WHERE id = $1
		RETURNING id, code, name, description, floor, svg_map, is_active
	`
	return scanRoom(r.db.QueryRow(ctx, query, room.ID, room.Code, room.Name, room.Description, room.Floor, room.SvgMap, room.IsActive))
}

func (r AdminRepository) ListSeats(ctx context.Context, roomID string) ([]domain.Seat, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, room_id, label, zone, position_x, position_y, is_active
		FROM seats
		WHERE room_id = $1
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

func (r AdminRepository) CreateSeat(ctx context.Context, seat domain.Seat) (domain.Seat, error) {
	query := `
		INSERT INTO seats (id, room_id, label, zone, position_x, position_y, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, room_id, label, zone, position_x, position_y, is_active
	`
	return scanSeat(r.db.QueryRow(ctx, query, seat.ID, seat.RoomID, seat.Label, seat.Zone, seat.Position.X, seat.Position.Y, seat.IsActive))
}

func (r AdminRepository) UpdateSeat(ctx context.Context, seat domain.Seat) (domain.Seat, error) {
	query := `
		UPDATE seats
		SET room_id = $2, label = $3, zone = $4, position_x = $5, position_y = $6, is_active = $7
		WHERE id = $1
		RETURNING id, room_id, label, zone, position_x, position_y, is_active
	`
	return scanSeat(r.db.QueryRow(ctx, query, seat.ID, seat.RoomID, seat.Label, seat.Zone, seat.Position.X, seat.Position.Y, seat.IsActive))
}

func (r AdminRepository) DeleteSeat(ctx context.Context, seatID string) error {
	query := `DELETE FROM seats WHERE id = $1`
	tag, err := r.db.Exec(ctx, query, seatID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r AdminRepository) ListUsers(ctx context.Context) ([]domain.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, email, username, password_hash, first_name, last_name, display_name, student_id, department, role, is_active, created_at
		FROM users
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []domain.User{}
	for rows.Next() {
		user, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r AdminRepository) UpdateUserRole(ctx context.Context, userID string, role domain.Role) (domain.User, error) {
	query := `
		UPDATE users
		SET role = $2
		WHERE id = $1
		RETURNING id, email, username, password_hash, first_name, last_name, display_name, student_id, department, role, is_active, created_at
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, userID, role))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrNotFound
	}
	return user, err
}

func (r AdminRepository) UpdateUserStatus(ctx context.Context, userID string, isActive bool) (domain.User, error) {
	query := `
		UPDATE users
		SET is_active = $2
		WHERE id = $1
		RETURNING id, email, username, password_hash, first_name, last_name, display_name, student_id, department, role, is_active, created_at
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, userID, isActive))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrNotFound
	}
	return user, err
}

func scanRoom(row rowScanner) (domain.Room, error) {
	room := domain.Room{}
	err := row.Scan(&room.ID, &room.Code, &room.Name, &room.Description, &room.Floor, &room.SvgMap, &room.IsActive)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Room{}, domain.ErrNotFound
	}
	return room, err
}

func scanSeat(row rowScanner) (domain.Seat, error) {
	seat := domain.Seat{}
	err := row.Scan(&seat.ID, &seat.RoomID, &seat.Label, &seat.Zone, &seat.Position.X, &seat.Position.Y, &seat.IsActive)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Seat{}, domain.ErrNotFound
	}
	return seat, err
}
