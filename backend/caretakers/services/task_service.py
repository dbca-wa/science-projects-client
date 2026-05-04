"""
Business logic for caretaker task operations
"""

from django.conf import settings

from documents.models import ProjectDocument
from projects.models import Project, ProjectMember

from ..models import Caretaker


class CaretakerTaskService:
    """Service for managing caretaker tasks and document access"""

    @staticmethod
    def get_all_caretaker_assignments(user_id, processed_users=None):
        """
        Recursively gather all caretaker assignments, including nested relationships

        Args:
            user_id: ID of user to check
            processed_users: Set of already processed user IDs (for recursion)

        Returns:
            List of Caretaker objects
        """
        if processed_users is None:
            processed_users = set()

        if user_id in processed_users:
            return []

        processed_users.add(user_id)

        # Get direct caretaker assignments with optimized queries
        direct_assignments = (
            Caretaker.objects.filter(caretaker=user_id)
            .select_related(
                "user",
                "user__work",
                "user__work__business_area",
            )
            .prefetch_related(
                "user__business_areas_led",
            )
        )

        all_assignments = list(direct_assignments)

        # For each user being caretaken, get their caretaker assignments
        for assignment in direct_assignments:
            nested_assignments = CaretakerTaskService.get_all_caretaker_assignments(
                assignment.user.id, processed_users
            )
            all_assignments.extend(nested_assignments)

        return all_assignments

    @staticmethod
    def get_directorate_documents(project_queryset):
        """
        Get documents requiring Directorate attention

        Args:
            project_queryset: QuerySet of projects to check

        Returns:
            QuerySet of ProjectDocument objects
        """
        return (
            ProjectDocument.objects.exclude(
                status=ProjectDocument.StatusChoices.APPROVED
            )
            .filter(
                project__in=project_queryset,
                business_area_lead_approval_granted=True,
                directorate_approval_granted=False,
            )
            .select_related(
                "project",
                "project__business_area",
            )
        )

    @staticmethod
    def get_ba_documents(project_queryset):
        """
        Get documents requiring BA lead attention

        Args:
            project_queryset: QuerySet of projects to check

        Returns:
            QuerySet of ProjectDocument objects
        """
        return (
            ProjectDocument.objects.exclude(
                status=ProjectDocument.StatusChoices.APPROVED
            )
            .filter(
                project__in=project_queryset,
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=False,
            )
            .select_related(
                "project",
                "project__business_area",
            )
        )

    @staticmethod
    def get_lead_documents(project_ids):
        """
        Get documents requiring project lead attention

        Args:
            project_ids: List/QuerySet of project IDs

        Returns:
            QuerySet of ProjectDocument objects
        """
        return (
            ProjectDocument.objects.exclude(
                status=ProjectDocument.StatusChoices.APPROVED
            )
            .filter(
                project__in=project_ids,
                project_lead_approval_granted=False,
            )
            .select_related(
                "project",
                "project__business_area",
            )
        )

    @staticmethod
    def get_team_documents(project_ids):
        """
        Get documents requiring team member attention

        Args:
            project_ids: List/QuerySet of project IDs

        Returns:
            QuerySet of ProjectDocument objects
        """
        return (
            ProjectDocument.objects.exclude(
                status=ProjectDocument.StatusChoices.APPROVED
            )
            .filter(
                project__in=project_ids,
                project_lead_approval_granted=False,
            )
            .select_related(
                "project",
                "project__business_area",
            )
        )

    @staticmethod
    def analyze_caretakee_roles(caretaker_assignments):
        """
        Analyse roles for all caretakees

        Args:
            caretaker_assignments: List of Caretaker objects

        Returns:
            Dict with role information
        """
        from django.db.models import Q

        from agencies.models import Division

        caretakee_ids = [assignment.user.id for assignment in caretaker_assignments]

        # Single query for all lead memberships
        lead_user_ids = set(
            ProjectMember.objects.exclude(project__status__in=Project.CLOSED_ONLY)
            .filter(user_id__in=caretakee_ids, is_leader=True)
            .values_list("user_id", flat=True)
        )

        # Single query for all team memberships
        team_user_ids = set(
            ProjectMember.objects.exclude(project__status__in=Project.CLOSED_ONLY)
            .filter(user_id__in=caretakee_ids, is_leader=False)
            .values_list("user_id", flat=True)
        )

        # Determine division roles and BA leader roles
        ba_leader_user_ids = set()
        # Collect division IDs where any caretakee has a directorate role
        directorate_division_ids = set()
        has_superuser_caretakee = False

        for assignment in caretaker_assignments:
            user = assignment.user

            # Check if superuser caretakee (sees all directorate docs)
            if user.is_superuser:
                has_superuser_caretakee = True

            # Check if BA leader
            if user.business_areas_led.exists():
                ba_leader_user_ids.add(user.id)

        # Get divisions where any caretakee has a directorate role
        if not has_superuser_caretakee:
            caretakee_divisions = Division.objects.filter(
                Q(director_id__in=caretakee_ids)
                | Q(key_stakeholder_id__in=caretakee_ids)
                | Q(approvers__in=caretakee_ids)
            ).distinct()
            directorate_division_ids = set(
                caretakee_divisions.values_list("pk", flat=True)
            )

        return {
            "has_superuser_caretakee": has_superuser_caretakee,
            "directorate_division_ids": directorate_division_ids,
            "ba_leader_user_ids": ba_leader_user_ids,
            "project_lead_user_ids": lead_user_ids,
            "team_member_user_ids": team_user_ids,
        }

    @staticmethod
    def get_tasks_for_user(user_id, requesting_user):
        """
        Get all tasks for a caretaker user

        Args:
            user_id: ID of caretaker user
            requesting_user: User making the request

        Returns:
            Dict with categorized document tasks
        """
        settings.LOGGER.info(
            f"{requesting_user} is getting pending caretaker documents for user {user_id}"
        )

        # Gather caretaker assignments
        caretaker_assignments = CaretakerTaskService.get_all_caretaker_assignments(
            user_id
        )

        # Analyze roles
        roles = CaretakerTaskService.analyze_caretakee_roles(caretaker_assignments)

        # Get active projects
        active_projects = Project.objects.exclude(status__in=Project.CLOSED_ONLY)

        # Build document lists
        all_documents = []

        # Directorate documents — scoped to caretakee's division roles
        directorate_documents = []
        has_directorate_role = (
            roles["has_superuser_caretakee"]
            or len(roles["directorate_division_ids"]) > 0
        )
        if has_directorate_role:
            directorate_docs_qs = CaretakerTaskService.get_directorate_documents(
                active_projects
            )

            # Superuser caretakee sees all; others see only their divisions
            if not roles["has_superuser_caretakee"]:
                directorate_docs_qs = directorate_docs_qs.filter(
                    project__business_area__division__in=roles[
                        "directorate_division_ids"
                    ]
                )

            directorate_documents = list(directorate_docs_qs)

            # Filter out documents requesting user already has access to
            requesting_user_divisions = set()
            if not requesting_user.is_superuser:
                from django.db.models import Q

                from agencies.models import Division

                requesting_user_divisions = set(
                    Division.objects.filter(
                        Q(director=requesting_user)
                        | Q(key_stakeholder=requesting_user)
                        | Q(approvers=requesting_user)
                    )
                    .distinct()
                    .values_list("pk", flat=True)
                )

            if requesting_user.is_superuser or requesting_user_divisions:
                directorate_documents = []

            all_documents.extend(directorate_documents)

        # BA documents
        ba_documents = []
        if roles["ba_leader_user_ids"]:
            ba_projects = Project.objects.exclude(
                status__in=Project.CLOSED_ONLY
            ).filter(business_area__leader__in=roles["ba_leader_user_ids"])
            ba_documents = CaretakerTaskService.get_ba_documents(ba_projects)
            all_documents.extend(ba_documents)

        # Project lead documents
        lead_documents = []
        if roles["project_lead_user_ids"]:
            lead_projects = ProjectMember.objects.filter(
                user_id__in=roles["project_lead_user_ids"], is_leader=True
            ).values_list("project_id", flat=True)
            lead_documents = CaretakerTaskService.get_lead_documents(lead_projects)
            all_documents.extend(lead_documents)

        # Team member documents
        member_documents = []
        if roles["team_member_user_ids"]:
            team_projects = (
                ProjectMember.objects.exclude(project__status__in=Project.CLOSED_ONLY)
                .filter(
                    user_id__in=roles["team_member_user_ids"],
                    is_leader=False,
                )
                .values_list("project_id", flat=True)
            )
            member_documents = CaretakerTaskService.get_team_documents(team_projects)
            all_documents.extend(member_documents)

        return {
            "caretaker_assignments": caretaker_assignments,
            "roles": roles,
            "directorate_documents": directorate_documents,
            "ba_documents": ba_documents,
            "lead_documents": lead_documents,
            "member_documents": member_documents,
        }
