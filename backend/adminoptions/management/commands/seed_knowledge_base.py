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
        # Always clear all existing content before seeding — ensures no stale
        # articles or sections remain from previous versions.
        ContentField.objects.all().delete()
        GuideSection.objects.all().delete()

        if options["clear"]:
            self.stdout.write(
                self.style.WARNING(
                    "--clear flag is now redundant (always clears before seeding)."
                )
            )

        self.stdout.write("Seeding knowledge base sections...")

        sections_created = 0
        articles_created = 0

        for section_data in SECTIONS:
            section_id = section_data["id"]
            section = GuideSection.objects.create(**section_data)
            sections_created += 1

            self.stdout.write(f"  Created: {section.title}")

            getter = ARTICLE_GETTERS.get(section_id)
            if getter:
                articles = getter()
                for article_data in articles:
                    description = self._transform_checkboxes(
                        article_data["description"]
                    )
                    ContentField.objects.create(
                        section=section,
                        field_key=article_data["field_key"],
                        title=article_data["title"],
                        description=description,
                        order=article_data["order"],
                    )
                    articles_created += 1
                self.stdout.write(f"    -> {len(articles)} article(s)")
            else:
                self.stdout.write(
                    self.style.WARNING(f"    -> No article getter for '{section_id}'")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {sections_created} sections, {articles_created} articles."
            )
        )

        # Seed homepage banner content
        from adminoptions.models import AdminOptions

        admin_opts = AdminOptions.objects.first()
        if admin_opts:
            admin_opts.show_homepage_message = True
            admin_opts.homepage_message = (
                '<p class="editor-paragraph mb-2">'
                '<span style="white-space: pre-wrap;">Welcome to the new SPMS. '
                "The system has been overhauled to improve UX. "
                "List of new features and updates:</span></p>"
                '<ul class="editor-ul editor-ul1">'
                '<li value="1" class="editor-li">'
                '<span style="white-space: pre-wrap;">Project Creation Wizard! '
                "Save progress in a draft</span></li>"
                '<li value="2" class="editor-li">'
                '<span style="white-space: pre-wrap;">Saved searches! '
                "Your last search will be remembered</span></li>"
                '<li value="3" class="editor-li">'
                '<span style="white-space: pre-wrap;">New emails! '
                "Design more consistent with DBCA theming</span></li>"
                '<li value="4" class="editor-li">'
                '<span style="white-space: pre-wrap;">New Project Document '
                "PDF Design!</span></li>"
                '<li value="5" class="editor-li">'
                '<span style="white-space: pre-wrap;">Knowledge base \u2013 find out '
                "what you need to do and how with improved guides!</span></li>"
                '<li value="6" class="editor-li">'
                '<span style="white-space: pre-wrap;">Improved Image upload \u2013 '
                "crop and adjust to get images exactly how you want!</span></li>"
                '<li value="7" class="editor-li">'
                '<span style="white-space: pre-wrap;">New invite email! '
                "Send to staff that aren\u2019t already in the system</span></li>"
                '<li value="8" class="editor-li">'
                '<span style="white-space: pre-wrap;">Redesigned staff profiles! '
                "Showcase your work to the public in style</span></li>"
                "</ul>"
            )
            admin_opts.save(update_fields=["show_homepage_message", "homepage_message"])
            self.stdout.write(
                self.style.SUCCESS("Homepage banner seeded (enabled with content).")
            )
