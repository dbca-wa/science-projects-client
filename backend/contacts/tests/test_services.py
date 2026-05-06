"""
Tests for contact services
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound

from contacts.models import AgencyContact, BranchContact, UserContact
from contacts.services.contact_service import ContactService

User = get_user_model()


class TestAgencyContactService:
    """Tests for AgencyContact service operations"""

    @pytest.mark.integration
    def test_list_agency_contacts(self, agency_contact, db):
        """Test listing all agency contacts"""
        contacts = ContactService.list_agency_contacts()

        assert contacts.count() == 1
        assert agency_contact in contacts

    @pytest.mark.integration
    def test_get_agency_contact(self, agency_contact, db):
        """Test getting agency contact by ID"""
        contact = ContactService.get_agency_contact(agency_contact.id)

        assert contact.id == agency_contact.id
        assert contact.email == "agency@example.com"

    @pytest.mark.integration
    def test_get_agency_contact_not_found(self, db):
        """Test getting non-existent agency contact raises NotFound"""
        with pytest.raises(NotFound, match="Agency contact 999 not found"):
            ContactService.get_agency_contact(999)

    @pytest.mark.integration
    def test_create_agency_contact(self, user, agency, db):
        """Test creating an agency contact"""
        data = {
            "agency": agency,
            "email": "newagency@example.com",
            "phone": "1111111111",
        }

        contact = ContactService.create_agency_contact(user, data)

        assert contact.id is not None
        assert contact.email == "newagency@example.com"
        assert contact.agency == agency

    @pytest.mark.integration
    def test_update_agency_contact(self, agency_contact, user, db):
        """Test updating an agency contact"""
        data = {"email": "updated@example.com"}

        updated = ContactService.update_agency_contact(agency_contact.id, user, data)

        assert updated.id == agency_contact.id
        assert updated.email == "updated@example.com"

    @pytest.mark.integration
    def test_delete_agency_contact(self, agency_contact, user, db):
        """Test deleting an agency contact"""
        contact_id = agency_contact.id

        ContactService.delete_agency_contact(contact_id, user)

        assert not AgencyContact.objects.filter(id=contact_id).exists()


class TestBranchContactService:
    """Tests for BranchContact service operations"""

    @pytest.mark.unit
    def test_list_branch_contacts(self, branch_contact, db):
        """Test listing all branch contacts"""
        contacts = ContactService.list_branch_contacts()

        assert contacts.count() == 1
        assert branch_contact in contacts

    @pytest.mark.unit
    def test_get_branch_contact(self, branch_contact, db):
        """Test getting branch contact by ID"""
        contact = ContactService.get_branch_contact(branch_contact.id)

        assert contact.id == branch_contact.id
        assert contact.email == "branch@example.com"

    @pytest.mark.unit
    def test_get_branch_contact_not_found(self, db):
        """Test getting non-existent branch contact raises NotFound"""
        with pytest.raises(NotFound, match="Branch contact 999 not found"):
            ContactService.get_branch_contact(999)

    @pytest.mark.integration
    def test_create_branch_contact(self, user, branch, db):
        """Test creating a branch contact"""
        data = {
            "branch": branch,
            "email": "newbranch@example.com",
            "phone": "2222222222",
        }

        contact = ContactService.create_branch_contact(user, data)

        assert contact.id is not None
        assert contact.email == "newbranch@example.com"
        assert contact.branch == branch

    @pytest.mark.integration
    def test_update_branch_contact(self, branch_contact, user, db):
        """Test updating a branch contact"""
        data = {"email": "updatedbranch@example.com"}

        updated = ContactService.update_branch_contact(branch_contact.id, user, data)

        assert updated.id == branch_contact.id
        assert updated.email == "updatedbranch@example.com"

    @pytest.mark.integration
    def test_delete_branch_contact(self, branch_contact, user, db):
        """Test deleting a branch contact"""
        contact_id = branch_contact.id

        ContactService.delete_branch_contact(contact_id, user)

        assert not BranchContact.objects.filter(id=contact_id).exists()


class TestUserContactService:
    """Tests for UserContact service operations"""

    @pytest.mark.integration
    def test_list_user_contacts(self, user_contact, db):
        """Test listing all user contacts"""
        contacts = ContactService.list_user_contacts()

        assert contacts.count() == 1
        assert user_contact in contacts

    @pytest.mark.integration
    def test_get_user_contact(self, user_contact, db):
        """Test getting user contact by ID"""
        contact = ContactService.get_user_contact(user_contact.id)

        assert contact.id == user_contact.id
        assert contact.email == "user@example.com"

    @pytest.mark.integration
    def test_get_user_contact_not_found(self, db):
        """Test getting non-existent user contact raises NotFound"""
        with pytest.raises(NotFound, match="User contact 999 not found"):
            ContactService.get_user_contact(999)

    @pytest.mark.integration
    def test_create_user_contact(self, user, user_factory, db):
        """Test creating a user contact"""
        new_user = user_factory(username="newuser", email="newuser@example.com")
        data = {
            "user": new_user,
            "email": "newcontact@example.com",
            "phone": "3333333333",
        }

        contact = ContactService.create_user_contact(user, data)

        assert contact.id is not None
        assert contact.email == "newcontact@example.com"
        assert contact.user == new_user

    @pytest.mark.integration
    def test_update_user_contact(self, user_contact, user, db):
        """Test updating a user contact"""
        data = {"email": "updateduser@example.com"}

        updated = ContactService.update_user_contact(user_contact.id, user, data)

        assert updated.id == user_contact.id
        assert updated.email == "updateduser@example.com"

    @pytest.mark.integration
    def test_delete_user_contact(self, user_contact, user, db):
        """Test deleting a user contact"""
        contact_id = user_contact.id

        ContactService.delete_user_contact(contact_id, user)

        assert not UserContact.objects.filter(id=contact_id).exists()
