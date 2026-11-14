package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultBaseURL = "https://generativelanguage.googleapis.com/v1beta"

var ErrNoAPIKey = errors.New("gemini: GEMINI_API_KEY belum dikonfigurasi")

// Client adalah klien minimal untuk Gemini API (Google AI Studio).
type Client struct {
	apiKey  string
	model   string
	baseURL string
	http    *http.Client
}

func NewClient(apiKey, model string) *Client {
	if model == "" {
		model = "gemini-2.5-flash"
	}
	return &Client{
		apiKey:  apiKey,
		model:   model,
		baseURL: defaultBaseURL,
		http:    &http.Client{Timeout: 60 * time.Second},
	}
}

func (c *Client) Enabled() bool { return c.apiKey != "" }

func (c *Client) Model() string { return c.model }

type Part struct {
	Text string `json:"text"`
}

type Content struct {
	Role  string `json:"role,omitempty"`
	Parts []Part `json:"parts"`
}

type GenerationConfig struct {
	Temperature     float64 `json:"temperature,omitempty"`
	TopP            float64 `json:"topP,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type generateRequest struct {
	Contents          []Content         `json:"contents"`
	SystemInstruction *Content          `json:"systemInstruction,omitempty"`
	GenerationConfig  *GenerationConfig `json:"generationConfig,omitempty"`
}

type generateResponse struct {
	Candidates []struct {
		Content      Content `json:"content"`
		FinishReason string  `json:"finishReason"`
	} `json:"candidates"`
	PromptFeedback *struct {
		BlockReason string `json:"blockReason"`
	} `json:"promptFeedback"`
	UsageMetadata struct {
		PromptTokenCount     int `json:"promptTokenCount"`
		CandidatesTokenCount int `json:"candidatesTokenCount"`
		TotalTokenCount      int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error"`
}

type Result struct {
	Text         string
	TotalTokens  int
	FinishReason string
}

// GenerateContent memanggil endpoint :generateContent dengan riwayat percakapan.
func (c *Client) GenerateContent(ctx context.Context, systemPrompt string, history []Content, cfg *GenerationConfig) (*Result, error) {
	if !c.Enabled() {
		return nil, ErrNoAPIKey
	}
	if len(history) == 0 {
		return nil, errors.New("gemini: riwayat percakapan kosong")
	}

	payload := generateRequest{Contents: history, GenerationConfig: cfg}
	if strings.TrimSpace(systemPrompt) != "" {
		payload.SystemInstruction = &Content{Parts: []Part{{Text: systemPrompt}}}
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("gemini: encode request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/models/%s:generateContent", c.baseURL, url.PathEscape(c.model))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("gemini: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gemini: call api: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return nil, fmt.Errorf("gemini: read response: %w", err)
	}

	var parsed generateResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, fmt.Errorf("gemini: decode response (status %d): %w", resp.StatusCode, err)
	}
	if parsed.Error != nil {
		return nil, fmt.Errorf("gemini: %s (%d)", parsed.Error.Message, parsed.Error.Code)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini: status %d", resp.StatusCode)
	}
	if parsed.PromptFeedback != nil && parsed.PromptFeedback.BlockReason != "" {
		return nil, fmt.Errorf("gemini: prompt diblokir (%s)", parsed.PromptFeedback.BlockReason)
	}
	if len(parsed.Candidates) == 0 {
		return nil, errors.New("gemini: tidak ada kandidat jawaban")
	}

	var sb strings.Builder
	for _, part := range parsed.Candidates[0].Content.Parts {
		sb.WriteString(part.Text)
	}

	return &Result{
		Text:         strings.TrimSpace(sb.String()),
		TotalTokens:  parsed.UsageMetadata.TotalTokenCount,
		FinishReason: parsed.Candidates[0].FinishReason,
	}, nil
}
