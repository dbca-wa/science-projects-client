# Backend Seeding Guide

Goal: Set up your local or staging environment with production-like data for realistic testing and development.

Related Documentation: [Getting Started](getting-started.md), [Local Setup](local-setup.md), [Change Management](../../general/operations/change-management.md)

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Environment Seeding](#local-environment-seeding)
  - [Media Seeding](#media-seeding)
  - [Database Seeding](#database-seeding)
- [Staging Environment Seeding](#staging-environment-seeding)
- [Troubleshooting](#troubleshooting)
- [Security and Best Practices](#security-and-best-practices)

## Overview

Seeding data provides production-like database records and media files for local development and staging environments. This allows you to:

- Test features with realistic data volumes
- Develop with actual user-uploaded media files
- Verify functionality before production deployment
- Onboard new maintainers quickly with working data

**When to use seeding data:**
- Setting up a new development environment
- Testing features that require existing data
- Reproducing production issues locally
- Preparing staging for release testing

**Security considerations:**
- Seeding data contains production data (user information, project details, uploaded files)
- Handle with the same care as production data
- Use only in local and staging environments
- Never commit seeding data to version control (files folder is already gitignored)

## Prerequisites

Before seeding your environment, ensure you have:

### Software Requirements

- **PostgreSQL 17+** - [Installation Guide](https://www.postgresql.org/download/)
- **Python (Latest)** - [Installation Guide](https://www.python.org/downloads/)
- **Poetry** - [Installation Guide](https://python-poetry.org/docs/#installation)
- **Unzip utility** - Usually pre-installed on Windows/macOS/Linux

Verify installations:
```bash
psql --version        # Should show 17.x or higher
python --version      # Should show 3.11.x or higher
poetry --version      # Should show 1.7.x or higher
```

### Access Requirements

- **DBCA Network Access** - VPN or network approval if working remotely
- **SharePoint Permissions** - Access to Ecoinformatics team site
- **Database Credentials** - PostgreSQL username and password


### Related Documentation

Before seeding, complete the initial backend setup:
- [Getting Started](getting-started.md) - Initial setup
- [Local Setup](local-setup.md) - Detailed configuration
- [Testing Guide](testing-guide.md) - Running tests

## Local Environment Seeding

### Accessing Seeding Data

The seeding data is stored on SharePoint at:

[SharePoint Seeding Data Folder](https://dpaw.sharepoint.com/teams/Ecoinformatics/Shared%20Documents/Projects/S033%20-%20SPMS/Seeding%20Data?csf=1&web=1&e=HfqhBJ)

You will need to be signed-in via SSO and have permissions to access the Ecoinformatics SharePoint site

Available files:
- `files.zip` - Media files (images, documents, user uploads)
- `spms_dump.sql` - Database snapshot with production-like data

### Media Seeding

Media seeding involves downloading and extracting user-uploaded files to your local backend directory.

#### Step 1: Download files.zip

1. Navigate to the SharePoint folder (link above)
2. Locate `files.zip` in the Seeding Data folder
3. Download to your local machine (any location)

#### Step 2: Extract to Backend Root

Extract the contents to the backend root directory:

```bash
# Navigate to backend directory
cd monorepo/backend

# Extract files.zip (adjust path to your download location)
unzip ~/Downloads/files.zip
```

**Windows (PowerShell):**
```powershell
# Navigate to backend directory
cd monorepo\backend

# Extract using Expand-Archive
Expand-Archive -Path "$env:USERPROFILE\Downloads\files.zip" -DestinationPath .
```

This will create a `files/` directory structure similar to below:
```
backend/
├── files/
│   ├── projects/
│   ├── annual_reports/
│   ├── user_avatars/
│   └── project_documents/
```

#### Step 3: Verify Media Seeding

Check that files were extracted successfully:

```bash
# Check files directory exists
ls -la files/

# Check file count
find files/ -type f | wc -l
```

**Windows (PowerShell):**
```powershell
# Check files directory exists
Get-ChildItem files\

# Check file count
(Get-ChildItem -Path files\ -Recurse -File).Count
```

**Important:** The `files/` directory is gitignored and must never be committed to version control.

### Database Seeding

Database seeding involves restoring a PostgreSQL database from a SQL dump file containing production-like data.

#### Prerequisites

- PostgreSQL 17+ installed and running
- Database created (e.g., `spms`)
- Database credentials configured in `.env`

#### Step 1: Download SQL Dump

1. Navigate to the SharePoint folder (link above)
2. Locate `spms_dump.sql` in the Seeding Data folder
3. Download to your local machine

#### Step 2: Create Database and Required Roles

**Note:** You need postgres properly set up in your system environment variables to use these commands.

```bash
# Create database
createdb spms

# Create required PostgreSQL roles
psql spms
```

In the psql prompt:
```sql
CREATE ROLE azure_pg_admin;
CREATE ROLE spms_prod;
\q
```

**Windows (PowerShell):**
```powershell
# Create database
createdb spms

# Create required PostgreSQL roles
psql spms
```

In the psql prompt:
```sql
CREATE ROLE azure_pg_admin;
CREATE ROLE spms_prod;
\q
```

**Note:** If you get "role already exists" errors, that's fine - the roles may have been created previously.

#### Step 3: Restore Database

```bash
# Restore database from SQL dump using pg_restore
pg_restore -U postgres -d spms ~/Downloads/spms_dump.sql
```

**Windows (PowerShell):**
```powershell
# Restore database from SQL dump using pg_restore
pg_restore -U postgres -d spms "$env:USERPROFILE\Downloads\spms_dump.sql"
```

**Note:** If `pg_restore` doesn't work, ensure PostgreSQL's bin directory is in your PATH.

#### Step 4: Run Migrations

After restoring the database, run migrations to ensure your local code is in sync:

```bash
poetry run python manage.py migrate
```

#### Step 5: Verify Database Seeding

Check that tables were created and populated:

```bash
# Check table count (should be 20-30 tables)
psql -U postgres -d spms -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Check user count (should be 100-200 users)
psql -U postgres -d spms -c "SELECT COUNT(*) FROM users_user;"

# Check project count (should be 50-100 projects)
psql -U postgres -d spms -c "SELECT COUNT(*) FROM projects_project;"
```


#### Step 6: Update Environment Configuration

Ensure your `.env` file points to the seeded database:

```bash
DATABASE_URL=postgresql://postgres:password@127.0.0.1/spms
```

#### Step 7: Verify Application Works

Start the development server and verify everything works:

```bash
poetry run python manage.py runserver
```

Access the application at http://127.0.0.1:8000/api/v1/ and verify you can see data.

## Staging Environment Seeding

Staging environment seeding is handled by the Office of Information Management (OIM). Maintainers cannot directly seed staging environments.

### Process

1. **Review Change Process** - See [Change Management Documentation](../../general/operations/change-management.md)
2. **Submit OIM Ticket** - Use the template below
3. **Wait for Completion** - Typical timeline: 2-5 business days

### OIM Ticket Template

**Subject:**
```
SPMS Staging Environment Seeding Request
```

**Details:**
```
Request Type: Staging Environment Update

Please perform the following actions on the SPMS staging environment:

1. Populate staging database with production data
   - Take snapshot of production database
   - Restore to staging database
   - Verify data integrity

2. Populate staging files folder with production media
   - Copy production media files to staging attached volume
   - Verify file permissions and accessibility

Purpose: Fast-forward staging environment to match production for proper testing of upcoming release.

Timeline: Requested completion by [DATE]

Contact: [YOUR NAME] - [YOUR EMAIL]
```

### Timeline

- **Ticket submission:** Immediate
- **OIM review:** 1-2 business days
- **Seeding completion:** 2-5 business days total

### Submission

Submit tickets through the standard OIM change management process. See [Change Management Documentation](../../general/operations/change-management.md) for submission instructions and contact information.

## Related Documentation

- [Getting Started](getting-started.md) - Initial backend setup
- [Local Setup](local-setup.md) - Detailed configuration
- [Testing Guide](testing-guide.md) - Running tests
- [Change Management](../../general/operations/change-management.md) - OIM ticket process
- [Database Optimisation](database-optimisation.md) - Database management
- [Operations Documentation](../../general/operations/) - Troubleshooting and monitoring
