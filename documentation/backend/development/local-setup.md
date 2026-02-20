# Local Setup Guide

Detailed instructions for setting up the SPMS backend development environment on Windows 11 SOE.

Related Documentation: [Getting Started](getting-started.md), [Testing Guide](testing-guide.md)

## Overview

This guide provides detailed setup instructions for local development.

## Prerequisites Installation

**Note**: These instructions are for Windows 11 SOE. For macOS/Linux, adapt commands as needed.

### Python (Latest)

Windows 11:
1. Download latest Python from https://www.python.org/downloads/
2. Run installer
3. Check "Add Python to PATH"
4. Click "Install Now"

Verify:
```powershell
python --version
```

### Poetry

Windows 11:
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

Or using pip:
```powershell
pip install poetry
```

Verify:
```powershell
poetry --version
```

Configure (optional):
```powershell
poetry config virtualenvs.in-project true
```

### PostgreSQL

Windows 11:
1. Download latest PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer (includes pgAdmin)
3. Remember the password you set for postgres user
4. Add PostgreSQL bin directory to PATH

Verify:
```powershell
psql --version
```

### pre-commit

```powershell
pip install pre-commit
```

Verify:
```powershell
pre-commit --version
```

### Redis (Optional)

Redis is used for application-level caching (see ADR-008). The application will work without Redis (graceful degradation).

Windows 11 (using WSL2):
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
redis-cli ping  # Should output: PONG
```

Alternative (Docker):
```powershell
docker run -d -p 6379:6379 redis:latest
```

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/dbca-wa/science-projects-service.git
```

### 2. Install Dependencies

Using setup script (recommended):
```powershell
.\setup-dev.sh
```

Manual installation:
```powershell
poetry install
poetry run pre-commit install
```

### 3. PostgreSQL Setup

Create database:
```bash
createdb spms
```

Create database user (optional):
```bash
psql postgres

CREATE USER spms_user WITH PASSWORD 'your_password';
CREATE DATABASE spms OWNER spms_user;
GRANT ALL PRIVILEGES ON DATABASE spms TO spms_user;

\q
```

Verify connection:
```bash
psql spms
\dt  # List tables (should be empty initially)
\q
```

## Environment Configuration

### 1. Create .env File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env`:

```bash
# Required
ENVIRONMENT=development
SECRET_KEY='your-secret-key-here'
DATABASE_URL=postgresql://127.0.0.1/spms

# Optional
TIME_ZONE=Australia/Perth
TZ=Australia/Perth
DEFAULT_FROM_EMAIL='SPMS <spms-noreply@example.com>'
SPMS_MAINTAINER_EMAIL='your-email@example.com'
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
```

### 3. Generate Secret Key

```bash
poetry run python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copy the output and paste it as your `SECRET_KEY` in `.env`.

## Database Setup

### 1. Run Migrations

```bash
poetry run python manage.py migrate
```

### 2. Create Superuser

```bash
poetry run python manage.py createsuperuser
```

Follow the prompts:
```
Username: admin
Email address: admin@example.com
Password: ********
```

### 3. Load Fixtures (Optional)

```bash
# Load test fixtures (if available)
poetry run python manage.py loaddata fixtures/test_data.json

# Create custom fixtures
poetry run python manage.py dumpdata agencies --indent 2 > fixtures/agencies.json
poetry run python manage.py loaddata fixtures/agencies.json
```

Create sample data manually:
```bash
poetry run python manage.py shell

from django.contrib.auth import get_user_model
from agencies.models import Agency
from projects.models import Project

User = get_user_model()

# Create users
admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
user1 = User.objects.create_user('john', 'john@example.com', 'pass123')

# Create agencies
dbca = Agency.objects.create(name='DBCA', code='DBCA')

# Create projects
Project.objects.create(
    title='Sample Project 1',
    description='A sample project for testing',
    owner=user1,
    agency=dbca
)

exit()
```

## Running the Development Server

### Start Server

```bash
poetry run python manage.py runserver
```

Expected output:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Django version (latest), using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Access the Application

- **API Root:** http://127.0.0.1:8000/api/v1/
- **Admin Panel:** http://127.0.0.1:8000/admin/
- **API Documentation:** http://127.0.0.1:8000/api/v1/ (browsable API)

### Custom Port

```bash
poetry run python manage.py runserver 8080
```

## Verification

### 1. Check Server Health

```bash
curl http://127.0.0.1:8000/api/v1/
```

### 2. Run Tests

```bash
poetry run pytest
```

### 3. Check Pre-commit

```bash
poetry run pre-commit run --all-files
```

### 4. Access Admin Panel

1. Go to http://127.0.0.1:8000/admin/
2. Log in with superuser credentials
3. Verify you can see the admin interface

## Database Seeding

For development with realistic data, you can seed your local environment with production data.

**Quick Overview:**
- Download seeding data from SharePoint (files.zip and SQL dump)
- Extract media files to `backend/files/`
- Restore database from SQL dump using psql or pgAdmin
- Verify seeding with provided commands

**See the complete guide:** [Seeding Guide](seeding-guide.md)

The seeding guide includes:
- Step-by-step instructions for local and staging environments
- Troubleshooting common issues
- Security and data handling best practices
- OIM ticket template for staging environment seeding

## Creating a Complete Superuser

A complete superuser setup requires creating the user account and all related profile records.

### Step 1: Create Django Superuser

```powershell
poetry run python manage.py createsuperuser
```

### Step 2: Create Related Records

**Using Django Admin:**
1. Navigate to http://127.0.0.1:8000/admin/
2. Log in with your superuser credentials
3. Create records for:
   - UserWork (Users → User Work)
   - UserContact (Contacts → User Contacts)
   - UserProfile (Users → User Profiles)
   - StaffProfile (Users → Staff Profiles)

**Using Django Shell:**
```powershell
poetry run python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from users.models import UserWork, UserProfile, StaffProfile
from contacts.models import UserContact

User = get_user_model()
user = User.objects.get(username='admin')

# Create required records
UserWork.objects.create(user=user, ...)
UserContact.objects.create(user=user, ...)
UserProfile.objects.create(user=user, ...)
StaffProfile.objects.create(user=user, ...)
```

### Why These Records Are Required

The frontend expects complete user data including:
- Work information (department, position)
- Contact details (phone, address)
- Profile data (bio, preferences)
- Staff information (permissions, roles)

## Common Setup Issues

### Poetry not found after installation

**Solution:**
```powershell
# Windows: Add to PATH via System Environment Variables
# Or restart PowerShell/Command Prompt

# macOS/Linux: Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

### Python version mismatch

**Solution:**
```powershell
poetry env use python
poetry run python --version
```

### PostgreSQL connection refused

**Solution:**
```powershell
# Windows: Check Services app (services.msc)
# Start PostgreSQL service

# Or via PowerShell
Start-Service postgresql-x64-*

# Verify
pg_isready
```

### Migrations fail with "relation already exists"

**Solution:**
```powershell
dropdb spms
createdb spms
poetry run python manage.py migrate
```

### Pre-commit hooks fail on first run

**Solution:**
```powershell
poetry run pre-commit run --all-files
git add .
git commit -m "Apply pre-commit fixes"
```

## Advanced Configuration

### Using Different Database

Edit `.env`:
```bash
# SQLite (for quick testing)
DATABASE_URL=sqlite:///db.sqlite3

# PostgreSQL with custom settings
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require
```

### Debug Settings

Edit `.env`:
```bash
DEBUG=True
DJANGO_LOG_LEVEL=DEBUG
```

## Next Steps

- [Testing Guide](testing-guide.md) - Learn our testing strategy
- [Pre-commit](pre-commit.md) - Understand code quality checks
- [Architecture](../architecture/README.md) - Understand the codebase

## Additional Resources

- Poetry Documentation: https://python-poetry.org/docs/
- Django Documentation: https://docs.djangoproject.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
