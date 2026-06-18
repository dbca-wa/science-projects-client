"""
Coverage tests for users/utils/helpers.py — get_user_display_name and get_user_avatar_url.

Covers all fallback branches in the display name logic and the avatar URL helper.
"""

from unittest.mock import MagicMock, PropertyMock

import pytest

from users.utils.helpers import get_user_avatar_url, get_user_display_name


class TestGetUserDisplayName:
    """Tests for all fallback branches in get_user_display_name"""

    @pytest.mark.unit
    def test_display_names_preferred(self):
        """Uses display_first_name + display_last_name when both valid"""
        user = MagicMock()
        user.display_first_name = "Display"
        user.display_last_name = "Name"
        user.first_name = "First"
        user.last_name = "Last"
        assert get_user_display_name(user) == "Display Name"

    @pytest.mark.unit
    def test_falls_back_to_first_last(self):
        """Uses first_name + last_name when display names are invalid"""
        user = MagicMock()
        user.display_first_name = None
        user.display_last_name = None
        user.first_name = "John"
        user.last_name = "Doe"
        assert get_user_display_name(user) == "John Doe"

    @pytest.mark.unit
    def test_falls_back_to_single_display_first(self):
        """Uses display_first_name alone if only it is valid"""
        user = MagicMock()
        user.display_first_name = "Solo"
        user.display_last_name = ""
        user.first_name = ""
        user.last_name = ""
        user.username = "fallback"
        assert get_user_display_name(user) == "Solo"

    @pytest.mark.unit
    def test_falls_back_to_single_display_last(self):
        """Uses display_last_name alone if only it is valid"""
        user = MagicMock()
        user.display_first_name = ""
        user.display_last_name = "Organisation"
        user.first_name = ""
        user.last_name = ""
        user.username = "fallback"
        assert get_user_display_name(user) == "Organisation"

    @pytest.mark.unit
    def test_falls_back_to_single_first_name(self):
        """Uses first_name alone as fallback"""
        user = MagicMock()
        user.display_first_name = None
        user.display_last_name = None
        user.first_name = "OnlyFirst"
        user.last_name = ""
        user.username = "fallback"
        assert get_user_display_name(user) == "OnlyFirst"

    @pytest.mark.unit
    def test_falls_back_to_single_last_name(self):
        """Uses last_name alone as fallback"""
        user = MagicMock()
        user.display_first_name = None
        user.display_last_name = None
        user.first_name = ""
        user.last_name = "OnlyLast"
        user.username = "fallback"
        assert get_user_display_name(user) == "OnlyLast"

    @pytest.mark.unit
    def test_falls_back_to_username(self):
        """Uses username when all name fields are invalid"""
        user = MagicMock()
        user.display_first_name = None
        user.display_last_name = None
        user.first_name = ""
        user.last_name = ""
        user.username = "jdoe"
        assert get_user_display_name(user) == "jdoe"

    @pytest.mark.unit
    def test_returns_empty_when_nothing_valid(self):
        """Returns empty string when all fields are None/empty"""
        user = MagicMock()
        user.display_first_name = None
        user.display_last_name = None
        user.first_name = None
        user.last_name = None
        user.username = None
        assert get_user_display_name(user) == ""

    @pytest.mark.unit
    def test_none_prefix_treated_as_invalid(self):
        """Names starting with 'None' are treated as invalid"""
        user = MagicMock()
        user.display_first_name = "None"
        user.display_last_name = "None"
        user.first_name = "Real"
        user.last_name = "Name"
        assert get_user_display_name(user) == "Real Name"

    @pytest.mark.unit
    def test_whitespace_only_treated_as_invalid(self):
        """Whitespace-only names are treated as invalid"""
        user = MagicMock()
        user.display_first_name = "   "
        user.display_last_name = "   "
        user.first_name = "Valid"
        user.last_name = "Name"
        assert get_user_display_name(user) == "Valid Name"


class TestGetUserAvatarUrl:
    """Tests for get_user_avatar_url helper"""

    @pytest.mark.unit
    def test_returns_url_when_avatar_exists(self):
        """Returns file URL when avatar with file exists"""
        user = MagicMock()
        user.pk = 1
        user.avatar.file.url = "/media/avatars/test.jpg"
        assert get_user_avatar_url(user) == "/media/avatars/test.jpg"

    @pytest.mark.unit
    def test_returns_none_when_no_avatar(self):
        """Returns None when user has no avatar"""
        user = MagicMock()
        user.pk = 1
        user.avatar = None
        assert get_user_avatar_url(user) is None

    @pytest.mark.unit
    def test_returns_none_when_avatar_has_no_file(self):
        """Returns None when avatar exists but has no file"""
        user = MagicMock()
        user.pk = 1
        user.avatar.file = None
        assert get_user_avatar_url(user) is None

    @pytest.mark.unit
    def test_returns_none_on_exception(self):
        """Returns None when accessing avatar raises an exception"""
        user = MagicMock()
        user.pk = 1
        type(user).avatar = PropertyMock(side_effect=Exception("DB error"))
        assert get_user_avatar_url(user) is None
