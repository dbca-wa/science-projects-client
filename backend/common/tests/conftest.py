"""
Common pytest fixtures for backend testing.

Provides shared fixtures that can be used across all test files.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    """
    Provide an API client for testing.

    Returns:
        APIClient: DRF API client instance
    """
    return APIClient()


@pytest.fixture
def user(db):
    """
    Provide a regular user.

    Returns:
        User: Regular user instance
    """
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
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
    return User.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="adminpass123",
        first_name="Admin",
        last_name="User",
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """
    Provide an authenticated API client.

    Args:
        api_client: API client fixture
        user: User fixture

    Returns:
        APIClient: Authenticated API client
    """
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, superuser):
    """
    Provide an admin API client.

    Args:
        api_client: API client fixture
        superuser: Superuser fixture

    Returns:
        APIClient: Admin-authenticated API client
    """
    api_client.force_authenticate(user=superuser)
    return api_client


@pytest.fixture
def multiple_users(db):
    """
    Provide multiple test users.

    Returns:
        list[User]: List of 3 user instances
    """
    return [
        User.objects.create_user(
            username=f"user{i}",
            email=f"user{i}@example.com",
            password="testpass123",
            first_name="User",
            last_name=f"{i}",
        )
        for i in range(1, 4)
    ]


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
            username="moduleuser",
            defaults={
                "email": "module@example.com",
                "first_name": "Module",
                "last_name": "User",
            },
        )
        if created:
            user.set_password("testpass123")
            user.save()
        yield user
        # Cleanup happens once at end of module


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
            username="moduleadmin",
            defaults={
                "email": "moduleadmin@example.com",
                "first_name": "Module",
                "last_name": "Admin",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if created:
            user.set_password("adminpass123")
            user.is_superuser = True
            user.is_staff = True
            user.save()
        yield user


@pytest.fixture(scope="module")
def module_staff_user(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped staff user for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read staff user data and don't modify it.

    Returns:
        User: Staff user instance (shared across module)
    """
    with django_db_blocker.unblock():
        user, created = User.objects.get_or_create(
            username="modulestaff",
            defaults={
                "email": "modulestaff@example.com",
                "first_name": "Module",
                "last_name": "Staff",
                "is_staff": True,
            },
        )
        if created:
            user.set_password("testpass123")
            user.is_staff = True
            user.save()
        yield user


@pytest.fixture
def mock_file():
    """Provide a mock PDF file for testing with valid magic bytes"""
    from django.core.files.uploadedfile import SimpleUploadedFile

    # Minimal valid PDF content with proper magic bytes
    pdf_content = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj\n<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000068 00000 n\n0000000127 00000 n\ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n225\n%%EOF"
    return SimpleUploadedFile(
        "test_file.pdf", pdf_content, content_type="application/pdf"
    )


@pytest.fixture
def mock_image():
    """Provide a mock image for testing"""
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
