# ADR-008: Redis Application-Level Caching

## Context

The Science Projects Management System (SPMS) backend serves 1000+ registered users with both authenticated and public endpoints. The application includes a publicly accessible staff profiles feature that experiences high traffic. The application needs to:

- Reduce database load for frequently accessed data (both user-specific and public)
- Improve response times for authenticated API endpoints and public staff profiles
- Protect against DoS attacks on public endpoints
- Cache computed results and expensive queries
- Maintain data consistency across cache and database
- Support cache invalidation when data changes
- Operate independently of organisational edge proxy infrastructure

**Scale Context**: With 1000+ users and public staff profiles, the application experiences significant load that justifies application-level caching.

**Important Context**: The organisation's infrastructure includes an Edge proxy (Nginx with Varnish/Fastly) that handles HTTP-level caching for public content. However, this HTTP caching cannot help with:

- Authenticated user requests (unique per user)
- POST/PUT/DELETE operations (not cacheable at HTTP level)
- User-specific database queries
- Computed results that vary by user
- Public endpoints with user-specific elements or frequent updates

Therefore, we need application-level caching that operates under the application's control, complementing (not replacing) the existing HTTP caching infrastructure.

## Decision

We will implement application-level caching using Redis with Django's cache framework.

Redis provides:

- In-memory data store with sub-millisecond latency
- Support for complex data structures (strings, lists, sets, hashes)
- Automatic key expiration (TTL)
- Atomic operations for cache invalidation
- Persistence options for cache durability
- Excellent Django integration via django-redis

**Caching Strategy**:

- Cache user-specific database queries (project lists, user profiles)
- Cache computed results (aggregations, statistics)
- Cache frequently accessed reference data (agency branches)
- Use appropriate TTLs based on data change frequency
- Implement explicit cache invalidation on data updates
- Graceful degradation when Redis is unavailable

## Consequences

### Positive Consequences

- **Reduced Database Load**: Caching frequent queries reduces PostgreSQL load by 40-60%
- **Improved Response Times**: Sub-millisecond cache hits vs 10-50ms database queries
- **DoS Protection**: Absorbs repeated requests to public endpoints (staff profiles)
- **User-Specific Caching**: Can cache authenticated user data (unlike HTTP caching)
- **Public Endpoint Performance**: Staff profiles and public data served from cache
- **Application Control**: Cache invalidation under application control
- **Scalability**: Reduces database bottleneck for 1000+ concurrent users
- **Cost Effective**: Reduces need for larger database instances
- **Developer Experience**: Django's cache framework provides simple API
- **Graceful Degradation**: Application continues working if Redis fails
- **Flexible TTLs**: Different expiration times for different data types
- **Atomic Operations**: Redis ensures cache consistency

### Negative Consequences

- **Additional Infrastructure**: Requires Redis deployment and monitoring
- **Cache Invalidation Complexity**: Must invalidate cache on all data updates
- **Memory Usage**: Redis requires dedicated memory allocation
- **Stale Data Risk**: Incorrect invalidation can serve outdated data
- **Debugging Complexity**: Cache-related bugs can be difficult to diagnose
- **Operational Overhead**: Another service to monitor and maintain

### Neutral Consequences

- **Two-Tier Caching**: HTTP caching (Edge proxy) + Application caching (Redis)
- **Cache Warming**: May need cache warming strategies for cold starts
- **Key Management**: Requires consistent cache key naming conventions

## Alternatives Considered

### Database Query Caching

**Description**: Rely on PostgreSQL's query cache and connection pooling.

**Why Not Chosen**:

- PostgreSQL query cache is limited and not designed for application-level caching
- Cannot cache computed results or aggregations effectively
- No control over cache invalidation
- Limited to single database instance
- Insufficient for 1000+ user scale with public endpoints

**Trade-offs**: Database caching is automatic but insufficient for user-specific data and public endpoints at scale.

### Memcached

**Description**: Distributed memory caching system.

**Why Not Chosen**:

- Simpler data structures than Redis (only key-value)
- No persistence options
- Less flexible expiration policies
- Redis offers more features for similar complexity

**Trade-offs**: Memcached is slightly simpler but Redis provides more capabilities.

### Application-Level Nginx

**Description**: Deploy Nginx within the application for HTTP caching.

**Why Not Chosen**:

- Redundant with organisational Edge proxy (Varnish/Fastly)
- Cannot cache authenticated user requests
- Adds unnecessary complexity
- Infrastructure team already manages HTTP caching

**Trade-offs**: Nginx HTTP caching is powerful but inappropriate for authenticated APIs.

### Django's Database Cache Backend

**Description**: Store cache in PostgreSQL database.

**Why Not Chosen**:

- Defeats the purpose (caching to reduce database load)
- Slower than in-memory cache
- Adds load to database instead of reducing it

**Trade-offs**: Database cache backend is simple but counterproductive.

### No Caching

**Description**: Rely solely on database optimisation and Edge proxy.

**Why Not Chosen**:

- Edge proxy cannot cache authenticated requests
- Database queries remain expensive for user-specific data
- Scalability limited by database performance at 1000+ user scale
- Public endpoints (staff profiles) vulnerable to DoS attacks
- Recent DoS attacks on other OIM applications demonstrate real risk

**Trade-offs**: No caching is simplest but inadequate for current scale and security requirements.

## Implementation Notes

### Redis Configuration

**Deployment**:

- Redis 7.x (latest stable)
- Deployed as sidecar container in Kubernetes pod (development/staging)
- Azure Cache for Redis (production, managed service - organisational infrastructure choice)
- Memory: 1GB (development), 2-4GB (production)
- Persistence: RDB snapshots (production only)

**Django Settings** (`config/settings/cache.py`):

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'RETRY_ON_TIMEOUT': True,
            'MAX_CONNECTIONS': 50,
        },
        'KEY_PREFIX': 'spms',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Cache key patterns
CACHE_KEYS = {
    'staff_profile': 'staff:profile:{user_id}',
    'user_projects': 'user:{user_id}:projects',
    'user_profile': 'user:{user_id}:profile',
    'agency_branches': 'agency:{agency_id}:branches',
    'project_detail': 'project:{project_id}:detail',
}
```

### What to Cache

**Staff Profiles** (TTL: 1 hour):

- Publicly accessible staff directory
- High read frequency, low write frequency
- DoS protection for public endpoint
- Significant database query cost (joins across user, profile, employment, education tables)

**User Project Lists** (TTL: 5 minutes):

- Frequently accessed by authenticated users
- Moderate change frequency
- Significant database query cost (joins across multiple tables)

**Agency Branches** (TTL: 1 hour):

- Rarely changes
- Frequently accessed for dropdowns and filters
- Simple query but high access frequency

**User Profiles** (TTL: 10 minutes):

- Accessed on every authenticated request
- Changes occasionally (profile updates)
- Includes related data (employment, education)

**Project Statistics** (TTL: 15 minutes):

- Expensive aggregation queries
- Displayed on dashboards
- Acceptable staleness for statistics

**What NOT to Cache**:

- Search results (too variable, low hit rate)
- Real-time data (notifications, recent activity)
- Single-record lookups (database is fast enough)
- Data that changes frequently (task status updates)

### Cache Invalidation Strategy

**Explicit Invalidation** (preferred):

```python
from django.core.cache import cache
from django.conf import settings

class ProjectService:
    @staticmethod
    def update_project(project_id, data):
        # Update database
        project = Project.objects.get(pk=project_id)
        project.update(data)

        # Invalidate cache for all project members
        for member in project.members.all():
            cache_key = settings.CACHE_KEYS['user_projects'].format(
                user_id=member.user_id
            )
            cache.delete(cache_key)

        # Invalidate project detail cache
        cache_key = settings.CACHE_KEYS['project_detail'].format(
            project_id=project_id
        )
        cache.delete(cache_key)
```

**Pattern-Based Invalidation**:

```python
# Invalidate all user-related caches
cache.delete_pattern('user:123:*')

# Invalidate all project caches
cache.delete_pattern('project:*')
```

**Time-Based Expiration** (fallback):

- All cached data has TTL
- Ensures eventual consistency even if invalidation fails
- Shorter TTLs for frequently changing data

### Caching Patterns

**Cache-Aside Pattern** (primary):

```python
def get_user_projects(user_id):
    cache_key = settings.CACHE_KEYS['user_projects'].format(user_id=user_id)

    # Try cache first
    cached_projects = cache.get(cache_key)
    if cached_projects is not None:
        return cached_projects

    # Cache miss - query database
    projects = Project.objects.filter(
        members__user_id=user_id
    ).select_related('agency').prefetch_related('documents')

    # Cache for 5 minutes
    cache.set(cache_key, projects, timeout=300)
    return projects
```

**Graceful Degradation**:

```python
def get_user_projects(user_id):
    cache_key = settings.CACHE_KEYS['user_projects'].format(user_id=user_id)

    try:
        cached_projects = cache.get(cache_key)
        if cached_projects is not None:
            return cached_projects
    except Exception as e:
        logger.warning(f"Cache error: {e}")
        # Fall through to database query

    # Always have database fallback
    return Project.objects.filter(members__user_id=user_id)
```

### Monitoring and Metrics

**Key Metrics**:

- Cache hit rate (target: >70%)
- Cache miss rate
- Average response time (cached vs uncached)
- Redis memory usage
- Cache invalidation frequency

**Monitoring Tools**:

- Django Debug Toolbar (development)
- Azure Application Insights (production)
- Redis INFO command for server stats

**Alerting**:

- Redis memory usage >80%
- Cache hit rate <50%
- Redis connection failures

### Local Development

**Docker Compose** (`docker-compose.yml`):

```yaml
services:
    redis:
        image: redis:7-alpine
        ports:
            - "6379:6379"
        volumes:
            - redis_data:/data
        command: redis-server --appendonly yes
        healthcheck:
            test: ["CMD", "redis-cli", "ping"]
            interval: 10s
            timeout: 3s
            retries: 3

volumes:
    redis_data:
```

**Running Locally**:

```bash
# Start Redis
docker-compose up -d redis

# Verify Redis is running
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Testing Strategy

**Unit Tests**:

```python
def test_cache_get_set():
    cache.set('test_key', 'test_value', timeout=60)
    assert cache.get('test_key') == 'test_value'

def test_cache_invalidation():
    cache.set('test_key', 'test_value')
    cache.delete('test_key')
    assert cache.get('test_key') is None
```

**Integration Tests**:

```python
@pytest.mark.django_db
def test_cached_user_projects(client, sample_user):
    # First request - cache miss
    response1 = client.get('/api/v1/projects/')

    # Second request - cache hit
    response2 = client.get('/api/v1/projects/')

    assert response1.json() == response2.json()
```

### Migration Strategy

1. **Phase 1**: Add Redis to development environment
2. **Phase 2**: Implement caching for staff profiles (public endpoint, DoS protection)
3. **Phase 3**: Implement caching for user project lists
4. **Phase 4**: Add caching for agency branches and user profiles
5. **Phase 5**: Deploy to staging and measure performance
6. **Phase 6**: Deploy to production with monitoring
7. **Phase 7**: Expand caching to additional endpoints based on metrics

### Scale Justification

**Current Scale**: 1000+ registered users with publicly accessible staff profiles

**Why Redis is Necessary at This Scale**:

1. **User Volume**: 1000+ users generate significant database load
2. **Public Endpoints**: Staff profiles are publicly accessible and vulnerable to:
   - High traffic spikes
   - Scraping attempts
   - DoS attacks (other OIM apps have experienced this)
3. **Complex Queries**: Projects, team members, documents require expensive joins
4. **Performance Requirements**: Users expect sub-second response times
5. **Database Protection**: Without caching, database becomes bottleneck

**Monitoring Thresholds**:
- Cache hit rate target: >70%
- Database CPU usage: Should remain <50% with caching
- Response time improvement: 50-100ms (database) → <10ms (cache)
- DoS resilience: Cache absorbs repeated requests without database impact

**This is not premature optimisation** - at 1000+ users with public endpoints, Redis is appropriate architecture for performance and security.

### Rollback Plan

If Redis caching causes issues:

1. Disable caching via environment variable
2. Application continues working (graceful degradation)
3. Remove Redis deployment
4. Revert code changes if necessary

**Graceful Degradation Ensures**:

- Application never depends on Redis being available
- Cache failures don't break functionality
- Database queries always work as fallback

## References

- [Redis Documentation](https://redis.io/documentation)
- [django-redis Documentation](https://github.com/jazzband/django-redis)
- [Django Caching Framework](https://docs.djangoproject.com/en/4.2/topics/cache/)
- [Azure Cache for Redis](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Cache-Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-003: PostgreSQL Database Choice
    - ADR-006: Azure Kubernetes Deployment
    - ADR-007: No Application-Level Nginx

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
