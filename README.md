# Agentic Trust Platform

AI Agent Infrastructure Platform with microservices architecture.

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd agentic-trust-platform
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Start backend services:**
   ```bash
   cd backend
   docker-compose up -d
   ```

4. **Start frontend (separate terminal):**
   ```bash
   cd web
   npm install
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Auth Service API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
agentic-trust-platform/
├── backend/                    # Backend microservices
│   ├── configs/               # Centralized configurations
│   ├── shared/                # Shared libraries
│   ├── auth-service/          # Authentication service
│   └── docker-compose.yml     # Backend services (postgres, redis, auth-service)
├── web/                       # Next.js frontend (runs with npm, no Docker)
├── docs/                      # Documentation
└── env.example                # Environment variables template
```

## Environment Configuration

All services use a **single centralized `.env` file** at the project root.

```bash
# Copy the example file
cp env.example .env

# Edit with your values
nano .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `WORKOS_API_KEY` - WorkOS authentication
- `JWT_SECRET` - Cross-service authentication
- `SERVICE_NAME` - Current service identifier
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)

See `env.example` for all available options.

## Services

### Backend Services

- **Auth Service** (Port 8000) - Authentication and user management
- **Agent Service** (Planned) - AI agent orchestration
- **MCP Gateway** (Planned) - MCP server and tool registry

See [backend/README.md](backend/README.md) for detailed documentation.

### Frontend

- **Web App** (Port 3000) - Next.js application

See [web/README.md](web/README.md) for frontend documentation.

## Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- uv (Python package manager)

### Running Locally

**Backend (Auth Service):**
```bash
cd backend/auth-service
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd web
npm install
npm run dev
```

### Database Migrations

```bash
cd backend/auth-service

# Create migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head
```

## Documentation

- [Backend Architecture](backend/README.md)
- [Migration Guide](backend/MIGRATION_GUIDE.md)
- [Product Requirements](docs/product_requirements.md)
- [MVP Implementation Guide](docs/mvp-implementation-guide.md)

## Testing

```bash
# Backend tests
cd backend/auth-service
uv run pytest

# Frontend tests
cd web
npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

[Your License Here]
