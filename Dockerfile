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

USER root
# Install envsubst (comes with gettext)
RUN apk add --no-cache gettext

# Copy the custom Nginx configuration template and entrypoint
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy the built React assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Switch back to unprivileged user
USER nginx

# Port 8080 is standard for unprivileged nginx images
EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
