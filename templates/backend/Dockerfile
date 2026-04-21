# ─── Stage 1: Install all dependencies ────────────────────────────────────────
# Installs dev + prod deps so TypeScript compiler and build tools are available.
FROM node:22-alpine AS deps
RUN npm install -g pnpm@10 --quiet
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Compile TypeScript ──────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx tsc -p tsconfig.build.json && npx tsc-alias -p tsconfig.build.json

# ─── Stage 3: Production runtime ──────────────────────────────────────────────
# Reinstalls prod deps from scratch so native modules are compiled for the
# final target platform (linux-musl on Alpine).
FROM node:22-alpine AS runner

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Non-root user — drops privileges before the process starts
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs api

# Production deps only
RUN npm install -g pnpm@10 --quiet
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Compiled output from the builder stage
COPY --from=builder /app/dist ./dist

USER api

EXPOSE 3001

# /health/live returns 200 as soon as the process is up (no DB dependency)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/health/live || exit 1

# Default target: HTTP API server.
# Override with: docker run ... node dist/worker.js
CMD ["node", "dist/server.js"]
