"""Prometheus metrics for monitoring and observability.

This module defines all Prometheus metrics used for monitoring the auth service.
Metrics are exposed at /metrics endpoint and can be scraped by Prometheus
or other monitoring systems.

Metric Types:
    - Counter: Incrementing counters (e.g., request counts, errors)
    - Gauge: Values that can go up or down (e.g., active connections)
    - Histogram: Distribution of values (e.g., request latency)

Metric Categories:
    - Request metrics: HTTP request tracking
    - Database metrics: Query performance and connection pool
    - Cache metrics: Cache hit/miss rates
    - User metrics: Session and login tracking
    - WorkOS API metrics: External API call tracking
    - Exception metrics: Error tracking by type
    - Circuit breaker metrics: Circuit breaker state tracking

Usage:
    Metrics are automatically collected by middleware and instrumented code.
    Access metrics at http://localhost:8000/metrics
    
    Example Prometheus queries:
    - Rate of authentication requests: rate(auth_requests_total[5m])
    - Database query p95 latency: histogram_quantile(0.95, db_query_duration_seconds_bucket)
    - Active sessions: active_sessions
"""

from prometheus_client import Counter, Gauge, Histogram

# ========== REQUEST METRICS ==========
auth_requests_total = Counter(
    "auth_requests_total",
    "Total authentication requests",
    ["method", "status"],
)

# ========== DATABASE METRICS ==========
db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

db_connections_active = Gauge(
    "db_connections_active",
    "Number of active database connections",
)

db_connections_idle = Gauge(
    "db_connections_idle",
    "Number of idle database connections in pool",
)

# ========== CACHE METRICS ==========
cache_hits_total = Counter(
    "cache_hits_total",
    "Total cache hits",
    ["cache_key_prefix"],
)

cache_misses_total = Counter(
    "cache_misses_total",
    "Total cache misses",
    ["cache_key_prefix"],
)

# ========== USER METRICS ==========
active_sessions = Gauge(
    "active_sessions",
    "Number of active user sessions",
)

users_logged_in_total = Counter(
    "users_logged_in_total",
    "Total number of user logins",
)

# ========== WORKOS API METRICS ==========
workos_api_calls_total = Counter(
    "workos_api_calls_total",
    "Total WorkOS API calls",
    ["endpoint", "status"],
)

workos_api_duration_seconds = Histogram(
    "workos_api_duration_seconds",
    "WorkOS API call duration in seconds",
    ["endpoint"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

# ========== EXCEPTION METRICS ==========
exceptions_total = Counter(
    "exceptions_total",
    "Total exceptions by type",
    ["exception_type"],
)

# ========== CIRCUIT BREAKER METRICS ==========
circuit_breaker_state = Gauge(
    "circuit_breaker_state",
    "Circuit breaker state (0=closed, 1=half-open, 2=open)",
    ["service"],
)

circuit_breaker_failures = Counter(
    "circuit_breaker_failures_total",
    "Total circuit breaker trips",
    ["service"],
)

