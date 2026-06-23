package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/core/ports"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReservationRepository struct {
	db *pgxpool.Pool
}

func NewReservationRepository(db *pgxpool.Pool) ReservationRepository {
	return ReservationRepository{db: db}
}

func (r ReservationRepository) Create(ctx context.Context, reservation domain.Reservation) (domain.Reservation, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return domain.Reservation{}, err
	}
	defer tx.Rollback(ctx)

	var exists bool
	err = tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM reservations
			WHERE seat_id = $1
				AND reservation_date = $2
				AND status = 'confirmed'
				AND start_time < $4::time
				AND end_time > $3::time
			FOR UPDATE
		)
	`, reservation.SeatID, reservation.Date, reservation.StartTime, reservation.EndTime).Scan(&exists)
	if err != nil {
		return domain.Reservation{}, err
	}
	if exists {
		return domain.Reservation{}, domain.ErrReservationOverlap
	}

	query := `
		INSERT INTO reservations (id, user_id, room_id, seat_id, reservation_date, start_time, end_time, note, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, user_id, room_id, seat_id, reservation_date, to_char(start_time, 'HH24:MI'), to_char(end_time, 'HH24:MI'), note, status, created_at
	`
	row := tx.QueryRow(ctx, query, reservation.ID, reservation.UserID, reservation.RoomID, reservation.SeatID, reservation.Date, reservation.StartTime, reservation.EndTime, reservation.Note, reservation.Status)
	created, err := scanReservation(row)
	if err != nil {
		if isConstraintViolation(err, "reservations_no_overlap") {
			return domain.Reservation{}, domain.ErrReservationOverlap
		}
		return domain.Reservation{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Reservation{}, err
	}
	return created, nil
}

func isConstraintViolation(err error, constraintName string) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.ConstraintName == constraintName
}

func (r ReservationRepository) List(ctx context.Context, filter ports.ReservationFilter) ([]domain.Reservation, error) {
	args := []any{}
	where := []string{"rv.status = 'confirmed'"}

	if filter.UserID != "" {
		args = append(args, filter.UserID)
		where = append(where, fmt.Sprintf("rv.user_id = $%d", len(args)))
	}
	if filter.RoomID != "" {
		args = append(args, filter.RoomID)
		where = append(where, fmt.Sprintf("rv.room_id = $%d", len(args)))
	}
	if filter.SeatID != "" {
		args = append(args, filter.SeatID)
		where = append(where, fmt.Sprintf("rv.seat_id = $%d", len(args)))
	}
	if filter.Date != nil {
		args = append(args, *filter.Date)
		where = append(where, fmt.Sprintf("rv.reservation_date = $%d", len(args)))
	}
	if filter.Month != "" {
		args = append(args, filter.Month)
		where = append(where, fmt.Sprintf("to_char(rv.reservation_date, 'YYYY-MM') = $%d", len(args)))
	}

	query := `
		SELECT
			rv.id, rv.user_id, rv.room_id, rv.seat_id, rv.reservation_date,
			to_char(rv.start_time, 'HH24:MI'), to_char(rv.end_time, 'HH24:MI'), rv.note, rv.status, rv.created_at,
			u.id, u.email, u.username, u.password_hash, u.first_name, u.last_name, u.student_id, u.department, u.role, u.created_at,
			rm.id, rm.code, rm.name, rm.description, rm.floor, rm.is_active,
			s.id, s.room_id, s.label, s.zone, s.position_x, s.position_y, s.is_active
		FROM reservations rv
		JOIN users u ON u.id = rv.user_id
		JOIN rooms rm ON rm.id = rv.room_id
		JOIN seats s ON s.id = rv.seat_id
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY rv.reservation_date, rv.start_time, s.label
	`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	reservations := []domain.Reservation{}
	for rows.Next() {
		reservation := domain.Reservation{}
		user := domain.User{}
		room := domain.Room{}
		seat := domain.Seat{}
		err := rows.Scan(
			&reservation.ID, &reservation.UserID, &reservation.RoomID, &reservation.SeatID, &reservation.Date,
			&reservation.StartTime, &reservation.EndTime, &reservation.Note, &reservation.Status, &reservation.CreatedAt,
			&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.FirstName, &user.LastName, &user.StudentID, &user.Department, &user.Role, &user.CreatedAt,
			&room.ID, &room.Code, &room.Name, &room.Description, &room.Floor, &room.IsActive,
			&seat.ID, &seat.RoomID, &seat.Label, &seat.Zone, &seat.Position.X, &seat.Position.Y, &seat.IsActive,
		)
		if err != nil {
			return nil, err
		}
		reservation.User = &user
		reservation.Room = &room
		reservation.Seat = &seat
		reservations = append(reservations, reservation)
	}
	return reservations, rows.Err()
}

func (r ReservationRepository) Cancel(ctx context.Context, reservationID string, actorID string, actorRole domain.Role) error {
	query := `
		UPDATE reservations
		SET status = 'cancelled', cancelled_at = now()
		WHERE id = $1
			AND status = 'confirmed'
			AND ($3 = 'admin' OR user_id = $2)
	`
	tag, err := r.db.Exec(ctx, query, reservationID, actorID, actorRole)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func scanReservation(row rowScanner) (domain.Reservation, error) {
	reservation := domain.Reservation{}
	err := row.Scan(
		&reservation.ID,
		&reservation.UserID,
		&reservation.RoomID,
		&reservation.SeatID,
		&reservation.Date,
		&reservation.StartTime,
		&reservation.EndTime,
		&reservation.Note,
		&reservation.Status,
		&reservation.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Reservation{}, domain.ErrNotFound
	}
	return reservation, err
}
