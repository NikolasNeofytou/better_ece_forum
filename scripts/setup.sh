#!/bin/bash

# Better ECE Forum - Setup Script
# Sets up the complete development environment

echo "============================================"
echo "  Better ECE Forum - Setup"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a step
run_step() {
    local step_name=$1
    local step_command=$2
    
    echo -e "${BLUE}[Step]${NC} $step_name"
    
    if eval "$step_command"; then
        echo -e "${GREEN}✓${NC} $step_name completed"
        echo ""
        return 0
    else
        echo -e "${RED}✗${NC} $step_name failed"
        echo ""
        return 1
    fi
}

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7]${NC} Checking prerequisites..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Error:${NC} Node.js is not installed"
    exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}Error:${NC} npm is not installed"
    exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning:${NC} Docker is not installed (optional for local DB)"
fi
echo -e "${GREEN}✓${NC} Prerequisites checked"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/7]${NC} Installing dependencies..."
run_step "npm install" "npm install"

# Step 3: Setup environment
echo -e "${BLUE}[3/7]${NC} Setting up environment..."
if [ ! -f ".env" ]; then
    run_step "Copy .env.example to .env" "cp .env.example .env"
    echo -e "${YELLOW}!${NC} Please update .env with your configuration"
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi
echo ""

# Step 4: Generate Prisma client
echo -e "${BLUE}[4/7]${NC} Generating Prisma client..."
run_step "Prisma client generation" "npm run db:generate"

# Step 5: Start Docker services (optional)
echo -e "${BLUE}[5/7]${NC} Starting Docker services..."
if command -v docker >/dev/null 2>&1; then
    echo "Would you like to start PostgreSQL and Redis with Docker? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        run_step "Start Docker services" "npm run docker:up"
        echo "Waiting for services to be ready..."
        sleep 5
    else
        echo "Skipping Docker services"
        echo ""
    fi
else
    echo "Docker not available, skipping..."
    echo ""
fi

# Step 6: Push database schema (optional)
echo -e "${BLUE}[6/7]${NC} Database setup..."
if nc -z localhost 5432 2>/dev/null; then
    echo "PostgreSQL is running. Would you like to push the schema? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        run_step "Push database schema" "npm run db:push"
    else
        echo "Skipping database push"
        echo ""
    fi
else
    echo -e "${YELLOW}!${NC} PostgreSQL not running, skipping database setup"
    echo "  Run 'npm run docker:up' to start services"
    echo ""
fi

# Step 7: Verify installation
echo -e "${BLUE}[7/7]${NC} Verifying installation..."
run_step "Type check" "npm run type-check"
run_step "Lint check" "npm run lint"

# Summary
echo "============================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Update your .env file with your configuration"
echo "  2. Start the development server: npm run dev"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "  • View status:       ./scripts/status.sh"
echo "  • Run tests:         ./scripts/test.sh"
echo "  • Start services:    npm run docker:up"
echo "  • Stop services:     npm run docker:down"
echo "  • Database studio:   npm run db:studio"
echo ""
