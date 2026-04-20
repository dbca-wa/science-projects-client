"""
Optimised serializers for annual report PDF generation.

These serializers produce the exact data structure expected by the
annual_report.html template and its custom template filters. They use
prefetched data to minimise database queries during generation.
"""

from rest_framework import serializers

from documents.models import ProgressReport, StudentReport


class _OptimisedTeamMemberMixin:
    """Builds team member dicts from prefetched ProjectMember data."""

    def get_team_members(self, obj):
        if hasattr(obj, "document") and hasattr(obj.document, "project"):
            project = obj.document.project
        elif hasattr(obj, "project"):
            project = obj.project
        else:
            project = obj

        if (
            hasattr(project, "_prefetched_objects_cache")
            and "members" in project._prefetched_objects_cache
        ):
            members = project._prefetched_objects_cache["members"]
        else:
            from projects.models import ProjectMember

            members = ProjectMember.objects.select_related(
                "user", "user__profile", "user__work", "user__work__affiliation"
            ).filter(project=project.pk)

        return [
            {
                "pk": member.pk,
                "role": member.role,
                "position": member.position,
                "is_leader": member.is_leader,
                "user": {
                    "pk": member.user.pk,
                    "display_first_name": member.user.display_first_name,
                    "display_last_name": member.user.display_last_name,
                    "is_staff": member.user.is_staff,
                    "title": (
                        getattr(member.user.profile, "title", "")
                        if hasattr(member.user, "profile")
                        else ""
                    ),
                    "affiliation": _get_user_affiliation(member.user),
                },
            }
            for member in members
        ]


def _get_user_affiliation(user):
    """
    Get affiliation data for a user.

    In the monorepo, affiliation lives on UserWork (not UserProfile).
    Returns a dict matching the template filter's expected structure.
    """
    try:
        if hasattr(user, "work") and user.work and user.work.affiliation:
            return {"name": user.work.affiliation.name or ""}
    except Exception:
        pass  # nosec B110 — affiliation is optional, gracefully return None
    return None


class OptimisedStudentReportAnnualReportSerializer(
    _OptimisedTeamMemberMixin, serializers.ModelSerializer
):
    """Serialiser for student reports in the annual report PDF template."""

    document = serializers.SerializerMethodField()
    team_members = serializers.SerializerMethodField()
    project_areas = serializers.SerializerMethodField()

    def get_document(self, obj):
        doc = obj.document
        project = doc.project
        business_area = project.business_area

        student_level = ""
        if hasattr(project, "student_project_info") and project.student_project_info:
            student_level = project.student_project_info.level

        return {
            "pk": doc.pk,
            "project": {
                "pk": project.pk,
                "title": project.title,
                "year": project.year,
                "kind": getattr(project, "kind", ""),
                "number": getattr(project, "number", ""),
                "student_level": student_level,
                "start_date": project.start_date,
                "end_date": project.end_date,
                "image": {
                    "file": (
                        project.image.file.url
                        if hasattr(project, "image")
                        and project.image
                        and project.image.file
                        else None
                    )
                },
                "business_area": (
                    {
                        "pk": business_area.pk,
                        "name": business_area.name,
                        "leader": business_area.leader_id,
                        "introduction": business_area.introduction,
                        "image": getattr(business_area, "image", ""),
                    }
                    if business_area
                    else None
                ),
            },
        }

    def get_project_areas(self, obj):
        if hasattr(obj.project, "area") and obj.project.area:
            try:
                from locations.models import Area

                area_pks = (
                    obj.project.area.areas if hasattr(obj.project.area, "areas") else []
                )
                areas = (
                    Area.objects.filter(pk__in=area_pks).values(
                        "pk", "name", "area_type"
                    )
                    if area_pks
                    else []
                )
                return {"data": {"areas": list(areas)}}
            except ImportError:
                return {"data": {"areas": []}}
        return {"data": {"areas": []}}

    class Meta:
        model = StudentReport
        fields = [
            "pk",
            "document",
            "year",
            "progress_report",
            "team_members",
            "project_areas",
        ]


class OptimisedProgressReportAnnualReportSerializer(
    _OptimisedTeamMemberMixin, serializers.ModelSerializer
):
    """Serialiser for progress reports in the annual report PDF template."""

    document = serializers.SerializerMethodField()
    team_members = serializers.SerializerMethodField()
    project_areas = serializers.SerializerMethodField()

    def get_document(self, obj):
        doc = obj.document
        project = doc.project
        business_area = project.business_area

        return {
            "pk": doc.pk,
            "project": {
                "pk": project.pk,
                "title": project.title,
                "year": project.year,
                "kind": getattr(project, "kind", ""),
                "number": getattr(project, "number", ""),
                "student_level": getattr(project, "student_level", ""),
                "image": {
                    "file": (
                        project.image.file.url
                        if hasattr(project, "image")
                        and project.image
                        and project.image.file
                        else None
                    )
                },
                "business_area": (
                    {
                        "pk": business_area.pk,
                        "name": business_area.name,
                        "leader": business_area.leader_id,
                        "introduction": business_area.introduction,
                        "image": (
                            {
                                "file": (
                                    business_area.image.file.url
                                    if hasattr(business_area, "image")
                                    and business_area.image
                                    and business_area.image.file
                                    else None
                                )
                            }
                            if hasattr(business_area, "image")
                            else None
                        ),
                    }
                    if business_area
                    else None
                ),
            },
        }

    def get_project_areas(self, obj):
        if hasattr(obj.project, "area") and obj.project.area:
            from locations.models import Area

            area_pks = (
                obj.project.area.areas if hasattr(obj.project.area, "areas") else []
            )
            areas = (
                Area.objects.filter(pk__in=area_pks).values("pk", "name", "area_type")
                if area_pks
                else []
            )
            return {"data": {"areas": list(areas)}}
        return {"data": {"areas": []}}

    class Meta:
        model = ProgressReport
        fields = [
            "pk",
            "document",
            "year",
            "is_final_report",
            "context",
            "aims",
            "progress",
            "implications",
            "future",
            "team_members",
            "project_areas",
        ]
