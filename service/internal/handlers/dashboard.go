package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

type dashboardSummary struct {
	Greeting string `json:"greeting"`
	User     struct {
		FullName  string `json:"full_name"`
		City      string `json:"city"`
		IKDStatus string `json:"ikd_status"`
	} `json:"user"`
	// Counters mengisi kartu ringkasan di beranda (Berkas, Antrean, Lapor).
	Counters struct {
		ActiveApplications int64  `json:"active_applications"`
		ActiveReports      int64  `json:"active_reports"`
		ActiveQueueCode    string `json:"active_queue_code"`
	} `json:"counters"`
	LatestApplication *models.Application `json:"latest_application,omitempty"`
	Services          []models.Service    `json:"services"`
}

// DashboardSummary menyediakan satu panggilan untuk seluruh data layar Beranda.
func (h *Handler) DashboardSummary(c *gin.Context) {
	userID := middleware.UserID(c)

	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var out dashboardSummary
	out.Greeting = "Halo, " + user.FullName
	out.User.FullName = user.FullName
	out.User.City = user.City
	out.User.IKDStatus = string(user.IKDStatus)

	h.db.Model(&models.Application{}).
		Where("user_id = ? AND status IN ?", userID,
			[]models.ApplicationStatus{models.AppStatusSubmitted, models.AppStatusVerified, models.AppStatusProcess}).
		Count(&out.Counters.ActiveApplications)

	h.db.Model(&models.Report{}).
		Where("user_id = ? AND status IN ?", userID,
			[]models.ReportStatus{models.ReportStatusOpen, models.ReportStatusInProgress}).
		Count(&out.Counters.ActiveReports)

	var ticket models.QueueTicket
	if err := h.db.Where("user_id = ? AND status = ?", userID, models.QueueStatusWaiting).
		Order("schedule_at ASC").First(&ticket).Error; err == nil {
		out.Counters.ActiveQueueCode = ticket.Code
	}

	var latest models.Application
	if err := h.db.Preload("Service").
		Preload("Timeline", func(db *gorm.DB) *gorm.DB { return db.Order("created_at DESC").Limit(1) }).
		Where("user_id = ?", userID).Order("created_at DESC").First(&latest).Error; err == nil {
		out.LatestApplication = &latest
	}

	if err := h.db.Where("is_active = ?", true).
		Order(`"order" ASC, title ASC`).Limit(8).Find(&out.Services).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, out)
}
