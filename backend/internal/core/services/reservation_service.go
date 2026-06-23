package services

import (
	"context"
	"time"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/core/ports"
	"github.com/google/uuid"
)

type ReservationService struct {
	reservations ports.ReservationRepository
}

type CreateReservationInput struct {
	RoomID    string `json:"roomId"`
	SeatID    string `json:"seatId"`
	Date      string `json:"date"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Note      string `json:"note"`
}

func NewReservationService(reservations ports.ReservationRepository) ReservationService {
	return ReservationService{reservations: reservations}
}

func (s ReservationService) Create(ctx context.Context, userID string, input CreateReservationInput) (domain.Reservation, error) {
	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		return domain.Reservation{}, domain.ErrInvalidTimeRange
	}
	if !validTimeRange(input.StartTime, input.EndTime) {
		return domain.Reservation{}, domain.ErrInvalidTimeRange
	}

	reservation := domain.Reservation{
		ID:        uuid.NewString(),
		UserID:    userID,
		RoomID:    input.RoomID,
		SeatID:    input.SeatID,
		Date:      date,
		StartTime: input.StartTime,
		EndTime:   input.EndTime,
		Note:      input.Note,
		Status:    domain.ReservationConfirmed,
	}

	return s.reservations.Create(ctx, reservation)
}

func (s ReservationService) List(ctx context.Context, filter ports.ReservationFilter) ([]domain.Reservation, error) {
	return s.reservations.List(ctx, filter)
}

func (s ReservationService) Cancel(ctx context.Context, reservationID string, actorID string, actorRole domain.Role) error {
	return s.reservations.Cancel(ctx, reservationID, actorID, actorRole)
}

func validTimeRange(start string, end string) bool {
	startTime, err := time.Parse("15:04", start)
	if err != nil {
		return false
	}
	endTime, err := time.Parse("15:04", end)
	if err != nil {
		return false
	}
	if !endTime.After(startTime) {
		return false
	}
	open, _ := time.Parse("15:04", "08:00")
	closeAt, _ := time.Parse("15:04", "22:00")
	return !startTime.Before(open) && !endTime.After(closeAt)
}
