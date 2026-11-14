package middleware

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/jabarin/service/internal/httpx"
)

func CORS(origins []string) gin.HandlerFunc {
	allowAll := len(origins) == 0 || origins[0] == "*"
	allowed := make(map[string]struct{}, len(origins))
	for _, o := range origins {
		allowed[o] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		switch {
		case allowAll:
			c.Header("Access-Control-Allow-Origin", "*")
		case origin != "":
			if _, ok := allowed[origin]; ok {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Vary", "Origin")
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id")
		c.Header("Access-Control-Max-Age", "600")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, err any) {
		log.Printf("panic: %v %s %v", c.Request.Method, c.Request.URL.Path, err)
		httpx.Error(c, http.StatusInternalServerError, "Terjadi kesalahan pada server")
	})
}

// RateLimit membatasi jumlah request per kunci (IP atau user) dalam satu window.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	type bucket struct {
		count int
		reset time.Time
	}

	var (
		mu      sync.Mutex
		buckets = map[string]*bucket{}
	)

	return func(c *gin.Context) {
		key := c.ClientIP()
		if uid := UserID(c); uid.String() != "00000000-0000-0000-0000-000000000000" {
			key = uid.String()
		}

		now := time.Now()

		mu.Lock()
		b, ok := buckets[key]
		if !ok || now.After(b.reset) {
			b = &bucket{reset: now.Add(window)}
			buckets[key] = b
		}
		b.count++
		exceeded := b.count > limit
		retryAfter := time.Until(b.reset)
		mu.Unlock()

		if exceeded {
			c.Header("Retry-After", retryAfter.Round(time.Second).String())
			httpx.Error(c, http.StatusTooManyRequests, "Terlalu banyak permintaan, coba lagi nanti")
			return
		}
		c.Next()
	}
}
