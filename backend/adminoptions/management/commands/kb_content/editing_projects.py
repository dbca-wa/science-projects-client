"""Editing Projects section — visible to all users."""

from .helpers import screenshot


def get_editing_projects_articles():
    """Articles for the Editing Projects section."""
    return [
        {
            "field_key": "editing-projects",
            "title": "Editing a Project",
            "order": 0,
            "description": (
                "<h2>Who Can Edit?</h2>"
                "<p>You can edit a project if you are:</p>"
                "<ul>"
                "<li>The project lead.</li>"
                "<li>A team member with edit permissions.</li>"
                "<li>A caretaker acting on behalf of the project lead.</li>"
                "<li>An administrator.</li>"
                "</ul>"
                "<h2>How to Edit</h2>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>Click <strong>Edit Project</strong>.</li>"
                "<li>Update the fields you need to change — title, summary, keywords, "
                "image, dates, business area, and other details.</li>"
                "<li>Click <strong>Save</strong> when done.</li>"
                "</ol>"
                f"{screenshot('Edit Project form showing editable fields')}"
                "<h2>Unsaved Changes Protection</h2>"
                "<p>If you try to navigate away from the edit page with unsaved changes, "
                "SPMS will warn you and ask if you want to discard your changes or stay "
                "on the page. This prevents accidental data loss.</p>"
            ),
        },
        {
            "field_key": "inviting-team-members",
            "title": "Inviting Team Members",
            "order": 1,
            "description": (
                "<h2>Adding Members to a Project</h2>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>In the <strong>Project Team</strong> section, click "
                "<strong>Invite Member</strong>.</li>"
                "<li>Search for the person by name.</li>"
                "<li>Select the user, assign them a <strong>Project Role</strong>, "
                "set their <strong>Time Allocation</strong> and "
                "<strong>Short Code</strong>.</li>"
                "<li>Click <strong>Add User</strong>.</li>"
                "</ol>"
                f"{screenshot('Invite Member dialog with user search and role selection')}"
                "<p>If the person is not registered in SPMS, you will need to either "
                "invite them (for DBCA staff) or create an external user profile first. "
                "See the <strong>Creating Projects</strong> section for details.</p>"
                "<h2>External Collaborators</h2>"
                "<p><strong>Reminder:</strong> External (non-DBCA) users do not use "
                "SPMS directly. They are added for reference in the annual report only. "
                "They do not need to log in or interact with the system.</p>"
            ),
        },
    ]
