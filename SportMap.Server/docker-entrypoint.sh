#!/bin/sh
set -e

read_secret() {
  local file="/run/secrets/$1"
  [ -f "$file" ] && cat "$file" || echo ""
}

PG_USER=$(read_secret postgres_username)
PG_PASS=$(read_secret postgres_password)
REDIS_PASS=$(read_secret redis_password)

export ConnectionStrings__sportmapdb="Host=postgres;Port=5432;Database=sportmapdb;Username=${PG_USER};Password=${PG_PASS}"
export ConnectionStrings__redis="redis:6379,password=${REDIS_PASS}"
export Jwt__SecretKey=$(read_secret jwt_secret)
export Jwt__Issuer=$(read_secret jwt_issuer)
export Jwt__Audience=$(read_secret jwt_audience)
export Google__ClientId=$(read_secret google_client_id)
export Google__ClientSecret=$(read_secret google_client_secret)
export Google__RedirectUri=$(read_secret google_redirect_uri)
export Frontend__Url=$(read_secret frontend_url)

exec "$@"
