# Performance Optimisation Guide

## Overview

This guide covers performance optimisation techniques for the Science Projects Management System (SPMS) backend. The focus is on database query optimisation, N+1 query detection, and connection pooling.

## Django Debug Toolbar

Django Debug Toolbar is configured for development environments to help identify performance issues.

### Accessing Debug Toolbar

1. **Start development server**: `poetry run python manage.py runserver`
2. **Open any page** in your browser
3. **Click the Debug Toolbar** panel on the right side of the page

### Key Panels

**SQL Panel** (Most Important):
- Shows all database queries executed for the current request
- Highlights duplicate queries (N+1 problem indicators)
- Shows query execution time
- Provides EXPLAIN output for slow queries

**Timer Panel**:
- Shows total request/response time
- Breaks down time by component (view, template, middleware)

**Cache Panel**:
- Shows cache hits/misses
- Displays cache keys and values
- Helps optimise caching strategy

## N+1 Query Detection

### What is the N+1 Problem?

The N+1 query problem occurs when:
1. You fetch N objects from the database (1 query)
2. For each object, you access a related field, triggering N additional queries

**Example of N+1 Problem**:
```python
# ❌ BAD: N+1 queries
projects = Project.objects.all()  # 1 query
for project in projects:
    print(project.business_area.name)  # N queries (one per project)
    # Total: 1 + N queries
```

### Detecting N+1 Queries

**Using Django Debug Toolbar**:
1. Open the SQL panel
2. Look for **duplicate or similar queries**
3. Check the **number of queries** (should be minimal)
4. Look for queries with **similar WHERE clauses** but different IDs

**Example in Debug Toolbar**:
```sql
SELECT * FROM projects_project WHERE id = 1;
SELECT * FROM agencies_businessarea WHERE id = 5;  -- Repeated for each project
SELECT * FROM agencies_businessarea WHERE id = 7;
SELECT * FROM agencies_businessarea WHERE id = 12;
...
```

**Using Django's Query Counter**:
```python
from django.test.utils import override_settings
from django.db import connection
from django.test.utils import CaptureQueriesContext

with CaptureQueriesContext(connection) as queries:
    # Your code here
    projects = Project.objects.all()
    for project in projects:
        print(project.business_area.name)

print(f"Number of queries: {len(queries)}")
for query in queries:
    print(query['sql'])
```

### Fixing N+1 Queries

Use `select_related()` for **foreign keys** and **one-to-one** relationships:

```python
# ✅ GOOD: 1 query with JOIN
projects = Project.objects.select_related('business_area').all()
for project in projects:
    print(project.business_area.name)  # No additional query
    # Total: 1 query
```

Use `prefetch_related()` for **many-to-many** and **reverse foreign key** relationships:

```python
# ✅ GOOD: 2 queries (1 for projects, 1 for all members)
projects = Project.objects.prefetch_related('members').all()
for project in projects:
    for member in project.members.all():  # No additional queries
        print(member.username)
    # Total: 2 queries
```

## Query Optimisation Patterns

### Pattern 1: select_related() for Foreign Keys

**Use Case**: Accessing related objects via foreign key or one-to-one relationship.

**Before** (N+1 queries):
```python
# ❌ BAD: 1 + N queries
projects = Project.objects.all()
for project in projects:
    print(f"{project.title} - {project.business_area.name}")
    print(f"Lead: {project.project_lead.username}")
```

**After** (1 query):
```python
# ✅ GOOD: 1 query with JOINs
projects = Project.objects.select_related(
    'business_area',
    'project_lead'
).all()
for project in projects:
    print(f"{project.title} - {project.business_area.name}")
    print(f"Lead: {project.project_lead.username}")
```

**SQL Generated**:
```sql
SELECT
    projects_project.*,
    agencies_businessarea.*,
    users_user.*
FROM projects_project
INNER JOIN agencies_businessarea ON (projects_project.business_area_id = agencies_businessarea.id)
INNER JOIN users_user ON (projects_project.project_lead_id = users_user.id);
```

### Pattern 2: prefetch_related() for Many-to-Many

**Use Case**: Accessing related objects via many-to-many or reverse foreign key.

**Before** (1 + N queries):
```python
# ❌ BAD: 1 + N queries
projects = Project.objects.all()
for project in projects:
    for member in project.members.all():  # N queries
        print(member.username)
```

**After** (2 queries):
```python
# ✅ GOOD: 2 queries
projects = Project.objects.prefetch_related('members').all()
for project in projects:
    for member in project.members.all():  # No additional queries
        print(member.username)
```

**SQL Generated**:
```sql
-- Query 1: Get all projects
SELECT * FROM projects_project;

-- Query 2: Get all related members in one query
SELECT
    users_user.*,
    projects_project_members.project_id
FROM users_user
INNER JOIN projects_project_members ON (users_user.id = projects_project_members.user_id)
WHERE projects_project_members.project_id IN (1, 2, 3, ...);
```

### Pattern 3: Combining select_related() and prefetch_related()

**Use Case**: Accessing both foreign keys and many-to-many relationships.

```python
# ✅ GOOD: Optimised for both types of relationships
projects = Project.objects.select_related(
    'business_area',
    'project_lead'
).prefetch_related(
    'members',
    'documents'
).all()

for project in projects:
    # Foreign keys (select_related)
    print(f"Business Area: {project.business_area.name}")
    print(f"Lead: {project.project_lead.username}")

    # Many-to-many (prefetch_related)
    for member in project.members.all():
        print(f"Member: {member.username}")

    for doc in project.documents.all():
        print(f"Document: {doc.title}")
```

### Pattern 4: Nested Prefetching

**Use Case**: Accessing related objects of related objects.

```python
from django.db.models import Prefetch

# ✅ GOOD: Prefetch with nested relationships
projects = Project.objects.prefetch_related(
    Prefetch(
        'documents',
        queryset=ProjectDocument.objects.select_related('creator', 'modifier')
    )
).all()

for project in projects:
    for doc in project.documents.all():
        print(f"Document: {doc.title}")
        print(f"Created by: {doc.creator.username}")  # No additional query
        print(f"Modified by: {doc.modifier.username}")  # No additional query
```

### Pattern 5: only() and defer() for Large Models

**Use Case**: Fetching only required fields to reduce data transfer.

```python
# ✅ GOOD: Fetch only required fields
projects = Project.objects.only(
    'id',
    'title',
    'status',
    'business_area__name'  # Can span relationships
).select_related('business_area')

# ✅ GOOD: Exclude large text fields
projects = Project.objects.defer(
    'description',  # Large text field
    'methodology'   # Large text field
).all()
```

### Pattern 6: values() and values_list() for Aggregations

**Use Case**: When you only need specific fields, not full model instances.

```python
# ✅ GOOD: Get only required data as dictionaries
project_data = Project.objects.values(
    'id',
    'title',
    'business_area__name'
)

# ✅ GOOD: Get only required data as tuples
project_ids = Project.objects.values_list('id', flat=True)
```

## Database Connection Pooling

### Configuration

Connection pooling is configured in `config/settings.py`:

```python
# Production database optimisations
if not DEBUG:
    DATABASES["default"].update(
        {
            "CONN_MAX_AGE": 60,  # Keep connections alive for 60 seconds
            "OPTIONS": {
                "connect_timeout": 30,  # Connection timeout in seconds
            },
        }
    )
```

### Benefits

- **Reduced latency**: Reuses existing connections instead of creating new ones
- **Better performance**: Eliminates connection overhead for each request
- **Resource efficiency**: Limits number of database connections

### Tuning Guidelines

**CONN_MAX_AGE**:
- **0** (default): Close connection after each request
- **60-300**: Good for most applications (1-5 minutes)
- **None**: Never close connections (use with caution)

**Recommended values**:
- **Development**: 0 (default, easier debugging)
- **Staging**: 60 seconds
- **Production**: 300 seconds (5 minutes)

### Monitoring Connection Pool

```python
from django.db import connections

# Check connection status
connection = connections['default']
print(f"Connection alive: {connection.connection is not None}")
print(f"Connection closed: {connection.connection is None}")
```

## Performance Testing

### Measuring Query Performance

```python
import time
from django.db import connection, reset_queries
from django.conf import settings

# Enable query logging
settings.DEBUG = True

# Reset query counter
reset_queries()

# Your code here
start_time = time.time()
projects = Project.objects.select_related('business_area').all()
list(projects)  # Force evaluation
end_time = time.time()

# Print results
print(f"Queries executed: {len(connection.queries)}")
print(f"Time taken: {end_time - start_time:.4f} seconds")

# Print each query
for query in connection.queries:
    print(f"Query: {query['sql']}")
    print(f"Time: {query['time']} seconds")
```

### Benchmarking with pytest-benchmark

```python
import pytest

@pytest.mark.benchmark
def test_project_list_performance(benchmark):
    """Benchmark project list query performance."""
    def fetch_projects():
        return list(
            Project.objects.select_related('business_area').all()
        )

    result = benchmark(fetch_projects)
    assert len(result) > 0
```

## Common Performance Anti-Patterns

### Anti-Pattern 1: Accessing Related Objects in Loops

```python
# ❌ BAD: N+1 queries
for project in Project.objects.all():
    print(project.business_area.name)  # Query per iteration

# ✅ GOOD: 1 query
for project in Project.objects.select_related('business_area'):
    print(project.business_area.name)
```

### Anti-Pattern 2: Counting with len()

```python
# ❌ BAD: Fetches all objects into memory
count = len(Project.objects.all())

# ✅ GOOD: Uses COUNT(*) query
count = Project.objects.count()
```

### Anti-Pattern 3: Checking Existence with count()

```python
# ❌ BAD: Counts all objects
if Project.objects.filter(status='active').count() > 0:
    pass

# ✅ GOOD: Stops at first match
if Project.objects.filter(status='active').exists():
    pass
```

### Anti-Pattern 4: Multiple Queries for Same Data

```python
# ❌ BAD: Multiple queries
active_projects = Project.objects.filter(status='active')
completed_projects = Project.objects.filter(status='completed')

# ✅ GOOD: Single query with annotation
from django.db.models import Q, Count

projects = Project.objects.annotate(
    active_count=Count('id', filter=Q(status='active')),
    completed_count=Count('id', filter=Q(status='completed'))
)
```

## Performance Checklist

Before deploying code, verify:

- [ ] No N+1 queries (check Django Debug Toolbar SQL panel)
- [ ] `select_related()` used for foreign keys
- [ ] `prefetch_related()` used for many-to-many relationships
- [ ] `only()` or `defer()` used for large models when appropriate
- [ ] `count()` used instead of `len()` for counting
- [ ] `exists()` used instead of `count() > 0` for existence checks
- [ ] Database indexes exist for frequently queried fields
- [ ] Connection pooling configured for production

## Resources

- [Django Database Optimisation](https://docs.djangoproject.com/en/5.0/topics/db/optimization/)
- [Django Debug Toolbar Documentation](https://django-debug-toolbar.readthedocs.io/)
- [select_related() Documentation](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#select-related)
- [prefetch_related() Documentation](https://docs.djangoproject.com/en/5.0/ref/models/querysets/#prefetch-related)
- Related Documentation:
  - `database-optimisation.md` - Database indexing and migration best practices
  - `../architecture/caching-strategy.md` - Application-level caching with Redis

---

**Purpose**: Guide for identifying and fixing performance issues  
**Audience**: Backend developers  
**Maintenance**: Update when new optimisation patterns are discovered
