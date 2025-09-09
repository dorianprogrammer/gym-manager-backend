# Multi-stage build for smaller production image
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .

# Run as non-root
RUN addgroup -S app && adduser -S app -G app
USER app
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "--enable-source-maps", "src/server.js"]
