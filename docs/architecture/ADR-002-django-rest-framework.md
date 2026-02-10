# ADR-002: Django REST Framework Choice

## Context

The Science Projects Management System (SPMS) requires a robust backend API to serve data to a React frontend application (https://github.com/dbca-wa/science-projects-client). The system needs to:

- Provide RESTful API endpoints for project management, user management, and document handling
- Support authentication and authorisation for government users
- Handle file uploads and media management
- Integrate with Azure services (PostgreSQL, Blob Storage, Application Insights) - organisational infrastructure choice
- Be maintainable by a full-stack developer proficient in both frontend and backend, with consideration for potential dedicated frontend and backend developers working as a team
- Follow government security and compliance requirements
- Maintain clear separation of concerns between React frontend and Django backend

The choice of web framework significantly impacts development velocity, maintainability, security, and long-term sustainability of the application. Django is an organisational choice within DBCA, providing consistency across projects and leveraging existing infrastructure expertise.

## Decision

We will use Django REST Framework (DRF) as the foundation for the SPMS backend API.

Django REST Framework is built on top of Django and provides:
- Comprehensive REST API toolkit with serialisers, viewsets, and routers
- Built-in authentication and permission classes
- Browsable API for development and testing
- Extensive documentation and mature ecosystem
- Strong security defaults aligned with OWASP guidelines
- Excellent integration with Django ORM and admin interface
- Clear API contract for frontend-backend separation

## Consequences

### Positive Consequences

- **Rapid Development**: DRF's serialisers and viewsets significantly reduce boilerplate code for CRUD operations
- **Security by Default**: Built-in protection against common vulnerabilities (CSRF, XSS, SQL injection)
- **Mature Ecosystem**: Large community, extensive documentation, and proven track record in production
- **Maintainable**: Convention-over-configuration approach reduces decision fatigue
- **Government Compliance**: Django's security features align with government security requirements and is familiar to the infrastructure team
- **Excellent Documentation**: Comprehensive official documentation reduces learning curve
- **Admin Interface**: Django admin provides immediate data management capabilities
- **ORM Integration**: Seamless integration with Django's powerful ORM for database operations
- **Frontend Separation**: Clear REST API contract enables independent frontend development with React

### Negative Consequences

- **Monolithic Architecture**: DRF encourages monolithic applications, which may limit potential of future microservices migration (acceptable, single maintainer philosophy)
- **Learning Curve**: Developers unfamiliar with Django/DRF need to learn framework conventions (acceptable, organisational standard)
- **Performance Overhead**: Django's middleware stack and ORM can introduce latency compared to lighter frameworks (acceptable)

### Neutral Consequences

- **Python Ecosystem**: Commits the project to Python tooling and dependencies
- **Django Conventions**: Must follow Django's project structure and naming conventions
- **Version Coupling**: DRF versions are tied to Django versions, requiring coordinated upgrades

## Alternatives Considered

### FastAPI
**Description**: Modern, fast Python web framework with automatic API documentation.

**Why Not Chosen**:
- Less mature ecosystem compared to Django/DRF
- Requires more manual implementation of common features (admin interface, ORM, migrations)
- Async-first design adds complexity for a single-maintainer project
- Less extensive documentation for government compliance patterns

**Trade-offs**: FastAPI offers better raw performance but requires more development effort for features Django provides out-of-the-box.

### Flask + Flask-RESTful
**Description**: Lightweight Python web framework with REST extension.

**Why Not Chosen**:
- Requires manual integration of many components (ORM, migrations, admin)
- Less opinionated structure increases decision-making burden
- Smaller ecosystem for government/enterprise patterns
- More security configuration required

**Trade-offs**: Flask offers more flexibility but requires significantly more setup and maintenance effort.

### Node.js + Express
**Description**: JavaScript-based backend framework.

**Why Not Chosen**:
- Different language from existing Python expertise in organisation
- Less mature ecosystem for government compliance
- Requires more manual security configuration
- No built-in ORM or admin interface

**Trade-offs**: Node.js offers JavaScript consistency with frontend but lacks Django's comprehensive feature set.

## Implementation Notes

### Key Components Used
- **Django LTS (latest)**: Long-term support version for stability
- **Django REST Framework (latest stable)**: Latest stable DRF version
- **djangorestframework-simplejwt**: JWT authentication (if needed)
- **django-cors-headers**: CORS configuration for frontend integration
- **django-filter**: Advanced filtering capabilities

### Project Structure
```
backend/
├── config/              # Django settings and configuration
├── [app_name]/          # Django apps (projects, users, agencies, etc.)
│   ├── models.py        # Database models
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views
│   ├── urls.py          # URL routing
│   └── tests/           # Test suite
└── manage.py            # Django management script
```

### Migration Strategy
- Initial implementation completed with DRF
- All API endpoints follow REST conventions
- Authentication uses Django's session-based auth with CSRF protection
- Rewritten from Django 1 to Django 4 & 5. Data migrated via ETL pipeline

### Rollback Plan
If DRF proves inadequate:
1. API contracts (URLs, request/response formats) remain stable
2. Backend can be reimplemented in alternative framework
3. Database schema is framework-agnostic
4. Frontend remains unaffected due to API abstraction

## References

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Django Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Django_Security_Cheat_Sheet.html)
- [Django LTS Release Notes](https://docs.djangoproject.com/en/stable/releases/)
- Related ADRs:
  - ADR-003: PostgreSQL Database Choice
  - ADR-004: Poetry Dependency Management
  - ADR-005: pytest Testing Framework

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
