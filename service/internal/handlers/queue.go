package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

type createTicketRequest struct {
	ServiceSlug string     `json:"service_slug" binding:"required"`
	Location    string     `json:"location" binding:"required,max=120"`
	ScheduleAt  *time.Time `json:"schedule_at"`
}

type ticketResponse struct {
	*models.QueueTicket
	// WaitingAhead adalah jumlah antrean di depan tiket ini.
	WaitingAhead int64 `json:"waiting_ahead"`
	// EstimatedWaitMinutes memakai asumsi 7 menit per warga.
	EstimatedWaitMinutes int64 `json:"estimated_wait_minutes"`
}

const minutesPerVisitor = 7

func (h *Handler) CreateQueueTicket(c *gin.Context) {
	var req createTicketRequest
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

	schedule := time.Now()
	if req.ScheduleAt != nil {
		schedule = *req.ScheduleAt
	}

	userID := middleware.UserID(c)
	dayStart := time.Date(schedule.Year(), schedule.Month(), schedule.Day(), 0, 0, 0, 0, schedule.Location())
	dayEnd := dayStart.Add(24 * time.Hour)

	var active int64
	h.db.Model(&models.QueueTicket{}).
		Where("user_id = ? AND service_id = ? AND status = ?", userID, service.ID, models.QueueStatusWaiting).
		Count(&active)
	if active > 0 {
		httpx.Error(c, http.StatusConflict, "Kamu masih punya tiket antrean aktif untuk layanan ini")
		return
	}

	ticket := models.QueueTicket{
		UserID:     userID,
		ServiceID:  service.ID,
		Location:   req.Location,
		Status:     models.QueueStatusWaiting,
		ScheduleAt: schedule,
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		var lastNumber int
		row := tx.Model(&models.QueueTicket{}).
			Where("service_id = ? AND location = ? AND schedule_at >= ? AND schedule_at < ?",
				service.ID, req.Location, dayStart, dayEnd).
			Select("COALESCE(MAX(number), 0)").Row()
		if err := row.Scan(&lastNumber); err != nil {
			return err
		}

		ticket.Number = lastNumber + 1
		ticket.Code = fmt.Sprintf("%s-%03d", queuePrefix(service.Category, service.Slug), ticket.Number)
		return tx.Create(&ticket).Error
	})
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	ticket.Service = &service

	var ahead int64
	h.db.Model(&models.QueueTicket{}).
		Where("service_id = ? AND location = ? AND status = ? AND number < ? AND schedule_at >= ? AND schedule_at < ?",
			service.ID, req.Location, models.QueueStatusWaiting, ticket.Number, dayStart, dayEnd).
		Count(&ahead)

	httpx.Created(c, ticketResponse{
		QueueTicket:          &ticket,
		WaitingAhead:         ahead,
		EstimatedWaitMinutes: ahead * minutesPerVisitor,
	})
}

func (h *Handler) ListQueueTickets(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.QueueTicket{}).Where("user_id = ?", middleware.UserID(c))
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var tickets []models.QueueTicket
	if err := query.Preload("Service").
		Order("schedule_at DESC").Limit(perPage).Offset(offset).Find(&tickets).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Paginated(c, tickets, httpx.BuildMeta(page, perPage, total))
}

// GetQueueTicket mengembalikan detail tiket termasuk estimasi tunggu terkini.
func (h *Handler) GetQueueTicket(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httpx.Error(c, http.StatusBadRequest, "ID tiket tidak valid")
		return
	}

	var ticket models.QueueTicket
	err = h.db.Preload("Service").
		Where("id = ? AND user_id = ?", id, middleware.UserID(c)).First(&ticket).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Tiket tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	dayStart := time.Date(ticket.ScheduleAt.Year(), ticket.ScheduleAt.Month(), ticket.ScheduleAt.Day(), 0, 0, 0, 0, ticket.ScheduleAt.Location())

	var ahead int64
	h.db.Model(&models.QueueTicket{}).
		Where("service_id = ? AND location = ? AND status = ? AND number < ? AND schedule_at >= ? AND schedule_at < ?",
			ticket.ServiceID, ticket.Location, models.QueueStatusWaiting, ticket.Number, dayStart, dayStart.Add(24*time.Hour)).
		Count(&ahead)

	httpx.OK(c, ticketResponse{
		QueueTicket:          &ticket,
		WaitingAhead:         ahead,
		EstimatedWaitMinutes: ahead * minutesPerVisitor,
	})
}

func (h *Handler) CancelQueueTicket(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httpx.Error(c, http.StatusBadRequest, "ID tiket tidak valid")
		return
	}

	var ticket models.QueueTicket
	err = h.db.Where("id = ? AND user_id = ?", id, middleware.UserID(c)).First(&ticket).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Tiket tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	if ticket.Status != models.QueueStatusWaiting {
		httpx.Error(c, http.StatusConflict, "Tiket ini sudah tidak aktif")
		return
	}

	if err := h.db.Model(&ticket).Update("status", models.QueueStatusSkipped).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, ticket)
}

// queuePrefix mengambil huruf awal kategori layanan sebagai prefiks kode antrean.
func queuePrefix(category, slug string) string {
	source := category
	if source == "" {
		source = slug
	}
	if source == "" {
		return "A"
	}
	return strings.ToUpper(string([]rune(source)[0]))
}
