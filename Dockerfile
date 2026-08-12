# ==========================================
# Stage 1: Build Frontend and Server
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend and bundle Express server into dist/server.cjs
RUN npm run build

# ==========================================
# Stage 2: Production Execution
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json to install production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Create persistent storage directories for data & media
RUN mkdir -p /app/data /app/media/audios && chown -R node:node /app

# Run as non-root node user for container security
USER node

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
