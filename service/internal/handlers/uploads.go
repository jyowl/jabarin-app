package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/jabarin/service/internal/httpx"
)

const maxUploadSize = 10 << 20 // 10 MB

var allowedImageExt = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
}

type uploadResponse struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
}

// Upload menerima satu foto bukti aduan (JPG/PNG, maksimal 10 MB).
// Berkas disimpan di UploadDir dan disajikan lewat /uploads/<nama>.
func (h *Handler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		httpx.BadRequest(c, err)
		return
	}
	if file.Size <= 0 || file.Size > maxUploadSize {
		httpx.Error(c, http.StatusBadRequest, "Ukuran foto harus antara 1 byte dan 10 MB")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if _, ok := allowedImageExt[ext]; !ok {
		httpx.Error(c, http.StatusBadRequest, "Format foto harus JPG atau PNG")
		return
	}

	if err := os.MkdirAll(h.cfg.UploadDir, 0o755); err != nil {
		httpx.Internal(c, err)
		return
	}

	name := uuid.NewString() + ext
	dst := filepath.Join(h.cfg.UploadDir, name)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		httpx.Internal(c, err)
		return
	}

	base := h.cfg.PublicBaseURL
	if base == "" {
		scheme := "http"
		if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		base = fmt.Sprintf("%s://%s", scheme, c.Request.Host)
	}

	httpx.Created(c, uploadResponse{
		URL:      base + "/uploads/" + name,
		Filename: name,
		Size:     file.Size,
	})
}
