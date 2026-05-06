"""
Tests for contact admin
"""

import pytest
from django.contrib import admin
from django.contrib.admin.sites import AdminSite

from contacts.admin import (
    AgencyContactAdmin,
    BranchContactAdmin,
    UserContactAdmin,
)
from contacts.models import AgencyContact, BranchContact, UserContact


class TestUserContactAdmin:
    """Tests for UserContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        assert admin_instance.list_display == [
            "pk",
            "user",
            "email",
            "phone",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        assert admin_instance.search_fields == [
            "user__first_name",
            "user__last_name",
            "user__username",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        admin_instance = UserContactAdmin(UserContact, AdminSite())

        assert admin_instance.ordering == ["user__first_name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test UserContactAdmin is registered"""
        assert admin.site.is_registered(UserContact)


class TestBranchContactAdmin:
    """Tests for BranchContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        assert admin_instance.list_display == [
            "pk",
            "branch",
            "email",
            "phone",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        assert admin_instance.search_fields == [
            "branch__name",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        admin_instance = BranchContactAdmin(BranchContact, AdminSite())

        assert admin_instance.ordering == ["branch__name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test BranchContactAdmin is registered"""
        assert admin.site.is_registered(BranchContact)


class TestAgencyContactAdmin:
    """Tests for AgencyContactAdmin"""

    @pytest.mark.unit
    def test_list_display(self, db):
        """Test list_display configuration"""
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        assert admin_instance.list_display == [
            "pk",
            "agency",
            "email",
            "phone",
        ]

    @pytest.mark.unit
    def test_search_fields(self, db):
        """Test search_fields configuration"""
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        assert admin_instance.search_fields == [
            "agency__name",
        ]

    @pytest.mark.unit
    def test_ordering(self, db):
        """Test ordering configuration"""
        admin_instance = AgencyContactAdmin(AgencyContact, AdminSite())

        assert admin_instance.ordering == ["agency__name"]

    @pytest.mark.unit
    def test_registered(self, db):
        """Test AgencyContactAdmin is registered"""
        assert admin.site.is_registered(AgencyContact)
