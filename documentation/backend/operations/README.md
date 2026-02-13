# Operations Documentation

## Overview

This directory contains operational documentation for the Science Projects Management System backend. These guides cover monitoring, error tracking, disaster recovery, and day-to-day operational procedures.

## Documentation

### Change Management

**File**: `change-management.md`

Guide to the DBCA Request For Change (RFC) process via Freshservice:
- When to submit an RFC
- Step-by-step RFC submission process
- Required planning documentation (impact, implementation, rollback, test plans)
- Example RFC for production deployment
- Post-RFC procedures and tips

**When to use**: Before any production deployment or infrastructure change.

### Error Tracking

**File**: `error-tracking.md`

Comprehensive guide to Sentry error tracking and the Seer GitHub integration:
- Sentry configuration and setup
- Error capture (automatic and manual)
- User and request context
- Error grouping and fingerprinting
- Performance monitoring and transaction tracing
- Release tracking and correlation
- Alerts and notifications
- Error triage and resolution workflow
- Integration with Azure Application Insights and Rancher

**When to use**: When investigating errors, setting up monitoring, or understanding error tracking capabilities.

### Disaster Recovery

**File**: `disaster-recovery.md`

Procedures for disaster recovery and data restoration:
- Backup strategy (managed by OIM Infrastructure team)
- Recovery process and ticket submission
- Maintainer responsibilities during recovery
- Post-recovery verification procedures

**When to use**: When data loss occurs or disaster recovery is needed.

### Troubleshooting

**File**: `troubleshooting.md`

Common issues and their solutions:
- Database connection issues
- Cache failures
- File upload problems
- External API errors
- Deployment issues

**When to use**: When encountering common operational issues.

## Quick Links

- **Change Management**: [change-management.md](change-management.md)
- **Freshservice Portal**: https://dbca.freshservice.com/support/home
- **System ID**: S033 (Science Project Management System)
- **Error Tracking**: [error-tracking.md](error-tracking.md)
- **Sentry Dashboard**: Access through GitHub organisation
- **Azure Rancher (Production)**: https://rancher.dbca.wa.gov.au
- **Azure Rancher (Staging)**: https://rancher-uat.dbca.wa.gov.au

## Related Documentation

- **Architecture**: `../architecture/` - Architectural decisions and patterns
- **Deployment**: `../deployment/` - Deployment procedures and configuration
- **Development**: `../development/` - Development setup and guidelines
- **Security**: `../security/` - Security tools and procedures
