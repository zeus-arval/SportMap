# nginx

Reverse proxy in front of `webfrontend` and `server`. TLS termination via Let's Encrypt; certbot runs on the host, certs are bind-mounted into the container.

## Routing

- `/api/*` → `server:8080`
- `/health` → `server:8080/health`
- `/.well-known/acme-challenge/*` → `/var/www/certbot` (for ACME http-01)
- `/*` → `webfrontend:3000`
- Port 80 redirects everything (except ACME challenges) to 443.

`${DOMAIN}` in `nginx.conf.template` is filled in at container start by `docker-entrypoint.sh` via `envsubst`.

## Setup on a new host
TBD 

## Bind mounts

The compose service mounts the host paths read-only:

- `/etc/letsencrypt` → `/etc/letsencrypt` (certs)
- `/var/www/certbot` → `/var/www/certbot` (ACME webroot)
