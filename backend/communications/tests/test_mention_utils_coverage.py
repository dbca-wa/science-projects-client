"""
Tests for communications/utils/mention_utils.py — targeting 67 missed lines.
Covers extract_mention_user_ids, validate_mentioned_users_by_id,
is_user_mentionable, create_mention_records, and process_comment_mentions.
"""

import pytest

from common.tests.factories import ProjectFactory, UserFactory


@pytest.fixture
def staff_user(db):
    return UserFactory(is_active=True, is_staff=True)


@pytest.fixture
def inactive_user(db):
    return UserFactory(is_active=False, is_staff=True)


@pytest.fixture
def non_staff_user(db):
    return UserFactory(is_active=True, is_staff=False)


@pytest.fixture
def project_with_member(db, staff_user):
    project = ProjectFactory(members=[staff_user], members__leader=staff_user)
    return project


# ===========================================================================
# extract_mention_user_ids tests
# ===========================================================================


class TestExtractMentionUserIds:
    """Cover lines 36, 40-42 (empty/malformed HTML), 52-66 (parsing spans)."""

    @pytest.mark.unit
    def test_empty_string_returns_empty_list(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        assert extract_mention_user_ids("") == []

    @pytest.mark.unit
    def test_none_returns_empty_list(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        assert extract_mention_user_ids(None) == []

    @pytest.mark.unit
    def test_html_without_mentions_returns_empty(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        html = "<p>Hello world, no mentions here</p>"
        assert extract_mention_user_ids(html) == []

    @pytest.mark.unit
    def test_single_mention_extracted(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        html = '<p>Hey <span class="mention" data-user-id="42">@John</span></p>'
        assert extract_mention_user_ids(html) == [42]

    @pytest.mark.unit
    def test_multiple_mentions_deduplicated(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        html = (
            '<span data-user-id="10">@A</span>'
            '<span data-user-id="20">@B</span>'
            '<span data-user-id="10">@A</span>'
        )
        result = extract_mention_user_ids(html)
        assert result == [10, 20]

    @pytest.mark.unit
    def test_invalid_user_id_skipped(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        html = '<span data-user-id="notanumber">@Bad</span><span data-user-id="5">@Good</span>'
        result = extract_mention_user_ids(html)
        assert result == [5]

    @pytest.mark.unit
    def test_empty_data_user_id_skipped(self):
        from communications.utils.mention_utils import extract_mention_user_ids

        html = '<span data-user-id="">@Empty</span><span data-user-id="7">@OK</span>'
        result = extract_mention_user_ids(html)
        assert result == [7]


# ===========================================================================
# validate_mentioned_users_by_id tests
# ===========================================================================


class TestValidateMentionedUsersById:
    """Cover lines 83-120: project not found, user not found, inactive, not mentionable."""

    @pytest.mark.integration
    def test_empty_user_ids_returns_empty(self):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        assert validate_mentioned_users_by_id([], 999) == []

    @pytest.mark.integration
    def test_nonexistent_project_returns_empty(self, db):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        result = validate_mentioned_users_by_id([1], 99999)
        assert result == []

    @pytest.mark.integration
    def test_nonexistent_user_skipped(self, project_with_member):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        result = validate_mentioned_users_by_id([99999], project_with_member.pk)
        assert result == []

    @pytest.mark.integration
    def test_inactive_user_skipped(self, project_with_member, inactive_user):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        result = validate_mentioned_users_by_id(
            [inactive_user.pk], project_with_member.pk
        )
        assert inactive_user not in result

    @pytest.mark.integration
    def test_non_staff_user_skipped(self, project_with_member, non_staff_user):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        result = validate_mentioned_users_by_id(
            [non_staff_user.pk], project_with_member.pk
        )
        assert non_staff_user not in result

    @pytest.mark.integration
    def test_valid_staff_member_included(self, project_with_member, staff_user):
        from communications.utils.mention_utils import validate_mentioned_users_by_id

        result = validate_mentioned_users_by_id([staff_user.pk], project_with_member.pk)
        assert staff_user in result


# ===========================================================================
# is_user_mentionable tests
# ===========================================================================


class TestIsUserMentionable:
    """Cover lines 138-158: direct permission and caretaker check."""

    @pytest.mark.integration
    def test_user_who_can_comment_is_mentionable(self, project_with_member, staff_user):
        from communications.utils.mention_utils import is_user_mentionable

        result = is_user_mentionable(staff_user, project_with_member)
        assert result is True

    @pytest.mark.integration
    def test_user_without_permission_not_mentionable(self, project_with_member):
        from communications.utils.mention_utils import is_user_mentionable

        outsider = UserFactory(is_active=True, is_staff=True)
        result = is_user_mentionable(outsider, project_with_member)
        assert result is False

    @pytest.mark.integration
    def test_caretaker_of_permitted_user_is_mentionable(
        self, project_with_member, staff_user
    ):
        from caretakers.models import Caretaker
        from communications.utils.mention_utils import is_user_mentionable

        caretaker_user = UserFactory(is_active=True, is_staff=True)
        Caretaker.objects.create(
            user=staff_user, caretaker=caretaker_user, reason="leave"
        )

        result = is_user_mentionable(caretaker_user, project_with_member)
        assert result is True


# ===========================================================================
# create_mention_records tests
# ===========================================================================


class TestCreateMentionRecords:
    """Cover lines 169-179: creating CommentMention records."""

    @pytest.mark.integration
    def test_creates_mention_records(self, project_with_member, staff_user):
        from communications.models import CommentMention
        from communications.utils.mention_utils import create_mention_records
        from documents.models import ProjectDocument

        doc = ProjectDocument.objects.create(
            project=project_with_member,
            kind="concept",
            status="new",
            creator=staff_user,
            modifier=staff_user,
        )

        from communications.models import Comment

        comment = Comment.objects.create(
            document=doc,
            user=staff_user,
            text="<p>test</p>",
        )

        create_mention_records(comment, [staff_user])
        assert CommentMention.objects.filter(
            comment=comment, mentioned_user=staff_user
        ).exists()

    @pytest.mark.integration
    def test_duplicate_mention_not_created(self, project_with_member, staff_user):
        from communications.models import Comment, CommentMention
        from communications.utils.mention_utils import create_mention_records
        from documents.models import ProjectDocument

        doc = ProjectDocument.objects.create(
            project=project_with_member,
            kind="concept",
            status="new",
            creator=staff_user,
            modifier=staff_user,
        )
        comment = Comment.objects.create(
            document=doc,
            user=staff_user,
            text="<p>test</p>",
        )

        create_mention_records(comment, [staff_user])
        create_mention_records(comment, [staff_user])
        assert (
            CommentMention.objects.filter(
                comment=comment, mentioned_user=staff_user
            ).count()
            == 1
        )


# ===========================================================================
# process_comment_mentions tests
# ===========================================================================


class TestProcessCommentMentions:
    """Cover lines 204-227: full processing pipeline."""

    @pytest.mark.integration
    def test_no_mentions_returns_empty(self, project_with_member, staff_user):
        from communications.models import Comment
        from communications.utils.mention_utils import process_comment_mentions
        from documents.models import ProjectDocument

        doc = ProjectDocument.objects.create(
            project=project_with_member,
            kind="concept",
            status="new",
            creator=staff_user,
            modifier=staff_user,
        )
        comment = Comment.objects.create(
            document=doc,
            user=staff_user,
            text="<p>No mentions here</p>",
        )

        result = process_comment_mentions(comment)
        assert result == []

    @pytest.mark.integration
    def test_valid_mention_processed(self, project_with_member, staff_user):
        from communications.models import Comment, CommentMention
        from communications.utils.mention_utils import process_comment_mentions
        from documents.models import ProjectDocument

        doc = ProjectDocument.objects.create(
            project=project_with_member,
            kind="concept",
            status="new",
            creator=staff_user,
            modifier=staff_user,
        )
        html = f'<p><span data-user-id="{staff_user.pk}">@User</span></p>'
        comment = Comment.objects.create(
            document=doc,
            user=staff_user,
            text=html,
        )

        result = process_comment_mentions(comment)
        assert staff_user in result
        assert CommentMention.objects.filter(
            comment=comment, mentioned_user=staff_user
        ).exists()

    @pytest.mark.integration
    def test_mention_ids_extracted_but_none_valid(
        self, project_with_member, staff_user
    ):
        from communications.models import Comment
        from communications.utils.mention_utils import process_comment_mentions
        from documents.models import ProjectDocument

        doc = ProjectDocument.objects.create(
            project=project_with_member,
            kind="concept",
            status="new",
            creator=staff_user,
            modifier=staff_user,
        )
        # Reference a nonexistent user
        html = '<p><span data-user-id="99999">@Ghost</span></p>'
        comment = Comment.objects.create(
            document=doc,
            user=staff_user,
            text=html,
        )

        result = process_comment_mentions(comment)
        assert result == []
