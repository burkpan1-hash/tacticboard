FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_* env vars are baked into the client bundle at build time. Sentry DSN
# and PostHog key are designed to be public (they identify the project, they
# are not credentials) — safe to bake in. Fly secrets won't help here since
# they're runtime-only and `npm run build` runs in this image stage.
ARG VITE_SENTRY_DSN=""
ARG VITE_POSTHOG_KEY=""
ARG VITE_POSTHOG_HOST="https://us.i.posthog.com"
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/models ./src/models
COPY --from=builder /app/src/lib ./src/lib

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
