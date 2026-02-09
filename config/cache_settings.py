"""
Redis Cache Configuration for SPMS Backend

This module configures application-level caching using Redis and Django's cache framework.

Note: Organisational Edge proxy (Nginx/Varnish/Fastly) handles HTTP-level caching.
This Redis cache is for application-level caching of user-specific data that cannot
be cached at the HTTP level.
"""

import os

# Redis Cache Configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,  # seconds
            "SOCKET_TIMEOUT": 5,  # seconds
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
