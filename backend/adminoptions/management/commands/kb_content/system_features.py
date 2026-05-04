"""System Features section — visible to all users."""

from .helpers import screenshot


def get_system_features_articles():
    """Articles for the System Features section."""
    return [
        {
            "field_key": "caretakers",
            "title": "Caretakers",
            "order": 0,
            "description": (
                "<h2>What is a Caretaker?</h2>"
                "<p>A caretaker is a DBCA staff member who can act on your behalf "
                "when you are unavailable — for example, during leave, resignation, "
                "or other absence. When a caretaker is assigned to you, they can:</p>"
                "<ul>"
                "<li>Approve documents on your behalf.</li>"
                "<li>Manage your projects.</li>"
                "<li>Perform actions that would normally require your role.</li>"
                "</ul>"
                "<p>All caretaker requests require administrator approval for security "
                "and accountability.</p>"
                f"{screenshot('Caretaker Mode tab on My Profile showing request form')}"
                "<h2>Requesting a Caretaker</h2>"
                "<ol>"
                "<li>Navigate to <strong>My Profile → Caretaker Mode</strong> tab.</li>"
                "<li>In the <strong>My Caretaker</strong> section, search for the "
                "person you want as your caretaker.</li>"
                "<li>Submit the request.</li>"
                "<li>An administrator will review and approve or reject the request.</li>"
                "</ol>"
                "<h2>Managing Caretaker Relationships</h2>"
                "<p>The Caretaker Mode tab shows:</p>"
                "<ul>"
                "<li><strong>My Caretaker:</strong> Your current active caretaker, "
                "or a form to request one.</li>"
                "<li><strong>Outgoing Request:</strong> Any pending caretaker request "
                "you have made (you can cancel it here).</li>"
                "<li><strong>Incoming Request:</strong> If someone has asked you to be "
                "their caretaker.</li>"
                "<li><strong>My Caretakees:</strong> Users you are currently caretaking "
                "for.</li>"
                "</ul>"
                "<h2>Caretaker Notifications</h2>"
                "<p>When you have active caretakers, a notification banner appears on "
                "your dashboard showing who is caretaking for you.</p>"
            ),
        },
        {
            "field_key": "merge-requests",
            "title": "Merge Requests",
            "order": 1,
            "description": (
                "<h2>What is a Merge Request?</h2>"
                "<p>If a user has duplicate accounts in SPMS (for example, an external "
                "user account and a staff account for the same person), an administrator "
                "can merge them into a single account.</p>"
                "<h2>How to Request a Merge</h2>"
                "<p>Contact an SPMS administrator and provide the details of both "
                "accounts. The administrator will review the request and, if approved, "
                "merge the accounts — transferring all project memberships and documents "
                "to the primary account.</p>"
                "<p><strong>Note:</strong> Merged accounts cannot be easily separated "
                "again, so administrators review each request carefully.</p>"
            ),
        },
        {
            "field_key": "project-deletion",
            "title": "Project Deletion",
            "order": 2,
            "description": (
                "<h2>How to Request Project Deletion</h2>"
                "<p>If a project was created in error or is no longer needed, you can "
                "request its deletion:</p>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>Click the <strong>Request Deletion</strong> button.</li>"
                "<li>Confirm the request.</li>"
                "</ol>"
                "<p>The request will appear in the administrator's dashboard tasks. "
                "Once approved, the project and all its documents will be permanently "
                "deleted.</p>"
                f"{screenshot('Project detail page showing the deletion request banner')}"
                "<p>You can cancel a pending deletion request from the same banner "
                "that appears on the project page after submitting the request.</p>"
            ),
        },
        {
            "field_key": "endorsement-tasks",
            "title": "Endorsement Tasks",
            "order": 3,
            "description": (
                "<h2>What Are Endorsement Tasks?</h2>"
                "<p>Endorsement tasks appear when a project plan requires endorsement "
                "from specific committees or roles before it can progress through the "
                "approval workflow. There are three types:</p>"
                "<ul>"
                "<li><strong>AEC (Animal Ethics Committee):</strong> Required when a "
                "project involves animal research.</li>"
                "<li><strong>BM (Biometric):</strong> Required when a project involves "
                "biometric data collection.</li>"
                "<li><strong>HC (Heritage Council):</strong> Required when a project "
                "may affect heritage sites.</li>"
                "</ul>"
                "<h2>Where to Find Endorsement Tasks</h2>"
                "<p>Endorsement tasks appear on the dashboard in the "
                "<strong>Admin</strong> tab (for administrators) alongside other "
                "admin tasks like caretaker requests and project deletions.</p>"
                "<p>They also appear on the project plan itself, showing which "
                "endorsements have been completed and which are still pending.</p>"
                f"{screenshot('Dashboard Admin tab showing endorsement tasks')}"
            ),
        },
        {
            "field_key": "data-catalogue",
            "title": "Data Catalogue",
            "order": 4,
            "description": (
                "<h2>DBCA Data Catalogue</h2>"
                "<p>The DBCA Data Catalogue is an external system that provides access "
                "to DBCA's scientific datasets. It is linked from the SPMS dashboard "
                "under <strong>External Resources</strong>.</p>"
                "<p>Visit <strong>data.bio.wa.gov.au</strong> to browse available "
                "datasets. The Data Catalogue is separate from SPMS — it has its own "
                "login and interface.</p>"
            ),
        },
    ]
