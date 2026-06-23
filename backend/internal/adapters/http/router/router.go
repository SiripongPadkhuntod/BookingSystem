package router

import (
	"net/http"

	"booking-system-app/backend/internal/adapters/http/handlers"
	"booking-system-app/backend/internal/adapters/http/middleware"
	"booking-system-app/backend/internal/platform/security"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth         handlers.AuthHandler
	Catalog      handlers.CatalogHandler
	Reservations handlers.ReservationHandler
	Admin        handlers.AdminHandler
}

func New(handlers Handlers, tokens security.TokenService, globalMiddleware ...gin.HandlerFunc) *gin.Engine {
	engine := gin.New()
	_ = engine.SetTrustedProxies(nil)
	engine.Use(gin.Logger(), gin.Recovery())
	if len(globalMiddleware) > 0 {
		engine.Use(globalMiddleware...)
	}

	engine.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := engine.Group("/api")
	api.POST("/auth/register", handlers.Auth.Register)
	api.POST("/auth/login", handlers.Auth.Login)

	protected := api.Group("")
	protected.Use(middleware.Auth(tokens))
	protected.GET("/auth/me", handlers.Auth.Me)
	protected.PUT("/auth/me", handlers.Auth.UpdateProfile)
	protected.PUT("/auth/me/password", handlers.Auth.ChangePassword)
	protected.POST("/auth/me/deactivate", handlers.Auth.DeactivateAccount)
	protected.GET("/rooms", handlers.Catalog.ListRooms)
	protected.GET("/rooms/:roomID/seats", handlers.Catalog.ListSeats)
	protected.GET("/reservations", handlers.Reservations.List)
	protected.GET("/reservations/me", handlers.Reservations.MyReservations)
	protected.POST("/reservations", handlers.Reservations.Create)
	protected.DELETE("/reservations/:id", handlers.Reservations.Cancel)

	admin := protected.Group("/admin")
	admin.Use(middleware.RequireAdmin())
	admin.GET("/rooms", handlers.Admin.ListRooms)
	admin.POST("/rooms", handlers.Admin.CreateRoom)
	admin.PUT("/rooms/:roomID", handlers.Admin.UpdateRoom)
	admin.GET("/rooms/:roomID/seats", handlers.Admin.ListSeats)
	admin.POST("/rooms/:roomID/seats", handlers.Admin.CreateSeat)
	admin.PUT("/rooms/:roomID/seats/:seatID", handlers.Admin.UpdateSeat)
	admin.GET("/users", handlers.Admin.ListUsers)
	admin.PUT("/users/:id/role", handlers.Admin.UpdateUserRole)
	admin.PUT("/users/:id/status", handlers.Admin.UpdateUserStatus)

	return engine
}
