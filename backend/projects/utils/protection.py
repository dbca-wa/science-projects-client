"""
Project protection utilities.

Centralised logic for determining whether a project is in a protected state
(closed/closure_requested) and whether document actions should skip project
status transitions.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from documents.models import ProjectDocument
    from projects.models import Project


# Document workflow stage order — higher number = later stage.
# Only the most advanced document should drive project status changes.
DOCUMENT_STAGE_ORDER: dict[str, int] = {
    "concept": 1,
    "projectplan": 2,
    "progressreport": 3,
    "studentreport": 3,
    "projectclosure": 4,
}


def is_project_protected(project: "Project") -> bool:
    """
    Check if a project is in a protected state for document creation and
    task filtering purposes.

    Protected projects cannot have new documents created and their documents
    do not appear as tasks on dashboards.

    A project is protected if its status is one of:
    - completed
    - terminated
    - closure_requested

    Args:
        project: Project instance to check.

    Returns:
        True if the project is in a protected state.
    """
    from projects.models import Project as ProjectModel

    return project.status in (
        ProjectModel.StatusChoices.COMPLETED,
        ProjectModel.StatusChoices.TERMINATED,
        ProjectModel.StatusChoices.CLOSUREREQ,
    )


def are_document_actions_blocked(document: "ProjectDocument") -> bool:
    """
    Check if document actions (approve/recall/send-back) should be blocked
    for a specific document on a protected project.

    Only fully closed projects (completed/terminated) block document actions.
    closure_requested does NOT block actions — the backend guards handle
    skipping status transitions without blocking the user from approving.

    Args:
        document: ProjectDocument instance being actioned.

    Returns:
        True if actions on this document should be blocked.
    """
    from projects.models import Project as ProjectModel

    project = document.project

    # Only fully closed projects block document actions
    return project.status in (
        ProjectModel.StatusChoices.COMPLETED,
        ProjectModel.StatusChoices.TERMINATED,
    )


def should_skip_status_transition(document: "ProjectDocument") -> bool:
    """
    Check if a document's status transition should be skipped because a
    later-stage document already exists on the project.

    The "latest document wins" rule: only the most advanced document in the
    workflow should drive project status changes. For example, if a progress
    report exists, approving the concept plan or project plan should not
    change the project status.

    Stage order:
    - concept (1) → projectplan (2) → progressreport/studentreport (3) → projectclosure (4)

    Args:
        document: ProjectDocument instance being actioned.

    Returns:
        True if a later-stage document exists and this document's status
        transition should be skipped.
    """
    from documents.models import ProjectDocument as DocModel

    project = document.project
    doc_stage = DOCUMENT_STAGE_ORDER.get(document.kind, 0)

    # If document actions are blocked for this specific document, skip
    if are_document_actions_blocked(document):
        return True

    # Determine which document kinds represent later stages
    later_stage_kinds = [
        kind for kind, stage in DOCUMENT_STAGE_ORDER.items() if stage > doc_stage
    ]

    if not later_stage_kinds:
        return False

    # Check if any later-stage document exists on this project
    return DocModel.objects.filter(
        project=project,
        kind__in=later_stage_kinds,
    ).exists()
