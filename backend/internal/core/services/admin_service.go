package services

import (
	"context"
	"strings"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/core/ports"
	"github.com/google/uuid"
)

type AdminService struct {
	admin ports.AdminRepository
}

type UpsertRoomInput struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Floor       string `json:"floor"`
	IsActive    bool   `json:"isActive"`
}

type UpsertSeatInput struct {
	RoomID   string `json:"roomId"`
	Label    string `json:"label"`
	Zone     string `json:"zone"`
	X        int    `json:"x"`
	Y        int    `json:"y"`
	IsActive bool   `json:"isActive"`
}

type UpdateRoleInput struct {
	Role domain.Role `json:"role"`
}

type UpdateStatusInput struct {
	IsActive bool `json:"isActive"`
}

func NewAdminService(admin ports.AdminRepository) AdminService {
	return AdminService{admin: admin}
}

func (s AdminService) ListRooms(ctx context.Context) ([]domain.Room, error) {
	return s.admin.ListRooms(ctx)
}

func (s AdminService) CreateRoom(ctx context.Context, input UpsertRoomInput) (domain.Room, error) {
	room := domain.Room{
		ID:          "room-" + uuid.NewString(),
		Code:        strings.ToUpper(strings.TrimSpace(input.Code)),
		Name:        strings.TrimSpace(input.Name),
		Description: strings.TrimSpace(input.Description),
		Floor:       strings.TrimSpace(input.Floor),
		IsActive:    input.IsActive,
	}
	return s.admin.CreateRoom(ctx, room)
}

func (s AdminService) UpdateRoom(ctx context.Context, id string, input UpsertRoomInput) (domain.Room, error) {
	room := domain.Room{
		ID:          id,
		Code:        strings.ToUpper(strings.TrimSpace(input.Code)),
		Name:        strings.TrimSpace(input.Name),
		Description: strings.TrimSpace(input.Description),
		Floor:       strings.TrimSpace(input.Floor),
		IsActive:    input.IsActive,
	}
	return s.admin.UpdateRoom(ctx, room)
}

func (s AdminService) ListSeats(ctx context.Context, roomID string) ([]domain.Seat, error) {
	return s.admin.ListSeats(ctx, roomID)
}

func (s AdminService) CreateSeat(ctx context.Context, input UpsertSeatInput) (domain.Seat, error) {
	seat := domain.Seat{
		ID:     "seat-" + uuid.NewString(),
		RoomID: input.RoomID,
		Label:  strings.ToUpper(strings.TrimSpace(input.Label)),
		Zone:   strings.TrimSpace(input.Zone),
		Position: domain.SeatPosition{
			X: input.X,
			Y: input.Y,
		},
		IsActive: input.IsActive,
	}
	return s.admin.CreateSeat(ctx, seat)
}

func (s AdminService) UpdateSeat(ctx context.Context, id string, input UpsertSeatInput) (domain.Seat, error) {
	seat := domain.Seat{
		ID:     id,
		RoomID: input.RoomID,
		Label:  strings.ToUpper(strings.TrimSpace(input.Label)),
		Zone:   strings.TrimSpace(input.Zone),
		Position: domain.SeatPosition{
			X: input.X,
			Y: input.Y,
		},
		IsActive: input.IsActive,
	}
	return s.admin.UpdateSeat(ctx, seat)
}

func (s AdminService) ListUsers(ctx context.Context) ([]domain.User, error) {
	return s.admin.ListUsers(ctx)
}

func (s AdminService) UpdateUserRole(ctx context.Context, userID string, role domain.Role) (domain.User, error) {
	if role != domain.RoleAdmin && role != domain.RoleUser {
		return domain.User{}, domain.ErrForbidden
	}
	return s.admin.UpdateUserRole(ctx, userID, role)
}

func (s AdminService) UpdateUserStatus(ctx context.Context, userID string, isActive bool) (domain.User, error) {
	return s.admin.UpdateUserStatus(ctx, userID, isActive)
}
