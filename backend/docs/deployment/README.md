# Deployment Documentation

## Overview

This directory contains deployment documentation for the Science Projects Management System backend. These guides cover Kubernetes deployment, monitoring setup, and operational procedures.

## Documentation

### CI/CD Pipeline

**File**: `ci-cd.md`

Guide to the GitHub Actions CI/CD pipeline:
- Automated build and deployment workflow
- GitHub Actions configuration
- Environment-specific deployments
- Manual approval process for production
- Integration with Kubernetes
- Troubleshooting pipeline issues

**When to use**: When understanding the deployment pipeline, troubleshooting CI/CD issues, or modifying the workflow.

### Kubernetes Setup

**File**: `kubernetes-setup.md`

Comprehensive guide to the existing Azure Kubernetes Service (AKS) deployment:
- Architecture overview and deployment structure
- Kustomize configuration (base resources and environment overlays)
- Pod configuration (resources, security, volumes)
- Horizontal Pod Autoscaling (HPA)
- Ingress configuration and SSL/TLS termination
- Secrets management with Azure Key Vault
- Deployment procedures (staging and production)
- CI/CD pipeline integration
- Database connection configuration
- Static file serving strategy
- Monitoring (managed in Kubernetes/Rancher)
- Troubleshooting common issues

**When to use**: When deploying to Kubernetes, updating configuration, or troubleshooting deployment issues.

### Kustomize Configuration

**File**: `kustomize.md`

Detailed guide to Kustomize configuration management:
- Base resources and overlays structure
- Environment-specific customisation
- Resource management and limits
- ConfigMap and Secret management
- Image tag management
- Patching strategies

**When to use**: When modifying Kubernetes configuration or understanding the Kustomize structure.

### Version Management

**File**: `version-management.md`

Guide to automated version management and releases:
- Automated version update workflow
- Creating GitHub releases
- Semantic versioning guidelines
- Rollback procedures
- Troubleshooting version issues
- Monitoring version deployments
- Integration with CI/CD pipeline

**When to use**: When creating releases, updating versions, or managing deployments.

### Monitoring Setup

**File**: `monitoring-setup.md`

Guide to Azure Rancher monitoring and logging:
- Azure Rancher access (production and staging)
- Accessing and searching logs
- Correlation IDs for distributed tracing
- Structured logging patterns
- Key metrics (application and infrastructure)
- Viewing metrics in Rancher
- Alerting configuration
- Log aggregation and search
- Troubleshooting with logs
- Integration with Sentry and Application Insights

**When to use**: When monitoring production, investigating issues, or viewing logs.

## Quick Links

- **CI/CD Pipeline**: [ci-cd.md](ci-cd.md)
- **Kubernetes Deployment**: [kubernetes-setup.md](kubernetes-setup.md)
- **Kustomize Configuration**: [kustomize.md](kustomize.md)
- **Version Management**: [version-management.md](version-management.md)
- **Monitoring and Logging**: [monitoring-setup.md](monitoring-setup.md)
- **Azure Rancher (Production)**: https://rancher.dbca.wa.gov.au
- **Azure Rancher (Staging)**: https://rancher-uat.dbca.wa.gov.au
- **Organisational Kustomize Guide**: https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md

## Deployment Workflow

### Standard Deployment Process

1. **Develop and Test Locally**
   - Make code changes
   - Test locally with Docker Compose
   - Run test suite

2. **Deploy to Staging**
   - Merge to `main` branch
   - CI/CD automatically builds and deploys to staging
   - Verify functionality in staging environment

3. **Deploy to Production**
   - Manual approval in GitHub Actions
   - CI/CD deploys to production
   - Monitor rollout in Azure Rancher
   - Verify functionality in production

4. **Monitor and Verify**
   - Check Azure Rancher for pod health
   - Review logs for errors
   - Check Sentry for application errors
   - Verify user-facing functionality

### Emergency Rollback

If issues are detected after deployment:

1. **Immediate Rollback**
   ```bash
   kubectl rollout undo deployment/spms-deployment-prod -n spms-production
   ```

2. **Verify Rollback**
   - Check pod status in Rancher
   - Verify application functionality
   - Review logs for errors

3. **Investigate Issue**
   - Review deployment logs
   - Check Sentry for errors
   - Identify root cause

4. **Fix and Redeploy**
   - Fix issue in code
   - Test in staging
   - Redeploy to production

## Environment Configuration

### Staging Environment

- **Namespace**: `spms-staging`
- **Domain**: `scienceprojects-test.dbca.wa.gov.au`
- **Rancher**: https://rancher-uat.dbca.wa.gov.au
- **Min Replicas**: 1
- **Max Replicas**: 5
- **Purpose**: Pre-production testing and validation

### Production Environment

- **Namespace**: `spms-production`
- **Domain**: `scienceprojects.dbca.wa.gov.au`
- **Rancher**: https://rancher.dbca.wa.gov.au
- **Min Replicas**: 2
- **Max Replicas**: 10
- **Purpose**: Live production system
- **Secrets**: Managed via Rancher GUI (see `../security/secrets-management.md`)

## Related Documentation

- **Operations**: `../operations/` - Error tracking, disaster recovery, troubleshooting
- **Architecture**: `../architecture/` - Architectural decisions and patterns
- **Development**: `../development/` - Development setup and guidelines
- **Security**: `../security/` - Security tools and procedures

## Common Tasks

### View Pod Status
```bash
kubectl get pods -n spms-production
```

### View Logs
```bash
kubectl logs -f deployment/spms-deployment-prod -n spms-production
```

### Check Deployment Status
```bash
kubectl rollout status deployment/spms-deployment-prod -n spms-production
```

### Scale Deployment Manually
```bash
kubectl scale deployment/spms-deployment-prod --replicas=5 -n spms-production
```

### Update Image Version
Edit `kustomization.yaml` in `overlays/prod/`:
```yaml
images:
  - name: ghcr.io/dbca-wa/science-projects-service
    newTag: 3.4.13  # Update version
```

Then apply:
```bash
kubectl apply -k overlays/prod --namespace spms-production
```

## Getting Help

Can't find what you need?

1. Check [ci-cd.md](ci-cd.md) for CI/CD pipeline information
2. Check [kubernetes-setup.md](kubernetes-setup.md) for deployment procedures
3. Check [kustomize.md](kustomize.md) for configuration management
4. Check [monitoring-setup.md](monitoring-setup.md) for monitoring and logging
5. Check Azure Rancher for real-time pod status and logs
6. Check Sentry for application errors
7. Ask the team in Microsoft Teams
8. Contact OIM Infrastructure team for cluster-level issues

## External Resources

- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Kustomize Documentation**: https://kustomize.io/
- **Azure AKS Documentation**: https://docs.microsoft.com/azure/aks/
- **Organisational Kustomize Guide**: https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md
- **Organisational Docker Guide**: https://github.com/dbca-wa/developer-guidance/blob/main/Docker.md

---

**Created**: February 7, 2026  
**Purpose**: Index of deployment documentation  
**Audience**: Backend maintainer and DevOps team
