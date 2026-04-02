#!/bin/sh
# 🚀 Tablawy OS - Frontend Entrypoint
# Dynamically injects environment variables into Nginx configuration

# Default values if not provided
export BACKEND_URL=$(echo ${VITE_API_URL:-"http://localhost:8000"} | sed 's:/*$::')
export SOCKET_URL=$(echo ${VITE_SOCKET_URL:-"http://localhost:8000"} | sed 's:/*$::')

# 🛡️ VALIDATION: Ensure BACKEND_URL is a valid format to prevent Nginx startup failures
if ! echo "$BACKEND_URL" | grep -qE '^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$'; then
  echo "⚠️ WARNING: BACKEND_URL ($BACKEND_URL) does not appear to be a valid URL. Nginx might fail to start."
fi

echo "🔧 Injecting BACKEND_URL=$BACKEND_URL and SOCKET_URL=$SOCKET_URL into Configs..."

if [ ! -f /etc/nginx/nginx.conf.template ]; then
  echo "❌ CRITICAL: /etc/nginx/nginx.conf.template not found. Skipping envsubst."
else
  # Substitute variables in template and output to final config
  envsubst '${BACKEND_URL} ${SOCKET_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

if [ -f /etc/nginx/conf.d/security-headers.conf ]; then
  echo "🔧 Injecting into security-headers.conf..."
  envsubst '${BACKEND_URL} ${SOCKET_URL}' < /etc/nginx/conf.d/security-headers.conf > /etc/nginx/conf.d/security-headers.conf.tmp
  mv /etc/nginx/conf.d/security-headers.conf.tmp /etc/nginx/conf.d/security-headers.conf
fi

echo "🚀 Starting Nginx..."
exec "$@"
