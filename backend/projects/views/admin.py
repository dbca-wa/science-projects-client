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
            )
            .prefetch_related(
                "members",
                "members__user",
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

        active_statuses = ["active", "updating"]

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

        # Projects with no leader
        leaderless = (
            Project.objects.filter(status__in=active_statuses)
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

        # Projects with external leaders
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
        }

        return Response(response_data, status=HTTP_200_OK)

    def _get_no_progress_projects(self):
        """
        Get projects with progress/student report documents created this FY
        where the document is still in 'new' status (never submitted for review).
        This catches reports that were auto-created but never worked on.
        """
        today = date.today()
        if today.month >= 7:
            fy_start = date(today.year, 7, 1)
        else:
            fy_start = date(today.year - 1, 7, 1)

        stale_project_ids = (
            ProjectDocument.objects.filter(
                Q(kind=ProjectDocument.CategoryKindChoices.PROGRESSREPORT)
                | Q(kind=ProjectDocument.CategoryKindChoices.STUDENTREPORT),
                created_at__gte=fy_start,
                status=ProjectDocument.StatusChoices.NEW,
                project__status__in=["active", "updating"],
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
                status__in=["active", "updating"],
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
        """Remedy open/closed projects by setting status and handling closure documents"""
        project_pks = request.data.get("projects", [])
        target_status = request.data.get("status", "active")

        valid_statuses = ["active", "suspended", "completed", "terminated"]
        if target_status not in valid_statuses:
            return Response(
                {
                    "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                },
                status=HTTP_400_BAD_REQUEST,
            )

        if not project_pks:
            return Response(
                {"error": "No projects provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            f"{request.user} is remedying open/closed projects to '{target_status}': {project_pks}"
        )

        should_delete_closures = target_status in ["active", "suspended"]
        remedied = []
        failed = []

        with transaction.atomic():
            projects = Project.objects.filter(pk__in=project_pks).only(
                "pk", "title", "status"
            )
            projects_dict = {p.pk: p for p in projects}

            closure_docs = ProjectDocument.objects.filter(
                project_id__in=project_pks,
                kind=ProjectDocument.CategoryKindChoices.PROJECTCLOSURE,
                directorate_approval_granted=True,
            ).select_related("project")

            closure_docs_by_project = {}
            for doc in closure_docs:
                closure_docs_by_project.setdefault(doc.project_id, []).append(doc)

            status_map = {
                "active": Project.StatusChoices.ACTIVE,
                "suspended": Project.StatusChoices.SUSPENDED,
                "completed": Project.StatusChoices.COMPLETED,
                "terminated": Project.StatusChoices.TERMINATED,
            }

            for pk in project_pks:
                try:
                    if pk not in projects_dict:
                        failed.append({"project_id": pk, "error": "Project not found"})
                        continue

                    project = projects_dict[pk]
                    docs = closure_docs_by_project.get(pk)

                    if not docs:
                        failed.append(
                            {
                                "project_id": pk,
                                "error": "No approved closure documents found",
                            }
                        )
                        continue

                    if should_delete_closures:
                        doc_ids = [d.pk for d in docs]
                        ProjectDocument.objects.filter(pk__in=doc_ids).delete()
                    else:
                        doc_ids = [d.pk for d in docs]
                        outcome_map = {
                            "completed": ProjectClosure.OutcomeChoices.COMPLETED,
                            "terminated": ProjectClosure.OutcomeChoices.TERMINATED,
                        }
                        ProjectClosure.objects.filter(document_id__in=doc_ids).update(
                            intended_outcome=outcome_map[target_status]
                        )

                    previous_status = project.status
                    project.status = status_map[target_status]
                    project.save()

                    remedied.append(
                        {
                            "project_id": pk,
                            "previous_status": previous_status,
                            "new_status": project.status,
                        }
                    )

                    settings.LOGGER.info(
                        f"Remedied project {pk}: status {previous_status} -> {project.status}"
                    )

                except Exception as e:
                    failed.append({"project_id": pk, "error": "Failed to process"})
                    settings.LOGGER.error(
                        f"Failed to remedy project {pk}: {e}", exc_info=True
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
            .filter(member_count=0, status__in=["active", "updating"])
            .select_related(
                "business_area",
                "business_area__division",
            )
        )

        serializer = ProblematicProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """
        Remedy memberless projects by finding the first document's creator
        and adding them as the project leader.
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

        successful = 0
        skipped = 0

        with transaction.atomic():
            for pk in project_pks:
                try:
                    project = Project.objects.get(pk=pk)
                except Project.DoesNotExist:
                    skipped += 1
                    continue

                first_doc = self._get_first_document(pk)
                if first_doc is None:
                    skipped += 1
                    continue

                creator = first_doc.creator
                if creator is None:
                    skipped += 1
                    continue

                ProjectMember.objects.create(
                    project=project,
                    user=creator,
                    is_leader=True,
                    role=ProjectMember.RoleChoices.SUPERVISING,
                    time_allocation=1,
                    position=0,
                    short_code="",
                    comments="Added to memberless project",
                )
                successful += 1

                settings.LOGGER.info(
                    f"Added {creator} as leader to memberless project {pk}"
                )

        return Response(
            {"successful": successful, "skipped": skipped},
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
        """Get projects with no leader"""
        projects = (
            Project.objects.filter(status__in=["active", "updating"])
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
        Remedy leaderless projects: find the member with is_leader=True,
        set their role to supervising and position to 0, shift others down.
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

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.filter(project=pk)
                if not members.exists():
                    continue

                for mem in members:
                    if mem.is_leader:
                        mem.role = ProjectMember.RoleChoices.SUPERVISING
                        mem.position = 0
                    else:
                        mem.position = (mem.position or 0) + 1
                    mem.save()

                successful += 1

        return Response(
            {"successful": successful},
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
            .filter(leader_count__gt=1, status__in=["active", "updating"])
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
        Remedy multiple-leader projects: keep the one with is_leader=True,
        reassign others based on project kind and staff status.
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

        successful = 0

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    continue

                project = Project.objects.get(pk=pk)
                lead_roles = members.filter(role=ProjectMember.RoleChoices.SUPERVISING)

                for mem in lead_roles:
                    if not mem.is_leader:
                        # Non-leader with supervising role — reassign
                        mem.position = (mem.position or 0) + 1

                        if project.kind != Project.CategoryKindChoices.STUDENT:
                            if not mem.user.is_staff:
                                mem.role = ProjectMember.RoleChoices.CONSULTED
                            else:
                                mem.role = ProjectMember.RoleChoices.RESEARCH
                        else:
                            # Student project logic
                            if not mem.user.is_staff:
                                has_student = members.filter(
                                    role=ProjectMember.RoleChoices.STUDENT
                                ).exists()
                                if has_student:
                                    mem.role = ProjectMember.RoleChoices.ACADEMICSUPER
                                else:
                                    mem.role = ProjectMember.RoleChoices.STUDENT
                            else:
                                mem.role = ProjectMember.RoleChoices.RESEARCH
                    else:
                        # Actual leader — ensure correct role/position
                        if mem.user.is_staff:
                            mem.role = ProjectMember.RoleChoices.SUPERVISING
                            mem.position = 0

                    mem.save()

                # Final pass: ensure the is_leader staff member has correct role
                for mem in members.filter(is_leader=True, user__is_staff=True):
                    mem.role = ProjectMember.RoleChoices.SUPERVISING
                    mem.position = 0
                    mem.save()

                successful += 1

        return Response(
            {"successful": successful},
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
                status__in=["active", "updating"],
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
        Remedy externally-led projects: find the first document's creator
        who is staff and in the team, make them leader.
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

        with transaction.atomic():
            for pk in project_pks:
                members = ProjectMember.objects.select_related("user").filter(
                    project=pk
                )
                if not members.exists():
                    skipped += 1
                    continue

                users_in_team = {mem.user for mem in members}
                first_doc = self._get_first_document(pk)

                if first_doc is not None and first_doc.creator is not None:
                    creator = first_doc.creator
                    if creator.is_staff and creator in users_in_team:
                        # Creator is staff and on the team — make them leader
                        for mem in members:
                            if not mem.user.is_staff:
                                mem.is_leader = False
                                mem.position = (mem.position or 0) + 1
                            if mem.user == creator:
                                mem.role = ProjectMember.RoleChoices.SUPERVISING
                                mem.position = 0
                                mem.is_leader = True
                            mem.save()
                        successful += 1
                        settings.LOGGER.info(
                            f"Set {creator} as leader for externally-led project {pk}"
                        )
                        continue

                # Fallback: find a staff member to promote
                external_leader = members.filter(
                    is_leader=True, user__is_staff=False
                ).first()
                staff_non_leaders = members.filter(is_leader=False, user__is_staff=True)

                if staff_non_leaders.exists() and external_leader:
                    external_leader.is_leader = False
                    external_leader.position = (external_leader.position or 0) + 1
                    external_leader.save()

                    new_leader = staff_non_leaders.order_by("created_at").first()
                    new_leader.is_leader = True
                    new_leader.role = ProjectMember.RoleChoices.SUPERVISING
                    new_leader.position = 0
                    new_leader.save()

                    successful += 1
                    settings.LOGGER.info(
                        f"Promoted {new_leader.user} to leader for externally-led project {pk}"
                    )
                else:
                    skipped += 1

        return Response(
            {"successful": successful, "skipped": skipped},
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
