package handlers

import (
	"net/http"

	"booking-system-app/backend/internal/adapters/http/middleware"
	"booking-system-app/backend/internal/core/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	auth services.AuthService
}

func NewAuthHandler(auth services.AuthService) AuthHandler {
	return AuthHandler{auth: auth}
}

// @Summary Register a new user
// @Description Creates a new user account and returns a token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body services.RegisterInput true "Registration info"
// @Success 201 {object} services.AuthResult
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func (h AuthHandler) Register(c *gin.Context) {
	var input services.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	result, err := h.auth.Register(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, result)
}

// @Summary User login
// @Description Authenticates a user and returns a token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body services.LoginInput true "Login credentials"
// @Success 200 {object} services.AuthResult
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	result, err := h.auth.Login(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

// @Summary Get current user profile
// @Description Returns the profile of the currently authenticated user
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} domain.User
// @Failure 401 {object} map[string]string
// @Router /auth/me [get]
func (h AuthHandler) Me(c *gin.Context) {
	user, err := h.auth.Me(c.Request.Context(), middleware.CurrentUserID(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

// @Summary Update user profile
// @Description Updates the profile of the currently authenticated user
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body services.UpdateProfileInput true "Profile details"
// @Success 200 {object} domain.User
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/me [put]
func (h AuthHandler) UpdateProfile(c *gin.Context) {
	var input services.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	user, err := h.auth.UpdateProfile(c.Request.Context(), middleware.CurrentUserID(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

// @Summary Change password
// @Description Changes the password of the currently authenticated user
// @Tags auth
// @Accept json
// @Security BearerAuth
// @Param request body services.ChangePasswordInput true "Password info"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/me/password [put]
func (h AuthHandler) ChangePassword(c *gin.Context) {
	var input services.ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	if err := h.auth.ChangePassword(c.Request.Context(), middleware.CurrentUserID(c), input); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// @Summary Deactivate account
// @Description Deactivates the currently authenticated user account
// @Tags auth
// @Param request body services.DeactivateAccountInput true "Password info"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/me/deactivate [post]
func (h AuthHandler) DeactivateAccount(c *gin.Context) {
	var input services.DeactivateAccountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request body"})
		return
	}
	if err := h.auth.DeactivateAccount(c.Request.Context(), middleware.CurrentUserID(c), input); err != nil {
		respondError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
