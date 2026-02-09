"""
Performance tests for critical endpoints and queries.

These tests use pytest-benchmark to measure performance and detect regressions.

Run with: poetry run pytest backend/common/tests/test_performance.py --benchmark-only
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory

User = get_user_model()


@pytest.mark.django_db
class TestQueryPerformance:
    """Performance tests for database queries."""

    @pytest.fixture
    def sample_users(self, db):
        """Create sample users for testing."""
        users = []
        for i in range(100):
            user = User.objects.create_user(
                username=f"user{i}",
                email=f"user{i}@example.com",
                first_name=f"First{i}",
                last_name=f"Last{i}",
            )
            users.append(user)
        return users

    def test_user_list_query_performance(self, benchmark, sample_users):
        """Benchmark user list query performance."""

        def fetch_users():
            return list(User.objects.all()[:50])

        result = benchmark(fetch_users)
        assert len(result) == 50

    def test_user_with_related_query_performance(self, benchmark, sample_users):
        """Benchmark user query with related objects."""

        def fetch_users_with_related():
            return list(
                User.objects.select_related("avatar")
                .prefetch_related("groups", "user_permissions")
                .all()[:50]
            )

        result = benchmark(fetch_users_with_related)
        assert len(result) == 50


@pytest.mark.django_db
class TestEndpointPerformance:
    """Performance tests for API endpoints."""

    @pytest.fixture
    def authenticated_user(self, db):
        """Create an authenticated user."""
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        return user

    @pytest.fixture
    def request_factory(self):
        """Create a request factory."""
        return RequestFactory()

    def test_health_check_performance(self, benchmark, request_factory):
        """Benchmark health check endpoint."""
        from config.urls import health_check

        def call_health_check():
            request = request_factory.get("/health/")
            response = health_check(request)
            return response

        result = benchmark(call_health_check)
        assert result.status_code == 200


# Performance test configuration
# Add to pytest.ini:
# [pytest]
# addopts = --benchmark-min-rounds=10 --benchmark-warmup=on
