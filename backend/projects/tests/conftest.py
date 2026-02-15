"""
Project-specific pytest fixtures.

Provides fixtures for testing project-related functionality.
"""

import pytest
from django.contrib.auth import get_user_model

from common.tests.factories import (
    AreaFactory,
    BusinessAreaFactory,
    ProjectFactory,
    UserFactory,
)

User = get_user_model()


@pytest.fixture
def user(db):
    """
    Provide a regular user.

    Returns:
        User: User instance
    """
    return UserFactory(
        username="testuser",
        email="test@example.com",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def superuser(db):
    """
    Provide a superuser.

    Returns:
        User: Superuser instance
    """
    return UserFactory(
        username="admin",
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        is_superuser=True,
        is_staff=True,
    )


@pytest.fixture
def project_lead(db):
    """
    Provide a project lead user.

    Returns:
        User: User instance configured as project lead
    """
    return UserFactory(
        username="project_lead",
        email="lead@example.com",
        first_name="Project",
        last_name="Lead",
    )


@pytest.fixture
def business_area(db):
    """
    Provide a business area.

    Returns:
        BusinessArea: Business area instance
    """
    return BusinessAreaFactory()


@pytest.fixture
def area(db):
    """
    Provide a location area.

    Returns:
        Area: Area instance
    """
    return AreaFactory()


@pytest.fixture
def project(db, business_area):
    """
    Provide a basic project.

    Args:
        business_area: Business area fixture

    Returns:
        Project: Project instance
    """
    from projects.models import ProjectArea

    project = ProjectFactory(
        business_area=business_area,
        title="Test Project",
        description="Test Description",
        year=2023,
        kind="science",
        status="new",
    )

    # Create ProjectArea for the project
    ProjectArea.objects.create(project=project, areas=[])

    return project


@pytest.fixture
def project_with_lead(db, business_area, project_lead):
    """
    Provide a project with a project lead and project detail.

    Args:
        business_area: Business area fixture
        project_lead: Project lead user fixture

    Returns:
        Project: Project instance with lead member and detail
    """
    from projects.models import ProjectArea, ProjectDetail

    project = ProjectFactory(
        business_area=business_area,
        title="Test Project with Lead",
        description="Test Description",
        year=2023,
        kind="science",
        status="new",
        members=[],  # Prevent automatic leader creation
    )

    # Create ProjectArea for the project
    ProjectArea.objects.create(project=project, areas=[])

    project.members.create(
        user=project_lead,
        is_leader=True,
        role="supervising",
    )

    # Create ProjectDetail instance
    project_detail = ProjectDetail.objects.create(
        project=project,
        creator=project_lead,
        modifier=project_lead,
        owner=project_lead,
    )

    # Add project_detail as attribute for easier access in tests
    project.project_detail = project_detail

    return project


@pytest.fixture
def project_with_members(db, business_area, project_lead):
    """
    Provide a project with multiple members.

    Args:
        business_area: Business area fixture
        project_lead: Project lead user fixture

    Returns:
        Project: Project instance with multiple members
    """
    from projects.models import ProjectArea

    project = ProjectFactory(
        business_area=business_area,
        title="Test Project with Members",
        description="Test Description",
        year=2023,
        kind="science",
        status="new",
    )

    # Create ProjectArea for the project
    ProjectArea.objects.create(project=project, areas=[])

    # Add project lead
    project.members.create(
        user=project_lead,
        is_leader=True,
        role="supervising",
    )

    # Add regular members
    for i in range(3):
        member_user = UserFactory(
            username=f"member{i}",
            email=f"member{i}@example.com",
        )
        project.members.create(
            user=member_user,
            is_leader=False,
            role="supervising",
        )

    return project


@pytest.fixture
def project_member(db, project_with_lead, project_lead):
    """
    Provide a project member relationship.

    Args:
        project_with_lead: Project with lead fixture
        project_lead: Project lead user fixture

    Returns:
        ProjectMember: Project member instance
    """
    return project_with_lead.members.get(user=project_lead)


@pytest.fixture
def user_factory():
    """
    Provide UserFactory for creating users.

    Returns:
        UserFactory: Factory for creating users
    """
    return UserFactory


@pytest.fixture
def project_factory():
    """
    Provide ProjectFactory for creating projects.

    Returns:
        ProjectFactory: Factory for creating projects
    """
    return ProjectFactory


@pytest.fixture
def api_client():
    """
    Provide API client for view tests.

    Returns:
        APIClient: REST framework API client
    """
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def project_with_area(db, business_area):
    """
    Provide a project with project area.

    Args:
        business_area: Business area fixture

    Returns:
        Project: Project instance with area
    """
    from projects.models import ProjectArea

    project = ProjectFactory(
        business_area=business_area,
        title="Test Project with Area",
        description="Test Description",
        year=2023,
        kind="science",
        status="new",
    )

    # Create ProjectArea with some area IDs
    ProjectArea.objects.create(project=project, areas=[1, 2, 3])

    return project


@pytest.fixture
def project_area(db, project, area):
    """
    Provide a project area instance.

    Args:
        project: Project fixture
        area: Area fixture

    Returns:
        ProjectArea: Project area instance
    """
    from projects.models import ProjectArea

    # Get or create ProjectArea for the project
    project_area, created = ProjectArea.objects.get_or_create(
        project=project, defaults={"areas": [area.pk]}
    )

    if not created and area.pk not in project_area.areas:
        project_area.areas.append(area.pk)
        project_area.save()

    return project_area


@pytest.fixture
def mock_image():
    """
    Provide a mock image for testing.

    Returns:
        SimpleUploadedFile: Mock image file
    """
    from io import BytesIO

    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image

    # Create a simple 10x10 red image
    image = Image.new("RGB", (10, 10), color="red")
    image_io = BytesIO()
    image.save(image_io, format="JPEG")
    image_io.seek(0)

    return SimpleUploadedFile(
        "test_image.jpg", image_io.read(), content_type="image/jpeg"
    )


# Module-scoped fixtures for read-only tests
# These fixtures are created once per module and shared across tests
# Use these for tests that only read data and don't modify it


@pytest.fixture(scope="module")
def module_user(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped regular user for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read user data and don't modify it.

    Returns:
        User: Regular user instance (shared across module)
    """
    with django_db_blocker.unblock():
        user, created = User.objects.get_or_create(
            username="projects_module_user",
            defaults={
                "email": "projects_module@example.com",
                "first_name": "Projects",
                "last_name": "User",
            },
        )
        yield user


@pytest.fixture(scope="module")
def module_superuser(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped superuser for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read superuser data and don't modify it.

    Returns:
        User: Superuser instance (shared across module)
    """
    with django_db_blocker.unblock():
        user, created = User.objects.get_or_create(
            username="projects_module_admin",
            defaults={
                "email": "projects_moduleadmin@example.com",
                "first_name": "Projects",
                "last_name": "Admin",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if created:
            user.is_superuser = True
            user.is_staff = True
            user.save()
        yield user


@pytest.fixture(scope="module")
def module_project_lead(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped project lead user for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read project lead data and don't modify it.

    Returns:
        User: Project lead user instance (shared across module)
    """
    with django_db_blocker.unblock():
        user, created = User.objects.get_or_create(
            username="projects_module_lead",
            defaults={
                "email": "projects_modulelead@example.com",
                "first_name": "Projects",
                "last_name": "Lead",
            },
        )
        yield user


@pytest.fixture(scope="module")
def module_business_area(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped business area for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read business area data and don't modify it.

    Returns:
        BusinessArea: Business area instance (shared across module)
    """
    with django_db_blocker.unblock():
        ba = BusinessAreaFactory()
        yield ba


@pytest.fixture(scope="module")
def module_area(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped location area for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read area data and don't modify it.

    Returns:
        Area: Area instance (shared across module)
    """
    with django_db_blocker.unblock():
        area = AreaFactory()
        yield area
