# Getting Started

Goal: Get the SPMS backend running on your machine in under 30 minutes.

Related Documentation: [Local Setup](local-setup.md), [Testing Guide](testing-guide.md), [Pre-commit](pre-commit.md)

## Prerequisites

Before you begin, ensure you have:

- Python (latest) - Required for Django development
- Poetry - Python dependency management (organisational standard)
- PostgreSQL (latest) - Database server
- pre-commit - Git hooks for code quality
- Git - Version control

## Quick Setup (7 Steps)

### 1. Clone the Repository

```bash
git clone https://github.com/dbca-wa/science-projects-service.git
```

### 2. Install Dependencies

```bash
poetry install
```

This creates a virtual environment and installs all dependencies from `poetry.lock`.

### 3. Create Database

```bash
createdb spms
```

If you get a connection error, ensure PostgreSQL is running:
```powershell
# Windows - Check PostgreSQL service status
Get-Service postgresql-x64-*

# Start PostgreSQL service
Start-Service postgresql-x64-<version>

# Or use Services app:
# 1. Press Win+R, type services.msc
# 2. Find PostgreSQL service
# 3. Right-click → Start
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
```bash
DATABASE_URL=postgresql://127.0.0.1/spms
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### 5. Run Migrations

```bash
poetry run python manage.py migrate
```

This creates all database tables.

### 6. Create Superuser

```bash
poetry run python manage.py createsuperuser
```

Follow the prompts to create an admin account.

**Note:** Superuser creation is required for frontend testing. After creating the superuser, you'll need to create related records (UserWork, UserContact, UserProfile, StaffProfile). See [Local Setup](local-setup.md#creating-a-superuser) for complete instructions.

### 7. Start Development Server

```bash
poetry run python manage.py runserver
```

The server will start at `http://127.0.0.1:8000`.

## Verification Steps

### 1. Check Server is Running

Open your browser to:
- **API Root:** http://127.0.0.1:8000/api/v1/
- **Admin Panel:** http://127.0.0.1:8000/admin/

You should see the API browsable interface and admin login.

### 2. Run Tests

```bash
poetry run pytest
```

Expected output:
```
============================= test session starts ==============================
collected 183 items

...

============================= 183 passed in 6.23s ==============================
```

### 3. Verify Pre-commit

```bash
pre-commit install
pre-commit run --all-files
```

Expected output:
```
black....................................................................Passed
isort....................................................................Passed
flake8...................................................................Passed
bandit...................................................................Passed
```

## What's Next?

Now that you're set up, here's what to do next:

### Learn the Codebase

1. **[Architecture](../architecture/README.md)** - Understand the application structure
2. **[Code Style](code-style.md)** - Learn our coding standards
3. **[Testing Guide](testing-guide.md)** - Understand our testing approach

### Start Contributing

1. **[Feature Development](feature-development.md)** - Step-by-step guide for adding features
2. **[Pre-commit](pre-commit.md)** - Understand code quality checks
3. **[CI/CD](../../general/deployment/ci-cd-overview.md)** - Learn about our deployment pipeline

### Explore the Application

```bash
# Access Django shell
poetry run python manage.py shell

# Create test data
poetry run python manage.py loaddata fixtures/test_data.json

# Run specific app tests
poetry run pytest agencies/tests/

# Check code coverage
poetry run pytest --cov=agencies
```

## Common Setup Issues

### Issue: `createdb: error: connection to server failed`

Solution: PostgreSQL is not running. Start it:
```powershell
# Windows (if installed as service)
net start postgresql-x64-*

# Or check Services app (services.msc) and start PostgreSQL service
```

### Issue: `ModuleNotFoundError: No module named 'psycopg2'`

Solution: Reinstall dependencies:
```powershell
poetry install
```

### Issue: `django.db.utils.OperationalError: FATAL: database "spms" does not exist`

Solution: Create the database:
```powershell
createdb spms
```

### Issue: `poetry: command not found`

Solution: Install Poetry:
```powershell
# Using pip
pip install poetry

# Or using official installer
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

### Issue: Tests fail with `ImportError`

Solution: Ensure you're using Poetry's virtual environment:
```powershell
poetry run pytest
# NOT: pytest
```

### Issue: Pre-commit hooks fail

Solution: Install pre-commit hooks:
```powershell
pre-commit install
```

## Detailed Setup

Need more details? See [Local Setup](local-setup.md) for:
- Detailed PostgreSQL configuration
- Environment variable explanations
- Database seeding with fixtures
- Media file setup
- Advanced configuration options

## Troubleshooting

For more issues and solutions, see [General Operations Documentation](../../general/operations/).
