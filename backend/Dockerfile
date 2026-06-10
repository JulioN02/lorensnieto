# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY prisma/ ./prisma/
COPY src/ ./src/
COPY docs/ ./docs/

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install tini for proper signal handling in containers
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 express

# Copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER express

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
