#!/bin/bash
# Generate Prisma client with correct schema path
# This project uses a non-standard schema location: app/app/prisma/schema.prisma
# Generated client outputs to: app/app/generated/prisma/

set -e

SCHEMA_PATH="app/prisma/schema.prisma"

# Check if we're in the right directory
if [ ! -d "app" ]; then
    echo "Error: Must run from project root directory"
    exit 1
fi

# Change to app directory
cd app

echo "Generating Prisma client..."
echo "Running: npx prisma generate --schema=$SCHEMA_PATH"
npx prisma generate --schema="$SCHEMA_PATH"

echo ""
echo "✅ Prisma client generated successfully!"
echo "Import with: import { PrismaClient } from '@/generated/prisma/client'"
