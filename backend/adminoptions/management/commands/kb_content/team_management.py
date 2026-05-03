"""Team Management section — visible to all users."""

from .helpers import screenshot


def get_team_management_articles():
    """Articles for the Team Management section."""
    return [
        {
            "field_key": "project-roles",
            "title": "Project Roles",
            "order": 0,
            "description": (
                "<h2>Internal (DBCA Staff) Roles</h2>"
                "<p>Internal DBCA staff members can be assigned one of three roles:</p>"
                "<ul>"
                "<li><strong>Project Leader (Supervising Scientist):</strong> Full "
                "control over the project. Can edit all details, manage the team, "
                "approve documents at the first level, and submit documents for "
                "approval. Each project has exactly one project leader. The project "
                "leader is the primary point of contact and is responsible for "
                "ensuring progress reports are submitted on time.</li>"
                "<li><strong>Science Support (Research Scientist):</strong> Can edit "
                "project documents and view all project details. This is the standard "
                "role for DBCA staff who contribute to the project's scientific work.</li>"
                "<li><strong>Technical Support (Technical Officer):</strong> Can view "
                "project details and contribute to documents. This role is for staff "
                "who provide technical assistance to the project.</li>"
                "</ul>"
                f"{screenshot('Team member dialog showing internal role options')}"
                "<h2>External Roles</h2>"
                "<p>External (non-DBCA) collaborators can be assigned one of these roles. "
                "<strong>External users do not log into SPMS</strong> — they are listed "
                "on the project for reference in the annual report only.</p>"
                "<ul>"
                "<li><strong>External Collaborator:</strong> An external person who "
                "collaborates on the project.</li>"
                "<li><strong>Consulted Peer:</strong> An external person who has been "
                "consulted for the project.</li>"
                "<li><strong>Academic Supervisor:</strong> A university supervisor for "
                "student projects.</li>"
                "<li><strong>Supervised Student:</strong> A student undertaking the "
                "project for a higher degree.</li>"
                "<li><strong>Involved Group:</strong> An organisation or group involved "
                "in the project.</li>"
                "</ul>"
                "<h2>Time Allocation</h2>"
                "<p>Each team member has a <strong>Time Allocation</strong> field "
                "expressed as a fraction of a Full Time Equivalent (FTE). Values range "
                "from 0 to 1, where 1.0 = 210 person-days. Enter the estimated "
                "allocation for the next 12 months.</p>"
                "<h2>Short Code</h2>"
                "<p>The <strong>Short Code</strong> field records the cost code for "
                "the team member's salary on this project. This is allocated by "
                "divisional admin.</p>"
            ),
        },
        {
            "field_key": "promoting-to-lead",
            "title": "Promoting a Team Member to Project Leader",
            "order": 1,
            "description": (
                "<h2>Transferring Project Leadership</h2>"
                "<p>To transfer project leadership to another team member:</p>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>Click on the team member's avatar in the Project Team section.</li>"
                "<li>Click the <strong>Promote to Leader</strong> button.</li>"
                "<li>Confirm the promotion.</li>"
                "</ol>"
                f"{screenshot('Team member dialog showing the Promote to Leader button')}"
                "<p>The previous project leader becomes a regular team member "
                "(Science Support). Only the current project leader, a business area "
                "leader, or an administrator can promote another member.</p>"
                "<p><strong>Note:</strong> Only internal DBCA staff members can be "
                "promoted to project leader. External collaborators cannot lead "
                "projects.</p>"
            ),
        },
        {
            "field_key": "managing-membership",
            "title": "Managing Team Membership",
            "order": 2,
            "description": (
                "<h2>Adding Members</h2>"
                "<ol>"
                "<li>Navigate to the project's overview page.</li>"
                "<li>In the <strong>Project Team</strong> section, click "
                "<strong>Invite Member</strong>.</li>"
                "<li>Search for the person by name.</li>"
                "<li>Select the user, assign them a role, set their time allocation "
                "and short code.</li>"
                "<li>Click <strong>Add User</strong>.</li>"
                "</ol>"
                f"{screenshot('Invite Member dialog with user search and role selection')}"
                "<p>If the person is not registered in SPMS, you will need to either "
                "invite them (for DBCA staff via <strong>Users → Invite DBCA User</strong>) "
                "or create an external user profile first (via <strong>Users → Add User</strong>).</p>"
                "<h2>Editing Members</h2>"
                "<p>Click on a team member's avatar in the Project Team section to:</p>"
                "<ul>"
                "<li><strong>Change their role:</strong> Update their project role.</li>"
                "<li><strong>Change time allocation:</strong> Update the FTE fraction.</li>"
                "<li><strong>Update short code:</strong> Change the cost code.</li>"
                "<li><strong>Remove from project:</strong> Remove the member from "
                "the project team.</li>"
                "</ul>"
                f"{screenshot('Team member edit dialog with role, time allocation, and remove options')}"
                "<h2>Member Ordering</h2>"
                "<p>Team members are displayed in order of their position number. "
                "The project leader always appears first. You can adjust the order "
                "by changing the position value for each member.</p>"
            ),
        },
        {
            "field_key": "lead-responsibilities",
            "title": "Project Leader Responsibilities",
            "order": 3,
            "description": (
                "<h2>What Does a Project Leader Do?</h2>"
                "<p>As a project leader, you are responsible for:</p>"
                "<ul>"
                "<li><strong>Managing the team:</strong> Adding and removing members, "
                "assigning roles, and setting time allocations.</li>"
                "<li><strong>Document approval:</strong> You are the first approver in "
                "the document workflow. When a team member submits a document, it comes "
                "to you first.</li>"
                "<li><strong>Progress reporting:</strong> Ensuring progress reports are "
                "written and submitted before the annual reporting deadline.</li>"
                "<li><strong>Project editing:</strong> Keeping project details up to date "
                "(title, summary, dates, image, etc.).</li>"
                "<li><strong>Project closure:</strong> Initiating the closure process "
                "when the project is complete.</li>"
                "</ul>"
                "<h2>Delegation</h2>"
                "<p>If you are unavailable, you can request a caretaker to act on your "
                "behalf. See the <strong>System Features → Caretakers</strong> article "
                "for details.</p>"
                "<h2>Who Can Be a Project Leader?</h2>"
                "<p>Only internal DBCA staff members with the "
                "<strong>Project Leader (Supervising Scientist)</strong> role can lead "
                "projects. External collaborators and students cannot be project leaders.</p>"
            ),
        },
    ]
