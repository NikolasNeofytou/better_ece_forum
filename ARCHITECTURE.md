# Technical Architecture Proposal

## System Overview

This document outlines the technical architecture for the modernized NTUA ECE Student Forum.

## Architecture Pattern: Modern JAMstack

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Next.js   │  │   React 18   │  │  Tailwind CSS +   │  │
│  │  (SSR/SSG)  │  │  Components  │  │   shadcn/ui       │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Real-time Updates (Socket.io Client)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              │
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Next.js API Routes (Serverless)            │   │
│  │         - Authentication - Posts - Comments          │   │
│  │         - User Management - Search - Voting          │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Real-time Server (Socket.io)              │   │
│  │          - Live notifications - Presence             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   File Storage   │  │
│  │              │  │              │  │                  │  │
│  │ - Users      │  │ - Sessions   │  │ - User uploads   │  │
│  │ - Posts      │  │ - Cache      │  │ - Attachments    │  │
│  │ - Comments   │  │ - Jobs       │  │ - Avatars        │  │
│  │ - Votes      │  │ - Rate limit │  │                  │  │
│  │ - Tags       │  └──────────────┘  │ (S3/Cloudflare)  │  │
│  └──────────────┘                    └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

#### Core Framework
- **Next.js 14+** with App Router
  - Server-side rendering (SSR)
  - Static generation (SSG) for static pages
  - API routes for backend
  - Image optimization
  - Built-in routing

#### UI Framework
- **React 18+**
  - Server Components
  - Suspense for loading states
  - Concurrent rendering

#### Styling
- **Tailwind CSS 3+**
  - Utility-first CSS
  - Responsive design
  - Dark mode support
- **shadcn/ui** or **Radix UI**
  - Accessible component library
  - Customizable primitives

#### State Management
- **Zustand** or **React Context**
  - Lightweight state management
  - Minimal boilerplate
- **TanStack Query (React Query)**
  - Server state management
  - Caching and synchronization

#### Real-time
- **Socket.io Client**
  - WebSocket connections
  - Fallback to long-polling
  - Real-time notifications

#### Forms & Validation
- **React Hook Form**
  - Performance-focused forms
  - Minimal re-renders
- **Zod**
  - TypeScript-first schema validation
  - Runtime validation

#### Rich Text Editor
- **Tiptap** or **Lexical**
  - Modern WYSIWYG editor
  - Markdown support
  - Code highlighting
  - LaTeX support via extensions

### Backend

#### API Server
- **Next.js API Routes** (primary)
  - Serverless functions
  - Edge runtime support
  - Built-in API handling

#### Alternative/Supplementary Backend
- **Node.js + Express/Fastify** (if needed)
  - For complex business logic
  - WebSocket server
  - Background jobs

#### Database
- **PostgreSQL 15+**
  - Relational data integrity
  - Full-text search
  - JSON support
  - Excellent performance

#### ORM
- **Prisma**
  - Type-safe database client
  - Migration system
  - Excellent DX
  - Auto-generated types

#### Caching & Sessions
- **Redis**
  - Session storage
  - Rate limiting
  - Cache layer
  - Job queue (Bull/BullMQ)

#### Authentication
- **NextAuth.js** or **Lucia**
  - OAuth providers (Google, GitHub)
  - Email/password auth
  - Session management
  - CSRF protection

#### File Storage
- **AWS S3** or **Cloudflare R2**
  - User uploads
  - Image optimization
  - CDN integration

### DevOps & Infrastructure

#### Hosting
- **Vercel** (Frontend + API Routes)
  - Automatic deployments
  - Edge network
  - Serverless functions
  - Preview deployments

#### Database Hosting
- **Supabase** or **Neon**
  - Managed PostgreSQL
  - Connection pooling
  - Backups

#### Redis Hosting
- **Upstash**
  - Serverless Redis
  - HTTP-based
  - Auto-scaling

#### Monitoring
- **Sentry**
  - Error tracking
  - Performance monitoring
- **Vercel Analytics**
  - Web vitals
  - User analytics

#### CI/CD
- **GitHub Actions**
  - Automated testing
  - Linting
  - Type checking
  - Deployment

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  role VARCHAR(20) DEFAULT 'user', -- user, moderator, admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts (Threads)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW()
);

-- Comments (Replies)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_accepted BOOLEAN DEFAULT FALSE,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  votable_type VARCHAR(20) NOT NULL, -- 'post' or 'comment'
  votable_id UUID NOT NULL,
  value INTEGER NOT NULL, -- 1 or -1
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, votable_type, votable_id)
);

-- Post Tags (Junction)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscribable_type VARCHAR(20) NOT NULL, -- 'post', 'category', 'tag'
  subscribable_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, subscribable_type, subscribable_id)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Badges
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Create indexes for performance
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_activity ON posts(last_activity_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_votes_votable ON votes(votable_type, votable_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Full-text search
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_comments_search ON comments USING GIN(to_tsvector('english', content));
```

## API Design

### RESTful Endpoints

```
Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh

Users
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
GET    /api/users/:id/posts
GET    /api/users/:id/comments
GET    /api/users/:id/badges

Categories
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories (admin)
PATCH  /api/categories/:id (admin)
DELETE /api/categories/:id (admin)

Tags
GET    /api/tags
GET    /api/tags/:id
POST   /api/tags
GET    /api/tags/search?q=...

Posts
GET    /api/posts
POST   /api/posts
GET    /api/posts/:id
PATCH  /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/vote
GET    /api/posts/:id/comments
POST   /api/posts/:id/subscribe

Comments
POST   /api/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
POST   /api/comments/:id/vote
POST   /api/comments/:id/accept

Search
GET    /api/search?q=...&type=...&category=...

Notifications
GET    /api/notifications
PATCH  /api/notifications/:id/read
POST   /api/notifications/mark-all-read
```

### WebSocket Events

```javascript
// Client → Server
'post:view' - User viewing a post
'typing:start' - User started typing
'typing:stop' - User stopped typing

// Server → Client
'notification:new' - New notification
'post:updated' - Post was updated
'comment:new' - New comment on subscribed post
'user:online' - User came online
'user:offline' - User went offline
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with refresh tokens
- HTTP-only cookies for sessions
- CSRF protection
- Rate limiting on auth endpoints

### Input Validation
- Zod schemas for all inputs
- HTML sanitization for rich content
- XSS prevention
- SQL injection prevention (via ORM)

### Content Security
- Content Security Policy headers
- CORS configuration
- File upload restrictions (type, size)
- Image optimization and validation

### API Security
- Rate limiting (Redis)
- API key authentication for external services
- Request validation middleware
- Error handling without information leakage

## Performance Optimization

### Caching Strategy
- **Level 1**: Redis cache for frequent queries
- **Level 2**: Next.js SSG for static pages
- **Level 3**: CDN for static assets
- **Level 4**: Browser caching with proper headers

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas for scaling

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization (Next.js Image)
- Bundle size optimization
- Web Vitals monitoring

## Scalability

### Horizontal Scaling
- Stateless API design
- Redis for shared state
- Load balancing via Vercel Edge
- Database read replicas

### Vertical Scaling
- Optimize queries
- Increase database resources
- Redis cluster for high load

## Development Workflow

### Local Development
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Testing Strategy
- **Unit Tests**: Vitest
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright
- **API Tests**: Supertest
- **Code Coverage**: 80%+ target

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

## Deployment Pipeline

```
Developer Push
      ↓
GitHub Actions
      ↓
   Lint & Test
      ↓
   Build Check
      ↓
Preview Deploy (Vercel)
      ↓
   Code Review
      ↓
Merge to Main
      ↓
Production Deploy (Vercel)
```

## Monitoring & Observability

### Metrics
- Response times (p50, p95, p99)
- Error rates
- User engagement
- Database query performance

### Logging
- Structured logging
- Log aggregation
- Error tracking (Sentry)

### Alerts
- High error rates
- Slow response times
- Database connection issues
- Disk space warnings

## Future Considerations

### Phase 2 Enhancements
- Mobile apps (React Native)
- Advanced analytics dashboard
- ML-powered content recommendations
- Automated moderation (AI)
- Video/audio posts
- Live chat rooms

### Integration Possibilities
- NTUA SSO integration
- University calendar sync
- Course management system integration
- Email notifications
- Slack/Discord notifications
