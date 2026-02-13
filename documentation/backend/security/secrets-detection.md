# Secrets Detection with GitGuardian

## Overview

GitGuardian scans commits for exposed secrets (API keys, passwords, tokens) and alerts when secrets are detected. It's configured at the **organisation level** by DBCA IT.

## What GitGuardian Detects

**Common secrets:**
- AWS credentials (access keys, secret keys)
- Azure credentials (connection strings, keys)
- Database credentials (passwords, connection strings)
- API keys and tokens
- Private keys (SSH, SSL, GPG)
- OAuth tokens
- Slack webhooks
- Generic secrets patterns

**Detection methods:**
- Pattern matching (regex)
- Entropy analysis (randomness)
- Context analysis (variable names)
- Historical scanning (past commits)

## Configuration

**Configured by:** DBCA IT  
**Location:** GitHub organisation settings  
**Scope:** All repositories

**What's monitored:**
- All commits to all branches
- Pull requests
- Historical commits
- Public and private repositories

## Viewing GitGuardian Alerts

### GitHub Security Tab

**Location:** Repository → Security → Secret scanning alerts

**Alert information:**
- Secret type (AWS key, database password, etc.)
- Location (file, line number, commit)
- Commit hash and author
- Date detected
- Status (open, resolved, false positive)

### Alert Details

**Each alert shows:**
1. **Secret type:** What kind of secret was detected
2. **Location:** File path and line number
3. **Commit:** When it was committed
4. **Recommendation:** How to remediate
5. **Severity:** Impact assessment

## Handling Exposed Secrets

### Immediate Actions

**If secret is detected:**

**1. Rotate the secret immediately:**
```bash
# Example: Rotate AWS key
aws iam create-access-key --user-name spms-backend
aws iam delete-access-key --access-key-id OLD_KEY --user-name spms-backend
```

**2. Update application configuration:**
```bash
# Update environment variable
kubectl set env deployment/spms-backend AWS_ACCESS_KEY_ID=NEW_KEY
```

**3. Verify rotation:**
- Test application with new secret
- Verify old secret no longer works
- Check logs for errors

**4. Remove secret from Git history:**
```bash
# Use BFG Repo-Cleaner or git-filter-repo
# WARNING: This rewrites history
git filter-repo --path config/secrets.py --invert-paths
```

**5. Document incident:**
- What secret was exposed
- When it was exposed
- How long it was exposed
- What actions were taken
- Lessons learned

### Secret Rotation Procedures

**Database passwords:**
1. Create new password in Azure Database
2. Update secret via Rancher GUI (see `secrets-management.md`)
3. Restart application pods
4. Verify connectivity
5. Remove old password

**API keys:**
1. Generate new key in service portal
2. Update secret via Rancher GUI (see `secrets-management.md`)
3. Restart application pods
4. Test API connectivity
5. Revoke old key

**Azure connection strings:**
1. Rotate keys in Azure Portal
2. Update secret via Rancher GUI (see `secrets-management.md`)
3. Restart application pods
4. Verify functionality
5. Document rotation

## Prevention Strategies

### 1. Use Environment Variables

**Never commit secrets:**
```python
# ❌ BAD: Hardcoded secret
SECRET_KEY = 'django-insecure-hardcoded-key'
DATABASE_URL = 'postgresql://user:password@localhost/db'

# ✅ GOOD: Environment variables
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_URL = os.environ.get('DATABASE_URL')
```

### 2. Use .gitignore

**Ignore sensitive files:**
```
# .gitignore
.env
.env.local
secrets.py
*.key
*.pem
credentials.json
```

### 3. Use Rancher for Secrets Management

**Manage secrets via Rancher:**
- See `secrets-management.md` for complete guide
- Infrastructure team manages Azure Key Vault backend
- Developers update secrets through Rancher GUI only
- Never interact with Azure Key Vault directly

### 4. Use Pre-commit Hooks

**Detect secrets before commit:**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### 5. Review Before Committing

**Always check:**
```bash
# Review changes before committing
git diff

# Check for secrets
git diff | grep -i "password\|secret\|key\|token"
```

## False Positives

### Common False Positives

**1. Example/test values:**
```python
# tests/fixtures.py
TEST_API_KEY = "test-key-12345"  # Not a real secret
```

**2. Public keys:**
```python
# Public SSH key (not secret)
PUBLIC_KEY = "ssh-rsa AAAAB3NzaC1yc2E..."
```

**3. Placeholder values:**
```python
# config/settings.example.py
SECRET_KEY = "your-secret-key-here"  # Placeholder
```

### Dismissing False Positives

**How to dismiss:**
1. Review the alert carefully
2. Verify it's not a real secret
3. Click "Dismiss alert"
4. Select reason: "False positive"
5. Add comment explaining why
6. Confirm dismissal

**Example comment:**
```
This is a test fixture value used only in unit tests.
Not a real API key. See tests/test_api.py for usage.
```

## Best Practices

### 1. Never Commit Secrets

**Use configuration management:**
- Environment variables
- Rancher secrets management (see `secrets-management.md`)
- Configuration files (gitignored)
- Infrastructure team manages Azure Key Vault backend

### 2. Rotate Secrets Regularly

**Rotation schedule:**
- Critical secrets: Every 90 days
- API keys: Every 180 days
- Database passwords: Every 365 days
- Emergency: Immediately if exposed

### 3. Use Strong Secrets

**Requirements:**
- Minimum 32 characters
- Random generation
- Mix of characters
- No dictionary words

**Generate strong secrets:**
```bash
# Generate random secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use Django
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Limit Secret Access

**Principle of least privilege:**
- Only necessary services have access
- Use service accounts
- Rotate when team members leave
- Audit access regularly

### 5. Monitor Secret Usage

**Track:**
- When secrets are accessed
- By which services
- Failed authentication attempts
- Unusual access patterns

## Incident Response

### If Secret is Exposed

**1. Assess impact (5 minutes):**
- What secret was exposed?
- How long was it exposed?
- Who had access?
- What can it access?

**2. Rotate immediately (15 minutes):**
- Generate new secret
- Update via Rancher GUI (see `secrets-management.md`)
- Restart application pods
- Verify functionality
- Revoke old secret

**3. Investigate (30 minutes):**
- Check access logs
- Look for unauthorized use
- Identify affected systems
- Document timeline

**4. Communicate (15 minutes):**
- Notify security team
- Inform management if critical
- Document incident
- Update procedures

**5. Prevent recurrence:**
- Add to .gitignore
- Update pre-commit hooks
- Train team
- Review processes

## Resources

- **GitGuardian Documentation:** https://docs.gitguardian.com/
- **GitHub Secret Scanning:** https://docs.github.com/en/code-security/secret-scanning
- **OWASP Secrets Management:** https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

## Related Documentation

- **Security Overview:** `README.md`
- **Secrets Management:** `secrets-management.md`
- **Code Scanning:** `code-scanning.md`
- **Security Review Process:** `security-review-process.md`
