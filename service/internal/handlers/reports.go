package handlers

import (
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

type createReportRequest struct {
	Category    string   `json:"category" binding:"required,max=60"`
	Title       string   `json:"title" binding:"required,min=5,max=160"`
	Description string   `json:"description" binding:"required,min=10"`
	Location    string   `json:"location" binding:"omitempty,max=200"`
	Latitude    *float64 `json:"latitude" binding:"omitempty,latitude"`
	Longitude   *float64 `json:"longitude" binding:"omitempty,longitude"`
	PhotoURLs   []string `json:"photo_urls" binding:"omitempty,max=5,dive,url"`
}

// CreateReport mengirim aduan warga lewat kanal "Lapor!".
func (h *Handler) CreateReport(c *gin.Context) {
	var req createReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	report := models.Report{
		RefNumber:   refNumber("LPR"),
		UserID:      middleware.UserID(c),
		Category:    req.Category,
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		PhotoURLs:   datatypes.JSONSlice[string](req.PhotoURLs),
		Status:      models.ReportStatusOpen,
	}

	if err := h.db.Create(&report).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Created(c, report)
}

// publicReport adalah tampilan aman aduan untuk log publik: tanpa identitas pelapor.
type publicReport struct {
	RefNumber   string   `json:"ref_number"`
	Category    string   `json:"category"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Location    string   `json:"location"`
	Latitude    *float64 `json:"latitude,omitempty"`
	Longitude   *float64 `json:"longitude,omitempty"`
	Status      string   `json:"status"`
	Response    string   `json:"response"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

// ListPublicReports menampilkan aduan warga tanpa data pribadi.
func (h *Handler) ListPublicReports(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.Report{})
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var reports []models.Report
	if err := query.Order("created_at DESC").Limit(perPage).Offset(offset).Find(&reports).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	out := make([]publicReport, 0, len(reports))
	for _, r := range reports {
		out = append(out, publicReport{
			RefNumber:   r.RefNumber,
			Category:    r.Category,
			Title:       r.Title,
			Description: r.Description,
			Location:    r.Location,
			Latitude:    r.Latitude,
			Longitude:   r.Longitude,
			Status:      string(r.Status),
			Response:    r.Response,
			CreatedAt:   r.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   r.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	httpx.Paginated(c, out, httpx.BuildMeta(page, perPage, total))
}

func (h *Handler) ListReports(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.Report{}).Where("user_id = ?", middleware.UserID(c))
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var reports []models.Report
	if err := query.Order("created_at DESC").Limit(perPage).Offset(offset).Find(&reports).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Paginated(c, reports, httpx.BuildMeta(page, perPage, total))
}

func (h *Handler) GetReport(c *gin.Context) {
	var report models.Report
	err := h.db.Where("ref_number = ? AND user_id = ?", c.Param("ref"), middleware.UserID(c)).
		First(&report).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Aduan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, report)
}
