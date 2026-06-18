"""
Tests for the project area/location filter in ProjectService._apply_filters().

Verifies that the 'area' query parameter correctly filters projects whose
ProjectArea.areas ArrayField contains the specified area ID.
"""

import pytest

from common.tests.factories import ProjectFactory, UserFactory
from locations.models import Area
from projects.models import ProjectArea
from projects.services.project_service import ProjectService


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def dbca_region(db):
    return Area.objects.create(name="Kimberley", area_type="dbcaregion")


@pytest.fixture
def dbca_district(db):
    return Area.objects.create(name="Albany", area_type="dbcadistrict")


@pytest.fixture
def project_with_region(db, dbca_region):
    """Project with a region area assigned"""
    project = ProjectFactory()
    ProjectArea.objects.create(project=project, areas=[dbca_region.pk])
    return project


@pytest.fixture
def project_with_district(db, dbca_district):
    """Project with a district area assigned"""
    project = ProjectFactory()
    ProjectArea.objects.create(project=project, areas=[dbca_district.pk])
    return project


@pytest.fixture
def project_with_no_area(db):
    """Project with no area assigned"""
    return ProjectFactory()


class TestAreaFilter:
    """Tests for area filter in ProjectService._apply_filters()"""

    @pytest.mark.integration
    def test_filter_by_region_returns_matching_projects(
        self, user, project_with_region, project_with_district, dbca_region, db
    ):
        """Area filter returns only projects containing the specified area ID"""
        filters = {"area": str(dbca_region.pk)}
        projects = ProjectService.list_projects(user, filters)

        project_ids = list(projects.values_list("id", flat=True))
        assert project_with_region.pk in project_ids
        assert project_with_district.pk not in project_ids

    @pytest.mark.integration
    def test_filter_by_district_returns_matching_projects(
        self, user, project_with_region, project_with_district, dbca_district, db
    ):
        """Area filter returns projects with the specified district"""
        filters = {"area": str(dbca_district.pk)}
        projects = ProjectService.list_projects(user, filters)

        project_ids = list(projects.values_list("id", flat=True))
        assert project_with_district.pk in project_ids
        assert project_with_region.pk not in project_ids

    @pytest.mark.integration
    def test_filter_all_returns_all_projects(
        self, user, project_with_region, project_with_district, project_with_no_area, db
    ):
        """Area filter 'All' returns all projects (no filtering)"""
        filters = {"area": "All"}
        projects = ProjectService.list_projects(user, filters)

        assert projects.count() >= 3

    @pytest.mark.integration
    def test_no_area_filter_returns_all_projects(
        self, user, project_with_region, project_with_district, project_with_no_area, db
    ):
        """Missing area filter returns all projects"""
        filters = {}
        projects = ProjectService.list_projects(user, filters)

        assert projects.count() >= 3

    @pytest.mark.integration
    def test_invalid_area_id_ignored(self, user, project_with_region, db):
        """Invalid (non-numeric) area ID is silently ignored"""
        filters = {"area": "invalid"}
        projects = ProjectService.list_projects(user, filters)

        # Should return all projects (filter skipped due to ValueError)
        assert projects.count() >= 1

    @pytest.mark.integration
    def test_area_filter_combines_with_other_filters(
        self, user, project_with_region, project_with_district, dbca_region, db
    ):
        """Area filter works with AND logic alongside other filters"""
        # Set status on both projects
        project_with_region.status = "active"
        project_with_region.save()
        project_with_district.status = "active"
        project_with_district.save()

        filters = {"area": str(dbca_region.pk), "projectstatus": "active"}
        projects = ProjectService.list_projects(user, filters)

        project_ids = list(projects.values_list("id", flat=True))
        assert project_with_region.pk in project_ids
        assert project_with_district.pk not in project_ids
