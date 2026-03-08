"""
Utility functions for detecting and processing @mentions in comments
"""

import re
from typing import List

from django.conf import settings

from users.models import User


def extract_mentions(text: str) -> List[str]:
    """
    Extract @mention full names from comment text

    Matches patterns like:
    - @John Smith
    - @Jane Doe
    - @Bob Johnson

    Format: @FirstName LastName (space-separated)

    Args:
        text: Comment text content

    Returns:
        List of mentioned full names (without @ symbol)
    """
    # Pattern matches @ followed by two words (first and last name)
    # Each word starts with uppercase letter followed by lowercase letters
    pattern = r"@([A-Z][a-z]+\s[A-Z][a-z]+)"
    matches = re.findall(pattern, text)

    # Remove duplicates while preserving order
    seen = set()
    unique_mentions = []
    for match in matches:
        if match.lower() not in seen:
            seen.add(match.lower())
            unique_mentions.append(match)

    return unique_mentions


def validate_mentioned_users(full_names: List[str], project_id: int) -> List[User]:
    """
    Validate that mentioned users exist and are part of the project team

    Project team includes:
    - Project team members
    - Business area leads
    - Administrators

    Args:
        full_names: List of full names (FirstName LastName) to validate
        project_id: Project ID to check team membership

    Returns:
        List of valid User objects
    """
    if not full_names:
        return []

    from projects.models import Project

    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        settings.LOGGER.warning(
            f"Project {project_id} not found for mention validation"
        )
        return []

    # Get all valid users for this project
    valid_users = []

    for full_name in full_names:
        try:
            # Split full name into first and last name
            name_parts = full_name.split(" ", 1)
            if len(name_parts) != 2:
                settings.LOGGER.info(f"Invalid name format: {full_name}")
                continue

            first_name, last_name = name_parts

            # Try to find user by display names (case-insensitive)
            user = User.objects.filter(
                display_first_name__iexact=first_name,
                display_last_name__iexact=last_name,
            ).first()

            if not user:
                settings.LOGGER.info(f"User {full_name} not found for mention")
                continue

            # Check if user is part of project team, BA lead, or admin
            if is_user_mentionable(user, project):
                valid_users.append(user)
            else:
                settings.LOGGER.info(
                    f"User {full_name} not mentionable in project {project_id}"
                )
        except Exception as e:
            settings.LOGGER.error(f"Error validating mention for {full_name}: {e}")
            continue

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
    Process mentions in a comment

    Extracts mentions in @FirstName LastName format, validates users,
    and creates CommentMention records.

    Args:
        comment: Comment instance

    Returns:
        List of mentioned User objects
    """
    # Extract mentions from comment text
    full_names = extract_mentions(comment.text)

    if not full_names:
        return []

    # Get project ID from comment's document
    project_id = comment.document.project_id

    # Validate mentioned users
    valid_users = validate_mentioned_users(full_names, project_id)

    if not valid_users:
        return []

    # Create mention records
    create_mention_records(comment, valid_users)

    settings.LOGGER.info(
        f"Processed {len(valid_users)} mentions in comment {comment.pk}"
    )

    return valid_users
