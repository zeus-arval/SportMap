#!/bin/sh
set -e

: "${DOMAIN:?DOMAIN environment variable not set}"

envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Reload every 6h so renewed certs are picked up without a restart
(while :; do sleep 6h; nginx -s reload 2>/dev/null || true; done) &

exec "$@"
