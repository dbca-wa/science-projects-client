"""Replace unique=True on year with unique_together (year, division)."""

from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("agencies", "0007_division_approvers_division_key_stakeholder"),
        ("documents", "0013_make_date_open_date_closed_optional"),
    ]

    operations = [
        migrations.AlterField(
            model_name="annualreport",
            name="year",
            field=models.PositiveIntegerField(
                help_text=(
                    "The publication year of this report with four digits, "
                    "e.g. 2014 for the ARAR 2013-2014"
                ),
                validators=[MinValueValidator(2013)],
                verbose_name="Report Year",
            ),
        ),
        migrations.AddConstraint(
            model_name="annualreport",
            constraint=models.UniqueConstraint(
                fields=("year", "division"),
                name="unique_annual_report_per_year_per_division",
            ),
        ),
    ]
