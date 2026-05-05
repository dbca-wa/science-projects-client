"""
Pytest fixtures for contacts app tests
"""

import pytest
from django.contrib.auth import get_user_model

from agencies.models import Agency, Branch
from common.tests.factories import UserFactory
from contacts.models import AgencyContact, BranchContact, UserContact

User = get_user_model()


@pytest.fixture
def user(db):
    """Provide a regular user"""
    return UserFactory(
        username="testuser",
        email="test@example.com",
    )


@pytest.fixture
def agency(db, user):
    """Provide an agency"""
    return Agency.objects.create(
        name="Test Agency",
        key_stakeholder=user,
        is_active=True,
    )


@pytest.fixture
def branch(db, agency):
    """Provide a branch"""
    return Branch.objects.create(
        name="Test Branch",
        agency=agency,
    )


@pytest.fixture
def user_contact(db, user):
    """Provide a user contact"""
    return UserContact.objects.create(
        user=user,
        email="user@example.com",
        phone="1234567890",
        alt_phone="0987654321",
        fax="1112223333",
    )


@pytest.fixture
def agency_contact(db, agency):
    """Provide an agency contact"""
    return AgencyContact.objects.create(
        agency=agency,
        email="agency@example.com",
        phone="1234567890",
        alt_phone="0987654321",
        fax="1112223333",
    )


@pytest.fixture
def branch_contact(db, branch):
    """Provide a branch contact"""
    return BranchContact.objects.create(
        branch=branch,
        email="branch@example.com",
        phone="1234567890",
        alt_phone="0987654321",
        fax="1112223333",
    )


@pytest.fixture
def user_factory():
    """Provide UserFactory for creating users"""
    return UserFactory
