#!/bin/sh
# 🚀 Tablawy OS - Frontend Entrypoint
# Dynamically injects environment variables into Nginx configuration

# Default values if not provided
export BACKEND_URL=$(echo ${VITE_API_URL:-"http://localhost:8000"} | sed 's:/*$::')
export SOCKET_URL=$(echo ${VITE_SOCKET_URL:-"http://localhost:8000"} | sed 's:/*$::')

# 🛡️ VALIDATION: Ensure BACKEND_URL and SOCKET_URL are valid formats
# Permissive regex allows internal Docker service names (e.g., http://backend_svc:8000)
# This prevents configuration injection into nginx.conf
if ! echo "$BACKEND_URL" | grep -qE '^https?://[a-zA-Z0-9._-]+(:[0-9]+)?$'; then
  echo "⚠️ WARNING: BACKEND_URL ($BACKEND_URL) does not appear to be a valid URL. Sanitizing..."
  BACKEND_URL=$(echo "$BACKEND_URL" | tr -cd 'a-zA-Z0-9._\-:/?')
fi

if ! echo "$SOCKET_URL" | grep -qE '^https?://[a-zA-Z0-9._-]+(:[0-9]+)?$'; then
  echo "⚠️ WARNING: SOCKET_URL ($SOCKET_URL) does not appear to be a valid URL. Sanitizing..."
  SOCKET_URL=$(echo "$SOCKET_URL" | tr -cd 'a-zA-Z0-9._\-:/?')
fi

echo "🔧 Injecting BACKEND_URL=$BACKEND_URL and SOCKET_URL=$SOCKET_URL into Configs..."

if [ ! -f /etc/nginx/nginx.conf.template ]; then
  echo "❌ CRITICAL: /etc/nginx/nginx.conf.template not found. This is a fatal error."
  exit 1
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
