package handlers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

type registerRequest struct {
	NIK      string `json:"nik" binding:"required,len=16,numeric"`
	FullName string `json:"full_name" binding:"required,min=3,max=120"`
	Phone    string `json:"phone" binding:"required,min=9,max=20"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"required,min=8,max=72"`
	Address  string `json:"address" binding:"omitempty,max=255"`
	Village  string `json:"village" binding:"omitempty,max=100"`
	District string `json:"district" binding:"omitempty,max=100"`
	City     string `json:"city" binding:"omitempty,max=100"`
}

type loginRequest struct {
	// Identifier bisa NIK atau nomor telepon.
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type authResponse struct {
	Token     string       `json:"token"`
	ExpiresAt time.Time    `json:"expires_at"`
	User      *models.User `json:"user"`
}

func (h *Handler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	var exists int64
	h.db.Model(&models.User{}).
		Where("nik = ? OR phone = ?", req.NIK, req.Phone).
		Count(&exists)
	if exists > 0 {
		httpx.Error(c, http.StatusConflict, "NIK atau nomor telepon sudah terdaftar")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	user := models.User{
		NIK:          req.NIK,
		FullName:     req.FullName,
		Phone:        req.Phone,
		PasswordHash: string(hash),
		Address:      req.Address,
		Village:      req.Village,
		District:     req.District,
		City:         req.City,
		IKDStatus:    models.IKDStatusInactive,
	}
	if req.Email != "" {
		email := strings.ToLower(req.Email)
		user.Email = &email
	}

	if err := h.db.Create(&user).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	token, expires, err := middleware.IssueToken(h.cfg.JWTSecret, h.cfg.JWTTTL, user.ID, user.NIK)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Created(c, authResponse{Token: token, ExpiresAt: expires, User: &user})
}

func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	var user models.User
	err := h.db.Where("nik = ? OR phone = ?", req.Identifier, req.Identifier).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.Error(c, http.StatusUnauthorized, "NIK/nomor telepon atau kata sandi salah")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		httpx.Error(c, http.StatusUnauthorized, "NIK/nomor telepon atau kata sandi salah")
		return
	}

	token, expires, err := middleware.IssueToken(h.cfg.JWTSecret, h.cfg.JWTTTL, user.ID, user.NIK)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, authResponse{Token: token, ExpiresAt: expires, User: &user})
}

func (h *Handler) Me(c *gin.Context) {
	user, ok := h.currentUser(c)
	if !ok {
		return
	}
	httpx.OK(c, user)
}

type updateProfileRequest struct {
	FullName *string `json:"full_name" binding:"omitempty,min=3,max=120"`
	Email    *string `json:"email" binding:"omitempty,email"`
	Phone    *string `json:"phone" binding:"omitempty,min=9,max=20"`
	Address  *string `json:"address" binding:"omitempty,max=255"`
	Village  *string `json:"village" binding:"omitempty,max=100"`
	District *string `json:"district" binding:"omitempty,max=100"`
	City     *string `json:"city" binding:"omitempty,max=100"`
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	user, ok := h.currentUser(c)
	if !ok {
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	updates := map[string]any{}
	assign := func(key string, val *string) {
		if val != nil {
			updates[key] = *val
		}
	}
	assign("full_name", req.FullName)
	assign("phone", req.Phone)
	assign("address", req.Address)
	assign("village", req.Village)
	assign("district", req.District)
	assign("city", req.City)
	if req.Email != nil {
		updates["email"] = strings.ToLower(*req.Email)
	}

	if len(updates) == 0 {
		httpx.Error(c, http.StatusBadRequest, "Tidak ada data yang diperbarui")
		return
	}

	if err := h.db.Model(user).Updates(updates).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, user)
}

type activateIKDRequest struct {
	// FaceVerificationToken berasal dari proses verifikasi biometrik di sisi klien.
	FaceVerificationToken string `json:"face_verification_token" binding:"required,min=8"`
}

// ActivateIKD mengaktifkan Identitas Kependudukan Digital warga.
func (h *Handler) ActivateIKD(c *gin.Context) {
	user, ok := h.currentUser(c)
	if !ok {
		return
	}

	var req activateIKDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	if user.IKDStatus == models.IKDStatusActive {
		httpx.OK(c, user)
		return
	}

	now := time.Now()
	if err := h.db.Model(user).Updates(map[string]any{
		"ikd_status":    models.IKDStatusActive,
		"ikd_activated": now,
	}).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, user)
}

func (h *Handler) currentUser(c *gin.Context) (*models.User, bool) {
	var user models.User
	if err := h.db.First(&user, "id = ?", middleware.UserID(c)).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.Error(c, http.StatusUnauthorized, "Akun tidak ditemukan")
			return nil, false
		}
		httpx.Internal(c, err)
		return nil, false
	}
	return &user, true
}
