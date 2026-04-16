# ---------------------------------------------------
# Stage 1: Build
# ---------------------------------------------------
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod and install dependencies
COPY go.mod ./
RUN go mod download

# Copy source code
COPY . .

# Build the app to a binary named 'main'
RUN go build -o main ./cmd/server/main.go

# ---------------------------------------------------
# Stage 2: Runtime
# ---------------------------------------------------
FROM alpine:latest

# Install basic tools (optional, like ca-certificates)
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy migrations so the app can run them if needed
COPY --from=builder /app/migrations ./migrations

# Set environment variables (can be overridden by compose)
ENV PORT=7772

EXPOSE 7772

# Run the binary
CMD ["./main"]
