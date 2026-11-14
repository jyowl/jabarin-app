package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

type createApplicationRequest struct {
	ServiceSlug string         `json:"service_slug" binding:"required"`
	Notes       string         `json:"notes" binding:"omitempty,max=1000"`
	Payload     map[string]any `json:"payload"`
}

func (h *Handler) CreateApplication(c *gin.Context) {
	var req createApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	var service models.Service
	err := h.db.Where("slug = ? AND is_active = ?", req.ServiceSlug, true).First(&service).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Layanan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	app := models.Application{
		RefNumber: refNumber("REG"),
		UserID:    middleware.UserID(c),
		ServiceID: service.ID,
		Status:    models.AppStatusSubmitted,
		Notes:     req.Notes,
		Payload:   datatypes.JSONMap(req.Payload),
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&app).Error; err != nil {
			return err
		}
		return tx.Create(&models.ApplicationEvent{
			ApplicationID: app.ID,
			Status:        models.AppStatusSubmitted,
			Note:          "Pengajuan diterima dan menunggu verifikasi petugas",
		}).Error
	})
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	app.Service = &service
	httpx.Created(c, app)
}

func (h *Handler) ListApplications(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.Application{}).Where("user_id = ?", middleware.UserID(c))
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var apps []models.Application
	if err := query.Preload("Service").
		Order("created_at DESC").Limit(perPage).Offset(offset).Find(&apps).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Paginated(c, apps, httpx.BuildMeta(page, perPage, total))
}

// TrackApplication melacak berkas berdasarkan nomor registrasi.
func (h *Handler) TrackApplication(c *gin.Context) {
	var app models.Application
	err := h.db.Preload("Service").
		Preload("Timeline", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		Where("ref_number = ? AND user_id = ?", c.Param("ref"), middleware.UserID(c)).
		First(&app).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Berkas tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, app)
}

func (h *Handler) CancelApplication(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httpx.Error(c, http.StatusBadRequest, "ID pengajuan tidak valid")
		return
	}

	var app models.Application
	err = h.db.Where("id = ? AND user_id = ?", id, middleware.UserID(c)).First(&app).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Berkas tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	if app.Status == models.AppStatusCompleted || app.Status == models.AppStatusRejected {
		httpx.Error(c, http.StatusConflict, "Berkas yang sudah selesai tidak dapat dibatalkan")
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&app).Update("status", models.AppStatusRejected).Error; err != nil {
			return err
		}
		return tx.Create(&models.ApplicationEvent{
			ApplicationID: app.ID,
			Status:        models.AppStatusRejected,
			Note:          "Pengajuan dibatalkan oleh warga",
		}).Error
	})
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, app)
}
