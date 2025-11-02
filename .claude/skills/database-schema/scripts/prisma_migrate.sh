#!/bin/bash
# Wrapper script for Prisma migrate commands with correct schema path
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

case "$1" in
    dev)
        shift
        echo "Running: npx prisma migrate dev --schema=$SCHEMA_PATH $@"
        npx prisma migrate dev --schema="$SCHEMA_PATH" "$@"
        ;;
    deploy)
        echo "Running: npx prisma migrate deploy --schema=$SCHEMA_PATH"
        npx prisma migrate deploy --schema="$SCHEMA_PATH"
        ;;
    reset)
        echo "WARNING: This will delete all data and re-run all migrations"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Running: npx prisma migrate reset --schema=$SCHEMA_PATH"
            npx prisma migrate reset --schema="$SCHEMA_PATH"
        else
            echo "Cancelled"
            exit 1
        fi
        ;;
    status)
        echo "Running: npx prisma migrate status --schema=$SCHEMA_PATH"
        npx prisma migrate status --schema="$SCHEMA_PATH"
        ;;
    *)
        echo "Usage: $0 {dev|deploy|reset|status} [options]"
        echo ""
        echo "Commands:"
        echo "  dev --name <name>  Create and apply migration in development"
        echo "  deploy             Apply pending migrations in production"
        echo "  reset              Reset database and re-run all migrations"
        echo "  status             Check migration status"
        echo ""
        echo "Examples:"
        echo "  $0 dev --name add_user_field"
        echo "  $0 deploy"
        echo "  $0 status"
        exit 1
        ;;
esac
