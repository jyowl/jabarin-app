package config

import (
	"log"
	"os"
	"strings"
	"time"
)

type Config struct {
	Port        string
	Env         string
	DatabaseURL string

	JWTSecret string
	JWTTTL    time.Duration

	GeminiAPIKey string
	GeminiModel  string

	CORSOrigins []string
	SeedData    bool
}

func Load() *Config {
	cfg := &Config{
		Port:         env("PORT", "8080"),
		Env:          env("APP_ENV", "development"),
		DatabaseURL:  env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/jabarin?sslmode=disable"),
		JWTSecret:    env("JWT_SECRET", "jabarin-dev-secret-change-me"),
		GeminiAPIKey: env("GEMINI_API_KEY", ""),
		GeminiModel:  env("GEMINI_MODEL", "gemini-2.5-flash"),
		CORSOrigins:  strings.Split(env("CORS_ORIGINS", "*"), ","),
		SeedData:     env("SEED_DATA", "true") == "true",
	}

	ttl, err := time.ParseDuration(env("JWT_TTL", "720h"))
	if err != nil {
		log.Printf("config: invalid JWT_TTL, fallback to 720h: %v", err)
		ttl = 720 * time.Hour
	}
	cfg.JWTTTL = ttl

	if cfg.GeminiAPIKey == "" {
		log.Println("config: GEMINI_API_KEY is empty — chat AI akan menjawab dengan mode fallback")
	}

	return cfg
}

func (c *Config) IsProduction() bool { return c.Env == "production" }

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
