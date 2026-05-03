"""Creating Projects section — visible to all users."""

from .helpers import screenshot


def get_creating_projects_articles():
    """Articles for the Creating Projects section."""
    return [
        {
            "field_key": "wizard-walkthrough",
            "title": "Creating a Project — Wizard Walkthrough",
            "order": 0,
            "description": (
                "<h2>Starting the Wizard</h2>"
                "<p>Navigate to <strong>Projects → Create New Project</strong> from "
                "the sidebar. You will see four project type cards:</p>"
                "<ul>"
                "<li><strong>Science Project:</strong> A discrete body of DBCA-led "
                "scientific work with a defined period. Requires approval through SPMS, "
                "annual progress reporting, and a full closure form.</li>"
                "<li><strong>Core Function:</strong> An ongoing body of scientific work "
                "that supports biodiversity science and conservation. Requires approval "
                "by the Executive Director and annual progress reporting.</li>"
                "<li><strong>Student Project:</strong> A project undertaken by a student "
                "for a higher degree with a DBCA staff member as co-supervisor.</li>"
                "<li><strong>External Partnership:</strong> A formal collaborative "
                "scientific partnership with external organisations.</li>"
                "</ul>"
                "<p><strong>Important:</strong> You cannot change the project type after "
                "creation. If you need to change it, you must request that the project "
                "be deleted by an administrator and create a new one.</p>"
                f"{screenshot('Project type selection cards — Science, Core Function, Student, External')}"
                "<h2>Step 1: Base Information</h2>"
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
                f"{screenshot('Wizard Step 1 — Base Information with title, keywords, summary, and image')}"
                "<h2>Step 2: Project Details</h2>"
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
                "<h2>Step 3: Location</h2>"
                "<p>Enter the DBCA Region(s) or District(s), IBRA or IMCRA bioregion(s), "
                "and NRM region(s) where the project will be undertaken.</p>"
                f"{screenshot('Wizard Step 3 — Location with region and bioregion selectors')}"
                "<h2>Step 4: Type-Specific Details</h2>"
                "<p>Depending on the project type, you may see additional fields:</p>"
                "<ul>"
                "<li><strong>External Partnership:</strong> Collaboration details, "
                "partner organisations, and budget information.</li>"
                "<li><strong>Student Project:</strong> Student details, university, "
                "degree level, and supervisor information.</li>"
                "</ul>"
                "<h2>Preview Panel</h2>"
                "<p>Use the <strong>Form / Preview</strong> toggle in the top-right "
                "corner to switch between the form and a preview of how your project "
                "will look. This helps you review your entries before submitting.</p>"
                "<h2>Draft Saving</h2>"
                "<p>Your progress is automatically saved as a draft. If you leave the "
                "wizard and come back later, your work will be restored. Drafts are "
                "saved both locally in your browser and on the server, so you can "
                "continue from any device.</p>"
                "<p>Click <strong>Create</strong> on the final step to register the "
                "project in SPMS.</p>"
            ),
        },
        {
            "field_key": "adding-external-users",
            "title": "Adding External Users",
            "order": 1,
            "description": (
                "<h2>What Are External Users?</h2>"
                "<p><strong>Important:</strong> External (non-DBCA) users do not use "
                "SPMS directly. They are added to the system so their names appear on "
                "project teams and in the annual report. External users do not need to "
                "log in or interact with the system.</p>"
                "<h2>How to Add an External User</h2>"
                "<ol>"
                "<li>First, search existing users to check if the collaborator is "
                "already registered.</li>"
                "<li>If not found, navigate to <strong>Users → Add User</strong>.</li>"
                "<li>Fill in the collaborator's details (name, email, affiliation).</li>"
                "<li>Click <strong>Create</strong>.</li>"
                "</ol>"
                f"{screenshot('Add External User form with name, email, and affiliation fields')}"
                "<p>Once the user profile exists, you can add them to a project team "
                "using the standard team management process.</p>"
            ),
        },
        {
            "field_key": "inviting-dbca-users",
            "title": "Inviting Internal DBCA Users",
            "order": 2,
            "description": (
                "<h2>Inviting a DBCA Staff Member</h2>"
                "<p>If a DBCA colleague does not yet have an SPMS account, you can "
                "invite them directly from the system.</p>"
                "<ol>"
                "<li>Navigate to <strong>Users → Invite DBCA User</strong>.</li>"
                "<li>Search for the person by name or email in the IT Assets "
                "directory.</li>"
                "<li>Select the person from the search results.</li>"
                "<li>Review the confirmation dialog showing their name, email, and "
                "title.</li>"
                "<li>Click <strong>Send Invitation</strong>.</li>"
                "</ol>"
                f"{screenshot('Invite DBCA User page with IT Assets search and confirmation dialog')}"
                "<p>The person will receive an invitation email. Their SPMS account "
                "is created automatically when they first visit the site and log in "
                "with their DBCA credentials.</p>"
                "<p><strong>Note:</strong> If the person has already been invited, "
                "the system will let you know.</p>"
            ),
        },
    ]
