"""Searching & Navigation section — visible to all users."""

from .helpers import screenshot


def get_searching_navigation_articles():
    """Articles for the Searching & Navigation section."""
    return [
        {
            "field_key": "searching-projects-users",
            "title": "Searching Projects and Users",
            "order": 0,
            "description": (
                "<h2>Searching Projects</h2>"
                "<p>Navigate to <strong>Projects</strong> from the sidebar to browse "
                "all projects in SPMS.</p>"
                "<h3>Filters</h3>"
                "<p>Use the filters at the top of the page to narrow results:</p>"
                "<ul>"
                "<li><strong>Business Area:</strong> Filter by the responsible business area.</li>"
                "<li><strong>Project Type:</strong> Science Project, Core Function, "
                "External Partnership, or Student Project.</li>"
                "<li><strong>Status:</strong> Active, Suspended, Closed, etc.</li>"
                "<li><strong>Year:</strong> Filter by financial year.</li>"
                "<li><strong>User:</strong> Filter by a specific team member.</li>"
                "<li><strong>Active / Inactive:</strong> Toggle to show only active or "
                "only inactive projects.</li>"
                "</ul>"
                "<p>Use the search bar to find projects by title or keywords. "
                "Ctrl + Click on a project to open it in a new tab while keeping "
                "your filters.</p>"
                f"{screenshot('Projects list page with filters, search bar, and pagination')}"
                "<h3>Saved Search</h3>"
                "<p>Enable <strong>Remember my search</strong> to save your current "
                "search term and filters. When you return to the projects page later, "
                "your previous search will be restored automatically.</p>"
                "<h3>CSV Download (Admin)</h3>"
                "<p>Administrators can download the current filtered project list as "
                "a CSV file using the download button next to the Map button.</p>"
                "<h2>Searching Users</h2>"
                "<p>Navigate to <strong>Users</strong> from the sidebar to browse all "
                "users in SPMS.</p>"
                "<p>Filter users by:</p>"
                "<ul>"
                "<li><strong>Business Area:</strong> Filter by business area.</li>"
                "<li><strong>Role:</strong> All Users, External Only, Staff Only, "
                "BA Lead, Approver, Key Stakeholder, or Admin.</li>"
                "</ul>"
                "<p>Click on a user to see their details in a quick-view panel. "
                "Click <strong>View Full Profile</strong> to see their complete "
                "profile page.</p>"
                f"{screenshot('Users list page with role filter and user detail sheet')}"
            ),
        },
        {
            "field_key": "project-map",
            "title": "Project Map",
            "order": 1,
            "description": (
                "<h2>Viewing the Map</h2>"
                "<p>Navigate to <strong>Projects → Map</strong> from the sidebar to "
                "view projects on an interactive map centred on Western Australia.</p>"
                "<p>Projects with location data are displayed as circular markers. "
                "The marker colour indicates the project's business area. Click a "
                "marker to see project details in a popup.</p>"
                f"{screenshot('Project map with markers, filters, and project count')}"
                "<h2>Filtering on the Map</h2>"
                "<p>The map has its own set of filters:</p>"
                "<ul>"
                "<li><strong>Search:</strong> Search by project title or keywords.</li>"
                "<li><strong>Business Areas:</strong> Filter by one or more business areas.</li>"
                "<li><strong>User:</strong> Filter by a specific team member.</li>"
                "<li><strong>Status:</strong> Filter by project status.</li>"
                "<li><strong>Kind:</strong> Filter by project type.</li>"
                "<li><strong>Year:</strong> Filter by financial year.</li>"
                "<li><strong>Active / Inactive:</strong> Toggle active or inactive projects.</li>"
                "</ul>"
                "<p>The map also supports <strong>Remember my search</strong> to save "
                "your filters between visits.</p>"
                "<h2>Map Layers</h2>"
                "<p>Use the layer controls to toggle additional map features:</p>"
                "<ul>"
                "<li><strong>Heatmap:</strong> Shows project density as a heat overlay.</li>"
                "<li><strong>Region boundaries:</strong> Displays DBCA region boundaries "
                "as GeoJSON overlays.</li>"
                "</ul>"
                "<h2>Fullscreen Mode</h2>"
                "<p>Click the fullscreen button to expand the map to fill the entire "
                "screen. In fullscreen mode, filters appear in a floating sidebar that "
                "can be minimised to a small button.</p>"
                f"{screenshot('Project map in fullscreen mode with floating filter sidebar')}"
            ),
        },
    ]
