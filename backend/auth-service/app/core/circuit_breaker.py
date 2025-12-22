"""Circuit breaker pattern implementation for external service protection.

This module provides a circuit breaker decorator to protect against cascading
failures when calling external services (primarily WorkOS API). The circuit
breaker opens after a threshold of failures, preventing further calls until
the service recovers.

Key Features:
- Automatic failure detection and circuit opening
- Recovery timeout with half-open state testing
- Prometheus metrics integration
- Protects against cascading failures
- Configurable thresholds and timeouts

Circuit Breaker States:
1. CLOSED: Normal operation, requests pass through
2. OPEN: Too many failures, requests fail immediately
3. HALF_OPEN: Testing recovery, allows one request

Configuration:
    - failure_threshold: 5 consecutive failures to open circuit
    - recovery_timeout: 30 seconds before attempting recovery
    - expected_exception: Types of exceptions that count as failures

Usage:
    from app.core.circuit_breaker import with_circuit_breaker
    
    @with_circuit_breaker("workos")
    def call_workos_api():
        return workos_client.some_method()
"""

import logging
from functools import wraps
from typing import Any, Callable, Dict

import httpx
from circuitbreaker import circuit, CircuitBreakerError

from app.core.metrics import circuit_breaker_failures, circuit_breaker_state

logger = logging.getLogger(__name__)

# Re-export CircuitBreakerError for use in routers
__all__ = ["with_circuit_breaker", "CircuitBreakerError", "get_circuit_state"]

# Configuration constants
# These values balance between fast failure detection and avoiding false positives
CIRCUIT_BREAKER_CONFIG = {
    "failure_threshold": 5,  # Open circuit after 5 consecutive failures
    "recovery_timeout": 30,  # Wait 30 seconds before attempting recovery
    "expected_exception": (
        httpx.RequestError,  # Network errors
        httpx.TimeoutException,  # Timeout errors
        httpx.HTTPStatusError,  # HTTP error status codes
    ),
}

# Global dictionary to track circuit breaker state for metrics
# Key: service name, Value: state ("closed", "open", "half_open")
_circuit_breaker_states: Dict[str, str] = {}


def _update_circuit_state_metric(service_name: str, state: str) -> None:
    """
    Update the circuit breaker state metric for Prometheus.
    
    This function updates both the in-memory state tracking and the Prometheus
    metric. The metric value is numeric for easier querying:
    - 0: closed (normal operation)
    - 1: half_open (testing recovery)
    - 2: open (circuit is open, requests fail immediately)
    
    Args:
        service_name: Name of the service (e.g., "workos")
        state: Current state - "closed", "open", or "half_open"
        
    Note:
        This is an internal function used by the circuit breaker decorator.
    """
    _circuit_breaker_states[service_name] = state
    state_value = {
        "closed": 0,
        "half_open": 1,
        "open": 2,
    }.get(state, 0)
    
    # Update Prometheus metric
    circuit_breaker_state.labels(service=service_name).set(state_value)


def with_circuit_breaker(service_name: str = "workos"):
    """
    Decorator to add circuit breaker protection to a function.
    
    This decorator wraps a function with circuit breaker logic to protect
    against cascading failures when calling external services. After a
    threshold of failures, the circuit opens and subsequent calls fail
    immediately without calling the service.
    
    Circuit Breaker Behavior:
        1. CLOSED: Normal operation, all requests pass through
        2. After 5 failures: Circuit opens, requests fail immediately
        3. After 30 seconds: Circuit enters half-open state
        4. Half-open: One test request allowed
        5. If test succeeds: Circuit closes, normal operation resumes
        6. If test fails: Circuit opens again for another 30 seconds
    
    Metrics:
        - circuit_breaker_state: Current state (0=closed, 1=half_open, 2=open)
        - circuit_breaker_failures: Counter of circuit breaker trips
    
    Args:
        service_name: Name of the service for metrics and logging (default: "workos")
        
    Returns:
        Decorator function
        
    Raises:
        CircuitBreakerError: When circuit is open and request is rejected
        
    Example:
        @with_circuit_breaker("workos")
        def call_workos_api():
            return workos_client.get_user(user_id)
        
        # In route handler
        try:
            user = call_workos_api()
        except CircuitBreakerError:
            # Circuit is open, service is down
            raise HTTPException(503, "Service temporarily unavailable")
    
    Note:
        Only httpx exceptions (RequestError, TimeoutException, HTTPStatusError)
        count as failures. Other exceptions don't affect the circuit breaker.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def inner_func(*args: Any, **kwargs: Any) -> Any:
            """Inner function that gets wrapped by circuit breaker."""
            # Update metric to closed (normal operation)
            _update_circuit_state_metric(service_name, "closed")
            return func(*args, **kwargs)
        
        # Apply the circuit breaker decorator to the inner function
        # This is where the actual circuit breaker logic is applied
        circuit_wrapped = circuit(
            failure_threshold=CIRCUIT_BREAKER_CONFIG["failure_threshold"],
            recovery_timeout=CIRCUIT_BREAKER_CONFIG["recovery_timeout"],
            expected_exception=CIRCUIT_BREAKER_CONFIG["expected_exception"],
            name=f"{service_name}_{func.__name__}",
        )(inner_func)
        
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            """
            Wrapper function that handles CircuitBreakerError exceptions.
            
            This wrapper catches CircuitBreakerError (raised when circuit is open)
            and updates metrics/logging before re-raising.
            """
            try:
                result = circuit_wrapped(*args, **kwargs)
                return result
            except CircuitBreakerError as e:
                # Increment failure counter metric
                circuit_breaker_failures.labels(service=service_name).inc()
                
                # Update state to open
                _update_circuit_state_metric(service_name, "open")
                
                # Log the circuit breaker opening
                logger.warning(
                    f"Circuit breaker open for {service_name}",
                    extra={
                        "service": service_name,
                        "function": func.__name__,
                    }
                )
                raise
                
        return wrapper
    return decorator


def get_circuit_state(service_name: str = "workos") -> str:
    """
    Get the current state of the circuit breaker.
    
    This function returns the current state of the circuit breaker for a
    given service. Useful for health checks and monitoring.
    
    Args:
        service_name: Name of the service (default: "workos")
        
    Returns:
        str: Current state - "closed", "open", or "half_open"
        Defaults to "closed" if service not found
        
    Example:
        >>> state = get_circuit_state("workos")
        >>> if state == "open":
        ...     print("WorkOS API is down")
    """
    return _circuit_breaker_states.get(service_name, "closed")

