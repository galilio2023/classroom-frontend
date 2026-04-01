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

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Port 8080 is standard for unprivileged nginx images
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
