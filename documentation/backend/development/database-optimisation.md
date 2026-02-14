# Database Optimisation

Database optimisation strategies for the Science Projects Management System backend.

## Overview

This guide covers indexing strategies, query optimisation patterns, connection pooling, and transaction management.

## Indexing Strategy

### Current Indexes

**Caretaker Model:**
```python
class Meta:
    indexes = [
        models.Index(fields=["user"]),
        models.Index(fields=["caretaker"]),
        models.Index(fields=["end_date"]),
    ]
```

**Project Member Model:**
```python
class Meta:
    unique_together = (("project", "user"),)  # Creates implicit index
```

### Indexing Guidelines

**When to add an index:**
- Foreign key fields used in `filter()` or `select_related()`
- Fields used in `WHERE` clauses frequently
- Fields used in `ORDER BY` clauses
- Fields used in `JOIN` operations

**When NOT to add an index:**
- Small tables (< 1000 rows)
- Fields with low cardinality (few unique values)
- Fields rarely used in queries
- Write-heavy tables (indexes slow down INSERT/UPDATE)

**Index types:**
```python
# Single field index
models.Index(fields=["field_name"])

# Composite index (order matters!)
models.Index(fields=["field1", "field2"])

# Unique constraint (creates index automatically)
unique_together = (("field1", "field2"),)
```

### Monitoring Index Usage

Use Django's query logging in development:

```python
# settings.py (development only)
if DEBUG:
    LOGGING = {
        'version': 1,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        },
    }
```

## Query Optimisation Patterns

### N+1 Query Problem

**Bad:**
```python
# N+1 queries (1 for projects + N for business areas)
projects = Project.objects.all()
for project in projects:
    print(project.business_area.name)  # Triggers query per project
```

**Good:**
```python
# 1 query with JOIN
projects = Project.objects.select_related("business_area")
for project in projects:
    print(project.business_area.name)  # No additional query
```

### select_related() vs prefetch_related()

**select_related()** - Use for ForeignKey and OneToOneField:
```python
# Single JOIN query
projects = Project.objects.select_related(
    "business_area",
    "business_area__division",
)
```

**prefetch_related()** - Use for ManyToManyField and reverse ForeignKey:
```python
# Separate queries with Python-side JOIN
projects = Project.objects.prefetch_related(
    "members",
    "members__user",
)
```

**Combined Example:**
```python
# Optimised project list query
projects = Project.objects.select_related(
    "business_area",
    "business_area__leader",
).prefetch_related(
    "members",
    "members__user",
)
```

### Counting Efficiently

```python
# Bad - loads all objects into memory
count = len(Project.objects.all())

# Good - database COUNT query
count = Project.objects.count()
```

### Checking Existence

```python
# Bad - loads all objects
if Project.objects.filter(year=2024):
    pass

# Good - database EXISTS query
if Project.objects.filter(year=2024).exists():
    pass
```

### Bulk Operations

```python
# Bad - N queries
for project in projects:
    project.status = "active"
    project.save()

# Good - 1 query
Project.objects.filter(year=2024).update(status="active")

# Or bulk_update for different values
projects = Project.objects.filter(year=2024)
for project in projects:
    project.status = calculate_status(project)
Project.objects.bulk_update(projects, ["status"], batch_size=100)
```

## Database Performance Monitoring

### Query Logging

```python
# settings.py (development only)
if DEBUG:
    LOGGING = {
        'version': 1,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        },
    }
```

**What to monitor:**
- Number of queries per request
- Duplicate queries
- Slow queries (> 100ms)
- Missing indexes

### PostgreSQL EXPLAIN

```python
# In Django shell
from projects.models import Project

queryset = Project.objects.select_related("business_area")
print(queryset.explain(analyze=True, verbose=True))
```

**Look for:**
- Sequential scans on large tables (add index)
- High cost estimates
- Nested loops vs hash joins

### Performance Metrics

**Target metrics:**
- < 50ms for simple queries
- < 200ms for complex queries with JOINs
- < 10 queries per page load
- Zero N+1 queries

## Connection Pooling

### Current Configuration

```python
# settings.py (production only)
if not DEBUG:
    DATABASES["default"].update({
        "CONN_MAX_AGE": 60,  # Keep connections alive for 60 seconds
        "OPTIONS": {
            "connect_timeout": 30,
        },
    })
```

### Benefits

- Reduced connection overhead
- Better performance (connection creation is expensive)
- Resource efficiency

### Tuning Guidelines

**CONN_MAX_AGE:**
- `0`: No pooling (new connection per request)
- `60`: Keep connections for 60 seconds (recommended)
- `None`: Persistent connections (use with caution)

## Transaction Management

### When to Use Transactions

Use transactions for:
- Multiple related database operations
- Operations that must succeed or fail together
- Data consistency requirements

### Transaction Decorator

```python
from django.db import transaction

@transaction.atomic
def create_project_with_members(project_data, member_data):
    # All operations in one transaction
    project = Project.objects.create(**project_data)

    for member in member_data:
        ProjectMember.objects.create(project=project, **member)

    # If any operation fails, all are rolled back
    return project
```

### Transaction Context Manager

```python
from django.db import transaction

def update_project_status(project_id, new_status):
    with transaction.atomic():
        project = Project.objects.select_for_update().get(pk=project_id)
        project.status = new_status
        project.save()

        # Update related records
        project.members.update(notified=False)
```

### Best Practices

**1. Keep transactions short:**
```python
# Bad - long-running transaction
@transaction.atomic
def process_projects():
    for project in Project.objects.all():
        time.sleep(1)  # Holds transaction lock
        project.process()

# Good - short transactions
def process_projects():
    for project in Project.objects.all():
        with transaction.atomic():
            project.process()
```

**2. Use select_for_update() for row locking:**
```python
@transaction.atomic
def update_project_safely(project_id):
    # Lock row until transaction completes
    project = Project.objects.select_for_update().get(pk=project_id)
    project.status = "active"
    project.save()
```

## Common Pitfalls

### 1. Forgetting select_related()

```python
# Bad - N+1 queries
for project in Project.objects.all():
    print(project.business_area.name)

# Good - 1 query
for project in Project.objects.select_related("business_area"):
    print(project.business_area.name)
```

### 2. Using len() Instead of count()

```python
# Bad - loads all objects
total = len(Project.objects.all())

# Good - database COUNT
total = Project.objects.count()
```

### 3. Iterating Over QuerySets Multiple Times

```python
# Bad - executes query twice
projects = Project.objects.all()
count = projects.count()  # Query 1
for project in projects:  # Query 2
    pass

# Good - cache queryset
projects = list(Project.objects.all())  # Query 1
count = len(projects)  # No query
for project in projects:  # No query
    pass
```

### 4. Not Using Indexes on Foreign Keys

```python
# Bad - no index on frequently queried field
class ProjectMember(models.Model):
    project = models.ForeignKey(Project)  # Automatic index
    role = models.CharField()  # No index

# Good - add index for filtered fields
class ProjectMember(models.Model):
    project = models.ForeignKey(Project)
    role = models.CharField(db_index=True)  # Add index
```

## Monitoring and Alerts

### Key Metrics to Monitor

- Query count per request: Target < 10
- Slow query threshold: > 100ms
- Database connection count: Monitor for leaks
- Cache hit rate: Target > 80%
- Database CPU usage: Alert if > 80%

### Azure Application Insights

Queries are automatically tracked via Application Insights:
- Query duration
- Query frequency
- Slow query alerts

See `../../general/operations/monitoring.md` for configuration.

## Resources

- Django Query Optimisation: https://docs.djangoproject.com/en/stable/topics/db/optimization/
- PostgreSQL Performance Tips: https://wiki.postgresql.org/wiki/Performance_Optimization
- Django Logging: https://docs.djangoproject.com/en/stable/topics/logging/
