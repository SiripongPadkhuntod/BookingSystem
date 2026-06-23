package handlers

import (
	"net/http"

	"booking-system-app/backend/internal/core/services"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	admin services.AdminService
}

func NewAdminHandler(admin services.AdminService) AdminHandler {
	return AdminHandler{admin: admin}
}

// @Summary List all rooms (Admin)
// @Description Returns a list of all rooms
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string][]domain.Room
// @Failure 401 {object} map[string]string
// @Router /admin/rooms [get]
func (h AdminHandler) ListRooms(c *gin.Context) {
	rooms, err := h.admin.ListRooms(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rooms})
}

// @Summary Create a room (Admin)
// @Description Creates a new room
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.UpsertRoomInput true "Room details"
// @Success 201 {object} domain.Room
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/rooms [post]
func (h AdminHandler) CreateRoom(c *gin.Context) {
	var input services.UpsertRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	room, err := h.admin.CreateRoom(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, room)
}

// @Summary Update a room (Admin)
// @Description Updates an existing room
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Param request body services.UpsertRoomInput true "Room details"
// @Success 200 {object} domain.Room
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/rooms/{roomID} [put]
func (h AdminHandler) UpdateRoom(c *gin.Context) {
	var input services.UpsertRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	room, err := h.admin.UpdateRoom(c.Request.Context(), c.Param("roomID"), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, room)
}

// @Summary List seats in a room (Admin)
// @Description Returns a list of all seats in a room
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Success 200 {object} map[string][]domain.Seat
// @Failure 401 {object} map[string]string
// @Router /admin/rooms/{roomID}/seats [get]
func (h AdminHandler) ListSeats(c *gin.Context) {
	seats, err := h.admin.ListSeats(c.Request.Context(), c.Param("roomID"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": seats})
}

// @Summary Create a seat (Admin)
// @Description Creates a new seat in a room
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Param request body services.UpsertSeatInput true "Seat details"
// @Success 201 {object} domain.Seat
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/rooms/{roomID}/seats [post]
func (h AdminHandler) CreateSeat(c *gin.Context) {
	var input services.UpsertSeatInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	input.RoomID = c.Param("roomID")
	seat, err := h.admin.CreateSeat(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, seat)
}

// @Summary Update a seat (Admin)
// @Description Updates an existing seat
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Param seatID path string true "Seat ID"
// @Param request body services.UpsertSeatInput true "Seat details"
// @Success 200 {object} domain.Seat
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/rooms/{roomID}/seats/{seatID} [put]
func (h AdminHandler) UpdateSeat(c *gin.Context) {
	var input services.UpsertSeatInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	input.RoomID = c.Param("roomID")
	seat, err := h.admin.UpdateSeat(c.Request.Context(), c.Param("seatID"), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, seat)
}

// @Summary Delete a seat (Admin)
// @Description Deletes a seat from a room
// @Tags admin
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Param seatID path string true "Seat ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/rooms/{roomID}/seats/{seatID} [delete]
func (h AdminHandler) DeleteSeat(c *gin.Context) {
	if err := h.admin.DeleteSeat(c.Request.Context(), c.Param("seatID")); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// @Summary List all users (Admin)
// @Description Returns a list of all users
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string][]domain.User
// @Failure 401 {object} map[string]string
// @Router /admin/users [get]
func (h AdminHandler) ListUsers(c *gin.Context) {
	users, err := h.admin.ListUsers(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": users})
}

// @Summary Update user role (Admin)
// @Description Updates the role of a user
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body services.UpdateRoleInput true "Role info"
// @Success 200 {object} domain.User
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/users/{id}/role [put]
func (h AdminHandler) UpdateUserRole(c *gin.Context) {
	var input services.UpdateRoleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	user, err := h.admin.UpdateUserRole(c.Request.Context(), c.Param("id"), input.Role)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

// @Summary Update user status (Admin)
// @Description Activates or deactivates a user
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "User ID"
// @Param request body services.UpdateStatusInput true "Status info"
// @Success 200 {object} domain.User
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /admin/users/{id}/status [put]
func (h AdminHandler) UpdateUserStatus(c *gin.Context) {
	var input services.UpdateStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	user, err := h.admin.UpdateUserStatus(c.Request.Context(), c.Param("id"), input.IsActive)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}
