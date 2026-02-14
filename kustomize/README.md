# SPMS Kubernetes Kustomize Configuration

Declarative management of SPMS Kubernetes objects using Kustomize.

## Structure

```
kustomize/
├── base/                    # Base configuration (shared)
│   ├── deployment.yaml      # Deployment with frontend + backend containers
│   ├── service.yaml         # Service configuration
│   ├── deployment_hpa.yaml  # Horizontal Pod Autoscaler
│   └── kustomization.yaml   # Base kustomization
└── overlays/
    ├── prod/                # Production overlay
    │   ├── kustomization.yaml
    │   ├── ingress.yaml
    │   ├── deployment_patch.yaml
    │   └── ...
    └── test/                # Staging/test overlay
        ├── kustomization.yaml
        ├── ingress.yaml
        ├── deployment_patch.yaml
        └── ...
```

## Container Images

The deployment includes two containers:
- **Frontend**: `ghcr.io/dbca-wa/science-projects-frontend`
- **Backend**: `ghcr.io/dbca-wa/science-projects-backend`

Image tags are automatically updated by GitHub Actions when a new version is tagged.

## How to Use

### 1. Create Environment Files

Within an overlay directory, create a `.env` file to contain required secret values in the format `KEY=value` (e.g., `overlays/test/.env`).

**Required values:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key-here
DEBUG=False
ENVIRONMENT=production
# ... see backend/.env.example for full list
```

### 2. Review Configuration

Review the built resource output using `kustomize`:

```bash
# Review staging/test configuration
kustomize build kustomize/overlays/test/ | less

# Review production configuration
kustomize build kustomize/overlays/prod/ | less
```

### 3. Deploy to Kubernetes

Run `kubectl` with the `-k` flag to generate resources for a given overlay:

```bash
# Dry run (staging/test)
kubectl apply -k kustomize/overlays/test/ --namespace spms --dry-run=client

# Apply (staging/test)
kubectl apply -k kustomize/overlays/test/ --namespace spms

# Apply (production)
kubectl apply -k kustomize/overlays/prod/ --namespace spms
```

## Automatic Updates

When a new version is tagged (e.g., `v1.2.3`), GitHub Actions automatically:
1. Builds and pushes Docker images with the version tag
2. Updates `kustomize/overlays/prod/kustomization.yaml` with the new version
3. Updates `kustomize/overlays/test/kustomization.yaml` with the new version
4. Commits the changes using the credentials of whoever pushed the tag

This ensures Kustomize configurations always reference the latest released version.

## References

- [Kubernetes Kustomize Documentation](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)
- [Kustomize GitHub Repository](https://github.com/kubernetes-sigs/kustomize)
- [Kustomize Examples](https://github.com/kubernetes-sigs/kustomize/tree/master/examples)
