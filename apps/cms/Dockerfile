# ==============================================================================
# Multi-stage Production Dockerfile for @ecom/cms (Strapi v5.52.1)
# ==============================================================================

# --- Stage 1: Base Runtime Environment ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev
WORKDIR /app

# --- Stage 2: Monorepo Dependencies Installation ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY apps/cms/package.json ./apps/cms/

RUN npm install --workspace=@ecom/cms --workspace=@ecom/config --workspace=@ecom/types --no-audit

# --- Stage 3: Build Monorepo Packages & Strapi ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY apps/cms ./apps/cms

RUN npm run build --workspace=packages/types && \
    npm run build --workspace=packages/config && \
    npm run build --workspace=apps/cms

# --- Stage 4: Minimal Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget libc6-compat vips

ENV NODE_ENV=production
ENV PORT=1337

RUN addgroup --system --gid 1001 strapigroup && \
    adduser --system --uid 1001 strapiuser

COPY --from=builder --chown=strapiuser:strapigroup /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=strapiuser:strapigroup /app/node_modules ./node_modules
COPY --from=builder --chown=strapiuser:strapigroup /app/packages ./packages
COPY --from=builder --chown=strapiuser:strapigroup /app/apps/cms ./apps/cms

USER strapiuser

WORKDIR /app/apps/cms

EXPOSE 1337

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:1337/_health || exit 1

CMD ["npm", "run", "start"]
