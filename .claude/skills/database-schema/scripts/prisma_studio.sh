#!/bin/bash
# Quick launcher for Prisma Studio with correct schema path
# This project uses a non-standard schema location: app/app/prisma/schema.prisma

set -e

SCHEMA_PATH="app/prisma/schema.prisma"

# Check if we're in the right directory
if [ ! -d "app" ]; then
    echo "Error: Must run from project root directory"
    exit 1
fi

# Change to app directory
cd app

echo "Opening Prisma Studio at http://localhost:5555"
echo "Running: npx prisma studio --schema=$SCHEMA_PATH"
npx prisma studio --schema="$SCHEMA_PATH"
