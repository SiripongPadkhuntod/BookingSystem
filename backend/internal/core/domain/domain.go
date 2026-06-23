package domain

import (
	"errors"
	"time"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	DisplayName  string    `json:"displayName"`
	StudentID    string    `json:"studentId"`
	Department   string    `json:"department"`
	Role         Role      `json:"role"`
	IsActive     bool      `json:"isActive"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Room struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Floor       string `json:"floor"`
	IsActive    bool   `json:"isActive"`
}

type Seat struct {
	ID       string       `json:"id"`
	RoomID   string       `json:"roomId"`
	Label    string       `json:"label"`
	Zone     string       `json:"zone"`
	Position SeatPosition `json:"position"`
	IsActive bool         `json:"isActive"`
}

type SeatPosition struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type ReservationStatus string

const (
	ReservationConfirmed ReservationStatus = "confirmed"
	ReservationCancelled ReservationStatus = "cancelled"
)

type Reservation struct {
	ID        string            `json:"id"`
	UserID    string            `json:"userId"`
	RoomID    string            `json:"roomId"`
	SeatID    string            `json:"seatId"`
	Date      time.Time         `json:"date"`
	StartTime string            `json:"startTime"`
	EndTime   string            `json:"endTime"`
	Note      string            `json:"note"`
	Status    ReservationStatus `json:"status"`
	CreatedAt time.Time         `json:"createdAt"`
	User      *User             `json:"user,omitempty"`
	Room      *Room             `json:"room,omitempty"`
	Seat      *Seat             `json:"seat,omitempty"`
}

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrForbidden          = errors.New("forbidden")
	ErrNotFound           = errors.New("not found")
	ErrInactiveResource   = errors.New("booking is disabled for this room or seat")
	ErrReservationOverlap = errors.New("seat is already reserved for this time")
	ErrInvalidTimeRange   = errors.New("invalid reservation time range")
	ErrIncorrectPassword  = errors.New("incorrect current password")
)
