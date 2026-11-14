package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (b *Base) BeforeCreate(*gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// IKDStatus merepresentasikan status Identitas Kependudukan Digital.
type IKDStatus string

const (
	IKDStatusInactive IKDStatus = "inactive"
	IKDStatusPending  IKDStatus = "pending"
	IKDStatusActive   IKDStatus = "active"
)

type User struct {
	Base
	NIK          string     `gorm:"size:16;uniqueIndex;not null" json:"nik"`
	FullName     string     `gorm:"size:120;not null" json:"full_name"`
	Email        *string    `gorm:"size:160;uniqueIndex" json:"email,omitempty"`
	Phone        string     `gorm:"size:20;uniqueIndex;not null" json:"phone"`
	PasswordHash string     `gorm:"size:120;not null" json:"-"`
	Address      string     `gorm:"size:255" json:"address"`
	Village      string     `gorm:"size:100" json:"village"`
	District     string     `gorm:"size:100" json:"district"`
	City         string     `gorm:"size:100" json:"city"`
	Province     string     `gorm:"size:100;default:'Jawa Barat'" json:"province"`
	IKDStatus    IKDStatus  `gorm:"size:20;default:'inactive'" json:"ikd_status"`
	IKDActivated *time.Time `json:"ikd_activated_at,omitempty"`
}

// Service adalah katalog layanan publik (Dukcapil, Kesehatan, PBB, dll).
type Service struct {
	Base
	Slug        string `gorm:"size:80;uniqueIndex;not null" json:"slug"`
	Title       string `gorm:"size:120;not null" json:"title"`
	Icon        string `gorm:"size:16" json:"icon"`
	Category    string `gorm:"size:60;index" json:"category"`
	Description string `gorm:"type:text" json:"description"`
	// Requirements adalah daftar syarat dokumen.
	Requirements datatypes.JSONSlice[string] `json:"requirements"`
	SLADays      int                         `gorm:"default:3" json:"sla_days"`
	IsActive     bool                        `gorm:"default:true;index" json:"is_active"`
	Order        int                         `gorm:"default:0" json:"order"`
}

type ApplicationStatus string

const (
	AppStatusSubmitted ApplicationStatus = "submitted"
	AppStatusVerified  ApplicationStatus = "verified"
	AppStatusProcess   ApplicationStatus = "processing"
	AppStatusCompleted ApplicationStatus = "completed"
	AppStatusRejected  ApplicationStatus = "rejected"
)

// Application adalah pengajuan berkas layanan oleh warga.
type Application struct {
	Base
	RefNumber string             `gorm:"size:32;uniqueIndex;not null" json:"ref_number"`
	UserID    uuid.UUID          `gorm:"type:uuid;index;not null" json:"user_id"`
	ServiceID uuid.UUID          `gorm:"type:uuid;index;not null" json:"service_id"`
	Service   *Service           `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Status    ApplicationStatus  `gorm:"size:20;index;default:'submitted'" json:"status"`
	Notes     string             `gorm:"type:text" json:"notes"`
	Payload   datatypes.JSONMap  `json:"payload"`
	Timeline  []ApplicationEvent `gorm:"foreignKey:ApplicationID" json:"timeline,omitempty"`
}

type ApplicationEvent struct {
	Base
	ApplicationID uuid.UUID         `gorm:"type:uuid;index;not null" json:"application_id"`
	Status        ApplicationStatus `gorm:"size:20;not null" json:"status"`
	Note          string            `gorm:"type:text" json:"note"`
}

type QueueStatus string

const (
	QueueStatusWaiting QueueStatus = "waiting"
	QueueStatusCalled  QueueStatus = "called"
	QueueStatusDone    QueueStatus = "done"
	QueueStatusSkipped QueueStatus = "skipped"
)

// QueueTicket adalah tiket antrean layanan tatap muka.
type QueueTicket struct {
	Base
	Code       string      `gorm:"size:16;index;not null" json:"code"`
	UserID     uuid.UUID   `gorm:"type:uuid;index;not null" json:"user_id"`
	ServiceID  uuid.UUID   `gorm:"type:uuid;index;not null" json:"service_id"`
	Service    *Service    `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Location   string      `gorm:"size:120" json:"location"`
	Status     QueueStatus `gorm:"size:20;index;default:'waiting'" json:"status"`
	Number     int         `gorm:"not null" json:"number"`
	ServedAt   *time.Time  `json:"served_at,omitempty"`
	ScheduleAt time.Time   `json:"schedule_at"`
}

type ReportStatus string

const (
	ReportStatusOpen       ReportStatus = "open"
	ReportStatusInProgress ReportStatus = "in_progress"
	ReportStatusResolved   ReportStatus = "resolved"
	ReportStatusRejected   ReportStatus = "rejected"
)

// Report adalah aduan warga (fitur "Lapor!").
type Report struct {
	Base
	RefNumber   string                      `gorm:"size:32;uniqueIndex;not null" json:"ref_number"`
	UserID      uuid.UUID                   `gorm:"type:uuid;index;not null" json:"user_id"`
	Category    string                      `gorm:"size:60;index" json:"category"`
	Title       string                      `gorm:"size:160;not null" json:"title"`
	Description string                      `gorm:"type:text;not null" json:"description"`
	Location    string                      `gorm:"size:200" json:"location"`
	Latitude    *float64                    `json:"latitude,omitempty"`
	Longitude   *float64                    `json:"longitude,omitempty"`
	PhotoURLs   datatypes.JSONSlice[string] `json:"photo_urls"`
	Status      ReportStatus                `gorm:"size:20;index;default:'open'" json:"status"`
	Response    string                      `gorm:"type:text" json:"response"`
}

// ChatSession adalah percakapan dengan asisten AI.
type ChatSession struct {
	Base
	UserID   uuid.UUID     `gorm:"type:uuid;index;not null" json:"user_id"`
	Title    string        `gorm:"size:160" json:"title"`
	Messages []ChatMessage `gorm:"foreignKey:SessionID" json:"messages,omitempty"`
}

type ChatRole string

const (
	ChatRoleUser  ChatRole = "user"
	ChatRoleModel ChatRole = "model"
)

type ChatMessage struct {
	Base
	SessionID uuid.UUID `gorm:"type:uuid;index;not null" json:"session_id"`
	Role      ChatRole  `gorm:"size:10;not null" json:"role"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	// TokensUsed hanya terisi untuk balasan model.
	TokensUsed int `json:"tokens_used"`
}

func AllModels() []any {
	return []any{
		&User{}, &Service{}, &Application{}, &ApplicationEvent{},
		&QueueTicket{}, &Report{}, &ChatSession{}, &ChatMessage{},
	}
}
