# Use Bun's official Alpine image for smaller size
FROM oven/bun:alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Build the application
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY package.json bun.lockb* ./
COPY . .

# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Build the application
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 bunjs

# Copy built application and production dependencies
COPY --from=deps --chown=bunjs:bunjs /app/node_modules ./node_modules
COPY --from=builder --chown=bunjs:bunjs /app/dist ./dist
COPY --from=builder --chown=bunjs:bunjs /app/package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4001

# Switch to non-root user
USER bunjs

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Start the application
CMD ["bun", "run", "dist/index.js"]