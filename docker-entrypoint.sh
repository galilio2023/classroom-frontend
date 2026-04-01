#!/bin/sh
# 🚀 Tablawy OS - Frontend Entrypoint
# Dynamically injects environment variables into Nginx configuration

# Default values if not provided
export API_DOMAIN=${VITE_API_URL:-"http://localhost:8000"}
export SOCKET_DOMAIN=${VITE_SOCKET_URL:-"http://localhost:8000"}

echo "🔧 Injecting API_DOMAIN=$API_DOMAIN and SOCKET_DOMAIN=$SOCKET_DOMAIN into CSP..."

# Substitute variables in template and output to final config
envsubst '${API_DOMAIN} ${SOCKET_DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "🚀 Starting Nginx..."
exec "$@"
