#!/bin/sh
# 🚀 Tablawy OS - Frontend Entrypoint
# Dynamically injects environment variables into Nginx configuration

# Default values if not provided
export API_DOMAIN=${VITE_API_URL:-"http://localhost:8000"}
export SOCKET_DOMAIN=${VITE_SOCKET_URL:-"http://localhost:8000"}
export BACKEND_URL=${VITE_API_URL:-"http://localhost:8000"}
export SOCKET_URL=${VITE_SOCKET_URL:-"http://localhost:8000"}

echo "🔧 Injecting API_DOMAIN=$API_DOMAIN and SOCKET_DOMAIN=$SOCKET_DOMAIN into CSP..."
echo "🔧 Injecting BACKEND_URL=$BACKEND_URL and SOCKET_URL=$SOCKET_URL into Proxy..."

if [ ! -f /etc/nginx/nginx.conf.template ]; then
  echo "❌ CRITICAL: /etc/nginx/nginx.conf.template not found. Skipping envsubst."
else
  # Substitute variables in template and output to final config
  envsubst '${API_DOMAIN} ${SOCKET_DOMAIN} ${BACKEND_URL} ${SOCKET_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

if [ -f /etc/nginx/conf.d/security-headers.conf ]; then
  echo "🔧 Injecting into security-headers.conf..."
  envsubst '${API_DOMAIN} ${SOCKET_DOMAIN}' < /etc/nginx/conf.d/security-headers.conf > /etc/nginx/conf.d/security-headers.conf.tmp
  mv /etc/nginx/conf.d/security-headers.conf.tmp /etc/nginx/conf.d/security-headers.conf
fi

echo "🚀 Starting Nginx..."
exec "$@"
