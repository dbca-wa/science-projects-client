"""
Tests for UserService.create_user() — external and internal user creation.

Verifies that external users get only a base User record, while staff users
also get UserWork, UserProfile, UserContact, and PublicStaffProfile records.
"""

import pytest
from django.db import IntegrityError

from agencies.models import Agency, Branch, BusinessArea, Division
from contacts.models import UserContact
from users.models import PublicStaffProfile, User, UserProfile, UserWork
from users.services.user_service import UserService


@pytest.mark.django_db
@pytest.mark.integration
class TestCreateExternalUser:
    """Tests for creating external (non-staff) users via UserService.create_user()."""

    def test_create_external_user_basic(self):
        """External user is created with correct fields and is_staff=False."""
        data = {
            "username": "external_user",
            "email": "external@example.com",
            "first_name": "Jane",
            "last_name": "Public",
            "is_staff": False,
        }

        user = UserService.create_user(data)

        assert user.pk is not None
        assert user.username == "external_user"
        assert user.email == "external@example.com"
        assert user.first_name == "Jane"
        assert user.last_name == "Public"
        assert user.display_first_name == "Jane"
        assert user.display_last_name == "Public"
        assert user.is_staff is False

    def test_create_external_user_no_associated_records(self):
        """External user does NOT get UserWork, UserProfile, UserContact, or PublicStaffProfile."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "ext_no_records",
            "email": "ext_no_records@example.com",
            "first_name": "Solo",
            "last_name": "User",
            "is_staff": False,
        }

        user = UserService.create_user(data)

        assert not UserWork.objects.filter(user=user).exists()
        assert not UserProfile.objects.filter(user=user).exists()
        assert not UserContact.objects.filter(user=user).exists()
        assert not PublicStaffProfile.objects.filter(user=user).exists()

    def test_create_external_user_display_names_populated(self):
        """display_first_name and display_last_name are set from first_name and last_name."""
        data = {
            "username": "ext_display",
            "email": "ext_display@example.com",
            "first_name": "Alice",
            "last_name": "Wonder",
            "is_staff": False,
        }

        user = UserService.create_user(data)

        assert user.display_first_name == "Alice"
        assert user.display_last_name == "Wonder"


@pytest.mark.django_db
@pytest.mark.integration
class TestCreateStaffUser:
    """Tests for creating staff (internal) users via UserService.create_user()."""

    def test_create_staff_user_basic(self):
        """Staff user is created with correct fields and is_staff=True."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_user",
            "email": "staff@dbca.wa.gov.au",
            "first_name": "John",
            "last_name": "Staff",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert user.pk is not None
        assert user.username == "staff_user"
        assert user.email == "staff@dbca.wa.gov.au"
        assert user.first_name == "John"
        assert user.last_name == "Staff"
        assert user.display_first_name == "John"
        assert user.display_last_name == "Staff"
        assert user.is_staff is True

    def test_create_staff_user_creates_user_work(self):
        """Staff user gets a UserWork record linked to the agency."""
        agency = Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_work",
            "email": "staff_work@dbca.wa.gov.au",
            "first_name": "Work",
            "last_name": "Test",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert UserWork.objects.filter(user=user).exists()
        work = UserWork.objects.get(user=user)
        assert work.agency == agency

    def test_create_staff_user_creates_user_profile(self):
        """Staff user gets a UserProfile record."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_profile",
            "email": "staff_profile@dbca.wa.gov.au",
            "first_name": "Profile",
            "last_name": "Test",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert UserProfile.objects.filter(user=user).exists()

    def test_create_staff_user_creates_user_contact(self):
        """Staff user gets a UserContact record."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_contact",
            "email": "staff_contact@dbca.wa.gov.au",
            "first_name": "Contact",
            "last_name": "Test",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert UserContact.objects.filter(user=user).exists()

    def test_create_staff_user_creates_public_staff_profile(self):
        """Staff user gets a PublicStaffProfile with is_hidden=True."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_psp",
            "email": "staff_psp@dbca.wa.gov.au",
            "first_name": "PSP",
            "last_name": "Test",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert PublicStaffProfile.objects.filter(user=user).exists()
        psp = PublicStaffProfile.objects.get(user=user)
        assert psp.is_hidden is True

    def test_create_staff_user_with_branch_and_business_area(self):
        """Staff user created with branch and business_area IDs has them set on UserWork."""
        agency = Agency.objects.create(name="DBCA")
        division = Division.objects.create(name="Biodiversity", slug="biodiversity")
        branch = Branch.objects.create(name="Science Branch", agency=agency)
        ba = BusinessArea.objects.create(
            name="Ecosystem Science",
            agency=agency,
            division=division,
            leader=None,
            finance_admin=None,
            data_custodian=None,
        )

        data = {
            "username": "staff_ba",
            "email": "staff_ba@dbca.wa.gov.au",
            "first_name": "BA",
            "last_name": "Test",
            "is_staff": True,
            "branch": branch.pk,
            "business_area": ba.pk,
        }

        user = UserService.create_user(data)

        work = UserWork.objects.get(user=user)
        assert work.branch == branch
        assert work.business_area == ba

    def test_create_staff_user_display_names_populated(self):
        """Staff user display_first_name and display_last_name match first/last name."""
        Agency.objects.create(name="DBCA")

        data = {
            "username": "staff_display",
            "email": "staff_display@dbca.wa.gov.au",
            "first_name": "Display",
            "last_name": "Names",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert user.display_first_name == "Display"
        assert user.display_last_name == "Names"


@pytest.mark.django_db
@pytest.mark.integration
class TestCreateUserEdgeCases:
    """Edge case tests for UserService.create_user()."""

    def test_create_user_empty_names_still_creates(self):
        """User with empty first/last name is still created (display names will be empty)."""
        data = {
            "username": "empty_names",
            "email": "empty_names@example.com",
            "first_name": "",
            "last_name": "",
            "is_staff": False,
        }

        user = UserService.create_user(data)

        assert user.pk is not None
        assert user.username == "empty_names"
        assert user.first_name == ""
        assert user.last_name == ""
        assert user.display_first_name == ""
        assert user.display_last_name == ""

    def test_create_user_duplicate_username_raises(self):
        """Creating a user with a duplicate username raises IntegrityError."""
        UserService.create_user(
            {
                "username": "duplicate",
                "email": "first@example.com",
                "first_name": "First",
                "last_name": "User",
            }
        )

        with pytest.raises(IntegrityError):
            UserService.create_user(
                {
                    "username": "duplicate",
                    "email": "second@example.com",
                    "first_name": "Second",
                    "last_name": "User",
                }
            )

    def test_staff_user_should_use_email_as_username(self):
        """
        Staff users created via the form should use email as username.
        This matches the DBCA SSO middleware's lookup pattern — if the
        username doesn't match, the middleware creates a duplicate account.
        This test documents the expected convention (enforced by the frontend).
        """
        Agency.objects.create(name="DBCA")

        # Simulate what the frontend now sends: username = email
        data = {
            "username": "john.staff@dbca.wa.gov.au",
            "email": "john.staff@dbca.wa.gov.au",
            "first_name": "John",
            "last_name": "Staff",
            "is_staff": True,
        }

        user = UserService.create_user(data)

        assert user.username == "john.staff@dbca.wa.gov.au"
        assert user.email == "john.staff@dbca.wa.gov.au"
        assert user.display_first_name == "John"
        assert user.display_last_name == "Staff"
        assert user.is_staff is True
        assert UserWork.objects.filter(user=user).exists()
        assert UserProfile.objects.filter(user=user).exists()
        assert UserContact.objects.filter(user=user).exists()
        assert PublicStaffProfile.objects.filter(user=user).exists()

    def test_external_user_uses_generated_username(self):
        """
        External users use a generated username (not email) since they
        never log in via SSO. This is fine and expected.
        """
        data = {
            "username": "janeexternal2026",
            "email": "jane@external.com",
            "first_name": "Jane",
            "last_name": "External",
            "is_staff": False,
        }

        user = UserService.create_user(data)

        assert user.username == "janeexternal2026"
        assert user.email == "jane@external.com"
        assert user.is_staff is False
        assert not UserWork.objects.filter(user=user).exists()


@pytest.mark.django_db
@pytest.mark.integration
class TestCreateUserViaAPI:
    """Tests for creating users via the POST /users API endpoint."""

    def test_create_staff_user_via_api_sets_branch_and_business_area(self):
        """Branch and business_area sent in the POST body are set on UserWork."""
        from rest_framework.test import APIClient

        agency = Agency.objects.create(name="DBCA")
        admin = User.objects.create_superuser(
            username="admin", email="admin@dbca.wa.gov.au", password="testpass"
        )
        division = Division.objects.create(name="BCS", slug="bcs")
        branch = Branch.objects.create(name="Science", agency=agency)
        ba = BusinessArea.objects.create(
            name="Ecosystem Science",
            agency=agency,
            division=division,
            leader=None,
            finance_admin=None,
            data_custodian=None,
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            "/api/v1/users/list",
            {
                "username": "api.staff@dbca.wa.gov.au",
                "email": "api.staff@dbca.wa.gov.au",
                "first_name": "API",
                "last_name": "Staff",
                "is_staff": True,
                "branch": branch.pk,
                "business_area": ba.pk,
            },
            format="json",
        )

        assert (
            response.status_code == 201
        ), f"Expected 201, got {response.status_code}: {getattr(response, 'data', response.content)}"
        user = User.objects.get(username="api.staff@dbca.wa.gov.au")
        assert user.display_first_name == "API"
        assert user.display_last_name == "Staff"
        assert user.is_staff is True

        work = UserWork.objects.get(user=user)
        assert work.branch_id == branch.pk
        assert work.business_area_id == ba.pk

    def test_create_staff_user_via_api_without_branch_still_works(self):
        """Staff user created without branch/business_area still gets UserWork."""
        from rest_framework.test import APIClient

        Agency.objects.create(name="DBCA")
        admin = User.objects.create_superuser(
            username="admin2", email="admin2@dbca.wa.gov.au", password="testpass"
        )

        client = APIClient()
        client.force_authenticate(user=admin)

        response = client.post(
            "/api/v1/users/list",
            {
                "username": "nobranchstaff@dbca.wa.gov.au",
                "email": "nobranchstaff@dbca.wa.gov.au",
                "first_name": "No",
                "last_name": "Branch",
                "is_staff": True,
            },
            format="json",
        )

        assert response.status_code == 201
        user = User.objects.get(username="nobranchstaff@dbca.wa.gov.au")
        work = UserWork.objects.get(user=user)
        assert work.branch is None
        assert work.business_area is None

    def test_delete_user_cascades_associated_records(self):
        """Deleting a user cascades to UserWork, UserProfile, UserContact, PublicStaffProfile."""
        Agency.objects.create(name="DBCA")  # Required for staff user creation

        data = {
            "username": "cascade_test@dbca.wa.gov.au",
            "email": "cascade_test@dbca.wa.gov.au",
            "first_name": "Cascade",
            "last_name": "Test",
            "is_staff": True,
        }
        user = UserService.create_user(data)
        user_pk = user.pk

        # Verify records exist
        assert UserWork.objects.filter(user_id=user_pk).exists()
        assert UserProfile.objects.filter(user_id=user_pk).exists()
        assert UserContact.objects.filter(user_id=user_pk).exists()
        assert PublicStaffProfile.objects.filter(user_id=user_pk).exists()

        # Delete user
        user.delete()

        # All associated records should be gone
        assert not UserWork.objects.filter(user_id=user_pk).exists()
        assert not UserProfile.objects.filter(user_id=user_pk).exists()
        assert not UserContact.objects.filter(user_id=user_pk).exists()
        assert not PublicStaffProfile.objects.filter(user_id=user_pk).exists()
