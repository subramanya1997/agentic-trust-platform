# Agentic Trust Platform

> AI Agent Infrastructure Platform - Build, deploy, and manage AI agents with confidence.

## 🏗️ Project Structure

```
agentic-trust-platform/
├── web/                    # Next.js frontend (→ Vercel)
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   └── lib/                # Utilities & types
├── backend/                # Python FastAPI (→ GCP Cloud Run)
│   ├── app/                # Application code
│   │   ├── core/           # Core utilities (auth, config)
│   │   ├── models/         # SQLModel database models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   └── tests/              # Backend tests
├── docs/                   # Documentation
└── docker-compose.yml      # Local development services
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Docker & Docker Compose

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/subramanya1997/agentic-trust-platform.git
cd agentic-trust-platform

# 2. Install root dependencies
npm install

# 3. Install frontend dependencies
cd web && npm install && cd ..

# 4. Set up backend
cd backend && uv sync && cd ..

# 5. Copy environment files
cp web/.env.example web/.env.local
cp backend/.env.example backend/.env

# 6. Start databases
npm run db:up

# 7. Run database migrations
npm run db:migrate

# 8. Start development servers
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

## 📦 Deployment

### Frontend → Vercel

The `web/` directory auto-deploys to Vercel:
- **Production**: Push to `main` branch
- **Preview**: Push to any other branch

### Backend → GCP Cloud Run

The `backend/` directory deploys via Cloud Build:
- Trigger: Push to `main` with changes in `backend/**`
- Config: `backend/cloudbuild.yaml`

## 🛠️ Development Commands

```bash
# Start everything
npm run dev

# Start only frontend
npm run dev:web

# Start only backend
npm run dev:backend

# Database
npm run db:up       # Start PostgreSQL + Redis
npm run db:down     # Stop databases
npm run db:migrate  # Run migrations
npm run db:reset    # Reset database (destroys data)

# Code Quality
npm run lint           # Lint all
npm run format         # Format all
npm run format:check   # Check formatting
npm run type-check     # Type check all
npm run security       # Security scan
npm run spell-check    # Spell check
npm run validate       # Run all checks

# Testing
npm run test        # Run all tests
```

## 📚 Documentation

- [20-Day MVP Plan](./docs/20-day-mvp-plan.md)
- [Days 1-5 Detailed Guide](./docs/days-1-5-detailed.md)
- [Database Schema](./docs/database-schema.md)
- [Monorepo Setup](./docs/monorepo-setup.md)
- [Product Requirements](./docs/product_requirements.md)
- [Code Quality & Pre-commit Setup](./CODE_QUALITY.md)

## 🔐 Authentication

This platform uses [WorkOS](https://workos.com/) for authentication:
- Email + Password
- Social login (Google, GitHub)
- Enterprise SSO (SAML/OIDC)

## 📄 License

Private - All rights reserved.

