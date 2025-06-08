# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git (for go mod) and build tools
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the Go app
RUN go build -o server ./cmd/api

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/server .

# Set environment variables as needed
ENV PORT=8080

EXPOSE 8080

# Start server (migrations will run automatically in Go code)
CMD ["./server"]
