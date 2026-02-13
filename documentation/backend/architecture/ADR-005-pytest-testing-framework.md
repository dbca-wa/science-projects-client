# ADR-005: pytest Testing Framework

## Context

The Science Projects Management System (SPMS) backend requires a comprehensive testing strategy to ensure:

- Code correctness and reliability
- Regression prevention during refactoring
- Confidence in deployments
- Documentation through tests
- Fast feedback during development
- Integration with CI/CD pipelines
- Single maintainer sustainability

Django provides a built-in testing framework based on unittest, but modern Python testing has evolved with more powerful alternatives. The testing framework must support:

- Unit tests for business logic
- Integration tests for API endpoints
- Database transaction handling
- Test fixtures and factories
- Code coverage reporting
- Parallel test execution
- Clear, readable test output

## Decision

We will use pytest as the primary testing framework for the SPMS backend, with pytest-django for Django integration.

pytest provides:

- Simple, Pythonic test syntax (no class inheritance required)
- Powerful fixture system for test setup
- Detailed assertion introspection
- Parametrised testing for multiple test cases
- Plugin ecosystem (pytest-django, pytest-cov, pytest-xdist)
- Better error messages than unittest
- Parallel test execution support

## Consequences

### Positive Consequences

- **Readable Tests**: Simple function-based tests without class boilerplate
- **Powerful Fixtures**: Reusable test setup with dependency injection
- **Better Assertions**: Detailed failure messages with actual vs expected values
- **Parametrisation**: Test multiple scenarios with single test function
- **Plugin Ecosystem**: Rich plugins for coverage, parallel execution, Django integration
- **Fast Feedback**: Parallel execution reduces test suite runtime
- **Developer Experience**: More intuitive than unittest for Python developers
- **Debugging**: Better error messages speed up debugging
- **CI/CD Integration**: Excellent support in GitHub Actions and Azure Pipelines
- **Coverage Reporting**: Integrated coverage with pytest-cov

### Negative Consequences

- **Learning Curve**: Developers familiar with unittest must learn pytest conventions
- **Django Integration**: Requires pytest-django plugin (additional dependency)
- **Fixture Complexity**: Advanced fixture usage can become complex
- **Magic**: Fixture auto-discovery can be less explicit than unittest setup

### Neutral Consequences

- **Test Discovery**: Uses different discovery patterns than Django's test runner
- **File Naming**: Requires `test_*.py` or `*_test.py` naming convention
- **Configuration**: Uses `pytest.ini` or `pyproject.toml` for configuration

## Alternatives Considered

### Django's unittest Framework

**Description**: Django's built-in testing framework based on Python's unittest.

**Why Not Chosen**:

- More verbose test syntax (class-based, setUp/tearDown methods)
- Less powerful assertion messages
- No built-in parametrisation
- Slower test execution (no parallel support without plugins)
- Less intuitive fixture management

**Trade-offs**: unittest is built-in but pytest offers superior developer experience and features.

### nose2

**Description**: Successor to nose testing framework.

**Why Not Chosen**:

- Less active development than pytest
- Smaller plugin ecosystem
- Less intuitive fixture system
- Declining community adoption

**Trade-offs**: nose2 was popular but has been largely superseded by pytest.

### Robot Framework

**Description**: Keyword-driven test automation framework.

**Why Not Chosen**:

- Designed for acceptance testing, not unit testing
- Overkill for backend API testing
- Requires learning custom keyword syntax
- Better suited for end-to-end UI testing

**Trade-offs**: Robot Framework excels for acceptance testing but is inappropriate for unit/integration tests.

## Implementation Notes

### Project Configuration

**pytest.ini**:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts =
    --reuse-db
    --nomigrations
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-report=json
    --cov-config=.coveragerc
    -v
testpaths = .
```

**pyproject.toml** (alternative):

```toml
[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "config.settings"
python_files = ["tests.py", "test_*.py", "*_tests.py"]
addopts = "--reuse-db --nomigrations --cov"
```

### Test Structure

```
backend/
├── agencies/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_models.py
│   │   ├── test_serializers.py
│   │   ├── test_views.py
│   │   └── test_services.py
│   └── ...
├── conftest.py          # Shared fixtures
└── pytest.ini           # pytest configuration
```

### Common Test Patterns

**Simple Function Test**:

```python
def test_user_creation():
    user = User.objects.create(username="test", email="test@example.com")
    assert user.username == "test"
    assert user.email == "test@example.com"
```

**Fixture Usage**:

```python
@pytest.fixture
def sample_user(db):
    return User.objects.create(username="test", email="test@example.com")

def test_user_profile(sample_user):
    assert sample_user.username == "test"
```

**Parametrised Tests**:

```python
@pytest.mark.parametrize("username,email", [
    ("user1", "user1@example.com"),
    ("user2", "user2@example.com"),
])
def test_user_creation_multiple(username, email):
    user = User.objects.create(username=username, email=email)
    assert user.username == username
```

**API Endpoint Tests**:

```python
@pytest.mark.django_db
def test_user_list_endpoint(client, sample_user):
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    assert len(response.json()) == 1
```

### Key Dependencies

```toml
[tool.poetry.group.test.dependencies]
pytest = "^7.4"
pytest-django = "^4.5"
pytest-cov = "^4.1"
pytest-xdist = "^3.3"      # Parallel execution
pytest-mock = "^3.11"      # Mocking support
factory-boy = "^3.3"       # Test factories
faker = "^19.0"            # Fake data generation
```

### Running Tests

```bash
# Run all tests
poetry run pytest

# Run specific test file
poetry run pytest agencies/tests/test_views.py

# Run specific test
poetry run pytest agencies/tests/test_views.py::test_agency_list

# Run with coverage
poetry run pytest --cov

# Run in parallel (based on cores of device)
poetry run pytest -n auto

# Run with verbose output
poetry run pytest -v

# Run only failed tests
poetry run pytest --lf

# Run tests matching pattern
poetry run pytest -k "test_user"
```

### CI/CD Integration

**GitHub Actions**:

See test.yaml in .github/workflows for integration in pipeline.

### Coverage Requirements

- Minimum 80% code coverage
- Critical paths require 100% coverage
- Coverage reports generated in HTML and XML formats
- Coverage badge displayed in README

### Test Categories

**Unit Tests** (70%):

- Model methods
- Serialiser validation
- Service layer logic
- Utility functions

**Integration Tests** (25%):

- API endpoints
- Database queries
- Authentication flows
- Permission checks

**Edge Cases** (5%):

- Error handling
- Boundary conditions
- Race conditions

### Migration Strategy

- Initial implementation uses pytest
- All new tests written with pytest
- No migration needed (greenfield project)

### Rollback Plan

If pytest proves inadequate:

1. Tests can be converted to unittest format
2. Django's test runner can execute pytest tests
3. Minimal code changes required (mostly imports)

## References

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django Documentation](https://pytest-django.readthedocs.io/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Django Testing Documentation](https://docs.djangoproject.com/en/stable/topics/testing/)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-004: Poetry Dependency Management
    - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
