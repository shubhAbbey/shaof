# ==============================================================================
# Multi-stage Production Dockerfile for @ecom/backend (Medusa v2.19.0)
# ==============================================================================

# --- Stage 1: Base Runtime Environment ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# --- Stage 2: Monorepo Dependencies Installation ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY apps/backend/package.json ./apps/backend/

RUN npm install --workspace=@ecom/backend --workspace=@ecom/config --workspace=@ecom/types --no-audit

# --- Stage 3: Build Monorepo Packages & Backend ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY apps/backend ./apps/backend

# Build shared packages and Medusa backend
RUN npm run build --workspace=packages/types && \
    npm run build --workspace=packages/config && \
    npm run build --workspace=apps/backend

# --- Stage 4: Minimal Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget libc6-compat

ENV NODE_ENV=production
ENV PORT=9000

# Create non-root system user and group
RUN addgroup --system --gid 1001 medusagroup && \
    adduser --system --uid 1001 medusauser

COPY --from=builder --chown=medusauser:medusagroup /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=medusauser:medusagroup /app/node_modules ./node_modules
COPY --from=builder --chown=medusauser:medusagroup /app/packages ./packages
COPY --from=builder --chown=medusauser:medusagroup /app/apps/backend ./apps/backend

USER medusauser

WORKDIR /app/apps/backend

EXPOSE 9000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:9000/health || exit 1

CMD ["npm", "run", "start"]
