# Build Stage
FROM golang:1.21-alpine AS builder

# Install build tools for CGO / SQLite3
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY . .
RUN go mod tidy && go mod download

RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o main .

# Run Stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates sqlite-libs tzdata

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
