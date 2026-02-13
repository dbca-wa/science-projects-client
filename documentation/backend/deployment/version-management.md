# Version Management and Automated Updates

## Overview

The Science Projects Management System uses automated version management to keep Kustomize deployment configurations in sync with GitHub releases. This eliminates manual version updates and reduces deployment errors.

## How It Works

### Automated Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Create GitHub Release                                    │
│     git tag v3.4.13                                          │
│     git push origin v3.4.13                                  │
│     gh release create v3.4.13                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GitHub Actions Triggered                                 │
│     Workflow: "Update Kustomize Versions"                    │
│     - Extracts version from tag (v3.4.13 → 3.4.13)          │
│     - Updates kustomize/overlays/prod/kustomization.yaml     │
│     - Updates kustomize/overlays/test/kustomization.yaml     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Pull Request Created                                     │
│     Title: "chore: update Kustomize versions to 3.4.13"     │
│     - Shows diff of version changes                          │
│     - Includes deployment checklist                          │
│     - Labels: automated, deployment, version-update          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Maintainer Review                                        │
│     - Review version changes                                 │
│     - Verify release notes                                   │
│     - Merge PR                                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Automatic Staging Deployment                             │
│     - Staging deploys version 3.4.13                         │
│     - Monitor in Azure Rancher                               │
│     - Verify functionality                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Manual Production Approval                               │
│     - Approve production deployment                          │
│     - Production deploys version 3.4.13                      │
│     - Monitor and verify                                     │
└─────────────────────────────────────────────────────────────┘
```

## Creating a Release

### Standard Release Process

**Step 1: Prepare Release**
```powershell
# Ensure develop is stable and tested
git checkout develop
git pull origin develop

# Merge develop to main via pull request
# (Create PR on GitHub: develop → main)
# After PR approval and merge:

# Switch to main and pull latest
git checkout main
git pull origin main

# Verify tests pass
# (CI runs automatically on main)
```

**Step 2: Create Release Tag**
```powershell
# Create semantic version tag
git tag v3.4.13

# Push tag to GitHub
git push origin v3.4.13
```

**Step 3: Create GitHub Release**

**Option A: GitHub Web UI**
1. Go to repository → Releases → "Draft a new release"
2. Choose tag: `v3.4.13`
3. Release title: `Release 3.4.13`
4. Add release notes (features, fixes, breaking changes)
5. Click "Publish release"

**Option B: GitHub CLI**
```powershell
gh release create v3.4.13 `
  --title "Release 3.4.13" `
  --notes "
## Features
- Added new feature X
- Improved performance of Y

## Bug Fixes
- Fixed issue with Z

## Breaking Changes
- None
"
```

**Step 4: Monitor Automation**
1. GitHub Actions automatically triggers "Update Kustomize Versions" workflow
2. Check Actions tab for workflow progress
3. Wait for PR to be created (usually < 1 minute)

**Step 5: Review and Merge PR**
1. Review the automatically created PR
2. Verify version numbers are correct
3. Check that both prod and test kustomization files are updated
4. Merge the PR

**Step 6: Verify Staging Deployment**
1. Staging automatically deploys after PR merge
2. Check Azure Rancher for pod status
3. Verify application functionality
4. Check logs for errors

**Step 7: Submit RFC for Production Deployment**
1. Once staging is verified, submit RFC via Freshservice
2. See [Change Management](../operations/change-management.md) for RFC process
3. Wait for RFC approval before proceeding

**Step 8: Approve Production Deployment**
1. After RFC approval, approve production deployment
2. Monitor production deployment in Rancher
3. Verify production functionality

## Manual Version Update

If you need to update versions without creating a release:

**Step 1: Trigger Workflow**
1. Go to GitHub Actions
2. Select "Update Kustomize Versions" workflow
3. Click "Run workflow"
4. Enter version number (e.g., `3.4.13`)
5. Click "Run workflow"

**Step 2: Follow Standard Process**
- Review and merge the created PR
- Verify staging deployment
- Approve production deployment

## Version Numbering

### Semantic Versioning

We use semantic versioning: `MAJOR.MINOR.PATCH`

**MAJOR** (3.x.x):
- Breaking changes
- Major feature releases
- Database schema changes requiring migration

**MINOR** (x.4.x):
- New features (backward compatible)
- Significant improvements
- New API endpoints

**PATCH** (x.x.13):
- Bug fixes
- Security patches
- Minor improvements
- Documentation updates

### Examples

```powershell
# Bug fix release
v3.4.13 → v3.4.14

# New feature release
v3.4.14 → v3.5.0

# Breaking change release
v3.5.0 → v4.0.0
```

## Rollback Process

### Rolling Back to Previous Version

**Step 1: Identify Target Version**
```powershell
# List recent releases
gh release list

# Or check git tags
git tag -l | tail -10
```

**Step 2: Create Rollback Release**
```powershell
# Option 1: Re-release previous version
gh release create v3.4.12 `
  --title "Rollback to 3.4.12" `
  --notes "Rolling back due to issue in 3.4.13"

# Option 2: Manual workflow trigger
# Go to GitHub Actions → "Update Kustomize Versions"
# Enter version: 3.4.12
```

**Step 3: Follow Standard Process**
- Review and merge the rollback PR
- Verify staging deployment
- Approve production deployment

### Emergency Rollback

**Note**: Emergency rollbacks may still require RFC approval depending on the situation. Consult with OIM if unsure.

If you need to rollback immediately without waiting for automation:

```bash
# Rollback Kubernetes deployment directly via Rancher GUI
# Navigate to: Workloads → Deployments → spms-deployment-prod
# Select "Rollback" from actions menu

# Or via kubectl (if Rancher unavailable)
kubectl rollout undo deployment/spms-deployment-prod -n spms-production

# Then create proper release/PR for audit trail
# Submit RFC documenting the emergency rollback
```

## Troubleshooting

### Workflow Didn't Trigger

**Symptoms**: Release created but no PR appeared

**Possible Causes**:
1. Workflow file not in `main` branch
2. GitHub Actions disabled
3. Insufficient permissions

**Resolution**:
```bash
# Manually trigger workflow
# Go to GitHub Actions → "Update Kustomize Versions"
# Enter version manually
```

### PR Creation Failed

**Symptoms**: Workflow ran but no PR created

**Possible Causes**:
1. No changes detected (version already up to date)
2. Branch already exists
3. Permission issues

**Resolution**:
```bash
# Check if version is already current
cat kustomize/overlays/prod/kustomization.yaml | grep newTag

# If needed, manually update and create PR
```

### Version Mismatch

**Symptoms**: Staging and production have different versions

**Possible Causes**:
1. Production deployment not approved
2. Manual changes to kustomization files
3. Partial PR merge

**Resolution**:
```bash
# Check current versions
kubectl get deployment spms-deployment-prod -n spms-production -o jsonpath='{.spec.template.spec.containers[0].image}'
kubectl get deployment spms-deployment-test -n spms-staging -o jsonpath='{.spec.template.spec.containers[0].image}'

# Create new release to sync versions
```

## Best Practices

### Release Management

**DO**:
- Use semantic versioning consistently
- Write clear release notes
- Test in staging before production
- Submit RFC for production deployments (see [Change Management](../operations/change-management.md))
- Create releases from `main` branch only
- Tag releases with `v` prefix (e.g., `v3.4.13`)

**DON'T**:
- Skip staging verification
- Deploy to production without RFC approval
- Create releases from feature branches
- Use non-semantic version numbers
- Manually edit kustomization files (use automation)
- Delete release tags (breaks audit trail)

### Version Updates

**DO**:
- Review automated PRs before merging
- Verify version numbers are correct
- Check that both environments are updated
- Monitor staging deployment before production
- Document breaking changes in release notes

**DON'T**:
- Merge version update PRs without review
- Skip staging deployment
- Approve production without staging verification
- Manually update versions (use automation)
- Create releases without testing

### Rollbacks

**DO**:
- Document reason for rollback
- Create proper release for rollback version
- Verify rollback in staging first
- Investigate root cause after rollback
- Update documentation if needed

**DON'T**:
- Rollback without investigation
- Skip staging verification
- Forget to create audit trail
- Ignore underlying issues
- Rollback multiple versions at once

## Monitoring Version Deployments

### Check Current Versions

**Via kubectl**:
```bash
# Production
kubectl get deployment spms-deployment-prod -n spms-production \
  -o jsonpath='{.spec.template.spec.containers[*].image}' | tr ' ' '\n'

# Staging
kubectl get deployment spms-deployment-test -n spms-staging \
  -o jsonpath='{.spec.template.spec.containers[*].image}' | tr ' ' '\n'
```

**Via Azure Rancher**:
1. Navigate to cluster
2. Select namespace (spms-production or spms-staging)
3. View deployment details
4. Check image tags

**Via Kustomize Files**:
```bash
# Production
cat kustomize/overlays/prod/kustomization.yaml | grep newTag

# Staging
cat kustomize/overlays/test/kustomization.yaml | grep newTag
```

### Verify Deployment Success

**Check Pod Status**:
```bash
kubectl get pods -n spms-production
```

**Check Rollout Status**:
```bash
kubectl rollout status deployment/spms-deployment-prod -n spms-production
```

**Check Application Status**:
```bash
# Check application status in Azure Rancher (preferred method)
# Navigate to: https://rancher.dbca.wa.gov.au
# Select namespace: spms-production
# View deployment status and pod health

# Or via kubectl (if Rancher unavailable)
kubectl get deployment spms-deployment-prod -n spms-production
```

**Check Logs**:
```bash
# Via Rancher GUI (preferred method)
# Navigate to: Workloads → Deployments → spms-deployment-prod
# Click "View Logs" button

# Or via kubectl (if Rancher unavailable)
kubectl logs -f deployment/spms-deployment-prod -n spms-production
```

## Integration with CI/CD

### Workflow Dependencies

```
Test Suite and Coverage (test.yml)
  ↓
  Runs on: PR, push to main/develop
  ↓
  Tests pass → Merge to main
  ↓
Create GitHub Release
  ↓
Update Kustomize Versions (update-version.yml)
  ↓
  Triggered by: Release published
  ↓
  Creates PR with version updates
  ↓
Review and Merge PR
  ↓
Staging Deployment (automatic)
  ↓
  Verify in staging
  ↓
Submit RFC for Production (manual)
  ↓
  Wait for RFC approval
  ↓
Production Deployment (manual approval)
```

### Workflow Files

- **Test Suite**: `.github/workflows/test.yml`
- **Version Updates**: `.github/workflows/update-version.yml`
- **Deployment**: Handled by Kubernetes (kubectl apply)

## References

- **Change Management**: `../operations/change-management.md` - RFC process for production deployments
- **Kubernetes Setup**: `kubernetes-setup.md` - Kubernetes configuration and Rancher usage
- **Monitoring**: `monitoring-setup.md` - Monitoring and logging setup
- **GitHub Releases**: https://docs.github.com/en/repositories/releasing-projects-on-github
- **Semantic Versioning**: https://semver.org/
