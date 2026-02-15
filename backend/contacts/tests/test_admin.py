"""
Tests for contact admin
"""

import pytest
from django.contrib import admin
from django.contrib.admin.sites import AdminSite

from contacts.admin import (
    AddressAdmin,
    AgencyContactAdmin,
    BranchContactAdmin,
    UserContactAdmin,
)
from contacts.models import Address, AgencyContact, BranchContact, UserContact


class TestAddressAdmin:
    """Tests for AddressAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        # Arrange
        admin_instance = AddressAdmin(Address, AdminSite())

        # Assert
        assert admin_instance.list_display == [
            "street",
            "state",
            "country",
            "agency",
            "branch",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        # Arrange
        admin_instance = AddressAdmin(Address, AdminSite())

        # Assert
        assert admin_instance.search_fields == ["street", "branch__name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test AddressAdmin is registered"""
        # Assert
        assert admin.site.is_registered(Address)


class TestUserContactAdmin:
    """Tests for UserContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        # Arrange
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        # Assert
        assert admin_instance.list_display == [
            "user",
            "email",
            "phone",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        # Arrange
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        # Assert
        assert admin_instance.search_fields == [
            "user_id__first_name",
            "user_id__username",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        # Arrange
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        # Assert
        assert admin_instance.ordering == ["user__first_name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test UserContactAdmin is registered"""
        # Assert
        assert admin.site.is_registered(UserContact)


class TestBranchContactAdmin:
    """Tests for BranchContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        # Assert
        assert admin_instance.list_display == [
            "branch",
            "email",
            "phone",
            "display_address",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        # Assert
        assert admin_instance.search_fields == [
            "branch__name",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        # Assert
        assert admin_instance.ordering == ["branch__name"]

    @pytest.mark.unit
    def test_display_address_with_address(self, branch_contact, db):
        """Test display_address method with address"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        # Act
        result = admin_instance.display_address(branch_contact)

        # Assert
        assert result == "456 Branch St"

    @pytest.mark.unit
    def test_display_address_without_address(self, branch, db):
        """Test display_address method without address"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())
        contact = BranchContact.objects.create(
            branch=branch,
            email="noaddress@example.com",
        )

        # Act
        result = admin_instance.display_address(contact)

        # Assert
        assert result is None

    @pytest.mark.unit
    def test_display_address_short_description(self, db):
        """Test display_address has short_description"""
        # Arrange
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        # Assert
        assert admin_instance.display_address.short_description == "Address"

    @pytest.mark.unit
    def test_registered(self, db):
        """Test BranchContactAdmin is registered"""
        # Assert
        assert admin.site.is_registered(BranchContact)


class TestAgencyContactAdmin:
    """Tests for AgencyContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        # Arrange
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        # Assert
        assert admin_instance.list_display == [
            "agency",
            "email",
            "phone",
            "address",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        # Arrange
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        # Assert
        assert admin_instance.search_fields == [
            "agency__name",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        # Arrange
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        # Assert
        assert admin_instance.ordering == ["agency__name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test AgencyContactAdmin is registered"""
        # Assert
        assert admin.site.is_registered(AgencyContact)
