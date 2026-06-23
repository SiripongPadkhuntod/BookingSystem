package handlers

import (
	"net/http"
	"time"

	"booking-system-app/backend/internal/adapters/http/middleware"
	"booking-system-app/backend/internal/core/ports"
	"booking-system-app/backend/internal/core/services"
	"github.com/gin-gonic/gin"
)

type ReservationHandler struct {
	reservations services.ReservationService
}

func NewReservationHandler(reservations services.ReservationService) ReservationHandler {
	return ReservationHandler{reservations: reservations}
}

// @Summary Create reservation
// @Description Creates a new seat reservation
// @Tags reservations
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.CreateReservationInput true "Reservation details"
// @Success 201 {object} domain.Reservation
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /reservations [post]
func (h ReservationHandler) Create(c *gin.Context) {
	var input services.CreateReservationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	reservation, err := h.reservations.Create(c.Request.Context(), middleware.CurrentUserID(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, reservation)
}

// @Summary List reservations
// @Description Returns all reservations based on filters
// @Tags reservations
// @Produce json
// @Security BearerAuth
// @Param userId query string false "User ID"
// @Param roomId query string false "Room ID"
// @Param seatId query string false "Seat ID"
// @Param month query string false "Month (YYYY-MM)"
// @Param date query string false "Date (YYYY-MM-DD)"
// @Param startDate query string false "Start Date (YYYY-MM-DD)"
// @Param endDate query string false "End Date (YYYY-MM-DD)"
// @Success 200 {object} map[string][]domain.Reservation
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /reservations [get]
func (h ReservationHandler) List(c *gin.Context) {
	filter := ports.ReservationFilter{
		UserID: c.Query("userId"),
		RoomID: c.Query("roomId"),
		SeatID: c.Query("seatId"),
		Month:  c.Query("month"),
	}
	if dateValue := c.Query("date"); dateValue != "" {
		date, err := time.Parse("2006-01-02", dateValue)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid date"})
			return
		}
		filter.Date = &date
	}
	if startDateValue := c.Query("startDate"); startDateValue != "" {
		startDate, err := time.Parse("2006-01-02", startDateValue)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid startDate"})
			return
		}
		filter.StartDate = &startDate
	}
	if endDateValue := c.Query("endDate"); endDateValue != "" {
		endDate, err := time.Parse("2006-01-02", endDateValue)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid endDate"})
			return
		}
		filter.EndDate = &endDate
	}
	reservations, err := h.reservations.List(c.Request.Context(), filter)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reservations})
}

// @Summary List my reservations
// @Description Returns all reservations for the currently authenticated user
// @Tags reservations
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string][]domain.Reservation
// @Failure 401 {object} map[string]string
// @Router /reservations/me [get]
func (h ReservationHandler) MyReservations(c *gin.Context) {
	reservations, err := h.reservations.List(c.Request.Context(), ports.ReservationFilter{UserID: middleware.CurrentUserID(c)})
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reservations})
}

// @Summary Cancel a reservation
// @Description Cancels a specific reservation by ID
// @Tags reservations
// @Security BearerAuth
// @Param id path string true "Reservation ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /reservations/{id} [delete]
func (h ReservationHandler) Cancel(c *gin.Context) {
	err := h.reservations.Cancel(c.Request.Context(), c.Param("id"), middleware.CurrentUserID(c), middleware.CurrentRole(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
