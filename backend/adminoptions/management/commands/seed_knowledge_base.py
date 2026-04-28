"""
Seed the Knowledge Base with comprehensive SPMS guide content.

Usage:
    poetry run python manage.py seed_knowledge_base
    poetry run python manage.py seed_knowledge_base --clear

Content is freshly written in clean, task-oriented Australian English.
Screenshot placeholders are included where images would improve understanding.
"""

from django.core.management.base import BaseCommand

from adminoptions.models import ContentField, GuideSection


def screenshot(description: str) -> str:
    """Generate a visible screenshot placeholder block.

    Uses a blockquote with an emoji marker so it survives both DOMPurify
    sanitisation and Lexical's HTML-to-node conversion in edit mode.
    """
    return (
        "<blockquote>"
        f"<p>📸 <strong>Screenshot needed:</strong> {description}</p>"
        "</blockquote>"
    )


def check(text: str) -> str:
    """Generate an interactive checklist item with a clickable checkbox."""
    return (
        '<label class="checklist-item">'
        '<input type="checkbox">'
        f"<span>{text}</span>"
        "</label>"
    )


# ─── Section definitions ──────────────────────────────────────────────────────

SECTIONS = [
    {
        "id": "getting-started",
        "title": "Getting Started",
        "description": "Learn the basics of SPMS and get up and running quickly.",
        "icon": "rocket",
        "required_role": "all",
        "order": 0,
    },
    {
        "id": "dashboard",
        "title": "Dashboard",
        "description": "Understand your dashboard, tasks, and notifications.",
        "icon": "layout-dashboard",
        "required_role": "all",
        "order": 1,
    },
    {
        "id": "projects",
        "title": "Projects",
        "description": "Create, browse, and manage science projects.",
        "icon": "folder",
        "required_role": "all",
        "order": 2,
    },
    {
        "id": "documents",
        "title": "Documents",
        "description": "Work with concept plans, project plans, progress reports, and closures.",
        "icon": "file-text",
        "required_role": "all",
        "order": 3,
    },
    {
        "id": "team-management",
        "title": "Team Management",
        "description": "Add team members, assign roles, and manage project teams.",
        "icon": "users",
        "required_role": "all",
        "order": 4,
    },
    {
        "id": "account-profile",
        "title": "Account & Profile",
        "description": "Manage your profile, public staff page, and account settings.",
        "icon": "user",
        "required_role": "all",
        "order": 5,
    },
    {
        "id": "business-area",
        "title": "Business Area Management",
        "description": "Manage your business area, review unapproved documents, and track problematic projects.",
        "icon": "briefcase",
        "required_role": "business_area_lead",
        "order": 6,
    },
    {
        "id": "reports",
        "title": "Reports & Annual Reporting",
        "description": "Published reports, annual report management, and batch approvals.",
        "icon": "bar-chart-2",
        "required_role": "key_stakeholder",
        "order": 7,
    },
    {
        "id": "admin",
        "title": "Administration",
        "description": "System administration, data lists, email configuration, and user management.",
        "icon": "settings",
        "required_role": "admin",
        "order": 8,
    },
    {
        "id": "e2e-testing",
        "title": "End-to-End Testing Checklist",
        "description": "Comprehensive manual testing checklist covering every feature of SPMS.",
        "icon": "check-circle",
        "required_role": "admin",
        "order": 9,
    },
]


# ─── Article content by section ───────────────────────────────────────────────


def get_getting_started_articles():
    """Getting Started section — visible to all users."""
    return [
        {
            "field_key": "about-spms",
            "title": "About SPMS",
            "order": 0,
            "description": (
                "<h2>What is SPMS?</h2>"
                "<p>The Science Project Management System (SPMS) is a web application "
                "developed by the Department of Biodiversity, Conservation and Attractions "
                "(DBCA) to manage science projects across all business areas. It provides "
                "tools for project registration, team management, document workflows, and "
                "annual reporting.</p>"
                "<p>SPMS generates an annual research activity report that highlights key "
                "aspects of projects including secured funding, collaborations, and DBCA's "
                "accomplishments for each financial year. The system also offers a public "
                "staff profile feature that enables you to showcase your work.</p>"
                "<p><strong>In short:</strong> SPMS helps record your scientific outputs "
                "and compiles them into an annual report shared with the public and key "
                "ministers.</p>"
                "<h2>Why Use SPMS?</h2>"
                "<p>On 8 December 2022, the Director General directed all DBCA staff to "
                "register science projects in SPMS. This directive addressed recommendations "
                "from a 2020 internal audit of Science Governance, which called for:</p>"
                "<ul>"
                "<li>A centralised database accessible to all departmental staff to capture "
                "details of all science undertaken within the department.</li>"
                "<li>Clear communication to divisions about the requirement to register "
                "science projects in a central repository.</li>"
                "</ul>"
                "<p><strong>In short:</strong> It is required. The Director General mandated "
                "that all science projects be recorded in SPMS.</p>"
                "<h2>Feedback</h2>"
                "<p>We are always looking for ways to improve SPMS and value your feedback. "
                "If you notice something off or would like to request a change, please "
                "submit feedback via the link on the SPMS dashboard, send an email to "
                "the SPMS team, or send a message on Microsoft Teams.</p>"
                "<p>It is recommended to use Google Chrome or Mozilla Firefox for the "
                "optimal SPMS browsing experience.</p>"
            ),
        },
        {
            "field_key": "quick-setup",
            "title": "Quick Setup Guide",
            "order": 1,
            "description": (
                "<p>This guide walks you through the essential first steps to get started "
                "with SPMS. Follow these steps in order.</p>"
                "<h2>1. Log In</h2>"
                "<p>Access SPMS by visiting the SPMS website. The first time you log in, "
                "you will be redirected to the Microsoft login page "
                "(<code>login.microsoftonline.com</code>), the same service used for "
                "SharePoint and Office 365.</p>"
                "<p>Use your full DBCA email address (including <code>@dbca.wa.gov.au</code>) "
                "to log in. If you have Two-Factor Authentication enabled, approve the "
                "request on your mobile device.</p>"
                f"{screenshot('SPMS login page with Microsoft SSO redirect')}"
                "<p>For easier access in the future, select <strong>Keep me signed in</strong> "
                "and allow your browser to remember your password. Your login will be "
                "remembered for a few weeks, though SPMS may occasionally ask you to log "
                "in again for security reasons.</p>"
                "<h2>2. Complete Your Profile</h2>"
                "<p>Before registering a science project, complete your user profile. Your "
                "base profile was created automatically using your name and email from the "
                "DBCA Single-Sign-On login.</p>"
                "<p>To update your profile, click your name or avatar in the top-right "
                "corner and select <strong>My Profile</strong>, or navigate directly to "
                "<code>/users/me</code>.</p>"
                f"{screenshot('User profile page showing the edit sections')}"
                "<h2>3. Set a Profile Picture</h2>"
                "<p>Upload a profile picture by clicking the camera icon on your avatar. "
                "You can crop and adjust the image before saving. Your profile picture "
                "appears across SPMS and on your public staff profile.</p>"
                "<h2>4. Create Your First Project</h2>"
                "<p>Navigate to <strong>Projects &gt; Create New Project</strong> from the "
                "sidebar. Follow the stepped wizard to enter your project details. See the "
                "<strong>Projects</strong> section of this guide for detailed instructions "
                "on each project type.</p>"
            ),
        },
        {
            "field_key": "logging-in",
            "title": "Logging In",
            "order": 2,
            "description": (
                "<h2>Accessing SPMS</h2>"
                "<p>SPMS uses DBCA's Microsoft Single-Sign-On (SSO) for authentication. "
                "When you visit the SPMS website, you will be redirected to the Microsoft "
                "login page if you are not already signed in.</p>"
                "<h2>Login Steps</h2>"
                "<ol>"
                "<li>Navigate to the SPMS website.</li>"
                "<li>If prompted, enter your full DBCA email address "
                "(e.g., <code>firstname.lastname@dbca.wa.gov.au</code>).</li>"
                "<li>Enter your password and approve any Two-Factor Authentication "
                "requests on your mobile device.</li>"
                "<li>You will be redirected to your SPMS dashboard.</li>"
                "</ol>"
                "<h2>Staying Signed In</h2>"
                "<p>Select <strong>Keep me signed in</strong> when prompted. Since you are "
                "already logged into your computer with the same credentials, this presents "
                "no additional security risk. Your browser will remember your login for a "
                "few weeks.</p>"
                "<h2>Troubleshooting</h2>"
                "<ul>"
                "<li><strong>Cannot log in:</strong> Ensure you are using your full DBCA "
                "email address, not your username.</li>"
                "<li><strong>Session expired:</strong> Simply log in again. SPMS "
                "occasionally requires re-authentication for security.</li>"
                "<li><strong>Browser issues:</strong> Use Google Chrome or Mozilla Firefox "
                "for the best experience.</li>"
                "</ul>"
            ),
        },
    ]


def get_dashboard_articles():
    """Dashboard section — visible to all users."""
    return [
        {
            "field_key": "dashboard-overview",
            "title": "Dashboard Overview",
            "order": 0,
            "description": (
                "<p>Your dashboard is the first page you see after logging in. It provides "
                "a quick overview of your tasks, projects, and recent activity.</p>"
                "<h2>Dashboard Cards</h2>"
                "<p>The dashboard displays several cards:</p>"
                "<ul>"
                "<li><strong>My Tasks:</strong> Documents awaiting your action (review, "
                "approval, or editing).</li>"
                "<li><strong>Endorsement Tasks:</strong> Documents requiring your "
                "endorsement as a business area lead or project lead.</li>"
                "<li><strong>My Projects:</strong> Projects you are a member of, with "
                "quick links to each project's overview.</li>"
                "</ul>"
                f"{screenshot('Dashboard page showing task cards and project list')}"
                "<p>Click any card to navigate to the relevant section. The numbers on "
                "each card indicate how many items require your attention.</p>"
            ),
        },
        {
            "field_key": "my-tasks",
            "title": "My Tasks",
            "order": 1,
            "description": (
                "<p>The <strong>My Tasks</strong> card shows documents that are pending "
                "your action. These are documents where you are the next person in the "
                "approval chain.</p>"
                "<p>Click on a task to navigate directly to the document. From there, "
                "you can review the content and take the appropriate action (approve, "
                "request changes, or recall).</p>"
                f"{screenshot('My Tasks card expanded showing pending documents')}"
            ),
        },
        {
            "field_key": "endorsement-tasks",
            "title": "Endorsement Tasks",
            "order": 2,
            "description": (
                "<p><strong>Endorsement Tasks</strong> appear when you are a business area "
                "lead or project lead and documents require your endorsement before "
                "progressing to the next approval stage.</p>"
                "<p>Review the document content carefully before endorsing. You can also "
                "send the document back for revisions if changes are needed.</p>"
            ),
        },
        {
            "field_key": "my-projects",
            "title": "My Projects",
            "order": 3,
            "description": (
                "<p>The <strong>My Projects</strong> section lists all projects you are "
                "a team member of. Each project shows its title, status, and your role.</p>"
                "<p>Click on a project to navigate to its overview page where you can "
                "view details, team members, and associated documents.</p>"
            ),
        },
        {
            "field_key": "patches-feedback",
            "title": "Patches & Feedback",
            "order": 4,
            "description": (
                "<p>The dashboard includes a section for recent system updates (patches) "
                "and a feedback link. Check this area to stay informed about new features "
                "and improvements.</p>"
                "<p>To submit feedback, click the feedback link on the dashboard or send "
                "an email to the SPMS team. Your feedback helps us improve the system.</p>"
            ),
        },
    ]


def get_projects_articles():
    """Projects section — visible to all users."""
    return [
        {
            "field_key": "browsing-projects",
            "title": "Browsing Projects",
            "order": 0,
            "description": (
                "<p>Navigate to <strong>Projects</strong> from the sidebar to see all "
                "projects in SPMS.</p>"
                "<h2>Filtering and Searching</h2>"
                "<p>Use the filters at the top of the page to narrow results by:</p>"
                "<ul>"
                "<li><strong>Status:</strong> Active, Suspended, Closed, etc.</li>"
                "<li><strong>Project type:</strong> Science Project, Core Function, "
                "External Partnership, Student Project.</li>"
                "<li><strong>Year:</strong> Filter by the financial year.</li>"
                "<li><strong>Business Area:</strong> Filter by the responsible business area.</li>"
                "</ul>"
                "<p>Use the search bar to find projects by title or keywords.</p>"
                f"{screenshot('Projects list page with filters and search bar')}"
                "<h2>Project Map</h2>"
                "<p>Click <strong>Map</strong> in the sidebar to view projects on an "
                "interactive map. Projects with location data are displayed as markers. "
                "Click a marker to see project details.</p>"
                f"{screenshot('Project map view with markers')}"
            ),
        },
        {
            "field_key": "creating-project",
            "title": "Creating a Project",
            "order": 1,
            "description": (
                "<p>Navigate to <strong>Projects &gt; Create New Project</strong> from "
                "the sidebar.</p>"
                "<p><em>Note: The project creation wizard is being refined. Some details "
                "may change as improvements are made.</em></p>"
                "<h2>Step 1: Choose Project Type</h2>"
                "<p>Select the type of project you want to create. Each type has different "
                "documentation requirements and approval processes:</p>"
                "<ul>"
                "<li><strong>Science Project:</strong> A discrete body of DBCA-led "
                "scientific work with a defined period. Requires approval through SPMS, "
                "annual progress reporting, and a closure form.</li>"
                "<li><strong>Core Function:</strong> An ongoing body of scientific work "
                "that supports biodiversity science and conservation. Requires approval "
                "by the Executive Director and annual progress reporting.</li>"
                "<li><strong>External Partnership:</strong> A formal collaborative "
                "scientific partnership with external organisations. Requires prior "
                "approval by the Executive Director.</li>"
                "<li><strong>Student Project:</strong> A project undertaken by a student "
                "for a higher degree with a DBCA staff member as co-supervisor.</li>"
                "</ul>"
                f"{screenshot('Project type selection cards')}"
                "<h2>Step 2: Base Information</h2>"
                "<p>Enter the core details of your project:</p>"
                "<ul>"
                "<li><strong>Project title:</strong> A concise but descriptive title.</li>"
                "<li><strong>Keywords:</strong> Descriptive terms to help others find "
                "your project. Press Enter or Tab to add each keyword.</li>"
                "<li><strong>Project summary:</strong> A brief description of what the "
                "project does.</li>"
                "<li><strong>Project image:</strong> Upload an informative image that "
                "will appear with your project details and in the annual report.</li>"
                "</ul>"
                "<h2>Step 3: Details</h2>"
                "<ul>"
                "<li><strong>Departmental Service:</strong> Which service the project "
                "contributes to.</li>"
                "<li><strong>Business Area:</strong> The responsible business area "
                "(PVS/CEM Branch, RFMS Region, or BCS Programme).</li>"
                "<li><strong>Start and End Dates:</strong> Enter provisional estimates "
                "if exact dates are unknown.</li>"
                "<li><strong>Project Lead:</strong> The person responsible for project "
                "delivery (defaults to you).</li>"
                "<li><strong>Data Custodian:</strong> The person responsible for data "
                "management and metadata documentation.</li>"
                "</ul>"
                "<h2>Step 4: Location</h2>"
                "<p>Enter the DBCA Region(s) or District(s), IBRA or IMCRA bioregion(s), "
                "and NRM region(s) where the project will be undertaken.</p>"
                "<p>Click <strong>Create</strong> to register the project in SPMS.</p>"
                f"{screenshot('Project creation wizard — location step')}"
            ),
        },
        {
            "field_key": "editing-projects",
            "title": "Editing a Project",
            "order": 2,
            "description": (
                "<p>Navigate to the project's overview page and click "
                "<strong>Edit Project</strong>.</p>"
                "<p>You can update the project title, summary, keywords, image, dates, "
                "business area, and other details. Click <strong>Save</strong> when done.</p>"
                "<p><strong>Note:</strong> You can only edit projects where you are the "
                "project lead, a team member with edit permissions, or an administrator.</p>"
                f"{screenshot('Edit project form')}"
            ),
        },
        {
            "field_key": "project-overview",
            "title": "Project Overview Page",
            "order": 3,
            "description": (
                "<p>The project overview page is the central hub for a project. It shows:</p>"
                "<ul>"
                "<li><strong>Project details:</strong> Title, summary, status, dates, "
                "business area, and keywords.</li>"
                "<li><strong>Team members:</strong> All people involved in the project "
                "with their roles.</li>"
                "<li><strong>Documents:</strong> Tabs for Concept Plan, Project Plan, "
                "Progress Reports, Student Reports, and Project Closure.</li>"
                "</ul>"
                f"{screenshot('Project overview page with tabs')}"
                "<p>Use the document tabs to navigate between different document types. "
                "Each tab shows the current state of that document and any available "
                "actions.</p>"
            ),
        },
    ]


def get_documents_articles():
    """Documents section — visible to all users."""
    return [
        {
            "field_key": "concept-plans",
            "title": "Concept Plans",
            "order": 0,
            "description": (
                "<p>A Concept Plan is the first document created for a new Science Project. "
                "It outlines the project's objectives, methodology, and expected outcomes.</p>"
                "<h2>Editing a Concept Plan</h2>"
                "<p>Navigate to the project's overview page and click the "
                "<strong>Concept Plan</strong> tab. Click the pencil icon next to any "
                "section to open the rich text editor. You can type directly or paste "
                "from another document.</p>"
                f"{screenshot('Concept Plan tab with editable sections')}"
                "<h2>Approval Workflow</h2>"
                "<p>Once complete, submit the Concept Plan for approval. It will progress "
                "through the approval stages: Project Lead &rarr; Business Area Lead "
                "&rarr; Directorate.</p>"
            ),
        },
        {
            "field_key": "project-plans",
            "title": "Project Plans",
            "order": 1,
            "description": (
                "<p>A Project Plan provides more detailed planning than a Concept Plan. "
                "It is created after the Concept Plan is approved (for internally led "
                "projects) or directly for externally led projects.</p>"
                "<p>The editing process is the same as for Concept Plans — use the "
                "rich text editor to fill in each section.</p>"
            ),
        },
        {
            "field_key": "progress-reports",
            "title": "Progress Reports",
            "order": 2,
            "description": (
                "<p>Progress Reports are created annually for active projects. They "
                "document what was accomplished during the financial year.</p>"
                "<h2>Creating a Progress Report</h2>"
                "<p>Navigate to the project overview and click the "
                "<strong>Progress Reports</strong> tab. If a report is available for "
                "the current year, you can begin editing it.</p>"
                "<p><strong>Important:</strong> Once the Directorate has approved a "
                "Progress Report, the editors are locked and no further changes can "
                "be made.</p>"
                f"{screenshot('Progress Report tab showing editable sections')}"
            ),
        },
        {
            "field_key": "student-reports",
            "title": "Student Reports",
            "order": 3,
            "description": (
                "<p>Student Reports are specific to Student Projects. They document "
                "the student's progress and are submitted annually.</p>"
                "<p>The editing and approval process follows the same pattern as "
                "Progress Reports.</p>"
            ),
        },
        {
            "field_key": "project-closures",
            "title": "Project Closures",
            "order": 4,
            "description": (
                "<p>When a Science Project is complete, a Project Closure document "
                "must be submitted. This summarises the project's outcomes and "
                "final status.</p>"
                "<p>Navigate to the project overview and click the "
                "<strong>Closure</strong> tab to begin the closure process.</p>"
                "<p><strong>Note:</strong> Core Functions, External Partnerships, and "
                "Student Projects can be closed immediately without a closure form.</p>"
            ),
        },
        {
            "field_key": "approval-workflow",
            "title": "Document Approval Workflow",
            "order": 5,
            "description": (
                "<p>Documents in SPMS follow a multi-stage approval workflow:</p>"
                "<ol>"
                "<li><strong>Draft:</strong> The document is being edited by the "
                "project team.</li>"
                "<li><strong>Project Lead Approval:</strong> The project lead reviews "
                "and approves the document.</li>"
                "<li><strong>Business Area Lead Approval:</strong> The business area "
                "lead reviews and endorses the document.</li>"
                "<li><strong>Directorate Approval:</strong> The directorate gives "
                "final approval.</li>"
                "</ol>"
                f"{screenshot('Document approval workflow diagram showing stages')}"
                "<h2>Available Actions</h2>"
                "<ul>"
                "<li><strong>Approve:</strong> Move the document to the next stage.</li>"
                "<li><strong>Recall:</strong> Pull the document back to your stage "
                "for further editing.</li>"
                "<li><strong>Send Back:</strong> Return the document to the previous "
                "stage with feedback.</li>"
                "</ul>"
                "<h2>Generating PDFs</h2>"
                "<p>Click <strong>Generate PDF</strong> to create a downloadable PDF "
                "of the document. Once generated, click <strong>Download PDF</strong> "
                "to save it to your device.</p>"
            ),
        },
    ]


def get_team_management_articles():
    """Team Management section — visible to all users."""
    return [
        {
            "field_key": "adding-members",
            "title": "Adding Team Members",
            "order": 0,
            "description": (
                "<p>To add a team member to a project:</p>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>In the <strong>Project Team</strong> section, click "
                "<strong>Invite Member</strong>.</li>"
                "<li>Start typing the team member's name in the search field.</li>"
                "<li>Select the user, assign them a <strong>Project Role</strong>, "
                "set their <strong>Time Allocation</strong> and <strong>Short Code</strong>.</li>"
                "<li>Click <strong>Add User</strong>.</li>"
                "</ol>"
                f"{screenshot('Invite Member dialog with user search and role selection')}"
                "<p>If the person is not already registered in SPMS, you will need to "
                "create a user profile for them first (see External Collaborators below).</p>"
            ),
        },
        {
            "field_key": "roles-permissions",
            "title": "Roles & Permissions",
            "order": 1,
            "description": (
                "<p>Each team member has a role that determines their permissions:</p>"
                "<ul>"
                "<li><strong>Project Lead:</strong> Full control over the project. Can "
                "edit all details, manage team, and approve documents.</li>"
                "<li><strong>Supervising Scientist:</strong> Can edit project documents "
                "and view all project details.</li>"
                "<li><strong>Research Scientist:</strong> Can edit project documents.</li>"
                "<li><strong>Technical Officer:</strong> Can view project details and "
                "contribute to documents.</li>"
                "<li><strong>External Collaborator:</strong> Listed on the project for "
                "reporting purposes.</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "promoting-leader",
            "title": "Promoting to Project Lead",
            "order": 2,
            "description": (
                "<p>To transfer project leadership to another team member:</p>"
                "<ol>"
                "<li>Click on the team member's avatar in the Project Team section.</li>"
                "<li>Click the <strong>Promote to Leader</strong> button.</li>"
                "<li>Confirm the promotion.</li>"
                "</ol>"
                "<p><strong>Note:</strong> Only the current Project Lead or a Business "
                "Area Leader can promote another member to Project Lead.</p>"
            ),
        },
        {
            "field_key": "external-collaborators",
            "title": "External Collaborators",
            "order": 3,
            "description": (
                "<p>External (non-DBCA) collaborators need a user profile in SPMS to "
                "appear on project overviews and reports, even though they do not need "
                "system access.</p>"
                "<h2>Registering an External User</h2>"
                "<ol>"
                "<li>First, search existing users to check if the collaborator is "
                "already registered.</li>"
                "<li>If not found, navigate to <strong>Users &gt; Add User</strong>.</li>"
                "<li>Fill in the collaborator's details (name, email, affiliation).</li>"
                "<li>Click <strong>Create</strong>.</li>"
                "</ol>"
                "<p>Once the user profile exists, you can add them to a project team "
                "using the standard process described above.</p>"
            ),
        },
    ]


def get_account_profile_articles():
    """Account & Profile section — visible to all users."""
    return [
        {
            "field_key": "editing-profile",
            "title": "Editing Your Profile",
            "order": 0,
            "description": (
                "<p>Your SPMS profile contains your personal and professional details "
                "used across the system.</p>"
                "<h2>Accessing Your Profile</h2>"
                "<p>Click your name or avatar in the top-right corner and select "
                "<strong>My Profile</strong>, or navigate to <code>/users/me</code>.</p>"
                f"{screenshot('My Profile page showing editable sections')}"
                "<h2>Editable Fields</h2>"
                "<ul>"
                "<li><strong>Profile picture:</strong> Click the camera icon on your "
                "avatar to upload and crop a new image.</li>"
                "<li><strong>Display name:</strong> Your preferred first and last name.</li>"
                "<li><strong>Phone:</strong> Your contact number.</li>"
                "<li><strong>Custom title:</strong> If your official title needs updating, "
                "contact Establishment first. Use the custom title as a last resort.</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "public-staff-profile",
            "title": "Public Staff Profile",
            "order": 1,
            "description": (
                "<p>SPMS includes a public-facing staff profile that showcases your "
                "work to the public. This is separate from your internal SPMS profile.</p>"
                "<h2>Profile Sections</h2>"
                "<ul>"
                "<li><strong>Overview:</strong> Your about section, expertise, and key "
                "interests (editable).</li>"
                "<li><strong>Projects:</strong> Automatically pulled from your SPMS "
                "project memberships.</li>"
                "<li><strong>CV:</strong> Employment history and qualifications "
                "(editable).</li>"
                "<li><strong>Publications:</strong> Pulled from the Library API. Custom "
                "publications can be added via the Library.</li>"
                "</ul>"
                f"{screenshot('Public staff profile page in view mode')}"
                "<h2>Visibility</h2>"
                "<p>Your staff profile is hidden by default. Toggle visibility using "
                "the <strong>Show Staff Profile</strong> / <strong>Hide Staff Profile</strong> "
                "button. We recommend filling out your details before making it visible.</p>"
                "<h2>Editing</h2>"
                "<p>Click <strong>Edit Public Profile</strong> to navigate to your "
                "profile page. Click the green eye button in the top-right to enter "
                "edit mode. Blue edit buttons will appear for each editable section.</p>"
            ),
        },
        {
            "field_key": "caretaker-mode",
            "title": "Caretaker Mode",
            "order": 2,
            "description": (
                "<p>Caretaker mode allows another DBCA staff member to act on your "
                "behalf when you are unavailable (e.g., on leave).</p>"
                "<h2>How It Works</h2>"
                "<p>When a caretaker is assigned to you, they can:</p>"
                "<ul>"
                "<li>Approve documents on your behalf.</li>"
                "<li>Manage your projects.</li>"
                "<li>Perform actions that would normally require your role.</li>"
                "</ul>"
                "<h2>Setting a Caretaker</h2>"
                "<p>Caretaker assignments are managed by administrators. Contact your "
                "administrator or submit a request through the admin tasks system.</p>"
                f"{screenshot('Caretaker mode tab on the profile page')}"
            ),
        },
    ]


def get_business_area_articles():
    """Business Area Management section — visible to BA leads."""
    return [
        {
            "field_key": "my-business-area",
            "title": "My Business Area",
            "order": 0,
            "description": (
                "<p>As a Business Area Lead, you have access to the "
                "<strong>My Business Area</strong> page, which provides an overview "
                "of all projects and documents within your business area.</p>"
                "<p>Navigate to <strong>Reports &gt; My Business Area</strong> from "
                "the header menu.</p>"
                f"{screenshot('My Business Area page showing project summary')}"
                "<h2>Business Area Details</h2>"
                "<p>You can edit your business area's details including the image, "
                "introduction text, and other metadata by clicking "
                "<strong>Edit</strong>.</p>"
            ),
        },
        {
            "field_key": "unapproved-docs",
            "title": "Unapproved Documents",
            "order": 1,
            "description": (
                "<p>The <strong>Unapproved</strong> tab shows all documents in your "
                "business area that have not yet completed the approval workflow.</p>"
                "<p>Use this view to identify bottlenecks and follow up with project "
                "leads who have outstanding documents.</p>"
                f"{screenshot('Unapproved documents tab with document list')}"
            ),
        },
        {
            "field_key": "problematic-projects",
            "title": "Problematic Projects",
            "order": 2,
            "description": (
                "<p>The <strong>Problematic</strong> tab highlights projects that may "
                "need attention — for example, projects with missing progress reports "
                "or overdue documents.</p>"
                "<p>Review these projects regularly to ensure compliance with reporting "
                "requirements.</p>"
            ),
        },
    ]


def get_reports_articles():
    """Reports & Annual Reporting section — visible to key stakeholders."""
    return [
        {
            "field_key": "published-reports",
            "title": "Published Reports",
            "order": 0,
            "description": (
                "<p>The <strong>Published Reports</strong> page shows all finalised "
                "annual research activity reports. These are the official reports "
                "shared with the public and key ministers.</p>"
                "<p>Navigate to <strong>Reports</strong> from the header menu to "
                "view published reports, drafts, and legacy reports.</p>"
                f"{screenshot('Published Reports page with report cards')}"
            ),
        },
        {
            "field_key": "latest-report",
            "title": "Latest Report",
            "order": 1,
            "description": (
                "<p>The <strong>Report Details</strong> page (accessible to admins "
                "and key stakeholders) shows the current year's report in progress.</p>"
                "<p>From here you can:</p>"
                "<ul>"
                "<li>View pending and approved entries.</li>"
                "<li>Review the print preview.</li>"
                "<li>Manage report media (cover images, etc.).</li>"
                "</ul>"
                f"{screenshot('Latest Report details page with tabs')}"
            ),
        },
        {
            "field_key": "my-division",
            "title": "My Division",
            "order": 2,
            "description": (
                "<p>Key stakeholders can access the <strong>My Division</strong> page "
                "to see an overview of all business areas and projects within their "
                "division.</p>"
                "<p>This provides a high-level view of reporting progress across "
                "the division.</p>"
            ),
        },
        {
            "field_key": "batch-approvals",
            "title": "Batch Approvals",
            "order": 3,
            "description": (
                "<p>The <strong>Batch Approve</strong> feature allows key stakeholders "
                "and admins to approve multiple documents at once, rather than "
                "approving each one individually.</p>"
                "<p>Navigate to <strong>Admin &gt; Batch Approve</strong> from the "
                "header menu. Select the documents you want to approve and click "
                "<strong>Approve Selected</strong>.</p>"
                f"{screenshot('Batch approval page with selectable documents')}"
            ),
        },
        {
            "field_key": "new-cycle",
            "title": "Opening a New Reporting Cycle",
            "order": 4,
            "description": (
                "<p>At the start of each financial year, a new reporting cycle must "
                "be opened. This creates new progress report slots for all active "
                "projects.</p>"
                "<p>Navigate to <strong>Admin &gt; Open New Cycle</strong>. Review "
                "the details and confirm to open the new cycle.</p>"
                "<p><strong>Warning:</strong> This action affects all active projects "
                "and should only be performed once per financial year.</p>"
            ),
        },
    ]


def get_admin_articles():
    """Administration section — visible to admins only."""
    return [
        {
            "field_key": "admin-overview",
            "title": "Admin Overview",
            "order": 0,
            "description": (
                "<p>As an administrator, you have access to system-wide management "
                "features. These are accessible from the <strong>Manage</strong> "
                "dropdown in the header.</p>"
                "<p>This guide assumes you have already read the User Guide and "
                "understand the basics of how SPMS works.</p>"
                f"{screenshot('Manage dropdown showing admin menu items')}"
            ),
        },
        {
            "field_key": "data-lists",
            "title": "Data Lists",
            "order": 1,
            "description": (
                "<p>The <strong>Data Lists</strong> page allows you to manage the "
                "reference data used throughout SPMS:</p>"
                "<ul>"
                "<li><strong>Branches:</strong> Organisational branches within DBCA.</li>"
                "<li><strong>Divisions:</strong> Divisions within branches.</li>"
                "<li><strong>Business Areas:</strong> Business areas within divisions, "
                "each with a designated leader.</li>"
                "<li><strong>Services:</strong> Departmental services that projects "
                "contribute to.</li>"
                "<li><strong>Locations:</strong> Geographic locations for project mapping.</li>"
                "<li><strong>Affiliations:</strong> External organisations that "
                "collaborators belong to.</li>"
                "<li><strong>Addresses:</strong> Physical addresses for locations.</li>"
                "</ul>"
                f"{screenshot('Data Lists page showing management tables')}"
            ),
        },
        {
            "field_key": "email-config",
            "title": "Email Configuration",
            "order": 2,
            "description": (
                "<p>SPMS sends automated email notifications for document approvals, "
                "new reporting cycles, and other events.</p>"
                "<h2>Email Settings</h2>"
                "<p>Navigate to <strong>Manage &gt; Email</strong> to configure:</p>"
                "<ul>"
                "<li><strong>Email mode:</strong> Enabled, Admin Only, or Disabled.</li>"
                "<li><strong>Testing mode:</strong> When enabled, all emails are "
                "redirected to a designated test user instead of actual recipients.</li>"
                "<li><strong>Test user:</strong> The superuser who receives all emails "
                "when testing mode is active.</li>"
                "</ul>"
                f"{screenshot('Email configuration page')}"
                "<h2>Email Testing</h2>"
                "<p>Navigate to <strong>Manage &gt; Email Testing</strong> to send "
                "test emails and preview all email templates. This is useful for "
                "verifying email formatting before enabling emails for all users.</p>"
            ),
        },
        {
            "field_key": "admin-tasks",
            "title": "Admin Tasks (Merge Users, Delete Projects)",
            "order": 3,
            "description": (
                "<p>Admin tasks appear on your dashboard when users request actions "
                "that require administrator approval:</p>"
                "<ul>"
                "<li><strong>Delete Project:</strong> When a user requests project "
                "deletion, you can approve or reject the request.</li>"
                "<li><strong>Merge Users:</strong> Combine duplicate user accounts "
                "into a single account, transferring all project memberships and "
                "documents.</li>"
                "<li><strong>Set Caretaker:</strong> Assign a caretaker to act on "
                "behalf of another user.</li>"
                "</ul>"
                f"{screenshot('Admin tasks on the dashboard')}"
                "<p>Review each request carefully before approving. Merged users "
                "and deleted projects cannot be easily undone.</p>"
            ),
        },
    ]


def get_e2e_testing_articles():
    """End-to-end testing checklist — admin only. Comprehensive manual testing."""
    checklist = (
        "<p>Use this checklist before each release to verify every feature of SPMS "
        "is working correctly. Work through each section methodically — tick off "
        "each item as you confirm it works. If something fails, note the issue "
        "and report it before proceeding.</p>"
        "<p><strong>Testing environment:</strong> Use a staging/test environment "
        "where possible. For email tests, ensure testing mode is enabled so emails "
        "go to the test user, not real recipients.</p>"
    )
    return [
        {
            "field_key": "e2e-auth-profile",
            "title": "1. Authentication & Profile",
            "order": 0,
            "description": (
                checklist + "<h2>Login / Logout</h2>"
                "<ul>"
                "<li>☐ Navigate to SPMS — redirected to Microsoft SSO login</li>"
                "<li>☐ Log in with valid DBCA credentials — redirected to dashboard</li>"
                "<li>☐ Refresh the page — session persists (not logged out)</li>"
                "<li>☐ Log out via the avatar menu — redirected to login page</li>"
                "<li>☐ Try accessing a protected page while logged out — redirected to login</li>"
                "</ul>"
                "<h2>My Profile</h2>"
                "<ul>"
                "<li>☐ Navigate to My Profile — page loads with correct user details</li>"
                "<li>☐ Edit display name — saves correctly</li>"
                "<li>☐ Upload a profile picture — image appears after save</li>"
                "<li>☐ Crop the profile picture — cropped version saves correctly</li>"
                "<li>☐ Set a custom title — displays on profile</li>"
                "<li>☐ Toggle custom title off — reverts to official title</li>"
                "</ul>"
                "<h2>Public Staff Profile</h2>"
                "<ul>"
                "<li>☐ Navigate to your public staff profile page</li>"
                "<li>☐ Toggle visibility (Show/Hide Staff Profile) — works correctly</li>"
                "<li>☐ Enter edit mode (green eye button) — edit buttons appear</li>"
                "<li>☐ Edit About section — saves and displays correctly</li>"
                "<li>☐ Edit Expertise section — saves and displays correctly</li>"
                "<li>☐ Edit Employment section — saves and displays correctly</li>"
                "<li>☐ Edit Qualifications section — saves and displays correctly</li>"
                "<li>☐ Projects tab shows your SPMS projects</li>"
                "<li>☐ Publications tab loads (from Library API)</li>"
                "<li>☐ Set a custom public email — saves correctly</li>"
                "</ul>"
                "<h2>Caretaker Mode</h2>"
                "<ul>"
                "<li>☐ Caretaker tab visible on My Profile</li>"
                "<li>☐ If caretaker is assigned, caretaker details display correctly</li>"
                "<li>☐ Caretaker can perform actions on behalf of the user</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-users",
            "title": "2. Users",
            "order": 1,
            "description": (
                "<h2>User List</h2>"
                "<ul>"
                "<li>☐ Navigate to Users — list loads with all users</li>"
                "<li>☐ Search for a user by name — results filter correctly</li>"
                "<li>☐ Click a user — user detail sheet opens</li>"
                "<li>☐ User detail sheet shows correct info (name, email, role, image)</li>"
                "<li>☐ Close the sheet — returns to user list</li>"
                "</ul>"
                "<h2>User Detail Page</h2>"
                "<ul>"
                "<li>☐ Navigate to a user's detail page (/users/:id/details)</li>"
                "<li>☐ All user information displays correctly</li>"
                "<li>☐ Edit button visible for admins only</li>"
                "</ul>"
                "<h2>Create External User</h2>"
                "<ul>"
                "<li>☐ Navigate to Users &gt; Add User</li>"
                "<li>☐ Fill in required fields (name, email)</li>"
                "<li>☐ Submit — user created successfully</li>"
                "<li>☐ New user appears in user list</li>"
                "</ul>"
                "<h2>Create DBCA Staff User (Admin)</h2>"
                "<ul>"
                "<li>☐ Navigate to Users &gt; Add DBCA User (admin only)</li>"
                "<li>☐ Fill in staff details</li>"
                "<li>☐ Submit — staff user created</li>"
                "</ul>"
                "<h2>Edit User (Admin)</h2>"
                "<ul>"
                "<li>☐ Navigate to a user's edit page (admin only)</li>"
                "<li>☐ Modify user details — saves correctly</li>"
                "<li>☐ Non-admin users cannot access the edit page</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-projects",
            "title": "3. Projects",
            "order": 2,
            "description": (
                "<h2>Project List</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects — list loads</li>"
                "<li>☐ Filter by status (Active/Suspended/Closed) — filters work</li>"
                "<li>☐ Filter by project type — filters work</li>"
                "<li>☐ Filter by year — filters work</li>"
                "<li>☐ Filter by business area — filters work</li>"
                "<li>☐ Search by title/keywords — results filter correctly</li>"
                "<li>☐ Click a project — navigates to project overview</li>"
                "</ul>"
                "<h2>Project Creation (Wizard)</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects &gt; Create New Project</li>"
                "<li>☐ Select Science Project — wizard opens</li>"
                "<li>☐ Fill in Base Information (title, keywords, summary, image)</li>"
                "<li>☐ Fill in Details (service, business area, dates, lead, custodian)</li>"
                "<li>☐ Fill in Location (regions, bioregions)</li>"
                "<li>☐ Click Create — project created successfully</li>"
                "<li>☐ Repeat for Core Function type</li>"
                "<li>☐ Repeat for External Partnership type</li>"
                "<li>☐ Repeat for Student Project type</li>"
                "<li>☐ Verify each type creates the correct document structure</li>"
                "</ul>"
                "<h2>Project Overview</h2>"
                "<ul>"
                "<li>☐ Project details display correctly (title, summary, status, dates)</li>"
                "<li>☐ Team members section shows all members with roles</li>"
                "<li>☐ Document tabs are present and navigable</li>"
                "<li>☐ Edit Project button works (for authorised users)</li>"
                "<li>☐ Project image displays correctly</li>"
                "</ul>"
                "<h2>Edit Project</h2>"
                "<ul>"
                "<li>☐ Edit title — saves correctly</li>"
                "<li>☐ Edit summary — saves correctly</li>"
                "<li>☐ Change business area — saves correctly</li>"
                "<li>☐ Update dates — saves correctly</li>"
                "<li>☐ Upload/change project image — saves correctly</li>"
                "<li>☐ Non-authorised users cannot edit</li>"
                "</ul>"
                "<h2>Project Map</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects &gt; Map</li>"
                "<li>☐ Map loads with project markers</li>"
                "<li>☐ Click a marker — project info popup appears</li>"
                "<li>☐ Search on map works</li>"
                "<li>☐ Filters work on map view</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-documents",
            "title": "4. Documents & Approvals",
            "order": 3,
            "description": (
                "<h2>Concept Plans</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's Concept Plan tab</li>"
                "<li>☐ Click pencil icon to edit a section — editor opens</li>"
                "<li>☐ Type content in the rich text editor — formatting works (bold, italic, lists, links)</li>"
                "<li>☐ Save content — persists after page refresh</li>"
                "<li>☐ All sections are editable when document is in draft</li>"
                "</ul>"
                "<h2>Project Plans</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's Project Plan tab</li>"
                "<li>☐ Edit sections — same as Concept Plan</li>"
                "<li>☐ Verify correct sections appear for the project type</li>"
                "</ul>"
                "<h2>Progress Reports</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's Progress Reports tab</li>"
                "<li>☐ Current year report is available for editing</li>"
                "<li>☐ Edit sections — content saves correctly</li>"
                "<li>☐ Approved reports are locked (editors disabled)</li>"
                "</ul>"
                "<h2>Student Reports</h2>"
                "<ul>"
                "<li>☐ Navigate to a Student Project's Student Reports tab</li>"
                "<li>☐ Edit sections — content saves correctly</li>"
                "</ul>"
                "<h2>Project Closures</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's Closure tab</li>"
                "<li>☐ Closure form is available for Science Projects</li>"
                "<li>☐ Core Functions/External Partnerships close immediately</li>"
                "</ul>"
                "<h2>Approval Workflow</h2>"
                "<ul>"
                "<li>☐ Submit a document for approval — status changes to pending</li>"
                "<li>☐ As Project Lead: approve document — moves to BA Lead stage</li>"
                "<li>☐ As BA Lead: approve document — moves to Directorate stage</li>"
                "<li>☐ As Directorate: approve document — document is finalised</li>"
                "<li>☐ Recall a document — returns to your stage for editing</li>"
                "<li>☐ Send back a document — returns to previous stage with feedback</li>"
                "<li>☐ Verify email notifications are sent at each stage (check test user inbox)</li>"
                "</ul>"
                "<h2>PDF Generation</h2>"
                "<ul>"
                "<li>☐ Click Generate PDF on a document — PDF is generated</li>"
                "<li>☐ Click Download PDF — file downloads correctly</li>"
                "<li>☐ PDF content matches the on-screen content</li>"
                "<li>☐ Regenerate PDF after editing — new version is created</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-team",
            "title": "5. Team Management",
            "order": 4,
            "description": (
                "<h2>Adding Members</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's team section</li>"
                "<li>☐ Click Invite Member — dialog opens</li>"
                "<li>☐ Search for a user — results appear</li>"
                "<li>☐ Select user, assign role, set time allocation</li>"
                "<li>☐ Click Add — member appears in team list</li>"
                "</ul>"
                "<h2>Editing Members</h2>"
                "<ul>"
                "<li>☐ Click a team member's avatar — edit dialog opens</li>"
                "<li>☐ Change role — saves correctly</li>"
                "<li>☐ Change time allocation — saves correctly</li>"
                "<li>☐ Remove from project — member is removed</li>"
                "</ul>"
                "<h2>Promoting to Leader</h2>"
                "<ul>"
                "<li>☐ Click a team member's avatar</li>"
                "<li>☐ Click Promote to Leader — leadership transfers</li>"
                "<li>☐ Previous leader becomes a regular member</li>"
                "<li>☐ Only current leader or BA lead can promote</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-emails",
            "title": "6. Email Notifications",
            "order": 5,
            "description": (
                "<h2>Prerequisites</h2>"
                "<p>Enable email testing mode in Admin &gt; Email. Set yourself as the "
                "test user. All emails will be redirected to you.</p>"
                "<h2>Email Triggers</h2>"
                "<ul>"
                "<li>☐ <strong>Document approved:</strong> Approve a document — email sent to relevant parties</li>"
                "<li>☐ <strong>Document sent back:</strong> Send back a document — email sent to author</li>"
                "<li>☐ <strong>Document recalled:</strong> Recall a document — email sent to relevant parties</li>"
                "<li>☐ <strong>New cycle opened:</strong> Open a new reporting cycle — email sent to all project leads</li>"
                "<li>☐ <strong>Mention in comment:</strong> @mention a user in a project comment — email sent to mentioned user</li>"
                "</ul>"
                "<h2>Email Content Verification</h2>"
                "<ul>"
                "<li>☐ Emails contain the DBCA logo (inline CID image)</li>"
                "<li>☐ Recipient name is correct</li>"
                "<li>☐ Project/document details are correct</li>"
                "<li>☐ Links in emails navigate to the correct pages</li>"
                "<li>☐ Email renders correctly in Outlook (check .eml preview)</li>"
                "<li>☐ Colour bar and gradient accents display correctly</li>"
                "</ul>"
                "<h2>Test Email</h2>"
                "<ul>"
                "<li>☐ Navigate to Admin &gt; Email Testing</li>"
                "<li>☐ Click Send Test Email — email arrives at test user</li>"
                "<li>☐ Click Send All Test Emails — all template previews are sent</li>"
                "<li>☐ Review each template for formatting issues</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-dashboard",
            "title": "7. Dashboard",
            "order": 6,
            "description": (
                "<h2>Dashboard Cards</h2>"
                "<ul>"
                "<li>☐ Dashboard loads after login</li>"
                "<li>☐ My Tasks card shows correct count of pending tasks</li>"
                "<li>☐ Endorsement Tasks card shows correct count</li>"
                "<li>☐ My Projects card shows your projects</li>"
                "<li>☐ Admin Tasks card visible for admins only</li>"
                "<li>☐ Click each card — navigates to correct section</li>"
                "</ul>"
                "<h2>Navigation</h2>"
                "<ul>"
                "<li>☐ Sidebar navigation works on desktop</li>"
                "<li>☐ Header navigation works (all dropdown menus)</li>"
                "<li>☐ Avatar menu (Navitar) opens and all links work</li>"
                "<li>☐ Knowledge Base link works from dashboard, header, and Navitar</li>"
                "<li>☐ Breadcrumbs display correctly on all pages</li>"
                "</ul>"
                "<h2>Responsive Design</h2>"
                "<ul>"
                "<li>☐ Dashboard renders correctly on mobile (narrow viewport)</li>"
                "<li>☐ Dashboard renders correctly on tablet</li>"
                "<li>☐ Dashboard renders correctly on desktop</li>"
                "<li>☐ Navigation collapses appropriately on mobile</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-reports",
            "title": "8. Reports & Annual Reporting",
            "order": 7,
            "description": (
                "<h2>Published Reports</h2>"
                "<ul>"
                "<li>☐ Navigate to Reports — published reports load</li>"
                "<li>☐ Official tab shows published PDFs</li>"
                "<li>☐ Drafts tab shows draft reports</li>"
                "<li>☐ Legacy tab shows legacy reports</li>"
                "<li>☐ Download a published PDF — file downloads correctly</li>"
                "</ul>"
                "<h2>Latest Report (Admin/Key Stakeholder)</h2>"
                "<ul>"
                "<li>☐ Navigate to Report Details</li>"
                "<li>☐ Pending tab shows pending entries</li>"
                "<li>☐ Approved tab shows approved entries</li>"
                "<li>☐ Media tab allows uploading cover images</li>"
                "<li>☐ Print Preview tab renders the report correctly</li>"
                "</ul>"
                "<h2>My Business Area (BA Lead)</h2>"
                "<ul>"
                "<li>☐ Navigate to My Business Area</li>"
                "<li>☐ Business area details display correctly</li>"
                "<li>☐ Unapproved tab shows unapproved documents</li>"
                "<li>☐ Problematic tab shows problematic projects</li>"
                "<li>☐ Edit business area details — saves correctly</li>"
                "</ul>"
                "<h2>My Division (Key Stakeholder)</h2>"
                "<ul>"
                "<li>☐ Navigate to My Division</li>"
                "<li>☐ Division overview loads with business areas</li>"
                "<li>☐ Email list generation works</li>"
                "</ul>"
                "<h2>Batch Approvals</h2>"
                "<ul>"
                "<li>☐ Navigate to Batch Approve</li>"
                "<li>☐ Select multiple documents</li>"
                "<li>☐ Click Approve Selected — all selected documents approved</li>"
                "<li>☐ Batch Approve Old Reports works similarly</li>"
                "</ul>"
                "<h2>New Reporting Cycle</h2>"
                "<ul>"
                "<li>☐ Navigate to Open New Cycle</li>"
                "<li>☐ Review cycle details</li>"
                "<li>☐ Confirm — new cycle opens (test in staging only!)</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-admin",
            "title": "9. Administration",
            "order": 8,
            "description": (
                "<h2>Data Lists</h2>"
                "<ul>"
                "<li>☐ Navigate to Admin &gt; Data Lists</li>"
                "<li>☐ <strong>Branches:</strong> List loads, create/edit/delete works</li>"
                "<li>☐ <strong>Divisions:</strong> List loads, create/edit/delete works, key stakeholder assignment works</li>"
                "<li>☐ <strong>Business Areas:</strong> List loads, create works, edit works (including leader assignment), delete works</li>"
                "<li>☐ <strong>Services:</strong> List loads, create/edit/delete works</li>"
                "<li>☐ <strong>Locations:</strong> List loads, create/edit/delete works</li>"
                "<li>☐ <strong>Affiliations:</strong> List loads, create/edit/delete works, merge duplicates works, clean orphaned works</li>"
                "<li>☐ <strong>Addresses:</strong> List loads, create/edit/delete works</li>"
                "</ul>"
                "<h2>Admin Tasks</h2>"
                "<ul>"
                "<li>☐ Delete Project request: user submits request → appears in admin tasks → approve → project deleted</li>"
                "<li>☐ Delete Project request: reject → project remains, request cancelled</li>"
                "<li>☐ Merge Users request: approve → users merged, secondary user deleted</li>"
                "<li>☐ Set Caretaker request: approve → caretaker relationship created</li>"
                "<li>☐ Cancel a pending request — request is cancelled</li>"
                "</ul>"
                "<h2>Email Configuration</h2>"
                "<ul>"
                "<li>☐ Navigate to Admin &gt; Email</li>"
                "<li>☐ Toggle email mode (Enabled/Admin/Disabled) — saves correctly</li>"
                "<li>☐ Enable testing mode — set test user — saves correctly</li>"
                "<li>☐ Disable testing mode — saves correctly</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-knowledge-base",
            "title": "10. Knowledge Base",
            "order": 9,
            "description": (
                "<h2>Landing Page</h2>"
                "<ul>"
                "<li>☐ Navigate to /guide — knowledge base loads</li>"
                "<li>☐ Hero section with search bar displays</li>"
                "<li>☐ Category cards display with correct icons and article counts</li>"
                "<li>☐ Cards are clickable — navigate to category detail</li>"
                "<li>☐ Hover animation works on cards</li>"
                "</ul>"
                "<h2>Category Detail</h2>"
                "<ul>"
                "<li>☐ Click a category — article accordions load</li>"
                "<li>☐ Expand an article — content displays correctly</li>"
                "<li>☐ Back button returns to landing page</li>"
                "<li>☐ URL updates to /guide/{category-slug}</li>"
                "</ul>"
                "<h2>Search</h2>"
                "<ul>"
                "<li>☐ Type in search bar — loading spinner appears briefly</li>"
                "<li>☐ Results appear grouped by category</li>"
                "<li>☐ Matching text is highlighted</li>"
                "<li>☐ Click a result — navigates to the category</li>"
                "<li>☐ Search for non-existent term — 'No articles found' message</li>"
                "</ul>"
                "<h2>Role-Based Visibility</h2>"
                "<ul>"
                "<li>☐ As regular user: only 'all' sections visible (6 categories)</li>"
                "<li>☐ As BA lead: BA Management section also visible</li>"
                "<li>☐ As key stakeholder: Reports section also visible</li>"
                "<li>☐ As admin: all sections visible including Admin and E2E Testing</li>"
                "<li>☐ Role badges display on restricted sections</li>"
                "</ul>"
                "<h2>Admin Editing</h2>"
                "<ul>"
                "<li>☐ As admin: Edit Knowledge Base button visible</li>"
                "<li>☐ As non-admin: Edit button NOT visible</li>"
                "<li>☐ Enter edit mode — section editors appear</li>"
                "<li>☐ Edit a section title — saves correctly</li>"
                "<li>☐ Edit a section description — saves correctly</li>"
                "<li>☐ Change a section icon — saves correctly</li>"
                "<li>☐ Add a new article — appears in the section</li>"
                "<li>☐ Edit article content with rich text editor — saves correctly</li>"
                "<li>☐ Insert an image via URL in the editor — displays correctly</li>"
                "<li>☐ Reorder sections (up/down arrows) — order persists</li>"
                "<li>☐ Reorder articles — order persists</li>"
                "<li>☐ Delete an article — removed from section</li>"
                "<li>☐ Delete a section — section and all articles removed</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-staff-profiles",
            "title": "11. Staff Directory & Profiles",
            "order": 10,
            "description": (
                "<h2>Staff Directory</h2>"
                "<ul>"
                "<li>☐ Navigate to Staff Directory — page loads (public, no auth required)</li>"
                "<li>☐ Search for a staff member — results filter</li>"
                "<li>☐ Pagination works</li>"
                "<li>☐ Click a staff card — navigates to profile detail</li>"
                "</ul>"
                "<h2>Staff Profile Detail</h2>"
                "<ul>"
                "<li>☐ Overview tab shows about, expertise, key interests</li>"
                "<li>☐ Projects tab shows the staff member's projects</li>"
                "<li>☐ CV tab shows employment and qualifications</li>"
                "<li>☐ Publications tab loads</li>"
                "<li>☐ Edit button visible only for the profile owner</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-comments",
            "title": "12. Comments & Reactions",
            "order": 11,
            "description": (
                "<h2>Project Comments</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's document tab</li>"
                "<li>☐ Comment section is visible</li>"
                "<li>☐ Type a comment with rich text formatting — submit</li>"
                "<li>☐ Comment appears in the list</li>"
                "<li>☐ @mention a user in a comment — mention is highlighted</li>"
                "<li>☐ @mentioned user receives an email notification</li>"
                "<li>☐ Edit your own comment — saves correctly</li>"
                "<li>☐ Delete your own comment — removed from list</li>"
                "<li>☐ Admin can delete any comment</li>"
                "</ul>"
                "<h2>Reactions</h2>"
                "<ul>"
                "<li>☐ Click the reaction picker on a comment</li>"
                "<li>☐ Select a reaction — appears on the comment</li>"
                "<li>☐ Click the same reaction again — removes it</li>"
                "<li>☐ Multiple users can react to the same comment</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-final-checks",
            "title": "13. Final Checks",
            "order": 12,
            "description": (
                "<h2>Cross-Browser</h2>"
                "<ul>"
                "<li>☐ Test in Google Chrome — all features work</li>"
                "<li>☐ Test in Mozilla Firefox — all features work</li>"
                "<li>☐ Test in Microsoft Edge — all features work</li>"
                "</ul>"
                "<h2>Performance</h2>"
                "<ul>"
                "<li>☐ Dashboard loads within 3 seconds</li>"
                "<li>☐ Project list loads within 3 seconds</li>"
                "<li>☐ Knowledge base loads within 2 seconds</li>"
                "<li>☐ No visible layout shifts during page load</li>"
                "</ul>"
                "<h2>Accessibility</h2>"
                "<ul>"
                "<li>☐ Tab navigation works through all interactive elements</li>"
                "<li>☐ Focus indicators are visible</li>"
                "<li>☐ Screen reader announces page titles and headings</li>"
                "<li>☐ Colour contrast meets WCAG AA standards</li>"
                "</ul>"
                "<h2>Dark Mode</h2>"
                "<ul>"
                "<li>☐ Toggle dark mode — all pages render correctly</li>"
                "<li>☐ No white flashes or unreadable text in dark mode</li>"
                "<li>☐ Charts and images are visible in dark mode</li>"
                "</ul>"
                "<h2>Sign-Off</h2>"
                "<p>Once all items above are checked, the release is ready for "
                "deployment. Document any issues found and their resolution before "
                "proceeding.</p>"
            ),
        },
    ]


# ─── Article getter mapping ───────────────────────────────────────────────────

ARTICLE_GETTERS = {
    "getting-started": get_getting_started_articles,
    "dashboard": get_dashboard_articles,
    "projects": get_projects_articles,
    "documents": get_documents_articles,
    "team-management": get_team_management_articles,
    "account-profile": get_account_profile_articles,
    "business-area": get_business_area_articles,
    "reports": get_reports_articles,
    "admin": get_admin_articles,
    "e2e-testing": get_e2e_testing_articles,
}


class Command(BaseCommand):
    help = "Seed the Knowledge Base with comprehensive SPMS guide content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing guide sections and content fields before seeding.",
        )

    @staticmethod
    def _transform_checkboxes(html: str) -> str:
        """Convert ☐ bullet items into Lexical-compatible checklist HTML.

        Lexical checklists use:
        <ul __lexicallisttype="check">
          <li role="checkbox" tabindex="-1" aria-checked="false">text</li>
        </ul>
        """
        import re

        # First, find <ul> blocks that contain ☐ items and convert them
        def replace_checklist_ul(match: re.Match) -> str:
            inner = match.group(1)
            # Check if this ul contains any ☐ items
            if "☐" not in inner:
                return match.group(0)
            # Convert each <li>☐ text</li> to checklist format
            inner = re.sub(
                r"<li>☐\s*(.*?)</li>",
                r'<li role="checkbox" tabindex="-1" aria-checked="false">\1</li>',
                inner,
            )
            return f'<ul __lexicallisttype="check">{inner}</ul>'

        return re.sub(r"<ul>(.*?)</ul>", replace_checklist_ul, html, flags=re.DOTALL)

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing knowledge base content...")
            ContentField.objects.all().delete()
            GuideSection.objects.all().delete()
            self.stdout.write(self.style.WARNING("All content cleared."))

        self.stdout.write("Seeding knowledge base sections...")

        for section_data in SECTIONS:
            section_id = section_data["id"]
            section, created = GuideSection.objects.update_or_create(
                id=section_id,
                defaults=section_data,
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action}: {section.title}")

            # Seed articles for this section
            getter = ARTICLE_GETTERS.get(section_id)
            if getter:
                articles = getter()
                for article_data in articles:
                    field_key = article_data["field_key"]
                    description = self._transform_checkboxes(
                        article_data["description"]
                    )
                    ContentField.objects.update_or_create(
                        section=section,
                        field_key=field_key,
                        defaults={
                            "title": article_data["title"],
                            "description": description,
                            "order": article_data["order"],
                        },
                    )
                self.stdout.write(f"    -> {len(articles)} article(s)")

        total_sections = GuideSection.objects.count()
        total_articles = ContentField.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {total_sections} sections, {total_articles} articles."
            )
        )
