"""Account & Profile section — visible to all users."""

from .helpers import screenshot


def get_account_profile_articles():
    """Articles for the Account & Profile section."""
    return [
        {
            "field_key": "editing-spms-profile",
            "title": "Editing Your SPMS Profile",
            "order": 0,
            "description": (
                "<h2>Accessing Your Profile</h2>"
                "<p>Click your name or avatar in the top-right corner and select "
                "<strong>My Profile</strong>, or navigate directly to "
                "<code>/users/me</code>.</p>"
                "<p>Your profile page has three tabs: <strong>SPMS Profile</strong>, "
                "<strong>Public Profile</strong> (staff only), and "
                "<strong>Caretaker Mode</strong>.</p>"
                f"{screenshot('My Profile page — SPMS Profile tab with personal information')}"
                "<h2>SPMS Profile Tab</h2>"
                "<p>The SPMS Profile tab shows your internal profile information:</p>"
                "<ul>"
                "<li><strong>Profile section:</strong> Your about text and expertise. "
                "Click <strong>Edit</strong> to open the dedicated profile edit page "
                "where you can update your image, about section, and expertise using "
                "the rich text editor.</li>"
                "<li><strong>Personal Information:</strong> Display name, phone, and "
                "custom title. Click <strong>Edit</strong> to update via a modal.</li>"
                "<li><strong>Membership:</strong> Your branch, business area, and "
                "affiliation. Click <strong>Edit</strong> to update via a modal.</li>"
                "<li><strong>In-App Search Appearance:</strong> Preview of how you "
                "appear in user search results.</li>"
                "<li><strong>Status:</strong> Your account status and role information.</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "public-staff-profile",
            "title": "Public Staff Profile",
            "order": 1,
            "description": (
                "<h2>What is the Public Staff Profile?</h2>"
                "<p>SPMS includes a public-facing staff directory that showcases DBCA "
                "science staff to the public. Your public profile is separate from your "
                "internal SPMS profile.</p>"
                "<h2>Profile Sections</h2>"
                "<ul>"
                "<li><strong>Overview:</strong> Your about section, expertise, and key "
                "interests.</li>"
                "<li><strong>Projects:</strong> Automatically pulled from your SPMS "
                "project memberships.</li>"
                "<li><strong>CV:</strong> Employment history and qualifications.</li>"
                "<li><strong>Publications:</strong> Pulled from the Library API.</li>"
                "</ul>"
                f"{screenshot('Public staff profile page showing overview, projects, CV, and publications tabs')}"
                "<h2>Visibility</h2>"
                "<p>Your staff profile is hidden by default. Toggle visibility from "
                "the <strong>Public Profile</strong> tab on your My Profile page. "
                "We recommend filling out your details before making it visible.</p>"
                "<h2>Rerouted Email</h2>"
                "<p>You can set a custom public email address that appears on your "
                "staff profile instead of your default DBCA email. This is useful if "
                "you prefer to receive public enquiries at a different address.</p>"
                "<h2>Editing</h2>"
                "<p>Navigate to your staff profile page and click the "
                "<strong>Edit</strong> button to enter edit mode. Blue edit buttons "
                "will appear for each editable section (about, expertise, employment, "
                "qualifications).</p>"
            ),
        },
        {
            "field_key": "dark-mode",
            "title": "Dark Mode",
            "order": 2,
            "description": (
                "<h2>Toggling Dark Mode</h2>"
                "<p>SPMS supports a dark colour scheme for comfortable viewing in "
                "low-light environments.</p>"
                "<p>To toggle dark mode:</p>"
                "<ul>"
                "<li>Click your avatar in the top-right corner to open the menu.</li>"
                "<li>Click <strong>Toggle Dark Mode</strong>.</li>"
                "</ul>"
                "<p>Your preference is saved automatically and will persist across "
                "sessions.</p>"
                f"{screenshot('Avatar menu showing the Toggle Dark Mode option')}"
            ),
        },
        {
            "field_key": "submitting-feedback",
            "title": "Submitting Feedback",
            "order": 3,
            "description": (
                "<h2>How to Submit Feedback</h2>"
                "<p>We welcome feedback on SPMS. There are several ways to reach us:</p>"
                "<ul>"
                "<li><strong>Dashboard:</strong> Click the <strong>Submit Feedback</strong> "
                "card on your dashboard. This opens an email to the SPMS team.</li>"
                "<li><strong>Email:</strong> Send an email directly to "
                "<code>ecoinformatics.admin@dbca.wa.gov.au</code>.</li>"
                "<li><strong>Microsoft Teams:</strong> Send a message to the SPMS team "
                "on Teams.</li>"
                "</ul>"
                "<p>When reporting an issue, please include:</p>"
                "<ul>"
                "<li>What you were trying to do.</li>"
                "<li>What happened instead.</li>"
                "<li>The URL of the page where the issue occurred.</li>"
                "<li>A screenshot if possible.</li>"
                "</ul>"
            ),
        },
    ]
