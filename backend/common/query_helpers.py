"""
Reusable queryset optimisation helpers.

These functions apply the standard select_related and prefetch_related
calls needed to avoid N+1 queries when serialising Projects and
ProjectDocuments with their nested business area / division data.

Usage:
    from common.query_helpers import optimise_project_qs, optimise_document_qs

    projects = optimise_project_qs(Project.objects.filter(...))
    documents = optimise_document_qs(ProjectDocument.objects.filter(...))
"""


def optimise_project_qs(queryset):
    """
    Apply standard N+1 optimisation for Project querysets.

    Covers all fields accessed by TinyProjectSerializer → TinyBusinessAreaSerializer
    → TinyDivisionSerializer (including M2M approvers and directorate_email_list).
    """
    return queryset.select_related(
        "business_area",
        "business_area__division",
        "business_area__division__director",
        "business_area__division__approver",
        "business_area__division__key_stakeholder",
        "business_area__leader",
        "business_area__caretaker",
        "business_area__finance_admin",
        "business_area__data_custodian",
        "business_area__image",
        "image",
        "image__uploader",
    ).prefetch_related(
        "business_area__division__approvers",
        "business_area__division__directorate_email_list",
    )


def optimise_document_qs(queryset):
    """
    Apply standard N+1 optimisation for ProjectDocument querysets.

    Covers all fields accessed by TinyProjectDocumentSerializer including
    the nested project → business_area → division chain.
    """
    return queryset.select_related(
        "project",
        "project__business_area",
        "project__business_area__image",
        "project__business_area__division",
        "project__business_area__division__director",
        "project__business_area__division__approver",
        "project__business_area__division__key_stakeholder",
        "project__business_area__leader",
        "project__business_area__caretaker",
        "project__business_area__finance_admin",
        "project__business_area__data_custodian",
        "project__image",
        "project__image__uploader",
        "pdf",
        "pdf__document",
        "pdf__project",
        "creator",
        "modifier",
    ).prefetch_related(
        "project__business_area__division__directorate_email_list",
        "project__business_area__division__approvers",
    )
