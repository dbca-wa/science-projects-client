# Branching Strategy and Workflow

## Branch Structure

```
main (production-ready)
  ↑
develop (UAT environment)
  ↑
feature/* (feature branches)
```

## Branch Purposes

### `main`
- **Purpose**: Production-ready code
- **Deploys to**: Production (on version tags)
- **Protection**: Requires PR approval, all tests must pass
- **Never commit directly** - only merge from `develop`

### `develop`
- **Purpose**: Integration branch for UAT testing
- **Deploys to**: UAT environment (on every push)
- **Protection**: Requires PR approval, all tests must pass
- **Merge from**: Feature branches
- **Merge to**: `main` (when ready for production)

### `feature/*`
- **Purpose**: Individual feature development
- **Naming**: `feature/short-description` (e.g., `feature/user-auth`, `feature/cicd-improvements`)
- **Created from**: `develop`
- **Merged to**: `develop`
- **Deleted after**: Merge is complete

## Workflow

### 1. Starting New Work

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature

# Work on your feature
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### 2. Creating a Pull Request

In GUI or:

```bash
# Create PR from feature branch to develop
gh pr create --base develop --head feature/my-feature \
  --title "feat: Add new feature" \
  --body "Description of changes"
```

**What happens:**
- `test.yml` workflow runs (frontend + backend tests)
- Path-based filtering skips unchanged code
- Coverage badges update on merge to main
- All tests must pass before merge

### 3. Merging to Develop (UAT)

```bash
# After PR approval and tests pass
gh pr merge <pr-number> --squash

# Or via GitHub UI: "Squash and merge"
```

**What happens:**
- `deploy-uat.yml` workflow runs
- Builds `latest` and `test` Docker images
- Pushes to GitHub Container Registry
- Auto-deploys to UAT environment

### 4. Promoting to Production

When UAT testing is complete and ready for production:

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Merge develop into main
git merge develop --no-ff
git push origin main

# Create version tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

**What happens:**
- Merge to main: `test.yml` runs, coverage badges update
- Version tag: `deploy-prod.yml` runs
  - Builds versioned images (`v1.0.0`, `stable`)
  - Pushes to GitHub Container Registry
  - Updates Kustomize manifests (auto-commit)
  - Ready for production deployment

### 5. Cleaning Up

```bash
# Delete feature branch locally
git branch -d feature/my-feature

# Delete feature branch remotely
git push origin --delete feature/my-feature

# Or use GitHub CLI
gh pr close <pr-number> --delete-branch
```

## Keeping Branches in Sync

### Syncing Develop with Main

After merging to main, sync develop to avoid divergence:

```bash
git checkout develop
git pull origin develop
git merge main --no-ff
git push origin develop
```

### Syncing Feature Branch with Develop

If develop has moved ahead while you're working:

```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# If conflicts, resolve them, then:
git add .
git rebase --continue
git push origin feature/my-feature --force-with-lease
```

**Note**: Use `--force-with-lease` instead of `--force` for safety.

## Version Tagging

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features, backward compatible (v1.1.0)
- **PATCH**: Bug fixes, backward compatible (v1.0.1)

### Creating Tags

```bash
# Annotated tag (recommended)
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"
git push origin v1.0.0

# List tags
git tag -l

# Delete tag (if needed)
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## CI/CD Workflows

### Test Workflow (`test.yml`)

**Triggers**: Pull requests to any branch

**Jobs**:
1. **Detect Changes**: Path-based filtering
2. **Frontend Tests**: 2-way sharding (if frontend changed)
3. **Backend Tests**: 4-way sharding (if backend changed)
4. **Coverage Badges**: Update on merge to main

**Artifacts** (7 days retention):
- Frontend coverage JSON
- Backend coverage JSON
- Combined coverage reports

### UAT Deployment (`deploy-uat.yml`)

**Triggers**: Push to `develop` branch

**Jobs**:
1. **Build Frontend**: `latest`, `test` tags
2. **Build Backend**: `latest`, `test` tags
3. **Push to GHCR**: GitHub Container Registry

**Images**:
- `ghcr.io/dbca-wa/science-projects-frontend:latest`
- `ghcr.io/dbca-wa/science-projects-frontend:test`
- `ghcr.io/dbca-wa/science-projects-backend:latest`
- `ghcr.io/dbca-wa/science-projects-backend:test`

### Production Deployment (`deploy-prod.yml`)

**Triggers**: Version tags (e.g., `v1.0.0`)

**Jobs**:
1. **Build Frontend**: Versioned + `stable` tags
2. **Build Backend**: Versioned + `stable` tags
3. **Push to GHCR**: GitHub Container Registry
4. **Update Kustomize**: Auto-commit new image tags

**Images**:
- `ghcr.io/dbca-wa/science-projects-frontend:v1.0.0`
- `ghcr.io/dbca-wa/science-projects-frontend:stable`
- `ghcr.io/dbca-wa/science-projects-backend:v1.0.0`
- `ghcr.io/dbca-wa/science-projects-backend:stable`

## Common Scenarios

### Hotfix for Production

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the bug
git add .
git commit -m "fix: resolve critical bug"
git push origin hotfix/critical-bug

# Create PR to main
gh pr create --base main --head hotfix/critical-bug

# After merge, tag immediately
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1: Fix critical bug"
git push origin v1.0.1

# Merge back to develop
git checkout develop
git merge main --no-ff
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

### Updating Coverage Badges Manually

If the automatic badge update fails:

```bash
# Run tests locally to get coverage
cd frontend
bun run test:coverage | grep "All files"
# Note the coverage percentage (e.g., 66.77%)

cd ../backend
poetry run pytest --cov=. --cov-report=term | grep "TOTAL"
# Note the coverage percentage (e.g., 83%)

# Update README.md badges
# Frontend: Change 50%25 to 66%25 (URL encode %)
# Backend: Change 83%25 to actual percentage

# Commit and push
git add README.md
git commit -m "chore: update coverage badges"
git push origin main
```

### Resolving Merge Conflicts

```bash
# When rebasing or merging
git status  # See conflicted files

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git rebase --continue  # If rebasing
# or
git commit  # If merging

git push origin feature/my-feature --force-with-lease
```

## Best Practices

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve race condition in project map
refactor: consolidate repositories into monorepo
docs: update README with monorepo structure
chore: update dependencies
test: add coverage for caretaker workflow
ci: configure separate test jobs
```

### Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Tests**: Ensure all tests pass
4. **Review**: Request review from team member
5. **Squash**: Use "Squash and merge" to keep history clean

### Branch Hygiene

1. **Delete merged branches**: Keep repository clean
2. **Sync regularly**: Rebase feature branches on develop
3. **Small PRs**: Easier to review and merge
4. **One feature per branch**: Focused changes

## Troubleshooting

### Tests Failing on CI but Pass Locally

```bash
# Ensure dependencies are up to date
cd frontend && bun install
cd ../backend && poetry install

# Run tests exactly as CI does
cd frontend && bun run test
cd ../backend && poetry run pytest
```

### Docker Build Failing

```bash
# Test Docker build locally
docker build -t test-frontend -f frontend/Dockerfile frontend
docker build -t test-backend -f backend/Dockerfile backend

# Check logs
docker logs <container-id>
```

### Coverage Badge Not Updating

1. Check workflow run logs in GitHub Actions
2. Verify `coverage-percentage.txt` artifact exists
3. Ensure merge was to `main` branch
4. Check git bot permissions
5. Update manually if needed (see above)

## References

- **Workflows**: `.github/workflows/`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Contributing**: `CONTRIBUTING.md` (if exists)
- **Semantic Versioning**: https://semver.org/
- **Conventional Commits**: https://www.conventionalcommits.org/
