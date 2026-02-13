# Pre-commit Hooks Guide

## Overview

This monorepo uses pre-commit hooks to ensure code quality before commits. The root-level configuration orchestrates separate frontend and backend pre-commit hooks, running only the relevant checks based on which files you've changed.

## Architecture

```
monorepo/
├── .pre-commit-config.yaml           # Root configuration
├── .pre-commit-frontend-wrapper.sh   # Frontend hook wrapper
├── .pre-commit-backend-wrapper.sh    # Backend hook wrapper
├── frontend/
│   └── .pre-commit-config.yaml       # Frontend-specific hooks
└── backend/
    └── .pre-commit-config.yaml       # Backend-specific hooks
```

## How It Works

1. **Root hooks** run on all files (trailing whitespace, large files, etc.)
2. **Frontend hooks** run only when frontend files change
3. **Backend hooks** run only when backend files change

This approach ensures:
- Fast commits (only relevant checks run)
- No cross-contamination (frontend doesn't need Python, backend doesn't need Bun)
- Reuses existing pre-commit configurations

## Installation

### Prerequisites

**System-wide:**
```bash
# macOS
brew install pre-commit

# Linux
pip install pre-commit

# Windows
pip install pre-commit
```

**Frontend (if working on frontend):**
```bash
cd frontend
bun install
pre-commit install
```

**Backend (if working on backend):**
```bash
cd backend
poetry install
pre-commit install
```

### Root Installation

```bash
# From monorepo root
pre-commit install
```

This installs the root-level hooks that orchestrate frontend and backend checks.

## What Gets Checked

### Root-Level Checks (All Files)

- Trailing whitespace
- End-of-file fixer
- JSON/YAML validation
- Large file detection (>1MB)
- Merge conflict markers
- Case conflicts
- Private key detection
- Line ending consistency (LF)

### Frontend Checks (frontend/ files only)

**Layer 1: File checks**
- Trailing whitespace
- End-of-file fixer
- JSON/YAML validation
- Large files
- Merge conflicts
- Private keys

**Layer 2: Formatting**
- Prettier (auto-fixes)

**Layer 3: Linting**
- ESLint (warnings only, non-blocking)

**Layer 4: Type checking**
- TypeScript (blocking)

**Layer 5: Security**
- Custom security pattern checks

**Layer 6: Project-specific**
- Import validation
- Accessibility hints

**Layer 7: Summary**
- Commit summary report

### Backend Checks (backend/ files only)

**Layer 1: File checks**
- Trailing whitespace
- End-of-file fixer
- YAML/JSON/TOML validation
- Large files
- Merge conflicts
- Private keys

**Layer 2: Formatting**
- Black (auto-fixes)
- isort (auto-fixes)
- autoflake (removes unused imports)

**Layer 3: Linting**
- flake8 (warnings only, non-blocking)

**Layer 4: Django-specific**
- django-upgrade (auto-fixes)

**Layer 5: Security**
- bandit (warnings only, non-blocking)

**Layer 6: Summary**
- Commit summary report

## Usage

### Normal Workflow

Just commit as usual - hooks run automatically:

```bash
git add .
git commit -m "feat: add new feature"
```

### Bypass Hooks (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

**Warning:** Only use `--no-verify` in emergencies. Bypassing hooks can introduce bugs.

### Run Hooks Manually

```bash
# Run all hooks on all files
pre-commit run --all-files

# Run all hooks on staged files
pre-commit run

# Run specific hook
pre-commit run trailing-whitespace

# Run frontend hooks only
cd frontend && pre-commit run --all-files

# Run backend hooks only
cd backend && pre-commit run --all-files
```

### Update Hooks

```bash
# Update to latest hook versions
pre-commit autoupdate

# Update frontend hooks
cd frontend && pre-commit autoupdate

# Update backend hooks
cd backend && pre-commit autoupdate
```

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall hooks
pre-commit uninstall
pre-commit install

# Verify installation
ls -la .git/hooks/pre-commit
```

### Hooks Failing

**Check which hook failed:**
```bash
# Run hooks manually to see detailed output
pre-commit run --all-files
```

**Common issues:**

1. **TypeScript errors (frontend)**
   - Fix type errors in your code
   - Or temporarily bypass: `git commit --no-verify`

2. **Black formatting (backend)**
   - Run: `cd backend && black .`
   - Commit again

3. **ESLint errors (frontend)**
   - Run: `cd frontend && bun run lint`
   - Fix errors and commit again

4. **Import errors (frontend)**
   - Check import paths are correct
   - Ensure no circular dependencies

### Hooks Too Slow

If hooks are taking too long:

1. **Check what's running:**
   ```bash
   pre-commit run --verbose
   ```

2. **Skip slow checks temporarily:**
   ```bash
   SKIP=typescript,mypy git commit -m "message"
   ```

3. **Disable specific hooks:**
   Edit `.pre-commit-config.yaml` and comment out slow hooks

### Frontend/Backend Hooks Not Found

Ensure pre-commit is installed in each directory:

```bash
# Frontend
cd frontend
pre-commit install

# Backend
cd backend
pre-commit install
```

## CI/CD Integration

Pre-commit hooks match CI/CD checks:

- **Local hooks** catch issues before commit
- **CI/CD workflows** catch issues before merge
- Same tools, same rules, same results

This ensures:
- Faster feedback (catch issues locally)
- Fewer CI/CD failures
- Consistent code quality

## Configuration Files

### Root Configuration

**File:** `.pre-commit-config.yaml`

Orchestrates frontend and backend hooks. Modify to:
- Add/remove root-level checks
- Change hook versions
- Adjust file patterns

### Frontend Configuration

**File:** `frontend/.pre-commit-config.yaml`

Frontend-specific hooks. Modify to:
- Add/remove frontend checks
- Configure ESLint/Prettier
- Adjust TypeScript settings

### Backend Configuration

**File:** `backend/.pre-commit-config.yaml`

Backend-specific hooks. Modify to:
- Add/remove backend checks
- Configure Black/isort/flake8
- Adjust Python settings

## Best Practices

1. **Run hooks before pushing:**
   ```bash
   pre-commit run --all-files
   ```

2. **Keep hooks fast:**
   - Only check changed files
   - Skip slow checks in pre-commit
   - Run comprehensive checks in CI/CD

3. **Fix issues immediately:**
   - Don't bypass hooks repeatedly
   - Fix root cause, not symptoms

4. **Update hooks regularly:**
   ```bash
   pre-commit autoupdate
   ```

5. **Document custom hooks:**
   - Add comments to configuration
   - Explain why hooks exist

## Disabling Hooks

### Temporarily (One Commit)

```bash
git commit --no-verify -m "message"
```

### Permanently (Not Recommended)

```bash
pre-commit uninstall
```

### Disable Specific Hook

Edit `.pre-commit-config.yaml` and comment out the hook:

```yaml
# - repo: https://github.com/pre-commit/mirrors-prettier
#   rev: v4.0.0-alpha.8
#   hooks:
#     - id: prettier
```

## Getting Help

- **Pre-commit docs:** https://pre-commit.com
- **Frontend hooks:** See `frontend/.pre-commit-config.yaml`
- **Backend hooks:** See `backend/.pre-commit-config.yaml`
- **Issues:** Create GitHub issue with `pre-commit` label

## Summary

Pre-commit hooks ensure code quality before commits by:
- Running only relevant checks (fast)
- Catching issues early (before CI/CD)
- Maintaining consistency (same rules everywhere)
- Reusing existing configurations (no duplication)

Just commit normally - hooks run automatically and only check what changed.
