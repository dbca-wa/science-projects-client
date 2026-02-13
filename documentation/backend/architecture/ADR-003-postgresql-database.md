# ADR-003: PostgreSQL Database Choice

## Context

The Science Projects Management System (SPMS) requires a relational database to store:

- Project data with complex relationships (projects, documents, locations, contacts)
- User information and authentication data
- Hierarchical agency and branch structures
- Caretaker relationships and approval workflows
- Document metadata and file references
- Audit logs and change history

The database must support:

- ACID transactions for data integrity (Atomicity, Consistency, Isolation, Durability - ensures reliable transactions where all operations complete successfully or none do, maintaining data consistency even during failures)
- Complex queries with joins across multiple tables
- Full-text search capabilities
- JSON data storage for flexible metadata
- Geographic data types for location information
- Integration with Azure managed services - organisational infrastructure choice
- Government security and compliance requirements
- Maintainable by a full-stack developer with consideration for team collaboration

## Decision

We will use PostgreSQL as the primary database for SPMS, deployed as Azure Database for PostgreSQL (organisational infrastructure choice).

PostgreSQL provides:

- Robust ACID compliance and data integrity
- Advanced data types (JSON, arrays, geographic)
- Full-text search capabilities
- Excellent Django ORM support
- Mature replication and backup features
- Strong security and compliance features
- Azure managed service availability

## Consequences

### Positive Consequences

- **Data Integrity**: ACID compliance ensures reliable transactions and data consistency
- **Advanced Features**: JSON, arrays, and full-text search reduce need for additional services
- **Django Integration**: Excellent ORM support with psycopg2/psycopg3 drivers
- **Managed Service**: Azure Database for PostgreSQL handles backups, updates, and high availability
- **Security**: Built-in encryption, SSL/TLS support, and Azure AD integration
- **Performance**: Query optimiser and indexing capabilities handle complex queries efficiently
- **Geographic Data**: PostGIS extension supports location-based queries
- **Compliance**: Meets government data sovereignty and security requirements
- **Operational Simplicity**: Managed service reduces maintenance burden
- **Cost Effective**: Predictable pricing with Azure reserved instances

### Negative Consequences

- **Azure Lock-in**: Using Azure Database for PostgreSQL creates vendor dependency
- **Cost**: Managed database service more expensive than self-hosted alternatives
- **Limited Control**: Cannot access underlying OS or install custom extensions
- **Connection Limits**: Managed service has connection pool limits

### Neutral Consequences

- **SQL Knowledge Required**: Team must maintain SQL and PostgreSQL expertise
- **Migration Complexity**: Future database changes require careful migration planning
- **Version Management**: Must coordinate PostgreSQL version upgrades with Django compatibility

## Alternatives Considered

### MySQL/MariaDB

**Description**: Popular open-source relational database.

**Why Not Chosen**:

- Less advanced data type support (JSON support added later, less mature)
- Weaker full-text search capabilities
- Less robust transaction handling in some storage engines
- Django ORM works better with PostgreSQL features

**Trade-offs**: MySQL has wider adoption but PostgreSQL offers superior features for complex applications.

### Microsoft SQL Server

**Description**: Microsoft's enterprise relational database.

**Why Not Chosen**:

- Higher licensing costs (even on Azure)
- Less common in Python/Django ecosystem
- More complex for single maintainer
- Overkill for current requirements

**Trade-offs**: SQL Server offers enterprise features but adds unnecessary complexity and cost.

### MongoDB

**Description**: NoSQL document database.

**Why Not Chosen**:

- Lacks ACID transactions across documents (until recent versions)
- No relational integrity constraints
- Poor fit for highly relational data model
- Django ORM doesn't support NoSQL databases natively
- Requires additional ODM layer (djongo)

**Trade-offs**: MongoDB offers schema flexibility but sacrifices data integrity guarantees needed for government applications.

### SQLite

**Description**: Lightweight embedded database.

**Why Not Chosen**:

- Not suitable for production multi-user applications
- No concurrent write support
- Limited scalability
- No managed service option

**Trade-offs**: SQLite is excellent for development but inadequate for production deployment.

## Implementation Notes

### Azure Database for PostgreSQL Configuration

**Service Tier**: General Purpose

- Suitable for production workloads
- Balanced compute and memory
- Automated backups with 14-day retention

**Version**: PostgreSQL (latest LTS)

- Long-term support version
- Compatible with Django
- Stable feature set

**Connection Configuration**:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

**Connection Pooling**: Implemented via pgBouncer for efficient connection management

**Backup Strategy**:

- Automated daily backups (managed by Azure)
- 14-day retention period
- Point-in-time restore capability
- Geo-redundant backup storage

### Security Configuration

- SSL/TLS required for all connections
- Azure AD authentication integration
- Network security groups restrict access to AKS cluster
- Firewall rules limit connection sources
- Encryption at rest enabled
- Encryption in transit enforced

### Performance Optimisation

- Indexes on foreign keys and frequently queried fields
- Connection pooling via pgBouncer
- Query performance monitoring via Azure insights
- Regular VACUUM and ANALYZE operations (automated)

### Migration Strategy

- Initial schema created via Django migrations
- All schema changes managed through Django migration system
- Migrations tested in development before production deployment
- Rollback procedures documented for each migration

### Disaster Recovery

- Automated backups managed by OIM Infrastructure team
- 14-day retention policy
- Recovery requests submitted via OIM ticketing system
- Recovery procedures documented in operations guide

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Django PostgreSQL Notes](https://docs.djangoproject.com/en/stable/ref/databases/#postgresql-notes)
- [psycopg3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- Related ADRs:
    - ADR-002: Django REST Framework Choice
    - ADR-006: Azure Kubernetes Deployment
    - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
