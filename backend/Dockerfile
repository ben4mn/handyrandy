# Multi-stage build
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the React app
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-build

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm install

# Copy backend source code
COPY backend/ .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Stage 3: Final runtime image
FROM node:18-alpine

WORKDIR /app

# Copy built backend from backend-build stage
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/package*.json ./

# Copy built frontend from frontend-build stage
COPY --from=frontend-build /app/frontend/build ./frontend-build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create data directory for SQLite
RUN mkdir -p /app/data
RUN chown -R nextjs:nodejs /app/data
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/api/health || exit 1

# Start the application
CMD ["npm", "start"]