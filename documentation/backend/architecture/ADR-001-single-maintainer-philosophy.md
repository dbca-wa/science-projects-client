# ADR-001: Single Maintainer Philosophy

## Context

The Science Projects Management System (SPMS) is developed and maintained within the Department of Biodiversity, Conservation and Attractions (DBCA). The repositories (frontend and backend) are set up for a single maintainer proficient in full-stack development, but are designed with consideration that there may be a dedicated frontend engineer and a dedicated backend developer who would work on the repos as a team.

**Key Constraints**:

- Primary development by one full-stack developer
- Potential for dedicated frontend and backend developers working collaboratively
- Limited time for operational tasks and troubleshooting
- Must balance feature development with operational stability
- Knowledge transfer risk if maintainer changes
- Need for sustainable long-term maintenance

**Organisational Support**:

- **Django as Organisational Standard**: OIM (Office of Information Management) has designated Django as the preferred backend framework for DBCA applications, ensuring organisational familiarity and support continuity if developers leave
- **Infrastructure Team**: Manages Kubernetes clusters (dev/prod on Rancher), PostgreSQL, backups, Azure resources, and Azure Key Vault backend
- **Developer Interaction**: Application development focuses on Django code with minimal direct Kubernetes interaction (primarily via Rancher GUI for deployments and secrets management)
- **Security Tools**: Configured at organisation level (CodeQL, Dependabot, GitGuardian)
- **Shared Resources**: Standard deployment patterns and monitoring infrastructure across organisation

The architecture must optimise for:

- Operational simplicity over theoretical perfection
- Managed services over self-hosted solutions
- Automation over manual processes
- Clear documentation over tribal knowledge
- Proven technologies with appropriate use of new tech when documented

## Decision

We will explicitly design the SPMS architecture around maintainability, prioritising operational simplicity, managed services, and comprehensive documentation while supporting both single-maintainer and small-team scenarios.

**Core Principles**:

1. **Prefer Managed Services**: Use Azure managed services (PostgreSQL, AKS, Blob Storage) over self-hosted alternatives
2. **Avoid Over-Engineering**: Choose simple, proven solutions over complex, theoretically superior ones
3. **Automate Ruthlessly**: Automate deployments, testing, and monitoring to reduce manual work
4. **Document Everything**: Comprehensive documentation for all decisions, procedures, and troubleshooting
5. **Leverage Organisation**: Use organisation-level tools and infrastructure where available
6. **Fail Gracefully**: Design for degraded operation rather than complete failure
7. **Monitor Proactively**: Comprehensive monitoring to catch issues before users report them
8. **Use New Tech Appropriately**: Adopt new technologies when beneficial, but document thoroughly

## Consequences

### Positive Consequences

- **Sustainable Maintenance**: Maintainable long-term by single developer or small team
- **Reduced Operational Burden**: Managed services handle infrastructure concerns
- **Faster Troubleshooting**: Clear documentation speeds up problem resolution
- **Knowledge Transfer**: Comprehensive documentation enables maintainer transitions
- **Reduced Stress**: Automation and monitoring reduce on-call burden
- **Cost Effective**: Managed services often cheaper than self-hosted for small teams
- **Focus on Features**: Less time on operations means more time for user value
- **Organisational Alignment**: Leveraging shared infrastructure reduces duplication
- **Team Flexibility**: Architecture supports both single maintainer and dedicated frontend/backend developers

### Negative Consequences

- **Vendor Lock-in**: Heavy reliance on Azure managed services
- **Over-Documentation**: Time spent documenting could be spent on features (acceptable considering knowledge transfer)

### Neutral Consequences

- **Architectural Trade-offs**: Simplicity prioritised over theoretical perfection on backend (pragmatic approach)
- **Technology Selection**: Maturity and documentation weighted heavily, but new tech used when appropriate
- **Feature Velocity**: Slower feature development due to documentation requirements

## Alternatives Considered

### Microservices Architecture

**Description**: Split application into multiple independent services.

**Why Not Chosen**:
- Significantly increases operational complexity (orchestration, service discovery, distributed tracing)
- Requires multiple deployment pipelines and monitoring configurations
- Overkill for current scale (1-2 developers, moderate user base)
- No clear service boundaries that justify the operational overhead

**Trade-offs**: Microservices offer scalability and team independence but require dedicated operations team. Not appropriate for application of this scale and team size.

### Self-Hosted Infrastructure

**Description**: Run own Kubernetes cluster, PostgreSQL, Redis, etc.

**Why Not Chosen**:
- Infrastructure team already manages Kubernetes clusters on Rancher (dev/prod environments)
- Application development focuses on Django code, not infrastructure management
- Developers interact with Kubernetes primarily via Rancher GUI, not direct kubectl commands
- Self-hosting would duplicate infrastructure team's work and increase maintenance burden

**Trade-offs**: Self-hosting offers maximum control but requires dedicated operations expertise. Current setup leverages infrastructure team's Rancher-managed clusters, allowing developers to focus on application code.

### Non-Django Backend Framework

**Description**: Use alternative frameworks like FastAPI, Flask, or Node.js.

**Why Not Chosen**:
- **Django is organisational standard**: OIM has designated Django as the preferred backend framework for DBCA
- **Organisational familiarity**: OIM staff familiar with Django, ensuring support continuity if developers leave
- **Risk management**: Frontend frameworks change frequently and OIM lacks frontend expertise, but Django provides stable backend that OIM can maintain
- **Proven track record**: Django's maturity and comprehensive feature set reduce development and maintenance burden

**Trade-offs**: Alternative frameworks might offer specific advantages (e.g., FastAPI's async performance), but Django's organisational support and OIM familiarity outweigh technical considerations. The backend must be maintainable by OIM if developers leave, which Django ensures.

## Implementation Notes

### Technology Selection Criteria

When evaluating technologies, prioritise:

1. **Organisational Alignment**: Django (OIM standard), Azure services, existing DBCA patterns
2. **Maturity**: Prefer technologies with 5+ years of production use
3. **Documentation**: Comprehensive, well-maintained documentation required
4. **Managed Service**: Azure managed service available (strong preference)
5. **Operational Simplicity**: Minimal configuration and maintenance required

**Examples**:
- ✅ Django REST Framework, PostgreSQL, Redis, pytest (mature, organisational standard, well-documented, managed services available)
- ❌ Celery (not needed yet), Elasticsearch (self-hosted complexity), GraphQL (REST sufficient), Microservices (overhead too high for single developer)

### Managed Services Strategy

**Always Use Managed Services For**:
- Databases (Azure Database for PostgreSQL)
- Caching (Azure Cache for Redis)
- File Storage (Azure Blob Storage)
- Container Orchestration (Azure Kubernetes Service via Rancher)
- Monitoring (Azure Application Insights - managed by infrastructure team)
- Secrets Management (Azure Key Vault)

### Automation Requirements

**Must Be Automated**: Code deployment, database migrations, testing, security scanning, backup verification, monitoring alerts

**Can Be Manual**: Disaster recovery, major version upgrades, security incident response (require human judgment)

### Documentation Standards

**Required Documentation**: ADRs for major decisions, deployment procedures, troubleshooting guides, API documentation, database schema, disaster recovery procedures, monitoring guide

**Format**: Markdown files in Git repository, version controlled, reviewed in pull requests

### Graceful Degradation

Design for degraded operation rather than complete failure:
- Cache failures fall back to database
- Monitoring failures don't break application
- External service failures use cached or default data

### Threshold for Adding Complexity

**Add Celery When**: Background jobs >30 seconds, >10 jobs/day, user complaints about slow responses. The PDF document generation could potentially use this for the annual report (200+ pages with heavy images/data), however, project documents generate and are provided to the user within 2 seconds which is acceptable.


**Add Microservices When**: If necessary - Team grows to 5+ developers, clear service boundaries identified, operational team available

### Knowledge Transfer Strategy

**Documentation for Maintainer Transition**: Complete ADR set, deployment runbook, troubleshooting guide, monitoring guide, disaster recovery procedures, codebase overview

**Onboarding Checklist**: Read ADRs, review deployment procedures, access to Azure/Rancher/GitHub, perform test deployment, review recent incidents

## References

- [The Twelve-Factor App](https://12factor.net/)
- [Boring Technology Club](https://boringtechnology.club/)
- [Choose Boring Technology](https://mcfunley.com/choose-boring-technology)
- [Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-003: PostgreSQL Database Choice
    - ADR-004: Poetry Dependency Management
    - ADR-006: Azure Kubernetes Deployment
    - ADR-008: Redis Application-Level Caching

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
