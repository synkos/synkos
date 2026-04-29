# Synkos web — Dockerfile for Railway
# Build context must be the monorepo root.
# Railway settings:
#   Root Directory: /
#   Dockerfile Path: apps/web/Dockerfile

# ---------- deps ----------
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --filter web...

# ---------- build ----------
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web ./apps/web

RUN pnpm --filter web build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /repo/apps/web/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
