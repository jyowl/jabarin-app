package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"gorm.io/gorm"

	"github.com/jabarin/service/internal/ai"
	"github.com/jabarin/service/internal/config"
)

type Handler struct {
	db     *gorm.DB
	cfg    *config.Config
	gemini *ai.Client
}

func New(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:     db,
		cfg:    cfg,
		gemini: ai.NewClient(cfg.GeminiAPIKey, cfg.GeminiModel),
	}
}

// refNumber menghasilkan nomor registrasi seperti REG-2026-8841.
func refNumber(prefix string) string {
	n, err := rand.Int(rand.Reader, big.NewInt(9000))
	suffix := int64(1000)
	if err == nil {
		suffix += n.Int64()
	}
	return fmt.Sprintf("%s-%d-%04d", prefix, time.Now().Year(), suffix)
}
