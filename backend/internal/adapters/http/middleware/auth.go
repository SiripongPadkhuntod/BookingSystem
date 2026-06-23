package middleware

import (
	"net/http"
	"strings"

	"booking-system-app/backend/internal/core/domain"
	"booking-system-app/backend/internal/platform/security"
	"github.com/gin-gonic/gin"
)

const (
	ContextUserID = "userID"
	ContextRole   = "role"
)

func Auth(tokens security.TokenService) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "missing authorization token"})
			return
		}
		claims, err := tokens.Parse(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization token"})
			return
		}
		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextRole, claims.Role)
		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(ContextRole)
		if role != domain.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "admin access required"})
			return
		}
		c.Next()
	}
}

func CurrentUserID(c *gin.Context) string {
	value, _ := c.Get(ContextUserID)
	userID, _ := value.(string)
	return userID
}

func CurrentRole(c *gin.Context) domain.Role {
	value, _ := c.Get(ContextRole)
	role, _ := value.(domain.Role)
	return role
}
