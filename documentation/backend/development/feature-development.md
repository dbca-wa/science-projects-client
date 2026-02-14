# Feature Development Guide

Purpose: Complete workflow for developing features in the SPMS backend.

Related Documentation: [Getting Started](getting-started.md), [Testing Guide](testing-guide.md), [Code Style](code-style.md), [CI/CD](../../general/deployment/ci-cd-overview.md)

## Overview

This guide walks through the complete process of developing a feature, from planning to deployment. Follow these steps to ensure consistent, high-quality contributions.

## Branching Strategy

### Main Branches

**develop** - Main development branch
- All feature branches created from `develop`
- All pull requests merge to `develop`
- Continuous integration runs on every push

**main** - Production branch
- Only updated via releases
- Protected branch
- Requires pull request approval
- Production deployments require RFC (see [Change Management](../../general/operations/change-management.md))

### Feature Branch Workflow

1. **Create Feature Branch**
   ```powershell
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Commit**
   ```powershell
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and Create PR**
   ```powershell
   git push origin feature/your-feature-name
   # Create pull request on GitHub targeting develop
   ```

4. **After PR Approval**
   ```powershell
   # PR is merged via GitHub
   git checkout develop
   git pull origin develop
   git branch -d feature/your-feature-name
   ```

## Commit Message Format

Use conventional commit format with type prefix:

**Format:** `<type>: <description>`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `ci:` - CI/CD changes
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add user profile export functionality
fix: resolve cache invalidation issue
docs: update API endpoint documentation
refactor: simplify project service logic
test: add unit tests for media validation
ci: update test workflow configuration
chore: update dependencies
```

**Rules:**
- Use lowercase for type and description
- Keep description concise (50 characters or less)
- Use imperative mood ("add" not "added")
- No period at the end

## Development Workflow

### 1. Planning Phase

**Understand requirements**:
- Review feature specification or issue
- Clarify acceptance criteria
- Identify affected components
- Estimate complexity

**Check existing code**:
- Search for similar features
- Review related models and views
- Identify reusable components
- Check for existing tests

**Plan approach**:
- Sketch data model changes
- Design API endpoints
- Plan service layer methods
- Identify test scenarios

### 2. Branch Creation

**Naming conventions**:
```bash
feature/short-description    # New features
fix/bug-description          # Bug fixes
refactor/component-name      # Code refactoring
docs/topic                   # Documentation
```

**Create branch**:
```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/project-tags

# Push branch to remote
git push -u origin feature/project-tags
```

### 3. Development Process

**Test-Driven Development (TDD)**:

1. **Write failing test**:
```python
# projects/tests/test_models.py
def test_project_can_have_tags(self):
    """Test project can be tagged."""
    project = Project.objects.create(title="Test")
    tag = Tag.objects.create(name="Research")
    project.tags.add(tag)

    assert tag in project.tags.all()
```

2. **Run test** (should fail):
```bash
poetry run pytest projects/tests/test_models.py::test_project_can_have_tags
```

3. **Implement feature**:
```python
# projects/models.py
class Project(models.Model):
    # ... existing fields ...
    tags = models.ManyToManyField(Tag, related_name="projects")
```

4. **Run test** (should pass):
```bash
poetry run pytest projects/tests/test_models.py::test_project_can_have_tags
```

5. **Refactor** if needed

**Commit frequently**:
```bash
# Stage changes
git add projects/models.py projects/tests/test_models.py

# Commit with descriptive message
git commit -m "Add tags field to Project model"
```

### 4. Testing

**Run all tests**:
```bash
# Run full test suite
poetry run pytest

# Run specific app tests
poetry run pytest projects/tests/

# Run with coverage
poetry run pytest --cov=projects
```

**Check coverage**:
```bash
# Generate coverage report
poetry run pytest --cov=. --cov-report=html

# Open htmlcov/index.html
# Ensure new code has >80% coverage
```

**Test edge cases**:
- Empty inputs
- Null values
- Boundary conditions
- Error conditions
- Permission checks

### 5. Code Quality

**Run pre-commit hooks**:
```bash
# Run all hooks
pre-commit run --all-files

# Fix any issues reported
# Stage and commit fixes
git add .
git commit -m "Apply code quality fixes"
```

**Check for issues**:
```bash
# Run flake8
poetry run flake8 projects/

# Run bandit
poetry run bandit -r projects/

# Check migrations
poetry run python manage.py makemigrations --check --dry-run
```

### 6. Documentation

**Update docstrings**:
```python
def calculate_project_score(project, weights):
    """
    Calculate weighted score for project.

    Args:
        project: Project instance
        weights: Dictionary of metric weights

    Returns:
        Float score value

    Raises:
        ValueError: If weights are invalid
    """
    pass
```

**Update README** if needed:
- New features
- API changes
- Configuration changes

**Add inline comments** for complex logic:
```python
# Use exponential decay to favour recent activity
score = sum(
    metric.value * (0.95 ** days_old)
    for metric in recent_metrics
)
```

### 7. Pull Request Process

**Create pull request**:

1. Push branch:
```bash
git push origin feature/project-tags
```

2. Go to GitHub and create PR

3. Fill in PR template:
```markdown
## Description
Add tagging functionality to projects

## Changes
- Add tags field to Project model
- Create Tag model
- Add API endpoints for tag management
- Add tests for tag functionality

## Testing
- All tests pass
- Coverage: 85%
- Manual testing completed

## Checklist
- [x] Tests added
- [x] Documentation updated
- [x] Pre-commit hooks pass
- [x] No breaking changes
```

**PR best practices**:
- Keep PRs small (< 500 lines)
- One feature per PR
- Clear description
- Link related issues
- Request specific reviewers

### 8. Code Review

**Address feedback**:
```bash
# Make requested changes
# Commit changes
git add .
git commit -m "Address review feedback"

# Push updates
git push origin feature/project-tags
```

**Respond to comments**:
- Acknowledge feedback
- Explain decisions
- Ask clarifying questions
- Mark resolved comments

### 9. CI/CD Pipeline

**Monitor CI checks**:
- Test workflow (4 shards)
- Coverage check (>80%)
- Pre-commit hooks
- Build check

**Fix failures**:
```bash
# Pull latest changes
git pull origin feature/project-tags

# Fix issues locally
# Run tests
poetry run pytest

# Commit and push
git add .
git commit -m "Fix CI failures"
git push origin feature/project-tags
```

### 10. Merging

**Requirements**:
- All CI checks pass
- Code review approved
- No merge conflicts
- Branch up to date with main

**Merge strategies**:

**Squash and merge** (preferred):
- Clean commit history
- Single commit per feature
- Use for feature branches

**Merge commit**:
- Preserve commit history
- Use for long-running branches

**Rebase and merge**:
- Linear history
- Use for simple changes

**After merge**:
```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Delete feature branch
git branch -d feature/project-tags
git push origin --delete feature/project-tags
```

### 11. Release Process

**Tagging**:
```bash
# Create release tag
git tag 4.1.2-official

# Push tag
git push origin 4.1.2-official
```

**Release workflow**:
1. Tag triggers release workflow
2. Tests run (4 shards)
3. Docker image built
4. Image pushed to GHCR
5. Version badge updated

**Deployment verification**:
```bash
# Check deployment in Azure Rancher (preferred method)
# Navigate to: https://rancher.dbca.wa.gov.au
# Select namespace: spms-production
# View deployment status and pod health

# Or via kubectl (if Rancher unavailable)
kubectl get pods -n spms-production

# View logs via Rancher GUI (preferred)
# Navigate to: Workloads → Deployments → spms-deployment-prod
# Click "View Logs" button

# Or via kubectl (if Rancher unavailable)
kubectl logs -f deployment/spms-backend -n spms-production
```

## Common Scenarios

### Adding a New Model

1. **Create model**:
```python
# app/models.py
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

2. **Create migration**:
```bash
poetry run python manage.py makemigrations
poetry run python manage.py migrate
```

3. **Add tests**:
```python
def test_tag_creation(self):
    tag = Tag.objects.create(name="Research")
    assert str(tag) == "Research"
```

4. **Register in admin**:
```python
# app/admin.py
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
```

### Adding a New API Endpoint

1. **Create serializer**:
```python
# app/serializers.py
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "created_at"]
```

2. **Create view**:
```python
# app/views.py
class TagList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
```

3. **Add URL**:
```python
# app/urls.py
urlpatterns = [
    path("tags", TagList.as_view()),
]
```

4. **Add tests**:
```python
def test_list_tags(self):
    response = self.client.get("/api/v1/tags")
    assert response.status_code == 200
```

### Creating a Database Migration

1. **Make changes to models**

2. **Generate migration**:
```bash
poetry run python manage.py makemigrations
```

3. **Review migration**:
```bash
# View SQL
poetry run python manage.py sqlmigrate app 0001

# Check for issues
poetry run python manage.py makemigrations --check
```

4. **Test migration**:
```bash
# Apply migration
poetry run python manage.py migrate

# Test rollback
poetry run python manage.py migrate app 0000
poetry run python manage.py migrate
```

5. **Commit migration**:
```bash
git add app/migrations/0001_*.py
git commit -m "Add Tag model migration"
```

## Best Practices

### Small Pull Requests

**Good** (< 500 lines):
- Single feature
- Easy to review
- Quick to merge

**Bad** (> 1000 lines):
- Multiple features
- Hard to review
- Slow to merge

### Descriptive Commits

**Good**:
```
Add tag filtering to project list API

- Add tags query parameter
- Filter projects by tag IDs
- Add tests for tag filtering
```

**Bad**:
```
Update code
Fix bug
WIP
```

### Backward Compatibility

**Do**:
- Add new fields as optional
- Deprecate before removing
- Version breaking changes

**Don't**:
- Remove fields without warning
- Change field types
- Break existing APIs

### Testing Strategy

**Unit tests** (90%):
- Models
- Serializers
- Services
- Utilities

**Integration tests** (10%):
- API endpoints
- Multi-model operations
- External integrations

## Workflow Example

Complete example of adding a feature:

```bash
# 1. Create branch
git checkout main
git pull origin main
git checkout -b feature/project-tags

# 2. Write test
# Edit projects/tests/test_models.py
poetry run pytest projects/tests/test_models.py::test_project_tags

# 3. Implement feature
# Edit projects/models.py
poetry run python manage.py makemigrations
poetry run python manage.py migrate

# 4. Run tests
poetry run pytest projects/tests/
poetry run pytest --cov=projects

# 5. Code quality
pre-commit run --all-files

# 6. Commit
git add .
git commit -m "Add tags to Project model"

# 7. Push and create PR
git push -u origin feature/project-tags
# Create PR on GitHub

# 8. Address review feedback
# Make changes
git add .
git commit -m "Address review feedback"
git push origin feature/project-tags

# 9. Merge PR
# Merge via GitHub UI

# 10. Clean up
git checkout main
git pull origin main
git branch -d feature/project-tags
```

## Next Steps

- [Testing Guide](testing-guide.md) - Testing guidelines
- [Code Style](code-style.md) - Coding standards
- [CI/CD](../../general/deployment/ci-cd-overview.md) - Deployment pipeline
- [Change Management](../../general/operations/change-management.md) - RFC process for production
- [Troubleshooting](../../general/operations/) - Common issues
