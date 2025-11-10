#!/bin/bash

# Better ECE Forum - Project Status Script
# This script displays the current status of the project

echo "============================================"
echo "  Better ECE Forum - Project Status"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check service status
check_service() {
    local service=$1
    local port=$2
    if nc -z localhost "$port" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $service (port $port)"
        return 0
    else
        echo -e "${RED}✗${NC} $service (port $port)"
        return 1
    fi
}

# Check Node.js and npm
echo -e "${BLUE}[System Requirements]${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js: Not installed"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm: Not installed"
fi

if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "${GREEN}✓${NC} Docker: $DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker: Not installed"
fi

if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
    echo -e "${GREEN}✓${NC} Docker Compose: $COMPOSE_VERSION"
else
    echo -e "${RED}✗${NC} Docker Compose: Not installed"
fi

echo ""

# Check if dependencies are installed
echo -e "${BLUE}[Dependencies]${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
    PACKAGE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "  └─ $((PACKAGE_COUNT - 1)) packages"
else
    echo -e "${RED}✗${NC} Node modules not installed (run: npm install)"
fi

if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Prisma client generated"
else
    echo -e "${RED}✗${NC} Prisma client not generated (run: npm run db:generate)"
fi

echo ""

# Check environment configuration
echo -e "${BLUE}[Configuration]${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check key environment variables
    if grep -q "DATABASE_URL" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configured"
    else
        echo -e "${YELLOW}!${NC} DATABASE_URL not found in .env"
    fi
    
    if grep -q "AUTH_SECRET" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} AUTH_SECRET configured"
    else
        echo -e "${YELLOW}!${NC} AUTH_SECRET not found in .env"
    fi
    
    if grep -q "REDIS_URL" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} REDIS_URL configured"
    else
        echo -e "${YELLOW}!${NC} REDIS_URL not found in .env"
    fi
else
    echo -e "${RED}✗${NC} .env file missing (copy from .env.example)"
fi

echo ""

# Check services
echo -e "${BLUE}[Services]${NC}"
check_service "PostgreSQL" 5432
check_service "Redis" 6379
check_service "Next.js Dev Server" 3000

echo ""

# Check Docker containers
echo -e "${BLUE}[Docker Containers]${NC}"
if command_exists docker; then
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "better_ece_forum"; then
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep "better_ece_forum" | while read -r line; do
            echo -e "${GREEN}✓${NC} $line"
        done
    else
        echo -e "${YELLOW}!${NC} No Better ECE Forum containers running"
        echo "  └─ Run 'npm run docker:up' to start services"
    fi
else
    echo -e "${YELLOW}!${NC} Docker not available"
fi

echo ""

# Check project structure
echo -e "${BLUE}[Project Structure]${NC}"
[ -d "src/app" ] && echo -e "${GREEN}✓${NC} Next.js App directory"
[ -d "src/lib" ] && echo -e "${GREEN}✓${NC} Library utilities"
[ -d "src/lib/auth" ] && echo -e "${GREEN}✓${NC} Authentication system"
[ -d "src/app/api/auth" ] && echo -e "${GREEN}✓${NC} Auth API routes"
[ -d "src/app/auth" ] && echo -e "${GREEN}✓${NC} Auth pages (signin/signup)"
[ -d "prisma" ] && echo -e "${GREEN}✓${NC} Prisma schema"
[ -d ".github/workflows" ] && echo -e "${GREEN}✓${NC} GitHub Actions CI"

echo ""

# Git status
echo -e "${BLUE}[Git Status]${NC}"
BRANCH=$(git branch --show-current 2>/dev/null)
if [ -n "$BRANCH" ]; then
    echo -e "${GREEN}✓${NC} Current branch: $BRANCH"
    
    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Working tree clean"
    else
        CHANGED=$(git status --short | wc -l)
        echo -e "${YELLOW}!${NC} $CHANGED file(s) with changes"
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
fi

echo ""

# Summary
echo -e "${BLUE}[Quick Actions]${NC}"
echo "  • Start services:    npm run docker:up"
echo "  • Generate Prisma:   npm run db:generate"
echo "  • Push schema to DB: npm run db:push"
echo "  • Start dev server:  npm run dev"
echo "  • Run tests:         npm run test"
echo "  • Type check:        npm run type-check"
echo "  • Lint code:         npm run lint"
echo "  • Build project:     npm run build"

echo ""
echo "============================================"
