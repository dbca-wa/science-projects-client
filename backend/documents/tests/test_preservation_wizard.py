"""
Preservation tests for project wizard document creation.

These tests verify that Projects.post() creates the correct initial document
for each project type. They must PASS on unfixed code and STILL pass after
the bugfix is applied, confirming no regressions.

Validates: Requirements 3.1
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import BusinessAreaFactory, UserFactory
from common.tests.test_helpers import projects_urls
from documents.models import ConceptPlan, ProjectDocument


@pytest.mark.django_db
class TestWizardCreatesConceptPlanForScience:
    """Science projects get a ConceptPlan via the wizard."""

    def test_science_project_creates_concept_plan(self):
        user = UserFactory()
        ba = BusinessAreaFactory()
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            projects_urls.list(),
            data={
                "kind": "science",
                "title": "Science preservation test",
                "description": "Testing wizard preservation",
                "year": "2024",
                "businessArea": ba.pk,
                "projectLead": user.pk,
                "creator": user.pk,
                "keywords": "test",
                "locations": [],
            },
            format="multipart",
        )

        assert response.status_code == 201
        project_id = response.data["id"]

        doc = ProjectDocument.objects.filter(
            project_id=project_id, kind="concept"
        ).first()
        assert doc is not None, "ConceptPlan document should be created"
        assert doc.creator == user
        assert doc.modifier == user

        concept = ConceptPlan.objects.filter(document=doc).first()
        assert concept is not None, "ConceptPlan detail should be created"


@pytest.mark.django_db
class TestWizardCreatesConceptPlanForCoreFunction:
    """Core function projects get a ConceptPlan via the wizard."""

    def test_core_function_project_creates_concept_plan(self):
        user = UserFactory()
        ba = BusinessAreaFactory()
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            projects_urls.list(),
            data={
                "kind": "core_function",
                "title": "Core function preservation test",
                "description": "Testing wizard preservation",
                "year": "2024",
                "businessArea": ba.pk,
                "projectLead": user.pk,
                "creator": user.pk,
                "keywords": "test",
                "locations": [],
            },
            format="multipart",
        )

        assert response.status_code == 201
        project_id = response.data["id"]

        doc = ProjectDocument.objects.filter(
            project_id=project_id, kind="concept"
        ).first()
        assert doc is not None, "ConceptPlan document should be created"
        assert doc.creator == user
        assert doc.modifier == user

        concept = ConceptPlan.objects.filter(document=doc).first()
        assert concept is not None, "ConceptPlan detail should be created"


@pytest.mark.django_db
class TestWizardSkipsDocumentsForStudent:
    """Student projects do not get initial documents — they use a simplified workflow."""

    def test_student_project_does_not_create_concept_plan(self):
        user = UserFactory()
        ba = BusinessAreaFactory()
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            projects_urls.list(),
            data={
                "kind": "student",
                "title": "Student preservation test",
                "description": "Testing wizard preservation",
                "year": "2024",
                "businessArea": ba.pk,
                "projectLead": user.pk,
                "creator": user.pk,
                "keywords": "test",
                "locations": [],
            },
            format="multipart",
        )

        assert response.status_code == 201
        project_id = response.data["id"]

        doc = ProjectDocument.objects.filter(
            project_id=project_id, kind="concept"
        ).first()
        assert doc is None, "Student projects should not create a ConceptPlan"


@pytest.mark.django_db
class TestWizardSkipsDocumentsForExternal:
    """External projects do not get initial documents — they use a simplified workflow."""

    def test_external_project_does_not_create_project_plan(self):
        user = UserFactory()
        ba = BusinessAreaFactory()
        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post(
            projects_urls.list(),
            data={
                "kind": "external",
                "title": "External preservation test",
                "description": "Testing wizard preservation",
                "year": "2024",
                "businessArea": ba.pk,
                "projectLead": user.pk,
                "creator": user.pk,
                "keywords": "test",
                "locations": [],
            },
            format="multipart",
        )

        assert response.status_code == 201
        project_id = response.data["id"]

        doc = ProjectDocument.objects.filter(
            project_id=project_id, kind="projectplan"
        ).first()
        assert doc is None, "External projects should not create a ProjectPlan"
