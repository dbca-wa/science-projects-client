"""
Tests for contact views
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.test_helpers import contacts_urls
from contacts.models import AgencyContact, BranchContact, UserContact

User = get_user_model()


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestAgencyContactViews:
    """Tests for AgencyContact views"""

    @pytest.mark.integration
    def test_list_agency_contacts_authenticated(
        self, api_client, user, agency_contact, db
    ):
        """Test listing agency contacts as authenticated user"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("agencies"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == agency_contact.id

    @pytest.mark.integration
    def test_list_agency_contacts_unauthenticated(self, api_client, db):
        """Test listing agency contacts without authentication"""
        response = api_client.get(contacts_urls.path("agencies"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_create_agency_contact_valid_data(self, api_client, user, agency, db):
        """Test creating agency contact with valid data"""
        api_client.force_authenticate(user=user)
        data = {
            "agency": agency.id,
            "email": "newagency@example.com",
            "phone": "1111111111",
        }

        response = api_client.post(contacts_urls.path("agencies"), data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newagency@example.com"
        assert AgencyContact.objects.filter(email="newagency@example.com").exists()

    @pytest.mark.integration
    def test_create_agency_contact_invalid_data(self, api_client, user, db):
        """Test creating agency contact with invalid data"""
        api_client.force_authenticate(user=user)
        data = {
            "email": "invalid@example.com",
        }

        response = api_client.post(contacts_urls.path("agencies"), data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_get_agency_contact_detail(self, api_client, user, agency_contact, db):
        """Test getting agency contact detail"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path(f"agencies/{agency_contact.id}"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == agency_contact.id
        assert response.data["email"] == "agency@example.com"

    @pytest.mark.integration
    def test_get_agency_contact_not_found(self, api_client, user, db):
        """Test getting non-existent agency contact"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("agencies/999"))

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_agency_contact(self, api_client, user, agency_contact, db):
        """Test updating agency contact"""
        api_client.force_authenticate(user=user)
        data = {"email": "updated@example.com"}

        response = api_client.put(
            contacts_urls.path(f"agencies/{agency_contact.id}"), data, format="json"
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["email"] == "updated@example.com"
        agency_contact.refresh_from_db()
        assert agency_contact.email == "updated@example.com"

    @pytest.mark.integration
    def test_delete_agency_contact(self, api_client, user, agency_contact, db):
        """Test deleting agency contact"""
        api_client.force_authenticate(user=user)
        contact_id = agency_contact.id

        response = api_client.delete(contacts_urls.path(f"agencies/{contact_id}"))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not AgencyContact.objects.filter(id=contact_id).exists()


class TestBranchContactViews:
    """Tests for BranchContact views"""

    @pytest.mark.integration
    def test_list_branch_contacts_authenticated(
        self, api_client, user, branch_contact, db
    ):
        """Test listing branch contacts as authenticated user"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("branches"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == branch_contact.id

    @pytest.mark.integration
    def test_list_branch_contacts_unauthenticated(self, api_client, db):
        """Test listing branch contacts without authentication"""
        response = api_client.get(contacts_urls.path("branches"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_create_branch_contact_valid_data(self, api_client, user, branch, db):
        """Test creating branch contact with valid data"""
        api_client.force_authenticate(user=user)
        data = {
            "branch": branch.id,
            "email": "newbranch@example.com",
            "phone": "2222222222",
        }

        response = api_client.post(contacts_urls.path("branches"), data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newbranch@example.com"
        assert BranchContact.objects.filter(email="newbranch@example.com").exists()

    @pytest.mark.integration
    def test_create_branch_contact_invalid_data(self, api_client, user, db):
        """Test creating branch contact with invalid data"""
        api_client.force_authenticate(user=user)
        data = {
            "email": "invalid@example.com",
        }

        response = api_client.post(contacts_urls.path("branches"), data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_get_branch_contact_detail(self, api_client, user, branch_contact, db):
        """Test getting branch contact detail"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path(f"branches/{branch_contact.id}"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == branch_contact.id
        assert response.data["email"] == "branch@example.com"

    @pytest.mark.integration
    def test_get_branch_contact_not_found(self, api_client, user, db):
        """Test getting non-existent branch contact"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("branches/999"))

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_branch_contact(self, api_client, user, branch_contact, db):
        """Test updating branch contact"""
        api_client.force_authenticate(user=user)
        data = {"email": "updatedbranch@example.com"}

        response = api_client.put(
            contacts_urls.path(f"branches/{branch_contact.id}"), data, format="json"
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["email"] == "updatedbranch@example.com"
        branch_contact.refresh_from_db()
        assert branch_contact.email == "updatedbranch@example.com"

    @pytest.mark.integration
    def test_delete_branch_contact(self, api_client, user, branch_contact, db):
        """Test deleting branch contact"""
        api_client.force_authenticate(user=user)
        contact_id = branch_contact.id

        response = api_client.delete(contacts_urls.path(f"branches/{contact_id}"))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not BranchContact.objects.filter(id=contact_id).exists()


class TestUserContactViews:
    """Tests for UserContact views"""

    @pytest.mark.integration
    def test_list_user_contacts_authenticated(self, api_client, user, user_contact, db):
        """Test listing user contacts as authenticated user"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("users"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == user_contact.id

    @pytest.mark.integration
    def test_list_user_contacts_unauthenticated(self, api_client, db):
        """Test listing user contacts without authentication"""
        response = api_client.get(contacts_urls.path("users"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_create_user_contact_valid_data(self, api_client, user, user_factory, db):
        """Test creating user contact with valid data"""
        api_client.force_authenticate(user=user)
        new_user = user_factory(username="newuser", email="newuser@example.com")
        data = {
            "user": new_user.id,
            "email": "newcontact@example.com",
            "phone": "3333333333",
        }

        response = api_client.post(contacts_urls.path("users"), data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newcontact@example.com"
        assert UserContact.objects.filter(email="newcontact@example.com").exists()

    @pytest.mark.integration
    def test_create_user_contact_invalid_data(self, api_client, user, db):
        """Test creating user contact with invalid data"""
        api_client.force_authenticate(user=user)
        data = {
            "email": "invalid@example.com",
        }

        response = api_client.post(contacts_urls.path("users"), data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_get_user_contact_detail(self, api_client, user, user_contact, db):
        """Test getting user contact detail"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path(f"users/{user_contact.id}"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == user_contact.id
        assert response.data["email"] == "user@example.com"

    @pytest.mark.integration
    def test_get_user_contact_not_found(self, api_client, user, db):
        """Test getting non-existent user contact"""
        api_client.force_authenticate(user=user)

        response = api_client.get(contacts_urls.path("users/999"))

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_user_contact(self, api_client, user, user_contact, db):
        """Test updating user contact"""
        api_client.force_authenticate(user=user)
        data = {"email": "updateduser@example.com"}

        response = api_client.put(
            contacts_urls.path(f"users/{user_contact.id}"), data, format="json"
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["email"] == "updateduser@example.com"
        user_contact.refresh_from_db()
        assert user_contact.email == "updateduser@example.com"

    @pytest.mark.integration
    def test_delete_user_contact(self, api_client, user, user_contact, db):
        """Test deleting user contact"""
        api_client.force_authenticate(user=user)
        contact_id = user_contact.id

        response = api_client.delete(contacts_urls.path(f"users/{contact_id}"))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not UserContact.objects.filter(id=contact_id).exists()


class TestUserContactDetailPermissions:
    """Tests for UserContactDetail permissions"""

    @pytest.mark.integration
    def test_get_user_contact_detail_unauthenticated(
        self, api_client, user_contact, db
    ):
        """Test getting user contact detail without authentication"""
        response = api_client.get(contacts_urls.path(f"users/{user_contact.id}"))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_update_user_contact_unauthenticated(self, api_client, user_contact, db):
        """Test updating user contact without authentication"""
        data = {"email": "hacker@example.com"}

        response = api_client.put(
            contacts_urls.path(f"users/{user_contact.id}"), data, format="json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_delete_user_contact_unauthenticated(self, api_client, user_contact, db):
        """Test deleting user contact without authentication"""
        response = api_client.delete(contacts_urls.path(f"users/{user_contact.id}"))

        assert response.status_code == status.HTTP_403_FORBIDDEN
