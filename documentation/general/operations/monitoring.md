# Monitoring Strategy

## Overview

This document outlines the monitoring and observability strategy for the Science Projects Management System (SPMS), covering both frontend and backend components.

## Monitoring Stack

### Sentry

Sentry is used for error tracking and performance monitoring across both frontend and backend.

**Configuration:**
- Organisation: DBCA
- Project: `spms` (single project for both frontend and backend)
- Environment tagging separates errors: `production` vs `staging`

**Why one project?**
Sentry supports multiple platforms (React, Django, Mobile) in a single project. Environment tags (`production`, `staging`) separate errors in the dashboard, making it easy to filter by environment.

**DSN (Data Source Name):**
- Same DSN used for both frontend and backend
- Same DSN used for both production and staging
- Environment tag determines which environment errors appear under
- Configured via GitHub Secrets (frontend) and Rancher Secrets (backend)

## Frontend Monitoring

### Error Tracking

**Sentry for React:**
- Automatic error capture for unhandled exceptions
- React error boundaries integration
- Source map upload for production debugging
- User context tracking (when authenticated)

**Configuration:**
```typescript
// frontend/src/app/sentry.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,  // From GitHub Secrets
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,  // 'production' or 'staging'
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Environment variables:**
- `VITE_SENTRY_DSN` - Set in GitHub Secrets (same for production and staging)
- `VITE_SENTRY_ENVIRONMENT` - Set by workflow (`production` or `staging`)

**Security note:** Sentry DSN is intentionally public (visible in browser). It only allows sending errors to Sentry, not reading them.

### Performance Monitoring

**Metrics tracked:**
- Page load times
- Component render times
- API request latency
- Bundle size and load performance
- Core Web Vitals (LCP, FID, CLS)

**Sentry Performance:**
- Transaction tracking for route changes
- Custom spans for critical operations
- User interaction tracking
- Session replay for error debugging

### Browser Monitoring

**Supported browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**Metrics:**
- Browser version distribution
- Error rates by browser
- Performance by browser

## Backend Monitoring

### Error Tracking

**Sentry for Django:**
- Automatic exception capture
- Request context tracking
- User context tracking
- Database query tracking
- Celery task monitoring (if applicable)

**Configuration:**
```python
# backend/config/settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_URL"),  # From Rancher Secrets
    environment=os.environ.get("ENVIRONMENT", "production"),  # 'production' or 'staging'
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=False,
)
```

**Environment variables:**
- `SENTRY_URL` - Set in Rancher Secrets (same DSN as frontend)
- `ENVIRONMENT` - Set in Rancher Secrets (`production` or `staging`)

**Note:** Backend uses `SENTRY_URL` (not `SENTRY_DSN`) for consistency with existing infrastructure.

### Application Monitoring

**Metrics tracked:**
- Request/response times
- Database query performance
- API endpoint latency
- Error rates by endpoint
- Authentication failures

**Django Middleware:**
- Request timing middleware
- Error logging middleware
- User activity tracking

### Database Monitoring

**PostgreSQL monitoring:**
- Query performance
- Connection pool usage
- Slow query logging
- Database size and growth

**Monitoring tools:**
- Azure Database for PostgreSQL insights
- Sentry database query tracking

### Infrastructure Monitoring

**Azure Kubernetes Service (AKS):**
- Pod health and restarts
- Resource usage (CPU, memory)
- Network traffic
- Storage usage

> **Infrastructure Management**: Azure Monitor Container Insights is configured and managed by OIM (Office of Information Management). Developers access pod logs and basic metrics via Rancher GUI. For infrastructure-level monitoring changes or advanced diagnostics:
> 1. Review the [change management process](../operations/change-management.md)
> 2. Submit an RFC (Request for Change) with monitoring requirements
> 3. OIM will implement approved changes

**Developer access via Rancher:**
- Pod logs and basic metrics
- Container health status
- Resource usage graphs
- Restart counts

## Alert Configuration

### Critical Alerts

**Frontend:**
- Error rate > 5% over 5 minutes
- Page load time > 5 seconds (p95)
- API failure rate > 10%

**Backend:**
- Error rate > 1% over 5 minutes
- Response time > 2 seconds (p95)
- Database connection failures
- Pod restart loops

### Warning Alerts

**Frontend:**
- Error rate > 2% over 15 minutes
- Page load time > 3 seconds (p95)
- Bundle size increase > 20%

**Backend:**
- Error rate > 0.5% over 15 minutes
- Response time > 1 second (p95)
- Database query time > 500ms (p95)
- Memory usage > 80%

### Alert Channels

**Primary:**
- GitHub Actions email notifications
- Team contact: `ecoinformatics.admin@dbca.wa.gov.au`

## Monitoring Dashboards

### Sentry Dashboards

**Frontend Dashboard:**
- Error trends
- Performance metrics
- User sessions
- Browser distribution

**Backend Dashboard:**
- Error trends
- API performance
- Database performance
- User activity

### Rancher Dashboards

**Pod Monitoring:**
- Pod status and health
- Resource usage (CPU, memory)
- Container logs
- Restart counts

## Log Aggregation

### Frontend Logs

**Browser console logs:**
- Captured by Sentry in production
- Available in session replays
- Filtered by log level

**Build logs:**
- GitHub Actions workflow logs
- Vite build output
- Test results

### Backend Logs

**Application logs:**
- Django application logs
- Gunicorn access logs
- Celery task logs (if applicable)

**Infrastructure logs:**
- AKS pod logs
- Ingress controller logs
- Database logs

**Log levels:**
- `ERROR`: Application errors, exceptions
- `WARNING`: Potential issues, deprecations
- `INFO`: General application flow
- `DEBUG`: Detailed debugging (development only)

## Monitoring Best Practices

### Frontend

1. **Use error boundaries** - Catch React errors gracefully
2. **Add user context** - Include user ID and email in Sentry
3. **Track custom events** - Monitor critical user actions
4. **Monitor bundle Size** - Keep bundle size under 500KB
5. **Test error tracking** - Verify Sentry integration in staging

### Backend

1. **Log structured data** - Use JSON logging for easy parsing
2. **Add request IDs** - Track requests across services
3. **Monitor slow queries** - Optimise queries > 100ms
4. **Set up health checks** - Kubernetes liveness/readiness probes
5. **Test error tracking** - Verify Sentry integration in staging

### General

1. **Review alerts weekly** - Adjust thresholds as needed
2. **Investigate trends** - Look for patterns in errors
3. **Document incidents** - Create postmortems for major issues
4. **Update runbooks** - Keep troubleshooting guides current
5. **Test monitoring** - Verify alerts fire correctly

## Troubleshooting

### Frontend Issues

**High error rate:**
1. Check Sentry for error details
2. Review recent deployments
3. Check browser compatibility
4. Verify API connectivity

**Slow page loads:**
1. Check bundle sie
2. Review network requests
3. Check API response times
4. Verify CDN performance

### Backend Issues

**High error rate:**
1. Check Sentry for exception details
2. Review recent deployments
3. Check database connectivity
4. Verify external service availability

**Slow response times:**
1. Check database query performance
2. Review slow query logs
3. Check resource usage (CPU, memory)
4. Verify network connectivity

## Backend-Specific Monitoring

### Azure Rancher for Backend Monitoring

**Primary monitoring tool**: Azure Rancher (developers use Rancher GUI, not kubectl)

**Access:**
- **Production**: https://rancher.dbca.wa.gov.au
- **Staging**: https://rancher-uat.dbca.wa.gov.au

**Requesting Access:**
1. Submit ticket to OIM Infrastructure team
2. Specify environment (production, staging, or both)
3. Justify access need (maintainer role, debugging, monitoring)
4. Access typically granted within 1 business day

### Backend Log Aggregation

**Accessing Logs via Rancher:**
1. Log in to Rancher
2. Select cluster and navigate to "Workloads" → "Pods"
3. Filter to SPMS namespace (`spms-production` or `spms-staging`)
4. Click pod name → "View Logs"
5. Use search box to filter by correlation ID, user ID, or error message

**Log Levels:**
- `DEBUG`: Detailed diagnostic (development only)
- `INFO`: General informational messages
- `WARNING`: Potential issues
- `ERROR`: Failures
- `CRITICAL`: System down

**Production**: Default level `INFO`, errors sent to Sentry automatically.

**Structured Log Format:**
```json
{
  "timestamp": "2026-02-07T10:30:45.123Z",
  "level": "INFO",
  "message": "User login successful",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": 123,
  "request_path": "/api/v1/users/me",
  "duration_ms": 45
}
```

### Backend Correlation IDs

**Purpose**: Enable distributed tracing across:
- Multiple service calls
- Database queries
- Cache operations
- External API calls
- Error tracking in Sentry

**Tracing Requests:**

In Rancher:
1. Copy correlation ID from error or log entry
2. Search logs using correlation ID
3. View all log entries for that request

In Sentry:
1. Errors automatically tagged with correlation ID
2. Search Sentry by correlation ID
3. View error context with full request trace

### Backend Key Metrics

**Application Metrics:**
- Response Times: P50 < 200ms, P95 < 500ms, P99 < 1000ms
- Error Rates: 4xx < 5%, 5xx < 0.1%
- Database Query Times: Average < 50ms, Slow queries > 1000ms flagged
- Cache Performance: Hit rate > 80%

**Infrastructure Metrics:**
- Pod Health: All in "Running" state
- Restart count: < 5 per day
- Memory usage: < 80% of limit
- CPU usage: < 70% of limit

**Viewing Metrics in Rancher:**
1. Navigate to "Workloads" → "Pods"
2. Click pod name → "Metrics" tab
3. View CPU, memory, and network usage
4. Adjust time range (1h, 6h, 24h, 7d)

### Backend Alerting

**Alert Configuration** (configured at organisation level):
- Critical errors (5xx responses)
- High error rate (> 10 errors/minute)
- Pod restarts (> 5 per hour)
- Resource exhaustion (CPU/memory > 90%)

**Alert Channels**: Email, Microsoft Teams webhooks

**Priority Levels:**
1. **Critical**: Production down, immediate response
2. **High**: Feature broken, response within 1 hour
3. **Medium**: Degraded performance, response within 4 hours
4. **Low**: Minor issue, next business day

### Backend Log Retention

- Production logs: 30 days
- Staging logs: 14 days
- Critical errors: Archived to Azure Blob Storage (90 days)

### Exporting Backend Logs

**Via Rancher UI:**
1. Navigate to pod logs
2. Click "Download" button
3. Select time range

**Via kubectl** (if access granted):
```bash
kubectl logs <pod-name> -n spms-production > logs.txt
kubectl logs <pod-name> -n spms-production --since=1h > logs.txt
```

### Integration with Other Tools

**Sentry Integration:**
- Rancher: Infrastructure and pod logs
- Sentry: Application errors and user impact
- Use correlation IDs to link logs and errors

**kubectl CLI** (if access granted):
```bash
kubectl get pods -n spms-production
kubectl describe pod <pod-name> -n spms-production
kubectl logs <pod-name> -n spms-production
kubectl logs -f <pod-name> -n spms-production  # Follow logs
```

## Related Documentation

- [Error Tracking](./error-tracking.md) - Detailed Sentry configuration
- [Disaster Recovery](./disaster-recovery.md) - Recovery procedures
- [Kubernetes Overview](../deployment/kubernetes-overview.md) - Backend deployment and secrets management
- [Frontend Performance](../../frontend/performance/) - Frontend performance optimisation

## External Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Azure Monitor Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/)
- [Kubernetes Monitoring](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)
- [Web Vitals](https://web.dev/vitals/)
