# Multi-stage Dockerfile for DeepHub AI
# =====================================================
# Stage 1: Build the React/Vite Frontend
# =====================================================
FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY public ./public
COPY index.html .
COPY vite.config.js .
COPY tailwind.config.cjs .
COPY postcss.config.cjs .
COPY tsconfig.json .
RUN npm run build

# =====================================================
# Stage 2: Production Runtime (Backend + Served Frontend)
# =====================================================
FROM public.ecr.aws/docker/library/node:20-alpine
WORKDIR /app

# Install production node dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Install tsx globally for running TypeScript server files
RUN npm install -g tsx

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy backend source files ONLY — never copy .env (secrets come from ECS task env / Secrets Manager)
COPY server.ts .
COPY server ./server

# Expose the application port
EXPOSE 3001

# Health check so ECS/ALB knows the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["tsx", "server.ts"]
