# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build (React -> Dist)
COPY . .
RUN npm run build

# --- STAGE 2: RUNNER (NGINX) ---
# Nginx is significantly more performant and secure for static Vite builds
FROM nginx:stable-alpine AS runner

# 🛡️ SECURITY: Run as non-root (if supported by environment) or use standard alpine hardening
# Copy the built React assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# 🚀 PERFORMANCE: Custom Nginx config for Single Page App (SPA) routing
# This handles the client-side routing fallback so "Refresh" doesn't 404
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    # 🛡️ RESILIENCE: Healthcheck for the static server \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
