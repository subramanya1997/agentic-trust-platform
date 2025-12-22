"""OpenTelemetry distributed tracing configuration."""

import logging

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from app.config import settings

logger = logging.getLogger(__name__)


def setup_tracing(app, engine):
    """
    Configure OpenTelemetry distributed tracing.
    
    This sets up:
    - FastAPI instrumentation for HTTP request tracing
    - SQLAlchemy instrumentation for database query tracing
    - OTLP exporter for sending traces to a collector (Jaeger, etc.)
    
    Args:
        app: FastAPI application instance
        engine: SQLAlchemy engine instance
        
    Note:
        Set OTEL_EXPORTER_OTLP_ENDPOINT environment variable to configure
        where traces are sent (e.g., http://jaeger:4317)
    """
    try:
        # Create resource with service information
        resource = Resource.create({
            "service.name": settings.app_name,
            "service.version": "0.1.0",
            "deployment.environment": settings.service_env,
        })
        
        # Create tracer provider
        provider = TracerProvider(resource=resource)
        
        # Add OTLP exporter (sends traces to collector)
        # Only add if OTEL_EXPORTER_OTLP_ENDPOINT is set
        import os
        if os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT"):
            otlp_exporter = OTLPSpanExporter()
            span_processor = BatchSpanProcessor(otlp_exporter)
            provider.add_span_processor(span_processor)
            logger.info(f"OpenTelemetry tracing enabled, exporting to {os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT')}")
        else:
            logger.info("OpenTelemetry tracing configured but no exporter endpoint set (OTEL_EXPORTER_OTLP_ENDPOINT)")
        
        # Set as global tracer provider
        trace.set_tracer_provider(provider)
        
        # Instrument FastAPI
        FastAPIInstrumentor.instrument_app(app)
        
        # Instrument SQLAlchemy
        SQLAlchemyInstrumentor().instrument(
            engine=engine.sync_engine,
            enable_commenter=True,  # Add trace context to SQL comments
        )
        
        logger.info("OpenTelemetry instrumentation configured successfully")
        
    except Exception as e:
        logger.warning(f"Failed to setup OpenTelemetry tracing: {e}", exc_info=True)
        logger.warning("Application will continue without distributed tracing")


def get_tracer(name: str):
    """
    Get a tracer for manual span creation.
    
    Args:
        name: Tracer name (typically __name__)
        
    Returns:
        OpenTelemetry Tracer instance
        
    Example:
        ```python
        tracer = get_tracer(__name__)
        
        with tracer.start_as_current_span("operation_name") as span:
            span.set_attribute("user.id", user_id)
            # ... do work ...
        ```
    """
    return trace.get_tracer(name)

