# Better ECE Forum

A modern, feature-rich forum platform to replace the outdated NTUA School of Electrical and Computer Engineering forum (https://shmmy.ntua.gr/forum/index.php).

## 📋 Project Overview

This project aims to create a modern student forum with the best features from top platforms like Stack Overflow, Reddit, Discourse, and Piazza, tailored specifically for engineering students.

### Current State
- **Old Forum**: phpBB-based, outdated UI, limited mobile support
- **Status**: Not functioning properly, needs complete modernization
- **Development Status**: ✅ Week 1 Foundation Setup Complete

### Vision
A modern, mobile-friendly forum with:
- 🎨 Modern, responsive UI
- 📱 Mobile-first design
- 🔍 Advanced search capabilities
- 🏆 Gamification & reputation system
- 🧮 LaTeX support for mathematical equations
- 💻 Code syntax highlighting
- 🔔 Real-time notifications
- 🎯 Anonymous posting option
- ⚡ Fast performance

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+ 
- Docker and Docker Compose (for local database)
- npm or yarn package manager

### Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: Prisma
- **Deployment**: Vercel (planned)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/NikolasNeofytou/better_ece_forum.git
   cd better_ece_forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (defaults work for local development)
   ```

4. **Start Docker services (PostgreSQL & Redis)**
   ```bash
   npm run docker:up
   ```
   
   This starts:
   - PostgreSQL on `localhost:5432`
   - Redis on `localhost:6379`

5. **Generate Prisma client and push database schema**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start with Scripts

For a faster setup, use the provided utility scripts:

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Run initial setup
./scripts/setup.sh

# Or start development quickly
./scripts/dev.sh

# Check project status anytime
./scripts/status.sh
```

See [scripts/README.md](./scripts/README.md) for detailed documentation on all available scripts.

### Available Scripts

#### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

#### Database (Prisma)
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations (production)
- `npm run db:studio` - Open Prisma Studio (database GUI)

#### Docker
- `npm run docker:up` - Start PostgreSQL and Redis containers
- `npm run docker:down` - Stop and remove containers
- `npm run docker:logs` - View container logs

#### Utility Scripts
- `./scripts/status.sh` - View complete project status
- `./scripts/test.sh` - Run all tests and checks
- `./scripts/setup.sh` - Interactive setup wizard
- `./scripts/health-check.sh` - Check service health
- `./scripts/dev.sh` - Quick development environment start

See [scripts/README.md](./scripts/README.md) for detailed script documentation.

### Database Schema

The initial schema includes three core models:

- **User**: User accounts with authentication, reputation, and roles
- **Post**: Forum posts with content, voting, and view tracking
- **Comment**: Threaded comments supporting nested replies

See `prisma/schema.prisma` for the full schema definition.

### Project Structure

```
better_ece_forum/
├── src/
│   ├── app/                  # Next.js app directory (routes, layouts)
│   │   ├── api/auth/        # Authentication API routes
│   │   │   ├── [...nextauth]/  # NextAuth.js handler
│   │   │   └── register/    # User registration endpoint
│   │   ├── auth/            # Authentication pages
│   │   │   ├── signin/      # Sign in page
│   │   │   └── signup/      # Sign up page
│   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   └── page.tsx         # Homepage
│   ├── components/          # React components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utility functions and configurations
│   │   ├── auth/           # Authentication configuration
│   │   │   ├── config.ts   # NextAuth.js configuration
│   │   │   └── provider.tsx # Session provider
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── redis.ts        # Redis client configuration
│   │   └── utils.ts        # General utilities
│   ├── types/              # TypeScript type definitions
│   └── middleware.ts       # Route protection middleware
├── prisma/
│   └── schema.prisma       # Database schema (User, Account, Session, etc.)
├── public/                 # Static assets
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── ci.yml          # CI pipeline (lint, type-check, build)
├── docker-compose.yml      # Local development services
├── .env.example            # Environment variables template
└── README.md              # This file
```

### Authentication

The application uses **NextAuth.js v5** for authentication with:

- **Credentials Provider**: Email/password authentication with bcrypt hashing
- **OAuth Provider**: Google Sign-In
- **JWT Sessions**: Stateless authentication
- **Protected Routes**: Middleware-based route protection

**Authentication Features:**
- User registration with validation (email, username, password strength)
- Secure password hashing with bcrypt
- Session management with JWT tokens
- OAuth integration (Google)
- Protected routes (`/dashboard`, `/profile`, `/settings`)
- Automatic redirect for authenticated users on auth pages

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handler (sign in, sign out, session)

**Usage Example:**
```typescript
import { auth } from "@/lib/auth/config"

// In Server Components
const session = await auth()
if (session?.user) {
  console.log("User is signed in:", session.user.email)
}

// In Client Components
import { useSession, signIn, signOut } from "next-auth/react"

const { data: session } = useSession()
if (session) {
  await signOut()
} else {
  await signIn("google")
}
```

### Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/better_ece_forum

# Redis
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
AUTH_SECRET=your-secret-key-here-change-in-production-use-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Troubleshooting

#### Docker containers won't start
```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop existing services or change ports in docker-compose.yml
```

#### Database connection errors
```bash
# Ensure Docker containers are running
docker ps

# Check logs
npm run docker:logs

# Verify DATABASE_URL in .env matches docker-compose.yml settings
```

#### Prisma client errors
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 📚 Documentation

This repository contains comprehensive research and planning documents:

1. **[RESEARCH.md](./RESEARCH.md)** - Detailed research on current limitations, best features from top platforms, and technology recommendations

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture, database schema, API design, and security considerations

3. **[FEATURES.md](./FEATURES.md)** - Complete feature specifications with user stories and acceptance criteria

4. **[ROADMAP.md](./ROADMAP.md)** - 16-week implementation roadmap with phase-by-phase breakdown

5. **[COMPARISON.md](./COMPARISON.md)** - Technology comparison and cost analysis

## 🎯 Development Roadmap

### ✅ Phase 1.1: Foundation (Week 1) - COMPLETE
- [x] Next.js project with TypeScript
- [x] Tailwind CSS and shadcn/ui configuration
- [x] PostgreSQL and Redis setup (Docker)
- [x] Prisma ORM configuration
- [x] Initial database schema (User, Post, Comment)
- [x] Development environment setup
- [x] GitHub Actions CI pipeline

### ✅ Phase 1.2: Authentication (Week 2) - COMPLETE
- [x] User registration and login
- [x] NextAuth.js v5 setup with JWT sessions
- [x] Email/password authentication with bcrypt
- [x] OAuth integration (Google)
- [x] Protected routes with middleware
- [x] Session management
- [x] User authentication UI (sign in/sign up pages)

### 🚀 Phase 2: MVP Features (Weeks 3-6)
- [ ] Post creation and management
- [ ] Comment system (threaded)
- [ ] Categories and tags
- [ ] Full-text search
- [ ] User profiles
- [ ] Rich text editor

See [ROADMAP.md](./ROADMAP.md) for the complete development plan.

## 🧪 Testing & CI/CD

### Continuous Integration

GitHub Actions runs on every push and pull request:
- ✅ ESLint code quality checks
- ✅ TypeScript type checking
- ✅ Build verification
- 📝 Unit tests (placeholder - to be added)

### Running Checks Locally

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Build project
npm run build
```

## 👥 Contributing

This is a university project. Contributions from NTUA students are welcome!

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and type checking
4. Commit with descriptive messages
5. Open a pull request

## 📝 License

To be determined

## 📞 Contact

For questions or suggestions about this project, please open an issue.

---

**Status**: 🚧 Phase 1 Complete - Ready for authentication implementation
**Last Updated**: November 2025
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Hosting**: Vercel + Supabase/Neon

**Timeline:**
- MVP: 6 weeks (core features)
- Enhanced: +4 weeks (voting, notifications, badges)
- Advanced: +4 weeks (analytics, PWA)
- Total: 14-16 weeks for full feature set

**Cost:** $70-200/month for production (or free tier for small usage)

### Alternative: Discourse (Fast Deployment)

For rapid deployment (2-4 weeks):
- Use Discourse open-source platform
- Customize theme and plugins
- Self-host or use managed hosting

## 🎯 Key Features

### Phase 1: MVP (Weeks 1-6)
- [x] Research and planning
- [ ] User authentication (email + OAuth)
- [ ] Create/view/edit posts
- [ ] Threaded comments
- [ ] Categories and tags
- [ ] Full-text search
- [ ] User profiles
- [ ] Rich text editor with code highlighting
- [ ] Responsive design

### Phase 2: Enhanced Engagement (Weeks 7-10)
- [ ] Voting system (upvote/downvote)
- [ ] Reputation system
- [ ] Real-time notifications
- [ ] Subscriptions
- [ ] Accepted answers
- [ ] Anonymous posting
- [ ] Badges & achievements
- [ ] @mentions

### Phase 3: Moderation & Polish (Weeks 11-12)
- [ ] Moderation tools
- [ ] Spam prevention
- [ ] LaTeX support
- [ ] Admin dashboard
- [ ] UI/UX polish
- [ ] Accessibility improvements

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Analytics dashboard
- [ ] Progressive Web App (PWA)
- [ ] Advanced search & recommendations
- [ ] Performance optimization
- [ ] Complete documentation

## 💡 Why This Approach?

### Advantages of Custom Build
- ✅ Modern technology stack
- ✅ Full control over features
- ✅ Tailored to student needs
- ✅ Lower long-term costs
- ✅ Great learning opportunity
- ✅ Active development community
- ✅ Excellent performance

### Comparison with Current phpBB
| Feature | phpBB (Current) | Our Solution |
|---------|----------------|--------------|
| UI/UX | Outdated | Modern, sleek |
| Mobile | Basic | Mobile-first |
| Real-time | No | Yes |
| LaTeX | Plugin | Native |
| Search | Basic | Advanced |
| Performance | Slow | Fast (SSR) |
| Customization | Limited | Unlimited |

## 📊 Research Findings

### Best Features from Top Platforms

1. **Stack Overflow**: Reputation system, voting, accepted answers
2. **Reddit**: Upvote/downvote, karma, threaded discussions
3. **Discourse**: Modern UI, real-time updates, excellent mobile
4. **Piazza**: Anonymous posting, course-specific sections
5. **Canvas**: Integration with university systems

### Student Forum Requirements

Engineering students need:
- 🧮 **LaTeX support** - for equations and formulas
- 💻 **Code highlighting** - for programming assignments
- 📱 **Mobile access** - students use phones extensively
- 🔍 **Good search** - to find existing answers
- 🎭 **Anonymous option** - reduce barrier to asking questions
- 📚 **Course organization** - by semester and topic
- 🏆 **Gamification** - encourage participation

## 🛠️ Development Setup

Coming soon! Once we start Phase 1 implementation.

## 👥 Contributing

This is a university project. Contributions from NTUA students are welcome!

## 📝 License

To be determined

## 📞 Contact

For questions or suggestions about this project, please open an issue.

---

## Next Steps

1. ✅ Research completed
2. ✅ Architecture designed
3. ✅ Features specified
4. ✅ Roadmap created
5. ⏭️ **Next**: Begin Phase 1 development (Project setup & infrastructure)

**Ready to start building!** 🚀 
