FROM oven/bun:1.3.0 AS client
ARG VERSION
WORKDIR /work
COPY client/bun.lock client/package*.json .
RUN bun install
COPY client .
RUN VERSION=$VERSION bun run build


FROM golang:1.25-alpine AS server
ARG VERSION
WORKDIR /work
COPY server/go.* .
RUN go mod download
COPY server .
RUN GOOS=linux GOARCH=amd64 go build -ldflags "-X backend/config.Version=$VERSION -s -w" .


# Assemble the final image
FROM alpine
WORKDIR /app
COPY --from=client /work/dist client/dist
COPY --from=server /work/backend server/backend
WORKDIR server
EXPOSE 8080
CMD ["./backend"]
