"""API route handlers.

This package exports all FastAPI routers for the auth service. Routers are
organized by domain and provide RESTful API endpoints.

Routers:
    - audit: Audit log endpoints
    - auth: Authentication endpoints (OAuth, sessions)
    - health: Health check endpoints
    - organizations: Organization management endpoints
    - permissions: Role and permission endpoints
    - team: Team member management endpoints

Usage:
    from app.routers import auth, organizations
    
    app.include_router(auth.router, prefix="/auth")
    app.include_router(organizations.router, prefix="/organizations")
"""

from app.routers import audit, auth, health, organizations, permissions, team

__all__ = ["audit", "auth", "health", "organizations", "permissions", "team"]

