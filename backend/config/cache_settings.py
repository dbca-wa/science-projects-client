"""
Redis Cache Configuration for SPMS Backend

This module configures application-level caching using Redis and Django's cache framework.

Note: Organisational Edge proxy (Nginx/Varnish/Fastly) handles HTTP-level caching.
This Redis cache is for application-level caching of user-specific data that cannot
be cached at the HTTP level.

Redis is optional:
- If REDIS_URL is set and Redis is reachable: Caching and throttling enabled
- If Redis unavailable: Caching and throttling disabled (graceful degradation)
- Tests always use dummy cache (no Redis required)
"""

import logging
import os

logger = logging.getLogger(__name__)

# Track Redis availability globally for other modules
REDIS_AVAILABLE = False


def get_cache_config():
    """
    Get cache configuration - Redis if available, dummy cache otherwise.

    Behavior:
    - Tests: Always use dummy cache (no Redis needed)
    - Production/Staging/Development: Use Redis if REDIS_URL set and connectable
    - If Redis unavailable: Use dummy cache and log clearly

    Sets global REDIS_AVAILABLE flag for other components (e.g., throttling).

    Returns:
        dict: Django CACHES configuration
    """
    global REDIS_AVAILABLE

    redis_url = os.environ.get("REDIS_URL")
    is_testing = os.environ.get("PYTEST_RUNNING", "0") == "1"
    environment = os.environ.get("ENVIRONMENT", "development")

    # Always use dummy cache for tests
    if is_testing:
        logger.info("CACHE: Using dummy cache for tests (Redis not required)")
        REDIS_AVAILABLE = False
        return {
            "default": {
                "BACKEND": "django.core.cache.backends.dummy.DummyCache",
            }
        }

    # Try Redis if URL is provided
    if redis_url:
        try:
            # Test Redis connection with short timeout
            import redis

            client = redis.from_url(redis_url, socket_connect_timeout=2)
            client.ping()
            client.close()

            logger.info(f"CACHE: Redis connected successfully ({redis_url})")
            logger.info("CACHE: Caching ENABLED")
            logger.info("CACHE: Rate limiting ENABLED")
            REDIS_AVAILABLE = True

            return {
                "default": {
                    "BACKEND": "django_redis.cache.RedisCache",
                    "LOCATION": redis_url,
                    "OPTIONS": {
                        "CLIENT_CLASS": "django_redis.client.DefaultClient",
                        "SOCKET_CONNECT_TIMEOUT": 5,
                        "SOCKET_TIMEOUT": 5,
                        "RETRY_ON_TIMEOUT": True,
                        "MAX_CONNECTIONS": 50,
                        "CONNECTION_POOL_KWARGS": {
                            "max_connections": 50,
                            "retry_on_timeout": True,
                        },
                    },
                    "KEY_PREFIX": "spms",
                    "TIMEOUT": 300,  # 5 minutes default TTL
                }
            }
        except Exception as e:
            logger.warning(f"CACHE: Redis connection failed ({redis_url}): {e}")
            logger.warning("CACHE: Caching DISABLED (Redis unavailable)")
            logger.warning("CACHE: Rate limiting DISABLED (Redis unavailable)")
            if environment in ["staging", "production"]:
                logger.warning(
                    f"CACHE: Redis is recommended for {environment}. "
                    "See documentation for setup instructions."
                )
            REDIS_AVAILABLE = False
    else:
        logger.info("CACHE: REDIS_URL not set")
        logger.info("CACHE: Caching DISABLED (no Redis configured)")
        logger.info("CACHE: Rate limiting DISABLED (no Redis configured)")
        if environment in ["staging", "production"]:
            logger.info(
                f"CACHE: Redis is recommended for {environment}. "
                "See documentation for setup instructions."
            )
        REDIS_AVAILABLE = False

    # Use dummy cache when Redis unavailable
    return {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        }
    }


# Export cache configuration
CACHES = get_cache_config()

# Cache Key Patterns
# Use these patterns for consistent cache key generation across the application
CACHE_KEYS = {
    # User-related caches (5 minute TTL)
    "user_projects": "user:{user_id}:projects",
    "user_profile": "user:{user_id}:profile",
    # Agency-related caches (1 hour TTL)
    "agency_branches": "agency:{agency_id}:branches",
    # Project-related caches (5 minute TTL)
    "project_detail": "project:{project_id}:detail",
}

# Cache TTL (Time To Live) values in seconds
CACHE_TTL = {
    "user_projects": 300,  # 5 minutes - frequently accessed, changes occasionally
    "user_profile": 600,  # 10 minutes - moderately accessed, changes occasionally
    "agency_branches": 3600,  # 1 hour - rarely changes, frequently accessed
    "project_detail": 300,  # 5 minutes - frequently accessed, changes occasionally
}
