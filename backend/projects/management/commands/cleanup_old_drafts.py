from django.core.management.base import BaseCommand

from projects.services.draft_service import DraftService


class Command(BaseCommand):
    help = "Delete project drafts older than 30 days"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Number of days after which drafts are considered stale (default: 30)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        deleted_count = DraftService.cleanup_old_drafts(days=days)
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_count} draft(s) older than {days} days"
            )
        )
