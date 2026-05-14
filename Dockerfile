# syntax=docker/dockerfile:1.7

# Build stage
FROM node:24-alpine AS build

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app
ARG PNPM_CACHE_ID=pnpm-store-networth

# Install dependencies first (before ARG/ENV) so layer cache and pnpm store cache
# are not invalidated when build-args (secrets) change between runs.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=${PNPM_CACHE_ID},target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

# Build-args and ENV only needed for 'pnpm run build', not for install
ARG AI_GATEWAY_API_KEY
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG POSTHOG_ENV_ID
ARG POSTHOG_PERSONAL_API_KEY
ARG USER_DATABASE_URL
ARG DATA_DATABASE_URL

ENV AI_GATEWAY_API_KEY=${AI_GATEWAY_API_KEY} \
    CLERK_SECRET_KEY=${CLERK_SECRET_KEY} \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST} \
    NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY} \
    POSTHOG_ENV_ID=${POSTHOG_ENV_ID} \
    POSTHOG_PERSONAL_API_KEY=${POSTHOG_PERSONAL_API_KEY} \
    USER_DATABASE_URL=${USER_DATABASE_URL} \
    DATA_DATABASE_URL=${DATA_DATABASE_URL}

# Copy source and build
COPY . .
RUN pnpm run build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Copy built output (standalone for smaller runtime)
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
