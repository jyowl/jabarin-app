package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/jabarin/service/internal/config"
	"github.com/jabarin/service/internal/middleware"
)

func NewRouter(h *Handler, cfg *config.Config) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger(), middleware.Recovery(), middleware.CORS(cfg.CORSOrigins))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"env":    cfg.Env,
			"ai":     gin.H{"provider": "gemini", "model": cfg.GeminiModel, "ready": h.gemini.Enabled()},
			"time":   time.Now(),
		})
	})

	v1 := r.Group("/api/v1")

	auth := v1.Group("/auth")
	auth.Use(middleware.RateLimit(20, time.Minute))
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
	}

	// Katalog layanan bersifat publik agar bisa ditampilkan sebelum login.
	v1.GET("/services", h.ListServices)
	v1.GET("/services/:slug", h.GetService)

	secured := v1.Group("")
	secured.Use(middleware.Auth(cfg.JWTSecret), middleware.RateLimit(240, time.Minute))
	{
		secured.GET("/me", h.Me)
		secured.PATCH("/me", h.UpdateProfile)
		secured.POST("/me/ikd/activate", h.ActivateIKD)

		secured.GET("/dashboard/summary", h.DashboardSummary)

		secured.POST("/applications", h.CreateApplication)
		secured.GET("/applications", h.ListApplications)
		secured.GET("/applications/track/:ref", h.TrackApplication)
		secured.POST("/applications/:id/cancel", h.CancelApplication)

		secured.POST("/queue/tickets", h.CreateQueueTicket)
		secured.GET("/queue/tickets", h.ListQueueTickets)
		secured.GET("/queue/tickets/:id", h.GetQueueTicket)
		secured.POST("/queue/tickets/:id/cancel", h.CancelQueueTicket)

		secured.POST("/reports", h.CreateReport)
		secured.GET("/reports", h.ListReports)
		secured.GET("/reports/:ref", h.GetReport)

		// Chat AI dibatasi lebih ketat karena memanggil Gemini.
		chat := secured.Group("/chat")
		chat.Use(middleware.RateLimit(30, time.Minute))
		{
			chat.POST("", h.Chat)
			chat.GET("/suggestions", h.ChatSuggestions)
			chat.GET("/sessions", h.ListChatSessions)
			chat.GET("/sessions/:id", h.GetChatSession)
			chat.DELETE("/sessions/:id", h.DeleteChatSession)
		}
	}

	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Endpoint tidak ditemukan"})
	})

	return r
}
