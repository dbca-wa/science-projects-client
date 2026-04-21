"""Add draft_file and published_file to AnnualReportPDF, keep file temporarily."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("medias", "0008_alter_annualreportmedia_kind"),
    ]

    operations = [
        migrations.AddField(
            model_name="annualreportpdf",
            name="draft_file",
            field=models.FileField(
                blank=True,
                help_text="Latest generated draft PDF",
                null=True,
                upload_to="annual_reports/drafts/",
            ),
        ),
        migrations.AddField(
            model_name="annualreportpdf",
            name="published_file",
            field=models.FileField(
                blank=True,
                help_text="Official published PDF",
                null=True,
                upload_to="annual_reports/published/",
            ),
        ),
        migrations.AlterField(
            model_name="annualreportpdf",
            name="file",
            field=models.FileField(
                blank=True,
                help_text="Deprecated — retained for migration only",
                null=True,
                upload_to="annual_reports/pdfs/",
            ),
        ),
    ]
