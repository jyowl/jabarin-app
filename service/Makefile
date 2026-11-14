.PHONY: run build tidy fmt vet test docker-up docker-down

run:
	go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

tidy:
	go mod tidy

fmt:
	go fmt ./...

vet:
	go vet ./...

test:
	go test ./...

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
