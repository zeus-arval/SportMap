#!/bin/sh
set -e

if [ -n "${DOMAIN_FILE}" ] && [ -f "${DOMAIN_FILE}" ]; then
    DOMAIN=$(cat "${DOMAIN_FILE}")
    export DOMAIN
fi

: "${DOMAIN:?DOMAIN environment variable not set (or DOMAIN_FILE not readable)}"

envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Reload every 6h so renewed certs are picked up without a restart
(while :; do sleep 6h; nginx -s reload 2>/dev/null || true; done) &

exec "$@"
