package handlers

import (
	"errors"
	"net/http"

	"booking-system-app/backend/internal/core/domain"
	"github.com/gin-gonic/gin"
)

func respondError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidCredentials):
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid email, username, or password"})
	case errors.Is(err, domain.ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"message": "forbidden"})
	case errors.Is(err, domain.ErrInactiveResource):
		c.JSON(http.StatusConflict, gin.H{"message": "booking is disabled for this room or seat"})
	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"message": "resource not found"})
	case errors.Is(err, domain.ErrReservationOverlap):
		c.JSON(http.StatusConflict, gin.H{"message": "seat is already reserved for this time"})
	case errors.Is(err, domain.ErrInvalidTimeRange):
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid reservation date or time range"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"message": "internal server error"})
	}
}
