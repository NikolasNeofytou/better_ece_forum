#!/bin/bash

# Better ECE Forum - Development Script
# Quick script to start the development environment

echo "============================================"
echo "  Better ECE Forum - Starting Development"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error:${NC} .env file not found"
    echo "Run: cp .env.example .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Warning:${NC} node_modules not found"
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if Docker services are running
echo -e "${BLUE}[1/4]${NC} Checking services..."
if ! nc -z localhost 5432 2>/dev/null || ! nc -z localhost 6379 2>/dev/null; then
    echo -e "${YELLOW}!${NC} Services not running"
    echo "Starting Docker services..."
    npm run docker:up
    echo "Waiting for services to be ready..."
    sleep 5
else
    echo -e "${GREEN}✓${NC} Services already running"
fi
echo ""

# Generate Prisma client if needed
echo -e "${BLUE}[2/4]${NC} Checking Prisma client..."
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "Generating Prisma client..."
    npm run db:generate
else
    echo -e "${GREEN}✓${NC} Prisma client already generated"
fi
echo ""

# Push database schema if needed
echo -e "${BLUE}[3/4]${NC} Checking database schema..."
if nc -z localhost 5432 2>/dev/null; then
    echo "Pushing database schema..."
    npm run db:push 2>/dev/null || echo -e "${YELLOW}!${NC} Schema already up to date"
else
    echo -e "${RED}✗${NC} PostgreSQL not available"
fi
echo ""

# Start dev server
echo -e "${BLUE}[4/4]${NC} Starting Next.js dev server..."
echo ""
echo "============================================"
echo -e "${GREEN}✓ Development environment ready!${NC}"
echo "============================================"
echo ""
echo "Opening http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
