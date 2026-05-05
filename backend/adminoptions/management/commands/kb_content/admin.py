"""Administration section — visible to admins only."""

from .helpers import screenshot


def get_admin_articles():
    """Articles for the Administration section."""
    return [
        {
            "field_key": "admin-overview",
            "title": "Administration Overview",
            "order": 0,
            "description": (
                "<h2>Admin Features</h2>"
                "<p>As an administrator, you have access to system-wide management "
                "features. These are accessible from the <strong>Manage</strong> "
                "dropdown in the header navigation.</p>"
                "<p>Admin features include:</p>"
                "<ul>"
                "<li><strong>Data Lists:</strong> View unapproved documents and "
                "problematic projects that need attention, with tools to remedy "
                "common issues.</li>"
                "<li><strong>Approvers:</strong> Manage divisional key stakeholders "
                "and approvers for the document approval workflow.</li>"
                "<li><strong>Communications:</strong> Manage the homepage banner, "
                "send announcements, test email delivery, and document "
                "PDF generation.</li>"
                "<li><strong>Reference Data:</strong> Manage branches, divisions, "
                "business areas, services, locations, affiliations, and addresses.</li>"
                "<li><strong>Report Info:</strong> Manage annual report metadata.</li>"
                "<li><strong>Open New Cycle:</strong> Start a new annual reporting cycle.</li>"
                "</ul>"
                f"{screenshot('Manage dropdown in the header showing admin menu items')}"
            ),
        },
        {
            "field_key": "data-lists-overview",
            "title": "Data Lists",
            "order": 1,
            "description": (
                "<h2>Data Lists</h2>"
                "<p>The Data Lists page (<strong>Manage → Data Lists</strong>) provides "
                "two tabs for monitoring project health across the system. Each tab "
                "shows a count badge so you can see issues at a glance.</p>"
                "<h3>Unapproved Documents</h3>"
                "<p>Shows all projects from the current financial year that are still "
                "in <em>New</em> or <em>Pending</em> status and have not completed "
                "the approval workflow. Project titles link directly to the project "
                "detail page. The table is sortable by title, kind, status, and "
                "business area.</p>"
                "<h3>Problematic Projects</h3>"
                "<p>Shows projects with data quality issues across eight categories:</p>"
                "<ul>"
                "<li><strong>No Progress Updates:</strong> Projects with progress or "
                "student reports created this FY that are still in <em>New</em> status "
                "(never submitted for review).</li>"
                "<li><strong>Inactive Leaders:</strong> Active projects where the "
                "project leader's account has been deactivated. Use the "
                "<em>Download TXT List</em> button to export these for follow-up.</li>"
                "<li><strong>Open with Closure:</strong> Projects that have an approved "
                "closure document but are still in an active state. Use the "
                "<em>Remedy</em> button to set them to the correct status.</li>"
                "<li><strong>No Business Area:</strong> Active projects without a "
                "business area assigned.</li>"
                "<li><strong>No Members:</strong> Active projects with zero team "
                "members. Remedy adds the first document's creator as leader.</li>"
                "<li><strong>No Leader:</strong> Projects with members but no one "
                "assigned the leader role. Remedy assigns the supervising role.</li>"
                "<li><strong>Multiple Leaders:</strong> Projects with more than one "
                "leader. Remedy keeps one and reassigns others.</li>"
                "<li><strong>External Leaders:</strong> Projects led by non-staff "
                "users. Remedy promotes a staff member to leader.</li>"
                "</ul>"
                "<p>Each section is collapsible — click the chevron to expand or "
                "collapse. Sections with issues show a <em>Remedy</em> button that "
                "opens a confirmation dialog before making changes.</p>"
                f"{screenshot('Data Lists page showing problematic projects with remedy buttons')}"
            ),
        },
        {
            "field_key": "approvers-overview",
            "title": "Divisional Approvers",
            "order": 2,
            "description": (
                "<h2>Divisional Approvers</h2>"
                "<p>The Approvers page (<strong>Manage → Approvers</strong>) manages "
                "who can perform stage 3 (directorate) approval actions on documents "
                "for each division.</p>"
                "<p>Divisions are listed alphabetically. Each division card shows:</p>"
                "<ul>"
                "<li><strong>Key Stakeholder:</strong> A single user who can approve "
                "documents and has AR admin privileges for the division. Click "
                "<em>Edit</em> to assign or change the key stakeholder.</li>"
                "<li><strong>Approvers:</strong> Additional users who can approve "
                "documents at the directorate level. Click <em>Manage</em> to add "
                "or remove approvers.</li>"
                "</ul>"
                "<p><strong>Important:</strong> Divisions without a key stakeholder "
                "are disabled in division selectors throughout the system (e.g. the "
                "Open New Cycle page, report pages). This ensures projects are not "
                "created under divisions where no one can perform directorate "
                "approval.</p>"
                "<p>Business area selectors in the project creation wizard and edit "
                "form also filter out business areas belonging to divisions without "
                "approvers or a key stakeholder.</p>"
                f"{screenshot('Approvers page showing division cards with key stakeholder and approvers')}"
            ),
        },
        {
            "field_key": "admin-tasks",
            "title": "Admin Tasks",
            "order": 3,
            "description": (
                "<h2>Dashboard Admin Tasks</h2>"
                "<p>Admin tasks appear on your dashboard in the <strong>Admin</strong> "
                "tab when users request actions that require administrator approval:</p>"
                "<ul>"
                "<li><strong>Set Caretaker:</strong> A user has requested a caretaker "
                "to act on their behalf. Review the request and approve or reject it.</li>"
                "<li><strong>Delete Project:</strong> A user has requested that a project "
                "be deleted. Review the project and approve or reject the deletion.</li>"
                "<li><strong>Merge Users:</strong> Combine duplicate user accounts into "
                "a single account, transferring all project memberships and documents.</li>"
                "</ul>"
                f"{screenshot('Dashboard Admin tab showing pending admin tasks')}"
                "<p><strong>Important:</strong> Review each request carefully before "
                "approving. Merged users and deleted projects cannot be easily undone.</p>"
                "<h2>Endorsement Tasks</h2>"
                "<p>The Admin tab also shows endorsement tasks (AEC, BM, HC) that "
                "require action. See the <strong>System Features → Endorsement Tasks</strong> "
                "article for details.</p>"
            ),
        },
        {
            "field_key": "admin-testing",
            "title": "Communications Page",
            "order": 4,
            "description": (
                "<h2>Communications Page</h2>"
                "<p>The Communications page (<strong>Manage → Communications</strong>) "
                "provides tools for managing user communications and testing system features. "
                "It has four tabs:</p>"
                "<h3>Banner</h3>"
                "<p>Configure the homepage banner that appears on the dashboard for all "
                "users. Toggle it on, write your message, and save.</p>"
                "<h3>Emails</h3>"
                "<p>Test all email templates by sending them to a designated test user. "
                "Enable <strong>Testing Mode</strong> and select a test user — all "
                "system emails will be redirected to that user. You can then send "
                "individual templates or all templates at once to verify they render "
                "correctly.</p>"
                "<p>Optionally set a <strong>Recipient</strong> and <strong>Actioner</strong> "
                "user to see realistic names in the email content.</p>"
                f"{screenshot('Communications page Emails tab with testing mode enabled')}"
                "<h3>Announcements</h3>"
                "<p>Send announcement emails to selected recipient groups without "
                "opening a new reporting cycle. See the dedicated article below.</p>"
                "<h3>Documents</h3>"
                "<p>Generate test PDFs for each document type (Concept Plan, Project "
                "Plan, Progress Report, Student Report, Project Closure) using mock "
                "data. Useful for verifying PDF template changes without needing real "
                "project data.</p>"
                f"{screenshot('Communications page Documents tab with PDF generation controls')}"
            ),
        },
        {
            "field_key": "admin-announcements",
            "title": "Sending Announcements",
            "order": 5,
            "description": (
                "<h2>Sending Announcements</h2>"
                "<p>The Announcements tab (<strong>Manage → Communications → "
                "Announcements</strong>) lets you send announcement emails to users "
                "without opening a new reporting cycle.</p>"
                "<h3>How to Send an Announcement</h3>"
                "<ol>"
                "<li>Set the <strong>Email Subject</strong> (defaults to "
                "'SPMS: Announcement').</li>"
                "<li>Select recipient groups: Business Area Leads, Project Leads, "
                "and/or Project Team members.</li>"
                "<li>Review the recipient list — you can exclude individual users "
                "by clicking the X next to their name.</li>"
                "<li>Write your announcement message using the rich text editor.</li>"
                "<li>Preview the email to verify how it will appear.</li>"
                "<li>Click <strong>Send Announcement</strong> and confirm in the "
                "dialog.</li>"
                "</ol>"
                "<p>Recipients are deduplicated by highest role (BA Lead > Project "
                "Lead > Team Member), so no user receives duplicate emails.</p>"
                f"{screenshot('Announcements tab showing recipient selection and message editor')}"
                "<p><strong>Note:</strong> When email testing mode is enabled, "
                "announcement emails are also redirected to the test user.</p>"
            ),
        },
        {
            "field_key": "admin-homepage-banner",
            "title": "Homepage Banner",
            "order": 6,
            "description": (
                "<h2>Homepage Banner</h2>"
                "<p>The Banner tab (<strong>Manage → Communications → Banner</strong>) "
                "lets you display a message on the dashboard for all users.</p>"
                "<h3>Setting Up the Banner</h3>"
                "<ol>"
                "<li>Toggle <strong>Show Banner</strong> on.</li>"
                "<li>Write your message using the rich text editor. You can use "
                "bold, italic, links, and bullet points.</li>"
                "<li>Click <strong>Save</strong>.</li>"
                "</ol>"
                "<p>The banner appears below the welcome message on the dashboard, "
                "above the Quick Actions section. All authenticated users see it.</p>"
                f"{screenshot('Homepage banner displayed on the dashboard below the welcome message')}"
                "<h3>Disabling the Banner</h3>"
                "<p>Toggle <strong>Show Banner</strong> off and save. The banner "
                "disappears immediately for all users.</p>"
                "<p><strong>Tip:</strong> Use the banner for time-sensitive "
                "announcements like system maintenance windows, deadline reminders, "
                "or new feature introductions.</p>"
            ),
        },
    ]
