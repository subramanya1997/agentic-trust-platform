"""Security headers middleware for protecting responses."""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    
    This middleware adds security headers to protect against common web vulnerabilities:
    - X-Content-Type-Options: Prevent MIME type sniffing
    - X-Frame-Options: Prevent clickjacking
    - X-XSS-Protection: Enable XSS protection (legacy browsers)
    - Strict-Transport-Security: Enforce HTTPS
    - Referrer-Policy: Control referrer information
    - Permissions-Policy: Restrict browser features
    - Content-Security-Policy: Control resource loading (optional)
    """
    
    def __init__(self, app, content_security_policy: str | None = None):
        """
        Initialize the security headers middleware.
        
        Args:
            app: ASGI application
            content_security_policy: Optional CSP header value
        """
        super().__init__(app)
        self.csp = content_security_policy
    
    async def dispatch(self, request: Request, call_next):
        """
        Add security headers to the response.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain
            
        Returns:
            Response with security headers added
        """
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # HTTPS enforcement (31536000 seconds = 1 year)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy - restrict potentially dangerous features
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Optional Content Security Policy
        if self.csp:
            response.headers["Content-Security-Policy"] = self.csp
        
        return response

