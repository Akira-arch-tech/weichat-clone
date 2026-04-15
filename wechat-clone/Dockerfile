# 单容器：Node 同时提供 API / WebSocket / 静态前端，适合 Render / Railway / Fly 等一键部署
FROM node:18-bullseye-slim AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=
ENV VITE_SOCKET_URL=
ENV VITE_BASE_PATH=/
RUN npm run build

FROM node:18-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
RUN mkdir -p data uploads
COPY --from=frontend-builder /app/dist ./public
ENV NODE_ENV=production
ENV STATIC_WEB_ROOT=/app/public
EXPOSE 3001
CMD ["node", "src/index.js"]
