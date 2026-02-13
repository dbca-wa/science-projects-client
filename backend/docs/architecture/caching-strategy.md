# Caching Strategy

## Overview

The SPMS backend implements application-level caching using Redis to reduce database load and improve response times for frequently accessed data. This document describes the caching strategy, what data is cached, cache invalidation patterns, and operational considerations.

## Architecture

### Two-Tier Caching

The system uses a two-tier caching approach:

**Tier 1: HTTP Caching (Edge Proxy)**
- Managed by: OIM Infrastructure team
- Technology: Nginx + Varnish + Fastly CDN
- Handles: Public content, static assets
- Control: Cache-Control headers set by application

**Tier 2: Application Caching (Redis)**
- Managed by: Application maintainer
- Technology: Redis + django-redis
- Handles: User-specific data, computed results
- Control: Explicit cache invalidation in application code

### Why Application-Level Caching?

Edge proxy HTTP caching cannot help with:
- Authenticated user requests (unique per user)
- POST/PUT/DELETE operations (not cacheable at HTTP level)
- User-specific database queries
- Computed results that vary by user

Application-level caching operates under the application's control and complements (not replaces) the existing HTTP caching infrastructure.

## Redis Configuration

### Connection Settings

**Location**: `backend/config/cache_settings.py`

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "RETRY_ON_TIMEOUT": True,
            "MAX_CONNECTIONS": 50,
        },
        "KEY_PREFIX": "spms",
        "TIMEOUT": 300,  # 5 minutes default
    }
}
```

### Environment Variables

- `REDIS_URL`: Redis connection string (default: `redis://127.0.0.1:6379/1`)

### Local Development

Redis runs in Docker Compose:

```bash
# Start Redis
docker-compose up -d redis

# Verify Redis is running
docker-compose exec redis redis-cli ping
# Should return: PONG

# View Redis logs
docker-compose logs redis

# Stop Redis
docker-compose stop redis
```

### Production Deployment

- **Development/Staging**: Redis sidecar container in Kubernetes pod
- **Production**: Azure Cache for Redis (managed service)

## What We Cache

### User Project Lists

**Cache Key**: `spms:user:{user_id}:projects`  
**TTL**: 5 minutes (300 seconds)  
**Why**: Frequently accessed by authenticated users, changes occasionally

**Implementation**: `backend/projects/services/project_service.py`

```python
def get_user_projects(user_id):
    cache_key = settings.CACHE_KEYS["user_projects"].format(user_id=user_id)
    cached_projects = cache.get(cache_key)
    if cached_projects is not None:
        return cached_projects

    # Query database with N+1 optimisation
    projects = Project.objects.filter(members__user_id=user_id).select_related(...).prefetch_related(...)
    projects_list = list(projects)
    cache.set(cache_key, projects_list, timeout=settings.CACHE_TTL["user_projects"])
    return projects_list
```

**Invalidation**: When project is updated or deleted, cache is invalidated for all project members.

### Agency Branches

**Cache Key**: `spms:agency:all:branches`  
**TTL**: 1 hour (3600 seconds)  
**Why**: Rarely changes, frequently accessed for dropdowns and filters

**Implementation**: `backend/agencies/services/agency_service.py`

```python
def list_branches(search=None):
    if search:
        # Don't cache search results (too variable)
        return Branch.objects.filter(Q(name__icontains=search)).order_by("name")

    cache_key = "agency:all:branches"
    cached_branches = cache.get(cache_key)
    if cached_branches is not None:
        return cached_branches

    branches = list(Branch.objects.all().order_by("name"))
    cache.set(cache_key, branches, timeout=settings.CACHE_TTL["agency_branches"])
    return branches
```

**Invalidation**: When branch is created, updated, or deleted.

### User Profiles

**Cache Key**: `spms:user:{user_id}:profile`  
**TTL**: 10 minutes (600 seconds)  
**Why**: Accessed on every authenticated request, changes occasionally

**Implementation**: `backend/users/services/user_service.py`

```python
def get_user(user_id):
    cache_key = settings.CACHE_KEYS["user_profile"].format(user_id=user_id)
    cached_user = cache.get(cache_key)
    if cached_user is not None:
        return cached_user

    user = User.objects.select_related(...).prefetch_related(...).get(pk=user_id)
    cache.set(cache_key, user, timeout=settings.CACHE_TTL["user_profile"])
    return user
```

**Invalidation**: When user profile is updated or deleted.

## What We Don't Cache

### Search Results
**Why**: Too variable, low hit rate  
**Alternative**: Database query optimisation with indexes

### Real-Time Data
**Why**: Requires immediate consistency  
**Examples**: Notifications, recent activity

### Single-Record Lookups
**Why**: Database is fast enough for simple primary key lookups  
**Exception**: User profiles (accessed very frequently)

### Frequently Changing Data
**Why**: Cache would be invalidated too often  
**Examples**: Task status updates, real-time counters

## Cache Invalidation Strategy

### Explicit Invalidation (Preferred)

Invalidate cache immediately when data changes:

```python
@transaction.atomic
def update_project(pk, user, data):
    project = ProjectService.get_project(pk)
    # Update project
    for field, value in data.items():
        setattr(project, field, value)
    project.save()

    # Invalidate cache for all project members
    ProjectService.invalidate_project_member_caches(project)
    return project
```

### Time-Based Expiration (Fallback)

All cached data has TTL to ensure eventual consistency even if invalidation fails:

- **User projects**: 5 minutes
- **User profiles**: 10 minutes
- **Agency branches**: 1 hour

### Pattern-Based Invalidation

For invalidating multiple related keys:

```python
# Invalidate all user-related caches
cache.delete_pattern('spms:user:123:*')

# Invalidate all project caches
cache.delete_pattern('spms:project:*')
```

## Graceful Degradation

### Cache Failures Don't Break the Application

All cache operations are wrapped in try-except blocks:

```python
try:
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return cached_data
except Exception as e:
    logger.warning(f"Cache error: {e}")
    # Fall through to database query

# Always have database fallback
return query_database()
```

### Redis Unavailable

If Redis is unavailable:
1. Application logs warning
2. Falls back to database queries
3. Continues operating normally
4. Performance degrades but functionality remains

## Monitoring and Metrics

### Key Metrics to Track

**Cache Hit Rate**:
- Target: >70%
- Measure: (cache hits / total requests) × 100

**Cache Miss Rate**:
- Monitor for sudden increases (indicates invalidation issues)

**Average Response Time**:
- Cached: <10ms
- Uncached: 10-50ms

**Redis Memory Usage**:
- Alert at >80%
- Review cache TTLs if consistently high

**Cache Invalidation Frequency**:
- Monitor for excessive invalidations

### Monitoring Tools

**Development**:
- Django Debug Toolbar shows cache hits/misses
- Redis CLI: `redis-cli INFO stats`

**Production**:
- Azure Application Insights for response times
- Azure Cache for Redis metrics
- Custom logging for cache operations

### Logging

Cache operations are logged at DEBUG level:

```python
logger.debug(f"Cache hit for user {user_id} projects")
logger.debug(f"Cache miss for user {user_id} projects")
logger.debug(f"Invalidated cache for user {user_id} projects")
```

Errors are logged at WARNING level:

```python
logger.warning(f"Cache error for user {user_id}: {e}")
logger.warning(f"Failed to cache user {user_id} projects: {e}")
```

## Performance Considerations

### Cache Hit Rate Optimisation

**Good candidates for caching**:
- High read frequency
- Low write frequency
- Expensive to compute
- User-specific data

**Poor candidates for caching**:
- Low read frequency
- High write frequency
- Simple queries
- Real-time requirements

### Memory Management

**Current cache sizes** (estimated):
- User projects: ~10KB per user
- User profile: ~5KB per user
- Agency branches: ~50KB total

**Memory calculation**:
- 1000 active users × 15KB = ~15MB
- Branches: ~50KB
- **Total**: ~15MB (very manageable)

### Connection Pooling

Redis connection pool configured for 50 max connections:
- Sufficient for typical load
- Prevents connection exhaustion
- Automatic retry on timeout

## Troubleshooting

### Cache Not Working

**Symptoms**: No performance improvement, all requests hit database

**Checks**:
1. Verify Redis is running: `docker-compose ps redis`
2. Check Redis connectivity: `docker-compose exec redis redis-cli ping`
3. Review logs for cache errors
4. Verify `REDIS_URL` environment variable

### Cache Stale Data

**Symptoms**: Users see outdated information

**Checks**:
1. Verify cache invalidation is called on updates
2. Check TTL values (may be too long)
3. Review invalidation logic for edge cases
4. Manually flush cache: `cache.clear()`

### High Memory Usage

**Symptoms**: Redis memory usage >80%

**Actions**:
1. Review cache TTLs (reduce if too long)
2. Check for cache key leaks (keys not expiring)
3. Increase Redis memory allocation
4. Implement cache eviction policy

### Slow Cache Operations

**Symptoms**: Cache operations taking >100ms

**Checks**:
1. Check Redis server load
2. Review network latency
3. Check connection pool exhaustion
4. Consider Redis performance tuning

## Best Practices

### Do's

**Do: Always have database fallback**
```python
try:
    return cache.get(key) or query_database()
except Exception:
    return query_database()
```

**Do: Invalidate cache on data changes**
```python
def update_data(pk, data):
    obj.save()
    invalidate_cache(pk)  # Always invalidate
```

**Do: Use consistent cache key patterns**
```python
# Good: Use settings.CACHE_KEYS
cache_key = settings.CACHE_KEYS["user_projects"].format(user_id=user_id)

# Bad: Hardcoded strings
cache_key = f"user_{user_id}_projects"
```

**Do: Log cache operations for debugging**
```python
logger.debug(f"Cache hit for {key}")
logger.warning(f"Cache error: {e}")
```

### Don'ts

**Don't: Cache without TTL**
```python
# Bad: No expiration
cache.set(key, value)

# Good: Always set timeout
cache.set(key, value, timeout=300)
```

**Don't: Assume cache is always available**
```python
# Bad: No error handling
data = cache.get(key)
return data  # Breaks if cache fails

# Good: Graceful degradation
try:
    data = cache.get(key)
    if data:
        return data
except Exception:
    pass
return query_database()
```

**Don't: Cache everything**
```python
# Bad: Caching rarely accessed data
cache.set(f"rarely_used_{id}", data, timeout=3600)

# Good: Only cache frequently accessed data
if access_frequency > threshold:
    cache.set(key, data, timeout=300)
```

**Don't: Forget to invalidate**
```python
# Bad: Update without invalidation
def update_user(user_id, data):
    user.save()
    # Missing: invalidate_user_cache(user_id)

# Good: Always invalidate
def update_user(user_id, data):
    user.save()
    invalidate_user_cache(user_id)
```

## Future Enhancements

### Potential Improvements

1. **Cache Warming**: Pre-populate cache on deployment
2. **Distributed Caching**: Redis Cluster for high availability
3. **Cache Analytics**: Detailed hit/miss rate tracking
4. **Adaptive TTLs**: Adjust TTLs based on access patterns
5. **Cache Compression**: Reduce memory usage for large objects

### When to Expand Caching

Consider caching additional data when:
- Database load consistently >70%
- Response times >500ms for common queries
- User complaints about slow performance
- Monitoring shows specific slow queries

## Related Documentation

- [ADR-008: Redis Application-Level Caching](./ADR-008-redis-application-caching.md)
- [ADR-007: No Application-Level Nginx](./ADR-007-no-application-nginx.md)
