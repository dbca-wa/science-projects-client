# Dependency Scanning with Dependabot

**Applies to**: Both (Frontend and Backend)

## Overview

Dependabot is GitHub's automated dependency update tool that scans for vulnerable dependencies and creates pull requests to update them. It's configured at the **organisation level** by DBCA IT.

## What is Dependabot?

**Dependabot monitors:**

- Python dependencies (pyproject.toml, requirements.txt)
- GitHub Actions versions
- Docker base images
- Git submodules

**Dependabot actions:**

- Scans dependencies daily
- Checks against vulnerability database
- Creates PRs for updates
- Groups related updates
- Provides security advisories

## Configuration

### Organisation-Level Setup

**Configured by:** DBCA IT  
**Location:** GitHub organisation settings  
**Scope:** All repositories

**What's configured:**

- Scan frequency
- Update strategy
- PR limits
- Reviewers
- Labels

## Viewing Dependabot Alerts

### GitHub Security Tab

**Location:** Repository → Security → Dependabot alerts

**Information shown:**

- Package name and version
- Vulnerability severity
- CVE identifier
- Affected versions
- Patched versions
- Recommendation

### Alert Details

**Each alert includes:**

1. **Vulnerability:** Description of the issue
2. **Severity:** Critical/High/Medium/Low
3. **CVE:** Common Vulnerabilities and Exposures ID
4. **CVSS Score:** Numerical severity rating
5. **Affected Versions:** Which versions are vulnerable
6. **Patched Versions:** Which versions fix the issue
7. **References:** Links to advisories and patches

## Dependabot Pull Requests

### PR Format

**Title:**

```
Bump django from 4.2.0 to 4.2.1
```

**Description:**

```
Bumps django from 4.2.0 to 4.2.1.

Release notes
Sourced from django's releases.

Changelog
Sourced from django's changelog.

Commits
- abc1234 Fixed security issue CVE-2024-1234
- def5678 Updated documentation

Dependabot compatibility score
Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself.
```

### Reviewing Dependabot PRs

**Review checklist:**

- [ ] Check what changed (release notes)
- [ ] Verify it's a security fix or minor update
- [ ] Check for breaking changes
- [ ] Review changelog
- [ ] Run tests locally if major update
- [ ] Check compatibility with other dependencies

**For security updates:**

- [ ] Verify CVE is relevant to our usage
- [ ] Check severity (Critical/High = merge ASAP)
- [ ] Test critical functionality
- [ ] Merge and deploy quickly

**For version updates:**

- [ ] Review breaking changes
- [ ] Test affected functionality
- [ ] Update code if needed
- [ ] Merge when tests pass

### Merging Dependabot PRs

**Security updates (merge immediately):**

```bash
# Review the PR
gh pr view 123

# Merge if tests pass
gh pr merge 123 --squash
```

**Version updates (test first):**

```bash
# Checkout PR locally
gh pr checkout 123

# Run tests
poetry run pytest

# If tests pass, merge
gh pr merge 123 --squash
```

## Handling Vulnerable Dependencies

### Triage Process

**1. Assess severity:**

- Critical: Immediate action required
- High: Fix within 7 days
- Medium: Fix within 30 days
- Low: Fix in next sprint

**2. Check if exploitable:**

- Is the vulnerable code path used?
- Are there mitigating controls?
- What's the actual risk?

**3. Determine action:**

- Update to patched version
- Apply workaround
- Accept risk (document why)
- Replace dependency

### Update Strategies

**Simple update (patch version):**

```bash
# Update single dependency
poetry update django

# Verify tests pass
poetry run pytest

# Commit and push
git commit -am "Update django to 4.2.1 (security fix)"
```

**Major update (breaking changes):**

```bash
# Update dependency
poetry update django

# Fix breaking changes
# ... update code ...

# Run full test suite
poetry run pytest

# Manual testing
poetry run python manage.py runserver

# Commit changes
git commit -am "Update django to 5.0.0"
```

**Workaround (if update not possible):**

```python
# Document why not updating
# pyproject.toml
[tool.poetry.dependencies]
# Pinned to 4.2.0 due to breaking changes in 4.3.0
# TODO: Update after refactoring authentication (Issue #123)
django = "4.2.0"
```

## Dependency Update Best Practices

### 1. Keep Dependencies Updated

**Regular updates:**

- Review Dependabot PRs weekly
- Merge security updates immediately
- Test and merge version updates monthly
- Don't let updates pile up

### 2. Test Before Merging

**Always test:**

- Run automated tests
- Test affected functionality manually
- Check for breaking changes
- Verify in staging environment

### 3. Group Related Updates

**Dependabot can group updates:**

```yaml
# .github/dependabot.yml
groups:
    django-ecosystem:
        patterns:
            - "django*"
            - "djangorestframework*"
```

### 4. Pin Critical Dependencies

**Pin versions for stability:**

```toml
# pyproject.toml
[tool.poetry.dependencies]
django = "4.2.1"  # Exact version
djangorestframework = "^3.14.0"  # Compatible versions
```

### 5. Document Pinned Versions

**Always explain why:**

```toml
# Pinned to 4.2.1 due to breaking changes in 4.3.0
# See: https://docs.djangoproject.com/en/4.3/releases/4.3/
# TODO: Update after testing (Issue #123)
django = "4.2.1"
```

## Common Scenarios

### Scenario 1: Critical Security Update

**Alert:** Django has critical SQL injection vulnerability

**Action:**

1. Review Dependabot PR immediately
2. Check if vulnerability affects our code
3. Merge PR if tests pass
4. Deploy to production ASAP
5. Verify fix in production
6. Document in incident log

### Scenario 2: Breaking Changes

**Alert:** Major version update with breaking changes

**Action:**

1. Review changelog for breaking changes
2. Create feature branch
3. Update dependency
4. Fix breaking changes in code
5. Run full test suite
6. Test in staging environment
7. Merge when verified
8. Deploy with monitoring

### Scenario 3: Transitive Dependency

**Alert:** Vulnerability in dependency of dependency

**Action:**

1. Check if direct dependency has update
2. Update direct dependency if available
3. If not, wait for upstream fix
4. Consider replacing dependency if critical
5. Document risk if accepting

### Scenario 4: False Positive

**Alert:** Vulnerability in unused code path

**Action:**

1. Verify vulnerability doesn't affect us
2. Document why it's not exploitable
3. Dismiss alert with explanation
4. Consider updating anyway for future-proofing

## Dependabot Configuration

### Update Frequency

**Recommended:**

- Security updates: Daily
- Version updates: Weekly
- GitHub Actions: Weekly

**Configuration:**

```yaml
schedule:
    interval: "daily" # or "weekly", "monthly"
    day: "monday" # for weekly
    time: "09:00" # UTC time
```

### PR Limits

**Prevent PR overload:**

```yaml
open-pull-requests-limit: 10 # Max open PRs
```

**Why limit:**

- Prevents overwhelming maintainer
- Forces prioritisation
- Encourages regular reviews

### Grouping Updates

**Group related dependencies:**

```yaml
groups:
    django:
        patterns:
            - "django*"
    testing:
        patterns:
            - "pytest*"
            - "coverage"
```

## Metrics and Reporting

### Key Metrics

**Track:**

- Open vulnerability alerts
- Mean time to merge security updates
- Dependency update frequency
- Outdated dependencies count

**Target metrics:**

- Zero critical/high vulnerabilities
- < 7 days to merge security updates
- < 30 days to merge version updates
- < 10% outdated dependencies

### Monthly Report

**Include:**

- Security updates merged
- Version updates merged
- Open vulnerability alerts
- Outdated dependencies
- Action items

## Resources

- **Dependabot Documentation:** https://docs.github.com/en/code-security/dependabot
- **Python Security Advisories:** https://github.com/pypa/advisory-database
- **CVE Database:** https://cve.mitre.org/
- **NIST NVD:** https://nvd.nist.gov/

## Related Documentation

- **Security Overview:** `README.md`
- **Code Scanning:** `code-scanning.md`
- **Security Review Process:** `security-review-process.md`
