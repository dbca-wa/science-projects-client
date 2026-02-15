# CI/CD Overview

## Overview

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) strategy for the Science Projects Management System (SPMS) monorepo, covering both frontend and backend components.

## Monorepo CI/CD Strategy

### Unified Workflows

The monorepo uses unified GitHub Actions workflows that handle both frontend and backend:

**Workflow files:**

- `.github/workflows/test.yml` - Run tests for both components
- `.github/workflows/deploy-staging.yml` - Deploy to staging environment
- `.github/workflows/deploy-prod.yml` - Deploy to production

### Component Detection

Workflows automatically detect which components have changed:

```yaml
- name: Detect changes
  uses: dorny/paths-filter@v2
  id: changes
  with:
      filters: |
          frontend:
            - 'frontend/**'
          backend:
            - 'backend/**'
```

**Benefits:**

- Only run tests for changed components
- Only build/deploy changed components
- Faster CI/CD pipeline
- Reduced resource usage

## Branch Strategy

### Development Workflow

```
feature/* → staging → main
            (Staging)  (Production)
```

**Branch purposes:**

- `feature/*` - Feature development branches
- `staging` - Integration branch, deploys to Staging
- `main` - Production branch, deploys to production

### Deployment Triggers

**Staging deployment:**

- Trigger: Push to `staging` branch
- Environment: Staging
- Approval: Automatic

**Production deployment:**

- Trigger: Push to `main` branch
- Environment: Production
- Approval: Manual (required reviewer)

## GitHub Actions Workflows

### Workflow Architecture

The CI/CD pipeline uses a **modular, reusable workflow approach** following the DRY (Don't Repeat Yourself) principle:

```
test.yml (reusable)
    ↓
    Called by:
    ├── deploy-staging.yml
    ├── deploy-prod.yml
    └── Pull Requests
```

This architecture ensures:
- Tests are defined once, used everywhere
- Consistent test execution across environments
- Easier maintenance and updates
- Test gating prevents broken deployments

### Test Workflow (Reusable)

**File**: `.github/workflows/test.yml`

**Triggers:**

- Pull requests to `staging` or `main`
- Release events
- **Workflow call** from deploy-staging.yml and deploy-prod.yml

**Jobs:**

1. **Detect Changes**
    - Determines which components changed (frontend/backend)
    - For releases: Always tests both components
    - Outputs used by subsequent jobs to skip unchanged components

2. **Frontend Tests** (2-way sharding)
    - Runs when frontend files change
    - Installs dependencies with Bun
    - Runs tests in 2 parallel shards (~2 minutes total)
    - Uploads coverage artifacts from each shard

3. **Combine Frontend Coverage**
    - Combines coverage from both shards
    - Generates coverage report
    - Validates minimum coverage threshold (40%)
    - Uploads combined coverage percentage artifact

4. **Backend Tests** (4-way sharding)
    - Runs when backend files change
    - Sets up Python with Poetry
    - Runs tests in 4 parallel shards (~10 minutes total)
    - Uses test duration caching for optimal distribution
    - Uploads coverage artifacts from each shard

5. **Combine Backend Coverage**
    - Combines coverage from all 4 shards
    - Generates coverage report
    - Validates minimum coverage threshold (80%)
    - Uploads combined coverage percentage artifact

**Key features:**

- **Path-based execution**: Only tests changed code
- **Parallel sharding**: Faster test execution
- **Coverage combining**: Accurate coverage from sharded tests
- **Reusable**: Called by other workflows via `workflow_call`

**Example structure:**

```yaml
name: Test

on:
    pull_request:
        branches: [main, staging]
    release:
        types: [published]
    workflow_call:  # Allows other workflows to call this

permissions:
    contents: read
    packages: read

jobs:
    detect-changes:
        # Detects frontend/backend changes
        # For releases: Always returns true for both

    test-frontend:
        needs: detect-changes
        if: needs.detect-changes.outputs.frontend == 'true'
        strategy:
            matrix:
                shard: [1, 2]
        # Runs frontend tests with sharding

    combine-frontend-coverage:
        needs: test-frontend
        # Combines coverage from shards

    test-backend:
        needs: detect-changes
        if: needs.detect-changes.outputs.backend == 'true'
        strategy:
            matrix:
                shard: [1, 2, 3, 4]
        # Runs backend tests with sharding

    combine-backend-coverage:
        needs: test-backend
        # Combines coverage from shards
```

### Staging Deployment Workflow

**File**: `.github/workflows/deploy-staging.yml`

**Triggers:**

- Push to `staging` branch
- Skipped if commit message contains `[skip ci]`

**Jobs:**

1. **Detect Changes**
    - Runs first (~10 seconds)
    - Determines which components changed (frontend/backend)
    - Outputs used by build jobs to skip unchanged components

2. **Run Tests**
    - Calls `test.yml` workflow (reusable)
    - Runs all tests for changed components
    - **Test gating**: Builds only proceed if tests pass
    - Total time: ~12 minutes (frontend ~2 min, backend ~10 min)

3. **Build Frontend Test** (conditional)
    - Runs only if frontend changed AND tests passed
    - Builds production bundle with Vite
    - Environment: `VITE_SENTRY_ENVIRONMENT=test`
    - Creates Docker image
    - Pushes to GitHub Container Registry
    - Tags: `test` (for staging/UAT environment)

4. **Build Backend Test** (conditional)
    - Runs only if backend changed AND tests passed
    - Creates Docker image
    - Pushes to GitHub Container Registry
    - Tags: `test` (for staging/UAT environment)

**Key features:**

- **Test gating**: Builds wait for tests to pass
- **Conditional builds**: Only builds changed components
- **Skip CI support**: Add `[skip ci]` to commit message to skip workflow
- **Environment-specific builds**: Frontend test image has `VITE_SENTRY_ENVIRONMENT=test` baked in

**Example structure:**

```yaml
name: Deploy Staging

on:
    push:
        branches: [staging]

jobs:
    detect-changes:
        if: "!contains(github.event.head_commit.message, '[skip ci]')"
        # Detects frontend/backend changes

    run-tests:
        needs: detect-changes
        if: "!contains(github.event.head_commit.message, '[skip ci]')"
        uses: ./.github/workflows/test.yml  # Calls reusable workflow

    build-frontend-test:
        needs: [detect-changes, run-tests]
        if: |
            !contains(github.event.head_commit.message, '[skip ci]') &&
            success() &&
            needs.detect-changes.outputs.frontend == 'true'
        # Builds frontend with test environment variables
        # Tags: test

    build-backend-test:
        needs: [detect-changes, run-tests]
        if: |
            !contains(github.event.head_commit.message, '[skip ci]') &&
            success() &&
            needs.detect-changes.outputs.backend == 'true'
        # Builds backend
        # Tags: test
```

**Image tagging:**

- Frontend: `ghcr.io/dbca-wa/science-projects-frontend:test`
- Backend: `ghcr.io/dbca-wa/science-projects-backend:test`

**Note**: Frontend test and production images are **different builds** because Vite bakes environment variables into the JavaScript bundle at build time.

### Production Deployment Workflow

**File**: `.github/workflows/deploy-prod.yml`

**Triggers:**

- Push tags matching `v*` (e.g., `v1.0.0`)
- Release published events

**Jobs:**

1. **Detect Changes**
    - Runs first (~10 seconds)
    - For tagged releases: **Always builds both frontend and backend**
    - Ensures complete production deployment

2. **Run Tests**
    - Calls `test.yml` workflow (reusable)
    - Runs all tests for both components
    - **Test gating**: Builds only proceed if tests pass

3. **Build Frontend Production**
    - Builds production bundle with Vite
    - Environment: `VITE_SENTRY_ENVIRONMENT=production`
    - Creates Docker image
    - Pushes to GitHub Container Registry
    - Tags: `v1.0.0` (version) + `stable` (alias to latest production)

4. **Build Backend Production**
    - Creates Docker image
    - Pushes to GitHub Container Registry
    - Tags: `v1.0.0` (version) + `stable` (alias to latest production)

5. **Update Coverage Badges**
    - Downloads coverage percentages from test artifacts
    - Validates coverage values (numeric check)
    - Updates README.md badges with new coverage percentages
    - Commits with `[skip ci]` to prevent recursive workflow

6. **Update Kustomize**
    - Updates Kustomize image tags to new version
    - Updates both `prod` and `test` overlays
    - Commits with `[skip ci]` to prevent recursive workflow

**Key features:**

- **Always builds both components**: Tagged releases deploy complete system
- **Test gating**: Builds wait for tests to pass
- **Coverage badge updates**: Automatic README updates on production releases
- **Kustomize automation**: Image tags updated automatically
- **Environment-specific builds**: Frontend production image has `VITE_SENTRY_ENVIRONMENT=production` baked in

**Example structure:**

```yaml
name: Deploy Production

on:
    push:
        tags:
            - "v*"
    release:
        types: [published]

jobs:
    detect-changes:
        # Always returns true for both frontend and backend

    run-tests:
        needs: detect-changes
        uses: ./.github/workflows/test.yml  # Calls reusable workflow

    build-frontend-prod:
        needs: [run-tests, detect-changes]
        if: success() && needs.detect-changes.outputs.frontend == 'true'
        # Builds frontend with production environment variables
        # Tags: v1.0.0, stable

    build-backend-prod:
        needs: [run-tests, detect-changes]
        if: success() && needs.detect-changes.outputs.backend == 'true'
        # Builds backend
        # Tags: v1.0.0, stable

    update-coverage-badges:
        needs: run-tests
        if: success()
        # Downloads coverage artifacts
        # Validates coverage values
        # Updates README.md badges
        # Commits with [skip ci]

    update-kustomize:
        needs: [detect-changes, build-frontend-prod, build-backend-prod]
        if: |
            always() &&
            (needs.build-frontend-prod.result == 'success' ||
             needs.build-backend-prod.result == 'success')
        # Updates kustomize image tags
        # Commits with [skip ci]
```

**Image tagging:**

- Frontend:
  - `ghcr.io/dbca-wa/science-projects-frontend:v1.0.0`
  - `ghcr.io/dbca-wa/science-projects-frontend:stable`
- Backend:
  - `ghcr.io/dbca-wa/science-projects-backend:v1.0.0`
  - `ghcr.io/dbca-wa/science-projects-backend:stable`

**Stable tag**: The `stable` tag always points to the latest production release, providing a consistent reference for deployments.

### Sync Staging Workflow

**File**: `.github/workflows/sync-staging.yml`

**Triggers:**

- Push to `main` branch

**Purpose:**

Automatically syncs the `staging` branch with `main` after production releases, ensuring staging stays up-to-date with production code.

**Jobs:**

1. **Sync Staging Branch**
    - Fetches latest `main` and `staging` branches
    - Resets `staging` to match `main`
    - Creates empty commit with `[skip ci]` message
    - Force pushes to `staging`

**Key features:**

- **Skip CI**: Uses `[skip ci]` to prevent unnecessary builds
- **Force sync**: Ensures staging exactly matches main
- **Automatic**: No manual intervention required

**Example structure:**

```yaml
name: Sync Staging with Main

on:
    push:
        branches: [main]

jobs:
    sync-staging:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  fetch-depth: 0
            - run: |
                  git config user.name "github-actions[bot]"
                  git config user.email "github-actions[bot]@users.noreply.github.com"
                  git fetch origin main
                  git fetch origin staging
                  git checkout staging
                  git reset --hard origin/main
                  git commit --allow-empty -m "chore: sync staging with main [skip ci]"
                  git push origin staging --force
```

**Why `[skip ci]`?**

After a production release, `main` and `staging` are identical. Running tests and builds again would waste CI minutes without providing value.

## Test Gating

### What is Test Gating?

**Test gating** ensures that Docker images are only built and pushed if all tests pass. This prevents deploying broken code to staging or production.

### How It Works

**Workflow dependency chain:**

```
detect-changes → run-tests → build-frontend
                           → build-backend
```

**Build jobs wait for tests:**

```yaml
build-frontend-test:
    needs: [detect-changes, run-tests]  # Waits for tests
    if: |
        !contains(github.event.head_commit.message, '[skip ci]') &&
        success() &&  # Only runs if tests passed
        needs.detect-changes.outputs.frontend == 'true'
```

### Benefits

- **Prevents broken deployments**: No images built if tests fail
- **Saves CI minutes**: Skips expensive builds when tests fail early
- **Clear feedback**: Developers know immediately if tests fail
- **Consistent quality**: All deployed code has passed tests

### Workflow Execution Time

**Staging deployment** (typical):
- Detect changes: ~10 seconds
- Run tests: ~12 minutes (frontend ~2 min, backend ~10 min in parallel)
- Build images: ~5 minutes (only changed components)
- **Total**: ~17 minutes

**Production deployment** (typical):
- Detect changes: ~10 seconds
- Run tests: ~12 minutes (both components)
- Build images: ~8 minutes (both components)
- Update badges: ~30 seconds
- Update Kustomize: ~30 seconds
- **Total**: ~21 minutes

**Note**: Builds wait for ALL tests to complete because `test.yml` runs as a single atomic workflow when called via `workflow_call`. This is a GitHub Actions limitation but ensures test integrity.

## Image Tagging Strategy

### Staging Images

**Purpose**: Testing and UAT environment

**Tags:**
- Frontend: `test`
- Backend: `test`

**Environment variables:**
- Frontend: `VITE_SENTRY_ENVIRONMENT=test` (baked into build)
- Backend: Environment-agnostic (configured at runtime)

**Deployment:**
- Kubernetes pulls `test` tag with `imagePullPolicy: Always`
- Updates automatically when new `test` image is pushed

### Production Images

**Purpose**: Production environment

**Tags:**
- Frontend: `v1.0.0` (version) + `stable` (alias)
- Backend: `v1.0.0` (version) + `stable` (alias)

**Environment variables:**
- Frontend: `VITE_SENTRY_ENVIRONMENT=production` (baked into build)
- Backend: Environment-agnostic (configured at runtime)

**Deployment:**
- Kubernetes uses specific version tag (e.g., `v1.0.0`)
- `stable` tag provides consistent reference to latest production

### Why Different Frontend Images?

**Frontend images are environment-specific** because Vite bakes environment variables into the JavaScript bundle at build time:

```typescript
// These values are replaced at build time
const apiUrl = import.meta.env.VITE_PRODUCTION_BACKEND_API_URL;
const sentryEnv = import.meta.env.VITE_SENTRY_ENVIRONMENT;
```

**Result:**
- `test` image has test API URLs and `VITE_SENTRY_ENVIRONMENT=test`
- `v1.0.0` image has production API URLs and `VITE_SENTRY_ENVIRONMENT=production`
- Cannot use same image for both environments

**Backend images are environment-agnostic** because Django reads environment variables at runtime:

```python
# These values are read at runtime from environment
API_URL = os.environ.get('API_URL')
SENTRY_ENVIRONMENT = os.environ.get('SENTRY_ENVIRONMENT')
```

**Result:**
- Same backend image can be used in any environment
- Configuration injected via Kubernetes Secrets at runtime

## Skipping CI

### When to Skip CI

Add `[skip ci]` to commit messages to skip workflows:

```bash
git commit -m "docs: update README [skip ci]"
```

**Use cases:**
- Documentation-only changes
- README updates
- Comment changes
- Non-code changes that don't require testing/building

### How It Works

Workflows check for `[skip ci]` in commit message:

```yaml
jobs:
    detect-changes:
        if: "!contains(github.event.head_commit.message, '[skip ci]')"
```

**Workflows that respect `[skip ci]`:**
- `deploy-staging.yml` - Skips all jobs
- `deploy-prod.yml` - Does NOT skip (production always builds)
- `test.yml` - Skips when called by deploy-staging.yml

**Note**: Pull request workflows do NOT respect `[skip ci]` to ensure all PRs are tested.

## Testing Strategy in CI/CD

### Frontend Testing

**Unit tests:**

- Run on every PR and push
- Test utilities, hooks, services, stores
- Coverage threshold: 80%

**Page tests:**

- Run on every PR and push
- Test user flows and accessibility
- Coverage threshold: 70%

**Build verification:**

- Verify production build succeeds
- Check bundle size (< 500KB)
- Verify no TypeScript errors

### Backend Testing

**Unit tests:**

- Run on every PR and push
- Test models, serializers, services
- Coverage threshold: 80%

**Integration tests:**

- Run on every PR and push
- Test API endpoints
- Coverage threshold: 70%

**Database migrations:**

- Verify migrations apply cleanly
- Check for migration conflicts

## Secrets Management

### GitHub Secrets (Frontend Build-Time Secrets)

**Why GitHub Secrets?**
Frontend environment variables must be set in GitHub Secrets because Vite bakes them into the JavaScript bundle at build time. These values become part of the compiled code and cannot be changed after the Docker image is built.

**Where to configure:**

1. Navigate to GitHub repository: `https://github.com/dbca-wa/science-projects`
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its name and value

**Required secrets (names only, no values):**

**Production URLs:**

- `VITE_PRODUCTION_BASE_URL` - Production frontend base URL
- `VITE_PRODUCTION_BACKEND_API_URL` - Production backend API URL
- `VITE_PRODUCTION_PROFILES_BASE_URL` - Production profiles service URL

**Staging URLs:**

- `VITE_TEST_BASE_URL` - Staging frontend base URL
- `VITE_TEST_BACKEND_API_URL` - Staging backend API URL
- `VITE_TEST_PROFILES_BASE_URL` - Staging profiles service URL

**Error Tracking:**

- `VITE_SENTRY_DSN` - Sentry DSN for error tracking (same for production and staging)

**Container Registry:**

- GitHub Container Registry (GHCR) authentication handled automatically via `GITHUB_TOKEN`

**Kubernetes:**

- `KUBE_CONFIG` - Kubernetes config for AKS

**Security note:** Never commit these values to Git. They are managed exclusively through GitHub Secrets UI and injected during CI/CD build process.

### Backend Runtime Secrets (Rancher/Azure Key Vault)

**Backend secrets** (managed by infrastructure team via Rancher GUI):

- Database credentials
- Django secret key
- Backend Sentry configuration
- External API keys
- OAuth credentials

**Why different from frontend?**
Backend secrets are injected at runtime (when container starts) via Kubernetes Secrets, not baked into the image. This allows changing secrets without rebuilding the Docker image.

**Developer access:**

- Secrets configured via Rancher GUI for staging and production
- Local development uses `.env` files (not committed)
- Infrastructure team manages Azure Key Vault backend

## Deployment Approval

### Staging Deployment

**Approval**: Automatic

**Conditions:**

- All tests pass
- No merge conflicts
- Branch is `staging`

### Production Deployment

**Approval**: Manual (required reviewer)

**Conditions:**

- All tests pass
- Staging deployment successful
- Branch is `main`
- Approved by: Tech Lead or Senior Developer

**Approval process:**

1. PR merged to `main`
2. GitHub Actions workflow starts
3. Builds complete successfully
4. Deployment waits for approval
5. Reviewer approves deployment
6. Deployment proceeds to production

## Rollback Procedures

### Automatic Rollback

**Triggers:**

- Smoke tests fail after deployment
- Health checks fail for 5 minutes
- Error rate > 5% for 5 minutes

**Process:**

1. Kubernetes automatically rolls back to previous version
2. Notification sent to team
3. Incident created in monitoring system

### Manual Rollback

**Process:**

```bash
# Rollback frontend
kubectl rollout undo deployment/spms-frontend -n spms-prod

# Rollback backend
kubectl rollout undo deployment/spms-backend -n spms-prod

# Verify rollback
kubectl rollout status deployment/spms-frontend -n spms-prod
kubectl rollout status deployment/spms-backend -n spms-prod
```

## Monitoring and Notifications

### Deployment Notifications

**Notifications:**

- GitHub Actions sends email notifications on workflow success/failure
- Team contact: `ecoinformatics.admin@dbca.wa.gov.au`

### Deployment Metrics

**Tracked metrics:**

- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate

**Dashboards:**

- GitHub Actions dashboard
- Azure Monitor dashboard
- Sentry deployment tracking

## Frontend CI/CD Details

### Frontend Pipeline Stages

1. **Lint** - ESLint checks for code quality

    ```bash
    bun run lint
    ```

2. **Type Check** - TypeScript validation

    ```bash
    bun run type-check
    ```

3. **Test** - Vitest unit and page tests

    ```bash
    bun run test:coverage
    ```

4. **Build** - Vite production build
    ```bash
    bun run build
    ```

### Frontend Build Configuration

**Vite configuration** (`frontend/vite.config.ts`):

```typescript
export default defineConfig({
	build: {
		target: "es2020",
		outDir: "dist",
		assetsDir: "assets",
		minify: "esbuild",
		sourcemap: "hidden",
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router"],
					"query-vendor": ["@tanstack/react-query"],
					"mobx-vendor": ["mobx", "mobx-react-lite"],
				},
			},
		},
	},
	esbuild: {
		drop: ["console", "debugger"], // Production only
	},
});
```

**Environment variables (set in GitHub Secrets):**

```bash
# These are injected during build via GitHub Secrets
# See "Secrets Management" section for configuration details
VITE_PRODUCTION_BASE_URL=<from-github-secrets>
VITE_PRODUCTION_BACKEND_API_URL=<from-github-secrets>
VITE_PRODUCTION_PROFILES_BASE_URL=<from-github-secrets>
VITE_SENTRY_DSN=<from-github-secrets>
VITE_SENTRY_ENVIRONMENT=production  # Set by workflow
```

**Type safety for environment variables** (`frontend/src/vite-env.d.ts`):

```typescript
interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_APP_NAME: string;
	readonly VITE_ENABLE_DEBUG?: string;
	readonly VITE_SENTRY_DSN?: string;
	readonly VITE_ENVIRONMENT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

**Build optimisations:**

- Code splitting by route and vendor chunks
- Tree shaking unused code
- Minification with esbuild (faster than terser)
- Source map generation (hidden in production)
- Console/debugger removal in production

**Output structure:**

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── react-vendor-[hash].js
│   ├── query-vendor-[hash].js
│   ├── mobx-vendor-[hash].js
│   ├── projects-[hash].js
│   ├── users-[hash].js
│   └── styles-[hash].css
└── favicon.ico
```

### Frontend Deployment

**Static assets:**

- Built files uploaded to Azure Blob Storage
- Served via Azure CDN
- Cache invalidation on deployment

**Docker deployment:**

- Bun container serving static files
- Multi-stage build for optimisation
- Health checks for readiness

## Backend CI/CD Details

### Backend Pipeline Stages

1. **Lint** - Ruff checks for code quality

    ```bash
    poetry run ruff check .
    ```

2. **Type Check** - mypy validation

    ```bash
    poetry run mypy .
    ```

3. **Test** - pytest with parallel execution

    ```bash
    poetry run pytest --splits 4 --group 1 -n auto
    ```

4. **Build** - Docker image creation
    ```bash
    docker build -t spms-backend .
    ```

### Backend Test Sharding

Tests are split across 4 parallel jobs for faster execution:

```yaml
strategy:
    matrix:
        shard: [1, 2, 3, 4]
```

**Benefits:**

- 75% reduction in wall time
- Better resource utilisation
- Faster feedback on PRs

### Backend Test Execution

```bash
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

**Options:**

- `--splits 4` - Split tests into 4 groups
- `--group N` - Run group N
- `--store-durations` - Save test durations for better distribution
- `-n auto` - Parallel execution within shard
- `--cov=.` - Collect coverage
- `--maxfail=5` - Stop after 5 failures

### Backend Coverage System

**Coverage badge:**

- Automatically updated after each push to `main`
- Uses shields.io for badge generation
- No external service dependency
- Badge colour based on coverage level:
    - 90%+: bright green
    - 80-89%: green
    - 70-79%: yellow
    - 60-69%: orange
    - <60%: red

**Coverage combination:**

1. Download coverage artifacts from all shards
2. Combine coverage data: `poetry run coverage combine`
3. Generate reports: `poetry run coverage xml` and `poetry run coverage html`
4. Extract coverage percentage
5. Update README badge
6. Verify minimum coverage (80%)

### Backend Deployment

**Django-specific:**

- Static files collected during build
- Database migrations run before deployment
- Gunicorn WSGI server
- Health checks for readiness

**Docker deployment:**

- Multi-stage build for optimisation
- Poetry for dependency management
- Health checks for liveness and readiness

## Best Practices

### Pull Request Workflow

1. **Create feature branch** from `staging`
2. **Make changes** and commit regularly
3. **Push to GitHub** and create PR
4. **Wait for CI** to pass all tests
5. **Request review** from team member
6. **Address feedback** and update PR
7. **Merge to staging** when approved
8. **Verify UAT deployment** succeeds
9. **Create PR to main** for production
10. **Approve and deploy** to production

### Commit Messages

Use conventional commit format:

```
feat: Add user authentication
fix: Resolve database connection issue
docs: Update deployment guide
chore: Update dependencies
```

### Version Bumping

**Semantic versioning:**

- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**Process:**

1. Update version in `package.json` (frontend) or `pyproject.toml` (backend)
2. Update `CHANGELOG.md`
3. Commit with message: `chore: Bump version to X.Y.Z`
4. Tag commit: `git tag vX.Y.Z`
5. Push tag: `git push origin vX.Y.Z`

## Troubleshooting

### CI/CD Failures

**Tests failing:**

1. Check test logs in GitHub Actions
2. Run tests locally to reproduce
3. Fix failing tests
4. Push fix and re-run CI

**Build failing:**

1. Check build logs in GitHub Actions
2. Verify dependencies are correct
3. Run build locally to reproduce
4. Fix build issues
5. Push fix and re-run CI

**Deployment failing:**

1. Check deployment logs in GitHub Actions
2. Verify Kubernetes cluster is healthy
3. Check Azure Container Registry access
4. Verify secrets are configured correctly
5. Manually deploy if needed

### Common Issues

**Issue**: Frontend build fails with "out of memory"
**Solution**: Increase Node.js memory limit in workflow:

```yaml
- run: NODE_OPTIONS=--max_old_space_size=4096 bun run build
```

**Issue**: Backend tests fail with database connection error
**Solution**: Ensure PostgreSQL service is running in workflow:

```yaml
services:
    postgres:
        image: postgres:17
        env:
            POSTGRES_PASSWORD: postgres
        options: >-
            --health-cmd pg_isready
            --health-interval 10s
            --health-timeout 5s
            --health-retries 5
```

**Issue**: Deployment fails with "ImagePullBackOff"
**Solution**: Verify ACR credentials and image tag are correct

## Related Documentation

- [Docker Overview](./docker-overview.md) - Docker strategy for monorepo
- [Kubernetes Overview](./kubernetes-overview.md) - AKS cluster architecture
- [Version Management](./version-management.md) - Versioning strategy

## External Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Conventional Commits](https://www.conventionalcommits.org/)
