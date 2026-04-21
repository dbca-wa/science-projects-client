"""Copy AnnualReportPDF.file values to draft_file or published_file based on is_published."""

from django.db import migrations


def copy_file_forward(apps, schema_editor):
    """Copy file → published_file (published) or draft_file (unpublished)."""
    AnnualReportPDF = apps.get_model("medias", "AnnualReportPDF")
    for pdf in AnnualReportPDF.objects.select_related("report").all():
        if not pdf.file:
            continue
        if pdf.report and pdf.report.is_published:
            pdf.published_file = pdf.file
        else:
            pdf.draft_file = pdf.file
        pdf.save(update_fields=["draft_file", "published_file"])


def copy_file_reverse(apps, schema_editor):
    """Reverse: copy draft_file or published_file back to file."""
    AnnualReportPDF = apps.get_model("medias", "AnnualReportPDF")
    for pdf in AnnualReportPDF.objects.all():
        if pdf.published_file:
            pdf.file = pdf.published_file
        elif pdf.draft_file:
            pdf.file = pdf.draft_file
        pdf.save(update_fields=["file"])


class Migration(migrations.Migration):

    dependencies = [
        ("medias", "0009_annualreportpdf_draft_file_annualreportpdf_published_file"),
    ]

    operations = [
        migrations.RunPython(copy_file_forward, copy_file_reverse),
    ]
