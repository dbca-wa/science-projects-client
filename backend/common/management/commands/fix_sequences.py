"""
Django management command to fix PostgreSQL sequence values.

This command ensures that all PostgreSQL sequences are correctly synchronized
with the maximum ID values in their corresponding tables. This is particularly
useful after bulk data imports or migrations where sequences may become out of sync.

Usage:
    python manage.py fix_sequences [--dry-run]

Options:
    --dry-run: Show what would be changed without making any modifications
"""

from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connection, models


class Command(BaseCommand):
    help = "Fix PostgreSQL sequence values to match current max IDs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be changed without making modifications",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN MODE - No changes will be made")
            )

        self.stdout.write("\nChecking sequences for all models...")
        self.stdout.write("-" * 80)

        with connection.cursor() as cursor:
            # Get all models
            all_models = apps.get_models()

            # Track statistics
            total_checked = 0
            total_fixed = 0
            total_skipped = 0

            for model in all_models:
                # Skip models without a database table
                if not hasattr(model, "_meta") or model._meta.abstract:
                    continue

                # Get table name
                table_name = model._meta.db_table

                # Get primary key field
                pk_field = model._meta.pk

                # Skip if no primary key or not an integer field
                if not pk_field or not isinstance(
                    pk_field, (models.AutoField, models.BigAutoField)
                ):
                    if options["verbosity"] >= 2:
                        self.stdout.write(
                            f"  {model.__name__:30} | No sequence (custom PK or non-integer)"
                        )
                    total_skipped += 1
                    continue

                # Get sequence name (PostgreSQL naming convention)
                sequence_name = f"{table_name}_{pk_field.name}_seq"

                # Check if sequence exists
                cursor.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1 FROM pg_class
                        WHERE relkind = 'S' AND relname = %s
                    )
                    """,
                    [sequence_name],
                )
                sequence_exists = cursor.fetchone()[0]

                if not sequence_exists:
                    if options["verbosity"] >= 2:
                        self.stdout.write(f"  {model.__name__:30} | No sequence found")
                    total_skipped += 1
                    continue

                total_checked += 1

                try:
                    # Get current max ID from table
                    # Note: Table and column names cannot be parameterized in PostgreSQL
                    # but we're using Django's validated model metadata, so this is safe
                    cursor.execute(  # nosec B608
                        f"SELECT MAX({pk_field.name}) FROM {table_name}"
                    )
                    max_id = cursor.fetchone()[0]

                    # Get current sequence value
                    cursor.execute(  # nosec B608
                        f"SELECT last_value FROM {sequence_name}"
                    )
                    seq_value = cursor.fetchone()[0]

                    if max_id is None:
                        # Table is empty, reset sequence to 1
                        if seq_value != 1:
                            if not dry_run:
                                cursor.execute(
                                    f"ALTER SEQUENCE {sequence_name} RESTART WITH 1"  # nosec B608
                                )
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"✓ {model.__name__:30} | Empty table, reset sequence to 1"
                                )
                            )
                            total_fixed += 1
                        else:
                            if options["verbosity"] >= 2:
                                self.stdout.write(
                                    f"  {model.__name__:30} | Empty table, sequence already at 1"
                                )
                    elif max_id >= seq_value:
                        # Sequence is behind, update it
                        new_value = max_id + 1
                        if not dry_run:
                            cursor.execute(
                                f"ALTER SEQUENCE {sequence_name} RESTART WITH {new_value}"  # nosec B608
                            )
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✓ {model.__name__:30} | Fixed: {seq_value} → {new_value}"
                            )
                        )
                        total_fixed += 1
                    else:
                        # Sequence is ahead (normal case)
                        if options["verbosity"] >= 2:
                            self.stdout.write(
                                f"  {model.__name__:30} | OK: max_id={max_id}, seq={seq_value}"
                            )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"✗ {model.__name__:30} | Error: {str(e)}")
                    )

        # Print summary
        self.stdout.write("-" * 80)
        self.stdout.write(
            f"\nSummary: {total_checked} sequences checked, "
            f"{total_fixed} fixed, {total_skipped} skipped"
        )

        if dry_run and total_fixed > 0:
            self.stdout.write(
                self.style.WARNING(
                    "\nDRY RUN MODE - Run without --dry-run to apply changes"
                )
            )
        elif total_fixed > 0:
            self.stdout.write(self.style.SUCCESS("\n✓ All sequences have been fixed!"))
        else:
            self.stdout.write(
                self.style.SUCCESS("\n✓ All sequences are already correct!")
            )
