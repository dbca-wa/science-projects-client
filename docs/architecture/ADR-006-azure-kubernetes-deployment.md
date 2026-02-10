# ADR-006: Azure Kubernetes Deployment

## Context

The Science Projects Management System (SPMS) backend requires a production deployment platform that provides:

- High availability and reliability for government users
- Scalability to handle varying workloads
- Integration with Azure services (PostgreSQL, Blob Storage, Application Insights)
- Automated deployments from CI/CD pipelines
- Security and compliance with government requirements
- Cost-effective operation for a single-maintainer project
- Operational simplicity and minimal maintenance overhead

The deployment platform must support:

- Container-based deployment for consistency across environments
- Horizontal scaling during peak usage
- Zero-downtime deployments
- Health monitoring and automatic recovery
- Secrets management for sensitive configuration
- Network security and access control

**Organisational Context**: The organisation uses Azure as its default cloud platform (organisational infrastructure choice), and the OIM Infrastructure team manages the underlying infrastructure.

## Decision

We will deploy the SPMS backend to Azure Kubernetes Service (AKS) using Kustomize for configuration management.

AKS provides:

- Managed Kubernetes control plane (Microsoft handles master nodes)
- Integration with Azure services (Azure AD, Key Vault, Application Insights)
- Automatic scaling and self-healing
- Rolling updates with zero downtime
- Network policies and security features
- Cost-effective for government workloads
- Organisational standard deployment platform

Kustomize provides:

- Declarative configuration management
- Environment-specific overlays (dev, staging, production)
- No templating language (pure YAML)
- Native kubectl integration
- Version-controlled infrastructure as code

## Consequences

### Positive Consequences

- **High Availability**: Kubernetes automatically restarts failed pods and reschedules on healthy nodes
- **Scalability**: Horizontal Pod Autoscaler adjusts replicas based on CPU/memory usage
- **Zero-Downtime Deployments**: Rolling updates ensure continuous availability
- **Azure Integration**: Seamless connection to Azure Database for PostgreSQL, Blob Storage, and Application Insights
- **Security**: Network policies, pod security policies, and Azure AD integration
- **Operational Simplicity**: Managed control plane reduces maintenance burden, maintainable by full-stack developer with consideration for team collaboration
- **Cost Effective**: Pay only for worker nodes, control plane is free
- **Organisational Standard**: Aligns with OIM Infrastructure team practices (organisational infrastructure choice)
- **Infrastructure as Code**: Kustomize configuration version-controlled in Git
- **Environment Parity**: Consistent deployment across dev, staging, and production
- **Monitoring**: Integration with Azure Application Insights and Kubernetes metrics

### Negative Consequences

- **Complexity**: Kubernetes has a steep learning curve for single maintainer
- **Azure Lock-in**: Tight integration with Azure services creates vendor dependency
- **Resource Overhead**: Kubernetes requires minimum resources even for small workloads
- **Debugging Difficulty**: Troubleshooting issues in Kubernetes can be challenging
- **Configuration Complexity**: Kustomize overlays require careful management

### Neutral Consequences

- **Container Requirement**: Application must be containerised (already using Docker)
- **YAML Configuration**: Extensive YAML files for Kubernetes resources
- **kubectl Dependency**: Requires kubectl CLI for deployments and debugging

## Alternatives Considered

### Azure App Service

**Description**: Platform-as-a-Service for web applications.

**Why Not Chosen**:

- Less control over deployment configuration
- Limited scaling options compared to Kubernetes
- More expensive for equivalent resources
- Less flexibility for future microservices architecture
- Not organisational standard

**Trade-offs**: App Service is simpler but less flexible and more expensive.

### Azure Container Instances (ACI)

**Description**: Serverless container deployment.

**Why Not Chosen**:

- No built-in load balancing or scaling
- No persistent storage support
- Limited networking options
- Not suitable for production web applications
- No health checks or automatic recovery

**Trade-offs**: ACI is simple but lacks production-grade features.

### Virtual Machines

**Description**: Traditional VM-based deployment.

**Why Not Chosen**:

- Manual scaling and load balancing
- Higher maintenance overhead
- Less efficient resource utilisation
- Slower deployment process
- Not organisational standard

**Trade-offs**: VMs offer maximum control but require significantly more operational effort.

### Docker Swarm

**Description**: Docker's native orchestration platform.

**Why Not Chosen**:

- Smaller ecosystem than Kubernetes
- Less mature tooling
- Not organisational standard
- Limited Azure integration
- Declining community adoption

**Trade-offs**: Docker Swarm is simpler but less powerful and not widely adopted.

## Implementation Notes

### AKS Cluster Configuration

**Cluster Details**:

- Managed by OIM Infrastructure team
- Kubernetes version: 1.27+ (LTS)
- Node pool: General Purpose (Standard_D2s_v3 or similar)
- Autoscaling: Enabled (min 2, max 10 nodes)
- Network plugin: Azure CNI
- Network policy: Calico

**Resource Quotas**:

- CPU: 500m request, 1000m limit per pod
- Memory: 512Mi request, 1Gi limit per pod
- Replicas: 2 minimum (high availability)

### Kustomize Structure

```
backend/kustomize/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── ingress.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patches/
    ├── staging/
    │   ├── kustomization.yaml
    │   └── patches/
    └── production/
        ├── kustomization.yaml
        └── patches/
```

**Base Resources** (`base/deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: spms-backend
spec:
    replicas: 2
    selector:
        matchLabels:
            app: spms-backend
    template:
        metadata:
            labels:
                app: spms-backend
        spec:
            containers:
                - name: backend
                  image: spms-backend:latest
                  ports:
                      - containerPort: 8000
                  env:
                      - name: DJANGO_SETTINGS_MODULE
                        value: config.settings
                  resources:
                      requests:
                          cpu: 500m
                          memory: 512Mi
                      limits:
                          cpu: 1000m
                          memory: 1Gi
                  livenessProbe:
                      httpGet:
                          path: /
                          port: 8000
                      initialDelaySeconds: 30
                      periodSeconds: 10
                  readinessProbe:
                      httpGet:
                          path: /
                          port: 8000
                      initialDelaySeconds: 10
                      periodSeconds: 5
```

### Deployment Process

**Manual Deployment**:

```bash
# Deploy to development
kubectl apply -k kustomize/overlays/dev

# Deploy to staging
kubectl apply -k kustomize/overlays/staging

# Deploy to production
kubectl apply -k kustomize/overlays/production
```

Note that it is recommended that deployment be handled via Rancher GUI.

### Scaling Configuration

**Horizontal Pod Autoscaler**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: spms-backend-hpa
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: spms-backend
    minReplicas: 2
    maxReplicas: 10
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 70
```

### Disaster Recovery

- Deployment configuration in Git (infrastructure as code)
- Database backups managed by Azure (see ADR-003)
- Stateless application design (no local state)
- Quick redeployment from Git repository

### Migration Strategy

- Initial deployment to AKS completed
- Kustomize configuration established
- CI/CD pipeline integrated
- No migration needed (greenfield project)

### Rollback Plan

**Kubernetes Rollback**:

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/spms-backend

# Rollback to specific revision
kubectl rollout undo deployment/spms-backend --to-revision=2
```

Note, it is recommended that rollbacks be performed via Rancher GUI.

**Complete Rollback**:
If AKS proves inadequate:

1. Application is containerised (portable)
2. Can deploy to alternative platforms (App Service, VMs)
3. Database and storage are independent of AKS
4. Minimal application changes required

## References

- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [DBCA Kustomize Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Kustomize.md)
- [DBCA Rancher Guide](https://github.com/dbca-wa/developer-guidance/blob/main/Rancher.md)
- [Azure Key Vault Integration](https://docs.microsoft.com/en-us/azure/aks/csi-secrets-store-driver)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-003: PostgreSQL Database Choice
    - ADR-009: Application Logging and Monitoring
    - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
