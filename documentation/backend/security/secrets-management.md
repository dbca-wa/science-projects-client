# Secrets Management

## Overview

Secrets (environment variables, API keys, database credentials) are managed through Rancher's Secrets interface. The infrastructure team manages the underlying Azure Key Vault storage, while developers manage application secrets through Rancher.

## Separation of Responsibilities

### Infrastructure Team (OIM)
- Manages Azure Key Vault storage
- Configures Kubernetes secrets integration
- Handles backup and disaster recovery of secrets
- Manages access control and permissions

### Developers (Maintainer)
- Manages application secrets through Rancher GUI
- Updates environment variables as needed
- Documents required secrets
- Rotates application-level credentials

**Important**: Developers do NOT directly access Azure Key Vault. All secret management is done through Rancher's interface.

## Managing Secrets in Rancher

### Accessing Secrets

**UAT/Staging Environment**:
1. Navigate to https://rancher-uat.dbca.wa.gov.au
2. Log in with your DBCA credentials
3. Select the appropriate cluster
4. Navigate to: **Storage** → **Secrets**
5. Find the secret: `spms-env-test`

**Production Environment**:
1. Navigate to https://rancher.dbca.wa.gov.au
2. Log in with your DBCA credentials
3. Select the appropriate cluster
4. Navigate to: **Storage** → **Secrets**
5. Find the secret: `spms-env-prod`

### Updating Secrets

**Step 1: Open Secret**
1. Click on the secret name (e.g., `spms-env-test`)
2. Click the **Edit** button (three dots menu → Edit)

**Step 2: Modify Values**
1. Update the required key-value pairs
2. Add new keys if needed
3. Remove obsolete keys if necessary

**Step 3: Save Changes**
1. Click **Save** at the bottom
2. Kubernetes will automatically update the deployment
3. Pods will restart with new environment variables

**Step 4: Verify Deployment**
1. Navigate to: **Workloads** → **Deployments**
2. Find: `spms-deployment-test` or `spms-deployment-prod`
3. Check pod status (should show "Running")
4. View logs to verify application started correctly

### Adding New Secrets

When adding a new environment variable:

**Step 1: Add to Rancher Secret**
1. Open the secret in Rancher
2. Click **Add** to create new key-value pair
3. Enter key name (e.g., `REDIS_URL`)
4. Enter value (e.g., `redis://redis-service:6379/1`)
5. Save changes

**Step 2: Update Deployment Configuration**

The deployment YAML must reference the new secret. This is typically done through Kustomize or direct YAML edit:

```yaml
env:
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        key: REDIS_URL
        name: spms-env-test
        optional: false
```

**Step 3: Apply Configuration**
1. Update the deployment YAML in your repository
2. Apply via Kustomize: `kubectl apply -k kustomize/overlays/test`
3. Or update directly in Rancher GUI

**Step 4: Verify**
1. Check pod logs for the new environment variable
2. Test application functionality that depends on the new secret

## Required Secrets

### Core Application Secrets

**DATABASE_URL** (Required):
- PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Example: `postgresql://spms_user:password@postgres-service:5432/spms_prod`

**SECRET_KEY** (Required):
- Django secret key for cryptographic signing
- Generate: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
- Must be unique per environment
- Never share between environments

**ENVIRONMENT** (Required):
- Environment identifier
- Values: `development`, `staging`, `production`
- Used for environment-specific configuration

### Email Configuration

**DEFAULT_FROM_EMAIL** (Required):
- Email address for system notifications
- Format: `SPMS <spms-noreply@dbca.wa.gov.au>`

**SPMS_MAINTAINER_EMAIL** (Required):
- Maintainer email for error notifications
- Format: `maintainer@dbca.wa.gov.au`

### External API Credentials

**IT_ASSETS_ACCESS_TOKEN** (Optional):
- Token for IT Assets API integration
- Used for user synchronisation
- Contact IT Assets team for token

**IT_ASSETS_USER** (Optional):
- Email for IT Assets API authentication
- Used with access token

**LIBRARY_API_URL** (Optional):
- URL for library system integration
- Format: `https://library.example.com/biblio/select?q=UserId:`

**LIBRARY_BEARER_TOKEN** (Optional):
- Bearer token for library API authentication

**PRINCE_SERVER_URL** (Optional):
- URL for Prince PDF generation service
- Format: `http://prince-service:9080`

### Monitoring and Error Tracking

**SENTRY_URL** (Optional):
- Sentry DSN for error tracking
- Format: `https://key@sentry.io/project`
- Configured at GitHub organisation level (Seer)

### Caching (Redis)

**REDIS_URL** (Optional):
- Redis connection string for application caching
- Format: `redis://redis-service:6379/1`
- If not provided, application uses dummy cache (graceful degradation)
- See [Redis Deployment](#redis-deployment) section below

### Other Configuration

**EXTERNAL_PASS** (Optional):
- Password for external system integration
- Contact relevant team for credentials

**TZ** (Required):
- Timezone for application
- Value: `Australia/Perth`
- Set directly in deployment YAML (not in secrets)

## Redis Deployment

### Current Status

Redis is **not currently deployed** in your Kubernetes configuration. The application is configured to use Redis if available, but gracefully degrades to a dummy cache if Redis is not present.

### Do You Need Redis?

**Yes, you should deploy Redis** because:
1. You have 1000+ users with public staff profiles
2. Redis provides DoS protection for public endpoints
3. Improves performance for authenticated user requests
4. Reduces database load significantly

### Adding Redis to Kubernetes

**Option 1: Add Redis Container to Existing Deployment (Sidecar Pattern)**

This is the simplest approach - add Redis as a sidecar container in your existing deployment.

**Step 1: Update Deployment YAML**

Add Redis container to `spec.template.spec.containers`:

```yaml
containers:
  # Existing spms-backend container
  - name: spms-backend
    # ... existing configuration ...
    env:
      # Add REDIS_URL to existing env vars
      - name: REDIS_URL
        value: "redis://127.0.0.1:6379/1"
      # ... other env vars ...

  # Existing spms-frontend container
  - name: spms-frontend
    # ... existing configuration ...

  # NEW: Add Redis container
  - name: redis
    image: redis:7-alpine
    imagePullPolicy: IfNotPresent
    resources:
      limits:
        cpu: "500m"
        memory: "512Mi"
      requests:
        cpu: "10m"
        memory: "128Mi"
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
          - ALL
      privileged: false
      readOnlyRootFilesystem: false  # Redis needs to write
      runAsNonRoot: true
      runAsUser: 999  # Redis user
    ports:
      - containerPort: 6379
        protocol: TCP
    volumeMounts:
      - mountPath: /data
        name: redis-data
    command:
      - redis-server
      - --appendonly
      - "yes"
      - --maxmemory
      - "256mb"
      - --maxmemory-policy
      - "allkeys-lru"

# Add volume for Redis data
volumes:
  # ... existing volumes ...
  - name: redis-data
    emptyDir: {}  # Ephemeral storage (cache data is not critical)
```

**Step 2: Apply Configuration**

For UAT/Staging:
```bash
# Update your kustomize configuration
# Then apply
kubectl apply -k kustomize/overlays/test
```

Or update directly in Rancher GUI:
1. Navigate to: **Workloads** → **Deployments**
2. Find: `spms-deployment-test`
3. Click **Edit** (three dots menu)
4. Add Redis container configuration
5. Save changes

**Step 3: Verify Redis is Running**

```bash
# Check pods
kubectl get pods -n spms

# Should see 3/3 containers running (backend, frontend, redis)
# Example: spms-deployment-test-xxxxx   3/3     Running

# Check Redis logs
kubectl logs -n spms spms-deployment-test-xxxxx -c redis

# Should see: "Ready to accept connections"
```

**Step 4: Verify Application Uses Redis**

```bash
# Check backend logs
kubectl logs -n spms spms-deployment-test-xxxxx -c spms-backend

# Should NOT see cache-related errors
# Application should start normally
```

**Option 2: Separate Redis Deployment (Recommended for Production)**

For production, consider a separate Redis deployment for better resource management and scaling.

**Step 1: Create Redis Deployment**

Create `redis-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-deployment
  namespace: spms
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          resources:
            limits:
              cpu: "1000m"
              memory: "1Gi"
            requests:
              cpu: "100m"
              memory: "256Mi"
          ports:
            - containerPort: 6379
          volumeMounts:
            - mountPath: /data
              name: redis-data
          command:
            - redis-server
            - --appendonly
            - "yes"
            - --maxmemory
            - "512mb"
            - --maxmemory-policy
            - "allkeys-lru"
      volumes:
        - name: redis-data
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: spms
spec:
  selector:
    app: redis
  ports:
    - protocol: TCP
      port: 6379
      targetPort: 6379
  type: ClusterIP
```

**Step 2: Apply Redis Deployment**

```bash
kubectl apply -f redis-deployment.yaml
```

**Step 3: Update SPMS Deployment**

Add `REDIS_URL` environment variable:

```yaml
env:
  - name: REDIS_URL
    value: "redis://redis-service:6379/1"
```

**Step 4: Apply SPMS Deployment**

```bash
kubectl apply -k kustomize/overlays/test
```

### Recommendation for Your Setup

**For UAT/Staging**: Use **Option 1** (sidecar pattern)
- Simpler to set up
- Good for testing
- Isolated per deployment

**For Production**: Use **Option 2** (separate deployment)
- Better resource management
- Can scale Redis independently
- Easier to monitor and maintain

### Testing Redis Integration

After deploying Redis, test that caching works:

**Step 1: Check Redis Connection**

```bash
# Access backend pod
kubectl exec -it -n spms spms-deployment-test-xxxxx -c spms-backend -- /bin/sh

# Test Redis connection
python manage.py shell

>>> from django.core.cache import cache
>>> cache.set('test_key', 'test_value', 60)
>>> cache.get('test_key')
'test_value'
>>> exit()
```

**Step 2: Monitor Cache Usage**

Check application logs for cache hits/misses (if logging is enabled).

**Step 3: Performance Testing**

Compare response times before and after Redis deployment for frequently accessed endpoints.

## Secret Rotation

### When to Rotate Secrets

**Immediately**:
- Secret exposed in logs or error messages
- Secret committed to version control
- Suspected security breach
- Employee with access leaves organisation

**Regularly**:
- SECRET_KEY: Annually
- Database passwords: Quarterly
- API tokens: Per vendor recommendations
- Service account credentials: Quarterly

### Rotation Process

**Step 1: Generate New Secret**

```bash
# For Django SECRET_KEY
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# For database passwords
# Contact infrastructure team via OIM Service Desk
```

**Step 2: Update in Rancher**

1. Open secret in Rancher
2. Update the value
3. Save changes

**Step 3: Verify Application**

1. Check pod logs for errors
2. Test application functionality
3. Monitor error tracking (Sentry)

**Step 4: Update Documentation**

1. Document rotation date
2. Update any related documentation
3. Notify team if needed

### Emergency Secret Rotation

If a secret is compromised:

**Step 1: Immediate Action**
1. Rotate the secret immediately in Rancher
2. Verify pods restart with new secret
3. Check logs for any errors

**Step 2: Assess Impact**
1. Determine what was exposed
2. Check logs for unauthorised access
3. Document the incident

**Step 3: Notify**
1. Notify infrastructure team via OIM Service Desk
2. Report to security team if needed
3. Document in incident log

**Step 4: Post-Incident**
1. Review how secret was exposed
2. Update procedures to prevent recurrence
3. Consider additional security measures

## Troubleshooting

### Secret Not Available in Pod

**Symptoms**:
- Application fails to start
- Environment variable is empty
- Error: "SECRET_KEY not set"

**Solutions**:

1. **Check secret exists in Rancher**:
   - Navigate to Storage → Secrets
   - Verify secret name matches deployment

2. **Check deployment references secret**:
   - View deployment YAML
   - Verify `secretKeyRef` name and key are correct

3. **Check pod logs**:
   ```bash
   kubectl logs -n spms spms-deployment-test-xxxxx -c spms-backend
   ```

4. **Restart pods**:
   ```bash
   kubectl rollout restart deployment/spms-deployment-test -n spms
   ```

### Secret Updated But Not Reflected

**Symptoms**:
- Updated secret in Rancher
- Application still uses old value

**Solutions**:

1. **Restart deployment**:
   ```bash
   kubectl rollout restart deployment/spms-deployment-test -n spms
   ```

2. **Verify secret was saved**:
   - Check secret in Rancher
   - Verify value is correct

3. **Check pod age**:
   ```bash
   kubectl get pods -n spms
   ```
   - Pods should be recently created after secret update

### Permission Denied

**Symptoms**:
- Cannot edit secrets in Rancher
- "Access Denied" error

**Solutions**:

1. **Check Rancher permissions**:
   - Contact infrastructure team
   - Request appropriate access level

2. **Verify correct cluster**:
   - Ensure you're in the correct cluster
   - Check namespace permissions

## Security Best Practices

### DO

- Use Rancher GUI for all secret management
- Rotate secrets regularly
- Use strong, unique values for each environment
- Document required secrets
- Test in UAT before updating production
- Monitor logs after secret changes
- Use descriptive key names

### DON'T

- Commit secrets to version control
- Share secrets between environments
- Store secrets in plain text files
- Email or message secrets
- Reuse secrets across applications
- Access Azure Key Vault directly (use Rancher)
- Update production secrets without testing in UAT

## Related Documentation

- **Disaster Recovery**: `../operations/disaster-recovery.md` - Recovery procedures
- **Error Tracking**: `../operations/error-tracking.md` - Monitoring secret-related errors
- **Kubernetes Setup**: `../deployment/kubernetes-setup.md` - Deployment configuration
- **Local Setup**: `../development/local-setup.md` - Local environment variables
- **ADR-008**: `../architecture/ADR-008-redis-application-caching.md` - Redis caching strategy

## Getting Help

**For secret management issues**:
1. Check this documentation
2. Review pod logs in Rancher
3. Contact infrastructure team via OIM Service Desk
4. Create ticket: https://dbca.freshservice.com/support/home

**For secret rotation**:
1. Follow rotation process above
2. Test in UAT first
3. Contact infrastructure team if database credentials need rotation
4. Document rotation in incident log
