package handlers

import (
	"booking-system-app/backend/internal/core/services"
	"github.com/gin-gonic/gin"
)

type CatalogHandler struct {
	catalog services.CatalogService
}

func NewCatalogHandler(catalog services.CatalogService) CatalogHandler {
	return CatalogHandler{catalog: catalog}
}

// @Summary List all active rooms
// @Description Returns a list of all active rooms available for booking
// @Tags catalog
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string][]domain.Room
// @Failure 401 {object} map[string]string
// @Router /rooms [get]
func (h CatalogHandler) ListRooms(c *gin.Context) {
	rooms, err := h.catalog.ListRooms(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(200, gin.H{"data": rooms})
}

// @Summary List seats for a room
// @Description Returns all seats for a specific room
// @Tags catalog
// @Produce json
// @Security BearerAuth
// @Param roomID path string true "Room ID"
// @Success 200 {object} map[string][]domain.Seat
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /rooms/{roomID}/seats [get]
func (h CatalogHandler) ListSeats(c *gin.Context) {
	seats, err := h.catalog.ListSeats(c.Request.Context(), c.Param("roomID"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(200, gin.H{"data": seats})
}
