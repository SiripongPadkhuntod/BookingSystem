package security

import (
	"time"

	"booking-system-app/backend/internal/core/domain"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string      `json:"userId"`
	Role   domain.Role `json:"role"`
	jwt.RegisteredClaims
}

type TokenService struct {
	secret []byte
	ttl    time.Duration
}

func NewTokenService(secret string, ttl time.Duration) TokenService {
	return TokenService{secret: []byte(secret), ttl: ttl}
}

func (s TokenService) Generate(user domain.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.secret)
}

func (s TokenService) Parse(tokenString string) (Claims, error) {
	claims := Claims{}
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return Claims{}, err
	}
	return claims, nil
}
