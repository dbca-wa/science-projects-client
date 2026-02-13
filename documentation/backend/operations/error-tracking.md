# Error Tracking with Sentry (Seer)

## Overview

The Science Projects Management System uses Sentry for comprehensive error tracking and performance monitoring. Sentry is configured at the GitHub organisation level through the Seer integration, providing automatic error tracking across all environments.

**Key Benefits**:
- Automatic error capture and grouping
- User context and request details
- Performance monitoring (transaction tracing)
- Release tracking and error correlation
- Real-time alerts and notifications
- Error trends and impact analysis

## Architecture

### Sentry Integration

**Configuration Location**: `backend/config/settings.py`

```python
if ENVIRONMENT != "development":
    sentry_sdk.init(
        environment=ENVIRONMENT,
        dsn=env("SENTRY_URL"),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
```

**Key Configuration**:
- **Environment**: Automatically set from `ENVIRONMENT` variable (staging, production)
- **DSN**: Sentry Data Source Name from environment variable
- **Traces Sample Rate**: 100% of transactions monitored (1.0)
- **Profiles Sample Rate**: 100% of profiles captured (1.0)

### Seer (GitHub Organisation-Level)

**Status**: Configured at GitHub organisation level

**What Seer Provides**:
- Automatic error tracking for all repositories
- Organisation-wide error visibility
- Centralised error management
- Cross-repository error correlation
- Automated issue creation in GitHub

**Access**: Available through GitHub organisation's Sentry dashboard

## Error Capture

### Automatic Error Capture

Sentry automatically captures:
- **Unhandled Exceptions**: Any uncaught Python exception
- **HTTP Errors**: 500 Internal Server Error responses
- **Database Errors**: Connection failures, query errors
- **Validation Errors**: Django form and serialiser validation failures
- **Middleware Errors**: Errors in middleware processing
- **Background Task Errors**: Celery task failures (if configured)

### Manual Error Capture

For custom error tracking:

```python
import sentry_sdk

# Capture exception with context
try:
    risky_operation()
except Exception as e:
    sentry_sdk.capture_exception(e)
    # Continue with fallback logic

# Capture custom message
sentry_sdk.capture_message("Custom event occurred", level="warning")

# Add custom context
with sentry_sdk.push_scope() as scope:
    scope.set_tag("operation", "data_import")
    scope.set_context("import_details", {
        "file_name": "data.csv",
        "row_count": 1000,
    })
    sentry_sdk.capture_exception(e)
```

## Error Context

### User Context

**Automatic Capture**:
- User ID (if authenticated)
- Username (if authenticated)
- Request path
- HTTP method
- User agent
- IP address (anonymised)

**Important**: PII (Personally Identifiable Information) is NOT automatically sent to Sentry. Only user ID and username are captured for authenticated requests.

### Request Context

**Automatic Capture**:
- Request URL
- HTTP method (GET, POST, PUT, DELETE)
- Request headers (sanitised)
- Query parameters
- Request body (sanitised)
- Response status code

**Sanitisation**:
- Passwords removed from request body
- API keys removed from headers
- Session tokens removed
- CSRF tokens removed

### Environment Context

**Automatic Capture**:
- Environment name (staging, production)
- Release version (from `RELEASE_VERSION` env var)
- Server name
- Python version
- Django version
- Installed packages

## Error Grouping and Fingerprinting

### Automatic Grouping

Sentry automatically groups similar errors using:
- **Exception Type**: Same exception class
- **Stack Trace**: Similar call stack
- **Error Message**: Similar error messages
- **File and Line Number**: Same source location

### Custom Fingerprinting

For better error grouping:

```python
import sentry_sdk

# Custom fingerprint for specific error types
with sentry_sdk.push_scope() as scope:
    scope.fingerprint = ["database-connection-error", "{{ default }}"]
    sentry_sdk.capture_exception(e)

# Group by custom attribute
with sentry_sdk.push_scope() as scope:
    scope.fingerprint = ["file-upload-validation", file_type]
    sentry_sdk.capture_exception(e)
```

**Common Fingerprint Patterns**:
- `["database-connection-error"]` - All database connection failures
- `["file-upload-validation", file_type]` - Group by file type
- `["external-api-error", api_name]` - Group by external API
- `["cache-error", cache_key]` - Group by cache operation

## Performance Monitoring

### Transaction Tracing

**Automatic Tracing**:
- HTTP requests (all endpoints)
- Database queries (with query text)
- Cache operations (Redis)
- External API calls

**Sample Rate**: 100% of transactions (configured in settings)

### Slow Query Detection

Sentry automatically flags:
- Database queries > 1 second
- HTTP requests > 3 seconds
- External API calls > 5 seconds

**Viewing Slow Queries**:
1. Navigate to Sentry dashboard
2. Select "Performance" tab
3. Filter by "Database" operations
4. Sort by duration

### Custom Performance Tracking

```python
import sentry_sdk

# Track custom operation
with sentry_sdk.start_transaction(op="data_processing", name="Import CSV"):
    with sentry_sdk.start_span(op="file_read", description="Read CSV file"):
        data = read_csv_file()

    with sentry_sdk.start_span(op="database_insert", description="Insert records"):
        insert_records(data)
```

## Release Tracking

### Release Configuration

**Environment Variable**: `RELEASE_VERSION`

```bash
# In deployment
export RELEASE_VERSION="v1.2.3"
```

**Automatic Correlation**:
- Errors linked to specific releases
- Release health metrics
- Error rate changes between releases
- New errors introduced in release

### Viewing Release Health

1. Navigate to Sentry dashboard
2. Select "Releases" tab
3. View release health metrics:
   - Error count
   - Affected users
   - Crash-free sessions
   - New issues introduced

## Alerts and Notifications

### Alert Configuration

**Configured at Organisation Level** (Seer):
- Critical errors (500 errors)
- High error rate (> 10 errors/minute)
- New error types
- Performance degradation
- Release health issues

### Alert Channels

**Available Channels**:
- Email notifications
- Microsoft Teams webhooks
- GitHub issue creation
- PagerDuty integration (if configured)

### Alert Triage

**Priority Levels**:
1. **Critical**: Production down, data loss risk
2. **High**: Feature broken, user impact
3. **Medium**: Degraded performance, some users affected
4. **Low**: Edge case, minimal impact

**Response Times**:
- Critical: Immediate response required
- High: Within 1 hour
- Medium: Within 4 hours
- Low: Next business day

## Viewing and Triaging Errors

### Accessing Sentry Dashboard

1. Navigate to GitHub organisation's Sentry dashboard
2. Select "Science Projects Management System" project
3. Filter by environment (staging, production)

### Error Details

**For Each Error**:
- Error message and stack trace
- User context (ID, username)
- Request details (URL, method, headers)
- Environment details (Python version, Django version)
- Breadcrumbs (events leading to error)
- Similar errors (grouped issues)

### Triage Process

**Step 1: Assess Impact**
- How many users affected?
- What functionality is broken?
- Is it environment-specific?
- Is it a regression?

**Step 2: Prioritise**
- Critical: Fix immediately
- High: Fix within 24 hours
- Medium: Fix within 1 week
- Low: Fix in next sprint

**Step 3: Investigate**
- Review stack trace
- Check user context
- Review breadcrumbs
- Reproduce locally

**Step 4: Fix and Verify**
- Implement fix
- Deploy to staging
- Verify error resolved
- Mark as resolved in Sentry

### Common Error Patterns

**Database Connection Errors**:
- **Symptom**: `OperationalError: could not connect to server`
- **Cause**: Database unavailable or connection pool exhausted
- **Action**: Check database health, review connection pool settings

**File Upload Errors**:
- **Symptom**: `ValidationError: Invalid file type`
- **Cause**: File content doesn't match extension
- **Action**: Review file validation logic, check user upload

**External API Errors**:
- **Symptom**: `ConnectionError: Failed to connect to external API`
- **Cause**: External service unavailable or timeout
- **Action**: Check external service status, implement retry logic

**Cache Errors**:
- **Symptom**: `ConnectionError: Error connecting to Redis`
- **Cause**: Redis unavailable
- **Action**: Check Redis health, verify graceful degradation

## Error Resolution Workflow

### 1. Error Detected

**Automatic**:
- Sentry captures error
- Alert sent to configured channels
- Error grouped with similar issues

### 2. Initial Triage

**Maintainer Actions**:
- Review error details in Sentry
- Assess impact and priority
- Assign to self or team member
- Add comments with initial findings

### 3. Investigation

**Maintainer Actions**:
- Reproduce error locally
- Review stack trace and context
- Check related code changes
- Review similar errors

### 4. Fix Implementation

**Maintainer Actions**:
- Implement fix
- Add unit tests
- Update documentation if needed
- Create pull request

### 5. Deployment and Verification

**Maintainer Actions**:
- Deploy to staging
- Verify error resolved
- Deploy to production
- Monitor for recurrence

### 6. Resolution

**Maintainer Actions**:
- Mark error as resolved in Sentry
- Document root cause
- Update runbooks if needed
- Close related GitHub issues

## Best Practices

### Error Handling

**DO**:
- Catch specific exceptions, not generic `Exception`
- Add context to errors before capturing
- Use custom fingerprints for better grouping
- Log errors locally before sending to Sentry

**DON'T**:
- Catch and ignore errors without logging
- Send PII (passwords, tokens) to Sentry
- Over-capture (every validation error)
- Ignore error trends

### Performance Monitoring

**DO**:
- Monitor slow queries regularly
- Set up alerts for performance degradation
- Track custom operations for critical paths
- Review transaction traces for bottlenecks

**DON'T**:
- Ignore slow query warnings
- Over-instrument (every function call)
- Forget to clean up old transactions
- Ignore memory usage patterns

### Alert Management

**DO**:
- Configure alerts for critical errors only
- Set appropriate thresholds (avoid alert fatigue)
- Review and adjust alert rules regularly
- Document alert response procedures

**DON'T**:
- Alert on every error (too noisy)
- Ignore repeated alerts
- Set alerts without response plan
- Forget to update alert channels

## Troubleshooting

### Sentry Not Capturing Errors

**Symptoms**:
- Errors occur but not visible in Sentry
- Missing error context

**Possible Causes**:
1. `SENTRY_URL` environment variable not set
2. Sentry initialisation failing silently
3. Error occurring before Sentry initialisation
4. Development environment (Sentry disabled)

**Solutions**:
1. Verify `SENTRY_URL` in environment variables
2. Check Django logs for Sentry initialisation errors
3. Move Sentry init earlier in settings
4. Check `ENVIRONMENT` variable (should be staging/production)

### Missing User Context

**Symptoms**:
- Errors captured but no user information
- User ID showing as "anonymous"

**Possible Causes**:
1. Error occurring before authentication
2. User not authenticated
3. Custom authentication not integrated

**Solutions**:
1. Check if error occurs in public endpoints
2. Verify user authentication status
3. Add custom user context if needed

### Performance Data Not Showing

**Symptoms**:
- Errors captured but no performance data
- Missing transaction traces

**Possible Causes**:
1. `traces_sample_rate` set to 0
2. Performance monitoring disabled
3. Transactions not being created

**Solutions**:
1. Verify `traces_sample_rate=1.0` in settings
2. Check Sentry configuration
3. Add custom transactions if needed

## Integration with Other Tools

### Azure Application Insights

**Complementary Use**:
- Sentry: Error tracking and user impact
- Application Insights: Infrastructure metrics and logs

**Correlation**:
- Use correlation IDs in both systems
- Cross-reference errors between systems
- Combine for complete observability

### Azure Rancher

**Monitoring Integration**:
- Rancher: Container health and resource usage
- Sentry: Application errors and performance

**Access**:
- Production: https://rancher.dbca.wa.gov.au
- Staging: https://rancher-uat.dbca.wa.gov.au

### GitHub Issues

**Automatic Integration** (via Seer):
- Errors can create GitHub issues automatically
- Link Sentry errors to GitHub issues
- Track error resolution in GitHub

## Metrics and Reporting

### Key Metrics

**Error Metrics**:
- Total errors per day/week/month
- Error rate (errors per request)
- Affected users
- New vs recurring errors
- Error resolution time

**Performance Metrics**:
- Average response time
- P95/P99 response times
- Slow query count
- Cache hit rate
- External API latency

### Reporting

**Weekly Report**:
- Top 10 errors by frequency
- Top 10 errors by user impact
- Performance trends
- New errors introduced
- Resolved errors

**Monthly Report**:
- Error trends over time
- Performance improvements
- Release health summary
- Alert response times

## Security Considerations

### Data Privacy

**PII Handling**:
- Passwords: Never sent to Sentry
- Email addresses: Sanitised from request bodies
- API keys: Removed from headers
- Session tokens: Removed from cookies

**User Context**:
- User ID: Captured (non-PII)
- Username: Captured (non-PII)
- Full name: NOT captured
- Email: NOT captured

### Access Control

**Sentry Access**:
- Configured at organisation level
- Role-based access control
- Audit logging enabled
- SSO integration (if configured)

**Data Retention**:
- Errors: 90 days
- Performance data: 30 days
- User context: Same as error retention

## References

- **Sentry Documentation**: https://docs.sentry.io/
- **Sentry Python SDK**: https://docs.sentry.io/platforms/python/
- **Sentry Django Integration**: https://docs.sentry.io/platforms/python/guides/django/
- **Seer (GitHub Integration)**: Configured at organisation level
- **Azure Rancher**: https://rancher.dbca.wa.gov.au (production), https://rancher-uat.dbca.wa.gov.au (staging)
- **Related ADRs**:
  - ADR-009: Application Logging and Monitoring
