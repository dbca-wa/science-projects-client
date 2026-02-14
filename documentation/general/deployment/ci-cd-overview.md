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
            (UAT)     (Production)
```

**Branch purposes:**

- `feature/*` - Feature development branches
- `staging` - Integration branch, deploys to UAT
- `main` - Production branch, deploys to production

### Deployment Triggers

**UAT deployment:**

- Trigger: Push to `staging` branch
- Environment: UAT
- Approval: Automatic

**Production deployment:**

- Trigger: Push to `main` branch
- Environment: Production
- Approval: Manual (required reviewer)

## GitHub Actions Workflows

### Test Workflow

**File**: `.github/workflows/test.yml`

**Triggers:**

- Pull requests to `staging` or `main`
- Push to `staging` or `main`

**Jobs:**

1. **Frontend Tests**
    - Runs when frontend files change
    - Installs dependencies with bun
    - Runs unit tests with Vitest
    - Runs page tests with Vitest + Testing Library
    - Generates coverage report
    - Coverage badge automatically updated on `main` branch

2. **Backend Tests**
    - Runs when backend files change
    - Sets up Python with Poetry
    - Runs Django tests with pytest
    - Generates coverage report
    - Coverage badge automatically updated on `main` branch

**Example:**

```yaml
name: Test

on:
    pull_request:
        branches: [staging, main]
    push:
        branches: [staging, main]

jobs:
    detect-changes:
        runs-on: ubuntu-latest
        outputs:
            frontend: ${{ steps.changes.outputs.frontend }}
            backend: ${{ steps.changes.outputs.backend }}
        steps:
            - uses: actions/checkout@v4
            - uses: dorny/paths-filter@v2
              id: changes
              with:
                  filters: |
                      frontend:
                        - 'frontend/**'
                      backend:
                        - 'backend/**'

    test-frontend:
        needs: detect-changes
        if: needs.detect-changes.outputs.frontend == 'true'
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: oven-sh/setup-bun@v1
            - run: bun install
              working-directory: frontend
            - run: bun run test:coverage
              working-directory: frontend

    test-backend:
        needs: detect-changes
        if: needs.detect-changes.outputs.backend == 'true'
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-python@v4
              with:
                  python-version: "3.11"
            - run: pip install poetry
            - run: poetry install
              working-directory: backend
            - run: poetry run pytest --cov --cov-report=xml
              working-directory: backend
```

### Staging Deployment Workflow

**File**: `.github/workflows/deploy-staging.yml`

**Triggers:**

- Push to `staging` branch

**Jobs:**

1. **Build Frontend**
    - Runs when frontend files change
    - Builds production bundle with Vite
    - Creates Docker image
    - Pushes to Azure Container Registry
    - Tags with `staging-<commit-sha>`

2. **Build Backend**
    - Runs when backend files change
    - Creates Docker image
    - Pushes to Azure Container Registry
    - Tags with `staging-<commit-sha>`

3. **Deploy to AKS**
    - Updates Kubernetes manifests
    - Applies Kustomize overlays for staging
    - Deploys to AKS test namespace
    - Runs smoke tests

**Example:**

```yaml
name: Deploy to Staging

on:
    push:
        branches: [staging]

jobs:
    build-frontend:
        if: contains(github.event.head_commit.modified, 'frontend/')
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: oven-sh/setup-bun@v1
            - run: bun install
              working-directory: frontend
            - run: bun run build
              working-directory: frontend
              env:
                  VITE_API_URL: ${{ secrets.TEST_API_URL }}
                  VITE_ENVIRONMENT: staging
            - uses: azure/docker-login@v1
              with:
                  registry: ghcr.io
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}
            - run: |
                  docker build -t ghcr.io/dbca-wa/science-projects-frontend:staging-${{ github.sha }} frontend
                  docker push ghcr.io/dbca-wa/science-projects-frontend:staging-${{ github.sha }}

    deploy-aks:
        needs: [build-frontend, build-backend]
        runs-on: ubuntu-latest
        steps:
            - uses: azure/k8s-set-context@v3
              with:
                  method: kubeconfig
                  kubeconfig: ${{ secrets.KUBE_CONFIG }}
            - run: |
                  kubectl set image deployment/spms-frontend \
                    spms-frontend=ghcr.io/dbca-wa/science-projects-frontend:staging-${{ github.sha }} \
                    -n spms-test
```

### Production Deployment Workflow

**File**: `.github/workflows/deploy-prod.yml`

**Triggers:**

- Push to `main` branch

**Jobs:**

1. **Build Frontend**
    - Runs when frontend files change
    - Builds production bundle with Vite
    - Creates Docker image
    - Pushes to Azure Container Registry
    - Tags with `prod-<version>` and `latest`

2. **Build Backend**
    - Runs when backend files change
    - Creates Docker image
    - Pushes to Azure Container Registry
    - Tags with `prod-<version>` and `latest`

3. **Deploy to AKS** (requires approval)
    - Updates Kubernetes manifests
    - Applies Kustomize overlays for production
    - Deploys to AKS production namespace
    - Runs smoke tests

**Example:**

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    build-frontend:
        if: contains(github.event.head_commit.modified, 'frontend/')
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: oven-sh/setup-bun@v1
            - run: bun install
              working-directory: frontend
            - run: bun run build
              working-directory: frontend
              env:
                  VITE_API_URL: ${{ secrets.PROD_API_URL }}
                  VITE_ENVIRONMENT: production
            - uses: azure/docker-login@v1
              with:
                  registry: ghcr.io
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}
            - run: |
                  VERSION=$(cat frontend/package.json | jq -r .version)
                  docker build -t ghcr.io/dbca-wa/science-projects-frontend:prod-$VERSION frontend
                  docker tag ghcr.io/dbca-wa/science-projects-frontend:prod-$VERSION \
                    ghcr.io/dbca-wa/science-projects-frontend:latest
                  docker push ghcr.io/dbca-wa/science-projects-frontend:prod-$VERSION
                  docker push ghcr.io/dbca-wa/science-projects-frontend:latest

    deploy-aks:
        needs: [build-frontend, build-backend]
        runs-on: ubuntu-latest
        environment:
            name: production
            url: https://scienceprojects.dbca.wa.gov.au
        steps:
            - uses: azure/k8s-set-context@v3
              with:
                  method: kubeconfig
                  kubeconfig: ${{ secrets.KUBE_CONFIG }}
            - run: |
                  VERSION=$(cat frontend/package.json | jq -r .version)
                  kubectl set image deployment/spms-frontend \
                    spms-frontend=ghcr.io/dbca-wa/science-projects-frontend:prod-$VERSION \
                    -n spms-prod
```

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
