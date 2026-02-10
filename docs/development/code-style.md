# Code Style Guide

Python and Django coding standards for the SPMS backend.

Related Documentation: [Pre-commit](pre-commit.md), [Architecture](../architecture/overview.md)

## Overview

The SPMS backend follows PEP 8 with Django-specific conventions. Code formatting is automated using black, isort, and autoflake through pre-commit hooks.

## Python Style

### PEP 8 Compliance

- Line length: 88 characters (black default)
- Ignore E203, W503 (black-incompatible rules)

### Code Formatting

**black** handles all formatting automatically. **isort** organises imports automatically.

**Import groups:**
1. Standard library
2. Third-party packages (Django, DRF, etc.)
3. Local application

### Naming Conventions

- **Variables and functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods**: Prefix with single underscore `_method_name`

### Type Hints

Use type hints for function signatures:

```python
from typing import Optional, List, Dict, Any
from django.contrib.auth.models import User

def get_user_projects(
    user: User,
    include_archived: bool = False
) -> List[Dict[str, Any]]:
    """Get all projects for a user."""
    projects = user.projects.all()
    if not include_archived:
        projects = projects.filter(archived=False)
    return list(projects.values())
```

### Docstrings

Use triple-quoted strings:

```python
def calculate_project_metrics(project, start_date, end_date):
    """
    Calculate metrics for a project within a date range.

    Args:
        project: Project instance
        start_date: Start of date range (inclusive)
        end_date: End of date range (inclusive)

    Returns:
        Dictionary containing calculated metrics

    Raises:
        ValueError: If date range is invalid
    """
    if start_date > end_date:
        raise ValueError("Start date must be before end date")

    return metrics
```

## Django Conventions

### Models

**Field ordering:**
1. Primary key (if custom)
2. Foreign keys
3. Regular fields
4. Timestamps (created_at, updated_at)

```python
class Project(models.Model):
    """Project model."""

    # Foreign keys
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name="projects")
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name="owned_projects")

    # Regular fields
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=ProjectStatus.choices)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
```

### Views

**Class-based views** (preferred):

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ProjectList(APIView):
    """List and create projects."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all projects."""
        projects = ProjectService.get_user_projects(request.user)
        return Response(ProjectSerializer(projects, many=True).data)

    def post(self, request):
        """Create a new project."""
        serializer = ProjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            project = ProjectService.create_project(serializer.validated_data, request.user)
            return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### Serializers

**Separate read and write serializers:**

```python
# Read serializer (nested objects)
class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for reading projects."""

    owner = MiniUserSerializer(read_only=True)
    agency = AgencySerializer(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "title", "description", "status", "owner", "agency"]

# Write serializer (IDs for relationships)
class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating projects."""

    agency = serializers.PrimaryKeyRelatedField(queryset=Agency.objects.all())

    class Meta:
        model = Project
        fields = ["title", "description", "status", "agency"]
```

### Services

**Service layer pattern** (business logic):

```python
class ProjectService:
    """Service for project operations."""

    @staticmethod
    def get_project(pk):
        """Get project by primary key."""
        try:
            return Project.objects.select_related("owner", "agency").get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound(f"Project with pk {pk} not found")

    @staticmethod
    def create_project(data, user):
        """Create a new project."""
        return Project.objects.create(owner=user, **data)
```

## URL Patterns

### No Trailing Slashes

**CRITICAL**: All URLs use NO trailing slashes.

```python
# Correct
path("projects/list", ProjectList.as_view()),
path("projects/<int:pk>", ProjectDetail.as_view()),

# Wrong
path("projects/list/", ProjectList.as_view()),
```

### Primary Key Convention

Use `pk` internally, `id` externally:

```python
# URL patterns - use pk
path("projects/<int:pk>", ProjectDetail.as_view()),

# View methods - use pk parameter
def get(self, request, pk):
    project = ProjectService.get_project(pk)
    return Response(ProjectSerializer(project).data)

# ORM queries - use pk
Project.objects.get(pk=pk)

# Serializers - output id field
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "title", ...]  # 'id' in output
```

## Error Handling

Use Django REST Framework exceptions:

```python
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

def get_project(pk):
    """Get project or raise NotFound."""
    try:
        return Project.objects.get(pk=pk)
    except Project.DoesNotExist:
        raise NotFound(f"Project with pk {pk} not found")
```

## Logging

```python
import logging

logger = logging.getLogger(__name__)

# Log levels
logger.debug(f"Processing project {project.pk}")
logger.info(f"Project {project.pk} created by user {user.pk}")
logger.warning(f"Project {project.pk} has no documents")
logger.error(f"Failed to create project: {str(e)}")
logger.critical(f"Database connection lost")
```

**Best practices:**
- Use structured logging with `extra` parameter
- Always use `logger.exception()` in except blocks
- Never log passwords or tokens

## Security Best Practices

### Input Validation

```python
# Always validate user input
serializer = ProjectCreateSerializer(data=request.data)
if not serializer.is_valid():
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Use serializer validated data
project = ProjectService.create_project(serializer.validated_data, request.user)
```

### SQL Injection Prevention

```python
# Good - use ORM
projects = Project.objects.filter(owner=user)

# Good - parameterised queries
projects = Project.objects.raw("SELECT * FROM projects WHERE owner_id = %s", [user.pk])

# Bad - string interpolation
projects = Project.objects.raw(f"SELECT * FROM projects WHERE owner_id = {user.pk}")
```

### Permission Checks

```python
class ProjectDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = ProjectService.get_project(pk)

        # Check object-level permission
        if not project.is_viewable_by(request.user):
            raise PermissionDenied()

        return Response(ProjectSerializer(project).data)
```

## QuerySet Optimisation

### Select Related

Use for foreign key relationships:

```python
# Good - single query
projects = Project.objects.select_related("owner", "agency").all()

# Bad - N+1 queries
projects = Project.objects.all()
for project in projects:
    print(project.owner.username)  # Extra query per project
```

### Prefetch Related

Use for many-to-many and reverse foreign key relationships:

```python
# Good - two queries
projects = Project.objects.prefetch_related("documents", "team_members").all()

# Bad - N+1 queries
projects = Project.objects.all()
for project in projects:
    print(project.documents.count())  # Extra query per project
```

### Exists vs Count

```python
# Good - check existence
if Project.objects.filter(owner=user).exists():
    pass

# Bad - count when only checking existence
if Project.objects.filter(owner=user).count() > 0:
    pass
```

## Testing Conventions

```python
class TestProjectModel(TestCase):
    """Tests for Project model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.project = Project.objects.create(title="Test Project", owner=self.user)

    def test_project_creation(self):
        """Test project can be created."""
        assert self.project.title == "Test Project"

    def test_project_str(self):
        """Test project string representation."""
        assert str(self.project) == "Test Project"
```

**Test naming:**
- Use descriptive names: `test_user_can_create_project`
- Not vague names: `test_project`

## Comments

**Do comment:**
- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs
- Security considerations

**Don't comment:**
- Obvious code
- What the code does (use docstrings)
- Commented-out code (delete it)

## Next Steps

- [Architecture](../architecture/overview.md) - Application structure
- [Pre-commit](pre-commit.md) - Automated code quality checks
- [Testing Guide](testing-guide.md) - Testing guidelines
