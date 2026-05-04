"""
Seed the Knowledge Base with comprehensive SPMS guide content.

Usage:
    poetry run python manage.py seed_knowledge_base
    poetry run python manage.py seed_knowledge_base --clear

Content is organised into per-section modules under kb_content/.
Each section has its own file with article getter functions.
"""

import re

from django.core.management.base import BaseCommand

from adminoptions.models import ContentField, GuideSection

from .kb_content import ARTICLE_GETTERS, SECTIONS


class Command(BaseCommand):
    help = "Seed the Knowledge Base with comprehensive SPMS guide content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing guide sections and content fields before seeding.",
        )

    @staticmethod
    def _transform_checkboxes(html: str) -> str:
        """Convert ☐ bullet items into Lexical-compatible checklist HTML.

        Lexical checklists use:
        <ul __lexicallisttype="check">
          <li role="checkbox" tabindex="-1" aria-checked="false">text</li>
        </ul>
        """

        def replace_checklist_ul(match: re.Match) -> str:
            inner = match.group(1)
            if "☐" not in inner:
                return match.group(0)
            inner = re.sub(
                r"<li>☐\s*(.*?)</li>",
                r'<li role="checkbox" tabindex="-1" aria-checked="false">\1</li>',
                inner,
            )
            return f'<ul __lexicallisttype="check">{inner}</ul>'

        return re.sub(r"<ul>(.*?)</ul>", replace_checklist_ul, html, flags=re.DOTALL)

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing knowledge base content...")
            ContentField.objects.all().delete()
            GuideSection.objects.all().delete()
            self.stdout.write(self.style.WARNING("All content cleared."))

        self.stdout.write("Seeding knowledge base sections...")

        sections_created = 0
        sections_updated = 0
        articles_created = 0
        articles_updated = 0

        for section_data in SECTIONS:
            section_id = section_data["id"]
            section, created = GuideSection.objects.update_or_create(
                id=section_id,
                defaults=section_data,
            )
            if created:
                sections_created += 1
            else:
                sections_updated += 1

            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action}: {section.title}")

            getter = ARTICLE_GETTERS.get(section_id)
            if getter:
                articles = getter()
                for article_data in articles:
                    field_key = article_data["field_key"]
                    description = self._transform_checkboxes(
                        article_data["description"]
                    )
                    _, art_created = ContentField.objects.update_or_create(
                        section=section,
                        field_key=field_key,
                        defaults={
                            "title": article_data["title"],
                            "description": description,
                            "order": article_data["order"],
                        },
                    )
                    if art_created:
                        articles_created += 1
                    else:
                        articles_updated += 1
                self.stdout.write(f"    -> {len(articles)} article(s)")
            else:
                self.stdout.write(
                    self.style.WARNING(f"    -> No article getter for '{section_id}'")
                )

        total_sections = GuideSection.objects.count()
        total_articles = ContentField.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {total_sections} sections ({sections_created} created, "
                f"{sections_updated} updated), {total_articles} articles "
                f"({articles_created} created, {articles_updated} updated)."
            )
        )
