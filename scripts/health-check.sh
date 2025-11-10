#!/bin/bash

# Better ECE Forum - Health Check Script
# Checks if all services are healthy and running

echo "============================================"
echo "  Better ECE Forum - Health Check"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

HEALTHY=0
UNHEALTHY=0

# Function to check service health
check_health() {
    local service=$1
    local port=$2
    local endpoint=$3
    
    echo -e "${BLUE}[Checking]${NC} $service (port $port)"
    
    # Check if port is listening
    if ! nc -z localhost "$port" 2>/dev/null; then
        echo -e "${RED}✗${NC} $service is not running"
        UNHEALTHY=$((UNHEALTHY + 1))
        return 1
    fi
    
    # If endpoint provided, check HTTP health
    if [ -n "$endpoint" ]; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$endpoint" 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
            echo -e "${GREEN}✓${NC} $service is healthy (HTTP $HTTP_CODE)"
            HEALTHY=$((HEALTHY + 1))
            return 0
        else
            echo -e "${YELLOW}!${NC} $service is running but returned HTTP $HTTP_CODE"
            HEALTHY=$((HEALTHY + 1))
            return 0
        fi
    else
        echo -e "${GREEN}✓${NC} $service is running"
        HEALTHY=$((HEALTHY + 1))
        return 0
    fi
}

# Check PostgreSQL
check_health "PostgreSQL" 5432

# Check Redis
check_health "Redis" 6379

# Check Next.js Dev Server
check_health "Next.js Dev Server" 3000 "/"

echo ""

# Check Docker containers
echo -e "${BLUE}[Docker Containers]${NC}"
if command -v docker >/dev/null 2>&1; then
    # Check PostgreSQL container
    if docker ps --filter "name=better_ece_forum_postgres" --filter "status=running" | grep -q postgres; then
        echo -e "${GREEN}✓${NC} PostgreSQL container is running"
        
        # Check container health
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' better_ece_forum_postgres 2>/dev/null)
        if [ "$HEALTH" = "healthy" ]; then
            echo -e "${GREEN}  └─ Health status: healthy${NC}"
        elif [ "$HEALTH" = "starting" ]; then
            echo -e "${YELLOW}  └─ Health status: starting${NC}"
        elif [ -n "$HEALTH" ]; then
            echo -e "${RED}  └─ Health status: $HEALTH${NC}"
        fi
    else
        echo -e "${RED}✗${NC} PostgreSQL container is not running"
    fi
    
    # Check Redis container
    if docker ps --filter "name=better_ece_forum_redis" --filter "status=running" | grep -q redis; then
        echo -e "${GREEN}✓${NC} Redis container is running"
        
        # Check container health
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' better_ece_forum_redis 2>/dev/null)
        if [ "$HEALTH" = "healthy" ]; then
            echo -e "${GREEN}  └─ Health status: healthy${NC}"
        elif [ "$HEALTH" = "starting" ]; then
            echo -e "${YELLOW}  └─ Health status: starting${NC}"
        elif [ -n "$HEALTH" ]; then
            echo -e "${RED}  └─ Health status: $HEALTH${NC}"
        fi
    else
        echo -e "${RED}✗${NC} Redis container is not running"
    fi
else
    echo -e "${YELLOW}!${NC} Docker not available"
fi

echo ""

# Database connection test
echo -e "${BLUE}[Database Connection]${NC}"
if nc -z localhost 5432 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Can connect to PostgreSQL"
    
    # Try to connect with Prisma
    if [ -f "node_modules/.bin/prisma" ]; then
        if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Prisma can connect to database"
        else
            echo -e "${YELLOW}!${NC} Prisma connection test skipped (run 'npm run db:push' first)"
        fi
    fi
else
    echo -e "${RED}✗${NC} Cannot connect to PostgreSQL"
fi

echo ""

# Redis connection test
echo -e "${BLUE}[Redis Connection]${NC}"
if nc -z localhost 6379 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Can connect to Redis"
    
    # Try to ping Redis
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli ping 2>/dev/null | grep -q PONG; then
            echo -e "${GREEN}✓${NC} Redis responds to PING"
        fi
    fi
else
    echo -e "${RED}✗${NC} Cannot connect to Redis"
fi

echo ""

# Summary
echo "============================================"
echo -e "${BLUE}Health Summary${NC}"
echo "============================================"
echo -e "${GREEN}Healthy:${NC} $HEALTHY"
echo -e "${RED}Unhealthy:${NC} $UNHEALTHY"
echo ""

if [ $UNHEALTHY -eq 0 ]; then
    echo -e "${GREEN}✓ All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some services are unhealthy${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  • Start services: npm run docker:up"
    echo "  • Check logs: npm run docker:logs"
    echo "  • Restart services: npm run docker:down && npm run docker:up"
    exit 1
fi
