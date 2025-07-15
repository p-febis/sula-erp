#!/bin/bash
set -e

# Load .env variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set in .env"
  exit 1
fi

export PGPASSWORD=$DB_PASSWORD
SQL_FILE="./db/init/seed.sql"

echo "Running seed SQL script on..."

psql $DATABASE_URL -f "$SQL_FILE"

echo "Seeding complete."
