"""
Scan all media directories for corrupt, missing, or zero-byte files.
Generates a CSV mapping and an HTML downloader page for re-fetching
from production via SSO.

Usage:
    poetry run python manage.py audit_media_files
    poetry run python manage.py audit_media_files --output-dir /tmp/media_audit
"""

import csv
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from medias.models import (
    AECEndorsementPDF,
    AgencyImage,
    AnnualReportMedia,
    AnnualReportPDF,
    BusinessAreaPhoto,
    LegacyAnnualReportPDF,
    ProjectDocumentPDF,
    ProjectPhoto,
    ProjectPlanMethodologyPhoto,
    UserAvatar,
)

JPEG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89PNG"
PDF_MAGIC = b"%PDF"
WEBP_RIFF = b"RIFF"
WEBP_MARKER = b"WEBP"

PRODUCTION_BASE = "https://scienceprojects.dbca.wa.gov.au/files"


# Each entry: (Model, label, upload_subdir, magic_bytes_list, description_fn)
MEDIA_MODELS = [
    {
        "model": UserAvatar,
        "label": "user_avatars",
        "upload_dir": "user_avatars",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"User: {obj.user}",
        "select_related": ["user"],
    },
    {
        "model": ProjectPhoto,
        "label": "projects",
        "upload_dir": "projects",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"Project: {obj.project}",
        "select_related": ["project"],
    },
    {
        "model": BusinessAreaPhoto,
        "label": "business_areas",
        "upload_dir": "business_areas",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"Business Area: {obj.business_area}",
        "select_related": ["business_area"],
    },
    {
        "model": AgencyImage,
        "label": "agencies",
        "upload_dir": "agencies",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"Agency: {obj.agency}",
        "select_related": ["agency"],
    },
    {
        "model": ProjectDocumentPDF,
        "label": "project_documents",
        "upload_dir": "project_documents",
        "magic": [PDF_MAGIC],
        "describe": lambda obj: f"Document: {obj.document} | Project: {obj.project}",
        "select_related": ["document", "project"],
    },
    {
        "model": AECEndorsementPDF,
        "label": "aec_endorsements",
        "upload_dir": "aec_endorsements",
        "magic": [PDF_MAGIC],
        "describe": lambda obj: f"Endorsement: {obj.endorsement}",
        "select_related": ["endorsement"],
    },
    {
        "model": AnnualReportPDF,
        "label": "annual_report_pdfs",
        "upload_dir": "annual_reports/pdfs",
        "magic": [PDF_MAGIC],
        "describe": lambda obj: f"Annual Report: {obj.report}",
        "select_related": ["report"],
    },
    {
        "model": LegacyAnnualReportPDF,
        "label": "legacy_annual_report_pdfs",
        "upload_dir": "annual_reports/legacy/pdfs",
        "magic": [PDF_MAGIC],
        "describe": lambda obj: f"Legacy AR Year: {obj.year}",
        "select_related": [],
    },
    {
        "model": AnnualReportMedia,
        "label": "annual_report_images",
        "upload_dir": "annual_reports/images",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"AR Media: {obj.kind} ({obj.report})",
        "select_related": ["report"],
    },
    {
        "model": ProjectPlanMethodologyPhoto,
        "label": "methodology_images",
        "upload_dir": "methodology_images",
        "magic": [JPEG_MAGIC, PNG_MAGIC, WEBP_RIFF],
        "describe": lambda obj: f"Project Plan: {obj.project_plan}",
        "select_related": ["project_plan"],
    },
]


def check_file_health(file_path, magic_bytes_list):
    """
    Returns (status, detail) tuple.
    status: 'ok', 'missing', 'zero_byte', 'null_filled', 'bad_header'
    """
    if not os.path.exists(file_path):
        return "missing", "File not found on disk"

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        return "zero_byte", "File is 0 bytes"

    with open(file_path, "rb") as f:
        header = f.read(512)

    if header == b"\x00" * len(header):
        return "null_filled", f"All null bytes ({file_size} bytes)"

    for magic in magic_bytes_list:
        if header[: len(magic)] == magic:
            return "ok", ""

    return "bad_header", f"Unexpected header: {header[:8].hex()}"


class Command(BaseCommand):
    help = "Audit all media files for corruption and generate CSV + HTML downloader"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            default=os.path.join(settings.BASE_DIR, "media_audit"),
            help="Directory to write CSV and HTML output",
        )

    def handle(self, *args, **options):
        output_dir = options["output_dir"]
        os.makedirs(output_dir, exist_ok=True)

        csv_path = os.path.join(output_dir, "corrupt_files.csv")
        html_path = os.path.join(output_dir, "download_files.html")

        all_corrupt = []
        total_scanned = 0
        summary = {}

        for config in MEDIA_MODELS:
            model = config["model"]
            label = config["label"]
            magic = config["magic"]
            describe = config["describe"]
            select_related = config["select_related"]

            qs = model.objects.all()
            if select_related:
                qs = qs.select_related(*select_related)

            corrupt_count = 0
            model_total = 0

            for obj in qs:
                if not obj.file:
                    continue

                model_total += 1

                try:
                    file_path = obj.file.path
                except (ValueError, AttributeError):
                    file_path = None

                if file_path is None:
                    status, detail = "missing", "No file path"
                else:
                    status, detail = check_file_health(file_path, magic)

                if status != "ok":
                    corrupt_count += 1
                    prod_url = f"{PRODUCTION_BASE}/{obj.file.name}"
                    all_corrupt.append(
                        {
                            "media_kind": label,
                            "pk": obj.pk,
                            "file_name": obj.file.name,
                            "status": status,
                            "detail": detail,
                            "description": describe(obj),
                            "production_url": prod_url,
                            "local_path": file_path or "",
                        }
                    )

            total_scanned += model_total
            summary[label] = {
                "total": model_total,
                "corrupt": corrupt_count,
            }

        # Write CSV
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "media_kind",
                    "pk",
                    "file_name",
                    "status",
                    "detail",
                    "description",
                    "production_url",
                    "local_path",
                ],
            )
            writer.writeheader()
            writer.writerows(all_corrupt)

        # Write HTML downloader
        self._write_html(html_path, all_corrupt)

        # Print summary
        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("MEDIA AUDIT SUMMARY")
        self.stdout.write("=" * 60)

        total_corrupt = 0
        for label, counts in summary.items():
            total_corrupt += counts["corrupt"]
            if counts["corrupt"] > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  {label}: {counts['corrupt']}/{counts['total']} corrupt"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  {label}: {counts['total']} files — all healthy"
                    )
                )

        self.stdout.write("")
        self.stdout.write(f"Total scanned: {total_scanned}")
        self.stdout.write(
            self.style.WARNING(f"Total corrupt: {total_corrupt}")
            if total_corrupt
            else self.style.SUCCESS("No corrupt files found")
        )
        self.stdout.write(f"\nCSV: {csv_path}")
        self.stdout.write(f"HTML downloader: {html_path}")

    def _write_html(self, html_path, corrupt_files):
        """Generate an HTML page that downloads all corrupt files from production."""
        rows_html = ""
        for entry in corrupt_files:
            rows_html += (
                f'<tr data-url="{entry["production_url"]}" '
                f'data-folder="{entry["media_kind"]}" '
                f'data-filename="{os.path.basename(entry["file_name"])}">'
                f'<td>{entry["media_kind"]}</td>'
                f'<td>{entry["pk"]}</td>'
                f'<td>{entry["description"]}</td>'
                f'<td>{entry["status"]}</td>'
                f'<td><a href="{entry["production_url"]}" target="_blank">'
                f'{os.path.basename(entry["file_name"])}</a></td>'
                f'<td class="status-cell">Pending</td>'
                f"</tr>\n"
            )

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SPMS Media File Downloader</title>
<style>
  body {{ font-family: system-ui, sans-serif; margin: 2rem; }}
  h1 {{ color: #2A6096; }}
  .info {{ background: #fef3cd; border: 1px solid #ffc107; padding: 1rem;
           border-radius: 4px; margin-bottom: 1rem; }}
  table {{ border-collapse: collapse; width: 100%; margin-top: 1rem; }}
  th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left;
            font-size: 13px; }}
  th {{ background: #2A6096; color: white; }}
  tr:nth-child(even) {{ background: #f9f9f9; }}
  .btn {{ padding: 10px 20px; font-size: 14px; cursor: pointer;
          border: none; border-radius: 4px; margin-right: 8px; }}
  .btn-primary {{ background: #2A6096; color: white; }}
  .btn-danger {{ background: #a41515; color: white; }}
  .downloading {{ color: #ba6d18; font-weight: bold; }}
  .done {{ color: #198754; font-weight: bold; }}
  .failed {{ color: #a41515; font-weight: bold; }}
  #progress {{ margin: 1rem 0; font-size: 16px; font-weight: bold; }}
</style>
</head>
<body>
<h1>SPMS Corrupt Media File Downloader</h1>
<div class="info">
  <strong>Instructions:</strong>
  <ol>
    <li>First, <a href="https://scienceprojects.dbca.wa.gov.au" target="_blank">
        log in to production SPMS</a> in this browser (SSO)</li>
    <li>Once authenticated, click "Open All in Tabs" to open each file URL
        in a new tab — your browser will download them using your SSO session</li>
    <li>Or click individual links to download one at a time</li>
  </ol>
  <p><strong>{len(corrupt_files)}</strong> corrupt/missing files found.</p>
</div>

<button class="btn btn-primary" onclick="openAllTabs()">
  Open All in Tabs ({len(corrupt_files)} files)
</button>
<button class="btn btn-danger" onclick="openBatch(10)">
  Open in Batches of 10
</button>

<div id="progress"></div>

<table>
<thead>
  <tr>
    <th>Media Kind</th><th>PK</th><th>Description</th>
    <th>Issue</th><th>Production File</th><th>Status</th>
  </tr>
</thead>
<tbody>
{rows_html}
</tbody>
</table>

<script>
const rows = document.querySelectorAll('tbody tr');
let batchIndex = 0;

function openAllTabs() {{
  rows.forEach((row, i) => {{
    const url = row.dataset.url;
    const cell = row.querySelector('.status-cell');
    setTimeout(() => {{
      window.open(url, '_blank');
      cell.textContent = 'Opened';
      cell.className = 'status-cell done';
      document.getElementById('progress').textContent =
        `Opened ${{i + 1}} / ${{rows.length}}`;
    }}, i * 300);
  }});
}}

function openBatch(size) {{
  const end = Math.min(batchIndex + size, rows.length);
  for (let i = batchIndex; i < end; i++) {{
    const row = rows[i];
    const url = row.dataset.url;
    const cell = row.querySelector('.status-cell');
    window.open(url, '_blank');
    cell.textContent = 'Opened';
    cell.className = 'status-cell done';
  }}
  document.getElementById('progress').textContent =
    `Opened ${{end}} / ${{rows.length}}`;
  batchIndex = end;
  if (batchIndex >= rows.length) {{
    document.getElementById('progress').textContent = 'All files opened!';
  }}
}}
</script>
</body>
</html>"""

        with open(html_path, "w") as f:
            f.write(html)
