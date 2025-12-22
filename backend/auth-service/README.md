# Agentic Trust API

Python FastAPI backend for Agentic Trust platform.

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- PostgreSQL 15+
- Redis 7+

## Quick Start

```bash
# Install dependencies
uv sync

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start databases (from repo root)
docker-compose up -d postgres redis

# Run migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn app.main:app --reload --port 8000
```

## API Documentation

When running in debug mode, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── core/           # Core utilities (auth, config, permissions)
│   ├── models/         # SQLModel database models
│   ├── routers/        # API route handlers
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── config.py       # Application settings
│   ├── database.py     # Database connection
│   ├── dependencies.py # FastAPI dependencies
│   └── main.py         # Application entry point
├── alembic/            # Database migrations
├── tests/              # Test files
├── Dockerfile          # Container definition
└── pyproject.toml      # Dependencies
```

## Commands

```bash
# Run tests
uv run pytest

# Run linter
uv run ruff check .

# Format code
uv run ruff format .

# Type check
uv run mypy app

# Create migration
uv run alembic revision --autogenerate -m "description"

# Run migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1
```

