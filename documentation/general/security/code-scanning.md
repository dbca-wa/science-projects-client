# Code Scanning with CodeQL

**Applies to**: Both (Frontend and Backend)

## Overview

CodeQL is GitHub's semantic code analysis engine that finds security vulnerabilities and coding errors. It's configured at the **organisation level** by DBCA IT and runs automatically on all repositories.

## What is CodeQL?

**CodeQL treats code as data:**

- Converts code to a queryable database
- Runs security queries against the database
- Identifies patterns that indicate vulnerabilities
- Reports findings in GitHub Security tab

**Languages supported:**

- Python (our primary language)
- JavaScript/TypeScript
- Java, C/C++, C#, Go, Ruby

## Configuration

### Organisation-Level Setup

**Configured by:** DBCA IT  
**Location:** GitHub organisation settings  
**Scope:** All repositories in dbca-wa organisation

**What's configured:**

- CodeQL workflow
- Query suites (security-extended)
- Scan frequency (on push, PR, schedule)
- Alert notifications
- Security policies

## What CodeQL Checks

### Security Vulnerabilities

**SQL Injection:**

```python
# ❌ DETECTED: SQL injection vulnerability
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)

# ✅ SAFE: Parameterised query
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, [username])
```

**Command Injection:**

```python
# ❌ DETECTED: Command injection
os.system(f"ls {user_input}")

# ✅ SAFE: Use subprocess with list
subprocess.run(["ls", user_input])
```

**Path Traversal:**

```python
# ❌ DETECTED: Path traversal
file_path = f"/uploads/{user_filename}"
open(file_path, 'r')

# ✅ SAFE: Validate and sanitise
from pathlib import Path
safe_path = Path("/uploads") / Path(user_filename).name
```

**Insecure Deserialisation:**

```python
# ❌ DETECTED: Unsafe pickle
import pickle
data = pickle.loads(user_input)

# ✅ SAFE: Use JSON
import json
data = json.loads(user_input)
```

**Hardcoded Credentials:**

```python
# ❌ DETECTED: Hardcoded secret
SECRET_KEY = 'django-insecure-hardcoded-key'

# ✅ SAFE: Environment variable
SECRET_KEY = os.environ.get('SECRET_KEY')
```

**Weak Cryptography:**

```python
# ❌ DETECTED: Weak hash algorithm
import md5
hash = md5.new(password).hexdigest()

# ✅ SAFE: Strong hash algorithm
from django.contrib.auth.hashers import make_password
hash = make_password(password)
```

### Code Quality Issues

**Unused imports:**

```python
# ❌ DETECTED: Unused import
import os
import sys  # Never used
```

**Unreachable code:**

```python
# ❌ DETECTED: Unreachable code
def example():
    return True
    print("Never executed")  # Unreachable
```

**Type errors:**

```python
# ❌ DETECTED: Type mismatch
def add_numbers(a: int, b: int) -> int:
    return str(a + b)  # Returns string, not int
```

## Viewing CodeQL Findings

### GitHub Security Tab

**Location:** Repository → Security → Code scanning alerts

**Information shown:**

- Alert severity (Critical/High/Medium/Low)
- Alert description
- Affected file and line number
- Recommendation for fix
- CWE (Common Weakness Enumeration) ID
- CVSS score (if applicable)

### Alert Details

**Each alert includes:**

1. **Description:** What the vulnerability is
2. **Location:** File, line number, code snippet
3. **Recommendation:** How to fix it
4. **Severity:** Impact assessment
5. **Status:** Open, Fixed, Dismissed
6. **History:** When detected, by whom

### Filtering Alerts

**Filter by:**

- Severity (Critical, High, Medium, Low)
- Status (Open, Fixed, Dismissed)
- Branch (main, develop, feature branches)
- Rule (specific CodeQL query)

## Triaging CodeQL Findings

### Severity Assessment

**Critical (Fix immediately):**

- Remote code execution
- Authentication bypass
- SQL injection
- Command injection

**High (Fix within 7 days):**

- XSS vulnerabilities
- Path traversal
- Insecure deserialisation
- Hardcoded secrets

**Medium (Fix within 30 days):**

- Information disclosure
- Weak cryptography
- Missing input validation
- CSRF vulnerabilities

**Low (Fix in next sprint):**

- Code quality issues
- Best practice violations
- Minor security misconfigurations
- Unused code

### Triage Process

**1. Review the alert:**

- Read description carefully
- Understand the vulnerability
- Check affected code
- Assess actual risk

**2. Verify the finding:**

- Is it a true positive?
- Is it exploitable?
- What's the impact?
- Is it already mitigated?

**3. Determine action:**

- Fix immediately
- Schedule for fix
- Dismiss as false positive
- Accept as risk (document why)

**4. Document decision:**

- Add comment to alert
- Link to issue/PR if fixing
- Explain if dismissing
- Note mitigation if accepting

### Dismissing Alerts

**Valid reasons to dismiss:**

- False positive (not actually vulnerable)
- Used in test code only
- Already mitigated by other controls
- Not applicable to our use case

**How to dismiss:**

1. Click "Dismiss alert"
2. Select reason:
    - False positive
    - Won't fix
    - Used in tests
3. Add comment explaining why
4. Confirm dismissal

**Example dismissal comment:**

```
This alert is a false positive. The user input is validated
by Django's form validation before reaching this code path.
See UserForm.clean_username() for validation logic.
```

## Fixing CodeQL Findings

### Fix Workflow

**1. Create issue:**

```
Title: [Security] Fix SQL injection in user search
Labels: security, high-priority
Description: CodeQL detected SQL injection vulnerability in
users/views.py line 45. Need to use parameterised query.
```

**2. Create branch:**

```bash
git checkout -b fix/sql-injection-user-search
```

**3. Fix the vulnerability:**

```python
# Before (vulnerable)
query = f"SELECT * FROM users WHERE username LIKE '%{search}%'"

# After (fixed)
from django.db.models import Q
users = User.objects.filter(Q(username__icontains=search))
```

**4. Test the fix:**

- Verify functionality still works
- Test with malicious input
- Run security tests
- Check CodeQL re-scan

**5. Create pull request:**

```
Title: Fix SQL injection in user search
Description: Fixes SQL injection vulnerability detected by CodeQL.
Replaced raw SQL with Django ORM query.

Closes #123
```

**6. Verify fix:**

- CodeQL re-scans on PR
- Alert should be marked as fixed
- Review security checklist
- Merge when approved

### Common Fixes

**SQL Injection → Use ORM:**

```python
# Before
cursor.execute(f"SELECT * FROM projects WHERE id = {project_id}")

# After
project = Project.objects.get(pk=project_id)
```

**Command Injection → Use subprocess:**

```python
# Before
os.system(f"convert {input_file} output.pdf")

# After
subprocess.run(["convert", input_file, "output.pdf"], check=True)
```

**Path Traversal → Validate paths:**

```python
# Before
file_path = os.path.join(UPLOAD_DIR, user_filename)

# After
from pathlib import Path
safe_filename = Path(user_filename).name  # Remove directory components
file_path = Path(UPLOAD_DIR) / safe_filename
```

**Hardcoded Secrets → Use environment:**

```python
# Before
API_KEY = "sk-1234567890abcdef"

# After
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise ImproperlyConfigured("API_KEY environment variable not set")
```

## False Positives

### Common False Positives

**1. Input already validated:**

```python
# CodeQL may flag this, but input is validated by serializer
serializer = UserSerializer(data=request.data)
if serializer.is_valid():
    # This is safe - serializer validated the data
    User.objects.create(**serializer.validated_data)
```

**2. Test code:**

```python
# CodeQL may flag test fixtures with hardcoded values
# tests/fixtures.py
TEST_PASSWORD = "test-password-123"  # OK in tests
```

**3. Constants:**

```python
# CodeQL may flag constants that look like secrets
DEFAULT_AVATAR_URL = "/static/images/default-avatar.png"  # Not a secret
```

### Handling False Positives

**Document why it's safe:**

```python
# CodeQL: Potential SQL injection
# Safe because: user_id is validated as integer by URL pattern
# URL pattern: path("<int:pk>", ...) ensures pk is integer
query = f"SELECT * FROM users WHERE id = {user_id}"
```

**Or refactor to avoid the pattern:**

```python
# Better: Use ORM to avoid false positive
user = User.objects.get(pk=user_id)
```

## Integration with CI/CD

### Pull Request Checks

**CodeQL runs on every PR:**

1. Code is pushed to PR branch
2. CodeQL workflow triggers
3. Code is analysed
4. Results posted to PR
5. PR blocked if critical/high issues found

**PR status checks:**

- ✅ CodeQL: No new vulnerabilities
- ❌ CodeQL: New vulnerabilities detected

### Branch Protection

**Main branch protection:**

- Require CodeQL check to pass
- Require review from maintainer
- Require all conversations resolved
- No force push allowed

### Automated Fixes

**Dependabot can auto-fix some issues:**

- Outdated dependencies
- Known vulnerable packages
- Security patches

**CodeQL cannot auto-fix:**

- Code vulnerabilities require manual fix
- Each fix needs review and testing

## Best Practices

### 1. Review Alerts Regularly

**Weekly review:**

- Check new alerts
- Triage by severity
- Create issues for fixes
- Update alert status

### 2. Fix High-Severity Issues First

**Priority order:**

1. Critical: Fix immediately
2. High: Fix within 7 days
3. Medium: Fix within 30 days
4. Low: Fix in next sprint

### 3. Don't Dismiss Without Investigation

**Always:**

- Understand the alert
- Verify it's false positive
- Document why dismissing
- Get second opinion if unsure

### 4. Learn from Findings

**Use alerts to improve:**

- Identify common patterns
- Update coding guidelines
- Add pre-commit checks
- Train team on secure coding

### 5. Keep CodeQL Updated

**Organisation manages updates:**

- CodeQL engine updates
- Query suite updates
- New vulnerability patterns
- Improved detection

## Metrics and Reporting

**Target metrics:**

- Zero critical/high alerts
- < 5 medium alerts
- < 10 low alerts
- < 7 days mean time to fix

## Resources

- **CodeQL Documentation:** https://codeql.github.com/docs/
- **CodeQL Queries:** https://github.com/github/codeql
- **GitHub Code Scanning:** https://docs.github.com/en/code-security/code-scanning
- **CWE Database:** https://cwe.mitre.org/

## Related Documentation

- **Security Overview:** `README.md`
- **Dependency Scanning:** `dependency-scanning.md`
- **Security Review Process:** `security-review-process.md`
