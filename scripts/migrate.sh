#!/bin/bash

# Migration script for Prepilot deployment
# This script runs database migrations before starting the server

set -e  # Exit on any error

echo "🚀 Starting Prepilot deployment migration process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 DATABASE_URL is configured"

# Wait for database to be ready (especially important for Railway)
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if migrate -path ./internal/db/migrations -database "$DATABASE_URL" version > /dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    echo "🔄 Attempt $i: Database not ready yet, waiting 2 seconds..."
    sleep 2
done

# Check current migration version
echo "🔍 Checking current migration version..."
CURRENT_VERSION=$(migrate -path ./internal/db/migrations -database "$DATABASE_URL" version 2>/dev/null || echo "0")
echo "📋 Current migration version: $CURRENT_VERSION"

# Run migrations
echo "🔄 Running database migrations..."
migrate -path ./internal/db/migrations -database "$DATABASE_URL" up

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
    
    # Check new version
    NEW_VERSION=$(migrate -path ./internal/db/migrations -database "$DATABASE_URL" version 2>/dev/null || echo "unknown")
    echo "📊 New migration version: $NEW_VERSION"
else
    echo "❌ Database migrations failed"
    exit 1
fi

# Log migration files for debugging
echo "📁 Available migration files:"
ls -la ./internal/db/migrations/

# Start the server
echo "🚀 Starting Prepilot server..."
echo "🌐 Server will be available on port ${PORT:-8080}"
echo "🔧 Environment: ${ENV:-development}"

# Execute the server
exec ./server