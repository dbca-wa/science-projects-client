"""
Tests for agencies serializers
"""

import pytest

from agencies.serializers import (
    AffiliationSerializer,
    AgencySerializer,
    BranchSerializer,
    BusinessAreaSerializer,
    DivisionSerializer,
    MiniBASerializer,
    MiniBranchSerializer,
    TinyAgencySerializer,
    TinyBranchSerializer,
    TinyBusinessAreaSerializer,
    TinyDivisionSerializer,
)


class TestAffiliationSerializer:
    """Tests for AffiliationSerializer"""

    @pytest.mark.unit
    def test_serialization(self, affiliation, db):
        """Test serializing an affiliation"""
        # Arrange & Act
        serializer = AffiliationSerializer(affiliation)

        # Assert
        assert serializer.data["id"] == affiliation.id
        assert serializer.data["name"] == affiliation.name
        assert "created_at" in serializer.data
        assert "updated_at" in serializer.data

    @pytest.mark.unit
    def test_deserialization_valid(self, db):
        """Test deserializing valid affiliation data"""
        # Arrange
        data = {"name": "New Affiliation"}

        # Act
        serializer = AffiliationSerializer(data=data)

        # Assert
        assert serializer.is_valid()
        affiliation = serializer.save()
        assert affiliation.name == "New Affiliation"

    @pytest.mark.unit
    def test_deserialization_invalid_missing_name(self, db):
        """Test deserializing invalid data (missing name)"""
        # Arrange
        data = {}

        # Act
        serializer = AffiliationSerializer(data=data)

        # Assert
        assert not serializer.is_valid()
        assert "name" in serializer.errors


class TestAgencySerializer:
    """Tests for AgencySerializer"""

    @pytest.mark.integration
    def test_serialization(self, agency, db):
        """Test serializing an agency"""
        # Arrange & Act
        serializer = AgencySerializer(agency)

        # Assert
        assert serializer.data["id"] == agency.id
        assert serializer.data["name"] == agency.name
        assert serializer.data["is_active"] == agency.is_active
        assert serializer.data["key_stakeholder"] == agency.key_stakeholder.id

    @pytest.mark.integration
    def test_deserialization_valid(self, user, db):
        """Test deserializing valid agency data"""
        # Arrange
        data = {
            "name": "New Agency",
            "is_active": True,
            "key_stakeholder": user.id,
        }

        # Act
        serializer = AgencySerializer(data=data)

        # Assert
        assert serializer.is_valid()
        agency = serializer.save()
        assert agency.name == "New Agency"
        assert agency.is_active is True


class TestTinyAgencySerializer:
    """Tests for TinyAgencySerializer"""

    @pytest.mark.integration
    def test_serialization_without_image(self, agency, db):
        """Test serializing agency without image"""
        # Arrange & Act
        serializer = TinyAgencySerializer(agency)

        # Assert
        assert serializer.data["id"] == agency.id
        assert serializer.data["name"] == agency.name
        assert serializer.data["image"] is None

    @pytest.mark.integration
    def test_get_image_with_attribute_error(self, agency, db):
        """Test get_image handles AttributeError gracefully"""
        # Arrange
        serializer = TinyAgencySerializer(agency)

        # Act
        result = serializer.get_image(agency)

        # Assert
        assert result is None


class TestBranchSerializer:
    """Tests for BranchSerializer"""

    @pytest.mark.unit
    def test_serialization(self, branch, db):
        """Test serializing a branch"""
        # Arrange & Act
        serializer = BranchSerializer(branch)

        # Assert
        assert serializer.data["id"] == branch.id
        assert serializer.data["name"] == branch.name
        assert serializer.data["agency"] == branch.agency.id
        assert serializer.data["manager"] == branch.manager.id

    @pytest.mark.integration
    def test_deserialization_valid(self, agency, user, db):
        """Test deserializing valid branch data"""
        # Arrange
        data = {
            "name": "New Branch",
            "agency": agency.id,
            "manager": user.id,
        }

        # Act
        serializer = BranchSerializer(data=data)

        # Assert
        assert serializer.is_valid()
        branch = serializer.save()
        assert branch.name == "New Branch"
        assert branch.agency == agency


class TestTinyBranchSerializer:
    """Tests for TinyBranchSerializer"""

    @pytest.mark.unit
    def test_serialization(self, branch, db):
        """Test serializing a branch with tiny serializer"""
        # Arrange & Act
        serializer = TinyBranchSerializer(branch)

        # Assert
        assert serializer.data["id"] == branch.id
        assert serializer.data["name"] == branch.name
        assert serializer.data["agency"] == branch.agency.id
        # Manager is now a nested user object
        manager_data = serializer.data["manager"]
        assert manager_data["id"] == branch.manager.id
        assert "display_first_name" in manager_data
        assert "display_last_name" in manager_data
        assert "email" in manager_data


class TestMiniBranchSerializer:
    """Tests for MiniBranchSerializer"""

    @pytest.mark.unit
    def test_serialization(self, branch, db):
        """Test serializing a branch with mini serializer"""
        # Arrange & Act
        serializer = MiniBranchSerializer(branch)

        # Assert
        assert serializer.data["id"] == branch.id
        assert serializer.data["name"] == branch.name
        assert "agency" not in serializer.data
        assert "manager" not in serializer.data


class TestBusinessAreaSerializer:
    """Tests for BusinessAreaSerializer"""

    @pytest.mark.integration
    def test_serialization(self, business_area, db):
        """Test serializing a business area"""
        # Arrange & Act
        serializer = BusinessAreaSerializer(business_area)

        # Assert
        assert serializer.data["id"] == business_area.id
        assert serializer.data["name"] == business_area.name
        assert serializer.data["agency"] == business_area.agency.id
        assert serializer.data["division"] == business_area.division.id

    @pytest.mark.integration
    def test_deserialization_valid(self, agency, division, user, db):
        """Test deserializing valid business area data"""
        # Arrange
        data = {
            "agency": agency.id,
            "name": "New BA",
            "slug": "new-ba",
            "division": division.id,
            "leader": user.id,
            "finance_admin": None,
            "data_custodian": None,
        }

        # Act
        serializer = BusinessAreaSerializer(data=data)

        # Assert
        assert serializer.is_valid()
        ba = serializer.save()
        assert ba.name == "New BA"
        assert ba.agency == agency

    @pytest.mark.integration
    def test_validate_leader_rejects_duplicate(
        self, business_area, agency, division, db
    ):
        """Test that a user who already leads a BA cannot lead another"""
        # Arrange — business_area fixture already has a leader
        data = {
            "agency": agency.id,
            "name": "Second BA",
            "slug": "second-ba",
            "division": division.id,
            "leader": business_area.leader.id,
        }

        # Act
        serializer = BusinessAreaSerializer(data=data)

        # Assert
        assert not serializer.is_valid()
        assert "leader" in serializer.errors
        assert (
            "This user is already the leader of another business area."
            in serializer.errors["leader"]
        )

    @pytest.mark.integration
    def test_validate_leader_allows_current_ba_leader_on_update(
        self, business_area, db
    ):
        """Test that the current BA's leader is allowed when updating that BA"""
        # Arrange
        data = {
            "name": "Updated Name",
            "leader": business_area.leader.id,
        }

        # Act
        serializer = BusinessAreaSerializer(business_area, data=data, partial=True)

        # Assert
        assert serializer.is_valid()

    @pytest.mark.integration
    def test_validate_leader_allows_null(self, agency, division, db):
        """Test that a null leader is accepted"""
        # Arrange
        data = {
            "agency": agency.id,
            "name": "No Leader BA",
            "slug": "no-leader-ba",
            "division": division.id,
            "leader": None,
        }

        # Act
        serializer = BusinessAreaSerializer(data=data)

        # Assert
        assert serializer.is_valid()


class TestTinyBusinessAreaSerializer:
    """Tests for TinyBusinessAreaSerializer"""

    @pytest.mark.integration
    def test_serialization(self, business_area, db):
        """Test serializing business area with tiny serializer"""
        # Arrange & Act
        serializer = TinyBusinessAreaSerializer(business_area)

        # Assert
        assert serializer.data["id"] == business_area.id
        assert serializer.data["name"] == business_area.name
        assert serializer.data["slug"] == business_area.slug
        leader_data = serializer.data["leader"]
        assert leader_data["id"] == business_area.leader.id
        assert (
            leader_data["display_first_name"] == business_area.leader.display_first_name
        )
        assert (
            leader_data["display_last_name"] == business_area.leader.display_last_name
        )
        assert leader_data["email"] == business_area.leader.email
        assert "division" in serializer.data


class TestMiniBASerializer:
    """Tests for MiniBASerializer"""

    @pytest.mark.integration
    def test_serialization(self, business_area, db):
        """Test serializing business area with mini serializer"""
        # Arrange & Act
        serializer = MiniBASerializer(business_area)

        # Assert
        assert serializer.data["id"] == business_area.id
        assert serializer.data["name"] == business_area.name
        assert "leader" in serializer.data
        assert "caretaker" in serializer.data

    @pytest.mark.integration
    def test_get_image_none(self, business_area, db):
        """Test get_image returns None when no image"""
        # Arrange
        serializer = MiniBASerializer(business_area)

        # Act
        result = serializer.get_image(business_area)

        # Assert
        assert result is None

    @pytest.mark.integration
    def test_get_project_count(self, business_area, db):
        """Test get_project_count returns count"""
        # Arrange
        serializer = MiniBASerializer(business_area)

        # Act
        result = serializer.get_project_count(business_area)

        # Assert
        assert result == 0

    @pytest.mark.integration
    def test_get_division(self, business_area, db):
        """Test get_division returns division info"""
        # Arrange
        serializer = MiniBASerializer(business_area)

        # Act
        result = serializer.get_division(business_area)

        # Assert
        assert result is not None
        assert result["id"] == business_area.division.id
        assert result["name"] == business_area.division.name

    @pytest.mark.integration
    def test_get_division_none(self, agency, db):
        """Test get_division returns None when no division"""
        # Arrange
        from agencies.models import BusinessArea

        ba = BusinessArea.objects.create(
            agency=agency,
            name="No Division BA",
            leader=None,
            finance_admin=None,
            data_custodian=None,
        )
        serializer = MiniBASerializer(ba)

        # Act
        result = serializer.get_division(ba)

        # Assert
        assert result is None


class TestDivisionSerializer:
    """Tests for DivisionSerializer"""

    @pytest.mark.unit
    def test_serialization(self, division, db):
        """Test serializing a division"""
        # Arrange & Act
        serializer = DivisionSerializer(division)

        # Assert
        assert serializer.data["id"] == division.id
        assert serializer.data["name"] == division.name
        assert serializer.data["slug"] == division.slug
        assert serializer.data["director"] == division.director.id

    @pytest.mark.integration
    def test_deserialization_valid(self, user, db):
        """Test deserializing valid division data"""
        # Arrange
        data = {
            "name": "New Division",
            "slug": "new-division",
            "director": user.id,
            "approver": user.id,
            # Note: directorate_email_list is ManyToMany, set after creation
        }

        # Act
        serializer = DivisionSerializer(data=data)

        # Assert
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        division = serializer.save()
        assert division.name == "New Division"
        assert division.slug == "new-division"


class TestTinyDivisionSerializer:
    """Tests for TinyDivisionSerializer"""

    @pytest.mark.unit
    def test_serialization(self, division, db):
        """Test serializing division with tiny serializer"""
        # Arrange & Act
        serializer = TinyDivisionSerializer(division)

        # Assert
        assert serializer.data["id"] == division.id
        assert serializer.data["name"] == division.name
        assert serializer.data["slug"] == division.slug

    @pytest.mark.integration
    def test_get_directorate_email_list_empty(self, division, db):
        """Test get_directorate_email_list with no users"""
        # Arrange
        serializer = TinyDivisionSerializer(division)

        # Act
        result = serializer.get_directorate_email_list(division)

        # Assert
        assert result == []

    @pytest.mark.integration
    def test_get_directorate_email_list_with_users(self, division, user, db):
        """Test get_directorate_email_list with users"""
        # Arrange
        from common.tests.factories import UserFactory

        user1 = UserFactory()
        division.directorate_email_list.add(user1)
        serializer = TinyDivisionSerializer(division)

        # Act
        result = serializer.get_directorate_email_list(division)

        # Assert
        assert len(result) == 1
        assert result[0]["id"] == user1.id
        assert result[0]["email"] == user1.email
