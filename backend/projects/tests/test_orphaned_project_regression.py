"""
Regression tests for partially created ("orphaned") projects.

A project whose related ProjectArea was never created breaks the project list
endpoint, because ProjectSerializer.get_areas dereferences the reverse
one-to-one relation. These tests cover both halves of the problem:

1. Creation never commits a project unless all of its related records are saved.
2. Serialisation tolerates a project that has no area, so pre-existing rows
   cannot take the list endpoint down.
"""

from io import BytesIO
from unittest.mock import PropertyMock, patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from common.tests.factories import BusinessAreaFactory, ProjectFactory, UserFactory
from medias.models import IMAGE_MAX_SIZE
from projects.models import Project, ProjectArea

CREATE_URL = "/api/v1/projects/list"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def business_area(db):
    return BusinessAreaFactory()


def _small_image():
    """A valid JPEG comfortably under the size limit."""
    buffer = BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="JPEG")
    buffer.seek(0)
    return SimpleUploadedFile("small.jpg", buffer.read(), content_type="image/jpeg")


def _oversized_image():
    """A file larger than IMAGE_MAX_SIZE, mirroring the production upload."""
    return SimpleUploadedFile(
        "huge.jpg",
        b"\xff\xd8\xff\xe0" + b"0" * (IMAGE_MAX_SIZE + 1024),
        content_type="image/jpeg",
    )


def _payload(business_area, user, kind="student"):
    data = {
        "kind": kind,
        "title": "Karri drought resilience",
        "description": "A test project",
        "businessArea": business_area.pk,
        "projectLead": str(user.pk),
        "creator": str(user.pk),
        "dataCustodian": str(user.pk),
        "keywords": "karri",
        "year": "2026",
    }
    if kind == "student":
        data["organisation"] = "UWA"
        data["level"] = "phd"
    return data


class TestCreateNeverLeavesOrphans:
    """Project creation must be all-or-nothing."""

    @pytest.mark.integration
    def test_oversized_image_creates_nothing(
        self, api_client, admin_user, business_area
    ):
        """The production scenario: an image above the limit must not commit a project."""
        api_client.force_authenticate(user=admin_user)
        before = Project.objects.count()

        data = _payload(business_area, admin_user)
        data["imageData"] = _oversized_image()
        response = api_client.post(CREATE_URL, data=data, format="multipart")

        assert response.status_code == 400, f"Got {response.status_code}"
        assert Project.objects.count() == before, "An orphaned project was committed"

    @pytest.mark.integration
    def test_oversized_image_error_names_the_limit(
        self, api_client, admin_user, business_area
    ):
        """The caller needs an actionable message, not an opaque 500."""
        api_client.force_authenticate(user=admin_user)

        data = _payload(business_area, admin_user)
        data["imageData"] = _oversized_image()
        response = api_client.post(CREATE_URL, data=data, format="multipart")

        assert "too large" in str(response.data).lower()

    @pytest.mark.integration
    def test_image_storage_failure_rolls_back(
        self, api_client, admin_user, business_area
    ):
        """
        An image that passes the size check but fails during storage must roll
        the whole transaction back. This is the case the old code committed,
        because it returned a Response from inside the atomic block.
        """
        api_client.force_authenticate(user=admin_user)
        before = Project.objects.count()

        data = _payload(business_area, admin_user)
        data["imageData"] = _small_image()

        with patch(
            "projects.views.crud.ProjectPhoto.objects.create",
            side_effect=OSError("disk full"),
        ):
            response = api_client.post(CREATE_URL, data=data, format="multipart")

        assert response.status_code == 400, f"Got {response.status_code}"
        assert Project.objects.count() == before, "An orphaned project was committed"

    @pytest.mark.integration
    def test_invalid_area_rolls_back(self, api_client, admin_user, business_area):
        """If the area payload is rejected, no project may survive."""
        api_client.force_authenticate(user=admin_user)
        before = Project.objects.count()

        from projects.views.crud import ProjectAreaSerializer

        with (
            patch.object(ProjectAreaSerializer, "is_valid", return_value=False),
            patch.object(
                ProjectAreaSerializer,
                "errors",
                new_callable=PropertyMock,
                return_value={"areas": ["invalid"]},
            ),
        ):
            response = api_client.post(
                CREATE_URL, data=_payload(business_area, admin_user)
            )

        assert response.status_code == 400, f"Got {response.status_code}"
        assert Project.objects.count() == before, "An orphaned project was committed"

    @pytest.mark.integration
    def test_unexpected_area_error_still_rolls_back(
        self, api_client, admin_user, business_area
    ):
        """
        Even an unexpected failure while saving the area must not leave a
        project behind. This is the strongest guarantee: the transaction is
        what protects the data, not the specific error handling.
        """
        api_client.force_authenticate(user=admin_user)
        before = Project.objects.count()

        from projects.views.crud import ProjectAreaSerializer

        with patch.object(
            ProjectAreaSerializer, "save", side_effect=RuntimeError("db exploded")
        ):
            with pytest.raises(RuntimeError):
                api_client.post(CREATE_URL, data=_payload(business_area, admin_user))

        assert Project.objects.count() == before, "An orphaned project was committed"

    @pytest.mark.integration
    def test_invalid_project_lead_rolls_back(
        self, api_client, admin_user, business_area
    ):
        """A bad projectLead must not leave a project behind."""
        api_client.force_authenticate(user=admin_user)
        before = Project.objects.count()

        data = _payload(business_area, admin_user)
        data["projectLead"] = "99999999"
        response = api_client.post(CREATE_URL, data=data)

        assert response.status_code == 400, f"Got {response.status_code}"
        assert Project.objects.count() == before, "An orphaned project was committed"


class TestSuccessfulCreateIsComplete:
    """The happy path must still produce a fully formed project."""

    @pytest.mark.integration
    def test_student_project_gets_an_area(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)

        response = api_client.post(
            CREATE_URL, data=_payload(business_area, admin_user, kind="student")
        )

        assert (
            response.status_code == 201
        ), f"Got {response.status_code}: {response.data}"
        project = Project.objects.get(pk=response.data["id"])
        assert ProjectArea.objects.filter(project=project).exists()
        assert project.members.filter(is_leader=True).exists()

    @pytest.mark.integration
    def test_science_project_gets_a_concept_plan(
        self, api_client, admin_user, business_area
    ):
        """Guards the full-workflow path, which also creates a concept plan."""
        api_client.force_authenticate(user=admin_user)

        response = api_client.post(
            CREATE_URL, data=_payload(business_area, admin_user, kind="science")
        )

        assert (
            response.status_code == 201
        ), f"Got {response.status_code}: {response.data}"
        project = Project.objects.get(pk=response.data["id"])
        assert ProjectArea.objects.filter(project=project).exists()
        assert project.documents.exists(), "Concept plan document was not created"


class TestSerialiserToleratesMissingArea:
    """Pre-existing area-less rows must not break the list endpoint."""

    @pytest.mark.integration
    def test_get_areas_returns_empty_list(self, db, business_area):
        from projects.serializers import ProjectSerializer

        project = ProjectFactory(business_area=business_area)
        assert not ProjectArea.objects.filter(project=project).exists()

        assert ProjectSerializer(project).data["areas"] == []

    @pytest.mark.integration
    def test_list_endpoint_survives_area_less_project(
        self, api_client, admin_user, business_area
    ):
        """Reproduces the production 500 on /projects/list."""
        api_client.force_authenticate(user=admin_user)
        ProjectFactory(business_area=business_area)

        response = api_client.get(CREATE_URL)

        assert response.status_code == 200, f"Got {response.status_code}"


class TestExportSerialiserToleratesMissingStudentDetails:
    """
    The annual report export dereferences student_project_info the same way the
    list endpoint dereferenced area, so it needs the same protection.
    """

    @pytest.mark.integration
    def test_student_level_is_none_without_student_details(self, db, business_area):
        from projects.serializers.export import TinyStudentProjectARSerializer

        project = ProjectFactory(business_area=business_area, kind="student")

        data = TinyStudentProjectARSerializer(project).data

        assert data["student_level"] is None


class TestRejectedImageLeavesNoFileBehind:
    """
    The upload is handed to the model, which validates before writing. A
    rejected file must not be left in storage.
    """

    @pytest.mark.integration
    def test_oversized_image_writes_nothing_to_storage(
        self, api_client, admin_user, business_area, tmp_path, settings
    ):
        settings.MEDIA_ROOT = str(tmp_path)
        api_client.force_authenticate(user=admin_user)

        data = _payload(business_area, admin_user)
        data["imageData"] = _oversized_image()
        response = api_client.post(CREATE_URL, data=data, format="multipart")

        assert response.status_code == 400
        written = list(tmp_path.rglob("*"))
        files = [p for p in written if p.is_file()]
        assert files == [], f"Rejected upload left files behind: {files}"
