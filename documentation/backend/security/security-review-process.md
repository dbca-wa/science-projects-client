# Security Review Process

## Overview

This document outlines the security review process for the Science Projects Management System. Every code change must pass security checks before merging to ensure the application maintains a strong security posture.

## Pull Request Security Checklist

### Automated Checks

Before merging any PR, verify all automated security checks pass:

**GitHub Security Tools:**
- [ ] **CodeQL scan passed** - No new high/critical code vulnerabilities
- [ ] **Dependabot checks passed** - No vulnerable dependencies introduced
- [ ] **GitGuardian scan passed** - No secrets detected in code
- [ ] **Socket Security passed** - No malicious packages added

**CI/CD Pipeline:**
- [ ] **All tests passed** - Unit and integration tests green
- [ ] **Linting passed** - Code quality checks passed
- [ ] **Type checking passed** - No type errors

### Manual Security Review

**Code Review:**
- [ ] **Input validation reviewed** - All user input validated via serializers
- [ ] **Authentication checked** - Endpoints require proper authentication
- [ ] **Authorisation verified** - Permission classes correctly applied
- [ ] **SQL queries reviewed** - No raw SQL with user input, use ORM
- [ ] **File uploads validated** - Content validation, not just extension
- [ ] **Error messages reviewed** - No sensitive information leaked
- [ ] **Logging reviewed** - No sensitive data logged
- [ ] **Dependencies justified** - New dependencies necessary and vetted

**Security Implications:**
- [ ] **Data exposure risk** - No unintended data access
- [ ] **Privilege escalation** - No unauthorised permission elevation
- [ ] **Injection vulnerabilities** - No SQL, command, or template injection
- [ ] **XSS vulnerabilities** - User input properly escaped
- [ ] **CSRF protection** - State-changing operations protected
- [ ] **Session security** - Session handling secure

### High-Risk Changes

**Extra scrutiny required for:**
- Authentication/authorisation changes
- File upload functionality
- Database query modifications
- Permission system changes
- API endpoint additions
- Serializer modifications
- Settings changes
- Dependency updates

## Viewing Security Findings

### GitHub Security Tab

**Access security findings:**
1. Navigate to repository on GitHub
2. Click **Security** tab in top navigation
3. View security overview dashboard

**Security Overview Dashboard:**
- **Code scanning alerts** - CodeQL findings
- **Dependabot alerts** - Vulnerable dependencies
- **Secret scanning alerts** - Exposed secrets
- **Supply chain** - Package security status

### Code Scanning Alerts

**View CodeQL findings:**
1. Security tab → **Code scanning**
2. Filter by severity: Critical, High, Medium, Low
3. Filter by status: Open, Fixed, Dismissed
4. Click alert to view details

**Alert details include:**
- Vulnerability description
- Affected code location
- Severity and confidence
- Remediation guidance
- Related CWE/CVE references

**Example CodeQL alert:**
```
SQL injection vulnerability
Severity: High
Location: projects/views.py:45
Description: User input used in SQL query without sanitisation
Recommendation: Use Django ORM instead of raw SQL
```

### Dependabot Alerts

**View dependency vulnerabilities:**
1. Security tab → **Dependabot alerts**
2. Filter by severity and status
3. Click alert to view details

**Alert details include:**
- Vulnerable package and version
- Vulnerability description
- Severity score (CVSS)
- Patched version available
- Automated PR if available

**Example Dependabot alert:**
```
Pillow vulnerable to arbitrary code execution
Package: Pillow
Current version: 9.0.0
Patched version: 9.0.1
Severity: Critical (CVSS 9.8)
Action: Merge Dependabot PR #123
```

### Secret Scanning Alerts

**View exposed secrets:**
1. Security tab → **Secret scanning**
2. Review detected secrets
3. Click alert to view details

**Alert details include:**
- Secret type (API key, token, password)
- Location in code
- Commit where introduced
- Remediation steps

**Example secret alert:**
```
AWS Access Key detected
Location: config/settings.py:12
Commit: abc123
Action: Rotate key immediately, remove from code
```

### Supply Chain Security

**View package security:**
1. Security tab → **Supply chain**
2. Review dependency graph
3. Check for known vulnerabilities
4. Review Socket Security findings

**Socket Security findings:**
- Malicious packages detected
- Suspicious package behaviour
- Supply chain risk score
- Recommended actions

## Security Triage Process

### Severity Levels

**Critical (Fix immediately):**
- Remote code execution
- Authentication bypass
- Data breach potential
- System compromise
- Exposed secrets

**High (Fix within 24 hours):**
- SQL injection
- XSS vulnerabilities
- Privilege escalation
- Sensitive data exposure
- Vulnerable dependencies (CVSS 7.0+)

**Medium (Fix within 30 days):**
- CSRF vulnerabilities
- Information disclosure
- Weak encryption
- Missing security headers
- Vulnerable dependencies (CVSS 4.0-6.9)

**Low (Fix in next sprint):**
- Security misconfigurations
- Outdated dependencies (no known exploits)
- Minor information leaks
- Best practice violations

### Triage Workflow

**1. Initial Assessment:**
```
New security alert received
↓
Determine severity (Critical/High/Medium/Low)
↓
Assess impact (data exposure, service disruption, etc.)
↓
Determine scope (affected systems, users)
```

**2. Prioritisation:**
```
Critical → Immediate action, stop other work
High → Fix within 24 hours
Medium → Schedule in current sprint
Low → Add to backlog
```

**3. Assignment:**
- Critical/High: Maintainer handles immediately
- Medium: Schedule in sprint planning
- Low: Add to backlog for future sprint

**4. Remediation:**
- Create fix branch
- Implement fix
- Write/update tests
- Document changes
- Submit PR with security label

**5. Verification:**
- Verify fix resolves issue
- Run security scans
- Test in staging environment
- Deploy to production
- Mark alert as resolved

**6. Documentation:**
- Document fix in PR
- Update security documentation
- Add to incident log if applicable
- Share lessons learned

### Triage Decision Matrix

| Severity | Exploitability | Impact | Action |
|----------|---------------|--------|--------|
| Critical | High | High | Fix immediately |
| Critical | Low | High | Fix within 24h |
| High | High | Medium | Fix within 24h |
| High | Low | Medium | Fix within 7 days |
| Medium | High | Low | Fix within 30 days |
| Medium | Low | Low | Fix in next sprint |
| Low | Any | Any | Add to backlog |

## Handling False Positives

### Identifying False Positives

**Common false positive scenarios:**
- CodeQL flags safe code pattern
- Dependabot alerts for dev-only dependencies
- Secret scanner detects test data
- Socket Security flags legitimate package

**Verification steps:**
1. Review alert details carefully
2. Understand the vulnerability
3. Verify code context
4. Check if mitigation exists
5. Consult security resources
6. Seek second opinion if unsure

### Dismissing False Positives

**When to dismiss:**
- Vulnerability doesn't apply to usage
- Code has compensating controls
- Risk is accepted and documented
- Test data, not real secrets
- Dev dependency, not production

**How to dismiss:**
1. Navigate to alert in GitHub Security tab
2. Click **Dismiss alert**
3. Select reason:
   - Won't fix (risk accepted)
   - False positive
   - Used in tests
4. Add comment explaining decision
5. Document in security log

**Example dismissal comment:**
```
Dismissing as false positive.

Reason: CodeQL flagged SQL injection in admin-only endpoint.
Mitigation: Endpoint requires superuser permission, input validated
via serializer, and uses parameterised query.
Risk: Accepted - admin users trusted, multiple layers of protection.
Reviewed by: [Maintainer name]
Date: 2026-02-07
```

### Documentation Requirements

**All dismissals must document:**
- Reason for dismissal
- Risk assessment
- Compensating controls (if any)
- Reviewer name and date
- Link to related discussion/ticket

**Review dismissed alerts:**
- Quarterly review of all dismissed alerts
- Verify dismissal still valid
- Re-assess if code changed
- Update documentation if needed

## Security Baseline

### Zero Tolerance Policy

**Must maintain zero:**
- Critical vulnerabilities
- High vulnerabilities
- Exposed secrets
- Malicious packages

**Enforcement:**
- Block PR merge if critical/high issues
- Require security review for medium issues
- Document all accepted risks
- Regular security audits

### Baseline Metrics

**Current baseline (target state):**
```
Critical vulnerabilities: 0
High vulnerabilities: 0
Medium vulnerabilities: < 5
Low vulnerabilities: < 20
Exposed secrets: 0
Malicious packages: 0
Security tool failures: 0
```

**Monitoring:**
- Daily check of security dashboard
- Weekly security metrics review
- Monthly security report
- Quarterly security audit

### Baseline Violations

**If baseline violated:**
1. **Immediate assessment** - Determine severity and impact
2. **Containment** - Disable affected functionality if needed
3. **Remediation** - Fix vulnerability immediately
4. **Verification** - Confirm fix resolves issue
5. **Documentation** - Record incident and lessons learned
6. **Prevention** - Update processes to prevent recurrence

**Escalation:**
- Critical: Notify management immediately
- High: Notify management within 24 hours
- Medium: Include in weekly report
- Low: Include in monthly report

## Security Review Examples

### Example 1: File Upload Feature

**PR Description:** Add project document upload

**Security Checklist:**
- [x] CodeQL scan passed
- [x] Dependabot checks passed
- [x] GitGuardian scan passed
- [x] Socket Security passed
- [x] File content validation implemented
- [x] File size limits enforced
- [x] Allowed file types restricted
- [x] Filename sanitisation applied
- [x] Storage path validation
- [x] Permission checks on upload
- [x] Permission checks on download
- [x] Tests include malicious file attempts

**Review Notes:**
- Uses `validate_document_upload()` for content validation
- Restricts to PDF files only
- 10MB size limit enforced
- Requires project member permission
- Stores in user-specific directory
- Tests cover extension mismatch, oversized files

**Decision:** Approved ✅

### Example 2: API Endpoint Addition

**PR Description:** Add user search endpoint

**Security Checklist:**
- [x] CodeQL scan passed
- [x] Dependabot checks passed
- [x] GitGuardian scan passed
- [x] Socket Security passed
- [x] Authentication required (`IsAuthenticated`)
- [x] Input validation via serializer
- [x] Query uses ORM (no raw SQL)
- [x] Pagination implemented
- [x] Rate limiting considered
- [x] No sensitive data in response
- [x] Tests include unauthorised access

**Review Notes:**
- Requires authentication
- Uses `UserSearchSerializer` for validation
- Limits results to 50 per page
- Excludes sensitive fields (password hash)
- Returns only public user data
- Tests verify permission checks

**Decision:** Approved ✅

### Example 3: Dependency Update

**PR Description:** Update Django to 4.2.10

**Security Checklist:**
- [x] Dependabot PR
- [x] Fixes CVE-2024-XXXX (SQL injection)
- [x] Severity: High
- [x] All tests passed
- [x] No breaking changes
- [x] Changelog reviewed
- [x] Staging deployment successful

**Review Notes:**
- Fixes high-severity SQL injection vulnerability
- No breaking changes in patch version
- All tests pass
- Deployed to staging, no issues
- Recommended by Dependabot

**Decision:** Approved and merged immediately ✅

### Example 4: False Positive Dismissal

**Alert:** CodeQL - Potential SQL injection in reports view

**Investigation:**
- Endpoint: `/api/v1/reports/generate`
- Code: `Project.objects.filter(status=request.GET.get('status'))`
- Concern: User input in query

**Analysis:**
- Input validated via `ReportFilterSerializer`
- Status field limited to enum choices
- Django ORM parameterises query
- Endpoint requires admin permission
- Multiple layers of protection

**Decision:** Dismiss as false positive
- Reason: Compensating controls present
- Risk: Low (admin-only, validated input, parameterised)
- Documentation: Added to security log
- Review: Quarterly re-assessment

## Security Incident Response

### Incident Classification

**Security incident types:**
- Vulnerability exploitation
- Data breach
- Unauthorised access
- Malicious code deployment
- Secrets exposure
- Service disruption

### Response Procedure

**1. Detection and Reporting:**
- Security tool alert
- User report
- Monitoring alert
- Code review finding

**2. Initial Response (within 1 hour):**
- Assess severity and impact
- Contain the incident
- Notify stakeholders
- Begin investigation

**3. Investigation (within 4 hours):**
- Determine root cause
- Identify affected systems
- Assess data exposure
- Document timeline

**4. Containment (within 8 hours):**
- Disable affected functionality
- Rotate compromised credentials
- Block malicious traffic
- Isolate affected systems

**5. Remediation (within 24 hours):**
- Develop fix
- Test fix thoroughly
- Deploy to production
- Verify resolution

**6. Recovery (within 48 hours):**
- Restore normal operations
- Verify system integrity
- Monitor for recurrence
- Update documentation

**7. Post-Incident (within 1 week):**
- Conduct lessons learned
- Update security procedures
- Improve detection
- Train team
- Document incident

### Communication Plan

**Internal communication:**
- Maintainer → Management (immediate)
- Management → IT Security (within 1 hour)
- IT Security → Organisation (as needed)

**External communication:**
- Affected users (if data breach)
- Regulatory bodies (if required)
- Public disclosure (if appropriate)

**Communication template:**
```
Subject: Security Incident - [Brief Description]

Severity: [Critical/High/Medium/Low]
Status: [Detected/Contained/Resolved]
Impact: [Description of impact]
Affected: [Systems/users affected]
Timeline: [When detected, when contained]
Actions: [Steps taken]
Next steps: [Planned actions]
Contact: [Maintainer contact]
```

## Security Training

### Required Knowledge

**All developers must understand:**
- OWASP Top 10 vulnerabilities
- Secure coding practices
- Django security features
- Input validation techniques
- Authentication/authorisation
- Cryptography basics
- Incident response procedures

### Training Resources

**Internal:**
- Security documentation (this directory)
- Code review guidelines
- Security incident playbooks
- Lessons learned sessions

**External:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Django Security: https://docs.djangoproject.com/en/stable/topics/security/
- GitHub Security: https://docs.github.com/en/code-security
- Python Security: https://python.readthedocs.io/en/stable/library/security_warnings.html

### Security Champions

**Maintainer responsibilities:**
- Stay current on security threats
- Review security alerts daily
- Conduct security code reviews
- Mentor team on security
- Maintain security documentation
- Coordinate with IT Security

## Related Documentation

- **Code Scanning:** `code-scanning.md` - CodeQL configuration
- **Dependency Scanning:** `dependency-scanning.md` - Dependabot alerts
- **Secrets Detection:** `secrets-detection.md` - GitGuardian configuration
- **Supply Chain Security:** `supply-chain-security.md` - Socket Security
- **File Upload Validation:** `../architecture/ADR-010-file-upload-validation.md`
- **Error Tracking:** `../operations/error-tracking.md`
- **API Design:** `../architecture/api-design.md`
