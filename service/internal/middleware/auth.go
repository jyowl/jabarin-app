package middleware

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/jabarin/service/internal/httpx"
)

const contextUserID = "auth_user_id"

type Claims struct {
	UserID string `json:"uid"`
	NIK    string `json:"nik"`
	jwt.RegisteredClaims
}

func IssueToken(secret string, ttl time.Duration, userID uuid.UUID, nik string) (string, time.Time, error) {
	expires := time.Now().Add(ttl)
	claims := Claims{
		UserID: userID.String(),
		NIK:    nik,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			Issuer:    "jabarin-service",
			ExpiresAt: jwt.NewNumericDate(expires),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	return signed, expires, err
}

func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		raw, ok := strings.CutPrefix(header, "Bearer ")
		if !ok || strings.TrimSpace(raw) == "" {
			httpx.Error(c, http.StatusUnauthorized, "Token tidak ditemukan")
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(strings.TrimSpace(raw), claims, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("metode signing tidak didukung")
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			httpx.Error(c, http.StatusUnauthorized, "Token tidak valid atau kedaluwarsa")
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			httpx.Error(c, http.StatusUnauthorized, "Token tidak valid")
			return
		}

		c.Set(contextUserID, userID)
		c.Next()
	}
}

// UserID mengambil ID user dari context yang sudah lewat middleware Auth.
func UserID(c *gin.Context) uuid.UUID {
	v, ok := c.Get(contextUserID)
	if !ok {
		return uuid.Nil
	}
	id, _ := v.(uuid.UUID)
	return id
}
