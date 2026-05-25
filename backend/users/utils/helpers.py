"""
User helper utilities
"""

from django.db.models import Q


def search_users(queryset, search_term):
    """
    Search users by name, username, or email

    Args:
        queryset: Base User queryset
        search_term: Search term

    Returns:
        Filtered queryset
    """
    if not search_term or len(search_term) < 2:
        return queryset

    search_term = search_term.strip()
    search_parts = search_term.split(" ", 1)

    if len(search_parts) == 2:
        first_part, last_part = search_parts
        return queryset.filter(
            Q(first_name__icontains=first_part) & Q(last_name__icontains=last_part)
            | Q(display_first_name__icontains=first_part)
            & Q(display_last_name__icontains=last_part)
            | Q(email__icontains=search_term)
            | Q(username__icontains=search_term)
        )

    return queryset.filter(
        Q(username__icontains=search_term)
        | Q(email__icontains=search_term)
        | Q(first_name__icontains=search_term)
        | Q(last_name__icontains=search_term)
        | Q(display_first_name__icontains=search_term)
        | Q(display_last_name__icontains=search_term)
    )


def search_profiles(queryset, search_term):
    """
    Search profiles by user name, email, or about text

    Args:
        queryset: Base PublicStaffProfile queryset
        search_term: Search term

    Returns:
        Filtered queryset
    """
    if not search_term or len(search_term) < 2:
        return queryset

    return queryset.filter(
        Q(user__first_name__icontains=search_term)
        | Q(user__last_name__icontains=search_term)
        | Q(user__display_first_name__icontains=search_term)
        | Q(user__display_last_name__icontains=search_term)
        | Q(user__email__icontains=search_term)
        | Q(about__icontains=search_term)
        | Q(expertise__icontains=search_term)
    )


def format_user_name(user):
    """
    Format user's full name

    Args:
        user: User object

    Returns:
        Formatted name string
    """
    return f"{user.display_first_name} {user.display_last_name}"


def get_user_avatar_url(user):
    """
    Get user's avatar URL

    Args:
        user: User object

    Returns:
        Avatar URL or None
    """
    import logging

    logger = logging.getLogger(__name__)

    try:
        if hasattr(user, "avatar") and user.avatar and user.avatar.file:
            return user.avatar.file.url
    except Exception as e:
        logger.debug(f"Failed to get avatar URL for user {user.pk}: {e}")
    return None


def get_user_business_area(user):
    """
    Get user's business area

    Args:
        user: User object

    Returns:
        BusinessArea object or None
    """
    if hasattr(user, "work") and user.work and user.work.business_area:
        return user.work.business_area
    return None
