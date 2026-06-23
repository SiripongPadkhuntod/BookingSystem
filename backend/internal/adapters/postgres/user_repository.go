package postgres

import (
	"context"
	"errors"
	"strings"

	"booking-system-app/backend/internal/core/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return UserRepository{db: db}
}

func (r UserRepository) Create(ctx context.Context, user domain.User) (domain.User, error) {
	query := `
		INSERT INTO users (id, email, username, password_hash, first_name, last_name, student_id, department, role, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id, email, username, password_hash, first_name, last_name, student_id, department, role, is_active, created_at
	`
	row := r.db.QueryRow(ctx, query, user.ID, user.Email, user.Username, user.PasswordHash, user.FirstName, user.LastName, user.StudentID, user.Department, user.Role, true)
	return scanUser(row)
}

func (r UserRepository) FindByEmailOrUsername(ctx context.Context, identifier string) (domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, first_name, last_name, student_id, department, role, is_active, created_at
		FROM users
		WHERE lower(email) = lower($1) OR lower(username) = lower($1)
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, strings.TrimSpace(identifier)))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrNotFound
	}
	return user, err
}

func (r UserRepository) FindByID(ctx context.Context, id string) (domain.User, error) {
	query := `
		SELECT id, email, username, password_hash, first_name, last_name, student_id, department, role, is_active, created_at
		FROM users
		WHERE id = $1
	`
	user, err := scanUser(r.db.QueryRow(ctx, query, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrNotFound
	}
	return user, err
}

func (r UserRepository) Update(ctx context.Context, user domain.User) (domain.User, error) {
	query := `
		UPDATE users
		SET email = $2, username = $3, password_hash = $4, first_name = $5, last_name = $6, student_id = $7, department = $8, is_active = $9
		WHERE id = $1
		RETURNING id, email, username, password_hash, first_name, last_name, student_id, department, role, is_active, created_at
	`
	updated, err := scanUser(r.db.QueryRow(ctx, query, user.ID, user.Email, user.Username, user.PasswordHash, user.FirstName, user.LastName, user.StudentID, user.Department, user.IsActive))
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, domain.ErrNotFound
	}
	return updated, err
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanUser(row rowScanner) (domain.User, error) {
	user := domain.User{}
	err := row.Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.FirstName, &user.LastName, &user.StudentID, &user.Department, &user.Role, &user.IsActive, &user.CreatedAt)
	return user, err
}
