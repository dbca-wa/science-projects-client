"""
Tests for merge privilege direction validation.

Hierarchy (highest to lowest): Superuser > BA Lead > Staff > External
Can only merge lower-privilege into equal-or-higher-privilege.
"""

import pytest
from django.contrib.auth import get_user_model

from adminoptions.services.admin_task_service import AdminTaskService
from common.tests.factories import BusinessAreaFactory, UserFactory

User = get_user_model()


@pytest.fixture
def business_area(db):
    return BusinessAreaFactory()


@pytest.mark.django_db
class TestMergePrivilegeValidation:
    """Merge direction must respect the privilege hierarchy."""

    def test_external_into_staff_allowed(self):
        """External user can be merged into a staff user."""
        staff = UserFactory(is_staff=True)
        external = UserFactory(is_staff=False)

        # Should not raise
        AdminTaskService.merge_users(staff, [external])
        assert not User.objects.filter(pk=external.pk).exists()

    def test_external_into_superuser_allowed(self):
        """External user can be merged into a superuser."""
        admin = UserFactory(is_staff=True, is_superuser=True)
        external = UserFactory(is_staff=False)

        AdminTaskService.merge_users(admin, [external])
        assert not User.objects.filter(pk=external.pk).exists()

    def test_staff_into_staff_allowed(self):
        """Staff user can be merged into another staff user (same level)."""
        staff_a = UserFactory(is_staff=True)
        staff_b = UserFactory(is_staff=True)

        AdminTaskService.merge_users(staff_a, [staff_b])
        assert not User.objects.filter(pk=staff_b.pk).exists()

    def test_staff_into_superuser_allowed(self):
        """Staff user can be merged into a superuser."""
        admin = UserFactory(is_staff=True, is_superuser=True)
        staff = UserFactory(is_staff=True)

        AdminTaskService.merge_users(admin, [staff])
        assert not User.objects.filter(pk=staff.pk).exists()

    def test_staff_into_external_rejected(self):
        """Staff user CANNOT be merged into an external user."""
        external = UserFactory(is_staff=False)
        staff = UserFactory(is_staff=True)

        with pytest.raises(ValueError, match="Cannot merge a higher-privilege user"):
            AdminTaskService.merge_users(external, [staff])

    def test_superuser_into_staff_rejected(self):
        """Superuser CANNOT be merged into a staff user."""
        staff = UserFactory(is_staff=True)
        admin = UserFactory(is_staff=True, is_superuser=True)

        with pytest.raises(ValueError, match="Cannot merge a higher-privilege user"):
            AdminTaskService.merge_users(staff, [admin])

    def test_superuser_into_external_rejected(self):
        """Superuser CANNOT be merged into an external user."""
        external = UserFactory(is_staff=False)
        admin = UserFactory(is_staff=True, is_superuser=True)

        with pytest.raises(ValueError, match="Cannot merge a higher-privilege user"):
            AdminTaskService.merge_users(external, [admin])

    def test_ba_lead_into_regular_staff_rejected(self, business_area):
        """BA lead CANNOT be merged into a regular staff user."""
        regular_staff = UserFactory(is_staff=True)
        ba_lead = UserFactory(is_staff=True)
        business_area.leader = ba_lead
        business_area.save()

        with pytest.raises(ValueError, match="Cannot merge a higher-privilege user"):
            AdminTaskService.merge_users(regular_staff, [ba_lead])

    def test_ba_lead_into_superuser_allowed(self, business_area):
        """BA lead can be merged into a superuser."""
        admin = UserFactory(is_staff=True, is_superuser=True)
        ba_lead = UserFactory(is_staff=True)
        business_area.leader = ba_lead
        business_area.save()

        AdminTaskService.merge_users(admin, [ba_lead])
        assert not User.objects.filter(pk=ba_lead.pk).exists()

    def test_ba_lead_into_ba_lead_allowed(self, business_area):
        """BA lead can be merged into another BA lead (same level)."""
        ba2 = BusinessAreaFactory()
        ba_lead_a = UserFactory(is_staff=True)
        ba_lead_b = UserFactory(is_staff=True)
        business_area.leader = ba_lead_a
        business_area.save()
        ba2.leader = ba_lead_b
        ba2.save()

        AdminTaskService.merge_users(ba_lead_a, [ba_lead_b])
        assert not User.objects.filter(pk=ba_lead_b.pk).exists()
