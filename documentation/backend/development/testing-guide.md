# Testing Guide

## Overview

This guide covers testing practices, test execution, and troubleshooting for the Science Projects Management System (SPMS) backend.

## Test Execution

### Basic Commands

```bash
# Run all tests (sequential, default)
poetry run pytest

# Run specific test file
poetry run pytest agencies/tests/test_views.py

# Run specific test
poetry run pytest agencies/tests/test_views.py::test_agency_list

# Run with verbose output
poetry run pytest -v

# Run only failed tests from last run
poetry run pytest --lf

# Run tests matching pattern
poetry run pytest -k "test_user"
```

### Parallel Execution

**Important**: Parallel test execution is **opt-in** due to potential database conflicts.

```bash
# Run tests in parallel (opt-in)
poetry run pytest -n auto

# Run with specific number of workers
poetry run pytest -n 8

# Disable parallel execution (if enabled by default)
poetry run pytest -n 0
```

**Why parallel execution is opt-in**:
- Database conflicts with `--reuse-db` flag
- Shared fixtures can cause unique constraint violations
- Some tests may not be properly isolated
- Sequential execution is fast enough for most development workflows

**When to use parallel execution**:
- Running full test suite in CI/CD
- After making changes that affect many tests
- When you need faster feedback on large test suites

**Troubleshooting parallel execution failures**:
1. Run tests sequentially first: `poetry run pytest -n 0`
2. If tests pass sequentially but fail in parallel, there's a test isolation issue
3. Check for:
   - Shared database state
   - Fixed usernames/emails in fixtures
   - Global state modifications
   - File system operations without unique paths

### Coverage Reports

```bash
# Run with coverage (default)
poetry run pytest

# Run without coverage
poetry run pytest --no-cov

# Generate HTML coverage report
poetry run pytest --cov --cov-report=html
# Open htmlcov/index.html in browser

# Generate XML coverage report (for CI/CD)
poetry run pytest --cov --cov-report=xml
```

## Test Structure

### Directory Organisation

```
backend/
├── agencies/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py          # App-specific fixtures
│   │   ├── test_models.py       # Model tests
│   │   ├── test_serializers.py  # Serialiser tests
│   │   ├── test_views.py        # View/API tests
│   │   └── test_services.py     # Service layer tests
│   └── ...
├── conftest.py                   # Root fixtures
└── pytest.ini                    # pytest configuration
```

### Test Categories

**Unit Tests** (70%):
- Model methods and properties
- Serialiser validation logic
- Service layer business logic
- Utility functions
- Fast execution, no external dependencies

**Integration Tests** (25%):
- API endpoint behaviour
- Database queries and transactions
- Authentication and permissions
- File upload handling
- Slower execution, requires database

**Edge Cases** (5%):
- Error handling
- Boundary conditions
- Race conditions
- Invalid input handling

## Common Fixtures

### Available Fixtures

Defined in `backend/common/tests/conftest.py`:

```python
# API clients
api_client              # Unauthenticated API client
authenticated_client    # Authenticated with regular user
admin_client           # Authenticated with superuser

# Users
user                   # Regular user (testuser)
superuser             # Superuser (admin)
multiple_users        # List of 3 users
```

### Using Fixtures

```python
import pytest

def test_user_list(authenticated_client):
    """Test that authenticated users can list users."""
    response = authenticated_client.get("/api/v1/users/list")
    assert response.status_code == 200

def test_admin_only_endpoint(admin_client):
    """Test that only admins can access admin endpoints."""
    response = admin_client.post("/api/v1/admin/action")
    assert response.status_code == 200
```

### Creating App-Specific Fixtures

Create `conftest.py` in your app's `tests/` directory:

```python
# agencies/tests/conftest.py
import pytest
from agencies.models import Agency

@pytest.fixture
def sample_agency(db):
    """Create a sample agency for testing."""
    return Agency.objects.create(
        name="Test Agency",
        code="TEST",
    )

@pytest.fixture
def multiple_agencies(db):
    """Create multiple agencies for testing."""
    return [
        Agency.objects.create(name=f"Agency {i}", code=f"AG{i}")
        for i in range(1, 4)
    ]
```

## Test Patterns

### Model Tests

```python
import pytest
from agencies.models import Agency

@pytest.mark.django_db
def test_agency_creation():
    """Test that agencies can be created."""
    agency = Agency.objects.create(
        name="Test Agency",
        code="TEST",
    )
    assert agency.name == "Test Agency"
    assert agency.code == "TEST"
    assert str(agency) == "Test Agency"

@pytest.mark.django_db
def test_agency_unique_code():
    """Test that agency codes must be unique."""
    Agency.objects.create(name="Agency 1", code="TEST")

    with pytest.raises(Exception):  # IntegrityError
        Agency.objects.create(name="Agency 2", code="TEST")
```

### Serialiser Tests

```python
import pytest
from agencies.serializers import AgencySerializer

@pytest.mark.django_db
def test_agency_serializer_valid_data():
    """Test serialiser with valid data."""
    data = {
        "name": "Test Agency",
        "code": "TEST",
    }
    serializer = AgencySerializer(data=data)
    assert serializer.is_valid()
    agency = serializer.save()
    assert agency.name == "Test Agency"

@pytest.mark.django_db
def test_agency_serializer_invalid_data():
    """Test serialiser with invalid data."""
    data = {
        "name": "",  # Empty name
        "code": "TEST",
    }
    serializer = AgencySerializer(data=data)
    assert not serializer.is_valid()
    assert "name" in serializer.errors
```

### API View Tests

```python
import pytest

@pytest.mark.django_db
def test_agency_list_unauthenticated(api_client):
    """Test that unauthenticated users cannot list agencies."""
    response = api_client.get("/api/v1/agencies/list")
    assert response.status_code == 401

@pytest.mark.django_db
def test_agency_list_authenticated(authenticated_client, sample_agency):
    """Test that authenticated users can list agencies."""
    response = authenticated_client.get("/api/v1/agencies/list")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == sample_agency.name

@pytest.mark.django_db
def test_agency_create(admin_client):
    """Test that admins can create agencies."""
    data = {
        "name": "New Agency",
        "code": "NEW",
    }
    response = admin_client.post("/api/v1/agencies/list", data)
    assert response.status_code == 201
    assert response.json()["name"] == "New Agency"
```

### Parametrised Tests

```python
import pytest

@pytest.mark.django_db
@pytest.mark.parametrize("name,code,expected_str", [
    ("Agency 1", "AG1", "Agency 1"),
    ("Agency 2", "AG2", "Agency 2"),
    ("Test Agency", "TEST", "Test Agency"),
])
def test_agency_string_representation(name, code, expected_str):
    """Test agency string representation with multiple inputs."""
    agency = Agency.objects.create(name=name, code=code)
    assert str(agency) == expected_str
```

## Troubleshooting

### Tests Pass Individually But Fail Together

**Symptom**: `pytest path/to/test.py::test_name` passes, but `pytest path/to/test.py` fails.

**Cause**: Test isolation issue - tests are affecting each other's state.

**Solutions**:
1. Ensure each test uses `@pytest.mark.django_db` decorator
2. Don't modify global state
3. Use fixtures instead of module-level setup
4. Check for database state leaking between tests

### Tests Pass Sequentially But Fail in Parallel

**Symptom**: `pytest` passes, but `pytest -n auto` fails.

**Cause**: Database conflicts or shared resources.

**Solutions**:
1. Run sequentially: `pytest -n 0`
2. Use unique identifiers in fixtures (UUIDs instead of fixed usernames)
3. Ensure proper test isolation
4. Check for file system operations without unique paths

### Database Errors

**Symptom**: `django.db.utils.OperationalError: database is locked`

**Cause**: SQLite database conflicts (should not happen in production with PostgreSQL).

**Solutions**:
1. Ensure `DATABASES` in settings uses PostgreSQL for tests
2. Check that `--reuse-db` is configured correctly
3. Verify database connection settings

### Import Errors

**Symptom**: `ModuleNotFoundError` or `ImportError`

**Cause**: Python path or virtual environment issues.

**Solutions**:
1. Ensure you're in the Poetry virtual environment: `poetry shell`
2. Install dependencies: `poetry install`
3. Check that `PYTHONPATH` includes backend directory
4. Verify `pytest.ini` has correct `testpaths`

### Slow Tests

**Symptom**: Tests take too long to run.

**Solutions**:
1. Use `--reuse-db` to avoid recreating database (already default)
2. Run specific tests instead of full suite during development
3. Use `--lf` to run only failed tests
4. Consider parallel execution: `pytest -n auto` (if tests are isolated)
5. Profile slow tests: `pytest --durations=10`

## Best Practices

### Test Isolation

- Each test should be independent
- Use fixtures for setup, not module-level code
- Don't rely on test execution order
- Clean up after tests (fixtures handle this automatically)

### Test Naming

```python
# Correct: Descriptive test names
def test_user_can_create_project_with_valid_data():
    pass

def test_user_cannot_create_project_without_name():
    pass

# Incorrect: Vague test names
def test_project():
    pass

def test_create():
    pass
```

### Assertions

```python
# Correct: Specific assertions with messages
assert response.status_code == 200, f"Expected 200, got {response.status_code}"
assert "name" in response.json(), "Response missing 'name' field"

# Incorrect: Generic assertions
assert response.status_code
assert response.json()
```

### Test Data

```python
# Correct: Use fixtures for reusable test data
@pytest.fixture
def sample_project(db, user):
    return Project.objects.create(
        title="Test Project",
        owner=user,
    )

# Incorrect: Duplicate test data in every test
def test_project_update():
    user = User.objects.create(...)
    project = Project.objects.create(...)
    # ...
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: |
    poetry run pytest \
      --cov \
      --cov-report=xml \
      --cov-report=term-missing \
      -v

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./backend/coverage.xml
```

### Coverage Requirements

- Minimum 80% code coverage
- Critical paths require 100% coverage
- Coverage reports generated in HTML and XML formats
- Coverage badge displayed in README

## References

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django Documentation](https://pytest-django.readthedocs.io/)
- [Django Testing Documentation](https://docs.djangoproject.com/en/stable/topics/testing/)
- Related ADRs:
  - ADR-005: pytest Testing Framework

---
