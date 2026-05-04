"""Business Area Management section — visible to BA leads."""

from .helpers import screenshot


def get_business_area_articles():
    """Articles for the Business Area Management section."""
    return [
        {
            "field_key": "my-business-area",
            "title": "My Business Area",
            "order": 0,
            "description": (
                "<h2>Accessing My Business Area</h2>"
                "<p>As a Business Area Lead, navigate to <strong>Reports → "
                "My Business Area</strong> from the header menu.</p>"
                "<p>The page has three tabs:</p>"
                "<ul>"
                "<li><strong>Appearance:</strong> How your business area appears in "
                "the annual report — including the image and introduction text. This "
                "is what the public sees when the annual report is published.</li>"
                "<li><strong>Problematic:</strong> Projects that may need attention "
                "due to missing reports or incomplete information.</li>"
                "<li><strong>Unapproved:</strong> Documents that have not yet completed "
                "the approval workflow and may be blocking the annual report.</li>"
                "</ul>"
                f"{screenshot('My Business Area page showing the three tabs — Appearance, Problematic, Unapproved')}"
                "<h2>Your Responsibilities</h2>"
                "<p>As a Business Area Lead, you are responsible for:</p>"
                "<ul>"
                "<li>Reviewing and approving documents at the Business Area Lead stage "
                "of the approval workflow.</li>"
                "<li>Ensuring all projects in your business area have submitted their "
                "progress reports before the annual reporting deadline.</li>"
                "<li>Following up on problematic projects and unapproved documents.</li>"
                "<li>Keeping your business area's appearance (image and introduction) "
                "up to date for the annual report.</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "unapproved-docs",
            "title": "Unapproved Documents",
            "order": 1,
            "description": (
                "<h2>Reviewing Unapproved Documents</h2>"
                "<p>The <strong>Unapproved</strong> tab shows all documents in your "
                "business area that have not yet completed the approval workflow.</p>"
                "<p>Each row shows:</p>"
                "<ul>"
                "<li>The project name and title.</li>"
                "<li>The document type (Concept Plan, Project Plan, Progress Report, etc.).</li>"
                "<li>The current approval status and which stage it is at.</li>"
                "<li>How long the document has been pending.</li>"
                "</ul>"
                f"{screenshot('Unapproved documents tab showing document list with status and pending duration')}"
                "<h2>Taking Action</h2>"
                "<p>Click on any document to navigate to the project and review it. "
                "If the document is at your approval stage, you can approve it, send "
                "it back for revisions, or recall it.</p>"
                "<p>Use this view regularly — especially as the annual reporting "
                "deadline approaches — to identify bottlenecks and follow up with "
                "project leads who have outstanding documents.</p>"
            ),
        },
        {
            "field_key": "problematic-projects",
            "title": "Problematic Projects",
            "order": 2,
            "description": (
                "<h2>Identifying Problematic Projects</h2>"
                "<p>The <strong>Problematic</strong> tab highlights projects in your "
                "business area that may need attention. A project is flagged as "
                "problematic if it has:</p>"
                "<ul>"
                "<li>Missing progress reports for the current reporting year.</li>"
                "<li>Overdue documents that have been pending for an extended period.</li>"
                "<li>Incomplete project information (missing details, team members, etc.).</li>"
                "</ul>"
                f"{screenshot('Problematic projects tab showing flagged projects with reasons')}"
                "<p>Review these projects regularly to ensure compliance with reporting "
                "requirements. Click on any project to navigate to its detail page and "
                "take corrective action.</p>"
            ),
        },
        {
            "field_key": "editing-ba-details",
            "title": "Editing Business Area Details",
            "order": 3,
            "description": (
                "<h2>Updating Your Business Area</h2>"
                "<p>From the <strong>Appearance</strong> tab, click "
                "<strong>Edit</strong> to update your business area's details.</p>"
                "<h2>Editable Fields</h2>"
                "<ul>"
                "<li><strong>Image:</strong> The image that appears in the annual report "
                "for your business area. Choose an image that represents your area's "
                "work — it will be displayed prominently in the published report.</li>"
                "<li><strong>Introduction:</strong> A brief description of your business "
                "area's focus and activities, written using the rich text editor. This "
                "text appears in the annual report alongside your projects.</li>"
                "</ul>"
                f"{screenshot('Edit Business Area form with image upload and introduction editor')}"
                "<h2>Preview</h2>"
                "<p>After saving, return to the <strong>Appearance</strong> tab to "
                "preview how your business area will look in the annual report. "
                "Changes are saved immediately and will appear in the next annual "
                "report compilation.</p>"
            ),
        },
    ]
