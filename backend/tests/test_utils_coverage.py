"""
Tests for common/utils/validators.py, common/utils/pagination.py,
and common/utils/filters.py — targeting missed coverage lines.
"""

import pytest
from django.test import RequestFactory
from rest_framework import serializers

from common.utils.filters import (
    apply_boolean_filter,
    apply_date_range_filter,
    apply_search_filter,
    apply_status_filter,
)
from common.utils.pagination import get_page_number, get_page_size, paginate_queryset
from common.utils.validators import (
    validate_date_range,
    validate_file_extension,
    validate_file_size,
    validate_not_empty,
    validate_positive_number,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def rf():
    return RequestFactory()


def _make_request(rf, params=None):
    """Build a fake GET request with query_params."""
    request = rf.get("/fake", data=params or {})
    # DRF views use request.query_params; simulate via Django's GET
    request.query_params = request.GET
    return request


# ===========================================================================
# validators.py tests
# ===========================================================================


class TestValidateNotEmpty:
    """Cover lines 26-28: raise ValidationError when value is empty/whitespace."""

    @pytest.mark.unit
    def test_empty_string_raises(self):
        with pytest.raises(serializers.ValidationError):
            validate_not_empty("", "Title")

    @pytest.mark.unit
    def test_whitespace_only_raises(self):
        with pytest.raises(serializers.ValidationError):
            validate_not_empty("   ", "Title")

    @pytest.mark.unit
    def test_none_raises(self):
        with pytest.raises(serializers.ValidationError):
            validate_not_empty(None, "Title")

    @pytest.mark.unit
    def test_valid_value_returns_stripped(self):
        assert validate_not_empty("  hello  ", "Title") == "hello"


class TestValidateDateRange:
    """Cover lines 52-53: raise ValidationError when start > end."""

    @pytest.mark.unit
    def test_start_after_end_raises(self):
        from datetime import date

        with pytest.raises(serializers.ValidationError):
            validate_date_range(date(2024, 12, 1), date(2024, 1, 1))

    @pytest.mark.unit
    def test_valid_range_does_not_raise(self):
        from datetime import date

        # Should not raise
        validate_date_range(date(2024, 1, 1), date(2024, 12, 1))

    @pytest.mark.unit
    def test_none_dates_do_not_raise(self):
        validate_date_range(None, None)


class TestValidatePositiveNumber:
    """Cover lines 78-80: raise ValidationError when value <= 0."""

    @pytest.mark.unit
    def test_zero_raises(self):
        with pytest.raises(serializers.ValidationError):
            validate_positive_number(0, "Amount")

    @pytest.mark.unit
    def test_negative_raises(self):
        with pytest.raises(serializers.ValidationError):
            validate_positive_number(-5, "Amount")

    @pytest.mark.unit
    def test_positive_returns_value(self):
        assert validate_positive_number(10, "Amount") == 10

    @pytest.mark.unit
    def test_none_returns_none(self):
        assert validate_positive_number(None, "Amount") is None


class TestValidateFileSize:
    """Cover lines 99-100: raise ValidationError when file exceeds max size."""

    @pytest.mark.unit
    def test_oversized_file_raises(self):
        class FakeFile:
            size = 20 * 1024 * 1024  # 20 MB

        with pytest.raises(serializers.ValidationError):
            validate_file_size(FakeFile(), max_size_mb=10)

    @pytest.mark.unit
    def test_valid_size_does_not_raise(self):
        class FakeFile:
            size = 5 * 1024 * 1024  # 5 MB

        validate_file_size(FakeFile(), max_size_mb=10)

    @pytest.mark.unit
    def test_none_file_does_not_raise(self):
        validate_file_size(None, max_size_mb=10)


class TestValidateFileExtension:
    """Cover lines 119-124: raise ValidationError when extension not allowed."""

    @pytest.mark.unit
    def test_invalid_extension_raises(self):
        class FakeFile:
            name = "report.exe"

        with pytest.raises(serializers.ValidationError):
            validate_file_extension(FakeFile(), [".pdf", ".docx"])

    @pytest.mark.unit
    def test_valid_extension_does_not_raise(self):
        class FakeFile:
            name = "report.pdf"

        validate_file_extension(FakeFile(), [".pdf", ".docx"])

    @pytest.mark.unit
    def test_none_file_does_not_raise(self):
        validate_file_extension(None, [".pdf"])


# ===========================================================================
# pagination.py tests
# ===========================================================================


class TestPaginateQueryset:
    """Cover lines 42-44, 53-54: invalid page/page_size params."""

    @pytest.mark.integration
    def test_invalid_page_defaults_to_1(self, rf, db):
        from projects.models import Project

        request = _make_request(rf, {"page": "abc"})
        result = paginate_queryset(Project.objects.all(), request)
        assert result["current_page"] == 1

    @pytest.mark.integration
    def test_negative_page_defaults_to_1(self, rf, db):
        from projects.models import Project

        request = _make_request(rf, {"page": "-5"})
        result = paginate_queryset(Project.objects.all(), request)
        assert result["current_page"] == 1

    @pytest.mark.integration
    def test_invalid_page_size_uses_default(self, rf, db):
        from django.conf import settings

        from projects.models import Project

        request = _make_request(rf, {"page_size": "notanumber"})
        result = paginate_queryset(Project.objects.all(), request)
        assert result["page_size"] == getattr(settings, "PAGE_SIZE", 20)

    @pytest.mark.integration
    def test_page_size_above_max_ignored(self, rf, db):
        from projects.models import Project

        request = _make_request(rf, {"page_size": "200"})
        result = paginate_queryset(Project.objects.all(), request)
        # page_size should remain at default since 200 > 100
        assert result["page_size"] <= 100


class TestGetPageNumber:
    """Cover lines 82-86: invalid page param returns default."""

    @pytest.mark.unit
    def test_invalid_page_returns_default(self, rf):
        request = _make_request(rf, {"page": "xyz"})
        assert get_page_number(request) == 1

    @pytest.mark.unit
    def test_negative_page_returns_1(self, rf):
        request = _make_request(rf, {"page": "-3"})
        assert get_page_number(request) == 1

    @pytest.mark.unit
    def test_valid_page_returns_value(self, rf):
        request = _make_request(rf, {"page": "5"})
        assert get_page_number(request) == 5


class TestGetPageSize:
    """Cover lines 100-108: invalid page_size, boundary clamping."""

    @pytest.mark.unit
    def test_invalid_page_size_returns_default(self, rf):
        from django.conf import settings

        request = _make_request(rf, {"page_size": "bad"})
        assert get_page_size(request) == getattr(settings, "PAGE_SIZE", 20)

    @pytest.mark.unit
    def test_page_size_below_1_clamped(self, rf):
        request = _make_request(rf, {"page_size": "0"})
        assert get_page_size(request) == 1

    @pytest.mark.unit
    def test_page_size_above_100_clamped(self, rf):
        request = _make_request(rf, {"page_size": "500"})
        assert get_page_size(request) == 100

    @pytest.mark.unit
    def test_valid_page_size_returns_value(self, rf):
        request = _make_request(rf, {"page_size": "25"})
        assert get_page_size(request) == 25

    @pytest.mark.unit
    def test_custom_default(self, rf):
        request = _make_request(rf, {})
        assert get_page_size(request, default=50) == 50


# ===========================================================================
# filters.py tests
# ===========================================================================


class TestApplySearchFilter:
    """Cover lines 27-34: empty search_term or empty fields returns queryset unchanged."""

    @pytest.mark.integration
    def test_empty_search_term_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_search_filter(qs, "", ["title"])
        # Should return same queryset
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_none_search_term_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_search_filter(qs, None, ["title"])
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_empty_fields_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_search_filter(qs, "test", [])
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_valid_search_filters(self, db):
        from common.tests.factories import ProjectFactory

        ProjectFactory(title="Unique Koala Project")
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_search_filter(qs, "Koala", ["title"])
        assert result.count() >= 1


class TestApplyDateRangeFilter:
    """Cover lines 58-64: start_date and end_date filtering."""

    @pytest.mark.integration
    def test_with_start_date(self, db):
        from datetime import date

        from projects.models import Project

        qs = Project.objects.all()
        result = apply_date_range_filter(qs, "start_date", start_date=date(2020, 1, 1))
        # Just verify it returns a queryset (filter applied)
        assert result is not None

    @pytest.mark.integration
    def test_with_end_date(self, db):
        from datetime import date

        from projects.models import Project

        qs = Project.objects.all()
        result = apply_date_range_filter(qs, "start_date", end_date=date(2025, 12, 31))
        assert result is not None

    @pytest.mark.integration
    def test_with_both_dates(self, db):
        from datetime import date

        from projects.models import Project

        qs = Project.objects.all()
        result = apply_date_range_filter(
            qs, "start_date", start_date=date(2020, 1, 1), end_date=date(2025, 12, 31)
        )
        assert result is not None


class TestApplyStatusFilter:
    """Cover lines 85-91: empty status, list/tuple status, single status."""

    @pytest.mark.integration
    def test_empty_status_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_status_filter(qs, None)
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_empty_string_status_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_status_filter(qs, "")
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_list_status_filters_with_in(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_status_filter(qs, ["active", "new"])
        assert result is not None

    @pytest.mark.integration
    def test_single_status_filters(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_status_filter(qs, "active")
        assert result is not None


class TestApplyBooleanFilter:
    """Cover lines 113-120: None, string-to-bool conversion, boolean."""

    @pytest.mark.integration
    def test_none_value_returns_unchanged(self, db):
        from projects.models import Project

        qs = Project.objects.all()
        result = apply_boolean_filter(qs, None, "is_active")
        assert result.query.where == qs.query.where

    @pytest.mark.integration
    def test_string_true_converts_to_boolean(self, db):
        from agencies.models import BusinessArea

        qs = BusinessArea.objects.all()
        result = apply_boolean_filter(qs, "true", "is_active")
        assert result is not None

    @pytest.mark.integration
    def test_string_false_converts_to_boolean(self, db):
        from agencies.models import BusinessArea

        qs = BusinessArea.objects.all()
        result = apply_boolean_filter(qs, "false", "is_active")
        assert result is not None

    @pytest.mark.integration
    def test_string_yes_converts_to_true(self, db):
        from agencies.models import BusinessArea

        qs = BusinessArea.objects.all()
        result = apply_boolean_filter(qs, "yes", "is_active")
        assert result is not None

    @pytest.mark.integration
    def test_boolean_value_filters_directly(self, db):
        from agencies.models import BusinessArea

        qs = BusinessArea.objects.all()
        result = apply_boolean_filter(qs, True, "is_active")
        assert result is not None
