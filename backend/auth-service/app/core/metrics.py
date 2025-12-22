"""Prometheus metrics for monitoring and observability."""

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

