"""Circuit breaker pattern implementation for external service protection."""

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
CIRCUIT_BREAKER_CONFIG = {
    "failure_threshold": 5,
    "recovery_timeout": 30,
    "expected_exception": (httpx.RequestError, httpx.TimeoutException, httpx.HTTPStatusError),
}

# Global dictionary to track circuit breaker state for metrics
_circuit_breaker_states: Dict[str, str] = {}


def _update_circuit_state_metric(service_name: str, state: str) -> None:
    """Update the circuit breaker state metric.
    
    Args:
        service_name: Name of the service (e.g., "workos")
        state: Current state - "closed", "open", or "half_open"
    """
    _circuit_breaker_states[service_name] = state
    state_value = {
        "closed": 0,
        "half_open": 1,
        "open": 2,
    }.get(state, 0)
    
    circuit_breaker_state.labels(service=service_name).set(state_value)


def with_circuit_breaker(service_name: str = "workos"):
    """Decorator to add circuit breaker protection to a function.
    
    Args:
        service_name: Name of the service for metrics and logging
        
    Usage:
        @with_circuit_breaker("workos")
        def call_external_api():
            return external_api.call()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def inner_func(*args: Any, **kwargs: Any) -> Any:
            """Inner function that gets wrapped by circuit breaker."""
            _update_circuit_state_metric(service_name, "closed")
            return func(*args, **kwargs)
        
        # Apply the circuit breaker decorator to the inner function
        circuit_wrapped = circuit(
            failure_threshold=CIRCUIT_BREAKER_CONFIG["failure_threshold"],
            recovery_timeout=CIRCUIT_BREAKER_CONFIG["recovery_timeout"],
            expected_exception=CIRCUIT_BREAKER_CONFIG["expected_exception"],
            name=f"{service_name}_{func.__name__}",
        )(inner_func)
        
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                result = circuit_wrapped(*args, **kwargs)
                return result
            except CircuitBreakerError as e:
                # Increment failure counter
                circuit_breaker_failures.labels(service=service_name).inc()
                
                # Update state to open
                _update_circuit_state_metric(service_name, "open")
                
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
    """Get the current state of the circuit breaker.
    
    Args:
        service_name: Name of the service
        
    Returns:
        Current state: "closed", "open", or "half_open"
    """
    return _circuit_breaker_states.get(service_name, "closed")

