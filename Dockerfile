# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build (React -> Dist)
COPY . .
RUN npm run build

# --- STAGE 2: RUNNER (UNPRIVILEGED NGINX) ---
# 🛡️ SECURITY: Use unprivileged Nginx image to avoid running as root
FROM nginxinc/nginx-unprivileged:stable-alpine AS runner

# Copy the built React assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# 🚀 PERFORMANCE: Custom Nginx config for Single Page App (SPA) routing
# Configured for unprivileged user (listening on 8080)
RUN echo 'server { \
    listen 8080; \
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

# Port 8080 is standard for unprivileged nginx images
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
