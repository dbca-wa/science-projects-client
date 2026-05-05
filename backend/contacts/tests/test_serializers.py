"""
Tests for contact serializers
"""

import pytest

from contacts.serializers import (
    AgencyContactSerializer,
    BranchContactSerializer,
    TinyAgencyContactSerializer,
    TinyBranchContactSerializer,
    TinyUserContactSerializer,
    UserContactSerializer,
)


class TestTinyUserContactSerializer:
    """Tests for TinyUserContactSerializer"""

    @pytest.mark.integration
    def test_serialization(self, user_contact, db):
        """Test serializing user contact with nested user"""
        serializer = TinyUserContactSerializer(user_contact)
        data = serializer.data

        assert data["id"] == user_contact.id
        assert data["user"]["id"] == user_contact.user.id
        assert data["user"]["username"] == "testuser"
        assert data["user"]["email"] == "test@example.com"


class TestUserContactSerializer:
    """Tests for UserContactSerializer"""

    @pytest.mark.integration
    def test_serialization(self, user_contact, db):
        """Test serializing user contact"""
        serializer = UserContactSerializer(user_contact)
        data = serializer.data

        assert data["id"] == user_contact.id
        assert data["user"]["id"] == user_contact.user.id
        assert data["user"]["username"] == "testuser"
        assert data["email"] == "user@example.com"
        assert data["phone"] == "1234567890"
        assert data["alt_phone"] == "0987654321"
        assert data["fax"] == "1112223333"

    @pytest.mark.integration
    def test_serialization_all_fields(self, user_contact, db):
        """Test all fields are serialized"""
        serializer = UserContactSerializer(user_contact)
        data = serializer.data

        assert "id" in data
        assert "user" in data
        assert "email" in data
        assert "phone" in data
        assert "alt_phone" in data
        assert "fax" in data
        assert "created_at" in data
        assert "updated_at" in data


class TestTinyAgencyContactSerializer:
    """Tests for TinyAgencyContactSerializer"""

    @pytest.mark.integration
    def test_serialization(self, agency_contact, db):
        """Test serializing agency contact with nested agency"""
        serializer = TinyAgencyContactSerializer(agency_contact)
        data = serializer.data

        assert data["id"] == agency_contact.id
        assert data["agency"]["id"] == agency_contact.agency.id
        assert data["agency"]["name"] == "Test Agency"
        assert data["email"] == "agency@example.com"

    @pytest.mark.integration
    def test_serialization_fields(self, agency_contact, db):
        """Test TinyAgencyContactSerializer only includes specified fields"""
        serializer = TinyAgencyContactSerializer(agency_contact)
        data = serializer.data

        assert "id" in data
        assert "agency" in data
        assert "email" in data


class TestAgencyContactSerializer:
    """Tests for AgencyContactSerializer"""

    @pytest.mark.integration
    def test_serialization(self, agency_contact, db):
        """Test serializing agency contact"""
        serializer = AgencyContactSerializer(agency_contact)
        data = serializer.data

        assert data["id"] == agency_contact.id
        assert data["agency"]["id"] == agency_contact.agency.id
        assert data["email"] == "agency@example.com"
        assert data["phone"] == "1234567890"
        assert data["alt_phone"] == "0987654321"
        assert data["fax"] == "1112223333"

    @pytest.mark.integration
    def test_serialization_all_fields(self, agency_contact, db):
        """Test all fields are serialized"""
        serializer = AgencyContactSerializer(agency_contact)
        data = serializer.data

        assert "id" in data
        assert "agency" in data
        assert "email" in data
        assert "phone" in data
        assert "alt_phone" in data
        assert "fax" in data
        assert "created_at" in data
        assert "updated_at" in data


class TestTinyBranchContactSerializer:
    """Tests for TinyBranchContactSerializer"""

    @pytest.mark.unit
    def test_serialization(self, branch_contact, db):
        """Test serializing branch contact with nested branch"""
        serializer = TinyBranchContactSerializer(branch_contact)
        data = serializer.data

        assert data["id"] == branch_contact.id
        assert data["branch"]["id"] == branch_contact.branch.id
        assert data["branch"]["name"] == "Test Branch"
        assert data["email"] == "branch@example.com"

    @pytest.mark.unit
    def test_serialization_fields(self, branch_contact, db):
        """Test TinyBranchContactSerializer only includes specified fields"""
        serializer = TinyBranchContactSerializer(branch_contact)
        data = serializer.data

        assert "id" in data
        assert "branch" in data
        assert "email" in data


class TestBranchContactSerializer:
    """Tests for BranchContactSerializer"""

    @pytest.mark.unit
    def test_serialization(self, branch_contact, db):
        """Test serializing branch contact"""
        serializer = BranchContactSerializer(branch_contact)
        data = serializer.data

        assert data["id"] == branch_contact.id
        assert data["branch"]["id"] == branch_contact.branch.id
        assert data["email"] == "branch@example.com"
        assert data["phone"] == "1234567890"
        assert data["alt_phone"] == "0987654321"
        assert data["fax"] == "1112223333"

    @pytest.mark.unit
    def test_serialization_all_fields(self, branch_contact, db):
        """Test all fields are serialized"""
        serializer = BranchContactSerializer(branch_contact)
        data = serializer.data

        assert "id" in data
        assert "branch" in data
        assert "email" in data
        assert "phone" in data
        assert "alt_phone" in data
        assert "fax" in data
        assert "created_at" in data
        assert "updated_at" in data
