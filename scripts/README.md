# Better ECE Forum - Scripts

This directory contains utility scripts to help you test, manage, and monitor the Better ECE Forum project.

## Available Scripts

### 🔍 `status.sh` - Project Status
Displays the current status of the entire project including:
- System requirements (Node.js, npm, Docker)
- Installed dependencies
- Environment configuration
- Running services (PostgreSQL, Redis, Next.js)
- Docker containers
- Project structure
- Git status

**Usage:**
```bash
./scripts/status.sh
```

**Example Output:**
```
============================================
  Better ECE Forum - Project Status
============================================

[System Requirements]
✓ Node.js: v20.x.x
✓ npm: 10.x.x
✓ Docker: 24.x.x

[Services]
✓ PostgreSQL (port 5432)
✓ Redis (port 6379)
✗ Next.js Dev Server (port 3000)
```

---

### 🧪 `test.sh` - Run All Tests
Runs comprehensive tests including:
- TypeScript compilation check
- ESLint code quality checks
- Prisma client generation
- Production build test
- Package validation

**Usage:**
```bash
./scripts/test.sh
```

**Example Output:**
```
============================================
  Better ECE Forum - Running Tests
============================================

[1/5] Type Checking
[PASSED] TypeScript compilation

[2/5] Linting
[PASSED] ESLint checks

Test Summary
============================================
Passed: 5
Failed: 0

✓ All tests passed!
```

---

### 🚀 `setup.sh` - Initial Setup
Interactive setup script that:
1. Checks prerequisites
2. Installs npm dependencies
3. Creates .env file
4. Generates Prisma client
5. Optionally starts Docker services
6. Optionally pushes database schema
7. Verifies installation

**Usage:**
```bash
./scripts/setup.sh
```

**When to use:**
- First time setting up the project
- After cloning the repository
- When you need a fresh installation

---

### 💚 `health-check.sh` - Service Health Check
Checks if all services are healthy:
- PostgreSQL connection and health
- Redis connection and health
- Next.js dev server availability
- Docker container status
- Database connectivity test

**Usage:**
```bash
./scripts/health-check.sh
```

**Example Output:**
```
============================================
  Better ECE Forum - Health Check
============================================

[Checking] PostgreSQL (port 5432)
✓ PostgreSQL is healthy

[Checking] Redis (port 6379)
✓ Redis is healthy

Health Summary
============================================
Healthy: 3
Unhealthy: 0

✓ All services are healthy!
```

---

### 🔨 `dev.sh` - Quick Development Start
Quick script to start development environment:
1. Checks for .env file
2. Installs dependencies if needed
3. Starts Docker services if not running
4. Generates Prisma client
5. Pushes database schema
6. Starts Next.js dev server

**Usage:**
```bash
./scripts/dev.sh
```

**When to use:**
- Daily development workflow
- Quick project startup
- After pulling new changes

---

## Making Scripts Executable

Before running scripts, make them executable:

```bash
chmod +x scripts/*.sh
```

Or individually:

```bash
chmod +x scripts/status.sh
chmod +x scripts/test.sh
chmod +x scripts/setup.sh
chmod +x scripts/health-check.sh
chmod +x scripts/dev.sh
```

## Quick Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `status.sh` | View project status | Check what's running |
| `test.sh` | Run all tests | Before committing |
| `setup.sh` | Initial setup | First time setup |
| `health-check.sh` | Check service health | Troubleshooting |
| `dev.sh` | Start development | Daily workflow |

## Workflow Examples

### First Time Setup
```bash
# 1. Run setup
./scripts/setup.sh

# 2. Check status
./scripts/status.sh

# 3. Start development
npm run dev
```

### Daily Development
```bash
# Quick start
./scripts/dev.sh

# Or manually
npm run docker:up
npm run dev
```

### Before Committing
```bash
# Run tests
./scripts/test.sh

# Check status
./scripts/status.sh
```

### Troubleshooting
```bash
# Check health
./scripts/health-check.sh

# View status
./scripts/status.sh

# Restart services
npm run docker:down
npm run docker:up
```

## Environment Variables

Make sure your `.env` file is configured correctly. Key variables:

```env
DATABASE_URL=******localhost:5432/better_ece_forum
REDIS_URL=redis://localhost:6379
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Dependencies

These scripts require:
- Bash shell
- `nc` (netcat) for port checking
- `curl` for HTTP health checks (optional)
- `docker` and `docker-compose` (optional, for container management)

## Notes

- All scripts provide colored output for better readability
- Scripts check for errors and provide helpful messages
- Docker commands are optional if you're using external databases
- Scripts are safe to run multiple times

## Getting Help

If a script fails:
1. Read the error message carefully
2. Check the project status: `./scripts/status.sh`
3. Check service health: `./scripts/health-check.sh`
4. View Docker logs: `npm run docker:logs`
5. Check the main README for detailed setup instructions

## Contributing

When adding new scripts:
1. Follow the existing naming convention
2. Add colored output using the color codes defined
3. Include error handling
4. Document the script in this README
5. Make sure it's executable
