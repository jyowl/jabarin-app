FROM golang:1.24-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/api ./cmd/api

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata && adduser -D -u 10001 jabarin

WORKDIR /app
COPY --from=builder /out/api /app/api

USER jabarin
EXPOSE 8080

ENTRYPOINT ["/app/api"]
