# Disaster Recovery Procedures

## Overview

OIM Infrastructure team manages all backup and recovery operations. The maintainer requests recovery and verifies results.

## Backup Infrastructure

### Managed by OIM Infrastructure

**Database (PostgreSQL):**
- Daily automated backups, 14-day retention
- Azure geo-redundant storage

**Media Files (Azure Blob Storage):**
- Geo-redundant storage with versioning
- Indefinite retention

**Configuration (Git):**
- GitHub repository with full history
- Maintainer managed

**Not Backed Up (Ephemeral Data):**
- Redis cache (rebuilt on demand)
- Session data (users re-authenticate)
- Temporary files (regenerated as needed)
- Log files (retained in Azure Application Insights)

## Recovery Scenarios

### Database Corruption or Data Loss

**Symptoms:** Missing/corrupted data, integrity errors, application errors

**Process:**
1. **Assess:** Identify affected data, when it occurred, scope of impact
2. **Determine recovery point:** Last known good state (within 14-day window), target timestamp
3. **Submit ticket:** https://dbca.freshservice.com/support/home → Report an Issue
   - Application: Science Projects Management System
   - Environment: Production/Staging/Development
   - Recovery timestamp: YYYY-MM-DD HH:MM:SS (AWST)
   - Affected data: Specific tables or entire database
   - Reason and impact
4. **OIM recovery:** 2-4 hours, may require downtime
5. **Verify:** Test connectivity, data integrity, functionality, user access
6. **Post-recovery:** Notify users, document recovery, update incident log

### Media File Loss or Corruption

**Symptoms:** Missing images/documents, corrupted downloads, 404 errors, broken links

**Process:**
1. **Assess:** Identify affected files, check Azure Blob Storage, verify accessibility
2. **Submit ticket:** https://dbca.freshservice.com/support/home → Report an Issue
   - Application: Science Projects Management System
   - Environment and storage details
   - Affected files (list or pattern)
   - Recovery timestamp
   - Reason and impact
3. **OIM recovery:** 1-2 hours
4. **Verify:** Test accessibility, integrity, display, downloads, permissions
5. **Post-recovery:** Update references, clear CDN cache, notify users

### Complete Application Failure

**Symptoms:** Application unavailable, database connection failures, multiple components down

**Process:**
1. **Assess:** Check Rancher, AKS, database, storage, Application Insights
2. **Escalate immediately:** https://dbca.freshservice.com/support/home → Report an Issue (Critical priority)
   - Application and environment
   - Symptoms, time of failure, error messages
   - Impact (all users affected)
3. **OIM investigates:** Infrastructure health, Azure status, restore/restart services
4. **Maintainer assists:** Provide logs, describe recent changes, test functionality
5. **Post-recovery:** Full verification, performance testing, user communication, incident report

### Configuration Loss

**Symptoms:** Misconfiguration, missing environment variables, inaccessible secrets, deployment failures

**Process:**
1. **Check Git:** Review commits, identify correct configuration state
2. **Restore from Git:**
   ```bash
   git clone https://github.com/dbca-wa/science-projects-service.git
   git checkout <commit-hash>  # If specific version needed
   ```
3. **Verify secrets:** Check Kubernetes via Rancher (OIM manages Azure Key Vault)
4. **Redeploy:**
   ```bash
   kubectl apply -k backend/kustomize/overlays/production
   kubectl get pods -n spms-production
   ```
5. **Verify:** Test endpoints, database connectivity, file uploads, authentication

## Recovery Objectives

### Recovery Time (RTO)

**Database:** 4 hours (includes ticket submission, OIM processing, verification)
**Media Files:** 2 hours
**Configuration:** 30 minutes (maintainer-managed via Git)
**Complete System:** 6 hours

**Factors affecting RTO:**
- OIM availability (business hours vs after hours)
- Priority level (Critical gets faster response)
- Data size (larger databases/more files take longer)
- Ticket completeness (complete information speeds recovery)

### Recovery Point (RPO - Maximum Data Loss)

**Database:** 24 hours (daily backups, point-in-time recovery within 14 days)
**Media Files:** Near-zero (geo-redundant storage with versioning)
**Configuration:** Zero (version controlled in Git)

**Example:** Database backup at 2:00 AM, corruption at 3:00 PM → 13 hours data loss when restoring to 2:00 AM backup.

## Maintainer Responsibilities

### Before Disaster
- Maintain current documentation and Git repository
- Document recent changes
- Know OIM contact procedures
- Understand backup schedules
- Test recovery procedures annually

### During Recovery
1. **Assess and document:** What happened, when, what's affected, impact
2. **Submit complete ticket:** All required information, clear description, accurate timestamps
3. **Assist OIM:** Answer questions, provide logs, clarify details, be available for testing
4. **Communicate:** Notify users, provide updates, set expectations, announce completion

### After Recovery

**Verification checklist:**
- Database connectivity and application startup
- User authentication and critical features
- Data integrity and file operations
- No error spikes, acceptable performance

**Documentation:**
- What was recovered, any data loss, recovery time
- Update incident log, conduct lessons learned

**Communication:**
- Notify users of completion and any data loss
- Provide support contact

## OIM Infrastructure Responsibilities

### Backup Management
- Automated backup scheduling and retention policies
- Storage redundancy and monitoring
- Backup testing

### Recovery Operations
- Database restoration and file recovery
- Infrastructure recovery and service restart
- Connectivity verification

### Service Level Agreements
- **Critical:** 2-hour response
- **High:** 4-hour response
- **Medium:** 8-hour response
- **Low:** 24-hour response

Response time is acknowledgement; resolution may take longer.

## Testing and Validation

### Annual Recovery Test

Schedule test with OIM (non-production environment):
1. Request test database restore
2. Verify restored data
3. Document results and update procedures

Test scenarios: Database restore, media file recovery, configuration restoration, full system recovery

**Document:** Test date, scenario, actual recovery time, issues, lessons learned, procedure updates

## Emergency Contact

**OIM Service Desk:**
- **Portal:** https://dbca.freshservice.com/support/home
- **Method:** Report an Issue (for recovery requests)

**Information to provide:**
- Application: Science Projects Management System
- Environment: Production/Staging/Development
- Issue description, priority, impact

**Escalation:** OIM Service Desk → OIM Infrastructure Manager → DBCA IT Management

## Common Scenarios

### Accidental Data Deletion
1. Identify what was deleted and when (within 14-day window)
2. Submit recovery ticket with timestamp
3. OIM restores to point before deletion
4. Verify recovered data
5. Consider implementing soft deletes

### Database Corruption
1. Document error messages
2. Identify when corruption started
3. Submit recovery ticket
4. OIM restores from last good backup
5. Verify data integrity and investigate root cause

### Storage Account Issues
1. Check Azure Blob Storage status and connectivity
2. Verify file permissions
3. Submit ticket if files missing
4. OIM investigates and recovers
5. Verify file accessibility

### Configuration Drift
1. Review Git history and identify correct configuration
2. Restore from Git
3. Redeploy application
4. Verify functionality and document changes

## Continuous Improvement

**After each recovery:**
- Document what happened, detection method, recovery steps, time taken, data loss
- Review what worked well and what could improve
- Update procedures, monitoring, documentation
- Share lessons learned

**Regular reviews:**
- Quarterly procedure review
- Annual recovery test
- Update contact information
- Verify backup schedules

## Related Documentation

- **Monitoring Setup:** `backend/docs/deployment/monitoring-setup.md`
- **Error Tracking:** `backend/docs/operations/error-tracking.md`
- **Kubernetes Setup:** `backend/docs/deployment/kubernetes-setup.md`
- **Database Optimisation:** `backend/docs/development/database-optimisation.md`
