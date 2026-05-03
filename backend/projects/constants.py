from projects.models import Project

ALLOWED_DOCUMENT_TYPES: dict[str, list[str]] = {
    Project.CategoryKindChoices.SCIENCE: [
        "concept",
        "projectplan",
        "progressreport",
        "projectclosure",
    ],
    Project.CategoryKindChoices.COREFUNCTION: [
        "concept",
        "projectplan",
        "progressreport",
        "projectclosure",
    ],
    Project.CategoryKindChoices.STUDENT: [
        "studentreport",
        "projectclosure",
    ],
    Project.CategoryKindChoices.EXTERNAL: [
        "projectclosure",
    ],
}

# Kinds that follow the full workflow (concept plan → project plan → progress reports → closure)
FULL_WORKFLOW_KINDS = {
    Project.CategoryKindChoices.SCIENCE,
    Project.CategoryKindChoices.COREFUNCTION,
}

# Kinds whose closures are auto-approved (bypass manual three-stage approval)
AUTO_APPROVE_CLOSURE_KINDS = {
    Project.CategoryKindChoices.COREFUNCTION,
    Project.CategoryKindChoices.STUDENT,
    Project.CategoryKindChoices.EXTERNAL,
}
