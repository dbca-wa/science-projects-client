"""
Comment permission utilities for checking user access to comment operations.
"""

from django.contrib.auth import get_user_model

from communications.models import Comment
from projects.models import Project, ProjectMember

User = get_user_model()


def can_user_comment(user: User, project: Project) -> bool:
    """
    Check if user can comment on a project.

    User can comment if:
    1. User is a superuser
    2. User belongs to "Directorate" business area (case-sensitive)
    3. User is a project team member
    4. User's business area matches project's business area (BA lead)

    Args:
        user: The user to check
        project: The project to check against

    Returns:
        True if user can comment, False otherwise
    """
    if not user or not user.is_authenticated:
        return False

    # Superuser check
    if user.is_superuser:
        return True

    # Directorate check (exact match, case-sensitive)
    # Check if user has work relationship and business_area
    if (
        hasattr(user, "work")
        and user.work
        and user.work.business_area
        and user.work.business_area.name == "Directorate"
    ):
        return True

    # Project team member check
    if ProjectMember.objects.filter(project=project, user=user).exists():
        return True

    # Business area lead check
    if (
        hasattr(user, "work")
        and user.work
        and user.work.business_area
        and project.business_area
        and user.work.business_area.pk == project.business_area.pk
    ):
        return True

    return False


def can_user_edit_comment(user: User, comment: Comment) -> bool:
    """
    Check if user can edit a specific comment.

    User can edit if:
    1. User is the comment author AND
    2. User currently has comment permission on the project

    Args:
        user: The user to check
        comment: The comment to check

    Returns:
        True if user can edit, False otherwise
    """
    if not user or not user.is_authenticated:
        return False

    if not comment.user or comment.user.pk != user.pk:
        return False

    # Get project from comment's document
    project = comment.document.project

    # Must also have current comment permission
    return can_user_comment(user, project)


def can_user_delete_comment(user: User, comment: Comment) -> bool:
    """
    Check if user can delete a specific comment.

    User can delete if:
    1. User is a superuser OR
    2. User is the comment author (regardless of current project access)

    Args:
        user: The user to check
        comment: The comment to check

    Returns:
        True if user can delete, False otherwise
    """
    if not user or not user.is_authenticated:
        return False

    # Superuser can delete any comment
    if user.is_superuser:
        return True

    if not comment.user:
        return False

    # Author can delete their own comment
    return comment.user.pk == user.pk
