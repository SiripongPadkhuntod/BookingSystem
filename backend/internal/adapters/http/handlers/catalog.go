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

func (h CatalogHandler) ListRooms(c *gin.Context) {
	rooms, err := h.catalog.ListRooms(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(200, gin.H{"data": rooms})
}

func (h CatalogHandler) ListSeats(c *gin.Context) {
	seats, err := h.catalog.ListSeats(c.Request.Context(), c.Param("roomID"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(200, gin.H{"data": seats})
}
