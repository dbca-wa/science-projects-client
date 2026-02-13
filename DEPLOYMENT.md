# Deployment Guide

This guide covers deploying the Science Projects Management System to UAT and Production environments.

## Overview

The deployment process uses three separate GitHub Actions workflows:

- **test.yml** - Runs on pull requests to `main` or `develop` (testing)
- **deploy-uat.yml** - Runs on push to `develop` (auto-deploy to UAT)
- **deploy-prod.yml** - Runs on version tags (manual deploy to production)

## Branch Strategy

```
feature → develop (UAT) → main (Production) → tagged release
           ↓                                        ↓
          UAT                                  Production
```

- **develop**: UAT environment (auto-deploy on merge)
- **main**: Production-ready code (protected, requires PR from develop)
- **tags (v*)**: Production releases (triggers production deployment)

**Workflow:**
1. Create feature branch from `develop`
2. Create PR to `develop` → tests run
3. Merge to `develop` → UAT auto-deploys
4. Test in UAT
5. Create PR from `develop` to `main` → tests run again
6. Merge to `main` → production-ready (no auto-deploy)
7. Create version tag → production deployment triggered

**Why this approach?**
- Clear separation: develop = UAT, main = production
- Main always reflects production state
- UAT for testing before production
- Production deployments are explicit (via tags)

## Deployment Environments

### UAT (User Acceptance Testing)

**Purpose**: Testing before production release

**Infrastructure**:
- Azure Rancher Kubernetes (rancher-uat.dbca.wa.gov.au)
- Cluster: `az-aks-oim03`
- Namespace: `spms-test`
- Deployment: `spms-deployment-test`
- Auto-deployment enabled

**Image Tags**:
- `ghcr.io/dbca-wa/science-projects-frontend:latest`
- `ghcr.io/dbca-wa/science-projects-frontend:test`
- `ghcr.io/dbca-wa/science-projects-backend:latest`

**Configuration**:
- `VITE_PRODUCTION_BACKEND_API_URL`: UAT backend URL
- `imagePullPolicy: Always` (pulls latest on restart)

### Production

**Purpose**: Live user-facing application

**Infrastructure**:
- Azure Rancher Kubernetes (rancher.dbca.wa.gov.au)
- Cluster: TBD (contact DevOps)
- Namespace: `spms-prod` (TBD)
- Deployment: `spms-deployment-prod` (TBD)
- Manual deployment required

**Image Tags**:
- `ghcr.io/dbca-wa/science-projects-frontend:v1.2.3`
- `ghcr.io/dbca-wa/science-projects-frontend:stable`
- `ghcr.io/dbca-wa/science-projects-backend:v1.2.3`
- `ghcr.io/dbca-wa/science-projects-backend:stable`

**Configuration**:
- `VITE_PRODUCTION_BACKEND_API_URL`: Production backend URL
- `imagePullPolicy: IfNotPresent` (uses specific version)

## Deploying to UAT

### Automatic Deployment

1. **Create feature branch from develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

2. **Create PR to develop**:
   - Go to GitHub and create PR from `feature/my-feature` to `develop`
   - Tests will run automatically
   - Get PR approved

3. **Merge to develop**:
   - Merge the PR
   - GitHub Actions automatically:
     - Builds frontend with UAT configuration
     - Builds backend
     - Pushes images tagged as `latest` and `test`
     - UAT Kubernetes pulls new images within 5 minutes

4. **Verify deployment**:
   - Check GitHub Actions: https://github.com/dbca-wa/science-projects/actions
   - Check UAT application: https://scienceprojects-test.dbca.wa.gov.au
   - Check Kubernetes pods (via Rancher at rancher-uat.dbca.wa.gov.au):
     ```bash
     # Access cluster: az-aks-oim03
     kubectl get pods -n spms-test
     kubectl logs -f deployment/spms-deployment-test -n spms-test
     ```

### Manual UAT Deployment (if needed)

If auto-deployment fails or you need to force a deployment:

```bash
# Access via Rancher: rancher-uat.dbca.wa.gov.au
# Cluster: az-aks-oim03
# Namespace: spms-test

# Force Kubernetes to pull latest images
kubectl rollout restart deployment/spms-deployment-test -n spms-test

# Check rollout status
kubectl rollout status deployment/spms-deployment-test -n spms-test
```

## Deploying to Production

### Prerequisites

- UAT has been tested and is stable
- All tests pass on `develop` branch
- Team approval for production release

### Step 1: Create PR from Develop to Main

```bash
# Ensure develop is up to date and tested in UAT
git checkout develop
git pull origin develop

# Create PR from develop to main on GitHub
# This triggers tests one more time before production
```

**On GitHub:**
1. Go to Pull Requests
2. Click "New Pull Request"
3. Base: `main`, Compare: `develop`
4. Create PR and get approval
5. Merge to main

### Step 2: Create Version Tag

After merging to main, create a version tag to trigger production deployment.

Use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backward compatible (v1.2.0)
- **PATCH**: Bug fixes (v1.2.3)

```bash
# Checkout main and pull latest
git checkout main
git pull origin main

# Create annotated tag with message
git tag -a v1.2.3 -m "Release v1.2.3: Add new feature X"

# Push tag to trigger production deployment
git push origin v1.2.3
```

**Alternative: Create release on GitHub**
1. Go to Releases on GitHub
2. Click "Draft a new release"
3. Click "Choose a tag" → type `v1.2.3` → "Create new tag"
4. Fill in release title and description
5. Click "Publish release"
6. This automatically pushes the tag and triggers deployment

### Step 3: Wait for Build

GitHub Actions automatically:
- Builds frontend with production configuration
- Builds backend
- Pushes images tagged with version and `stable`
- Updates Kustomize configurations in `kustomize/overlays/prod/` and `kustomize/overlays/test/`

Monitor progress: https://github.com/dbca-wa/science-projects/actions

### Step 4: Deploy to Kubernetes

**Option A: Using Kustomize (Recommended)**

```bash
# Deploy to production using Kustomize
kubectl apply -k kustomize/overlays/prod/

# Check rollout status
kubectl rollout status deployment/spms-deployment-prod -n spms-prod
```

**Option B: Using kubectl**

```bash
# Update deployment with new image versions
kubectl set image deployment/spms-deployment-prod \
  frontend=ghcr.io/dbca-wa/science-projects-frontend:v1.2.3 \
  backend=ghcr.io/dbca-wa/science-projects-backend:v1.2.3 \
  -n spms-prod

# Check rollout status
kubectl rollout status deployment/spms-deployment-prod -n spms-prod
```

**Option C: Using Rancher UI**

1. Navigate to Rancher dashboard (rancher.dbca.wa.gov.au)
2. Select cluster and `spms-prod` namespace
3. Find `spms-deployment-prod` deployment
4. Click "Edit" → "Upgrade"
5. Update frontend image tag to `v1.2.3`
6. Update backend image tag to `v1.2.3`
7. Click "Save"

### Step 5: Verify Deployment

```bash
# Check pods are running
kubectl get pods -n spms-prod

# Check deployment logs
kubectl logs -f deployment/spms-deployment-prod -n spms-prod

# Check application is accessible
curl https://scienceprojects.dbca.wa.gov.au
curl https://scienceprojects.dbca.wa.gov.au/api/v1/
```

## Rollback Procedures

### UAT Rollback

If UAT deployment breaks:

1. **Identify the problematic commit**:
   ```bash
   git log --oneline develop
   ```

2. **Revert the commit**:
   ```bash
   git checkout develop
   git revert <commit-hash>
   git push origin develop
   ```

3. **New `latest` image builds automatically**
4. **UAT environment recovers within 5 minutes**

### Production Rollback

If production deployment breaks:

1. **Identify the previous working version**:
   ```bash
   git tag --sort=-version:refname | head -5
   # Example output: v1.2.3, v1.2.2, v1.2.1, ...
   ```

2. **Rollback using kubectl**:
   ```bash
   # Rollback to previous version (e.g., v1.2.2)
   kubectl set image deployment/spms-deployment-prod \
     frontend=ghcr.io/dbca-wa/science-projects-frontend:v1.2.2 \
     backend=ghcr.io/dbca-wa/science-projects-backend:v1.2.2 \
     -n spms-prod
   ```

3. **Or use Rancher UI** (rancher.dbca.wa.gov.au) to select previous version

4. **Verify rollback**:
   ```bash
   kubectl rollout status deployment/spms-deployment-prod -n spms-prod
   ```

5. **No need to rebuild images** - Previous versions are immutable and available in registry

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
1. Go to https://github.com/dbca-wa/science-projects/actions
2. Find the failed workflow run
3. Click on the failed job
4. Review error messages

**Common issues**:
- Build failures: Check Dockerfile syntax
- Push failures: Verify GITHUB_TOKEN permissions
- Test failures: Fix tests before deploying

### Pods Not Starting

**Check pod status**:
```bash
kubectl get pods -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
```

**Common issues**:
- Image pull errors: Verify image exists in registry
- Crash loop: Check application logs
- Resource limits: Check memory/CPU limits

### Application Errors

**Check logs**:
```bash
# UAT logs
kubectl logs -f deployment/spms-deployment-test -n spms-test

# Production logs
kubectl logs -f deployment/spms-deployment-prod -n spms-prod

# Previous pod logs (if pod restarted)
kubectl logs deployment/spms-deployment-test -n spms-test --previous
```

**Common issues**:
- Configuration errors: Check environment variables
- Database connection: Verify DATABASE_URL
- API connection: Verify VITE_PRODUCTION_BACKEND_API_URL

## Monitoring

### GitHub Actions

Monitor workflow runs:
- https://github.com/dbca-wa/science-projects/actions

### Kubernetes

Check deployment status via Rancher (rancher-uat.dbca.wa.gov.au or rancher.dbca.wa.gov.au):
```bash
# UAT - Cluster: az-aks-oim03
kubectl get deployments -n spms-test
kubectl get pods -n spms-test
kubectl get events -n spms-test --sort-by='.lastTimestamp'

# Production (TBD - contact DevOps for cluster details)
kubectl get deployments -n spms-prod
kubectl get pods -n spms-prod
kubectl get events -n spms-prod --sort-by='.lastTimestamp'
```

### Application Health

Check application endpoints:
```bash
# UAT
curl https://scienceprojects-test.dbca.wa.gov.au
curl https://scienceprojects-test.dbca.wa.gov.au/api/v1/

# Production
curl https://scienceprojects.dbca.wa.gov.au
curl https://scienceprojects.dbca.wa.gov.au/api/v1/
```

## GitHub Configuration

The workflows use hardcoded URLs (not secrets) for the frontend build:

**UAT/Test Environment:**
- Base URL: `https://scienceprojects-test.dbca.wa.gov.au/`
- Backend API: `https://scienceprojects-test.dbca.wa.gov.au/api/v1/`
- Profiles: `https://science-profiles-test.dbca.wa.gov.au/`

**Production Environment:**
- Base URL: `https://scienceprojects.dbca.wa.gov.au/`
- Backend API: `https://scienceprojects.dbca.wa.gov.au/api/v1/`
- Profiles: `https://science-profiles.dbca.wa.gov.au/`

**Required secrets:**
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (for pushing Docker images)

**Note**: URLs are hardcoded in workflow files (not secrets) because they are public-facing and not sensitive.

## Kustomize Configuration

The repository includes Kustomize configurations for deploying to Kubernetes:

**Structure:**
```
kustomize/
├── base/                    # Base configuration (shared)
│   ├── deployment.yaml      # Deployment with frontend + backend containers
│   ├── service.yaml         # Service configuration
│   └── kustomization.yaml   # Base kustomization
└── overlays/
    ├── prod/                # Production overlay
    │   ├── kustomization.yaml
    │   ├── ingress.yaml
    │   └── ...
    └── test/                # Test/UAT overlay
        ├── kustomization.yaml
        ├── ingress.yaml
        └── ...
```

**Image Configuration:**
- Both overlays reference `ghcr.io/dbca-wa/science-projects-frontend` and `ghcr.io/dbca-wa/science-projects-backend`
- Image tags are automatically updated by GitHub Actions on tagged releases
- The `update-kustomize` job updates both `prod` and `test` overlays with the new version
- Commits are made using `github-actions[bot]` credentials

**Deployment:**
```bash
# Deploy to test/UAT
kubectl apply -k kustomize/overlays/test/

# Deploy to production
kubectl apply -k kustomize/overlays/prod/
```

## Best Practices

### Before Deploying

- ✅ All tests pass locally
- ✅ Code reviewed and approved
- ✅ UAT tested and verified
- ✅ Database migrations prepared (if any)
- ✅ Team notified of deployment

### During Deployment

- ✅ Monitor GitHub Actions workflow
- ✅ Watch Kubernetes pod status
- ✅ Check application logs
- ✅ Verify application functionality

### After Deployment

- ✅ Verify application works correctly
- ✅ Check for errors in logs
- ✅ Monitor performance metrics
- ✅ Notify team of successful deployment

### Deployment Windows

- **UAT**: Anytime (auto-deploy)
- **Production**: Business hours preferred (for immediate support if issues arise)
- **Avoid**: Friday afternoons, before holidays

## Emergency Procedures

### Critical Production Issue

1. **Immediate rollback** to previous version
2. **Notify team** via Microsoft Teams
3. **Investigate issue** in UAT environment
4. **Fix and test** in UAT
5. **Deploy fix** to production when ready

### Database Issues

1. **Do not rollback application** if database migrations have run
2. **Contact database administrator**
3. **Restore from backup** if necessary
4. **Re-run migrations** if needed

## Support

For deployment issues:
- **GitHub Issues**: https://github.com/dbca-wa/science-projects/issues
- **Microsoft Teams**: Science Projects channel
- **Documentation**: See README.md and this file

---

**Last Updated**: February 13, 2026
