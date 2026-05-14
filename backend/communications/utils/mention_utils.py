"""
Utility functions for detecting and processing @mentions in comments.

Mentions are extracted from the HTML stored in comment.text by parsing
data-user-id attributes on Lexical mention spans. This is reliable
regardless of name format (hyphenated, "Mc" prefixes, multi-word, etc.).
"""

from typing import List

from bs4 import BeautifulSoup
from django.conf import settings

from users.models import User


def extract_mention_user_ids(html_text: str) -> List[int]:
    """
    Extract unique user IDs from mention spans in comment HTML.

    The frontend (Lexical editor) stores mentions as spans with data-user-id:
        <span class="mention" data-user-id="1068"
              data-display-name="Rory McAuley"
              data-email="rory.mcauley@dbca.wa.gov.au">@Rory McAuley</span>

    This function finds ALL spans with a data-user-id attribute and extracts
    the user IDs, returning a deduplicated list.

    Args:
        html_text: Raw HTML comment content from the Lexical editor.

    Returns:
        Deduplicated list of user IDs found in mention spans.
    """
    if not html_text:
        return []

    try:
        soup = BeautifulSoup(html_text, "html.parser")
    except Exception as e:
        settings.LOGGER.error(f"Failed to parse comment HTML for mentions: {e}")
        return []

    # Find spans by data-user-id attribute (the reliable identifier).
    # This matches both class="mention" and data-lexical-mention="true" variants.
    mention_spans = soup.find_all("span", attrs={"data-user-id": True})

    seen = set()
    user_ids = []

    for span in mention_spans:
        raw_id = span.get("data-user-id")
        if not raw_id:
            continue

        try:
            uid = int(raw_id)
        except (ValueError, TypeError):
            settings.LOGGER.warning(
                f"Invalid data-user-id value in mention span: {raw_id}"
            )
            continue

        if uid not in seen:
            seen.add(uid)
            user_ids.append(uid)

    return user_ids


def validate_mentioned_users_by_id(user_ids: List[int], project_id: int) -> List[User]:
    """
    Validate that mentioned users exist, are active staff, and are
    mentionable in the given project.

    Args:
        user_ids: Deduplicated list of user PKs from mention spans.
        project_id: Project ID to check team membership.

    Returns:
        List of valid, mentionable User objects.
    """
    if not user_ids:
        return []

    from projects.models import Project

    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        settings.LOGGER.warning(
            f"Project {project_id} not found for mention validation"
        )
        return []

    valid_users = []

    for uid in user_ids:
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            settings.LOGGER.info(f"Mentioned user ID {uid} not found in database")
            continue

        if not user.is_active or not user.is_staff:
            full_name = f"{user.display_first_name} {user.display_last_name}"
            settings.LOGGER.info(
                f"User {full_name} (ID {uid}) is inactive or not staff, skipping mention"
            )
            continue

        if is_user_mentionable(user, project):
            valid_users.append(user)
        else:
            full_name = f"{user.display_first_name} {user.display_last_name}"
            settings.LOGGER.info(
                f"User {full_name} (ID {uid}) not mentionable in project {project_id}"
            )

    return valid_users


def is_user_mentionable(user: User, project) -> bool:
    """
    Check if user can be mentioned in project comments

    Mentionable users:
    - All users who can comment (via can_user_comment)
    - Caretakers of users who can comment

    Args:
        user: User to check
        project: Project instance

    Returns:
        True if user can be mentioned
    """
    from caretakers.models import Caretaker
    from communications.utils.comment_permissions import can_user_comment

    # Direct permission check - if user can comment, they can be mentioned
    if can_user_comment(user, project):
        return True

    # Caretaker check - if user is caretaking for someone with permission
    caretaking_for = Caretaker.objects.filter(caretaker=user).values_list(
        "user", flat=True
    )

    for user_id in caretaking_for:
        try:
            caretaken_user = User.objects.get(pk=user_id)
            if can_user_comment(caretaken_user, project):
                return True
        except User.DoesNotExist:
            continue

    return False


def create_mention_records(comment, mentioned_users: List[User]) -> None:
    """
    Create CommentMention records for mentioned users

    Args:
        comment: Comment instance
        mentioned_users: List of User objects to create mentions for
    """
    from communications.models import CommentMention

    for user in mentioned_users:
        # Use get_or_create to avoid duplicates
        mention, created = CommentMention.objects.get_or_create(
            comment=comment, mentioned_user=user
        )

        if created:
            full_name = f"{user.display_first_name} {user.display_last_name}"
            settings.LOGGER.info(
                f"Created mention for user {full_name} in comment {comment.pk}"
            )


def process_comment_mentions(comment) -> List[User]:
    """
    Process mentions in a comment.

    Parses the comment HTML to extract user IDs from Lexical mention spans,
    validates users against the project team, and creates CommentMention records.

    Args:
        comment: Comment instance (must have .text and .document.project_id)

    Returns:
        List of mentioned User objects that were validated and recorded.
    """
    # Extract user IDs from mention spans in the HTML
    user_ids = extract_mention_user_ids(comment.text)

    if not user_ids:
        return []

    # Get project ID from comment's document
    project_id = comment.document.project_id

    # Validate mentioned users
    valid_users = validate_mentioned_users_by_id(user_ids, project_id)

    if not valid_users:
        settings.LOGGER.info(
            f"Comment {comment.pk}: {len(user_ids)} mention IDs extracted "
            f"but none validated for project {project_id}"
        )
        return []

    # Create mention records
    create_mention_records(comment, valid_users)

    # Single summary log line with all mentioned names
    names = ", ".join(
        f"{u.display_first_name} {u.display_last_name} (ID {u.pk})" for u in valid_users
    )
    settings.LOGGER.info(
        f"Comment {comment.pk}: {len(valid_users)} mention(s) processed — {names}"
    )

    return valid_users
