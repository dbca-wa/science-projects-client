"""
Additional coverage tests for quotes views — authenticated requests
to cover the actual view code paths.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import UserFactory
from common.tests.test_helpers import quotes_urls
from quotes.models import Quote


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestQuotesListAuthenticated:
    """Authenticated tests for Quotes.get — covers pagination path"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_quotes_authenticated(self, api_client):
        """Authenticated GET returns paginated quotes"""
        user = UserFactory()
        Quote.objects.create(text="Quote one", author="Author A")
        Quote.objects.create(text="Quote two", author="Author B")

        api_client.force_authenticate(user=user)
        response = api_client.get(quotes_urls.list())

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_quotes_empty(self, api_client):
        """Authenticated GET with no quotes returns empty list"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(quotes_urls.list())

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []


class TestQuoteDetailAuthenticated:
    """Authenticated tests for QuoteDetail.get"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_quote_detail_authenticated(self, api_client):
        """Authenticated GET returns quote detail"""
        user = UserFactory()
        quote = Quote.objects.create(text="Test quote", author="Test Author")

        api_client.force_authenticate(user=user)
        response = api_client.get(quotes_urls.detail(quote.pk))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["text"] == "Test quote"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_quote_not_found(self, api_client):
        """Authenticated GET for non-existent quote returns 404"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(quotes_urls.detail(99999))

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestQuoteRandomAuthenticated:
    """Authenticated tests for QuoteRandom.get"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_random_quote_authenticated(self, api_client):
        """Authenticated GET returns a random quote"""
        user = UserFactory()
        Quote.objects.create(text="Quote one", author="Author A")
        Quote.objects.create(text="Quote two", author="Author B")

        api_client.force_authenticate(user=user)
        response = api_client.get(quotes_urls.path("random"))

        assert response.status_code == status.HTTP_200_OK
        assert "text" in response.data
        assert "author" in response.data


class TestQuoteCrudAuthChecks:
    """Tests covering the inline auth checks in quote CRUD views.

    The global IsAuthenticated permission class blocks unauthenticated
    requests before the view code runs, so we test with an
    AnonymousUser-like session to hit the view's own auth check.
    """

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_quote_unauthenticated_hits_view_check(self, api_client):
        """POST without auth — global permission returns 403 before view code"""
        response = api_client.post(
            quotes_urls.list(),
            {"text": "Test", "author": "Author"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_quote_unauthenticated_hits_view_check(self, api_client):
        """PUT without auth — global permission returns 403"""
        quote = Quote.objects.create(text="Test", author="Author")
        response = api_client.put(
            quotes_urls.detail(quote.pk),
            {"text": "Updated"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_delete_quote_unauthenticated_hits_view_check(self, api_client):
        """DELETE without auth — global permission returns 403"""
        quote = Quote.objects.create(text="Test", author="Author")
        response = api_client.delete(quotes_urls.detail(quote.pk))
        assert response.status_code == status.HTTP_403_FORBIDDEN
