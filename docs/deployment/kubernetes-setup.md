# Kubernetes Deployment Guide

## Overview

The SPMS is deployed on Azure Kubernetes Service (AKS) using Kustomize for configuration management.

**Key Technologies**:
- **Azure Kubernetes Service (AKS)**: Managed Kubernetes cluster
- **Kustomize**: Declarative configuration management
- **Docker**: Container images
- **GitHub Container Registry**: Image storage
- **Rancher**: Secrets management (infrastructure team manages Azure Key Vault backend)

## Architecture

### Deployment Structure

```
Azure Kubernetes Service
├── Namespace: spms-production / spms-staging
├── Pod (spms-deployment)
│   ├── Backend (Django) - Port 8000
│   └── Frontend (React + Nginx) - Port 8080
├── Service (ClusterIP) - Port 80
├── Ingress (SSL/TLS termination)
└── HorizontalPodAutoscaler (Min: 2, Max: 10)

External Services:
- Azure Database for PostgreSQL
- Azure Blob Storage (media files)
- Secrets via Rancher (backend: Azure Key Vault)
```

### Container Images

**Backend**: `ghcr.io/dbca-wa/science-projects-service`
**Frontend**: `ghcr.io/dbca-wa/science-projects-client`

## Kustomize Structure

```
backend/kustomize/
├── base/                    # Shared resources
│   ├── deployment.yaml
│   ├── deployment_hpa.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── prod/               # Production config
    └── test/               # Staging config
```

### Environment Overlays

**Production**:
- Domain: `scienceprojects.dbca.wa.gov.au`
- Min replicas: 2, Max: 10
- Higher resource limits

**Staging**:
- Domain: `scienceprojects-test.dbca.wa.gov.au`
- Min replicas: 1, Max: 5
- Lower resource limits

## Deployment Configuration

### Resource Limits

**Backend**:
```yaml
resources:
  requests:
    memory: '200Mi'
    cpu: '5m'
  limits:
    memory: '2Gi'
    cpu: '1000m'
```

**Frontend**:
```yaml
resources:
  requests:
    memory: '64Mi'
    cpu: '5m'
  limits:
    memory: '1Gi'
    cpu: '1000m'
```

### Horizontal Pod Autoscaling

- Scales based on CPU utilisation (target: 80%)
- Scales up when CPU > 80% for 3 minutes
- Scales down when CPU < 80% for 5 minutes
- Max scale-up: 2 pods/minute
- Max scale-down: 1 pod/minute

## Secrets Management

### Rancher Secrets Management

**Developer Interface**: Secrets managed via Rancher GUI (see `../security/secrets-management.md`)

**Secret Types**:
- `DATABASE_URL`: PostgreSQL connection
- `SECRET_KEY`: Django secret key
- `SENTRY_URL`: Sentry DSN
- `REDIS_URL`: Redis connection (optional)
- External API tokens

**Security**:
- Never commit `.env` files
- Rotate secrets quarterly via Rancher
- Separate secrets per environment

## Deployment Procedures

### Prerequisites

**Tools**:
- `kubectl`: Kubernetes CLI
- `kustomize`: Configuration tool
- Access to AKS cluster

**Access**:
- AKS cluster access (RBAC role)
- Namespace permissions
- Rancher access (for secrets)

### Deploying to Staging

```bash
cd kustomize/overlays/test

# Preview changes
kustomize build . | less

# Dry run
kubectl apply -k . --namespace spms-staging --dry-run=client

# Apply
kubectl apply -k . --namespace spms-staging

# Watch rollout
kubectl rollout status deployment/spms-deployment-test -n spms-staging

# Verify
kubectl get pods -n spms-staging
```

### Deploying to Production

**Automated Version Update** (Recommended):

1. Create GitHub release:
```bash
git tag v3.4.13
git push origin v3.4.13
gh release create v3.4.13 --title "Release 3.4.13" --notes "Release notes"
```

2. GitHub Actions automatically:
   - Creates PR updating kustomization.yaml
   - You review and merge PR
   - Staging automatically deploys

3. Verithen manually approve production deployment

**Manual Update** (if needed):
```bash
cd kustomize/overlays/prod

# Update kustomization.yaml with new version
# Then apply
kubectl apply -k . --namespace spms-production
kubectl rollout status deployment/spms-deployment-prod -n spms-production
```

### Rolling Back

```bash
# Quick rollback
kubectl rollout undo deployment/spms-deployment-prod -n spms-production

# Rollback to specific revision
kubectl rollout undo deploymen-to-revision=2
```

## CI/CD Pipeline

### Test Workflow

**Trigger**: Pull requests and pushes to `main`/`develop`

**Steps**:
1. Run test suite across 4 shards (parallel execution)
2. Combine coverage from all shards
3. Generate coverage report
4. Update README badge (on `main` only)

### Version Update Workflow

**Trigger**: GitHub release published or manual dispatch

**Steps**:
1. Extract version from release tag
2. Update kustomization.yaml files
3. Create PR with version updates
4. Merge PR triggers staging deployment
5. Production requires manual approval

## Monitoring

### Probes

Probes configured in Kubernetes/Rancher:
- **Liveness**: Restart pod if unhealthy
- **Readiness**: Remove from service if not ready
- Configuration managed at infrastructure level

### Monitoring Tools

**Azure Rancher** (Primary):
- Access via https://rancher.dbca.wa.gov.au
- View pod status and logs
- Monitor resource usage
- Developers use Rancher GUI (not kubectl)

**Sentry**: Application error tracking
**Application Ins: Request telemetry

## Best Practices

### Deployment

**DO**:
- Test in staging first
- Use dry-run before applying
- Monitor rollout status
- Keep specific image tags (not `latest`)

**DON'T**:
- Deploy to production without staging
- Use `latest` tag in production
- Skip dry-run validation
- Deploy during peak hours without planning

### Configuration

**DO**:
- Use Kustomize for all configuration
- Version control all manifests
- Use environment-specific overlays

**DON'T**:
- Hardcode secrets in manifests
- Commit `.env` files
- Modify resources with `kubectl edit`

### Security

**DO**:
- Run containers as non-root
- Use read-only root filesystem
- Drop all capabilities
- Rotate secrets regularly

**DON'T**:
- Run privileged containers
- Allow privilege escalation
- Expose unnecessary ports

## References

- **Organisational Kustomize Guide**: https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md
- **Kubernetes Documentaps://kubernetes.io/docs/
- **Azure Rancher**: See `monitoring-setup.md`
