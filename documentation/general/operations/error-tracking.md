# Error Tracking

**Applies to**: Both (Frontend and Backend)

## Overview

Error tracking for the Science Projects Management System (SPMS) uses Sentry to capture, track, and monitor errors across both frontend and backend components. This provides real-time visibility into application errors and performance issues.

## Sentry Configuration

### Organisation

**Organisation**: DBCA
**Projects**:
- `spms-frontend` - React application monitoring
- `spms-backend` - Django application monitoring

### Access

Access to Sentry is managed by DBCA IT. Contact the IT Service Desk to request access.

## Frontend Error Tracking

### React Router v7 Integration

The frontend uses Sentry's React Router v7 integration for automatic error tracking and performance monitoring.

**Key features**:
- Automatic error capture for unhandled exceptions
- React error boundaries integration
- Route change tracking
- Performance monitoring
- Session replay for debugging

### Implementation

#### 1. Sentry Initialisation

Location: `frontend/src/app/sentry.ts`

```typescript
import * as Sentry from "@sentry/react";
import {
  useEffect,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router";

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn("Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || "development",

    integrations: [
      // React Router v7 browser tracing integration
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),

      // Session replay for debugging
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session replay sampling
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Configuration options**:
- `dsn`: Sentry project DSN (from environment variable)
- `environment`: Environment name (development, staging, production)
- `tracesSampleRate`: Percentage of transactions to track (10% in production, 100% in development)
- `replaysSessionSampleRate`: Percentage of sessions to replay (10%)
- `replaysOnErrorSampleRate`: Percentage of error sessions to replay (100%)

#### 2. Router Wrapping

Location: `frontend/src/app/router/index.tsx`

```typescript
import * as Sentry from "@sentry/react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  // ... routes
]);

// Wrap router with Sentry for React Router v7 integration
export const sentryWrappedRouter = Sentry.wrapCreateBrowserRouterV7(router);
```

**What this does**:
- Automatically tracks route changes
- Captures navigation performance
- Associates errors with specific routes
- Provides route context in error reports

#### 3. Custom Error Boundary

Location: `frontend/src/shared/components/ErrorBoundary.tsx`

```typescript
import * as Sentry from "@sentry/react";
import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture error with Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              We've been notified and are working on a fix.
            </p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**What this does**:
- Catches React component errors
- Reports errors to Sentry with component stack
- Shows user-friendly error message
- Provides reload button for recovery

#### 4. Main Entry Point Integration

Location: `frontend/src/main.tsx`

```typescript
import { initSentry } from "./app/sentry";
import { sentryWrappedRouter } from "./app/router";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

// Initialise Sentry before React
initSentry();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <RouterProvider router={sentryWrappedRouter} />
  </ErrorBoundary>
);
```

**Initialisation order**:
1. Sentry initialised first (before React)
2. Error boundary wraps entire application
3. Sentry-wrapped router used for routing

### Environment Variables

Add to `frontend/.env`:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENVIRONMENT=development
```

**Environment-specific DSNs**:
- Development: Optional (errors logged to console)
- Staging/Test: Staging project DSN
- Production: Production project DSN

### What Gets Tracked

**Errors**:
- Unhandled JavaScript exceptions
- React component errors
- Promise rejections
- Network errors (via axios interceptors)

**Performance**:
- Page load times
- Route change duration
- API request latency
- Component render times

**User Context**:
- User ID (when authenticated)
- User email (when authenticated)
- Browser information
- Device information

### Session Replay

Session replay captures user interactions leading up to an error:

**What's captured**:
- DOM mutations
- User interactions (clicks, scrolls)
- Network requests
- Console logs

**Privacy**:
- All text is masked by default
- All media is blocked by default
- No sensitive data is captured

## Backend Error Tracking

### Django Integration

The backend uses Sentry's Django integration for automatic error tracking.

**Location**: `backend/config/settings/production.py`

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    environment=os.environ.get("ENVIRONMENT", "production"),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=False,
)
```

**Configuration options**:
- `dsn`: Sentry project DSN (from environment variable)
- `environment`: Environment name (development, staging, production)
- `traces_sample_rate`: Percentage of transactions to track (10%)
- `send_default_pii`: Whether to send personally identifiable information (False for privacy)

### What Gets Tracked

**Errors**:
- Unhandled Python exceptions
- Django view errors
- Database errors
- Celery task errors (if applicable)

**Performance**:
- Request/response times
- Database query performance
- API endpoint latency

**Context**:
- Request data (headers, method, URL)
- User information (when authenticated)
- Server information

### Environment Variables

Add to `backend/.env`:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENVIRONMENT=production
```

## Rancher Monitoring (Backend Only)

**Applies to**: Backend only

Rancher provides container-level monitoring for the backend:

**What's monitored**:
- Container health
- Resource usage (CPU, memory)
- Pod restarts
- Network traffic

**Access**: Via Rancher web interface (managed by OIM)

## Monitoring Dashboards

### Sentry Dashboards

**Frontend Dashboard**:
- Error trends
- Performance metrics
- User sessions
- Browser distribution
- Route performance

**Backend Dashboard**:
- Error trends
- API performance
- Database performance
- User activity
- Endpoint latency

### Alert Configuration

**Critical Alerts**:
- Error rate > 5% over 5 minutes
- Response time > 2 seconds (p95)
- Database connection failures

**Warning Alerts**:
- Error rate > 2% over 15 minutes
- Response time > 1 second (p95)
- Memory usage > 80%

**Alert Channels**:
- GitHub Actions email notifications
- Team contact: `ecoinformatics.admin@dbca.wa.gov.au`

## Troubleshooting

### Frontend Issues

**Issue**: Sentry not capturing errors

**Solution**:
1. Verify `VITE_SENTRY_DSN` is set
2. Check browser console for Sentry initialisation messages
3. Verify error boundary is wrapping application
4. Check Sentry project settings

**Issue**: Too many errors being captured

**Solution**:
1. Add error filtering in `beforeSend` hook
2. Increase `tracesSampleRate` threshold
3. Add error grouping rules in Sentry

### Backend Issues

**Issue**: Sentry not capturing errors

**Solution**:
1. Verify `SENTRY_DSN` environment variable is set
2. Check Django logs for Sentry initialisation
3. Verify Sentry integration is enabled
4. Check Sentry project settings

**Issue**: Performance impact

**Solution**:
1. Reduce `traces_sample_rate`
2. Disable session replay
3. Add performance filtering

## Best Practices

### Frontend

1. **Initialise early** - Call `initSentry()` before React renders
2. **Use error boundaries** - Wrap application with ErrorBoundary
3. **Add user context** - Include user ID and email in Sentry
4. **Filter sensitive data** - Use `beforeSend` to filter sensitive information
5. **Test in development** - Verify Sentry integration in development environment

### Backend

1. **Configure environment** - Set correct environment name
2. **Filter sensitive data** - Disable `send_default_pii` for privacy
3. **Monitor performance** - Use Sentry performance monitoring
4. **Set up alerts** - Configure alerts for critical errors
5. **Review regularly** - Review Sentry dashboard weekly

### General

1. **Review alerts weekly** - Adjust thresholds as needed
2. **Investigate trends** - Look for patterns in errors
3. **Document incidents** - Create postmortems for major issues
4. **Update runbooks** - Keep troubleshooting guides current
5. **Test monitoring** - Verify alerts fire correctly

## Related Documentation

- [Monitoring](./monitoring.md) - Overall monitoring strategy
- [Disaster Recovery](./disaster-recovery.md) - Recovery procedures
- [CI/CD Overview](../deployment/ci-cd-overview.md) - Deployment pipeline

## External Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry React Router v7](https://docs.sentry.io/platforms/javascript/guides/react/features/react-router/)
- [Sentry Django](https://docs.sentry.io/platforms/python/guides/django/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
