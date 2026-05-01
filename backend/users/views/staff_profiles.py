"""
Staff profile views
"""

from django.conf import settings
from django.template.loader import render_to_string
from rest_framework.exceptions import NotFound
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from config.helpers import send_email_with_embedded_image
from projects.models import ProjectMember
from projects.serializers import ProjectDataTableSerializer
from users.models import PublicStaffProfile
from users.serializers import (
    StaffProfileCreationSerializer,
    StaffProfileEmailListSerializer,
    StaffProfileSerializer,
    TinyStaffProfileSerializer,
)
from users.services import ExportService, ProfileService


class StaffProfiles(APIView):
    """List and create staff profiles"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        """
        List staff profiles with IT Assets filtering (BCS division only).

        Uses a two-phase approach for efficient pagination:
        1. Fetch/cache IT Assets data → extract BCS email set
        2. Filter users at the DB level using email__in, then paginate
        3. Enrich only the current page with IT Assets metadata
        """
        from math import ceil

        import requests
        from django.core.cache import cache
        from django.db.models import Case, CharField, Q, Value, When
        from django.db.models.functions import Concat

        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1
        page = max(1, page)

        try:
            page_size = int(request.query_params.get("page_size", 24))
        except ValueError:
            page_size = 24
        page_size = max(1, min(100, page_size))

        search_term = request.query_params.get(
            "searchTerm"
        ) or request.query_params.get("search")
        show_hidden = request.query_params.get("showHidden", "false").lower() == "true"

        # Phase 1: Fetch IT Assets data (cached for 30 minutes)
        cache_key = "it_assets_data"
        it_asset_data_by_email = cache.get(cache_key)

        if it_asset_data_by_email is None:
            try:
                api_url = settings.IT_ASSETS_URL
                response = requests.get(
                    api_url,
                    auth=(settings.IT_ASSETS_USER, settings.IT_ASSETS_ACCESS_TOKEN),
                    timeout=6,  # 6 seconds — fail fast, don't make users wait
                )
                if response.status_code == 200:
                    data = response.json()
                    it_asset_data_by_email = {
                        user_data["email"]: user_data
                        for user_data in data
                        if "email" in user_data
                    }
                    cache.set(cache_key, it_asset_data_by_email, 1800)  # 30 minutes
                else:
                    settings.LOGGER.error(
                        f"Failed to fetch IT Assets data: {response.status_code} {response.text}"
                    )
                    it_asset_data_by_email = {}
                    cache.set(
                        cache_key, {}, 60
                    )  # Cache empty for 1 minute before retry
            except Exception as e:
                settings.LOGGER.error(f"IT Assets API error: {e}")
                it_asset_data_by_email = {}
                cache.set(cache_key, {}, 60)  # Cache empty for 1 minute before retry

        it_assets_available = bool(it_asset_data_by_email)

        # Extract BCS division emails for DB-level filtering
        bcs_emails = set()
        if it_assets_available:
            for email, user_data in it_asset_data_by_email.items():
                if (
                    user_data.get("unit")
                    == "Biodiversity and Conservation Science Division"
                ):
                    bcs_emails.add(email)

        # Phase 2: Build queryset with DB-level BCS filter + pagination
        from users.models import User

        base_queryset = (
            User.objects.filter(
                is_staff=True,
                staff_profile__isnull=False,
            )
            .select_related(
                "staff_profile",
                "work",
                "work__branch",
                "work__business_area",
                "avatar",
            )
            .prefetch_related("business_areas_led")
        )

        # Apply BCS division filter at DB level (or include all if API unavailable)
        if it_assets_available:
            if not bcs_emails:
                settings.LOGGER.warning(
                    "IT Assets API returned data but no BCS division users found. "
                    "The division name may have changed."
                )
            base_queryset = base_queryset.filter(email__in=bcs_emails)
        else:
            settings.LOGGER.warning(
                "IT Assets API unavailable — serving staff directory "
                "from database without enrichment"
            )

        if search_term:
            search_parts = search_term.split()
            if len(search_parts) >= 2:
                first_name = search_parts[0]
                last_name = " ".join(search_parts[1:])
                users = base_queryset.filter(
                    Q(first_name__icontains=first_name)
                    & Q(last_name__icontains=last_name)
                )
            else:
                users = base_queryset.filter(
                    Q(first_name__icontains=search_term)
                    | Q(last_name__icontains=search_term)
                )
        else:
            users = base_queryset

        # Handle hidden profile filtering
        if not request.user.is_authenticated:
            users = users.exclude(staff_profile__is_hidden=True)
        elif request.user.is_superuser:
            if not show_hidden:
                users = users.exclude(staff_profile__is_hidden=True)
        else:
            users = users.exclude(
                ~Q(id=request.user.id) & Q(staff_profile__is_hidden=True)
            )

        # Sort alphabetically — check for both null AND empty string on display names
        users = users.annotate(
            display_name=Case(
                When(
                    condition=(
                        Q(display_first_name__isnull=False)
                        & ~Q(display_first_name="")
                        & Q(display_last_name__isnull=False)
                        & ~Q(display_last_name="")
                    ),
                    then=Concat(
                        "display_first_name",
                        Value(" "),
                        "display_last_name",
                    ),
                ),
                default=Concat("first_name", Value(" "), "last_name"),
                output_field=CharField(),
            )
        ).order_by("display_name")

        # DB-level pagination
        total_users = users.count()
        total_pages = ceil(total_users / page_size) if total_users > 0 else 0
        start = (page - 1) * page_size
        end = start + page_size
        page_users = list(users[start:end])

        # Phase 3: Enrich only the current page with IT Assets data + batch-update profiles
        profiles_to_update = []
        for user in page_users:
            user_data = (
                it_asset_data_by_email.get(user.email) if it_assets_available else None
            )
            if user_data:
                if (
                    user.staff_profile.it_asset_id is None
                    or user.staff_profile.employee_id is None
                ):
                    new_it_asset_id = user_data.get("id")
                    new_employee_id = user_data.get("employee_id")
                    changed = False
                    if (
                        user.staff_profile.it_asset_id is None
                        and new_it_asset_id is not None
                    ):
                        user.staff_profile.it_asset_id = new_it_asset_id
                        changed = True
                    if (
                        user.staff_profile.employee_id is None
                        and new_employee_id is not None
                    ):
                        user.staff_profile.employee_id = new_employee_id
                        changed = True
                    if changed:
                        profiles_to_update.append(user.staff_profile)

                user.division = user_data.get("division")
                user.unit = user_data.get("unit")
                user.location = user_data.get("location")
                user.position = user_data.get("title")
            else:
                user.division = None
                user.unit = None
                user.location = None
                user.position = None

        if profiles_to_update:
            PublicStaffProfile.objects.bulk_update(
                profiles_to_update, ["it_asset_id", "employee_id"]
            )

        serialized_users = TinyStaffProfileSerializer(
            [u.staff_profile for u in page_users],
            many=True,
            context={"request": request},
        ).data

        # Enrich serialised data with IT Assets fields
        for i, user in enumerate(page_users):
            if i < len(serialized_users):
                serialized_users[i]["division"] = getattr(user, "division", None)
                serialized_users[i]["unit"] = getattr(user, "unit", None)
                serialized_users[i]["location"] = getattr(user, "location", None)
                serialized_users[i]["position"] = getattr(user, "position", None)
                serialized_users[i]["custom_title"] = (
                    user.staff_profile.custom_title if user.staff_profile else None
                )
                serialized_users[i]["custom_title_on"] = (
                    user.staff_profile.custom_title_on if user.staff_profile else False
                )

        return Response(
            {
                "users": serialized_users,
                "total_results": total_users,
                "page": page,
                "total_pages": total_pages,
                "it_assets_available": it_assets_available,
                "showing_hidden": (
                    request.user.is_authenticated
                    and request.user.is_superuser
                    and show_hidden
                ),
            },
            status=HTTP_200_OK,
        )

    def post(self, request):
        """Create staff profile"""
        settings.LOGGER.info(f"{request.user} is creating staff profile")
        serializer = StaffProfileCreationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        profile = ProfileService.create_staff_profile(
            request.user.id, serializer.validated_data
        )
        result = StaffProfileSerializer(profile)
        return Response(result.data, status=HTTP_201_CREATED)


class StaffProfileDetail(APIView):
    """Get, update, and delete staff profile"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        """Get staff profile detail"""
        profile = ProfileService.get_visible_staff_profile(pk, request.user)
        serializer = StaffProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update staff profile"""
        settings.LOGGER.info(f"{request.user} is updating staff profile (pk={pk})")
        serializer = StaffProfileSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        profile = ProfileService.update_staff_profile(pk, serializer.validated_data)
        result = StaffProfileSerializer(profile)
        return Response(result.data, status=HTTP_202_ACCEPTED)

    def delete(self, request, pk):
        """Delete staff profile"""
        settings.LOGGER.warning(f"{request.user} is deleting staff profile (pk={pk})")
        ProfileService.delete_staff_profile(pk)
        return Response(status=HTTP_204_NO_CONTENT)


class MyStaffProfile(APIView):
    """Get current user's staff profile"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = ProfileService.get_staff_profile_by_user(request.user.id)
        if profile:
            serializer = StaffProfileSerializer(profile)
            return Response(serializer.data)
        return Response({"error": "No staff profile found"}, status=404)


class TogglePublicVisibility(APIView):
    """Toggle staff profile public visibility"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        settings.LOGGER.info(
            f"{request.user} is toggling staff profile visibility (pk={pk})"
        )
        profile = ProfileService.toggle_visibility(pk)
        serializer = StaffProfileSerializer(profile)
        return Response(serializer.data, status=HTTP_200_OK)


class ActiveStaffProfileEmails(APIView):
    """Get active staff profile emails"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = ProfileService.get_active_staff_emails()
        serializer = StaffProfileEmailListSerializer(
            [p.user for p in profiles], many=True
        )
        return Response(serializer.data)


class CheckStaffProfileAndReturnDataAndActiveState(APIView):
    """Check if staff profile exists and return data"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"error": "User ID required"}, status=400)

        result = ProfileService.check_staff_profile_exists(user_id)
        if result["exists"]:
            serializer = StaffProfileSerializer(result["profile"])
            return Response(
                {
                    "exists": True,
                    "is_active": result["is_active"],
                    "profile": serializer.data,
                }
            )
        return Response(
            {
                "exists": False,
                "is_active": False,
                "profile": None,
            }
        )


class DownloadBCSStaffCSV(APIView):
    """Download staff profiles as CSV"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return ExportService.generate_staff_csv()


class StaffProfileProjects(APIView):
    """Get staff profile projects"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        """Get all projects for a staff profile, excluding hidden ones"""
        # Check if the user's staff profile is hidden
        profile = ProfileService.get_staff_profile_by_user(pk)
        if profile and profile.is_hidden:
            is_owner = (
                request.user and not request.user.is_anonymous and request.user.id == pk
            )
            is_admin = (
                request.user
                and hasattr(request.user, "is_superuser")
                and request.user.is_superuser
            )
            if not is_owner and not is_admin:
                raise NotFound

        try:
            users_memberships = (
                ProjectMember.objects.filter(user=pk)
                .exclude(project__hidden_from_staff_profiles__contains=[pk])
                .select_related(
                    "project",
                    "project__business_area",
                    "project__image",
                    "user",
                )
            )
        except ProjectMember.DoesNotExist:
            raise NotFound

        if len(users_memberships) > 0:
            user_obj = users_memberships[0].user
            settings.LOGGER.info(
                msg=f"{request.user} is viewing {user_obj} and their projects"
            )
        else:
            settings.LOGGER.info(
                msg=f"{request.user} is viewing user with pk {pk} and their projects (none)"
            )

        projects_with_roles = [
            (membership.project, membership.role) for membership in users_memberships
        ]

        serialized_projects = ProjectDataTableSerializer(
            [proj for proj, _ in projects_with_roles],
            many=True,
            context={"request": request, "projects_with_roles": projects_with_roles},
        )

        return Response(serialized_projects.data, status=HTTP_200_OK)


class PublicEmailStaffMember(APIView):
    """Send public email to staff member"""

    permission_classes = [AllowAny]

    def post(self, request, pk):
        """Send email to staff member from public"""
        settings.LOGGER.info(
            msg=f"(PUBLIC) {request.user} is attempting to use '{request.data.get('senderEmail')}' to send an email to a staff member"
        )

        try:
            staff_profile = PublicStaffProfile.objects.get(user__pk=pk)

            # Block emailing hidden profiles
            if staff_profile.is_hidden:
                return Response({"error": "Staff profile not found"}, status=404)

            recipient_name = f"{staff_profile.user.display_first_name} {staff_profile.user.display_last_name}"

            # Use public email if available, otherwise use IT asset email
            recipient_email = (
                staff_profile.public_email
                if staff_profile.public_email_on
                and staff_profile.public_email not in [None, ""]
                else staff_profile.get_it_asset_email()
            )

            settings.LOGGER.warning(
                msg=f"(PUBLIC) {request.data.get('senderEmail')} sent a public email to {recipient_email}"
            )

            # Email details
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = [recipient_email]
            template_path = "email_templates/staff_profile_email.html"

            sender_email = request.data.get("senderEmail")

            # Template context — uses shared partials
            template_props = {
                "recipient_name": recipient_name,
                "staff_message": request.data.get("message"),
                "public_users_listed_email": sender_email,
                "reply_mailto": f"mailto:{sender_email}",
                "logo_url": True,
                "email_title": "Staff Profile Contact",
            }

            # Render the email template
            template_content = render_to_string(template_path, template_props)

            try:
                send_email_with_embedded_image(
                    recipient_email=to_email,
                    subject="Staff Profile Message",
                    html_content=template_content,
                    from_email=from_email,
                )
                return Response({"ok": "Email sent"}, status=HTTP_200_OK)
            except Exception as e:
                settings.LOGGER.error(
                    msg=f"Email Error: {e}\n If this is a 'getaddrinfo' error, you are likely running outside of OIM's datacenters."
                )
                return Response(
                    {"error": "Failed to send email. Please try again."}, status=400
                )

        except PublicStaffProfile.DoesNotExist:
            return Response({"error": "Staff profile not found"}, status=404)
        except Exception as e:
            settings.LOGGER.error(msg=f"Error sending email: {e}")
            return Response(
                {"error": "Failed to send email. Please try again."}, status=400
            )
