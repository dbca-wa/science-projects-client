"""Section definitions and article getter mapping for the knowledge base."""

from .account_profile import get_account_profile_articles
from .admin import get_admin_articles
from .business_area import get_business_area_articles
from .creating_projects import get_creating_projects_articles
from .documents import get_documents_articles
from .e2e_testing import get_e2e_testing_articles
from .editing_projects import get_editing_projects_articles
from .getting_started import get_getting_started_articles
from .reports import get_reports_articles
from .searching_navigation import get_searching_navigation_articles
from .system_features import get_system_features_articles
from .team_management import get_team_management_articles

# ─── Section definitions ──────────────────────────────────────────────────────

SECTIONS = [
    {
        "id": "getting-started",
        "title": "Getting Started",
        "description": "Learn the basics of SPMS — what it is, how it works, and the annual report.",
        "icon": "rocket",
        "required_role": "all",
        "order": 0,
    },
    {
        "id": "creating-projects",
        "title": "Creating Projects",
        "description": "Step-by-step guide to creating projects, adding external users, and inviting DBCA staff.",
        "icon": "folder-plus",
        "required_role": "all",
        "order": 1,
    },
    {
        "id": "searching-and-navigation",
        "title": "Searching & Navigation",
        "description": "Search for projects and users, use the interactive project map, and save your searches.",
        "icon": "search",
        "required_role": "all",
        "order": 2,
    },
    {
        "id": "account-profile",
        "title": "Account & Profile",
        "description": "Manage your SPMS profile, public staff page, dark mode, and submit feedback.",
        "icon": "user",
        "required_role": "all",
        "order": 3,
    },
    {
        "id": "system-features",
        "title": "System Features",
        "description": "Caretakers, merge requests, project deletion, endorsement tasks, and the data catalogue.",
        "icon": "settings-2",
        "required_role": "all",
        "order": 4,
    },
    {
        "id": "editing-projects",
        "title": "Editing Projects",
        "description": "Edit project details, update descriptions, and manage project settings.",
        "icon": "pencil",
        "required_role": "all",
        "order": 5,
    },
    {
        "id": "documents",
        "title": "Documents & Approvals",
        "description": "The document approval process — submitting, recalling, and sending back documents.",
        "icon": "file-text",
        "required_role": "all",
        "order": 6,
    },
    {
        "id": "team-management",
        "title": "Team Management",
        "description": "Add and remove team members, assign roles, promote to project lead, and manage time allocations.",
        "icon": "users",
        "required_role": "all",
        "order": 7,
    },
    {
        "id": "business-area",
        "title": "Business Area Management",
        "description": "Manage your business area, review unapproved documents, and track problematic projects.",
        "icon": "briefcase",
        "required_role": "business_area_lead",
        "order": 8,
    },
    {
        "id": "reports",
        "title": "Reports & Annual Reporting",
        "description": "Published reports, report details, batch approvals, and opening new reporting cycles.",
        "icon": "bar-chart-2",
        "required_role": "key_stakeholder",
        "order": 9,
    },
    {
        "id": "admin",
        "title": "Administration",
        "description": "System administration, data lists, divisional approvers, and admin tasks.",
        "icon": "settings",
        "required_role": "admin",
        "order": 10,
    },
    {
        "id": "e2e-testing",
        "title": "End-to-End Testing Checklist",
        "description": "Comprehensive manual testing checklist covering every feature of SPMS.",
        "icon": "check-circle",
        "required_role": "admin",
        "order": 11,
    },
]


# ─── Article getter mapping ───────────────────────────────────────────────────

ARTICLE_GETTERS = {
    "getting-started": get_getting_started_articles,
    "creating-projects": get_creating_projects_articles,
    "searching-and-navigation": get_searching_navigation_articles,
    "account-profile": get_account_profile_articles,
    "system-features": get_system_features_articles,
    "editing-projects": get_editing_projects_articles,
    "documents": get_documents_articles,
    "team-management": get_team_management_articles,
    "business-area": get_business_area_articles,
    "reports": get_reports_articles,
    "admin": get_admin_articles,
    "e2e-testing": get_e2e_testing_articles,
}
