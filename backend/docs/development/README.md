# Development Documentation

## Overview

This directory contains development guides, workflows, and best practices for working on the Science Projects Management System backend.

## Getting Started

New to the project? Start here:

1. **[getting-started.md](getting-started.md)** - Quick setup guide (< 30 minutes)
2. **[local-setup.md](local-setup.md)** - Detailed environment setup
3. **[testing-guide.md](testing-guide.md)** - Run your first tests

## Development Guides

### Core Workflow

- **[feature-development.md](feature-development.md)** - Step-by-step guide for adding features
- **[code-style.md](code-style.md)** - Coding standards and conventions
- **[pre-commit.md](pre-commit.md)** - Pre-commit hooks and code quality checks

### Testing & Quality

- **[testing-guide.md](testing-guide.md)** - Comprehensive testing guide with patterns and troubleshooting
- **[performance-optimization.md](performance-optimization.md)** - Performance monitoring and optimization
- **[database-optimization.md](database-optimization.md)** - Database query optimization and indexing

## Quick Reference

### Common Commands

```bash
# Setup
poetry install
poetry run python manage.py migrate

# Development
poetry run python manage.py runserver
poetry run python manage.py shell

# Testing
poetry run pytest
poetry run pytest --cov=.

# Code Quality
poetry run pre-commit run --all-files
```

### Development Workflow

1. Create feature branch
2. Make changes following [code-style.md](code-style.md)
3. Write tests ([testing-guide.md](testing-guide.md))
4. Run pre-commit checks ([pre-commit.md](pre-commit.md))
5. Submit pull request

## Related Documentation

- **Architecture**: `../architecture/` - Application structure and design decisions
- **Deployment**: `../deployment/` - CI/CD and deployment guides
- **Operations**: `../operations/` - Troubleshooting and operational procedures
- **Security**: `../security/` - Security guidelines and review process
