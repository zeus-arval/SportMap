#!/bin/sh
set -e

read_secret() {
  local file="/run/secrets/$1"
  [ -f "$file" ] && cat "$file" || echo ""
}

PG_USER=$(read_secret postgres_username)
PG_PASS=$(read_secret postgres_password)

export ConnectionStrings__sportmapdb="Host=postgres;Port=5432;Database=sportmapdb;Username=${PG_USER};Password=${PG_PASS}"

exec "$@"
