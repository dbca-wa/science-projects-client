# Kubernetes Deployment Overview

This document describes the Kubernetes deployment configuration for the Science Projects Management System (SPMS).

For general Kustomize concepts and patterns, see the [DBCA Kustomize Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md).

This document focuses on SPMS-specific configuration and deployment processes.

## Kustomize Configuration

SPMS uses Kustomize for declarative Kubernetes deployments. The configuration is located in `kustomize/`.

### Directory Structure

```
kustomize/
├── base/                    # Base resources
│   ├── deployment.yaml      # Combined frontend + backend pod
│   ├── deployment_hpa.yaml  # Horizontal Pod Autoscaler
│   ├── service.yaml         # ClusterIP service
│   └── kustomization.yaml
└── overlays/
    ├── test/                # Test/staging environment
    │   ├── kustomization.yaml
    │   ├── ingress.yaml
    │   ├── deployment_patch.yaml
    │   ├── deployment_hpa_patch.yaml
    │   ├── service_patch.yaml
    │   ├── media_pvc.yaml
    │   └── pdb.yaml
    └── prod/                # Production environment
        ├── kustomization.yaml
        ├── ingress.yaml
        ├── deployment_patch.yaml
        ├── deployment_hpa_patch.yaml
        ├── service_patch.yaml
        ├── media_pvc.yaml
        └── pdb.yaml
```

### Key Configuration Files

View the actual configuration files:
- Base resources: [`kustomize/base/kustomization.yaml`](../../../kustomize/base/kustomization.yaml)
- Test overlay: [`kustomize/overlays/test/kustomization.yaml`](../../../kustomize/overlays/test/kustomization.yaml)
- Production overlay: [`kustomize/overlays/prod/kustomization.yaml`](../../../kustomize/overlays/prod/kustomization.yaml)

### SPMS-Specific Configuration

**Combined Pod Architecture**: SPMS uses a single pod with two containers (frontend + backend) for simplified deployment.

**Pod structure:**
```
spms-deployment-{prod|test}
├── spms-backend container (Django + Gunicorn)
│   ├── Port: 8000
│   ├── Image: ghcr.io/dbca-wa/science-projects-backend
│   └── Resources: 200Mi-2Gi memory, 5m-1000m CPU
└── spms-frontend container (React + Bun)
    ├── Port: 3000
    ├── Image: ghcr.io/dbca-wa/science-projects-frontend
    └── Resources: 64Mi-1Gi memory, 5m-1000m CPU
```

**Image Configuration**: Both overlays reference the same images:
- `ghcr.io/dbca-wa/science-projects-backend`
- `ghcr.io/dbca-wa/science-projects-frontend`

Image tags are managed automatically via GitHub Actions (see Automated Version Management below).

**Secrets**: Both overlays use a `secretGenerator` to create secrets from a `.env` file (not committed to Git).

## Automated Version Management

When a new version is tagged (e.g., `v3.4.13`), the GitHub Actions workflow automatically updates the kustomize configurations.

### Workflow Process

1. **Tag pushed**: Developer pushes a version tag (e.g., `v3.4.13`)
2. **Build images**: GitHub Actions builds and pushes Docker images with the version tag
3. **Update kustomize**: The `update-kustomize` job updates both overlay configurations
4. **Commit changes**: Changes are committed directly to the main branch with `[skip ci]`

### Implementation Details

The workflow uses `sed` to update image tags in both overlay files:

```bash
# From .github/workflows/deploy-prod.yml
sed -i "s|newTag: .*|newTag: ${VERSION}|g" kustomize/overlays/prod/kustomization.yaml
sed -i "s|newTag: .*|newTag: ${VERSION}|g" kustomize/overlays/test/kustomization.yaml
```

This updates the `images` section in both `kustomization.yaml` files:

```yaml
images:
  - name: ghcr.io/dbca-wa/science-projects-backend
    newTag: v3.4.13  # Updated automatically
  - name: ghcr.io/dbca-wa/science-projects-frontend
    newTag: v3.4.13  # Updated automatically
```

### Why Both Overlays?

Both test and production overlays are updated simultaneously to ensure:
- Test environment uses the same version as production (after deployment)
- Version consistency across environments
- Simplified rollback process

See the complete workflow: [`.github/workflows/deploy-prod.yml`](../../../.github/workflows/deploy-prod.yml)

## Deployment Process

For general Kustomize deployment patterns, see the [DBCA Kustomize Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md).

### SPMS-Specific Deployment

**Review configuration before applying**:
```bash
kubectl kustomize kustomize/overlays/test/
kubectl kustomize kustomize/overlays/prod/
```

**Apply configuration**:
```bash
# Test environment
kubectl apply -k kustomize/overlays/test/

# Production environment
kubectl apply -k kustomize/overlays/prod/
```

**Note**: Namespace and cluster context must be configured before deployment. Contact OIM Infrastructure for access.

### Deployment Verification

After deployment, verify the rollout:
```bash
# Check deployment status
kubectl rollout status deployment/spms-deployment-test
kubectl rollout status deployment/spms-deployment-prod

# View pods
kubectl get pods -l app=spms-deployment

# View logs
kubectl logs -f deployment/spms-deployment-test -c spms-backend
kubectl logs -f deployment/spms-deployment-test -c spms-frontend
```

## Secrets Management

SPMS uses Kustomize's `secretGenerator` to manage secrets. See [Environment Strategy](./environment-strategy.md) for complete details on environment variables and secret management.

### Kustomize Secret Configuration

Both overlays use a `secretGenerator` in their `kustomization.yaml`:

```yaml
secretGenerator:
  - name: spms-env
    type: Opaque
    envs:
      - .env
```

The `.env` file (not committed to Git) contains environment-specific secrets. See the Environment Strategy document for:
- Required environment variables
- Secret management process
- GitHub Secrets configuration
- Runtime secret injection

### Local Development

For local Kustomize testing, create a `.env` file in the overlay directory:

```bash
# Example structure only - see environment-strategy.md for complete list
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key
ENVIRONMENT=production
```

**Important**: Never commit `.env` files. They are in `.gitignore`.

## Troubleshooting

For general Kubernetes troubleshooting, see the [DBCA Kustomize Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md).

### SPMS-Specific Issues

**Image pull errors**:
- Verify image tags in `kustomize/overlays/{test|prod}/kustomization.yaml`
- Check that images exist in GitHub Container Registry: https://github.com/orgs/dbca-wa/packages
- Verify GitHub Actions workflow completed successfully

**Secret errors**:
- Verify `.env` file exists in overlay directory (for local testing)
- Check `secretGenerator` configuration in `kustomization.yaml`
- Ensure all required environment variables are present (see environment-strategy.md)

**Combined pod issues**:
- Check both containers: `kubectl logs <pod> -c spms-backend` and `kubectl logs <pod> -c spms-frontend`
- Verify both containers are running: `kubectl describe pod <pod>`
- Check resource limits if pods are being evicted

**Version mismatch**:
- Verify both overlays have the same image tags
- Check GitHub Actions workflow logs for update failures
- Manually update tags if automated update failed

## Related Documentation

- [DBCA Kustomize Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md) - Authoritative source for Kustomize patterns
- [CI/CD Overview](./ci-cd-overview.md) - GitHub Actions workflows
- [Docker Overview](./docker-overview.md) - Container image build process
- [Environment Strategy](./environment-strategy.md) - Environment configuration

## External Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
