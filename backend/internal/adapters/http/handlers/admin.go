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

func (h AdminHandler) ListRooms(c *gin.Context) {
	rooms, err := h.admin.ListRooms(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rooms})
}

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

func (h AdminHandler) ListSeats(c *gin.Context) {
	seats, err := h.admin.ListSeats(c.Request.Context(), c.Param("roomID"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": seats})
}

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

func (h AdminHandler) ListUsers(c *gin.Context) {
	users, err := h.admin.ListUsers(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": users})
}

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
