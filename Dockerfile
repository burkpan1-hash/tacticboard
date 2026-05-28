FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/models ./src/models

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
