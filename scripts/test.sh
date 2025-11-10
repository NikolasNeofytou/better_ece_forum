#!/bin/bash

# Better ECE Forum - Testing Script
# Runs all tests and checks for the project

echo "============================================"
echo "  Better ECE Forum - Running Tests"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}[Running]${NC} $test_name"
    
    if eval "$test_command" > /tmp/test_output 2>&1; then
        echo -e "${GREEN}[PASSED]${NC} $test_name"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}[FAILED]${NC} $test_name"
        echo "Output:"
        cat /tmp/test_output | head -20
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error:${NC} node_modules not found. Run 'npm install' first."
    exit 1
fi

echo -e "${BLUE}[1/5]${NC} Type Checking"
run_test "TypeScript compilation" "npm run type-check"
echo ""

echo -e "${BLUE}[2/5]${NC} Linting"
run_test "ESLint checks" "npm run lint"
echo ""

echo -e "${BLUE}[3/5]${NC} Prisma Client"
run_test "Prisma client generation" "npm run db:generate"
echo ""

echo -e "${BLUE}[4/5]${NC} Build"
run_test "Production build" "npm run build"
echo ""

echo -e "${BLUE}[5/5]${NC} Package validation"
run_test "Package.json validation" "npm ls --depth=0 2>&1 | grep -q 'better-ece-forum'"
echo ""

# Summary
echo "============================================"
echo -e "${BLUE}Test Summary${NC}"
echo "============================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
