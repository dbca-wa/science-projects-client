# Architecture Guide

## Overview

The SPMS backend is a Django REST Framework application organised into Django apps, each representing a distinct domain. The architecture follows a service layer pattern with clear separation of concerns.

## Project Structure

```
backend/
├── config/                 # Project configuration
├── agencies/              # Agency management
├── caretakers/            # Caretaker system
├── categories/            # Project categories
├── communications/        # Comments, messages, reactions
├── contacts/              # Contact information
├── documents/             # Document management
├── locations/             # Geographic locations
├── medias/                # Media files
├── projects/              # Project management
├── quotes/                # Project quotes
├── users/                 # User management
├── adminoptions/          # Admin configuration
├── common/                # Shared utilities
└── manage.py              # Django management
```

## Django App Organisation

Each app follows this structure:

```
app_name/
├── models.py              # Database models
├── serializers.py         # DRF serializers
├── views.py               # API views
├── urls.py                # URL routing
├── permissions/           # Custom permissions
├── services/              # Business logic
├── utils/                 # App utilities
├── tests/                 # Tests
└── migrations/            # Database migrations
```

## Architectural Layers

### Models Layer

Define database schema and basic model methods.

```python
class Project(models.Model):
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def is_active(self):
        return self.status == ProjectStatus.ACTIVE
```

### Serializers Layer

Handle data serialisation and validation.

**Pattern**: Separate read and write serializers.

```python
# Read serializer (nested objects)
class ProjectSerializer(serializers.ModelSerializer):
    owner = MiniUserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "title", "owner", "created_at"]

# Write serializer (IDs for relationships)
class ProjectCreateSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    class Meta:
        model = Project
        fields = ["title", "owner"]
```

### Services Layer

Encapsulate business logic.

```python
class ProjectService:
    @staticmethod
    def get_project(pk):
        try:
            return Project.objects.select_related("owner").get(pk=pk)
        except Project.DoesNotExist:
            raise NotFound(f"Project with pk {pk} not found")

    @staticmethod
    def create_project(data, user):
        with transaction.atomic():
            project = Project.objects.create(owner=user, **data)
            return project
```

### Views Layer

Handle HTTP requests and responses.

```python
class ProjectList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = ProjectService.get_user_projects(request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            project = ProjectService.create_project(
                serializer.validated_data,
                request.user
            )
            return Response(
                ProjectSerializer(project).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### Permissions Layer

Control access to resources.

```python
class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
```

## Service Layer Pattern

### Why Service Layer?

- Separates business logic from views
- Reusable across views and commands
- Easier to test
- Clearer code organisation

### Service Guidelines

**DO**:
- Put complex business logic in services
- Use services for multi-model operations
- Make services stateless (static methods)
- Return model instances or raise exceptions

**DON'T**:
- Put HTTP-specific logic in services
- Access `request` object in services
- Return Response objects from services

## API Design

### REST Principles

**Resources**: Use nouns, not verbs
```
GET    /api/v1/projects/list
POST   /api/v1/projects/list
GET    /api/v1/projects/123
PUT    /api/v1/projects/123
DELETE /api/v1/projects/123
```

**HTTP Methods**:
- GET: Retrieve resources
- POST: Create resources
- PUT: Update entire resource
- PATCH: Partial update
- DELETE: Remove resource

**Status Codes**:
- 200: Success
- 201: Created
- 204: No content
- 400: Bad request
- 401: Unauthorised
- 403: Forbidden
- 404: Not found
- 500: Server error

### API Versioning

All APIs versioned under `/api/v1/`:

```python
# config/urls.py
urlpatterns = [
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/users/", include("users.urls")),
]
```

### Response Format

**Success**:
```json
{
  "id": 123,
  "title": "Project Title",
  "owner": {"id": 456, "username": "john"},
  "created_at": "2026-02-07T10:30:00Z"
}
```

**Error**:
```json
{
  "detail": "Project not found"
}
```

**Validation error**:
```json
{
  "title": ["This field is required"],
  "owner": ["Invalid pk \"999\" - object does not exist."]
}
```

## Database Schema

### Key Models

- **User**: username, email, is_staff
- **Agency**: name, code, description
- **Project**: title, description, status, owner, agency
- **Document**: title, file, project, uploaded_by
- **Caretaker**: user, caretakee, approved

### Relationships

**One-to-Many**:
```python
owner = models.ForeignKey(
    User,
    on_delete=models.PROTECT,
    related_name="owned_projects"
)
```

**Many-to-Many**:
```python
team_members = models.ManyToManyField(
    User,
    related_name="projects",
    blank=True
)
```

## Authentication and Permissions

### Authentication

**Session authentication** (default):
- Used for browsable API
- CSRF protection required

### Permission Classes

```python
permission_classes = [IsAuthenticated]  # Require logged-in user
permission_classes = [IsStaffOrReadOnly]  # Staff can edit
permission_classes = [IsProjectOwnerOrReadOnly]  # Custom
```

## External Integrations

### IT Assets API

Fetch user data from IT Assets system.

```python
from users.services.it_assets_service import ITAssetsService
user_data = ITAssetsService.get_user_data(email)
```

### Library API

Fetch publication data.

```python
from documents.services.library_service import LibraryService
publications = LibraryService.get_user_publications(user_id)
```

## File Storage

### Media Files

```python
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "files"

class Document(models.Model):
    file = models.FileField(upload_to="documents/%Y/%m/")
```

**Serving**:
- Development: Django serves from `MEDIA_ROOT`
- Production: Nginx serves static files

### Static Files

```python
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
```

Collection: `poetry run python manage.py collectstatic`

## Configuration Management

### Environment Variables

**Required**:
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection
- `ENVIRONMENT`: development/staging/production

**Optional**:
- `DEBUG`: Enable debug mode
- `ALLOWED_HOSTS`: Comma-separated hostnames
- `SENTRY_URL`: Sentry DSN

### Settings Organisation

- Base settings: `config/settings.py`
- Environment-specific: `.env.development`, `.env.staging`, `.env.production`

## Caching Strategy

### Query Caching

```python
# Cache foreign key relationships
projects = Project.objects.select_related("owner", "agency").all()

# Cache reverse relationships
projects = Project.objects.prefetch_related("documents", "team_members").all()
```

### Redis Caching

Not currently implemented, but can be added (see ADR-008).

## Background Tasks

### Management Commands

```python
# users/management/commands/sync_users.py
class Command(BaseCommand):
    help = "Sync users from IT Assets"

    def handle(self, *args, **options):
        # Task logic
        self.stdout.write("Sync complete")
```

Run: `poetry run python manage.py sync_users`

### Celery

Not currently implemented (see `background-jobs.md` for strategy).

## Monitoring and Logging

### Logging Configuration

```python
LOGGING = {
    "version": 1,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
```

### Sentry Integration

```python
import sentry_sdk
sentry_sdk.init(
    dsn=os.getenv("SENTRY_URL"),
    environment=os.getenv("ENVIRONMENT"),
)
```

## Related Documentation

- **ADRs**: Architectural Decision Records (ADR-001 through ADR-010)
- **API Design**: `api-design.md` - REST API patterns
- **Caching Strategy**: `caching-strategy.md` - Redis approach
- **Background Jobs**: `background-jobs.md` - Async task strategy
- **Getting Started**: `../development/getting-started.md`
- **Feature Development**: `../development/feature-development.md`
- **Testing**: `../development/testing-guide.md`
