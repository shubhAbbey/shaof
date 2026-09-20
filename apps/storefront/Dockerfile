# ==============================================================================
# Multi-stage Production Dockerfile for @ecom/storefront (Next.js 14)
# ==============================================================================

# --- Stage 1: Base Runtime Environment ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Stage 2: Monorepo Dependencies Installation ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY apps/storefront/package.json ./apps/storefront/

RUN npm install --workspace=@ecom/storefront --workspace=@ecom/config --workspace=@ecom/types --no-audit

# --- Stage 3: Build Monorepo Packages & Storefront ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY apps/storefront ./apps/storefront

# Build shared packages
RUN npm run build --workspace=packages/types && \
    npm run build --workspace=packages/config

# Environment flags for Next.js build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Client-exposed public variables baked into Next.js client bundles during build
ARG NEXT_PUBLIC_SITE_URL=https://ateevra.com
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://ateevra.com
ARG NEXT_PUBLIC_STRAPI_API_URL=https://cms.ateevra.com
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_placeholder
ARG MEDUSA_INTERNAL_URL=http://medusa:9000

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV MEDUSA_INTERNAL_URL=$MEDUSA_INTERNAL_URL

# Build Next.js storefront
RUN npm run build --workspace=apps/storefront

# --- Stage 4: Minimal Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy root package manifests and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront ./apps/storefront

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["npm", "run", "start", "--workspace=apps/storefront"]
