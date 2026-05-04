"""End-to-end testing checklist — admin only."""


def get_e2e_testing_articles():
    """Comprehensive manual testing checklist covering every SPMS feature."""
    preamble = (
        "<p>Use this checklist before each release to verify every feature of SPMS "
        "is working correctly. Work through each section methodically — tick off "
        "each item as you confirm it works. If something fails, note the issue "
        "and report it before proceeding.</p>"
        "<p><strong>Testing environment:</strong> Use a staging/test environment "
        "where possible. For email tests, ensure testing mode is enabled so emails "
        "go to the test user, not real recipients.</p>"
    )
    return [
        {
            "field_key": "e2e-auth-profile",
            "title": "1. Authentication & Profile",
            "order": 0,
            "description": (
                preamble + "<h2>Login / Logout</h2>"
                "<ul>"
                "<li>☐ Navigate to SPMS — redirected to Microsoft SSO login</li>"
                "<li>☐ Log in with valid DBCA credentials — redirected to dashboard</li>"
                "<li>☐ Refresh the page — session persists (not logged out)</li>"
                "<li>☐ Log out via the avatar menu — redirected to login page</li>"
                "<li>☐ Try accessing a protected page while logged out — redirected to login</li>"
                "</ul>"
                "<h2>My Profile — SPMS Tab</h2>"
                "<ul>"
                "<li>☐ Navigate to My Profile — page loads with correct user details</li>"
                "<li>☐ Edit display name via modal — saves correctly</li>"
                "<li>☐ Edit membership via modal — saves correctly</li>"
                "<li>☐ Click Edit on Profile section — navigates to /users/me/profile</li>"
                "<li>☐ Upload a profile picture — image appears after save</li>"
                "<li>☐ Crop the profile picture — cropped version saves correctly</li>"
                "<li>☐ Edit About with rich text editor — saves correctly</li>"
                "<li>☐ Edit Expertise with rich text editor — saves correctly</li>"
                "<li>☐ Navigate away with unsaved changes — blocker dialog appears</li>"
                "</ul>"
                "<h2>My Profile — Public Staff Profile Tab</h2>"
                "<ul>"
                "<li>☐ Navigate to Public Profile tab</li>"
                "<li>☐ Toggle visibility (Show/Hide Staff Profile) — works correctly</li>"
                "<li>☐ Set a rerouted public email — saves correctly</li>"
                "</ul>"
                "<h2>My Profile — Caretaker Mode Tab</h2>"
                "<ul>"
                "<li>☐ Caretaker tab visible on My Profile</li>"
                "<li>☐ Request a caretaker — search works, request submits</li>"
                "<li>☐ View outgoing request — shows pending request with cancel option</li>"
                "<li>☐ Cancel outgoing request — request is cancelled</li>"
                "<li>☐ If caretaker is assigned, caretaker details display correctly</li>"
                "<li>☐ Caretakees table shows users you are caretaking for</li>"
                "<li>☐ Caretaker can perform actions on behalf of the user</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-users",
            "title": "2. Users",
            "order": 1,
            "description": (
                "<h2>User List</h2>"
                "<ul>"
                "<li>☐ Navigate to Users — list loads with all users</li>"
                "<li>☐ Search for a user by name — results filter correctly</li>"
                "<li>☐ Filter by role (External, Staff, BA Lead, etc.) — works</li>"
                "<li>☐ Filter by business area — works</li>"
                "<li>☐ Enable Remember my search — filters persist on return</li>"
                "<li>☐ Click a user — user detail sheet opens</li>"
                "<li>☐ User detail sheet shows correct info (name, email, role, image)</li>"
                "<li>☐ Close the sheet — returns to user list</li>"
                "</ul>"
                "<h2>User Detail Page</h2>"
                "<ul>"
                "<li>☐ Navigate to a user's detail page (/users/:id/details)</li>"
                "<li>☐ All user information displays correctly</li>"
                "<li>☐ Edit button visible for admins only</li>"
                "</ul>"
                "<h2>Create External User</h2>"
                "<ul>"
                "<li>☐ Navigate to Users → Add User</li>"
                "<li>☐ Invite banner links to /users/invite</li>"
                "<li>☐ Fill in required fields (name, email)</li>"
                "<li>☐ Submit — user created successfully</li>"
                "<li>☐ New user appears in user list</li>"
                "</ul>"
                "<h2>Invite DBCA User</h2>"
                "<ul>"
                "<li>☐ Navigate to Users → Invite DBCA User</li>"
                "<li>☐ Search IT Assets by name — results appear</li>"
                "<li>☐ Select a user — confirmation dialog shows name, email, title</li>"
                "<li>☐ Click Send Invitation — invitation sent successfully</li>"
                "<li>☐ Already-invited users show info message</li>"
                "</ul>"
                "<h2>Create DBCA Staff User (Admin)</h2>"
                "<ul>"
                "<li>☐ Navigate to Users → Add DBCA User (admin only)</li>"
                "<li>☐ Fill in staff details</li>"
                "<li>☐ Submit — staff user created</li>"
                "</ul>"
                "<h2>Edit User (Admin)</h2>"
                "<ul>"
                "<li>☐ Navigate to a user's edit page (admin only)</li>"
                "<li>☐ Modify user details — saves correctly</li>"
                "<li>☐ Non-admin users cannot access the edit page</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-projects",
            "title": "3. Projects",
            "order": 2,
            "description": (
                "<h2>Project List</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects — list loads</li>"
                "<li>☐ Filter by status (Active/Suspended/Closed) — filters work</li>"
                "<li>☐ Filter by project type — filters work</li>"
                "<li>☐ Filter by year — filters work</li>"
                "<li>☐ Filter by business area — filters work</li>"
                "<li>☐ Filter by user — filters work</li>"
                "<li>☐ Toggle Active/Inactive — filters work</li>"
                "<li>☐ Search by title/keywords — results filter correctly</li>"
                "<li>☐ Enable Remember my search — filters persist on return</li>"
                "<li>☐ Ctrl+Click a project — opens in new tab</li>"
                "<li>☐ CSV download button visible for admins — downloads correctly</li>"
                "</ul>"
                "<h2>Project Creation (Wizard)</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects → Create New Project</li>"
                "<li>☐ Select Science Project — wizard opens</li>"
                "<li>☐ Fill in Base Information (title, keywords, summary, image)</li>"
                "<li>☐ Fill in Details (service, business area, dates, lead, custodian)</li>"
                "<li>☐ Fill in Location (regions, bioregions)</li>"
                "<li>☐ Toggle Form/Preview — preview shows entered data</li>"
                "<li>☐ Leave wizard and return — draft is restored with toast message</li>"
                "<li>☐ Click Create — project created, confetti animation plays</li>"
                "<li>☐ Repeat for Core Function type</li>"
                "<li>☐ Repeat for External Partnership type (extra details step)</li>"
                "<li>☐ Repeat for Student Project type (extra details step)</li>"
                "<li>☐ Verify each type creates the correct document structure</li>"
                "</ul>"
                "<h2>Project Overview</h2>"
                "<ul>"
                "<li>☐ Project details display correctly (title, summary, status, dates)</li>"
                "<li>☐ Team members section shows all members with roles</li>"
                "<li>☐ Document tabs are present and navigable</li>"
                "<li>☐ Tab status indicators show correct state (green/orange)</li>"
                "<li>☐ Mobile: tabs collapse to dropdown selector</li>"
                "<li>☐ Edit Project button works (for authorised users)</li>"
                "<li>☐ Project image displays correctly</li>"
                "</ul>"
                "<h2>Edit Project</h2>"
                "<ul>"
                "<li>☐ Edit title — saves correctly</li>"
                "<li>☐ Edit summary — saves correctly</li>"
                "<li>☐ Change business area — saves correctly</li>"
                "<li>☐ Update dates — saves correctly</li>"
                "<li>☐ Upload/change project image — saves correctly</li>"
                "<li>☐ Navigate away with unsaved changes — blocker dialog appears</li>"
                "<li>☐ Non-authorised users cannot edit</li>"
                "</ul>"
                "<h2>Project Deletion</h2>"
                "<ul>"
                "<li>☐ Request deletion from project page — request submitted</li>"
                "<li>☐ Deletion banner appears on project page</li>"
                "<li>☐ Cancel deletion request — banner disappears</li>"
                "</ul>"
                "<h2>Project Map</h2>"
                "<ul>"
                "<li>☐ Navigate to Projects → Map</li>"
                "<li>☐ Map loads with project markers</li>"
                "<li>☐ Click a marker — project info popup appears</li>"
                "<li>☐ Search on map works</li>"
                "<li>☐ Filters work on map view</li>"
                "<li>☐ Toggle heatmap layer — heatmap displays</li>"
                "<li>☐ Toggle region boundaries — GeoJSON overlays display</li>"
                "<li>☐ Enter fullscreen mode — floating sidebar appears</li>"
                "<li>☐ Minimise sidebar — filter button appears</li>"
                "<li>☐ Enable Remember my search — filters persist on return</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-documents",
            "title": "4. Documents & Approvals",
            "order": 3,
            "description": (
                "<h2>Concept Plans</h2>"
                "<ul>"
                "<li>☐ Navigate to a project's Concept Plan tab</li>"
                "<li>☐ Click pencil icon to edit a section — editor opens</li>"
                "<li>☐ Type content in the rich text editor — formatting works</li>"
                "<li>☐ Save content — persists after page refresh</li>"
                "</ul>"
                "<h2>Approval Workflow</h2>"
                "<ul>"
                "<li>☐ Submit a document for approval — status changes</li>"
                "<li>☐ As Project Lead: approve — moves to BA Lead stage</li>"
                "<li>☐ As BA Lead: approve — moves to Directorate stage</li>"
                "<li>☐ As Directorate: approve — document is finalised and locked</li>"
                "<li>☐ Recall a document — returns to your stage for editing</li>"
                "<li>☐ Send back a document — returns to previous stage</li>"
                "<li>☐ Verify email notifications are sent at each stage</li>"
                "</ul>"
                "<h2>PDF Generation</h2>"
                "<ul>"
                "<li>☐ Click Generate PDF — PDF is generated</li>"
                "<li>☐ Click Download PDF — file downloads correctly</li>"
                "<li>☐ PDF content matches the on-screen content</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-team",
            "title": "5. Team Management",
            "order": 4,
            "description": (
                "<ul>"
                "<li>☐ Click Invite Member — dialog opens</li>"
                "<li>☐ Search for a user — results appear</li>"
                "<li>☐ Select user, assign role — member added</li>"
                "<li>☐ Click a team member — edit dialog opens</li>"
                "<li>☐ Change role — saves correctly</li>"
                "<li>☐ Remove from project — member is removed</li>"
                "<li>☐ Promote to Leader — leadership transfers</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-emails",
            "title": "6. Email Notifications",
            "order": 5,
            "description": (
                "<h2>Email Triggers</h2>"
                "<ul>"
                "<li>☐ Document approved — email sent</li>"
                "<li>☐ Document sent back — email sent</li>"
                "<li>☐ Document recalled — email sent</li>"
                "<li>☐ Batch approved — consolidated email sent</li>"
                "<li>☐ New cycle opened — email sent to project leads</li>"
                "<li>☐ @mention in comment — email sent to mentioned user</li>"
                "<li>☐ Project closed — email sent</li>"
                "<li>☐ Project reopened — email sent</li>"
                "</ul>"
                "<h2>Email Content</h2>"
                "<ul>"
                "<li>☐ Emails contain the DBCA logo</li>"
                "<li>☐ Links navigate to the correct pages</li>"
                "<li>☐ Email renders correctly in Outlook</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-dashboard",
            "title": "7. Dashboard",
            "order": 6,
            "description": (
                "<ul>"
                "<li>☐ Dashboard loads with welcome message and quick actions</li>"
                "<li>☐ Admin tab visible for admins — shows tasks with counts</li>"
                "<li>☐ Documents tab shows document tasks by role</li>"
                "<li>☐ My Projects tab shows projects with search and filters</li>"
                "<li>☐ Caretaker notification banner shows if applicable</li>"
                "<li>☐ Sidebar and header navigation work</li>"
                "<li>☐ Breadcrumbs display correctly on all pages</li>"
                "<li>☐ Responsive: renders correctly on mobile, tablet, desktop</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-reports",
            "title": "8. Reports & Annual Reporting",
            "order": 7,
            "description": (
                "<ul>"
                "<li>☐ Published Reports: Official, Drafts, Legacy tabs work</li>"
                "<li>☐ Report Details: all five tabs load correctly</li>"
                "<li>☐ My Business Area: Appearance, Unapproved, Problematic tabs</li>"
                "<li>☐ Edit business area details — saves correctly</li>"
                "<li>☐ My Division loads with business area overview</li>"
                "<li>☐ New Cycle: custom message, email preview, recipients work</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-admin",
            "title": "9. Administration",
            "order": 8,
            "description": (
                "<ul>"
                "<li>☐ All reference data CRUD works (branches, divisions, BAs, etc.)</li>"
                "<li>☐ Affiliations merge and clean dialogs work</li>"
                "<li>☐ Delete Project admin task: approve and reject work</li>"
                "<li>☐ Merge Users admin task: approve works</li>"
                "<li>☐ Set Caretaker admin task: approve works</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-staff",
            "title": "10. Staff Directory & Profiles",
            "order": 9,
            "description": (
                "<ul>"
                "<li>☐ Staff Directory loads (public, no auth required)</li>"
                "<li>☐ Search and pagination work</li>"
                "<li>☐ Admin: Show Hidden Profiles toggle works</li>"
                "<li>☐ Profile detail: all tabs load (Overview, Projects, CV, Pubs)</li>"
                "<li>☐ Edit mode works for profile owner</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-comments",
            "title": "11. Comments & Reactions",
            "order": 10,
            "description": (
                "<ul>"
                "<li>☐ Comment with rich text — submit — appears in list</li>"
                "<li>☐ @mention a user — mention highlighted, email sent</li>"
                "<li>☐ Edit and delete own comments work</li>"
                "<li>☐ Reaction picker — add and remove reactions work</li>"
                "</ul>"
            ),
        },
        {
            "field_key": "e2e-final",
            "title": "12. Final Checks",
            "order": 11,
            "description": (
                "<ul>"
                "<li>☐ Chrome, Firefox, Edge — all features work</li>"
                "<li>☐ Dark mode — all pages render correctly</li>"
                "<li>☐ Tab navigation and focus indicators work</li>"
                "<li>☐ Dashboard loads within 3 seconds</li>"
                "<li>☐ No visible layout shifts during page load</li>"
                "</ul>"
                "<p>Once all items are checked, the release is ready for deployment.</p>"
            ),
        },
    ]
