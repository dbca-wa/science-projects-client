# Security Overview

> **Note**: Security practices documented here apply to both frontend and backend components. Frontend developers should review these security guidelines.

## Introduction

This directory contains security documentation for the Science Projects Management System backend. Security is managed through multiple layers: organisational tools, application-level controls, and operational procedures.

## Security Architecture

### Layers of Security

**1. Organisational Level (GitHub):**

- CodeQL code scanning
- Dependabot dependency scanning
- GitGuardian secrets detection
- Socket Security supply chain protection

**2. Application Level:**

- Django security middleware
- File upload validation
- Input sanitisation
- CSRF protection
- Session security

**3. Infrastructure Level:**

- Azure Kubernetes Service
- Secrets managed via Rancher (backend: Azure Key Vault managed by infrastructure team)
- Network policies
- TLS/SSL encryption

**4. Operational Level:**

- Security review process
- Incident response
- Vulnerability management
- Access control

## GitHub Security Tools

All GitHub security tools are configured at the **organisation level** by DBCA IT. The maintainer's role is to:

- Monitor security findings
- Triage and remediate issues
- Review security alerts
- Follow security review process

### Tools Overview

| Tool            | Purpose                           | Configuration | Maintainer Action           |
| --------------- | --------------------------------- | ------------- | --------------------------- |
| CodeQL          | Code vulnerability scanning       | Organisation  | Review findings, fix issues |
| Dependabot      | Dependency vulnerability scanning | Organisation  | Review PRs, merge updates   |
| GitGuardian     | Secrets detection                 | Organisation  | Rotate exposed secrets      |
| Socket Security | Supply chain security             | Organisation  | Review package safety       |

### Documentation

- **Code Scanning:** `code-scanning.md` - CodeQL configuration and findings
- **Dependency Scanning:** `dependency-scanning.md` - Dependabot alerts and updates
- **Secrets Detection:** `secrets-detection.md` - GitGuardian alerts and rotation
- **Secrets Management:** `secrets-management.md` - Managing secrets in Rancher
- **Supply Chain:** `supply-chain-security.md` - Socket Security package vetting
- **Review Process:** `security-review-process.md` - PR security checklist

## Security Baseline

### Zero Tolerance

**Critical and High severity issues:**

- Must be fixed before deployment
- Block merging to main branch
- Require immediate attention

**Medium severity issues:**

- Fix within 30 days
- Document if accepted as risk
- Review in security meetings

**Low severity issues:**

- Fix in next sprint
- May be accepted as risk
- Document decision

### Current Status

**Target state:**

- Zero critical vulnerabilities
- Zero high vulnerabilities
- Zero exposed secrets
- Zero malicious packages
- All security tools passing

## Security Review Process

### Pull Request Checklist

Before merging any PR:

- [ ] CodeQL scan passed (no new high/critical issues)
- [ ] Dependabot checks passed (no vulnerable dependencies)
- [ ] GitGuardian scan passed (no secrets detected)
- [ ] Socket Security passed (no malicious packages)
- [ ] Manual code review for security implications
- [ ] Input validation reviewed
- [ ] Authentication/authorisation checked
- [ ] SQL queries reviewed for injection risks
- [ ] File uploads validated properly
- [ ] Error messages don't leak sensitive info

See `security-review-process.md` for detailed checklist.

## Common Security Issues

### Input Validation

**Always validate user input:**

```python
# ✅ GOOD: Use serializers for validation
serializer = ProjectSerializer(data=request.data)
if not serializer.is_valid():
    return Response(serializer.errors, status=400)

# ❌ BAD: Direct use of user input
Project.objects.create(**request.data)
```

### SQL Injection Prevention

**Use Django ORM, never raw SQL with user input:**

```python
# ✅ GOOD: Parameterised query
Project.objects.filter(title__icontains=search_term)

# ❌ BAD: String interpolation
Project.objects.raw(f"SELECT * FROM projects WHERE title LIKE '%{search_term}%'")
```

### File Upload Security

**Validate file content, not just extension:**

```python
# ✅ GOOD: Content validation
from common.utils.file_validation import validate_image_upload
validate_image_upload(file_path, filename, max_size)

# ❌ BAD: Extension only
if filename.endswith('.jpg'):
    save_file(file)
```

### Secrets Management

**Never commit secrets:**

```python
# ✅ GOOD: Environment variables
SECRET_KEY = env('SECRET_KEY')
DATABASE_URL = env('DATABASE_URL')

# ❌ BAD: Hardcoded secrets
SECRET_KEY = 'django-insecure-hardcoded-key'
DATABASE_URL = 'postgresql://user:password@localhost/db'
```

## Incident Response

### Security Incident Process

**1. Detection:**

- Security tool alert
- User report
- Monitoring alert
- Code review finding

**2. Assessment:**

- Severity: Critical/High/Medium/Low
- Impact: Data exposure, service disruption, etc.
- Scope: Affected systems and users

**3. Containment:**

- Disable affected functionality if needed
- Rotate compromised credentials
- Block malicious traffic
- Isolate affected systems

**4. Remediation:**

- Fix vulnerability
- Deploy patch
- Verify fix
- Update documentation

**5. Communication:**

- Notify affected users
- Report to management
- Document incident
- Update security procedures

**6. Post-Incident:**

- Lessons learned
- Update procedures
- Improve detection
- Train team

### Severity Definitions

**Critical:**

- Remote code execution
- Authentication bypass
- Data breach
- System compromise

**High:**

- SQL injection
- XSS vulnerabilities
- Privilege escalation
- Sensitive data exposure

**Medium:**

- CSRF vulnerabilities
- Information disclosure
- Weak encryption
- Missing security headers

**Low:**

- Security misconfigurations
- Outdated dependencies (no known exploits)
- Minor information leaks
- Best practice violations

## Compliance and Standards

### OWASP Top 10

The application addresses OWASP Top 10 vulnerabilities:

1. **Broken Access Control:** Role-based permissions, object-level checks
2. **Cryptographic Failures:** TLS encryption, secure session management
3. **Injection:** Parameterised queries, input validation
4. **Insecure Design:** Security by design, threat modelling
5. **Security Misconfiguration:** Secure defaults, hardened settings
6. **Vulnerable Components:** Dependabot scanning, regular updates
7. **Authentication Failures:** Session-based auth, password policies
8. **Software and Data Integrity:** Code signing, integrity checks
9. **Logging Failures:** Comprehensive logging, monitoring
10. **Server-Side Request Forgery:** Input validation, URL allowlists

### Security Headers

**Implemented in production:**

```python
# settings.py (production)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

**Handled by Nginx (Edge proxy):**

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`

## Security Testing

### Automated Testing

**GitHub Actions:**

- CodeQL scans on every PR
- Dependency checks on every PR
- Secret scanning on every commit
- Supply chain checks on dependency changes

**Pre-commit Hooks:**

```bash
# .pre-commit-config.yaml
- repo: https://github.com/PyCQA/bandit
  hooks:
    - id: bandit
      args: ['-c', 'pyproject.toml']
```

### Manual Testing

**Security review checklist:**

- Input validation testing
- Authentication testing
- Authorisation testing
- Session management testing
- File upload testing
- Error handling testing

**Penetration testing:**

- Conducted by DBCA IT annually
- Scope: Full application
- Report: Findings and remediation
- Follow-up: Verify fixes

## Security Contacts

### Internal Contacts

**Maintainer:**

- Primary contact for security issues
- Triages security findings
- Implements fixes
- Coordinates with IT

**DBCA IT Security:**

- Organisational security policies
- Security tool configuration
- Incident response support
- Penetration testing

### External Contacts

**GitHub Security:**

- Security advisories
- Vulnerability reports
- Tool support

**Dependabot:**

- Automated dependency updates
- Vulnerability database

## Security Resources

### Documentation

- **Code Scanning:** `code-scanning.md`
- **Dependency Scanning:** `dependency-scanning.md`
- **Secrets Detection:** `secrets-detection.md`
- **Secrets Management:** `secrets-management.md`
- **Supply Chain Security:** `supply-chain-security.md`
- **Security Review Process:** `security-review-process.md`

### External Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Django Security:** https://docs.djangoproject.com/en/stable/topics/security/
- **GitHub Security:** https://docs.github.com/en/code-security
- **Python Security:** https://python.readthedocs.io/en/stable/library/security_warnings.html

### Training

**Recommended training:**

- OWASP Top 10 awareness
- Secure coding practices
- Django security features
- Incident response procedures

## Security Roadmap

### Current State

- ✅ GitHub security tools configured
- ✅ File upload validation implemented
- ✅ Input validation via serializers
- ✅ CSRF protection enabled
- ✅ Secure session management
- ✅ TLS encryption in production
- ✅ Monthly security training

### Future Enhancements

**Short term (3 months):**

- Implement rate limiting on sensitive endpoints
- Add security headers testing
- Enhance logging for security events
- Document security architecture

**Medium term (6 months):**

- Add security metrics dashboard
- Review and update security policies

## Related Documentation

- **File Upload Validation:** `../../backend/architecture/ADR-010-file-upload-validation.md`
- **Error Tracking:** `../operations/error-tracking.md`
- **Monitoring Setup:** `../operations/monitoring.md`
- **API Design:** `../../backend/architecture/api-design.md`
