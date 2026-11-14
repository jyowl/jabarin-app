package handlers

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/jabarin/service/internal/ai"
	"github.com/jabarin/service/internal/httpx"
	"github.com/jabarin/service/internal/middleware"
	"github.com/jabarin/service/internal/models"
)

// historyLimit membatasi jumlah pesan terakhir yang dikirim ke Gemini.
const historyLimit = 20

type chatRequest struct {
	// SessionID opsional; bila kosong sesi baru akan dibuat.
	SessionID *uuid.UUID `json:"session_id"`
	Message   string     `json:"message" binding:"required,min=1,max=4000"`
}

type chatResponse struct {
	SessionID uuid.UUID           `json:"session_id"`
	Reply     *models.ChatMessage `json:"reply"`
	Model     string              `json:"model"`
	Degraded  bool                `json:"degraded"`
}

// Chat mengirim pesan warga ke Gemini Flash dan menyimpan riwayatnya.
func (h *Handler) Chat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpx.BadRequest(c, err)
		return
	}

	userID := middleware.UserID(c)
	message := strings.TrimSpace(req.Message)

	session, ok := h.resolveSession(c, userID, req.SessionID, message)
	if !ok {
		return
	}

	userMsg := models.ChatMessage{
		SessionID: session.ID,
		Role:      models.ChatRoleUser,
		Content:   message,
	}
	if err := h.db.Create(&userMsg).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	history, err := h.buildHistory(session.ID)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	systemPrompt, err := h.buildUserContext(userID)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	if h.gemini.Enabled() {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 45*time.Second)
		defer cancel()

		result, err := h.gemini.GenerateContent(ctx, systemPrompt, history, &ai.GenerationConfig{
			Temperature:     0.4,
			TopP:            0.9,
			MaxOutputTokens: 1024,
		})
		if err != nil {
			httpx.Error(c, http.StatusBadGateway, "Asisten AI sedang tidak dapat dihubungi", err.Error())
			return
		}
		modelMsg := models.ChatMessage{
			SessionID:  session.ID,
			Role:       models.ChatRoleModel,
			Content:    result.Text,
			TokensUsed: result.TotalTokens,
		}
		if err := h.db.Create(&modelMsg).Error; err != nil {
			httpx.Internal(c, err)
			return
		}

		httpx.OK(c, chatResponse{
			SessionID: session.ID,
			Reply:     &modelMsg,
			Model:     h.gemini.Model(),
			Degraded:  false,
		})
		return
	}

	// Tanpa API key, balas dengan panduan statis agar UI tetap berfungsi.
	modelMsg := models.ChatMessage{
		SessionID: session.ID,
		Role:      models.ChatRoleModel,
		Content:   ai.FallbackAnswer(message),
	}
	if err := h.db.Create(&modelMsg).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, chatResponse{
		SessionID: session.ID,
		Reply:     &modelMsg,
		Model:     h.gemini.Model(),
		Degraded:  true,
	})
}

func (h *Handler) ListChatSessions(c *gin.Context) {
	page, perPage, offset := httpx.Pagination(c)

	query := h.db.Model(&models.ChatSession{}).Where("user_id = ?", middleware.UserID(c))

	var total int64
	if err := query.Count(&total).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	var sessions []models.ChatSession
	if err := query.Order("updated_at DESC").Limit(perPage).Offset(offset).Find(&sessions).Error; err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.Paginated(c, sessions, httpx.BuildMeta(page, perPage, total))
}

func (h *Handler) GetChatSession(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httpx.Error(c, http.StatusBadRequest, "ID sesi tidak valid")
		return
	}

	var session models.ChatSession
	err = h.db.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).Where("id = ? AND user_id = ?", id, middleware.UserID(c)).First(&session).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		httpx.NotFound(c, "Sesi percakapan tidak ditemukan")
		return
	}
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	httpx.OK(c, session)
}

func (h *Handler) DeleteChatSession(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httpx.Error(c, http.StatusBadRequest, "ID sesi tidak valid")
		return
	}

	res := h.db.Where("id = ? AND user_id = ?", id, middleware.UserID(c)).Delete(&models.ChatSession{})
	if res.Error != nil {
		httpx.Internal(c, res.Error)
		return
	}
	if res.RowsAffected == 0 {
		httpx.NotFound(c, "Sesi percakapan tidak ditemukan")
		return
	}

	httpx.OK(c, gin.H{"deleted": true})
}

// ChatSuggestions memberi pertanyaan cepat untuk ditampilkan di layar chat.
func (h *Handler) ChatSuggestions(c *gin.Context) {
	httpx.OK(c, gin.H{
		"model": h.gemini.Model(),
		"ready": h.gemini.Enabled(),
		"suggestions": []string{
			"Syarat perpanjang e-KTP yang rusak apa saja?",
			"Bagaimana cara bayar PBB lewat aplikasi?",
			"Saya mau urus surat pindah domisili, mulai dari mana?",
			"Cara aktivasi IKD dan manfaatnya?",
			"Bagaimana melaporkan jalan rusak di lingkungan saya?",
		},
	})
}

func (h *Handler) resolveSession(c *gin.Context, userID uuid.UUID, sessionID *uuid.UUID, firstMessage string) (*models.ChatSession, bool) {
	if sessionID != nil {
		var session models.ChatSession
		err := h.db.Where("id = ? AND user_id = ?", *sessionID, userID).First(&session).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.NotFound(c, "Sesi percakapan tidak ditemukan")
			return nil, false
		}
		if err != nil {
			httpx.Internal(c, err)
			return nil, false
		}
		// Sentuh updated_at agar urutan daftar sesi tetap relevan.
		h.db.Model(&session).Update("updated_at", time.Now())
		return &session, true
	}

	session := models.ChatSession{UserID: userID, Title: sessionTitle(firstMessage)}
	if err := h.db.Create(&session).Error; err != nil {
		httpx.Internal(c, err)
		return nil, false
	}
	return &session, true
}

func (h *Handler) buildHistory(sessionID uuid.UUID) ([]ai.Content, error) {
	var messages []models.ChatMessage
	if err := h.db.Where("session_id = ?", sessionID).
		Order("created_at DESC").Limit(historyLimit).Find(&messages).Error; err != nil {
		return nil, err
	}

	contents := make([]ai.Content, 0, len(messages))
	for i := len(messages) - 1; i >= 0; i-- {
		contents = append(contents, ai.Content{
			Role:  string(messages[i].Role),
			Parts: []ai.Part{{Text: messages[i].Content}},
		})
	}
	return contents, nil
}

func (h *Handler) buildUserContext(userID uuid.UUID) (string, error) {
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		return "", err
	}

	var activeApps, activeReports int64
	h.db.Model(&models.Application{}).
		Where("user_id = ? AND status IN ?", userID,
			[]models.ApplicationStatus{models.AppStatusSubmitted, models.AppStatusVerified, models.AppStatusProcess}).
		Count(&activeApps)
	h.db.Model(&models.Report{}).
		Where("user_id = ? AND status IN ?", userID,
			[]models.ReportStatus{models.ReportStatusOpen, models.ReportStatusInProgress}).
		Count(&activeReports)

	var ticket models.QueueTicket
	queueCode := ""
	if err := h.db.Where("user_id = ? AND status = ?", userID, models.QueueStatusWaiting).
		Order("schedule_at ASC").First(&ticket).Error; err == nil {
		queueCode = ticket.Code
	}

	var catalog []string
	h.db.Model(&models.Service{}).Where("is_active = ?", true).
		Order(`"order" ASC`).Pluck("title", &catalog)

	return ai.BuildSystemPrompt(ai.UserContext{
		FullName:        user.FullName,
		City:            user.City,
		IKDStatus:       string(user.IKDStatus),
		ActiveApps:      int(activeApps),
		ActiveReports:   int(activeReports),
		ActiveQueueCode: queueCode,
		ServiceCatalog:  catalog,
	}), nil
}

func sessionTitle(message string) string {
	title := strings.Join(strings.Fields(message), " ")
	if len([]rune(title)) > 60 {
		title = string([]rune(title)[:57]) + "..."
	}
	if title == "" {
		title = "Percakapan baru"
	}
	return title
}
