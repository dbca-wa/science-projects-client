# Background Jobs Strategy

## Current State

No background job processing is currently implemented. All operations execute synchronously within the request-response cycle. This aligns with the single-maintainer philosophy (see ADR-001).

## Overview

This document outlines the current synchronous approach and the strategy for implementing background job processing when needed.

## Current Approach

All operations execute synchronously:

**PDF Generation:**
```python
# documents/views/pdf.py
class BeginProjectDocGeneration(APIView):
    def post(self, request, pk):
        document = DocumentService.get_document(pk)

        # TODO: Trigger async PDF generation task
        try:
            PDFService.generate_document_pdf(document)
            PDFService.mark_pdf_generation_complete(document)
        except Exception:
            PDFService.mark_pdf_generation_complete(document)
            raise

        return Response({"message": "PDF generation started"}, status=HTTP_202_ACCEPTED)
```

**Why synchronous works:**
- User base: 1000+ registered users
- Fast operations: Most requests < 500ms
- Infrequent heavtions
- Simple architecture
- Single maintainer (reduced operational overhead)

**Performance metrics:**
- Average request time: 200ms
- 95th percentile: 500ms
- PDF generation: 2-5 seconds (acceptable)
- File uploads: < 1 second

## When Background Jobs Are Needed

Implement background job processing when:

**Threshold indicators:**
1. Operations regularly exceed 30 seconds
2. Users wait > 10 seconds for responses
3. Long-running tasks block other requests
4. > 500 concurrent users
5. > 1000 PDF generations per day

**New features requiring async:**
- Email notifications (batch sending)
- Data exports (large CSV/Excel files)
- Scheduled reports
- Batch data imports
- Image processing pipelines

## Recommended Solution: Celery

**Why Celery:**
- Django integration (mature ecosystem)
- Flexible broker options (Redis/RabbitMQ)
- Monitoring tools (Flower)
- Built-in retry mechanisms
- Scheduling (Celery Beat)

**Alternatives considered:**
- Django-Q (simpler but less feature-rich)
- Huey (lightweight but limited scaling)
- RQ (Redis-only)
- Dramatiq (smaller community)

## Implementation Plan

**Phase 1: Infrastructure Setup**

```python
# requirements (pyproject.toml)
celery = "^5.3.0"
redis = "^5.0.0"  # Already added for caching

# config/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('spms')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# config/settings.py
CELERY_BROKER_URL = env('REDIS_URL', default='redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = env('REDIS_URL', default='redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Australia/Perth'
```

**Phase 2: Convert PDF Generation**

```python
# documents/tasks.py
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def generate_document_pdf_async(self, document_id):
    """Generate PDF for project document asynchronously"""
    try:
        document = ProjectDocument.objects.get(pk=document_id)
        PDFService.generate_document_pdf(document)
        PDFService.mark_pdf_generation_complete(document)
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

# documents/views/pdf.py
class BeginProjectDocGeneration(APIView):
    def post(self, request, pk):
        document = DocumentService.get_document(pk)
        PDFService.mark_pdf_generation_started(document)

        # Trigger async task
        task = generate_document_pdf_async.delay(document.pk)

        return Response({
            "message": "PDF generation started",
            "task_id": task.id
        }, status=HTTP_202_ACCEPTED)
```

**Phase 3: Task Status Endpoint**

```python
class CheckPDFGenerationStatus(APIView):
    def get(self, request, task_id):
        from celery.result import AsyncResult

        task = AsyncResult(task_id)
        return Response({
            "task_id": task_id,
            "status": task.state,
            "result": task.result if task.ready() else None,
        })
```

**Phase 4: Monitoring**

```bash
# Install Flower
poetry add flower

# Run Flower
celery -A config flower --port=5555
```

## Deployment Considerations

**Docker Compose (Development):**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A config worker -l info
    depends_on:
      - redis
      - db
```

**Kubernetes (Production):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: celery-worker
        image: spms-backend:latest
        command: ["celery", "-A", "config", "worker", "-l", "info"]
```

## Async Task Patterns

**Task retry pattern:**
```python
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_file(self, file_id):
    try:
        file = File.objects.get(pk=file_id)
        # Process file
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
```

**Task chaining:**
```python
from celery import chain

workflow = chain(
    validate_file.s(file_id),
    process_file.s(),
    notify_user.s()
)
workflow.apply_async()
```

**Periodic tasks:**
```python
# config/celery.py
from celery.schedules import crontab

app.conf.beat_schedule = {
    'cleanup-old-files': {
        'task': 'medias.tasks.cleanup_old_files',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
}
```

## Evaluation Criteria

| Criterion | Threshold | Current | Status |
|-----------|-----------|---------|--------|
| Request timeout rate | > 1% | < 0.1% | OK |
| Average response time | > 2s | 200ms | OK |
| PDF generation time | > 10s | 2-5s | OK |
| Concuers | > 500 | 1000+ | Monitor |
| User complaints | > 5/month | 0 | OK |

**Recommendation:** Continue with synchronous processing until any threshold is exceeded.

## Monitoring and Alerts

**Metrics to track:**
- Request duration (p50, p95, p99)
- Timeout rate
- Error rate
- User feedback

**Implement Celery when:**
- Request timeout rate > 1%
- P95 response time > 5 seconds
- User complaints > 5 per month
- PDF generation time > 10 seconds
- Concurrent users > 500

## Cost-Benefit Analysis

**Current approach (synchronous):**
- Benefits: Simple architecture, no additional infrastructure, easy to debug, low operational overhead
- Costs: Limited scalability, potential for slow requests, no retry mechanisms

**Future approach (Celery):**
- Benefits: Scalable architecture, better user experience, retry mechanisms, task scheduling
- Costs: Additional infrastructure, increased complexity, more monitoring required, higher operational overhead

**Single maintainer considerations:**
- Can I maintre alone?
- What happens if Celery workers fail?
- How do I debug failed tasks?

**Mitigation strategies:**
- Use managed Redis (Azure Cache for Redis)
- Implement comprehensive logging
- Set up automated alerts
- Document common issues
- Keep task logic simple

## Alternative Approaches

**1. Django async views:**
- Pros: No additional infrastructure, built into Django
- Cons: Limited to request-response cycle, no task scheduling
- Use case: Simple async operations like sending emails

**2. Database-backed queue:**
- Pros: No additional infrastructure, uses existing database
- Cons: Database overhead, limited scalability
- Use case: Very simple task queue for low-volume operations

**3. Managed services (Azure Functions):**
- Pros: No infrastructure management, auto-scaling
- Cons: Vendor lock-in, cold start latency
- Use case: Infrequent, heavy operations

## Recommendations

**Short term (current state):**
1. Continue synchronous processing
2. Monitor key metrics (request duration, timeout rate, user feedback)
3. Optimise existing operations (database queries, caching, code profiling)
4. Document pain points

**Medium term (if thresholds exceeded):**
1. Implement Celery for PDF generation
2. Start with single worker
3. Use existing Redis instance
4. Add basic monitoring
5. Document operational procedures

**Long term (if scale increases):**
1. Expand Celery usage (email notifications, data exports, scheduled tasks)
2. Add Flower monitoring
3. Implement task prioritisation
4. Scale workers horizontally
5. Consider managed Redis

## Resources

- Celery Documentation: https://docs.celeryq.dev/
- Django + Celery Guide: https://docs.celeryq.dev/en/stable/django/
- Flower Monitoring: https://flower.readthedocs.io/
- Azure Cache for Redis: https://azure.microsoft.com/en-us/services/cache/

## Related Documentation

- **Caching Strategy:** `caching-strategy.md`
- **Single Maintainer Philosophy:** `ADR-001-single-maintainer-philosophy.md`
