# ADR-004: Poetry Dependency Management

## Context

The Science Projects Management System (SPMS) backend requires a dependency management solution that:

- Manages Python package dependencies reliably
- Provides deterministic builds across environments (development, staging, production)
- Handles dependency resolution conflicts automatically
- Supports development and production dependency separation
- Integrates with CI/CD pipelines
- Works well for single maintainer workflow
- Provides security vulnerability scanning
- Supports Python 3.11+

Traditional Python dependency management tools (pip + requirements.txt) have limitations:

- No automatic dependency resolution
- No lock file for deterministic builds
- Manual separation of dev/prod dependencies
- No built-in virtual environment management
- Difficult to track transitive dependencies

## Decision

We will use Poetry for Python dependency management in the SPMS backend.

**Context**: Poetry was the organisational standard at the time of the application's creation. While the current DBCA developer guidance (https://dbca-wa.github.io/developer-guidance/SoftwareDevelopment) now recommends uv for new projects, we continue using Poetry for consistency and stability in this established application.

Poetry provides:

- Declarative dependency specification in `pyproject.toml`
- Automatic dependency resolution with conflict detection
- Lock file (`poetry.lock`) for deterministic builds
- Built-in virtual environment management
- Separation of development and production dependencies
- Integration with modern Python packaging standards (PEP 517, PEP 621)
- Simple CLI for common operations

## Consequences

### Positive Consequences

- **Deterministic Builds**: `poetry.lock` ensures identical dependency versions across all environments
- **Dependency Resolution**: Automatic conflict detection prevents incompatible package combinations
- **Developer Experience**: Simple commands (`poetry add`, `poetry install`) reduce cognitive load
- **Virtual Environment Management**: Poetry handles virtual environment creation and activation
- **Security**: `poetry show --outdated` and integration with safety/bandit for vulnerability scanning
- **Modern Standards**: Uses `pyproject.toml` (PEP 518) instead of legacy `setup.py`
- **Dependency Groups**: Clear separation of dev, test, and production dependencies
- **Single Maintainer Friendly**: Reduces dependency management complexity
- **CI/CD Integration**: Works seamlessly with GitHub Actions and Azure Pipelines
- **Reproducible Environments**: Lock file ensures consistent behaviour across machines

### Negative Consequences

- **Learning Curve**: Team must learn Poetry commands instead of standard pip
- **Tool Dependency**: Adds Poetry as a required tool in development environment
- **Lock File Conflicts**: Merge conflicts in `poetry.lock` require resolution
- **Build Time**: Initial dependency resolution can be slower than pip
- **Ecosystem Adoption**: Some tools still expect `requirements.txt`

### Neutral Consequences

- **File Structure**: Uses `pyproject.toml` instead of `requirements.txt`
- **Command Changes**: `poetry add` instead of `pip install`
- **Virtual Environment Location**: Poetry manages venv location (can be configured)

## Alternatives Considered

### pip + requirements.txt

**Description**: Traditional Python package management with pip and requirements files.

**Why Not Chosen**:

- No automatic dependency resolution
- No lock file for deterministic builds
- Manual management of transitive dependencies
- Requires separate tools for virtual environment management
- Difficult to separate dev/prod dependencies cleanly

**Trade-offs**: pip is universal but lacks modern dependency management features.

### Pipenv

**Description**: Python dependency management tool with Pipfile and Pipfile.lock.

**Why Not Chosen**:

- Slower dependency resolution than Poetry
- Less active development and maintenance
- More complex CLI interface
- Larger community concerns about project direction
- Performance issues with large dependency trees

**Trade-offs**: Pipenv was an early attempt at modern Python dependency management but has been superseded by Poetry.

### pip-tools

**Description**: Set of tools for managing pip requirements files.

**Why Not Chosen**:

- Still uses requirements.txt format
- Requires multiple files (requirements.in, requirements.txt)
- No built-in virtual environment management
- More manual workflow than Poetry
- Less intuitive for single maintainer

**Trade-offs**: pip-tools improves pip workflow but doesn't provide the integrated experience of Poetry.

### Conda

**Description**: Package and environment management system.

**Why Not Chosen**:

- Primarily designed for data science workflows
- Larger installation footprint
- Slower dependency resolution
- Overkill for web application development
- Less common in Django ecosystem

**Trade-offs**: Conda excels for data science but adds unnecessary complexity for web applications.

## Implementation Notes

### Project Structure

**pyproject.toml**: Dependency specification

```toml
[tool.poetry]
name = "spms-backend"
version = "1.0.0"
description = "Science Projects Management System Backend"
authors = ["DBCA"]

[tool.poetry.dependencies]
python = "^3.11"
django = "^4.2"
djangorestframework = "^3.14"
psycopg = {extras = ["binary"], version = "^3.1"}
# ... other production dependencies

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
pytest-django = "^4.5"
pytest-cov = "^4.1"
black = "^23.0"
flake8 = "^6.0"
# ... other development dependencies
```

**poetry.lock**: Lock file (auto-generated, committed to git)

### Common Commands

```bash
# Install dependencies
poetry install                    # Install all dependencies
poetry install --no-dev          # Production only
poetry install --only dev        # Development only

# Add dependencies
poetry add django                # Add production dependency
poetry add --group dev pytest    # Add development dependency

# Update dependencies
poetry update                    # Update all dependencies
poetry update django             # Update specific package

# Show dependencies
poetry show                      # List all dependencies
poetry show --tree              # Show dependency tree
poetry show --outdated          # Show outdated packages

# Run commands
poetry run python manage.py test
poetry run pytest
poetry shell                     # Activate virtual environment
```

### Dependency Groups

- **Production**: Core application dependencies
- **dev**: Development tools (black, flake8, mypy)
- **test**: Testing frameworks (pytest, coverage)
- **docs**: Documentation tools (sphinx, if needed)


### Rollback Plan

If Poetry proves inadequate:

1. Export dependencies: `poetry export -f requirements.txt > requirements.txt`
2. Switch to current organisational standard and install our deps there
3. Update CI/CD pipelines (Docker)
4. Document new workflow

## References

- [Poetry Documentation](https://python-poetry.org/docs/)
- [PEP 518 - pyproject.toml](https://peps.python.org/pep-0518/)
- [PEP 621 - Project Metadata](https://peps.python.org/pep-0621/)
- [Poetry GitHub Repository](https://github.com/python-poetry/poetry)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-005: pytest Testing Framework
    - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
