"""
Tests for projects/serializers/details.py — targeting 45 missed lines.
Covers all get_* SerializerMethodField methods across the detail serializers.
"""

import pytest

from common.tests.factories import ProjectFactory, UserFactory


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def project(db, user):
    return ProjectFactory(members=[user], members__leader=user)


@pytest.fixture
def project_detail(db, project, user):
    from projects.models import ProjectDetail

    return ProjectDetail.objects.create(
        project=project,
        creator=user,
        modifier=user,
        owner=user,
        data_custodian=user,
        site_custodian=user,
    )


@pytest.fixture
def project_detail_no_relations(db, project):
    """ProjectDetail with all FK fields set to None."""
    from projects.models import ProjectDetail

    return ProjectDetail.objects.create(
        project=project,
        creator=None,
        modifier=None,
        owner=None,
        data_custodian=None,
        site_custodian=None,
    )


# ===========================================================================
# ProjectDetailSerializer tests
# ===========================================================================


class TestProjectDetailSerializer:
    """Cover lines 18-24, 27-33, 36-42, 45-51, 54-60, 63-69."""

    @pytest.mark.integration
    def test_get_methods_with_data(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer(project_detail)
        data = serializer.data

        # Verify all fields are serialised (base serializer uses __all__)
        assert data["id"] is not None

    @pytest.mark.integration
    def test_get_project_returns_dict(self, project_detail):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_project(project_detail)
        assert result["id"] == project_detail.project.pk
        assert result["title"] == project_detail.project.title

    @pytest.mark.integration
    def test_get_creator_returns_dict(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_creator(project_detail)
        assert result["id"] == user.pk
        assert result["username"] == user.username

    @pytest.mark.integration
    def test_get_modifier_returns_dict(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_modifier(project_detail)
        assert result["id"] == user.pk

    @pytest.mark.integration
    def test_get_owner_returns_dict(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_owner(project_detail)
        assert result["id"] == user.pk

    @pytest.mark.integration
    def test_get_data_custodian_returns_dict(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_data_custodian(project_detail)
        assert result["id"] == user.pk

    @pytest.mark.integration
    def test_get_site_custodian_returns_dict(self, project_detail, user):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        result = serializer.get_site_custodian(project_detail)
        assert result["id"] == user.pk

    @pytest.mark.integration
    def test_get_methods_return_none_when_null(self, project_detail_no_relations):
        from projects.serializers.details import ProjectDetailSerializer

        serializer = ProjectDetailSerializer()
        # project FK is still set, but user FKs are None
        assert serializer.get_creator(project_detail_no_relations) is None
        assert serializer.get_modifier(project_detail_no_relations) is None
        assert serializer.get_owner(project_detail_no_relations) is None
        assert serializer.get_data_custodian(project_detail_no_relations) is None
        assert serializer.get_site_custodian(project_detail_no_relations) is None


# ===========================================================================
# ProjectDetailViewSerializer tests
# ===========================================================================


class TestProjectDetailViewSerializer:
    """Cover lines 93, 111, 120, 125, 134, 170, 179, 188, 197, 202, 211."""

    @pytest.mark.integration
    def test_serializes_with_all_relations(self, project_detail, user):
        from projects.serializers.details import ProjectDetailViewSerializer

        serializer = ProjectDetailViewSerializer(project_detail)
        data = serializer.data

        assert data["project"]["id"] == project_detail.project.pk
        assert data["creator"]["id"] == user.pk
        assert data["modifier"]["id"] == user.pk
        assert data["owner"]["id"] == user.pk
        assert data["data_custodian"]["id"] == user.pk
        assert data["site_custodian"]["id"] == user.pk

    @pytest.mark.integration
    def test_serializes_with_null_relations(self, project_detail_no_relations):
        from projects.serializers.details import ProjectDetailViewSerializer

        serializer = ProjectDetailViewSerializer(project_detail_no_relations)
        data = serializer.data

        assert data["creator"] is None
        assert data["modifier"] is None
        assert data["owner"] is None
        assert data["data_custodian"] is None
        assert data["site_custodian"] is None


# ===========================================================================
# TinyProjectDetailSerializer tests
# ===========================================================================


class TestTinyProjectDetailSerializer:
    """Cover lines 226-232, 256, 267-273, 299."""

    @pytest.mark.integration
    def test_tiny_with_relations(self, project_detail, user):
        from projects.serializers.details import TinyProjectDetailSerializer

        serializer = TinyProjectDetailSerializer(project_detail)
        data = serializer.data

        assert data["project"]["id"] == project_detail.project.pk
        assert data["creator"]["id"] == user.pk
        assert data["owner"]["id"] == user.pk

    @pytest.mark.integration
    def test_tiny_with_null_relations(self, project_detail_no_relations):
        from projects.serializers.details import TinyProjectDetailSerializer

        serializer = TinyProjectDetailSerializer(project_detail_no_relations)
        data = serializer.data

        assert data["creator"] is None
        assert data["modifier"] is None
        assert data["owner"] is None
        assert data["data_custodian"] is None
        assert data["site_custodian"] is None


# ===========================================================================
# StudentProjectDetailSerializer + TinyStudentProjectDetailSerializer tests
# ===========================================================================


class TestStudentProjectDetailSerializers:
    """Cover get_project method on student serializers."""

    @pytest.mark.integration
    def test_student_detail_serializer(self, project, user):
        from projects.models import StudentProjectDetails
        from projects.serializers.details import StudentProjectDetailSerializer

        student_detail = StudentProjectDetails.objects.create(
            project=project,
            organisation="UWA",
            level="phd",
        )
        serializer = StudentProjectDetailSerializer(student_detail)
        data = serializer.data
        assert data["organisation"] == "UWA"

    @pytest.mark.integration
    def test_tiny_student_get_project(self, project, user):
        from projects.models import StudentProjectDetails
        from projects.serializers.details import TinyStudentProjectDetailSerializer

        student_detail = StudentProjectDetails.objects.create(
            project=project,
            organisation="Curtin",
            level="honours",
        )
        serializer = TinyStudentProjectDetailSerializer(student_detail)
        data = serializer.data
        assert data["project"]["id"] == project.pk
        assert data["project"]["title"] == project.title


# ===========================================================================
# ExternalProjectDetailSerializer + TinyExternalProjectDetailSerializer tests
# ===========================================================================


class TestExternalProjectDetailSerializers:
    """Cover get_project method on external serializers."""

    @pytest.mark.integration
    def test_external_detail_serializer(self, project, user):
        from projects.models import ExternalProjectDetails
        from projects.serializers.details import ExternalProjectDetailSerializer

        ext_detail = ExternalProjectDetails.objects.create(
            project=project,
            description="External work",
            aims="Study biodiversity",
        )
        serializer = ExternalProjectDetailSerializer(ext_detail)
        data = serializer.data
        assert data["description"] == "External work"

    @pytest.mark.integration
    def test_tiny_external_get_project(self, project, user):
        from projects.models import ExternalProjectDetails
        from projects.serializers.details import TinyExternalProjectDetailSerializer

        ext_detail = ExternalProjectDetails.objects.create(
            project=project,
            description="Ext desc",
            aims="Aims",
            budget="10000",
            collaboration_with="CSIRO",
        )
        serializer = TinyExternalProjectDetailSerializer(ext_detail)
        data = serializer.data
        assert data["project"]["id"] == project.pk
        assert data["collaboration_with"] == "CSIRO"
