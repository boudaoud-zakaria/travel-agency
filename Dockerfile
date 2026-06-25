# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Build the React frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install root dependencies (Vite + React deps)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build
# Output: /app/dist  (configured in vite.config.ts)


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Build the Express backend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Install server dependencies
COPY server/package.json server/package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and compile TypeScript
COPY server/ .
RUN npm run build
# Output: /app/server/dist


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 – Production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled backend
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/package.json ./package.json

# Copy built frontend into the "public" directory the server will serve
COPY --from=frontend-builder /app/dist ./public

# Create the SQLite data directory and uploads directory, owned by appuser
RUN mkdir -p .local uploads && chown -R appuser:appgroup /app

USER appuser

# Environment defaults (override via docker-compose / Render / Railway env vars)
ENV NODE_ENV=production
ENV PORT=3001
ENV STATIC_DIR=/app/public

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
