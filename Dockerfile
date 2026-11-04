# Stage 1: Build assets
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

# Stage 2: Production runtime
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

COPY package.json bun.lock* ./
RUN bun install --production

COPY --from=builder /app/public/build ./public/build
COPY --from=builder /app/resources/views ./resources/views
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

RUN mkdir -p /app/public/avatars

EXPOSE 8000

CMD ["bun", "run", "start"]
