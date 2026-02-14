# Operations Documentation

## Overview

This section contains operational procedures, monitoring, and troubleshooting guides that apply to the entire Science Projects Management System (both frontend and backend).

## Contents

### Change Management

**[Change Management Process](./change-management.md)**

Procedures for managing changes to production systems:
- Change request process
- Deployment windows and scheduling
- Rollback procedures
- Communication protocols

### Error Tracking

**[Error Tracking and Monitoring](./error-tracking.md)**

Error tracking and monitoring for both frontend and backend:
- **Frontend**: Sentry for React error tracking
- **Backend**: Sentry for Django error tracking
- Error triage and resolution
- Alert configuration

### Disaster Recovery

**[Disaster Recovery Procedures](./disaster-recovery.md)**

Procedures for recovering from system failures:
- **Frontend**: Static asset recovery, CDN failover
- **Backend**: Database recovery, media file restoration
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)

### Monitoring

**[Monitoring Strategy](./monitoring.md)**

Monitoring and observability for both frontend and backend:
- **Frontend**: Sentry performance monitoring for React
- **Backend**: Sentry application monitoring, database monitoring
- Infrastructure monitoring
- Alert configuration and escalation

## Related Documentation

- [Deployment Documentation](../deployment/) - Shared deployment strategies
- [Security Documentation](../security/) - Security tools and processes (applies to both frontend and backend)
- [Frontend Architecture](../../frontend/architecture/) - Frontend architecture decisions
- [Backend Architecture](../../backend/architecture/) - Backend architecture decisions

## External Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
