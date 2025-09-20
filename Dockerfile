# Use an official bASe image
FROM oven/bun:1.2.22-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/
COPY packages/shared-constants/package.json ./packages/shared-constants/
COPY packages/shared-validations/package.json ./packages/shared-validations/

# Install dependencies
RUN bun install --frozen-lockfile

FROM oven/bun:1.2.22-alpine AS builder

WORKDIR /app

COPY --from=deps /app ./

# Copy the rest of the application code
COPY . .

RUN bun run build

FROM oven/bun:1.2.22-alpine AS result

WORKDIR /app

COPY --from=builder /app/apps/client/dist/ ./dist/
COPY --from=builder /app/apps/server/server ./
COPY --from=builder /app/.env ./

# Expose the port your app runs on
EXPOSE 3001

CMD ["./server"]
