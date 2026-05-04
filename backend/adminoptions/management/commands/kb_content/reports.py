"""Reports & Annual Reporting section — visible to key stakeholders."""

from .helpers import screenshot


def get_reports_articles():
    """Articles for the Reports section."""
    return [
        {
            "field_key": "published-reports",
            "title": "Published Reports",
            "order": 0,
            "description": (
                "<h2>Viewing Published Reports</h2>"
                "<p>Navigate to <strong>Reports</strong> from the header menu to see "
                "all finalised annual research activity reports.</p>"
                "<p>The page has three tabs:</p>"
                "<ul>"
                "<li><strong>Official:</strong> Published annual reports available as "
                "downloadable PDFs. These are the final, approved reports shared with "
                "the public and key ministers.</li>"
                "<li><strong>Drafts:</strong> Reports that are still being compiled "
                "and have not yet been published. Only visible to administrators and "
                "key stakeholders.</li>"
                "<li><strong>Legacy:</strong> Historical reports from before SPMS was "
                "introduced. These are uploaded as PDFs for archival purposes.</li>"
                "</ul>"
                f"{screenshot('Published Reports page with Official, Drafts, and Legacy tabs')}"
                "<p>Click on any report to download the PDF. Administrators can also "
                "upload new official PDFs, legacy PDFs, and update existing reports "
                "using the action buttons.</p>"
            ),
        },
        {
            "field_key": "latest-report-details",
            "title": "Latest Report Details",
            "order": 1,
            "description": (
                "<h2>Current Report in Progress</h2>"
                "<p>Navigate to <strong>Reports → Report Details</strong> to see the "
                "current year's report being compiled. This page is available to "
                "administrators and key stakeholders.</p>"
                "<p>The page has five tabs:</p>"
                "<ul>"
                "<li><strong>Details:</strong> Overview of the current report including "
                "total project counts, completion percentages, and the report year.</li>"
                "<li><strong>Media:</strong> Upload and manage cover images and other "
                "media assets for the report. These images appear on the cover and "
                "throughout the published PDF.</li>"
                "<li><strong>Pending:</strong> Projects with progress reports still "
                "awaiting approval. Use this to track which projects are blocking "
                "the report from being finalised.</li>"
                "<li><strong>Approved:</strong> Projects with approved progress reports "
                "ready for inclusion in the annual report.</li>"
                "<li><strong>Print Preview:</strong> Preview how the final report will "
                "look when published. This renders the report in the same format as "
                "the published PDF.</li>"
                "</ul>"
                f"{screenshot('Latest Report Details page with tabs — Details, Media, Pending, Approved, Preview')}"
            ),
        },
        {
            "field_key": "my-division",
            "title": "My Division",
            "order": 2,
            "description": (
                "<h2>Divisional Overview</h2>"
                "<p>Key stakeholders can access <strong>Reports → My Division</strong> "
                "to see an overview of all business areas and projects within their "
                "division.</p>"
                "<p>This page shows:</p>"
                "<ul>"
                "<li>Each business area in your division with its project count.</li>"
                "<li>The approval status of progress reports across the division.</li>"
                "<li>Which business areas are on track and which need follow-up.</li>"
                "</ul>"
                f"{screenshot('My Division page showing business areas and project counts')}"
                "<p>Use this view to monitor reporting progress across your entire "
                "division, especially as the annual reporting deadline approaches.</p>"
            ),
        },
        {
            "field_key": "batch-approvals",
            "title": "Batch Approvals",
            "order": 3,
            "description": (
                "<h2>Approving Multiple Documents at Once</h2>"
                "<p>The batch approval feature allows key stakeholders and "
                "administrators to approve multiple documents simultaneously, rather "
                "than approving each one individually. This is particularly useful "
                "during the annual reporting period when many progress reports need "
                "approval.</p>"
                "<h2>How to Use Batch Approvals</h2>"
                "<ol>"
                "<li>Navigate to the <strong>Admin</strong> tab on your dashboard.</li>"
                "<li>Find the batch approval section.</li>"
                "<li>Select the documents you want to approve using the checkboxes.</li>"
                "<li>Click <strong>Approve Selected</strong>.</li>"
                "</ol>"
                f"{screenshot('Dashboard Admin tab showing batch approval with selectable documents')}"
                "<p>A consolidated email notification is sent to all affected project "
                "leads when documents are batch approved, so they are not flooded with "
                "individual approval emails.</p>"
            ),
        },
        {
            "field_key": "new-cycle",
            "title": "Opening a New Reporting Cycle",
            "order": 4,
            "description": (
                "<h2>Starting a New Financial Year</h2>"
                "<p>At the start of each financial year, a new reporting cycle must "
                "be opened. This creates new progress report slots for all active "
                "projects and notifies project leads that it is time to write their "
                "annual updates.</p>"
                "<p>Navigate to <strong>Manage → Open New Cycle</strong>.</p>"
                "<h2>Steps</h2>"
                "<ol>"
                "<li><strong>Review details:</strong> Confirm the year and check "
                "which projects will be affected.</li>"
                "<li><strong>Custom message:</strong> Write an optional message that "
                "will be included in the notification email to project leads. Use this "
                "to communicate deadlines or special instructions.</li>"
                "<li><strong>Email preview:</strong> Preview exactly how the email "
                "will look before sending. Check the formatting, links, and content.</li>"
                "<li><strong>Recipients:</strong> Review and optionally adjust the "
                "list of recipients. You can exclude specific people if needed.</li>"
                "<li><strong>Confirm:</strong> Click to open the new cycle and send "
                "the notification emails.</li>"
                "</ol>"
                f"{screenshot('Open New Cycle page with custom message editor and email preview')}"
                "<p><strong>Warning:</strong> This action affects all active projects "
                "and should only be performed once per financial year. A safeguard "
                "prevents accidentally opening a duplicate cycle for the same year.</p>"
            ),
        },
    ]
