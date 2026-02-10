# CI/CD Guide

Purpose: Understanding the continuous integration and deployment pipeline.

Related Documentation: [Testing](../development/testing.md), [Pre-commit](../development/pre-commit.md), [Feature Development](../development/feature-development.md)

## Overview

The SPMS backend uses GitHub Actions for continuous integration and deployment. The pipeline automatically tests code, builds Docker images, and deploys releases.

## Branching and CI Triggers

### Branch Strategy

**develop** - Main development branch
- Feature branches merge here
- CI runs on every push and PR
- Continuous testing and validation

**main** - Production branch
- Only updated via releases
- CI runs on every push and PR
- Triggers deployment workflows

### CI Triggers

Tests run on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Version tags (for releases)

## Creating Releases

Releases are created from the `main` branch using semantic version tags.

### Release Process

1. Ensure `develop` is stable and tested
2. Merge `develop` to `main` via pull request
3. Create and push version tag from `main`
4. CI automatically builds and deploys

### Tag Format

Use semantic versioning: `MAJOR.MINOR.PATCH`

Examples:
- `v3.4.13` - Standard release
- `v3.4.14` - Patch release
- `v3.5.0` - Minor release
- `v4.0.0` - Major release

## Workflows

### Test Workflow (test.yml)

**Triggers**:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Changes to `backend/**` or workflow file

**Purpose**: Run tests and generate coverage reports.

**Jobs**:
1. **Test** (4 parallel shards)
2. **Coverage** (combine and upload)

### Build Workflow (build.yml)

**Triggers**:
- Push tags matching `*.*.*-official` or `v*.*.*`
- Manual workflow dispatch

**Purpose**: Build Docker image (without pushing).

**Jobs**:
1. **Build** (Docker image)

### Release Workflow (release.yml)

**Triggers**:
- Push tags matching `*.*.*-official` or `v*.*.*`

**Purpose**: Test, build, and push Docker image to registry.

**Jobs**:
1. **Test** (4 parallel shards, skipped for hotfix tags)
2. **Build and Push** (Docker image to GHCR)

## Test Workflow Details

### Test Sharding

Tests are split across 4 parallel jobs for faster execution:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
```

Each shard runs approximately 25% of tests.

### Test Execution

```yaml
poetry run pytest \
  --splits 4 \
  --group ${{ matrix.shard }} \
  --store-durations \
  -n auto \
  --tb=short \
  --cov=. \
  --cov-report= \
  -v \
  -ra \
  --maxfail=5
```

**Options explained**:
- `--splits 4` - Split tests into 4 groups
- `--group N` - Run group N
- `--store-durations` - Save test durations for better distribution
- `-n auto` - Parallel execution within shard
- `--cov=.` - Collect coverage
- `--maxfail=5` - Stop after 5 failures

### Coverage Combination

After all shards complete:

1. Download coverage artifacts from all shards
2. Combine coverage data: `poetry run coverage combine`
3. Generate reports: `poetry run coverage xml` and `poetry run coverage html`
4. Extract coverage percentage from report
5. Update README badge with current coverage (on `main` branch only)
6. Verify minimum coverage (80%)

### Coverage Badge System

The project uses shields.io for the coverage badge with automatic updates:

**How it works**:
- Coverage percentage is extracted from the combined coverage report
- Badge colour is determined based on coverage level:
  - **90%+**: bright green
  - **80-89%**: green
  - **70-79%**: yellow
  - **60-69%**: orange
  - **<60%**: red
- README.md is automatically updated with the new badge
- Changes are committed back to the repository with `[skip ci]`

**Badge format**: `![Coverage](https://img.shields.io/badge/coverage-{percentage}%25-{colour})`

**Benefits**:
- No external service dependency
- No authentication tokens required
- Badge always reflects actual current coverage
- Automatic updates on every push to `main`

### Test Duration Caching

Test durations are cached to optimise shard distribution:

```yaml
- name: Restore test durations cache
  uses: actions/cache/restore@v4
  with:
    path: .test_durations
    key: test-durations-${{ github.sha }}-${{ matrix.shard }}
```

This ensures shards finish at approximately the same time.

## Build Workflow Details

### Docker Build

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v6
  with:
    context: .
    push: false  # Don't push, just build
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Purpose**: Verify Docker image builds successfully.

**When**: On official release tags or manual trigger.

**Output**: Docker image (not pushed to registry).

## Release Workflow Details

### Release Process

1. **Tag pushed** (e.g., `4.1.2-official`)
2. **Tests run** (4 parallel shards)
3. **Docker image built and pushed** (to GHCR)
4. **Version badge updated** (on badges branch)

### Hotfix Releases

Hotfix tags skip tests:

```yaml
if: "!contains(github.ref, 'hotfix')"
```

**Example**: `4.1.2-official.hotfix` skips tests and goes straight to build.

**Use case**: Critical production fixes that need immediate deployment.

### Docker Image Tags

Multiple tags are created for each release:

```yaml
tags: |
  type=semver,pattern={{version}}      # 4.1.2
  type=semver,pattern={{major}}.{{minor}}  # 4.1
  type=semver,pattern={{major}}        # 4
  type=raw,value=latest                # latest
```

**Example**: Tag `4.1.2-official` creates:
- `ghcr.io/org/repo:4.1.2`
- `ghcr.io/org/repo:4.1`
- `ghcr.io/org/repo:4`
- `ghcr.io/org/repo:latest`

### Version Badge

The release workflow updates a version badge on the `badges` branch:

```bash
# Extract version from tag
VERSION=${GITHUB_REF_NAME#v}

# Create SVG badge
cat > version.svg << EOF
<svg>...</svg>
EOF

# Push to badges branch
git checkout badges
git add version.svg
git commit -m "Update version badge to $VERSION"
git push origin badges
```

**Badge URL**: `https://raw.githubusercontent.com/org/repo/badges/version.svg`

## Environment Variables

### Required Secrets

**GITHUB_TOKEN**: Automatically provided by GitHub Actions.
- Used for: Pushing Docker images, updating badges

### Test Environment Variables

```yaml
env:
  DATABASE_URL: postgresql://test_user:test_pass@127.0.0.1:5432/test_db
  DJANGO_SETTINGS_MODULE: config.settings
  SECRET_KEY: test-secret-key-for-ci-${{ github.run_id }}
  DEBUG: "False"
  ENVIRONMENT: development
  # External API credentials (test values)
  LIBRARY_API_URL: "https://library-test.example.com/api"
  LIBRARY_BEARER_TOKEN: "test-bearer-token"
  IT_ASSETS_ACCESS_TOKEN: "test-it-assets-token"
  IT_ASSETS_USER: "test-user"
```

**Note**: No external coverage services or tokens are required. Coverage badge updates automatically via workflow.

## Services

### PostgreSQL

Tests run against PostgreSQL (latest):

```yaml
services:
  postgres:
    image: postgres:latest
    env:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Health checks**: Database readiness is managed in Kubernetes/Rancher before tests start.

## Caching

### Poetry Dependencies

```yaml
- name: Cache Poetry dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pypoetry
      .venv
    key: ${{ runner.os }}-poetry-${{ hashFiles('**/poetry.lock') }}
```

**Benefit**: Faster workflow execution (skip dependency installation).

### Docker Build Cache

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefit**: Faster Docker builds (reuse layers).

### Test Durations

```yaml
- name: Restore test durations cache
  uses: actions/cache/restore@v4
  with:
    path: .test_durations
    key: test-durations-${{ github.sha }}-${{ matrix.shard }}
```

**Benefit**: Better test distribution across shards.

## Viewing Results

### GitHub Actions UI

1. Go to repository on GitHub
2. Click "Actions" tab
3. Select workflow run
4. View job results

### Test Results

**Per-shard results**: Click on individual shard job.

**Combined coverage**: Download "coverage-report-combined" artifact.

**Test durations**: Download "test-durations" artifacts.

### Build Results

**Docker image tags**: View in job summary.

**Build logs**: Click on "Build and push Docker image" job.

## Manual Workflow Triggers

### Trigger Build Workflow

```bash
# Via GitHub UI
1. Go to Actions tab
2. Select "Build Docker Image" workflow
3. Click "Run workflow"
4. Enter reason (optional)
5. Click "Run workflow"
```

### Trigger Release Workflow

```bash
# Create and push tag
git tag 4.1.2-official
git push origin 4.1.2-official
```

## Troubleshooting

### Issue: Tests fail in CI but pass locally

**Cause**: Environment differences or race conditions.

**Solution**:
```bash
# Run tests with same settings as CI
DATABASE_URL=postgresql://127.0.0.1/test_db \
DEBUG=False \
poetry run pytest --splits 4 --group 1 -n auto
```

### Issue: Coverage combination fails

**Cause**: Missing coverage artifacts from shards.

**Solution**: Check individual shard jobs for failures.

### Issue: Docker build fails

**Cause**: Dockerfile syntax error or missing dependencies.

**Solution**:
```bash
# Test Docker build locally
docker build -t spms-backend .

# Check Dockerfile syntax
docker build --check .
```

### Issue: Version badge not updating

**Cause**: Badges branch doesn't exist or push failed.

**Solution**:
```bash
# Create badges branch manually
git checkout --orphan badges
git rm -rf .
git commit --allow-empty -m "Initialize badges branch"
git push origin badges
```

### Issue: Workflow not triggering

**Cause**: Path filters or branch restrictions.

**Solution**: Check workflow triggers:
```yaml
on:
  pull_request:
    branches: [main, develop]
    paths:
      - "backend/**"  # Only triggers on backend changes
```

### Issue: Secrets not available

**Cause**: Secrets not configured in repository settings.

**Solution**:
1. Go to repository Settings
2. Click "Secrets and variables" → "Actions"
3. Add required secrets

**Note**: No coverage service tokens are required. Coverage badge updates automatically.

## Best Practices

### Pull Request Workflow

1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create pull request
5. Wait for CI to pass
6. Request review
7. Merge when approved and CI passes

### Release Workflow

1. Ensure all tests pass on `main`
2. **Submit RFC (Request For Change)** via Freshservice for production deployment
3. Wait for RFC approval
4. Create release tag: `git tag 4.1.2-official`
5. Push tag: `git push origin 4.1.2-official`
6. Wait for release workflow to complete
7. Verify Docker image in GHCR
8. Deploy to staging
9. Verify staging deployment
10. Deploy to production (after RFC approval)
11. Update RFC with deployment completion

### Hotfix Workflow

1. Create hotfix branch from `main`
2. Make critical fix
3. Test locally
4. Merge to `main`
5. Create hotfix tag: `git tag 4.1.3-official.hotfix`
6. Push tag: `git push origin 4.1.3-official.hotfix`
7. Deploy immediately (tests skipped)

## Performance Optimisation

### Test Sharding

**Current**: 4 shards, ~2 minutes wall time.

**Without sharding**: ~8 minutes wall time.

**Benefit**: 75% reduction in wall time.

### Parallel Execution

**Within shard**: `pytest -n auto` uses all CPU cores.

**Benefit**: 50% reduction in shard execution time.

### Caching

**Poetry dependencies**: Saves ~2 minutes per run.

**Docker layers**: Saves ~3 minutes per build.

**Test durations**: Improves shard distribution by 10-15%.

## Monitoring

### Workflow Status

**Badges**: Add to README.md:
```markdown
[![Tests](https://github.com/dbca-wa/science-projects-service/actions/workflows/test.yml/badge.svg)](https://github.com/dbca-wa/science-projects-service/actions/workflows/test.yml)
![Coverage](https://img.shields.io/badge/coverage-84%25-green)
[![CodeQL](https://github.com/dbca-wa/science-projects-service/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dbca-wa/science-projects-service/actions/workflows/github-code-scanning/codeql)
[![Issues](https://img.shields.io/static/v1?label=docs&message=Issues&color=brightgreen)](https://github.com/dbca-wa/science-projects-service/issues)
```

**Email notifications**: Configure in GitHub settings.

### Coverage Tracking

**Coverage badge**: Automatically updates after each push to `main` via workflow automation.

**Coverage reports**: Download HTML coverage reports from workflow artifacts for detailed analysis.

### Security Scanning

**CodeQL**: Automated security scanning runs on:
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Saturdays at 00:29 UTC)

**CodeQL badge**: Shows security scanning status.

### Issues Badge

**Issues badge**: Links to GitHub issues page for bug reports and feature requests.

### Build Status

**GHCR packages**: View published images in repository packages.

**Version badge**: Shows current release version.

## Next Steps

- [Change Management](../operations/change-management.md) - RFC process for production deployments
- [Feature Development](../development/feature-development.md) - Complete development workflow
- [Testing](../development/testing.md) - Understanding the test suite
- [Troubleshooting](../operations/troubleshooting.md) - Common CI/CD issues
- [Kustomize](kustomize.md) - Deployment configuration
