# region IMPORTS ==============================================

import csv

from bs4 import BeautifulSoup
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse

from locations.models import Area

from .models import (
    ExternalProjectDetails,
    Project,
    ProjectArea,
    ProjectDetail,
    ProjectMember,
    StudentProjectDetails,
)

# endregion ==============================================

# region ADMIN ACTION ==============================================


# A function to convert "External Peer" roles to "Consulted Peers" (externalpeer --> consulted)
@admin.action(description="Convert EXT Peer to Consulted")
def convert_ext_peer_to_consulted(model_admin, req, selected):
    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return

    roles_to_convert = [
        ProjectMember.RoleChoices.EXTERNALPEER,
    ]
    new_role = ProjectMember.RoleChoices.CONSULTED

    # Update the role for all matching users
    ProjectMember.objects.filter(role__in=roles_to_convert).update(role=new_role)
    return


# A function to convert "External Collaborator" roles to "Consulted Peers" (externalcol --> consulted)
@admin.action(description="Convert EXT Collaborator to Consulted")
def convert_ext_collaborator_to_consulted(model_admin, req, selected):
    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return

    roles_to_convert = [
        ProjectMember.RoleChoices.EXTERNALCOL,
    ]
    new_role = ProjectMember.RoleChoices.CONSULTED

    # Update the role for all matching users
    ProjectMember.objects.filter(role__in=roles_to_convert).update(role=new_role)
    return


@admin.action(description="Clean orphaned project memberships")
def clean_orphaned_project_memberships(model_admin, req, selected):
    """
    Remove ProjectMember records where the associated user no longer exists.
    This handles cases where user deletion didn't properly cascade.
    """
    if len(selected) > 1:
        model_admin.message_user(req, "PLEASE SELECT ONLY ONE", level="error")
        return

    from users.models import User

    # Find all ProjectMember records
    all_members = ProjectMember.objects.all()
    orphaned_count = 0
    orphaned_details = []

    for member in all_members:
        # Check if the user exists
        try:
            if (
                member.user is None
                or not User.objects.filter(pk=member.user_id).exists()
            ):
                orphaned_details.append(
                    f"Project: {member.project.title} (ID: {member.project.pk}), "
                    f"User ID: {member.user_id}, Role: {member.role}"
                )
                member.delete()
                orphaned_count += 1
        except Exception as e:
            orphaned_details.append(f"Error checking member {member.pk}: {str(e)}")
            member.delete()
            orphaned_count += 1

    if orphaned_count > 0:
        message = (
            f"Cleaned {orphaned_count} orphaned project membership(s):\n"
            + "\n".join(orphaned_details[:10])
        )
        if len(orphaned_details) > 10:
            message += f"\n... and {len(orphaned_details) - 10} more"
        model_admin.message_user(req, message, level="warning")
    else:
        model_admin.message_user(
            req, "No orphaned project memberships found.", level="success"
        )


@admin.action(description="Report orphaned data")
def report_orphaned_data(model_admin, req, selected):
    """
    Generate a report of all orphaned data without deleting anything.
    Checks ProjectMember, ProjectDetail, and other models for null/missing user references.
    """
    if len(selected) > 1:
        model_admin.message_user(req, "PLEASE SELECT ONLY ONE", level="error")
        return

    from users.models import User

    report = []

    # Check ProjectMember for orphaned users
    orphaned_members = []
    for member in ProjectMember.objects.all():
        try:
            if (
                member.user is None
                or not User.objects.filter(pk=member.user_id).exists()
            ):
                orphaned_members.append(
                    f"  - ProjectMember ID {member.pk}: Project '{member.project.title}' (ID: {member.project.pk}), "
                    f"User ID: {member.user_id}, Role: {member.role}"
                )
        except Exception:
            orphaned_members.append(
                f"  - ProjectMember ID {member.pk}: Error accessing user data"
            )

    if orphaned_members:
        report.append(f"Orphaned ProjectMembers ({len(orphaned_members)}):")
        report.extend(orphaned_members[:20])
        if len(orphaned_members) > 20:
            report.append(f"  ... and {len(orphaned_members) - 20} more")

    # Check ProjectDetail for null user references
    orphaned_details = []
    for detail in (
        ProjectDetail.objects.filter(creator__isnull=True)
        | ProjectDetail.objects.filter(modifier__isnull=True)
        | ProjectDetail.objects.filter(owner__isnull=True)
    ):
        issues = []
        if detail.creator is None:
            issues.append("creator=null")
        if detail.modifier is None:
            issues.append("modifier=null")
        if detail.owner is None:
            issues.append("owner=null")
        orphaned_details.append(
            f"  - ProjectDetail ID {detail.pk}: Project '{detail.project.title}' ({', '.join(issues)})"
        )

    if orphaned_details:
        report.append(f"\nProjectDetails with null users ({len(orphaned_details)}):")
        report.extend(orphaned_details[:20])
        if len(orphaned_details) > 20:
            report.append(f"  ... and {len(orphaned_details) - 20} more")

    if report:
        full_report = "ORPHANED DATA REPORT:\n" + "\n".join(report)
        model_admin.message_user(req, full_report, level="warning")
    else:
        model_admin.message_user(req, "No orphaned data found!", level="success")


# endregion ==============================================

# region ADMIN CLASSES ==============================================


@admin.action(description="⚡ Reconcile project closures (select any 1 project)")
def fix_closed_project_documents(model_admin, req, selected):
    """
    Reconciles project closure consistency. Three operations, in this order:

    1. For ANY project with a fully-approved closure whose intended_outcome is
       completed/terminated and the project status doesn't match → set the
       project status to that intended outcome.

    2. For projects in completed or terminated status with NO closure →
       create a fully-approved closure document (intended_outcome = current status).

    3. For projects in completed or terminated status with an existing closure
       that is NOT fully approved → fully approve that closure.

    Strictly limited to:
    - Only touches the project closure document, never any other document type
    - Steps 2 and 3 only target projects already in completed/terminated status
    - Does NOT touch suspended or closure_requested projects in steps 2/3
    """
    from django.db import transaction

    from documents.models import ProjectClosure, ProjectDocument

    statuses_synced = 0
    closures_created = 0
    closures_approved = 0
    errors = []

    closed_statuses = [
        Project.StatusChoices.COMPLETED,
        Project.StatusChoices.TERMINATED,
    ]
    approved_status = ProjectDocument.StatusChoices.APPROVED
    closure_kind = ProjectDocument.CategoryKindChoices.PROJECTCLOSURE

    # ─── Step 1: Sync project status from fully-approved closures ──────────
    # Fetch closure documents (with their detail and project) where:
    #   - closure is fully approved
    #   - project status is NOT already completed/terminated
    # Then filter in Python by intended_outcome (since it lives on the
    # related ProjectClosure model and we need to read the value).
    approved_closures = (
        ProjectDocument.objects.filter(
            kind=closure_kind,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=True,
            status=approved_status,
        )
        .exclude(project__status__in=closed_statuses)
        .select_related("project")
        .prefetch_related("project_closure_details")
    )

    project_status_updates = []
    seen_project_pks = set()
    for closure_doc in approved_closures:
        project = closure_doc.project
        if project.pk in seen_project_pks:
            continue  # Defensive: skip if a project somehow has multiple closures

        try:
            closure_detail = next(iter(closure_doc.project_closure_details.all()), None)
            if not closure_detail or not closure_detail.intended_outcome:
                continue

            intended = closure_detail.intended_outcome
            if intended in closed_statuses and project.status != intended:
                project.status = intended
                project_status_updates.append(project)
                seen_project_pks.add(project.pk)
        except Exception as e:
            errors.append(f"[{project.pk}] Step 1 error: {str(e)}")

    if project_status_updates:
        try:
            with transaction.atomic():
                Project.objects.bulk_update(project_status_updates, ["status"])
                statuses_synced = len(project_status_updates)
        except Exception as e:
            errors.append(f"Step 1 bulk_update error: {str(e)}")

    # ─── Step 2: Create closures for completed/terminated projects without one ─
    # Single query: closed projects that lack a closure document.
    targets_no_closure = list(
        Project.objects.filter(status__in=closed_statuses)
        .exclude(documents__kind=closure_kind)
        .only("pk", "status")
    )

    if targets_no_closure:
        new_closure_docs = []
        for project in targets_no_closure:
            new_closure_docs.append(
                ProjectDocument(
                    project=project,
                    kind=closure_kind,
                    status=approved_status,
                    project_lead_approval_granted=True,
                    business_area_lead_approval_granted=True,
                    directorate_approval_granted=True,
                    creator=req.user,
                    modifier=req.user,
                )
            )

        try:
            with transaction.atomic():
                # bulk_create returns objects with primary keys set on Postgres
                created_docs = ProjectDocument.objects.bulk_create(new_closure_docs)

                # Build the matching ProjectClosure detail records
                closure_details = []
                project_by_pk = {p.pk: p for p in targets_no_closure}
                for doc in created_docs:
                    project = project_by_pk.get(doc.project_id)
                    if project is None:
                        continue
                    closure_details.append(
                        ProjectClosure(
                            document=doc,
                            project=project,
                            intended_outcome=project.status,
                        )
                    )
                ProjectClosure.objects.bulk_create(closure_details)
                closures_created = len(created_docs)
        except Exception as e:
            errors.append(f"Step 2 bulk_create error: {str(e)}")

    # ─── Step 3: Approve closures on completed/terminated projects ──────────
    # Find closures that exist on completed/terminated projects but aren't
    # fully approved. Use a single bulk_update.
    unapproved_closures = list(
        ProjectDocument.objects.filter(
            kind=closure_kind,
            project__status__in=closed_statuses,
        )
        .exclude(
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=True,
            status=approved_status,
        )
        .select_related("project")
    )

    if unapproved_closures:
        for closure_doc in unapproved_closures:
            closure_doc.project_lead_approval_granted = True
            closure_doc.business_area_lead_approval_granted = True
            closure_doc.directorate_approval_granted = True
            closure_doc.status = approved_status

        try:
            with transaction.atomic():
                ProjectDocument.objects.bulk_update(
                    unapproved_closures,
                    [
                        "project_lead_approval_granted",
                        "business_area_lead_approval_granted",
                        "directorate_approval_granted",
                        "status",
                    ],
                )
                closures_approved = len(unapproved_closures)
        except Exception as e:
            errors.append(f"Step 3 bulk_update error: {str(e)}")

    parts = []
    if statuses_synced:
        parts.append(
            f"{statuses_synced} project statuses synced from approved closures"
        )
    if closures_created:
        parts.append(f"{closures_created} closures created")
    if closures_approved:
        parts.append(f"{closures_approved} closures fully approved")
    if not statuses_synced and not closures_created and not closures_approved:
        parts.append("all clean — no changes needed")
    if errors:
        parts.append(f"{len(errors)} errors")

    message = " | ".join(parts)
    if errors:
        message += f"\nErrors: {'; '.join(errors[:5])}"

    model_admin.message_user(req, message, level="success" if not errors else "warning")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    # kind = ProjectCategorySerializer()
    list_display = [
        "title",
        "year",
        "kind",
        "status",
        "deletion_requested",
        "business_area",
    ]

    search_fields = [
        "title",
        "tagline",
        "description",
    ]

    list_filter = [
        "kind",
        "status",
        "year",
        "business_area",
    ]

    ordering = ["title"]

    actions = [fix_closed_project_documents]


@admin.register(ProjectArea)
class ProjectAreaAdmin(admin.ModelAdmin):
    list_display = [
        "project_id",
        "formatted_areas",
    ]

    def project_id(self, obj):
        return obj.project.id

    @admin.display(description="Areas")
    def formatted_areas(self, obj):
        areas = obj.areas  # Access the list of area IDs directly
        area_info = []
        for area_id in areas:
            try:
                area = Area.objects.get(pk=area_id)  # Fetch the related Area object
                area_info.append(f"{area.name} ({area.area_type})")
            except Area.DoesNotExist:
                pass
        return ", ".join(area_info)

    search_fields = [
        "project__title",
    ]

    list_filter = ["project__id"]


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "is_leader",
        "role",
        "project",
    ]

    search_fields = [
        "user__username",
        "project__title",
    ]

    list_filter = [
        "is_leader",
        "role",
    ]

    ordering = ["project__title"]

    actions = [
        convert_ext_peer_to_consulted,
        convert_ext_collaborator_to_consulted,
        clean_orphaned_project_memberships,
        report_orphaned_data,
    ]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "project")


@admin.register(ProjectDetail)
class ProjectDetailAdmin(admin.ModelAdmin):
    list_display = [
        "project",
        "creator",
        "modifier",
        "owner",
    ]

    search_fields = [
        "project__title",
    ]

    ordering = ["project__title"]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("project", "creator", "modifier", "owner")
        )


@admin.register(StudentProjectDetails)
class StudentProjectDetailAdmin(admin.ModelAdmin):
    list_display = [
        "project",
        "level",
        "organisation",
    ]

    search_fields = [
        "project__title",
    ]

    list_filter = [
        "level",
    ]

    ordering = ["project__title"]


@admin.action(description="Dupe description on empty")
def update_external_description_with_project_description_if_empty(
    model_admin, req, selected
):
    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return

    updated_count = 0

    sections_to_populate = [
        None,
        "",
        "<p></p>",
        '<p class="editor-p-light" dir="ltr"><span style="white-space: pre-wrap;"></span></p>',
    ]
    # Update the role for all matching users
    exts = ExternalProjectDetails.objects.all()
    for obj in exts:
        if obj.description in sections_to_populate:
            # Fetch the related project
            project_description = obj.project.description

            # Update the description field if needed
            if project_description:
                obj.description = project_description
                obj.save()
                updated_count += 1
    model_admin.message_user(req, f"Successfully updated {updated_count} projects.")
    return


@admin.action(
    description="Create ExternalProjectDetails for external projects without details"
)
def create_external_details_if_missing(model_admin, req, selected):
    if len(selected) > 1:
        settings.LOGGER.info(msg="Please select only one item")
        model_admin.message_user(req, "Please select only one item.")
        return

    updated_count = 0
    queryset = Project.objects.filter(kind=Project.CategoryKindChoices.EXTERNAL).all()
    # Iterate over the selected projects
    for project in queryset:
        # Check if an ExternalProjectDetails instance already exists for this project
        if not hasattr(project, "external_project_info"):
            # Create a new ExternalProjectDetails instance
            ExternalProjectDetails.objects.create(
                project=project,
            )
            updated_count += 1
    model_admin.message_user(req, f"Successfully updated {updated_count} projects.")


@admin.action(description="Export external project funding (CSV)")
def export_external_funding_csv(model_admin, req, selected):
    """
    Export a CSV of ALL external projects matching the current admin filters.
    Uses the full filtered queryset (not limited by pagination).
    Orders active projects first, then completed/closed. Includes totals.
    Select any one row to trigger.
    """
    from django.db.models import Case, IntegerField, Value, When

    def extract_text(html):
        """Strip HTML tags and return plain text."""
        if not html:
            return ""
        soup = BeautifulSoup(html, "html.parser")
        return soup.get_text(separator=" | ", strip=True)

    # Get the full filtered queryset from the admin (respects all sidebar filters,
    # ignores pagination — this gives ALL matching results)
    changelist = model_admin.get_changelist_instance(req)
    queryset = changelist.get_queryset(req).select_related(
        "project__business_area__division"
    )

    # Order: active first, then completed/closed, then everything else
    closed_statuses = [
        Project.StatusChoices.COMPLETED,
        Project.StatusChoices.TERMINATED,
    ]
    queryset = queryset.annotate(
        status_order=Case(
            When(project__status=Project.StatusChoices.ACTIVE, then=Value(0)),
            When(project__status__in=closed_statuses, then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )
    ).order_by("status_order", "project__title")

    # Determine filename from filters
    division_slug = req.GET.get("division", "")
    report_id = req.GET.get("annual_report", "")
    filename_parts = ["external_funding"]
    if division_slug:
        filename_parts.append(division_slug)
    if report_id:
        from documents.models import AnnualReport

        try:
            report = AnnualReport.objects.get(pk=int(report_id))
            filename_parts.append(str(report.year))
        except AnnualReport.DoesNotExist:
            filename_parts.append(f"report{report_id}")
    filename = "_".join(filename_parts) + ".csv"

    # Build CSV response
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)
    writer.writerow(
        [
            "Project ID",
            "Project Tag",
            "Title",
            "Business Area",
            "Partners/Collaborators",
            "Funding/Budget",
            "Status",
        ]
    )

    active_count = 0
    closed_count = 0
    other_count = 0

    for ext_detail in queryset:
        project = ext_detail.project
        writer.writerow(
            [
                project.pk,
                project.get_project_tag(),
                extract_text(project.title),
                project.business_area.name if project.business_area else "",
                extract_text(ext_detail.collaboration_with),
                extract_text(ext_detail.budget),
                project.get_status_display(),
            ]
        )

        if project.status == Project.StatusChoices.ACTIVE:
            active_count += 1
        elif project.status in closed_statuses:
            closed_count += 1
        else:
            other_count += 1

    # Write totals
    total = active_count + closed_count + other_count
    writer.writerow([])
    writer.writerow(["", "", "", "", "", "TOTALS", ""])
    writer.writerow(["", "", "", "", "", f"Active: {active_count}", ""])
    writer.writerow(["", "", "", "", "", f"Completed/Closed: {closed_count}", ""])
    if other_count:
        writer.writerow(["", "", "", "", "", f"Other: {other_count}", ""])
    writer.writerow(["", "", "", "", "", f"Total: {total}", ""])

    model_admin.message_user(
        req,
        f"Exported {total} external projects: "
        f"{active_count} active, {closed_count} completed/closed"
        + (f", {other_count} other" if other_count else "")
        + ".",
    )
    return response


@admin.register(ExternalProjectDetails)
class ExternalProjectDetailAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "project",
        "project_tag",
        "division_name",
        "collaboration_with",
        "budget",
    ]

    search_fields = [
        "project__title",
        "pk",
    ]

    class AnnualReportFilter(admin.SimpleListFilter):
        """
        Filter external projects by annual report.
        Replicates the logic used during report generation:
        external + division matches + status=active (excludes completed/suspended/terminated).
        """

        title = "Annual Report"
        parameter_name = "annual_report"

        def lookups(self, request, model_admin):
            from documents.models import AnnualReport

            reports = AnnualReport.objects.select_related("division").order_by("-year")
            return [
                (
                    str(r.pk),
                    f"{r.year} - {r.division.slug if r.division else 'No Division'}",
                )
                for r in reports
            ]

        def queryset(self, request, queryset):
            if self.value():
                from documents.models import AnnualReport

                try:
                    report = AnnualReport.objects.select_related("division").get(
                        pk=int(self.value())
                    )
                except AnnualReport.DoesNotExist:
                    return queryset

                # Apply the same logic as annual report generation:
                # division match + exclude completed/suspended/terminated
                qs = queryset.exclude(
                    project__status__in=[
                        Project.StatusChoices.COMPLETED,
                        Project.StatusChoices.SUSPENDED,
                        Project.StatusChoices.TERMINATED,
                    ]
                )
                if report.division:
                    qs = qs.filter(project__business_area__division=report.division)
                return qs
            return queryset

    class DivisionFilter(admin.SimpleListFilter):
        title = "Division"
        parameter_name = "division"

        def lookups(self, request, model_admin):
            from agencies.models import Division

            return [(d.slug, d.name) for d in Division.objects.all().order_by("name")]

        def queryset(self, request, queryset):
            if self.value():
                return queryset.filter(
                    project__business_area__division__slug=self.value()
                )
            return queryset

    class StatusFilter(admin.SimpleListFilter):
        title = "Project Status"
        parameter_name = "project_status"

        def lookups(self, request, model_admin):
            return Project.StatusChoices.choices

        def queryset(self, request, queryset):
            if self.value():
                return queryset.filter(project__status=self.value())
            return queryset

    list_filter = [
        AnnualReportFilter,
        DivisionFilter,
        StatusFilter,
        "collaboration_with",
    ]

    ordering = ["project__title"]

    actions = [
        export_external_funding_csv,
        update_external_description_with_project_description_if_empty,
        create_external_details_if_missing,
    ]

    @admin.display(description="Tag")
    def project_tag(self, obj):
        return obj.project.get_project_tag()

    @admin.display(description="Division")
    def division_name(self, obj):
        if obj.project.business_area and obj.project.business_area.division:
            return obj.project.business_area.division.slug
        return "-"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("project__business_area__division")
        )


# endregion ==============================================
