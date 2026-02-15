"""
Agencies app pytest fixtures
"""

import pytest

from agencies.models import (
    Affiliation,
    Agency,
    Branch,
    BusinessArea,
    DepartmentalService,
    Division,
)


@pytest.fixture
def affiliation(db):
    """Provide an affiliation"""
    return Affiliation.objects.create(name="Test Affiliation")


@pytest.fixture
def agency(db, user):
    """Provide an agency"""
    return Agency.objects.create(
        name="Test Agency",
        key_stakeholder=user,
        is_active=True,
    )


@pytest.fixture
def division(db, user):
    """Provide a division"""
    return Division.objects.create(
        name="Test Division",
        slug="test-division",
        director=user,
        approver=user,
    )


@pytest.fixture
def branch(db, agency, user):
    """Provide a branch"""
    return Branch.objects.create(
        agency=agency,
        name="Test Branch",
        manager=user,
    )


@pytest.fixture
def business_area(db, agency, division, user):
    """Provide a business area"""
    return BusinessArea.objects.create(
        agency=agency,
        name="Test Business Area",
        slug="test-ba",
        division=division,
        leader=user,
        finance_admin=user,
        data_custodian=user,
        caretaker=user,
        is_active=True,
        published=False,
    )


@pytest.fixture
def departmental_service(db, user):
    """Provide a departmental service"""
    return DepartmentalService.objects.create(
        name="Test Service",
        director=user,
    )


# Module-scoped fixtures for read-only tests
# These fixtures are created once per module and shared across tests
# Use these for tests that only read data and don't modify it


@pytest.fixture(scope="module")
def module_affiliation(django_db_setup, django_db_blocker):
    """
    Provide a module-scoped affiliation for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read affiliation data and don't modify it.

    Returns:
        Affiliation: Affiliation instance (shared across module)
    """
    with django_db_blocker.unblock():
        affiliation = Affiliation.objects.create(name="Module Affiliation")
        yield affiliation


@pytest.fixture(scope="module")
def module_agency(django_db_setup, django_db_blocker, module_user):
    """
    Provide a module-scoped agency for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read agency data and don't modify it.

    Returns:
        Agency: Agency instance (shared across module)
    """
    with django_db_blocker.unblock():
        agency = Agency.objects.create(
            name="Module Agency",
            key_stakeholder=module_user,
            is_active=True,
        )
        yield agency


@pytest.fixture(scope="module")
def module_division(django_db_setup, django_db_blocker, module_user):
    """
    Provide a module-scoped division for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read division data and don't modify it.

    Returns:
        Division: Division instance (shared across module)
    """
    with django_db_blocker.unblock():
        division = Division.objects.create(
            name="Module Division",
            slug="module-division",
            director=module_user,
            approver=module_user,
        )
        yield division


@pytest.fixture(scope="module")
def module_branch(django_db_setup, django_db_blocker, module_agency, module_user):
    """
    Provide a module-scoped branch for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read branch data and don't modify it.

    Returns:
        Branch: Branch instance (shared across module)
    """
    with django_db_blocker.unblock():
        branch = Branch.objects.create(
            agency=module_agency,
            name="Module Branch",
            manager=module_user,
        )
        yield branch


@pytest.fixture(scope="module")
def module_business_area(
    django_db_setup, django_db_blocker, module_agency, module_division, module_user
):
    """
    Provide a module-scoped business area for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read business area data and don't modify it.

    Returns:
        BusinessArea: BusinessArea instance (shared across module)
    """
    with django_db_blocker.unblock():
        ba = BusinessArea.objects.create(
            agency=module_agency,
            name="Module Business Area",
            slug="module-ba",
            division=module_division,
            leader=module_user,
            finance_admin=module_user,
            data_custodian=module_user,
            caretaker=module_user,
            is_active=True,
            published=False,
        )
        yield ba


@pytest.fixture(scope="module")
def module_departmental_service(django_db_setup, django_db_blocker, module_user):
    """
    Provide a module-scoped departmental service for read-only tests.

    This fixture is created once per test module and shared across all tests.
    Use this for tests that only read departmental service data and don't modify it.

    Returns:
        DepartmentalService: DepartmentalService instance (shared across module)
    """
    with django_db_blocker.unblock():
        service = DepartmentalService.objects.create(
            name="Module Service",
            director=module_user,
        )
        yield service
