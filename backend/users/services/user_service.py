"""
User service for core user operations
"""

import logging

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import Q
from django.utils.crypto import get_random_string
from rest_framework.exceptions import NotFound, ValidationError

from users.models import User

logger = logging.getLogger(__name__)


class UserService:
    """Business logic for user operations"""

    @staticmethod
    def authenticate_user(username, password):
        """
        Authenticate user with username and password

        Args:
            username: Username
            password: Password

        Returns:
            User object if authenticated, None otherwise
        """
        if not username or not password:
            raise ValidationError("Username and password are required")

        return authenticate(username=username, password=password)

    @staticmethod
    def login_user(request, user):
        """
        Log in user

        Args:
            request: HTTP request
            user: User to log in
        """
        login(request, user)

    @staticmethod
    def logout_user(request):
        """
        Log out user

        Args:
            request: HTTP request

        Returns:
            Dict with logout URL if available
        """
        settings.LOGGER.info(f"{request.user} is logging out")
        logout(request)

        logout_url = request.headers.get("x-logout-url")
        if logout_url:
            return {"logoutUrl": logout_url}
        return {}

    @staticmethod
    @transaction.atomic
    def change_password(user, old_password, new_password):
        """
        Change user password

        Args:
            user: User object
            old_password: Current password
            new_password: New password

        Raises:
            ValidationError: If old password is incorrect
        """
        if not user.check_password(old_password):
            raise ValidationError("Incorrect old password")

        user.set_password(new_password)
        user.save()

    @staticmethod
    def list_users(filters=None):
        """
        List users with optional filters

        Args:
            filters: Dict of filter parameters (query_params)

        Returns:
            QuerySet of User objects
        """
        users = User.objects.select_related(
            "profile",
            "work",
            "work__business_area",
        ).prefetch_related(
            "groups",
        )

        # Apply filters if provided
        if filters:
            users = UserService._apply_filters(users, filters)

        return users.order_by("last_name", "first_name").distinct()

    @staticmethod
    def _apply_filters(queryset, filters):
        """Apply filters to user queryset"""
        # Search term
        search = filters.get("search")
        if search:
            search = search.strip()
            search_parts = search.split(" ", 1)

            if len(search_parts) == 2:
                # Two-part search: match first + last name combinations
                first_part, last_part = search_parts
                queryset = queryset.filter(
                    Q(first_name__icontains=first_part)
                    & Q(last_name__icontains=last_part)
                    | Q(display_first_name__icontains=first_part)
                    & Q(display_last_name__icontains=last_part)
                    | Q(email__icontains=search)
                    | Q(username__icontains=search)
                )
            else:
                # Single-term search: match against all name fields
                queryset = queryset.filter(
                    Q(username__icontains=search)
                    | Q(email__icontains=search)
                    | Q(first_name__icontains=search)
                    | Q(last_name__icontains=search)
                    | Q(display_first_name__icontains=search)
                    | Q(display_last_name__icontains=search)
                )

        # Staff filter (only_staff=true means is_staff=True)
        only_staff = filters.get("only_staff")
        if only_staff and only_staff.lower() == "true":
            queryset = queryset.filter(is_staff=True)

        # is_staff filter (direct boolean filter)
        is_staff = filters.get("is_staff")
        if is_staff is not None:
            # Handle both boolean and string values
            if isinstance(is_staff, str):
                is_staff = is_staff.lower() == "true"
            queryset = queryset.filter(is_staff=is_staff)

        # External filter (only_external=true means is_staff=False)
        only_external = filters.get("only_external")
        if only_external and only_external.lower() == "true":
            queryset = queryset.filter(is_staff=False)

        # Superuser filter
        only_superuser = filters.get("only_superuser")
        if only_superuser and only_superuser.lower() == "true":
            queryset = queryset.filter(is_superuser=True)

        # is_superuser filter (direct boolean filter)
        is_superuser = filters.get("is_superuser")
        if is_superuser is not None:
            # Handle both boolean and string values
            if isinstance(is_superuser, str):
                is_superuser = is_superuser.lower() == "true"
            queryset = queryset.filter(is_superuser=is_superuser)

        # BA Lead filter (users who lead a business area)
        only_ba_lead = filters.get("only_ba_lead")
        if only_ba_lead and only_ba_lead.lower() == "true":
            from agencies.models import BusinessArea

            ba_leader_ids = BusinessArea.objects.values_list(
                "leader_id", flat=True
            ).distinct()
            queryset = queryset.filter(id__in=ba_leader_ids)

        # Approver filter (users who are key_stakeholder or approver of any division)
        approver = filters.get("approver")
        if approver and approver.lower() == "true":
            pass

            queryset = queryset.filter(
                Q(divisions_key_stakeholder__isnull=False)
                | Q(divisions_approver__isnull=False)
            )

        # Key stakeholder filter (users who are key_stakeholder of any division)
        only_key_stakeholder = filters.get("only_key_stakeholder")
        if only_key_stakeholder and only_key_stakeholder.lower() == "true":
            queryset = queryset.filter(divisions_key_stakeholder__isnull=False)

        # Business area filter
        business_area = filters.get("business_area") or filters.get("businessArea")
        if business_area:
            queryset = queryset.filter(work__business_area_id=business_area)

        # Active filter
        is_active = filters.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        # Ignore array (exclude specific user IDs)
        ignore_array = filters.get("ignoreArray")
        if ignore_array:
            if isinstance(ignore_array, str):
                ignore_ids = [
                    int(id.strip()) for id in ignore_array.split(",") if id.strip()
                ]
            else:
                ignore_ids = ignore_array
            queryset = queryset.exclude(id__in=ignore_ids)

        return queryset

    @staticmethod
    def get_users_by_directorate(directorate_id):
        """
        Get users by directorate (via business area division)

        Args:
            directorate_id: Division ID

        Returns:
            QuerySet of User objects
        """
        return (
            User.objects.filter(work__business_area__division_id=directorate_id)
            .select_related(
                "profile",
                "work",
                "work__business_area",
            )
            .distinct()
        )

    @staticmethod
    def _is_valid_cached_user(cached_user):
        """
        Validate that cached user is a complete User instance with all relationships loaded

        Args:
            cached_user: Object retrieved from cache

        Returns:
            bool: True if valid User instance with all relationships, False otherwise
        """
        # Type check - must be a User instance
        if not isinstance(cached_user, User):
            return False

        # Check select_related relationships are loaded
        try:
            # Verify profile relationship (required)
            _ = cached_user.profile

            # Verify work relationship (optional - may not exist for external users)
            # Use hasattr to check if relationship exists without triggering query
            if hasattr(cached_user, "work"):
                try:
                    # If work exists, verify it's loaded
                    _ = cached_user.work
                    # If work exists, verify nested business_area
                    _ = cached_user.work.business_area
                except ObjectDoesNotExist:
                    # Work relationship exists but object doesn't exist
                    # This is incomplete cache data
                    return False
            # If work doesn't exist (external user), that's valid

        except AttributeError:
            # Missing required relationships means incomplete cache
            return False
        except User.DoesNotExist:
            # User doesn't exist means incomplete cache
            return False

        # Check prefetch_related relationships are loaded
        # Django stores prefetched objects in _prefetched_objects_cache
        if not hasattr(cached_user, "_prefetched_objects_cache"):
            return False

        if "groups" not in cached_user._prefetched_objects_cache:
            return False

        return True

    @staticmethod
    def get_user(user_id):
        """
        Get user by ID with caching

        Args:
            user_id: User ID

        Returns:
            User object

        Raises:
            NotFound: If user doesn't exist
        """
        cache_key = settings.CACHE_KEYS["user_profile"].format(user_id=user_id)

        try:
            cached_user = cache.get(cache_key)
            if cached_user is not None:
                # Validate cached data before returning
                if UserService._is_valid_cached_user(cached_user):
                    logger.debug(f"Cache hit for user {user_id} profile")
                    return cached_user
                else:
                    # Invalid cache entry - log and continue to database query
                    logger.warning(
                        f"Invalid cached data for user {user_id}: "
                        f"type={type(cached_user).__name__}, "
                        f"is_user={isinstance(cached_user, User)}"
                    )
        except Exception as e:
            logger.warning(f"Cache error for user {user_id} profile: {e}")

        # Cache miss or invalid cache - query database
        logger.debug(f"Cache miss for user {user_id} profile")
        try:
            user = (
                User.objects.select_related(
                    "profile",
                    "work",
                    "work__business_area",
                )
                .prefetch_related(
                    "groups",
                )
                .get(pk=user_id)
            )

            # Cache the fresh data for 10 minutes
            try:
                cache.set(cache_key, user, timeout=settings.CACHE_TTL["user_profile"])
                logger.debug(f"Cached user {user_id} profile after recovery")
            except Exception as e:
                logger.warning(f"Failed to cache user {user_id} profile: {e}")

            return user
        except User.DoesNotExist:
            raise NotFound(f"User {user_id} not found")

    @staticmethod
    def invalidate_user_profile_cache(user_id):
        """
        Invalidate cache for a specific user's profile

        Args:
            user_id: User ID to invalidate cache for
        """
        cache_key = settings.CACHE_KEYS["user_profile"].format(user_id=user_id)
        try:
            cache.delete(cache_key)
            logger.debug(f"Invalidated cache for user {user_id} profile")
        except Exception as e:
            logger.warning(f"Failed to invalidate cache for user {user_id}: {e}")

    @staticmethod
    @transaction.atomic
    def create_user(data):
        """
        Create new user with associated records.

        For staff users (is_staff=True), creates the same associated records
        as the DBCA middleware: UserWork, UserProfile, UserContact, and
        PublicStaffProfile. External users only get the base User record.

        Args:
            data: User data dict

        Returns:
            Created User object
        """
        settings.LOGGER.info(f"Creating user: {data.get('username')}")

        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        is_staff = data.get("is_staff", False)

        user = User.objects.create_user(
            username=data["username"],
            email=data.get("email", ""),
            password=data.get("password", get_random_string(12)),
            first_name=first_name,
            last_name=last_name,
            display_first_name=first_name,
            display_last_name=last_name,
            is_staff=is_staff,
            is_superuser=data.get("is_superuser", False),
        )

        # Staff users need associated records (matching dbca_middleware behaviour)
        if is_staff:
            from agencies.models import Agency
            from contacts.models import UserContact
            from users.models import PublicStaffProfile, UserProfile, UserWork

            agency_instance = Agency.objects.first()
            work_kwargs = {"user": user}
            if agency_instance:
                work_kwargs["agency"] = agency_instance

            # Set branch and business area if provided
            branch_id = data.get("branch")
            business_area_id = data.get("business_area")
            if branch_id:
                work_kwargs["branch_id"] = branch_id
            if business_area_id:
                work_kwargs["business_area_id"] = business_area_id

            UserWork.objects.create(**work_kwargs)
            UserProfile.objects.create(user=user)
            UserContact.objects.create(user=user)
            PublicStaffProfile.objects.create(
                user=user,
                is_hidden=True,
            )

            settings.LOGGER.info(
                f"Created associated records (UserWork, UserProfile, UserContact, "
                f"PublicStaffProfile) for staff user {user.username}"
            )

        return user

    @staticmethod
    @transaction.atomic
    def update_user(user_id, data):
        """
        Update user

        Args:
            user_id: User ID
            data: Update data dict

        Returns:
            Updated User object
        """
        user = UserService.get_user(user_id)
        settings.LOGGER.info(f"Updating user {user}")

        for field, value in data.items():
            if field == "password":
                user.set_password(value)
            else:
                setattr(user, field, value)

        user.save()

        # Invalidate user profile cache
        UserService.invalidate_user_profile_cache(user_id)

        return user

    @staticmethod
    @transaction.atomic
    def delete_user(user_id):
        """
        Delete user

        Args:
            user_id: User ID
        """
        user = UserService.get_user(user_id)
        settings.LOGGER.info(f"Deleting user {user}")

        # Invalidate user profile cache before deletion
        UserService.invalidate_user_profile_cache(user_id)

        user.delete()

    @staticmethod
    @transaction.atomic
    def toggle_active(user_id):
        """
        Toggle user active status

        Args:
            user_id: User ID

        Returns:
            Updated User object
        """
        user = UserService.get_user(user_id)
        user.is_active = not user.is_active
        user.save()

        settings.LOGGER.info(f"Toggled active status for {user}: {user.is_active}")

        # Invalidate user profile cache
        UserService.invalidate_user_profile_cache(user_id)

        return user

    @staticmethod
    @transaction.atomic
    def switch_admin(user_id):
        """
        Toggle user admin status

        Args:
            user_id: User ID

        Returns:
            Updated User object
        """
        user = UserService.get_user(user_id)
        user.is_superuser = not user.is_superuser
        user.save()

        settings.LOGGER.info(f"Toggled admin status for {user}: {user.is_superuser}")

        # Invalidate user profile cache
        UserService.invalidate_user_profile_cache(user_id)

        return user

    @staticmethod
    def check_email_exists(email):
        """
        Check if email already exists

        Args:
            email: Email to check

        Returns:
            Boolean
        """
        return User.objects.filter(email=email).exists()

    @staticmethod
    def check_username_exists(username):
        """
        Check if username already exists

        Args:
            username: Username to check

        Returns:
            Boolean
        """
        return User.objects.filter(username=username).exists()
