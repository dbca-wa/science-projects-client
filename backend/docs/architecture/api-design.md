# API Design

REST API design principles and conventions for the Science Projects Management System.

## Overview

RESTful API under `/api/v1/` using JSON for all requests and responses.

## Versioning

**URL-based versioning:** `/api/v1/`

**Version format:** `v1`, `v2` (major versions only)

**Breaking changes require new version:**
- Removing endpoints
- Changing response structure
- Renaming/changing field types

**Non-breaking changes:**
- Adding endpoints
- Adding optional fields
- Bug fixes

## REST Principles

**Resource-oriented URLs:**
```
GET    /api/v1/projects/list          # List projects
GET    /api/v1/projects/123            # Get project
POST   /api/v1/projects/list           # Create project
PUT    /api/v1/projects/123            # Update project
DELETE /api/v1/projects/123            # Delete project
```

**HTTP Methods:**
- `GET`: Retrieve (safe, idempotent)
- `POST`: Create (not idempotent)
- `PUT`: Update (idempotent)
- `DELETE`: Remove (idempotent)

## URL Structure

**No trailing slashes** (REST API best practice):
```python
# settings.py
APPEND_SLASH = False
```

**Why:**
- Modern REST convention (GitHub, Stripe, Twilio)
- Avoids 301 redirects
- Prevents 500 errors on PUT/PATCH/DELETE

**Django include() requirement:**
```python
# config/urls.py - trailing slash REQUIRED on include()
path("api/v1/projects/", include("projects.urls"))

# projects/urls.py - NO trailing slashes
path("list", views.Projects.as_view())
path("<int:pk>", views.ProjectDetails.as_view())
```

**Resource naming:**
- Use plural nouns: `/projects/list`, `/users/me`
- Use kebab-case: `/project-members/list`
- Nested resources: `/projects/123/team`

## Pagination

**Query parameters:**
```
GET /api/v1/projects/list?page=2&page_size=24
```

**Response format:**
```json
{
  "projects": [...],
  "total_results": 150,
  "total_pages": 7,
  "current_page": 2,
  "page_size": 24
}
```

**Implementation:**
```python
# common/utils/pagination.py
def paginate_queryset(queryset, request):
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", settings.PAGE_SIZE))

    start = (page - 1) * page_size
    end = start + page_size

    return {
        "items": queryset[start:end],
        "total_results": queryset.count(),
        "total_pages": (queryset.count() + page_size - 1) // page_size,
        "current_page": page,
        "page_size": page_size,
    }
```

**Best practices:**
- Always include total count
- Validate page parameters
- Use database-level pagination (`queryset[start:end]`)

## Filtering and Search

**Standard filters:**
```
GET /api/v1/projects/list?status=active&year=2024&businessarea=5
GET /api/v1/projects/list?searchTerm=biodiversity
GET /api/v1/users/list?search=john&only_staff=true
```

**Implementation:**
```python
# projects/services/project_service.py
@staticmethod
def list_projects(user, filters=None):
    projects = Project.objects.all()

    if filters:
        # Search term
        search_term = filters.get("searchTerm")
        if search_term:
            projects = projects.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term)
            )

        # Status filter
        status = filters.get("status")
        if status and status != "All":
            projects = projects.filter(status=status)

    return projects
```

**Best practices:**
- Case-insensitive search (`__icontains`)
- Multiple field search (use `Q` objects)
- Full-text search for large datasets (PostgreSQL `SearchVector`)

## Error Responses

**Standard format:**
```json
{
  "error": "Error message",
  "detail": "Detailed explanation",
  "field_errors": {
    "email": ["This field is required"],
    "year": ["Ensure this value is greater than 2000"]
  }
}
```

**HTTP status codes:**
- `200 OK`: Successful GET/PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorised
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

**Implementation:**
```python
from rest_framework.exceptions import NotFound, ValidationError

def get(self, request, pk):
    try:
        project = ProjectService.get_project(pk)
    except Project.DoesNotExist:
        raise NotFound(f"Project {pk} not found")

    return Response(ProjectSerializer(project).data)
```

## Authentication and Authorisation

**Session-based authentication:**
```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
}
```

**Login/Logout:**
```
POST /api/v1/users/log-in
POST /api/v1/users/log-out
```

**Permission classes:**
```python
from rest_framework.permissions import IsAuthenticated

class Projects(APIView):
    permission_classes = [IsAuthenticated]
```

**Object-level permissions:**
```python
from ..permissions.project_permissions import CanEditProject

class ProjectDetails(APIView):
    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [IsAuthenticated(), CanEditProject()]
        return [IsAuthenticated()]
```

## Best Practices

**1. Use service layer for business logic:**
```python
# views/crud.py
class Projects(APIView):
    def get(self, request):
        projects = ProjectService.list_projects(request.user, request.query_params)
        return Response(ProjectSerializer(projects, many=True).data)
```

**2. Validate input with serializers:**
```python
def post(self, request):
    serializer = CreateProjectSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    project = serializer.save()
    return Response(ProjectSerializer(project).data, status=HTTP_201_CREATED)
```

**3. Use transactions for multi-step operations:**
```python
from django.db import transaction

@transaction.atomic
def post(self, request):
    project = Project.objects.create(...)
    ProjectMember.objects.create(project=project, ...)
    return Response(...)
```

**4. Return appropriate status codes:**
- `201 Created` for POST
- `204 No Content` for DELETE
- `400 Bad Request` for validation errors

**5. Include related data efficiently:**
```python
projects = Project.objects.select_related(
    "business_area",
).prefetch_related(
    "members",
    "members__user",
)
```

## Related Documentation

- **URL Pattern Standard:** See `backend-integration-guide.md` (steering file)
- **ADR-002:** Django REST Framework
- **Database Optimisation:** `../development/database-optimisation.md`
