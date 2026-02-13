# Kustomize Deployment Guide

Understanding Kubernetes deployment using Kustomize.

Related Documentation: [Kubernetes Setup](kubernetes-setup.md), [CI/CD](ci-cd.md)

## Overview

The SPMS backend uses Kustomize for Kubernetes deployment configuration. Kustomize allows environment-specific customisation without duplicating configuration files.

## Organisational Guide

For comprehensive Kustomize documentation and best practices, see the DBCA developer guidance:

**https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md**

This guide covers:
- Kustomize fundamentals
- DBCA-specific patterns
- Best practices
- Common pitfalls

## Directory Structure

```
backend/kustomize/
├── base/                  # Base configuration
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── deployment_hpa.yaml
│   └── service.yaml
└── overlays/              # Environment-specific
    ├── test/              # Test environment
    │   ├── kustomization.yaml
    │   ├── deployment_patch.yaml
    │   ├── deployment_hpa_patch.yaml
    │   ├── service_patch.yaml
    │   ├── ingress.yaml
    │   ├── media_pvc.yaml
    │   └── pdb.yaml
    └── prod/              # Production environment
        ├── kustomization.yaml
        ├── deployment_patch.yaml
        ├── deployment_hpa_patch.yaml
        ├── service_patch.yaml
        ├── ingress.yaml
        ├── media_pvc.yaml
        └── pdb.yaml
```

## Base Configuration

### kustomization.yaml

Defines base resources:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - deployment_hpa.yaml
  - service.yaml
```

### deployment.yaml

The base deployment includes both backend and frontend containers:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spms-deployment
spec:
  strategy:
    type: RollingUpdate
  template:
    spec:
      containers:
        - name: spms-backend
          image: ghcr.io/dbca-wa/science-projects-service
          imagePullPolicy: Always
          env:
            - name: TZ
              value: 'Australia/Perth'
          resources:
            requests:
              memory: '200Mi'
              cpu: '5m'
            limits:
              memory: '2Gi'
              cpu: '1000m'
          securityContext:
            runAsNonRoot: true
            privileged: false
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
            readOnlyRootFilesystem: true
          volumeMounts:
            - mountPath: /tmp
              name: tmpfs-ram-backend
        - name: spms-frontend
          image: ghcr.io/dbca-wa/science-projects-client
          imagePullPolicy: Always
          # ... (similar configuration)
      volumes:
        - name: tmpfs-ram-backend
          emptyDir:
            medium: 'Memory'
        - name: tmpfs-ram-frontend
          emptyDir:
            medium: 'Memory'
      restartPolicy: Always
      terminationGracePeriodSeconds: 180
      automountServiceAccountToken: false
```

**Key features:**
- Both backend and frontend containers in one pod
- Security context with non-root user
- Read-only root filesystem
- tmpfs volumes for temporary files
- Resource requests and limits

## Environment Overlays

### Test Environment

**Location**: `overlays/test/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
nameSuffix: -test
secretGenerator:
  - name: spms-env
    type: Opaque
    envs:
      - .env
configMapGenerator:
  - name: prince2-license
    files:
      - license.dat
generatorOptions:
  disableNameSuffixHash: true
resources:
  - ../../base
  - ingress.yaml
  - media_pvc.yaml
  - pdb.yaml
labels:
  - includeSelectors: true
    pairs:
      variant: test
patches:
  - path: deployment_patch.yaml
  - path: deployment_hpa_patch.yaml
  - path: service_patch.yaml
images:
  - name: ghcr.io/dbca-wa/science-projects-service
    newTag: 3.4.12
  - name: ghcr.io/dbca-wa/science-projects-client
    newTag: 3.4.12
```

### Production Environment

**Location**: `overlays/prod/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
nameSuffix: -prod
secretGenerator:
  - name: spms-env
    type: Opaque
    envs:
      - .env
configMapGenerator:
  - name: prince2-license
    files:
      - license.dat
generatorOptions:
  disableNameSuffixHash: true
resources:
  - ../../base
  - ingress.yaml
  - media_pvc.yaml
  - pdb.yaml
labels:
  - includeSelectors: true
    pairs:
      variant: prod
patches:
  - path: deployment_patch.yaml
  - path: deployment_hpa_patch.yaml
  - path: service_patch.yaml
images:
  - name: ghcr.io/dbca-wa/science-projects-service
    newTag: 3.4.12
  - name: ghcr.io/dbca-wa/science-projects-client
    newTag: 3.4.12
```

**Key features:**
- `nameSuffix` adds environment suffix to resource names
- `secretGenerator` creates secrets from `.env` file
- `configMapGenerator` creates ConfigMap from `license.dat` file
- `labels` adds variant label to all resources
- `patches` apply environment-specific modifications
- `images` specifies container image tags

## Secrets Management

### Creating .env File

Within an overlay directory, create a `.env` file with required secret values:

**Location**: `overlays/prod/.env` or `overlays/test/.env`

**Required values:**
```bash
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-django-secret-key
IT_ASSETS_ACCESS_TOKEN=your-token
LIBRARY_BEARER_TOKEN=your-token
# ... other secrets
```

**Important:**
- `.env` files are NOT committed to Git (in `.gitignore`)
- Secrets are generated by Kustomize from `.env` file
- `disableNameSuffixHash: true` keeps secret names predictable

### License File

The Prince XML license file is also managed via ConfigMap:

**Location**: `overlays/prod/license.dat` or `overlays/test/license.dat`

This file is also NOT committed to Git.

## Deployment Process

### Review Configuration

Before applying, review the generated configuration:

```bash
# View generated YAML
kustomize build kustomize/overlays/prod/ | less

# Or using kubectl
kubectl kustomize kustomize/overlays/prod/ | less
```

### Apply Configuration

```bash
# Test environment
kubectl apply -k kustomize/overlays/test --namespace spms

# Production environment
kubectl apply -k kustomize/overlays/prod --namespace spms

# Dry run first (recommended)
kubectl apply -k kustomize/overlays/prod --namespace spms --dry-run=client
```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployments -n spms

# Check pods
kubectl get pods -n spms

# Check services
kubectl get services -n spms

# View logs (backend)
kubectl logs -f deployment/spms-deployment-prod -c spms-backend -n spms

# View logs (frontend)
kubectl logs -f deployment/spms-deployment-prod -c spms-frontend -n spms
```

## Common Operations

### Update Image Tags

Edit the `kustomization.yaml` file in the overlay:

```yaml
images:
  - name: ghcr.io/dbca-wa/science-projects-service
    newTag: 3.5.0  # Update version
  - name: ghcr.io/dbca-wa/science-projects-client
    newTag: 3.5.0  # Update version
```

Then apply:

```bash
kubectl apply -k kustomize/overlays/prod --namespace spms
```

### Update Secrets

1. Edit the `.env` file in the overlay directory
2. Apply the configuration (Kustomize will regenerate the secret)
3. Restart the deployment to pick up new secrets:

```bash
kubectl rollout restart deployment/spms-deployment-prod -n spms
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/spms-deployment-prod -n spms

# Rollback to previous version
kubectl rollout undo deployment/spms-deployment-prod -n spms

# Rollback to specific revision
kubectl rollout undo deployment/spms-deployment-prod --to-revision=2 -n spms
```

## Troubleshooting

### Issue: Pods not starting

**Check pod status:**
```bash
kubectl get pods -n spms
kubectl describe pod <pod-name> -n spms
```

**Common causes:**
- Image pull errors (check image tag)
- Missing secrets (check `.env` file exists)
- Resource limits
- Configuration errors

### Issue: Secret not found

**Cause:** `.env` file missing or not in correct location.

**Solution:**
1. Create `.env` file in overlay directory (`overlays/prod/.env`)
2. Add required secret values
3. Apply configuration again

### Issue: License file not found

**Cause:** `license.dat` file missing.

**Solution:**
1. Obtain Prince XML license file
2. Place in overlay directory (`overlays/prod/license.dat`)
3. Apply configuration again

### Issue: Configuration not updating

**Cause:** ConfigMap/Secret changes don't trigger pod restart.

**Solution:**
```bash
# Restart deployment
kubectl rollout restart deployment/spms-deployment-prod -n spms
```

## Best Practices

### Version Control

**Do commit:**
- Base configuration
- Overlay kustomization files
- Patches
- README files

**Don't commit:**
- `.env` files (secrets)
- `license.dat` files
- Generated manifests

### Environment Management

**Test environment:**
- Used for testing before production
- Can use same or different image tags
- Separate namespace recommended

**Production environment:**
- Stable, tested image tags
- All secrets properly configured
- Monitoring and alerts enabled

## Resources

- **Kustomize Documentation:** https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
- **Kustomize GitHub:** https://github.com/kubernetes-sigs/kustomize
- **DBCA Developer Guidance:** https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md

## Related Documentation

- [Kubernetes Setup](kubernetes-setup.md) - Kubernetes cluster configuration
- [CI/CD](ci-cd.md) - Automated deployment pipeline
- [Monitoring Setup](monitoring-setup.md) - Application monitoring
