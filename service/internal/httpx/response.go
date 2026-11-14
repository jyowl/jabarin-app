package httpx

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type Envelope struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Meta    *Meta  `json:"meta,omitempty"`
	Message string `json:"message,omitempty"`
	Errors  any    `json:"errors,omitempty"`
}

func OK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Envelope{Success: true, Data: data})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Envelope{Success: true, Data: data})
}

func Paginated(c *gin.Context, data any, meta Meta) {
	c.JSON(http.StatusOK, Envelope{Success: true, Data: data, Meta: &meta})
}

func Error(c *gin.Context, status int, message string, errs ...any) {
	env := Envelope{Success: false, Message: message}
	if len(errs) > 0 {
		env.Errors = errs[0]
	}
	c.AbortWithStatusJSON(status, env)
}

func BadRequest(c *gin.Context, err error) {
	Error(c, http.StatusBadRequest, "Permintaan tidak valid", err.Error())
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

func Internal(c *gin.Context, err error) {
	Error(c, http.StatusInternalServerError, "Terjadi kesalahan pada server", err.Error())
}

// Pagination membaca query ?page & ?per_page dengan batas aman.
func Pagination(c *gin.Context) (page, perPage, offset int) {
	page = atoiDefault(c.Query("page"), 1, 1, 10_000)
	perPage = atoiDefault(c.Query("per_page"), 20, 1, 100)
	return page, perPage, (page - 1) * perPage
}

func BuildMeta(page, perPage int, total int64) Meta {
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	return Meta{Page: page, PerPage: perPage, Total: total, TotalPages: totalPages}
}

func atoiDefault(raw string, def, min, max int) int {
	n := 0
	if raw == "" {
		return def
	}
	for _, ch := range raw {
		if ch < '0' || ch > '9' {
			return def
		}
		n = n*10 + int(ch-'0')
		if n > max {
			return max
		}
	}
	if n < min {
		return min
	}
	return n
}
