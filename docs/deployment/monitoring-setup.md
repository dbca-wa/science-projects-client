# Monitoring and Logging Setup

## Overview

The SPMS uses Azure Rancher for Kubernetes monitoring, log aggregation, and operational visibility.

**Key Components**:
- **Azure Rancher**: Kubernetes cluster management and monitoring
- **Sentry**: Application error tracking (see `../operations/error-tracking.md`)
- **Correlation IDs**: Distributed tracing across services
- **Structured Logging**: Consistent log format

## Azure Rancher Access

### Environments

**Production**:
- URL: https://rancher.dbca.wa.gov.au
- Namespace: `spms-production`

**Staging**:
- URL: https://rancher-uat.dbca.wa.gov.au
- Namespace: `spms-staging`

### Requesting Access

1. Submit ticket to OIM Infrastructure team
2. Specify environment (production, staging, or both)
3. Justify access need (maintainer role, debugging, monitoring)
4. Access typically granted within 1 business day

## Accessing Logs

### Via Rancher Web UI

1. Log in to Rancher
2. Select cluster and navigate to "Workloads" → "Pods"
3. Filter to SPMS namespace
4. Click pod name → "View Logs"
5. Use search box to filter by correlation ID, user ID, or error message

### Log Levels

- `DEBUG`: Detailed diagnostic (development only)
- `INFO`: General informational messages
- `WARNING`: Potential issues
- `ERROR`: Failures
- `CRITICAL`: System down

**Production**: Default level `INFO`, errors sent to Sentry automatically.

### Log Format

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

## Correlation IDs

### Purpose

Enable distributed tracing across:
- Multiple service calls
- Database queries
- Cache operations
- External API calls
- Error tracking in Sentry

### Tracing Requests

**In Rancher**:
1. Copy correlation ID from error or log entry
2. Search logs using correlation ID
3. View all log entries for that request

**In Sentry**:
1. Errors automatically tagged with correlation ID
2. Search Sentry by correlation ID
3. View error context with full request trace

## Key Metrics

### Application Metrics

**Response Times**:
- P50: Target < 200ms
- P95: Target < 500ms
- P99: Target < 1000ms

**Error Rates**:
- 4xx errors: < 5% of requests
- 5xx errors: < 0.1% of requests

**Database Query Times**:
- Average: < 50ms
- Slow queries: > 1000ms (flagged)

**Cache Performance**:
- Hit rate: Target > 80%

### Infrastructure Metrics

**Pod Health**:
- Running pods: All in "Running" state
- Restart count: < 5 per day
- Memory usage: < 80% of limit
- CPU usage: < 70% of limit

## Viewing Metrics in Rancher

1. Navigate to "Workloads" → "Pods"
2. Click pod name → "Metrics" tab
3. View CPU, memory, and network usage
4. Adjust time range (1h, 6h, 24h, 7d)

## Alerting

### Alert Configuration

Configured at organisation level:
- Critical errors (5xx responses)
- High error rate (> 10 errors/minute)
- Pod restarts (> 5 per hour)
- Resource exhaustion (CPU/memory > 90%)

**Alert Channels**: Email, Microsoft Teams webhooks

### Priority Levels

1. **Critical**: Production down, immediate response
2. **High**: Feature broken, response within 1 hour
3. **Medium**: Degraded performance, response within 4 hours
4. **Low**: Minor issue, next business day

## Log Retention

- Production logs: 30 days
- Staging logs: 14 days
- Critical errors: Archived to Azure Blob Storage (90 days)

## Exporting Logs

**Via Rancher UI**:
1. Navigate to pod logs
2. Click "Download" button
3. Select time range

**Via kubectl** (if access granted):
```bash
kubectl logs <pod-name> -n spms-production > logs.txt
kubectl logs <pod-name> -n spms-production --since=1h > logs.txt
```

## Integration with Other Tools

### Sentry Integration

- Rancher: Infrastructure and pod logs
- Sentry: Application errors and user impact
- Use correlation IDs to link logs and errors

### kubectl CLI

**Common commands**:
```bash
kubectl get pods -n spms-production
kubectl describe pod <pod-name> -n spms-production
kubectl logs <pod-name> -n spms-production
kubectl logs -f <pod-name> -n spms-production  # Follow logs
```

## Best Practices

### Monitoring

**DO**:
- Check Rancher daily for pod health
- Review error rates weekly
- Monitor resource usage trends
- Use correlation IDs for tracing

**DON'T**:
- Ignore pod restart alerts
- Wait for users to report issues
- Log passwords or tokens
- Use DEBUG level in production

### Logging

**DO**:
- Include correlation ID in all log messages
- Log at appropriate levels
- Include relevant context (user ID, resource ID)
- Sanitise sensitive data

**DON'T**:
- Log sensitive data (passwords, tokens, PII)
- Create excessive log volume
- Log without context

## Security Considerations

### Log Access

- Role-based access in Rancher
- SSO authentication required
- PII sanitised from logs
- Access reviews quarterly

### Secrets Management

- Secrets managed via Rancher GUI (see `../security/secrets-management.md`)
- Infrastructure team manages Azure Key Vault backend
- Never logged or exposed

## References

- **Azure Rancher (Production)**: https://rancher.dbca.wa.gov.au
- **Azure Rancher (Staging)**: https://rancher-uat.dbca.wa.gov.au
- **Sentry Error Tracking**: `../operations/error-tracking.md`
