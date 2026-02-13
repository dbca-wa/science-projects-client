# ADR-007: No Application-Level Nginx

## Context

Many Django applications deploy Nginx as a reverse proxy in front of the application server (Gunicorn) to handle HTTP caching, SSL/TLS termination, static file serving, request buffering, load balancing, and compression.

However, SPMS operates within organisational infrastructure that already provides these capabilities:

**Organisational Infrastructure** (managed by OIM Infrastructure team):
- **Kubernetes Ingress**: Nginx Ingress Controller in AKS cluster handles SSL/TLS termination and load balancing
- **Edge Proxy**: Network-level Nginx/Varnish/Fastly for HTTP caching and CDN
- **Azure Blob Storage**: Serves static files (not application server)

**Application Characteristics**:
- Primarily serves authenticated API requests (not HTTP-cacheable)
- Static files served from Azure Blob Storage
- POST/PUT/DELETE operations (not cacheable)
- User-specific responses (require application-level caching via Redis)

The question is whether to add application-level Nginx despite existing infrastructure.

## Decision

We will NOT deploy application-level Nginx. The application runs Gunicorn directly behind the Kubernetes Ingress Controller.

**Rationale**:
1. **Redundant**: Edge proxy and Kubernetes Ingress already handle HTTP caching, SSL/TLS, and load balancing
2. **Authenticated APIs**: Most requests are user-specific and not HTTP-cacheable
3. **Static Files External**: Azure Blob Storage serves static files
4. **Operational Simplicity**: Fewer components to configure and maintain (single maintainer philosophy)
5. **Application-Level Caching**: Redis provides caching for user-specific data (see ADR-008)

**Architecture**:
```
Internet → Edge Proxy → AKS Ingress (Nginx) → Gunicorn → Django
```

## Consequences

### Positive Consequences

- **Operational Simplicity**: Fewer components to configure and maintain (single maintainer philosophy)
- **Faster Deployments**: Simpler container images
- **Clearer Architecture**: Separation of concerns (infrastructure vs application)
- **Easier Debugging**: Fewer layers to troubleshoot
- **Organisational Alignment**: Leverages existing infrastructure patterns

### Negative Consequences

- **No Application-Level HTTP Caching**: Cannot cache at application level (not needed for authenticated APIs)
- **Dependency on Infrastructure**: Relies on infrastructure team for HTTP caching
- **No Request Buffering**: Gunicorn handles slow clients directly (minor performance impact)

### Neutral Consequences

- **Different from Common Pattern**: Many Django apps use Nginx, we don't
- **Two-Tier Caching**: HTTP caching (edge) + Application caching (Redis)

## Alternatives Considered

### Application-Level Nginx

**Description**: Deploy Nginx in application container as reverse proxy to Gunicorn.

**Why Not Chosen**:
- Redundant with edge proxy and Kubernetes Ingress
- Adds configuration complexity and container image size
- HTTP caching ineffective for authenticated APIs
- Infrastructure team already manages HTTP caching

**Trade-offs**: Application-level Nginx offers more control but adds unnecessary complexity for our use case.

### Nginx Sidecar Container

**Description**: Run Nginx as sidecar container in Kubernetes pod.

**Why Not Chosen**:
- Same redundancy issues as application-level Nginx
- Increases pod resource usage
- No significant benefits over direct Gunicorn

**Trade-offs**: Sidecar pattern is cleaner than in-container Nginx but still redundant.

## Implementation Notes

### Deployment Architecture

**Request Flow**:
```
User Request → Edge Proxy (HTTP caching) → AKS Ingress (SSL/TLS, load balancing) → Gunicorn → Django (Redis caching)
```

### Gunicorn Configuration

**gunicorn.conf.py**:
```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 30
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

### Kubernetes Deployment

Gunicorn runs directly in application container, exposed via ClusterIP Service, accessed through Nginx Ingress Controller with SSL/TLS termination.

### Static Files Strategy

- Django `collectstatic` uploads to Azure Blob Storage
- Blob Storage serves files with CDN
- No static files served by application server

### Caching Strategy

**Two-Tier Caching**:
1. **HTTP Caching (Edge Proxy)**: Public content, static assets (managed by infrastructure team)
2. **Application Caching (Redis)**: User-specific data, computed results (see ADR-008)

### Performance Considerations

**Without Application-Level Nginx**:
- Gunicorn handles requests directly (no additional proxy latency)
- Slow clients may tie up workers (mitigated by Kubernetes Ingress buffering and adequate worker count)

**Monitoring**: Track Gunicorn worker utilisation, request queue depth, alert on worker saturation

### When to Reconsider

Add application-level Nginx if:
- Worker utilisation >80% sustained
- Request queue depth >10 sustained
- Slow client timeouts >5% of requests

## References

- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- Related ADRs:
  - ADR-002: Django REST Framework Choice
  - ADR-006: Azure Kubernetes Deployment
  - ADR-008: Redis Application-Level Caching
  - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
