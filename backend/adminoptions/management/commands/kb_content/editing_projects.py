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
            "field_key": "editing-description-inline",
            "title": "Editing the Project Description",
            "order": 1,
            "description": (
                "<h2>Inline Editing</h2>"
                "<p>You can edit the project description directly from the overview "
                "page without opening the full edit form:</p>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>Click on the description text — it becomes editable.</li>"
                "<li>Make your changes using the rich text toolbar (bold, italic, "
                "lists, etc.).</li>"
                "<li>Click <strong>Save</strong> to confirm, or <strong>Cancel</strong> "
                "to discard.</li>"
                "</ol>"
                "<p>This is useful for quick updates without navigating to the full "
                "edit form.</p>"
            ),
        },
    ]
