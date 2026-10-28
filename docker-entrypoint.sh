#!/bin/sh
set -e

# Run database migrations if DATABASE_URL is configured
if [ -n "$DATABASE_URL" ]; then
  echo "==> Running Prisma database migrations (deploy)..."
  npx prisma migrate deploy || {
    echo "==> Migration failed or database not ready yet."
    exit 1
  }
fi

echo "==> Starting application server..."
exec "$@"
