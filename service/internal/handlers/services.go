package handlers

import (
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/models"
)

// ListServices mengembalikan katalog layanan, mendukung filter ?category & ?q.
func (h *Handler) ListServices(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.Service{}).Where("is_active = ?", true)
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if q := c.Query("q"); q != "" {
		query = query.Where("title ILIKE ?", "%"+q+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var services []models.Service
	if err := query.Order(`"order" ASC, title ASC`).Limit(perPage).Offset(offset).Find(&services).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Paginated(c, services, httpx.BuildMeta(page, perPage, total))
}

func (h *Handler) GetService(c *gin.Context) {
	var service models.Service
	err := h.db.Where("slug = ? AND is_active = ?", c.Param("slug"), true).First(&service).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Layanan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, service)
}
