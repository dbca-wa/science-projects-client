# ADR-009: Application Logging and Monitoring Strategy

## Context

The Science Projects Management System (SPMS) backend requires application-level logging and monitoring to support development and maintenance activities. The monitoring responsibilities are divided between two teams:

**Development Team Responsibilities** (sole maintainer with consideration for team collaboration):
- Application logging and log review
- Error tracking and debugging
- Performance monitoring of endpoints
- API usage analysis
- Application-level troubleshooting

**Infrastructure Team Responsibilities**:
- Resource monitoring (CPU, memory, disk, network)
- Kubernetes cluster health
- Database resource utilisation
- Infrastructure alerting and scaling
- Azure Application Insights configuration and management

> **Infrastructure Management**: Infrastructure monitoring and configuration is handled by OIM (Office of Information Management). For infrastructure changes, submit requests via the [change management process](../../general/operations/change-management.md).

The development team needs tools to:
- Review application logs in staging and production environments
- Track errors and exceptions in real-time
- Monitor endpoint performance and identify bottlenecks
- Analyse API usage patterns
- Debug production issues efficiently

**Organisational Context**: The organisation uses Azure as its cloud platform (organisational infrastructure choice), with infrastructure monitoring managed by the infrastructure team.

## Decision

We will use a two-tier approach for application logging and monitoring:

**Primary Tools** (Development Team):
1. **Rancher** - Log review for staging and production environments
2. **Sentry** - Error tracking, performance monitoring, and endpoint analysis

**Infrastructure Tools** (Infrastructure Team - OIM):
- Azure Application Insights - Configured and managed by OIM
- Azure Monitor - Resource monitoring and alerting
- Kubernetes metrics - Cluster health and resource utilisation

> **Infrastructure Management**: Infrastructure monitoring is configured and managed by OIM (Office of Information Management). For infrastructure monitoring changes:
> 1. Review the [change management process](../../general/operations/change-management.md)
> 2. Submit an RFC (Request for Change) with monitoring requirements
> 3. OIM will implement approved changes

This division allows the development team to focus on application-level concerns whilst the infrastructure team handles platform-level monitoring.

## Consequences

### Positive Consequences

- **Clear Separation of Concerns**: Development team focuses on application issues, infrastructure team handles platform concerns
- **Efficient Log Access**: Rancher provides direct access to application logs in staging and production
- **Real-Time Error Tracking**: Sentry immediately notifies of errors and exceptions
- **Performance Insights**: Sentry tracks endpoint performance and identifies slow operations
- **API Usage Analysis**: Sentry provides visibility into most-hit endpoints and usage patterns
- **Reduced Operational Burden**: Infrastructure team manages resource monitoring and alerting
- **Focused Troubleshooting**: Development team has tools specifically for application-level debugging
- **Cost Effective**: Leverages existing organisational tools without additional infrastructure

### Negative Consequences

- **Limited Infrastructure Visibility**: Development team relies on infrastructure team for resource metrics
- **Tool Fragmentation**: Multiple tools for different monitoring aspects
- **Dependency on Infrastructure Team**: Cannot directly access or configure Application Insights
- **Learning Curve**: Requires familiarity with both Rancher and Sentry interfaces

### Neutral Consequences

- **Dual Monitoring Stack**: Application-level (Rancher/Sentry) + Infrastructure-level (Application Insights/Azure Monitor)
- **Team Coordination**: Requires communication between development and infrastructure teams for holistic troubleshooting
- **Access Management**: Different access levels for different monitoring tools

## Alternatives Considered

### Self-Managed Prometheus + Grafana

**Description**: Open-source monitoring stack managed by development team.

**Why Not Chosen**:
- Requires significant operational overhead for setup and maintenance
- Infrastructure monitoring already handled by infrastructure team
- Duplicates existing organisational monitoring capabilities
- Too complex for sole maintainer to manage alongside application development

**Trade-offs**: Would provide more control but at significant operational cost.

### Direct Application Insights Access

**Description**: Development team directly manages Application Insights configuration.

**Why Not Chosen**:
- Infrastructure team already manages Application Insights
- Organisational policy assigns infrastructure monitoring to infrastructure team
- Would create confusion about monitoring ownership
- Development team focus should be on application-level concerns

**Trade-offs**: Would provide more visibility but violates organisational separation of concerns.

### Logs-Only Approach (No Sentry)

**Description**: Rely solely on Rancher logs without dedicated error tracking.

**Why Not Chosen**:
- Manual log review is time-consuming and error-prone
- No real-time error notifications
- Difficult to track error trends and patterns
- No performance monitoring for endpoints
- Missing API usage analytics

**Trade-offs**: Would be simpler but significantly less effective for debugging and monitoring.

## Implementation Notes

### Rancher Log Access

**Purpose**: Review application logs in staging and production environments.

**Access**:
- Staging environment: Rancher staging cluster
- Production environment: Rancher production cluster

**Common Use Cases**:
- Reviewing application startup logs
- Debugging deployment issues
- Investigating user-reported issues
- Verifying configuration changes
- Analysing request/response patterns

**Log Review Workflow**:
1. Access Rancher for appropriate environment (staging/production)
2. Navigate to application pods
3. View real-time logs or download log history
4. Search for specific errors, warnings, or patterns
5. Correlate logs with Sentry errors if needed

### Sentry Configuration

**Purpose**: Real-time error tracking, performance monitoring, and API analytics.

**Key Features Used**:

**Error Tracking**:
- Automatic exception capture
- Stack traces with context
- User impact analysis
- Error grouping and trends
- Release tracking

**Performance Monitoring**:
- Endpoint response times
- Slow transaction detection
- Database query performance
- External API call duration
- Performance trends over time

**API Usage Analysis**:
- Most-hit endpoints
- Request volume patterns
- User activity tracking
- Geographic distribution
- Client version tracking

**Django Integration** (`config/settings/monitoring.py`):

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
    send_default_pii=False,  # Don't send personally identifiable information
    environment=os.environ.get('ENVIRONMENT', 'development'),
    release=os.environ.get('RELEASE_VERSION', 'unknown'),
)
```

### Structured Logging Patterns

**Standard Log Format**:
```python
import logging

logger = logging.getLogger(__name__)

logger.info(
    "User action performed",
    extra={
        'user_id': user.id,
        'action': 'project_created',
        'project_id': project.id,
    }
)
```

**Error Logging**:
```python
try:
    # Some operation
    pass
except Exception as e:
    logger.error(
        "Operation failed",
        exc_info=True,
        extra={
            'user_id': user.id,
            'operation': 'project_update',
        }
    )
    # Sentry automatically captures this exception
```

### Development Team Monitoring Workflow

**Daily Monitoring**:
1. Check Sentry dashboard for new errors
2. Review performance trends for endpoint degradation
3. Investigate any error spikes or patterns

**Issue Investigation**:
1. Receive Sentry notification of error
2. Review error details, stack trace, and context in Sentry
3. Check Rancher logs for additional context if needed
4. Reproduce issue in development environment
5. Deploy fix and verify in Sentry

**Performance Analysis**:
1. Review Sentry performance dashboard weekly
2. Identify slow endpoints (>1 second response time)
3. Analyse database queries and external API calls
4. Optimise slow operations
5. Verify improvements in Sentry metrics

**API Usage Review**:
1. Review most-hit endpoints monthly
2. Identify usage patterns and trends
3. Plan optimisations for high-traffic endpoints
4. Monitor for unusual activity or abuse

### Infrastructure Team Coordination

**When to Involve OIM Infrastructure Team**:
- Application errors related to resource constraints (OOM, CPU throttling)
- Database connection pool exhaustion
- Network connectivity issues
- Kubernetes pod crashes or restarts
- Scaling requirements based on traffic patterns

**Communication Pattern**:
1. Development team identifies application-level issue
2. If resource-related, provide Sentry/Rancher evidence to OIM via change management
3. OIM reviews Application Insights and Azure Monitor
4. Teams collaborate on resolution via change management process
5. Development team verifies fix in Sentry/Rancher

### Alerting Strategy

**Sentry Alerts** (Development Team):
- New error types (immediate notification)
- Error rate spike >10 errors/minute (immediate notification)
- Performance degradation >2 seconds p95 (daily digest)
- High-volume endpoint issues (daily digest)

**Infrastructure Alerts** (OIM Infrastructure Team):
- CPU usage >80% (managed by OIM)
- Memory usage >80% (managed by OIM)
- Pod crashes (managed by OIM)
- Database resource constraints (managed by OIM)

### Log Retention

**Rancher Logs**:
- Retention managed by OIM
- Typically 7-30 days depending on environment

**Sentry**:
- Error retention: 90 days
- Performance data: 30 days
- Configurable based on organisational plan

### Cost Management

**Sentry**:
- Monitor monthly error volume
- Adjust sampling rates if approaching limits
- Focus on production errors over development

**Rancher**:
- No direct cost to development team
- Managed by OIM

### Migration Strategy

**Current State**: Application Insights configured by OIM (Office of Information Management), Sentry integrated for error tracking.

**Ongoing Maintenance**:
1. Ensure Sentry SDK stays up-to-date
2. Review and adjust performance sampling rates
3. Configure alerts for new critical endpoints
4. Coordinate with OIM via change management for infrastructure monitoring changes

### Rollback Plan

If Sentry causes issues:
1. Disable Sentry via environment variable (`SENTRY_DSN=""`)
2. Fall back to Rancher logs only
3. Application continues working normally
4. Re-enable Sentry after resolving issues

## References

- [Rancher Documentation](https://rancher.com/docs/)
- [Sentry Django Integration](https://docs.sentry.io/platforms/python/guides/django/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Django Logging Documentation](https://docs.djangoproject.com/en/stable/topics/logging/)
- Related ADRs:
  - ADR-002: Django REST Framework Choice
  - ADR-006: Azure Kubernetes Deployment
  - ADR-010: File Upload Validation Strategy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
