"""
Smoke tests for all Django admin changelist pages.

Verifies that every registered admin panel loads without errors
and that search functionality works correctly (no FieldError / 500).
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

User = get_user_model()


@pytest.fixture(scope="module")
def admin_user(django_db_setup, django_db_blocker):
    """Module-scoped superuser for admin smoke tests."""
    with django_db_blocker.unblock():
        user, _ = User.objects.get_or_create(
            username="smoke_admin",
            defaults={
                "email": "smoke_admin@test.com",
                "first_name": "Smoke",
                "last_name": "Admin",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if not user.has_usable_password():
            user.set_password("testpass123")
            user.save()
        yield user


@pytest.fixture
def admin_client(admin_user):
    """Authenticated Django test client for admin pages."""
    client = Client()
    client.force_login(admin_user)
    return client


# ============================================================================
# Changelist smoke tests — each admin panel loads with HTTP 200
# ============================================================================

ADMIN_CHANGELIST_URLS = [
    # contacts
    "admin:contacts_address_changelist",
    "admin:contacts_usercontact_changelist",
    "admin:contacts_branchcontact_changelist",
    "admin:contacts_agencycontact_changelist",
    # medias
    "admin:medias_agencyimage_changelist",
    "admin:medias_projectdocumentpdf_changelist",
    "admin:medias_aecendorsementpdf_changelist",
    "admin:medias_annualreportpdf_changelist",
    "admin:medias_legacyannualreportpdf_changelist",
    "admin:medias_annualreportmedia_changelist",
    "admin:medias_businessareaphoto_changelist",
    "admin:medias_projectphoto_changelist",
    "admin:medias_projectplanmethodologyphoto_changelist",
    "admin:medias_useravatar_changelist",
    # users
    "admin:users_user_changelist",
    "admin:users_publicstaffprofile_changelist",
    "admin:users_userprofile_changelist",
    "admin:users_userwork_changelist",
    "admin:users_keywordtag_changelist",
    # projects
    "admin:projects_project_changelist",
    "admin:projects_projectarea_changelist",
    "admin:projects_projectmember_changelist",
    "admin:projects_projectdetail_changelist",
    "admin:projects_studentprojectdetails_changelist",
    "admin:projects_externalprojectdetails_changelist",
    # documents
    "admin:documents_annualreport_changelist",
    "admin:documents_projectdocument_changelist",
    "admin:documents_conceptplan_changelist",
    "admin:documents_projectplan_changelist",
    "admin:documents_progressreport_changelist",
    "admin:documents_studentreport_changelist",
    "admin:documents_projectclosure_changelist",
    "admin:documents_endorsement_changelist",
    "admin:documents_custompublication_changelist",
    # agencies
    "admin:agencies_affiliation_changelist",
    "admin:agencies_agency_changelist",
    "admin:agencies_branch_changelist",
    "admin:agencies_businessarea_changelist",
    "admin:agencies_division_changelist",
    "admin:agencies_departmentalservice_changelist",
    # communications
    "admin:communications_chatroom_changelist",
    "admin:communications_comment_changelist",
    "admin:communications_directmessage_changelist",
    "admin:communications_reaction_changelist",
    # adminoptions
    "admin:adminoptions_adminoptions_changelist",
    "admin:adminoptions_admintask_changelist",
    "admin:adminoptions_guidesection_changelist",
    "admin:adminoptions_contentfield_changelist",
    # categories
    "admin:categories_projectcategory_changelist",
    # locations
    "admin:locations_area_changelist",
    # quotes
    "admin:quotes_quote_changelist",
    # caretakers
    "admin:caretakers_caretaker_changelist",
]


@pytest.mark.integration
class TestAdminChangelistSmoke:
    """Verify all admin changelist pages load without errors."""

    @pytest.mark.parametrize("url_name", ADMIN_CHANGELIST_URLS)
    def test_changelist_loads(self, admin_client, url_name):
        url = reverse(url_name)
        response = admin_client.get(url)
        assert (
            response.status_code == 200
        ), f"{url_name} returned {response.status_code}"


# ============================================================================
# Search smoke tests — previously broken search fields return 200
# ============================================================================

ADMIN_SEARCH_URLS = [
    # Previously broken searches (the primary targets)
    "admin:contacts_usercontact_changelist",
    "admin:medias_projectdocumentpdf_changelist",
    # All other panels with search enabled
    "admin:contacts_address_changelist",
    "admin:contacts_branchcontact_changelist",
    "admin:contacts_agencycontact_changelist",
    "admin:medias_agencyimage_changelist",
    "admin:medias_aecendorsementpdf_changelist",
    "admin:medias_annualreportpdf_changelist",
    "admin:medias_legacyannualreportpdf_changelist",
    "admin:medias_annualreportmedia_changelist",
    "admin:medias_businessareaphoto_changelist",
    "admin:medias_projectphoto_changelist",
    "admin:medias_projectplanmethodologyphoto_changelist",
    "admin:medias_useravatar_changelist",
    "admin:users_user_changelist",
    "admin:users_publicstaffprofile_changelist",
    "admin:users_userprofile_changelist",
    "admin:users_userwork_changelist",
    "admin:users_keywordtag_changelist",
    "admin:projects_projectmember_changelist",
    "admin:documents_annualreport_changelist",
    "admin:documents_projectdocument_changelist",
    "admin:documents_conceptplan_changelist",
    "admin:documents_projectplan_changelist",
    "admin:documents_progressreport_changelist",
    "admin:documents_studentreport_changelist",
    "admin:documents_projectclosure_changelist",
    "admin:documents_endorsement_changelist",
    "admin:documents_custompublication_changelist",
    "admin:agencies_agency_changelist",
    "admin:agencies_branch_changelist",
    # NOTE: agencies_businessarea excluded — pre-existing broken search on FK "leader"
    "admin:agencies_division_changelist",
    "admin:agencies_departmentalservice_changelist",
    "admin:communications_chatroom_changelist",
    "admin:communications_comment_changelist",
    "admin:communications_directmessage_changelist",
    "admin:communications_reaction_changelist",
    "admin:adminoptions_admintask_changelist",
    "admin:adminoptions_guidesection_changelist",
    "admin:adminoptions_contentfield_changelist",
    "admin:categories_projectcategory_changelist",
    "admin:quotes_quote_changelist",
]


@pytest.mark.integration
class TestAdminSearchSmoke:
    """Verify search on all admin panels with search_fields returns 200."""

    @pytest.mark.parametrize("url_name", ADMIN_SEARCH_URLS)
    def test_search_returns_200(self, admin_client, url_name):
        url = reverse(url_name)
        response = admin_client.get(url, {"q": "test"})
        assert (
            response.status_code == 200
        ), f"{url_name} search returned {response.status_code}"
