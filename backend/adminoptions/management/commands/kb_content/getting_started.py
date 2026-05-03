"""Getting Started section — visible to all users."""

from .helpers import screenshot


def get_getting_started_articles():
    """Articles for the Getting Started section."""
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
                f"{screenshot('SPMS dashboard — welcome section with quick actions')}"
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
                "You can submit feedback via the <strong>Submit Feedback</strong> card on "
                "the dashboard, which opens an email to the SPMS team. You can also send "
                "a message on Microsoft Teams.</p>"
                "<p>It is recommended to use Google Chrome or Mozilla Firefox for the "
                "optimal SPMS browsing experience.</p>"
            ),
        },
        {
            "field_key": "how-spms-works",
            "title": "How SPMS Works",
            "order": 1,
            "description": (
                "<h2>The Project Lifecycle</h2>"
                "<p>SPMS manages the full lifecycle of science projects:</p>"
                "<ol>"
                "<li><strong>Create a project</strong> using the guided wizard — choose "
                "a project type, enter details, set a location, and add team members.</li>"
                "<li><strong>Write documents</strong> — each project has documents "
                "(Concept Plan, Project Plan, Progress Reports, etc.) that you edit "
                "directly in the browser using the rich text editor.</li>"
                "<li><strong>Submit for approval</strong> — documents progress through "
                "a multi-level approval workflow: Team → Project Lead → Business Area "
                "Lead → Directorate.</li>"
                "<li><strong>Annual reporting</strong> — approved progress reports are "
                "compiled into the annual research activity report.</li>"
                "<li><strong>Close the project</strong> — when work is complete, submit "
                "a closure document (Science Projects) or close immediately (other types).</li>"
                "</ol>"
                f"{screenshot('Project detail page showing document tabs and approval status')}"
                "<h2>User Roles</h2>"
                "<p>Your experience in SPMS depends on your role:</p>"
                "<ul>"
                "<li><strong>All users</strong> can create projects, search, and manage "
                "their own profile.</li>"
                "<li><strong>Project leads</strong> manage their project team and approve "
                "documents at the first level.</li>"
                "<li><strong>Business area leads</strong> review documents and track "
                "projects within their business area.</li>"
                "<li><strong>Key stakeholders</strong> access reports, batch approvals, "
                "and divisional views.</li>"
                "<li><strong>Administrators</strong> manage system data, approve admin "
                "tasks, and configure email settings.</li>"
                "</ul>"
                "<h2>External Users</h2>"
                "<p><strong>Important:</strong> External (non-DBCA) users do not use "
                "SPMS directly. They are added to the system for reference purposes "
                "only — their names appear on project teams and in the annual report. "
                "External users do not need to log in or interact with the system.</p>"
            ),
        },
        {
            "field_key": "final-outputs",
            "title": "Final Outputs — The Annual Report",
            "order": 2,
            "description": (
                "<h2>What is the Annual Report?</h2>"
                "<p>The primary output of SPMS is the annual research activity report. "
                "This document compiles approved progress reports from all active projects "
                "into a single publication that is shared with the public and key "
                "ministers.</p>"
                "<h2>How It Works</h2>"
                "<ol>"
                "<li>At the start of each financial year, an administrator opens a new "
                "reporting cycle.</li>"
                "<li>Project leads write and submit progress reports for their projects.</li>"
                "<li>Reports progress through the approval workflow.</li>"
                "<li>Once approved, reports are included in the annual publication.</li>"
                "<li>Administrators compile the final report with cover images and "
                "publish it as a PDF.</li>"
                "</ol>"
                f"{screenshot('Published Reports page showing official annual reports')}"
                "<h2>Your Role</h2>"
                "<p>As a project team member, your main responsibility is to ensure "
                "your project's progress report is written and submitted for approval "
                "before the reporting deadline. The SPMS team will send reminders as "
                "the deadline approaches.</p>"
            ),
        },
    ]
