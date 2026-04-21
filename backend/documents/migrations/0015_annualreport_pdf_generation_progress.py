"""Add pdf_generation_progress JSONField to AnnualReport for cross-worker progress tracking."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0014_annualreport_unique_year_division"),
    ]

    operations = [
        migrations.AddField(
            model_name="annualreport",
            name="pdf_generation_progress",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Progress data for PDF generation (phase, percentage, etc.)",
            ),
        ),
    ]
