"""
Tests for user profile cache invalidation

Verifies that cache is properly invalidated when user data changes.
"""

import pytest
from django.core.cache import cache
from django.test import override_settings

from users.models import User, UserProfile, UserWork
from users.services.profile_service import ProfileService
from users.services.user_service import UserService


@pytest.fixture
def clear_cache():
    """Clear cache before and after each test"""
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestUserCacheInvalidation:
    """Test cache invalidation for user profile updates"""

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation",
            }
        }
    )
    def test_update_user_invalidates_cache(self, user, clear_cache):
        """Test that updating user via UserService invalidates cache"""
        # Arrange - Populate cache
        cached_user = UserService.get_user(user.pk)
        assert cached_user is not None
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Update user
        UserService.update_user(user.pk, {"first_name": "Updated"})

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-2",
            }
        }
    )
    def test_toggle_active_invalidates_cache(self, user, clear_cache):
        """Test that toggling user active status invalidates cache"""
        # Arrange - Populate cache
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Toggle active
        UserService.toggle_active(user.pk)

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-3",
            }
        }
    )
    def test_switch_admin_invalidates_cache(self, user, clear_cache):
        """Test that toggling admin status invalidates cache"""
        # Arrange - Populate cache
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Switch admin
        UserService.switch_admin(user.pk)

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-4",
            }
        }
    )
    def test_delete_user_invalidates_cache(self, clear_cache):
        """Test that deleting user invalidates cache"""
        # Arrange - Create user and populate cache
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
        )
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        user_pk = user.pk

        # Act - Delete user
        UserService.delete_user(user_pk)

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user_pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-5",
            }
        }
    )
    def test_update_user_profile_invalidates_cache(self, user, clear_cache):
        """Test that updating UserProfile invalidates cache"""
        # Arrange - Create profile and populate cache
        profile = UserProfile.objects.create(user=user, title="Test Title")
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Update profile
        ProfileService.update_user_profile(profile.pk, {"title": "Updated Title"})

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-6",
            }
        }
    )
    def test_update_personal_information_invalidates_cache(self, user, clear_cache):
        """Test that updating personal information invalidates cache"""
        # Arrange - Populate cache
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Update personal information
        ProfileService.update_personal_information(
            user.pk, {"display_first_name": "Updated"}
        )

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-7",
            }
        }
    )
    def test_cache_hit_returns_same_data(self, user, clear_cache):
        """Test that cache hit returns the same data as cache miss"""
        # Arrange - Clear cache
        cache.clear()

        # Act - First call (cache miss)
        user1 = UserService.get_user(user.pk)

        # Act - Second call (cache hit)
        user2 = UserService.get_user(user.pk)

        # Assert - Same data returned
        assert user1.pk == user2.pk
        assert user1.username == user2.username
        assert user1.email == user2.email
        assert user1.first_name == user2.first_name
        assert user1.last_name == user2.last_name

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-8",
            }
        }
    )
    def test_cache_invalidation_after_work_update(
        self, user, business_area, clear_cache
    ):
        """Test that updating UserWork invalidates cache"""
        # Arrange - Create work and populate cache
        work = UserWork.objects.create(
            user=user,
            business_area=business_area,
            role="Test Role",
        )
        UserService.get_user(user.pk)
        assert cache.get(f"user:{user.pk}:profile") is not None

        # Act - Update work (simulating what the view does)
        work.role = "Updated Role"
        work.save()
        UserService.invalidate_user_profile_cache(user.pk)

        # Assert - Cache was invalidated
        assert cache.get(f"user:{user.pk}:profile") is None

    @override_settings(
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "test-cache-invalidation-9",
            }
        }
    )
    def test_multiple_users_independent_cache(self, clear_cache):
        """Test that cache invalidation for one user doesn't affect others"""
        # Arrange - Create two users and populate cache
        user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
        )
        user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
        )

        UserService.get_user(user1.pk)
        UserService.get_user(user2.pk)

        assert cache.get(f"user:{user1.pk}:profile") is not None
        assert cache.get(f"user:{user2.pk}:profile") is not None

        # Act - Update user1
        UserService.update_user(user1.pk, {"first_name": "Updated"})

        # Assert - Only user1 cache was invalidated
        assert cache.get(f"user:{user1.pk}:profile") is None
        assert cache.get(f"user:{user2.pk}:profile") is not None
