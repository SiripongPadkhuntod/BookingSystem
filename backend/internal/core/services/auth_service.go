package services

import (
	"context"
	"strings"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/core/ports"
	"booking-system-app/backend/internal/platform/security"
	"github.com/google/uuid"
)

type AuthService struct {
	users  ports.UserRepository
	tokens security.TokenService
}

type RegisterInput struct {
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	StudentID string `json:"studentId"`
}

type LoginInput struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

type UpdateProfileInput struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DisplayName string `json:"displayName"`
	Department  string `json:"department"`
	StudentID   string `json:"studentId"`
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type AuthResult struct {
	Token string      `json:"token"`
	User  domain.User `json:"user"`
}

func NewAuthService(users ports.UserRepository, tokens security.TokenService) AuthService {
	return AuthService{users: users, tokens: tokens}
}

func (s AuthService) Register(ctx context.Context, input RegisterInput) (AuthResult, error) {
	passwordHash, err := security.HashPassword(input.Password)
	if err != nil {
		return AuthResult{}, err
	}

	user := domain.User{
		ID:           uuid.NewString(),
		Email:        strings.ToLower(strings.TrimSpace(input.Email)),
		Username:     strings.TrimSpace(input.Username),
		PasswordHash: passwordHash,
		FirstName:    strings.TrimSpace(input.FirstName),
		LastName:     strings.TrimSpace(input.LastName),
		StudentID:    strings.TrimSpace(input.StudentID),
		Role:         domain.RoleUser,
	}

	created, err := s.users.Create(ctx, user)
	if err != nil {
		return AuthResult{}, err
	}

	token, err := s.tokens.Generate(created)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{Token: token, User: created}, nil
}

func (s AuthService) Login(ctx context.Context, input LoginInput) (AuthResult, error) {
	user, err := s.users.FindByEmailOrUsername(ctx, input.Identifier)
	if err != nil {
		return AuthResult{}, domain.ErrInvalidCredentials
	}
	if !security.CheckPassword(user.PasswordHash, input.Password) {
		return AuthResult{}, domain.ErrInvalidCredentials
	}
	if !user.IsActive {
		return AuthResult{}, domain.ErrForbidden
	}

	token, err := s.tokens.Generate(user)
	if err != nil {
		return AuthResult{}, err
	}
	return AuthResult{Token: token, User: user}, nil
}

func (s AuthService) Me(ctx context.Context, userID string) (domain.User, error) {
	return s.users.FindByID(ctx, userID)
}

func (s AuthService) UpdateProfile(ctx context.Context, userID string, input UpdateProfileInput) (domain.User, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return domain.User{}, err
	}

	user.FirstName = strings.TrimSpace(input.FirstName)
	user.LastName = strings.TrimSpace(input.LastName)
	user.DisplayName = strings.TrimSpace(input.DisplayName)
	user.Department = strings.TrimSpace(input.Department)
	user.StudentID = strings.TrimSpace(input.StudentID)

	return s.users.Update(ctx, user)
}

func (s AuthService) ChangePassword(ctx context.Context, userID string, input ChangePasswordInput) error {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	if !security.CheckPassword(user.PasswordHash, input.CurrentPassword) {
		return domain.ErrIncorrectPassword
	}

	newHash, err := security.HashPassword(input.NewPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = newHash
	_, err = s.users.Update(ctx, user)
	return err
}

type DeactivateAccountInput struct {
	Password string `json:"password"`
}

func (s AuthService) DeactivateAccount(ctx context.Context, userID string, input DeactivateAccountInput) error {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return err
	}

	if !security.CheckPassword(user.PasswordHash, input.Password) {
		return domain.ErrIncorrectPassword
	}

	user.IsActive = false
	_, err = s.users.Update(ctx, user)
	return err
}
