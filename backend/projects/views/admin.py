"""
Project admin and remedy views
"""

from datetime import date

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from documents.models import ProjectClosure, ProjectDocument

from ..models import Project, ProjectMember
from ..serializers import ProblematicProjectSerializer, TinyProjectSerializer


class UnapprovedThisFY(APIView):
    """Get unapproved projects for current fiscal year"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects needing approval"""
        settings.LOGGER.info(f"{request.user} is viewing unapproved projects")

        today = date.today()
        if today.month >= 7:
            fy_start_year = today.year
        else:
            fy_start_year = today.year - 1

        projects = (
            Project.objects.filter(year=fy_start_year, status__in=["new", "pending"])
            .select_related(
                "business_area",
                "business_area__division",
                "business_area__division__director",
                "business_area__division__key_stakeholder",
                "business_area__leader",
                "business_area__image",
                "image",
                "image__uploader",
            )
            .prefetch_related(
                "members",
                "members__user",
                "business_area__division__approvers",
                "business_area__division__directorate_email_list",
            )
        )

        serializer = TinyProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class ProblematicProjects(APIView):
    """Get projects with issues"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with various issues"""
        settings.LOGGER.info(f"{request.user} is viewing problematic projects")

        active_statuses = Project.ACTIVE_ONLY

        # Projects that are open but have approved closure
        open_with_closure = (
            Project.objects.filter(
                status__in=active_statuses,
            )
            .exclude(Q(closure__isnull=True) | Q(closure__document__status="new"))
            .select_related("business_area")
            .prefetch_related("members")
            .distinct()
        )

        # Projects with no members
        memberless = (
            Project.objects.annotate(member_count=Count("members"))
            .filter(member_count=0, status__in=active_statuses)
            .select_related("business_area")
        )

        # Projects with no leader (EXCLUDE memberless — they're already in that list)
        leaderless = (
            Project.objects.filter(status__in=active_statuses)
            .annotate(member_count=Count("members"))
            .filter(member_count__gt=0)
            .exclude(members__is_leader=True)
            .select_related("business_area")
            .prefetch_related("members")
            .distinct()
        )

        # Projects with multiple leaders
        multiple_leaders = (
            Project.objects.annotate(
                leader_count=Count("members", filter=Q(members__is_leader=True))
            )
            .filter(leader_count__gt=1, status__in=active_statuses)
            .select_related("business_area")
            .prefetch_related("members")
        )

        # Projects with external leaders (is_leader=True but user is not staff)
        external_leaders = (
            Project.objects.filter(
                members__is_leader=True,
                members__user__is_staff=False,
                status__in=active_statuses,
            )
            .select_related("business_area")
            .prefetch_related("members", "members__user")
            .distinct()
        )

        # Projects with progress reports that have no updates since creation this FY
        no_progress = self._get_no_progress_projects()

        # Active projects with inactive staff leaders
        inactive_lead_active_project = (
            Project.objects.filter(
                status__in=active_statuses,
                members__is_leader=True,
                members__user__is_active=False,
            )
            .select_related("business_area")
            .prefetch_related("members", "members__user")
            .distinct()
        )

        # Active projects without a business area assigned
        no_business_area = Project.objects.filter(
            status__in=active_statuses,
            business_area__isnull=True,
        ).prefetch_related("members")

        # Projects with role mismatch between is_leader flag and role field:
        # Case 1: role=supervising but is_leader=False
        # Case 2: is_leader=True but role != supervising
        supervising_not_leader = Project.objects.filter(
            status__in=active_statuses,
            members__role=ProjectMember.RoleChoices.SUPERVISING,
            members__is_leader=False,
        )
        leader_not_supervising = Project.objects.filter(
            status__in=active_statuses,
            members__is_leader=True,
        ).exclude(
            members__is_leader=True,
            members__role=ProjectMember.RoleChoices.SUPERVISING,
        )
        role_mismatch = (
            (supervising_not_leader | leader_not_supervising)
            .select_related("business_area")
            .prefetch_related("members", "members__user")
            .distinct()
        )

        # Projects with a non-new closure document but NOT in a valid closure state
        closure_state_mismatch = (
            Project.objects.filter(
                documents__kind="projectclosure",
            )
            .exclude(documents__status="new")
            .exclude(status__in=Project.VALID_CLOSURE_STATES)
            .select_related("business_area")
            .prefetch_related("members")
            .distinct()
        )

        # Projects with ANY closure document not in closing-related states
        # (broader than closure_state_mismatch — includes suspended etc.)
        closure_not_closing = (
            Project.objects.filter(documents__kind="projectclosure")
            .exclude(
                status__in=[
                    Project.StatusChoices.CLOSUREREQ,
                    Project.StatusChoices.CLOSING,
                    Project.StatusChoices.FINAL_UPDATE,
                    Project.StatusChoices.COMPLETED,
                    Project.StatusChoices.TERMINATED,
                ]
            )
            .select_related("business_area")
            .prefetch_related("members")
            .distinct()
        )

        # Legacy suspended projects with a fully-approved closure whose
        # intended_outcome is NOT completed or terminated
        legacy_suspended_closure = (
            Project.objects.filter(
                status=Project.StatusChoices.SUSPENDED,
                documents__kind="projectclosure",
                documents__project_lead_approval_granted=True,
                documents__business_area_lead_approval_granted=True,
                documents__directorate_approval_granted=True,
                documents__status="approved",
            )
            .exclude(closure__intended_outcome__in=["completed", "terminated"])
            .select_related("business_area")
            .prefetch_related("members", "closure")
            .distinct()
        )

        response_data = {
            "open_with_closure": ProblematicProjectSerializer(
                open_with_closure, many=True
            ).data,
            "memberless": ProblematicProjectSerializer(memberless, many=True).data,
            "leaderless": ProblematicProjectSerializer(leaderless, many=True).data,
            "multiple_leaders": ProblematicProjectSerializer(
                multiple_leaders, many=True
            ).data,
            "external_leaders": ProblematicProjectSerializer(
                external_leaders, many=True
            ).data,
            "no_progress": ProblematicProjectSerializer(no_progress, many=True).data,
            "inactive_lead_active_project": ProblematicProjectSerializer(
                inactive_lead_active_project, many=True
            ).data,
            "no_business_area": ProblematicProjectSerializer(
                no_business_area, many=True
            ).data,
            "role_mismatch": ProblematicProjectSerializer(
                role_mismatch, many=True
            ).data,
            "closure_state_mismatch": ProblematicProjectSerializer(
                closure_state_mismatch, many=True
            ).data,
            "closure_not_closing": ProblematicProjectSerializer(
                closure_not_closing, many=True
            ).data,
            "legacy_suspended_closure": ProblematicProjectSerializer(
                legacy_suspended_closure, many=True
            ).data,
        }

        return Response(response_data, status=HTTP_200_OK)

    def _get_no_progress_projects(self):
        """
        Get projects with progress/student report documents created this FY
        where the document is still in 'new' status (never submitted for review).
        This catches reports that were auto-created but never worked on.
        """
        from django.utils import timezone

        today = timezone.now()
        if today.month >= 7:
            fy_start = timezone.make_aware(timezone.datetime(today.year, 7, 1))
        else:
            fy_start = timezone.make_aware(timezone.datetime(today.year - 1, 7, 1))

        stale_project_ids = (
            ProjectDocument.objects.filter(
                Q(kind=ProjectDocument.CategoryKindChoices.PROGRESSREPORT)
                | Q(kind=ProjectDocument.CategoryKindChoices.STUDENTREPORT),
                created_at__gte=fy_start,
                status=ProjectDocument.StatusChoices.NEW,
                project__status__in=Project.ACTIVE_ONLY,
            )
            .values_list("project_id", flat=True)
            .distinct()
        )

        return (
            Project.objects.filter(pk__in=stale_project_ids)
            .select_related("business_area")
            .prefetch_related("members", "members__user")
        )


class RemedyOpenClosed(APIView):
    """Projects that are open but have approved closure"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get open projects with approved closures"""
        projects = (
            Project.objects.filter(
                status__in=Project.ACTIVE_ONLY,
            )
            .exclude(Q(closure__isnull=True) | Q(closure__document__status="new"))
            .select_related(
                "business_area",
                "business_area__division",
            )
            .prefetch_related(
                "members",
                "members__user",
                "closure",
            )
            .distinct()
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy open/closed projects by setting their status to the closure's
        intended outcome (completed or terminated).

        The closure document is kept — it's fully approved and represents
        the legitimate closure of the project. The only issue is that the
        project status wasn't updated to match.
        """
        project_pks = request.data.get("projects", [])

        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying open/closed projects: {project_pks}"
        )

        remedied = []
        failed = []

        with transaction.atomic():
            for pk in project_pks:
                try:
                    project = Project.objects.get(pk=pk)
                except Project.DoesNotExist:
                    failed.append({"project_id": pk, "error": "Project not found"})
                    continue

                # Find the approved closure and its intended outcome
                closure = ProjectClosure.objects.filter(
                    project=project,
                    document__directorate_approval_granted=True,
                ).first()

                if not closure:
                    failed.append(
                        {"project_id": pk, "error": "No approved closure found"}
                    )
                    continue

                # Determine target status from the closure's intended outcome
                outcome = closure.intended_outcome
                if outcome == ProjectClosure.OutcomeChoices.TERMINATED:
                    target_status = Project.StatusChoices.TERMINATED
                else:
                    # Default to completed (covers both explicit "completed" and null/blank)
                    target_status = Project.StatusChoices.COMPLETED

                previous_status = project.status
                project.status = target_status
                project.save()

                remedied.append(
                    {
                        "project_id": pk,
                        "previous_status": previous_status,
                        "new_status": project.status,
                        "closure_outcome": outcome or "completed",
                    }
                )

                settings.LOGGER.info(
                    f"Remedied project {pk}: {previous_status} → {project.status} "
                    f"(closure outcome: {outcome})"
                )

        return Response(
            {
                "successful": len(remedied),
                "failed": len(failed),
                "details": remedied + failed,
            },
            status=HTTP_200_OK,
        )


class RemedyMemberlessProjects(APIView):
    """Projects with no members"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with no members"""
        projects = (
            Project.objects.annotate(member_count=Count("members"))
            .filter(member_count=0, status__in=Project.ACTIVE_ONLY)
            .select_related(
                "business_area",
                "business_area__division",
            )
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy memberless projects by finding a suitable leader to add.

        Priority:
        1. First document's creator (if they're active staff with @dbca email)
        2. The project's business area leader (if active with @dbca email)
        3. Skip if no suitable candidate found
        """
        project_pks = request.data.get("projects", [])
        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying memberless projects: {project_pks}"
        )

        def _is_valid_leader(user):
            return (
                user
                and user.is_staff
                and user.is_active
                and user.email
                and user.email.endswith("@dbca.wa.gov.au")
            )

        successful = 0
        skipped = 0
        details = []

        with transaction.atomic():
            for pk in project_pks:
                try:
                    project = Project.objects.select_related(
                        "business_area__leader"
                    ).get(pk=pk)
                except Project.DoesNotExist:
                    skipped += 1
                    details.append({"project": pk, "reason": "not found"})
                    continue

                leader_user = None

                # Priority 1: first document creator
                first_doc = self._get_first_document(pk)
                if (
                    first_doc
                    and first_doc.creator
                    and _is_valid_leader(first_doc.creator)
                ):
                    leader_user = first_doc.creator

                # Priority 2: business area leader
                if not leader_user:
                    ba = project.business_area
                    if ba and ba.leader and _is_valid_leader(ba.leader):
                        leader_user = ba.leader

                if not leader_user:
                    skipped += 1
                    details.append(
                        {"project": pk, "reason": "no valid leader candidate"}
                    )
                    continue

                ProjectMember.objects.create(
                    project=project,
                    user=leader_user,
                    is_leader=True,
                    role=ProjectMember.RoleChoices.SUPERVISING,
                    time_allocation=1,
                    position=0,
                    short_code="",
                    comments="",
                )
                successful += 1

                settings.LOGGER.info(
                    f"Added {leader_user} as leader to memberless project {pk}"
                )

        return Response(
            {"successful": successful, "skipped": skipped, "details": details},
            status=HTTP_200_OK,
        )

    @staticmethod
    def _get_first_document(project_pk):
        """Return the first document for a project by priority: concept > project > progress > student > closure"""
        docs = ProjectDocument.objects.filter(project=project_pk).order_by("created_at")

        kind_priority = [
            ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            ProjectDocument.CategoryKindChoices.PROJECTPLAN,
            ProjectDocument.CategoryKindChoices.PROGRESSREPORT,
            ProjectDocument.CategoryKindChoices.STUDENTREPORT,
            ProjectDocument.CategoryKindChoices.PROJECTCLOSURE,
        ]

        for kind in kind_priority:
            doc = docs.filter(kind=kind).first()
            if doc is not None:
                return doc

        return None


class RemedyNoLeaderProjects(APIView):
    """Projects with no leader"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with no leader (excludes memberless projects)"""
        projects = (
            Project.objects.filter(status__in=Project.ACTIVE_ONLY)
            .annotate(member_count=Count("members"))
            .filter(member_count__gt=0)
            .exclude(members__is_leader=True)
            .select_related(
                "business_area",
                "business_area__division",
            )
            .prefetch_related(
                "members",
                "members__user",
            )
            .distinct()
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy leaderless projects: find the best staff candidate and promote them.

        Priority for choosing the new leader:
        1. Staff member with role=supervising, is_active=True, @dbca.wa.gov.au email
        2. Staff member with lowest position, is_active=True, @dbca.wa.gov.au email
        3. Any active staff member with @dbca.wa.gov.au email

        The promoted member gets: is_leader=True, role=supervising, position=0.
        Also fixes role mismatches: staff with external roles get research,
        external with staff roles get consulted.
        """
        project_pks = request.data.get("projects", [])
        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying leaderless projects: {project_pks}"
        )

        successful = 0
        skipped = 0
        details = []

        staff_roles = {
            ProjectMember.RoleChoices.SUPERVISING,
            ProjectMember.RoleChoices.RESEARCH,
            ProjectMember.RoleChoices.TECHNICAL,
        }
        external_roles = {
            ProjectMember.RoleChoices.ACADEMICSUPER,
            ProjectMember.RoleChoices.STUDENT,
            ProjectMember.RoleChoices.CONSULTED,
            ProjectMember.RoleChoices.EXTERNALCOL,
            ProjectMember.RoleChoices.EXTERNALPEER,
            ProjectMember.RoleChoices.GROUP,
        }

        def _is_valid_leader_candidate(user):
            return (
                user.is_staff
                and user.is_active
                and user.email
                and user.email.endswith("@dbca.wa.gov.au")
            )

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    skipped += 1
                    details.append({"project": pk, "reason": "no members"})
                    continue

                # Find best leader candidate
                new_leader = None

                # Priority 1: staff with supervising role + valid
                for mem in members.filter(role=ProjectMember.RoleChoices.SUPERVISING):
                    if _is_valid_leader_candidate(mem.user):
                        new_leader = mem
                        break

                # Priority 2: any valid staff member, lowest position first
                if not new_leader:
                    for mem in members.order_by("position"):
                        if _is_valid_leader_candidate(mem.user):
                            new_leader = mem
                            break

                if not new_leader:
                    skipped += 1
                    details.append(
                        {"project": pk, "reason": "no valid staff candidate"}
                    )
                    continue

                # Promote the new leader
                new_leader.is_leader = True
                new_leader.role = ProjectMember.RoleChoices.SUPERVISING
                new_leader.position = 0
                new_leader.save()

                # Ensure no other member has is_leader=True
                members.exclude(pk=new_leader.pk).filter(is_leader=True).update(
                    is_leader=False
                )

                # Fix role mismatches on all members
                for mem in members.exclude(pk=new_leader.pk):
                    changed = False
                    if mem.user.is_staff and mem.role in external_roles:
                        mem.role = ProjectMember.RoleChoices.RESEARCH
                        changed = True
                    elif not mem.user.is_staff and mem.role in staff_roles:
                        mem.role = ProjectMember.RoleChoices.CONSULTED
                        changed = True
                    if changed:
                        mem.save()

                successful += 1
                settings.LOGGER.info(
                    f"Promoted {new_leader.user} to leader for leaderless project {pk}"
                )

        return Response(
            {"successful": successful, "skipped": skipped, "details": details},
            status=HTTP_200_OK,
        )


class RemedyMultipleLeaderProjects(APIView):
    """Projects with multiple leaders"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with multiple leaders"""
        projects = (
            Project.objects.annotate(
                leader_count=Count("members", filter=Q(members__is_leader=True))
            )
            .filter(leader_count__gt=1, status__in=Project.ACTIVE_ONLY)
            .select_related(
                "business_area",
                "business_area__division",
            )
            .prefetch_related(
                "members",
                "members__user",
            )
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy multiple-leader projects: keep exactly one leader.

        Selection logic (in priority order):
        1. Among members with is_leader=True AND role=supervising:
           pick the one with lowest position that is valid
           (is_staff=True, is_active=True, @dbca.wa.gov.au email)
        2. Among members with is_leader=True (any role):
           pick the valid one with lowest position
        3. If no valid leader among is_leader=True members:
           find any valid staff member with lowest position

        The winner gets: is_leader=True, role=supervising, position=0.
        All others: is_leader=False, role corrected based on staff status.
        """
        project_pks = request.data.get("projects", [])
        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying multiple-leader projects: {project_pks}"
        )

        staff_roles = {
            ProjectMember.RoleChoices.SUPERVISING,
            ProjectMember.RoleChoices.RESEARCH,
            ProjectMember.RoleChoices.TECHNICAL,
        }

        def _is_valid_leader(user):
            return (
                user.is_staff
                and user.is_active
                and user.email
                and user.email.endswith("@dbca.wa.gov.au")
            )

        successful = 0
        skipped = 0
        details = []

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    skipped += 1
                    continue

                leaders = list(members.filter(is_leader=True).order_by("position"))

                if len(leaders) < 2:
                    skipped += 1
                    details.append({"project": pk, "reason": "fewer than 2 leaders"})
                    continue

                # Find the best leader
                winner = None

                # Priority 1: valid leader with supervising role, lowest position
                for mem in leaders:
                    if (
                        mem.role == ProjectMember.RoleChoices.SUPERVISING
                        and _is_valid_leader(mem.user)
                    ):
                        winner = mem
                        break

                # Priority 2: any valid leader, lowest position
                if not winner:
                    for mem in leaders:
                        if _is_valid_leader(mem.user):
                            winner = mem
                            break

                # Priority 3: any valid staff member on the project
                if not winner:
                    for mem in members.order_by("position"):
                        if _is_valid_leader(mem.user):
                            winner = mem
                            break

                if not winner:
                    skipped += 1
                    details.append(
                        {"project": pk, "reason": "no valid staff candidate"}
                    )
                    continue

                # Set the winner as sole leader
                winner.is_leader = True
                winner.role = ProjectMember.RoleChoices.SUPERVISING
                winner.position = 0
                winner.save()

                # Demote all others
                for mem in members.exclude(pk=winner.pk):
                    changed = False
                    if mem.is_leader:
                        mem.is_leader = False
                        changed = True

                    # Fix role based on staff status
                    if mem.user.is_staff:
                        if mem.role not in staff_roles:
                            mem.role = ProjectMember.RoleChoices.RESEARCH
                            changed = True
                        elif mem.role == ProjectMember.RoleChoices.SUPERVISING:
                            # Can't have supervising without is_leader
                            mem.role = ProjectMember.RoleChoices.RESEARCH
                            changed = True
                    else:
                        if mem.role in staff_roles:
                            mem.role = ProjectMember.RoleChoices.CONSULTED
                            changed = True

                    # Bump position if at 0 (reserved for leader)
                    if mem.position == 0:
                        mem.position = 1
                        changed = True

                    if changed:
                        mem.save()

                successful += 1
                settings.LOGGER.info(
                    f"Remedied multiple leaders for project {pk}: "
                    f"kept {winner.user} as sole leader"
                )

        return Response(
            {"successful": successful, "skipped": skipped, "details": details},
            status=HTTP_200_OK,
        )


class RemedyExternalLeaderProjects(APIView):
    """Projects with external (non-staff) leaders"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with external leaders"""
        projects = (
            Project.objects.filter(
                members__is_leader=True,
                members__user__is_staff=False,
                status__in=Project.ACTIVE_ONLY,
            )
            .select_related(
                "business_area",
                "business_area__division",
            )
            .prefetch_related(
                "members",
                "members__user",
            )
            .distinct()
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy externally-led projects by transferring leadership to a staff member.

        Logic:
        1. Find the external leader (is_leader=True, is_staff=False)
        2. Find the best staff candidate:
           a. First choice: staff member with role=supervising (they're the actual scientist)
           b. Second choice: first document creator if they're staff and on the team
           c. Third choice: any staff member on the team (oldest first)
        3. Promote the staff candidate to leader (is_leader=True, role=supervising, position=0)
        4. Demote the external leader:
           - Set is_leader=False
           - Keep their current role UNLESS they have role=supervising (invalid for non-staff)
             → in that case, change to consulted
           - Bump their position to after the new leader
        """
        project_pks = request.data.get("projects", [])
        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying externally-led projects: {project_pks}"
        )

        successful = 0
        skipped = 0
        details = []

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    skipped += 1
                    details.append({"project": pk, "reason": "no members"})
                    continue

                # Find the external leader
                external_leader = members.filter(
                    is_leader=True, user__is_staff=False
                ).first()

                if not external_leader:
                    skipped += 1
                    details.append(
                        {"project": pk, "reason": "no external leader found"}
                    )
                    continue

                # Find best staff candidate for leadership
                new_leader_member = None

                # Priority 1: Staff member already with supervising role
                staff_supervising = members.filter(
                    user__is_staff=True, role=ProjectMember.RoleChoices.SUPERVISING
                ).first()
                if staff_supervising:
                    new_leader_member = staff_supervising

                # Priority 2: First document creator if staff and on team
                if not new_leader_member:
                    first_doc = self._get_first_document(pk)
                    if first_doc and first_doc.creator and first_doc.creator.is_staff:
                        creator_member = members.filter(user=first_doc.creator).first()
                        if creator_member:
                            new_leader_member = creator_member

                # Priority 3: Any staff member (oldest membership first)
                if not new_leader_member:
                    new_leader_member = (
                        members.filter(user__is_staff=True)
                        .order_by("created_at")
                        .first()
                    )

                if not new_leader_member:
                    skipped += 1
                    details.append(
                        {"project": pk, "reason": "no staff member available"}
                    )
                    continue

                # Demote external leader — keep their role unless it's supervising
                external_leader.is_leader = False
                if external_leader.role == ProjectMember.RoleChoices.SUPERVISING:
                    # Non-staff shouldn't have supervising role
                    external_leader.role = ProjectMember.RoleChoices.CONSULTED
                # Bump position to after leader
                external_leader.position = max(external_leader.position or 0, 1)
                external_leader.save()

                # Promote staff member to leader
                new_leader_member.is_leader = True
                new_leader_member.role = ProjectMember.RoleChoices.SUPERVISING
                new_leader_member.position = 0
                new_leader_member.save()

                # Ensure no other members have is_leader=True (data cleanup)
                members.exclude(pk=new_leader_member.pk).filter(is_leader=True).update(
                    is_leader=False
                )

                successful += 1
                settings.LOGGER.info(
                    f"Remedied project {pk}: promoted {new_leader_member.user} "
                    f"(was {new_leader_member.role}), demoted external "
                    f"{external_leader.user} (kept role={external_leader.role})"
                )

        return Response(
            {"successful": successful, "skipped": skipped, "details": details},
            status=HTTP_200_OK,
        )

    @staticmethod
    def _get_first_document(project_pk):
        """Return the first document for a project by priority: concept > project > progress > student > closure"""
        docs = ProjectDocument.objects.filter(project=project_pk).order_by("created_at")

        kind_priority = [
            ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            ProjectDocument.CategoryKindChoices.PROJECTPLAN,
            ProjectDocument.CategoryKindChoices.PROGRESSREPORT,
            ProjectDocument.CategoryKindChoices.STUDENTREPORT,
            ProjectDocument.CategoryKindChoices.PROJECTCLOSURE,
        ]

        for kind in kind_priority:
            doc = docs.filter(kind=kind).first()
            if doc is not None:
                return doc

        return None


class RemedyRoleMismatch(APIView):
    """Projects with role/is_leader mismatch"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects with role mismatch:
        - Members with role=supervising but is_leader=False
        - Members with is_leader=True but role != supervising
        """
        supervising_not_leader = Project.objects.filter(
            status__in=Project.ACTIVE_ONLY,
            members__role=ProjectMember.RoleChoices.SUPERVISING,
            members__is_leader=False,
        )
        leader_not_supervising = Project.objects.filter(
            status__in=Project.ACTIVE_ONLY,
            members__is_leader=True,
        ).exclude(
            members__is_leader=True,
            members__role=ProjectMember.RoleChoices.SUPERVISING,
        )
        projects = (
            (supervising_not_leader | leader_not_supervising)
            .select_related(
                "business_area",
                "business_area__division",
            )
            .prefetch_related(
                "members",
                "members__user",
            )
            .distinct()
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy role mismatch: for each project, if a member has role=supervising
        but is_leader=False, either:
        - If no other member has is_leader=True: promote this member to leader
        - If another member already has is_leader=True: demote this member's role

        Demotion role depends on staff status and project type:
        - Staff → research (Science Support)
        - External on student project:
          - If no student role exists on the project → student
          - If student role already exists → academicsuper
        - External on non-student project → consulted
        """
        project_pks = request.data.get("projects", [])
        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying role mismatch projects: {project_pks}"
        )

        successful = 0
        skipped = 0
        details = []

        def _get_external_demotion_role(project, members_qs):
            """Determine the appropriate role for an external user being demoted."""
            if project.kind == Project.CategoryKindChoices.STUDENT:
                has_student = members_qs.filter(
                    role=ProjectMember.RoleChoices.STUDENT
                ).exists()
                if has_student:
                    return ProjectMember.RoleChoices.ACADEMICSUPER
                else:
                    return ProjectMember.RoleChoices.STUDENT
            return ProjectMember.RoleChoices.CONSULTED

        with transaction.atomic():
            for pk in project_pks:
                try:
                    project = Project.objects.get(pk=pk)
                except Project.DoesNotExist:
                    skipped += 1
                    continue

                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    skipped += 1
                    continue

                # Find members with supervising role but not is_leader
                mismatched = list(
                    members.filter(
                        role=ProjectMember.RoleChoices.SUPERVISING, is_leader=False
                    )
                )

                # Find leaders without supervising role
                leaders_wrong_role = list(
                    members.filter(is_leader=True).exclude(
                        role=ProjectMember.RoleChoices.SUPERVISING
                    )
                )

                if not mismatched and not leaders_wrong_role:
                    skipped += 1
                    continue

                # Fix leaders with wrong role — set to supervising
                for mem in leaders_wrong_role:
                    mem.role = ProjectMember.RoleChoices.SUPERVISING
                    mem.save()

                if not mismatched:
                    successful += 1
                    continue

                # Check if there's already a valid leader
                existing_leader = members.filter(is_leader=True).first()

                if existing_leader:
                    # There's already a leader — demote the mismatched members
                    for mem in mismatched:
                        if mem.user.is_staff:
                            mem.role = ProjectMember.RoleChoices.RESEARCH
                        else:
                            mem.role = _get_external_demotion_role(project, members)
                        mem.save()
                else:
                    # No leader exists — promote the best mismatched member
                    # Pick the one with lowest position that is valid staff
                    promoted = None
                    for mem in sorted(
                        mismatched,
                        key=lambda m: m.position if m.position is not None else 999,
                    ):
                        if (
                            mem.user.is_staff
                            and mem.user.is_active
                            and mem.user.email
                            and mem.user.email.endswith("@dbca.wa.gov.au")
                        ):
                            mem.is_leader = True
                            mem.position = 0
                            mem.save()
                            promoted = mem
                            break

                    # Demote the rest
                    for mem in mismatched:
                        if promoted and mem.pk == promoted.pk:
                            continue
                        if mem.user.is_staff:
                            mem.role = ProjectMember.RoleChoices.RESEARCH
                        else:
                            mem.role = _get_external_demotion_role(project, members)
                        mem.save()

                successful += 1

        return Response(
            {"successful": successful, "skipped": skipped, "details": details},
            status=HTTP_200_OK,
        )


class RemedyClosureStateMismatch(APIView):
    """Remedy projects with closure documents in wrong states"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Set all closure-state-mismatch projects to closure_requested."""
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can perform this action"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Find affected projects
        affected = (
            Project.objects.filter(documents__kind="projectclosure")
            .exclude(documents__status="new")
            .exclude(status__in=Project.VALID_CLOSURE_STATES)
            .distinct()
        )

        successful = 0
        errors = []

        for project in affected:
            try:
                project.status = Project.StatusChoices.CLOSUREREQ
                project.save(skip_closure_validation=True)
                successful += 1
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to update project {project.pk} status: {e}"
                )
                errors.append(f"Project {project.pk}: Failed to update status")

        return Response(
            {"successful": successful, "errors": errors},
            status=HTTP_200_OK,
        )


class RemedyClosureNotClosing(APIView):
    """Remedy projects with any closure not in closing states"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Set projects to correct closure state based on closure approval status."""
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can perform this action"},
                status=HTTP_400_BAD_REQUEST,
            )

        affected = (
            Project.objects.filter(documents__kind="projectclosure")
            .exclude(
                status__in=[
                    Project.StatusChoices.CLOSUREREQ,
                    Project.StatusChoices.CLOSING,
                    Project.StatusChoices.FINAL_UPDATE,
                    Project.StatusChoices.COMPLETED,
                    Project.StatusChoices.TERMINATED,
                ]
            )
            .prefetch_related("documents", "closure")
            .distinct()
        )

        successful = 0
        errors = []

        for project in affected:
            try:
                # Find the closure document
                closure_doc = (
                    ProjectDocument.objects.filter(
                        project=project, kind="projectclosure"
                    )
                    .exclude(status="new")
                    .first()
                )

                if not closure_doc:
                    continue

                # If fully approved, set to intended outcome
                if (
                    closure_doc.project_lead_approval_granted
                    and closure_doc.business_area_lead_approval_granted
                    and closure_doc.directorate_approval_granted
                ):
                    # Get intended outcome from closure detail
                    closure_detail = getattr(project, "closure", None)
                    if closure_detail and closure_detail.intended_outcome in [
                        "completed",
                        "terminated",
                    ]:
                        project.status = closure_detail.intended_outcome
                    else:
                        project.status = Project.StatusChoices.COMPLETED
                else:
                    # Not fully approved — set to closure_requested
                    project.status = Project.StatusChoices.CLOSUREREQ

                project.save(skip_closure_validation=True)
                successful += 1
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to remedy closure state for project {project.pk}: {e}"
                )
                errors.append(f"Project {project.pk}: Failed to update closure state")

        return Response(
            {"successful": successful, "errors": errors},
            status=HTTP_200_OK,
        )


class RemedyLegacySuspendedClosure(APIView):
    """Remedy legacy suspended projects that used closure for suspension"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Remove closure documents from suspended projects, keep them suspended."""
        if not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can perform this action"},
                status=HTTP_400_BAD_REQUEST,
            )

        affected = (
            Project.objects.filter(
                status=Project.StatusChoices.SUSPENDED,
                documents__kind="projectclosure",
                documents__project_lead_approval_granted=True,
                documents__business_area_lead_approval_granted=True,
                documents__directorate_approval_granted=True,
                documents__status="approved",
            )
            .exclude(closure__intended_outcome__in=["completed", "terminated"])
            .prefetch_related("documents")
            .distinct()
        )

        successful = 0
        errors = []

        for project in affected:
            try:
                with transaction.atomic():
                    # Delete the closure document(s) and their details
                    closure_docs = ProjectDocument.objects.filter(
                        project=project, kind="projectclosure"
                    )
                    # Delete associated ProjectClosure records first
                    from documents.models import ProjectClosure

                    ProjectClosure.objects.filter(document__in=closure_docs).delete()
                    closure_docs.delete()
                    # Project stays in suspended status — no change needed
                    successful += 1
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to remove legacy closure for project {project.pk}: {e}"
                )
                errors.append(
                    f"Project {project.pk}: Failed to remove closure documents"
                )

        return Response(
            {"successful": successful, "errors": errors},
            status=HTTP_200_OK,
        )
