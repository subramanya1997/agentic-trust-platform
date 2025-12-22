# ========== BASE STAGE ==========
FROM python:3.12-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv


# ========== BUILDER STAGE ==========
FROM base AS builder

# Set working directory to final path (so shebangs are correct)
WORKDIR /app

# Build shared package as a wheel
COPY shared /build/shared_pkg
RUN cd /build/shared_pkg && uv build --out-dir /build/wheels

# Copy dependency files from auth-service
COPY auth-service/pyproject.toml auth-service/uv.lock* ./

# Remove shared from dependencies and sources to avoid editable install issues
RUN sed -i '/agentic-trust-shared/d' pyproject.toml && \
    sed -i '/\[tool.uv.sources\]/,+3d' pyproject.toml

# Install dependencies (without shared for now) - venv created at /app/.venv
RUN uv sync --no-dev

# Install the shared package wheel into the venv
RUN uv pip install /build/wheels/agentic_trust_shared-0.1.0-py3-none-any.whl

# ========== DEVELOPMENT STAGE ==========
FROM base AS development

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy configs
COPY configs /app/configs

# Source code will be mounted as volumes in docker-compose.dev.yml

# Set environment
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV VIRTUAL_ENV="/app/.venv"

# Expose port
EXPOSE 8000

# Development command with hot reload
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


# ========== PRODUCTION STAGE ==========
FROM python:3.12-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy virtual environment from builder (shebangs already point to /app/.venv/bin/python)
COPY --from=builder /app/.venv /app/.venv

# Copy configs
COPY configs /app/configs

# Copy auth-service files
COPY auth-service/app ./app
COPY auth-service/alembic ./alembic
COPY auth-service/alembic.ini ./

# Set environment
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV VIRTUAL_ENV="/app/.venv"

# Expose port
EXPOSE 8000

# Run migrations and start server using direct venv binaries
CMD ["/app/.venv/bin/sh", "-c", "/app/.venv/bin/alembic upgrade head && /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000"]
