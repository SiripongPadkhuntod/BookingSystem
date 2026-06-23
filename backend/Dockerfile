FROM golang:1.23-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /booking-api ./cmd/api

FROM alpine:3.21
WORKDIR /app
COPY --from=build /booking-api /usr/local/bin/booking-api
EXPOSE 8080
CMD ["booking-api"]
