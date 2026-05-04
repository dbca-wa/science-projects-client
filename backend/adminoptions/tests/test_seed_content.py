"""
Tests for knowledge base seed content structure and integrity.

Validates that all sections have proper definitions, all article getters
produce valid content, and the content meets quality standards.
"""

import re

from adminoptions.management.commands.kb_content.sections import (
    ARTICLE_GETTERS,
    SECTIONS,
)


class TestSectionDefinitions:
    """Verify the SECTIONS list is well-formed."""

    def test_all_sections_have_required_fields(self):
        required_fields = {
            "id",
            "title",
            "description",
            "icon",
            "required_role",
            "order",
        }
        for section in SECTIONS:
            missing = required_fields - set(section.keys())
            assert (
                not missing
            ), f"Section '{section.get('id', '?')}' missing fields: {missing}"

    def test_section_ids_are_unique(self):
        ids = [s["id"] for s in SECTIONS]
        assert len(ids) == len(
            set(ids)
        ), f"Duplicate section IDs: {[x for x in ids if ids.count(x) > 1]}"

    def test_section_orders_are_unique(self):
        orders = [s["order"] for s in SECTIONS]
        assert len(orders) == len(set(orders)), "Duplicate section orders found"

    def test_all_sections_have_descriptions_over_10_chars(self):
        for section in SECTIONS:
            desc = section.get("description", "")
            assert (
                len(desc) >= 10
            ), f"Section '{section['id']}' description too short ({len(desc)} chars): '{desc}'"

    def test_valid_required_roles(self):
        valid_roles = {"all", "admin", "business_area_lead", "key_stakeholder"}
        for section in SECTIONS:
            role = section["required_role"]
            assert (
                role in valid_roles
            ), f"Section '{section['id']}' has invalid role: '{role}'"

    def test_role_assignments_match_spec(self):
        """Verify role assignments per the design document."""
        expected = {
            "getting-started": "all",
            "creating-projects": "all",
            "searching-and-navigation": "all",
            "account-profile": "all",
            "system-features": "all",
            "editing-projects": "all",
            "documents": "all",
            "team-management": "all",
            "business-area": "business_area_lead",
            "reports": "key_stakeholder",
            "admin": "admin",
            "e2e-testing": "admin",
        }
        for section in SECTIONS:
            sid = section["id"]
            if sid in expected:
                assert (
                    section["required_role"] == expected[sid]
                ), f"Section '{sid}' role is '{section['required_role']}', expected '{expected[sid]}'"

    def test_section_count(self):
        assert len(SECTIONS) == 12, f"Expected 12 sections, got {len(SECTIONS)}"


class TestArticleGetters:
    """Verify ARTICLE_GETTERS coverage and content quality."""

    def test_all_sections_have_getters(self):
        section_ids = {s["id"] for s in SECTIONS}
        getter_ids = set(ARTICLE_GETTERS.keys())
        missing = section_ids - getter_ids
        assert not missing, f"Sections without article getters: {missing}"

    def test_no_extra_getters(self):
        section_ids = {s["id"] for s in SECTIONS}
        getter_ids = set(ARTICLE_GETTERS.keys())
        extra = getter_ids - section_ids
        assert not extra, f"Article getters without sections: {extra}"

    def test_all_getters_return_lists(self):
        for sid, getter in ARTICLE_GETTERS.items():
            articles = getter()
            assert isinstance(
                articles, list
            ), f"Getter for '{sid}' returned {type(articles)}, expected list"

    def test_all_getters_return_non_empty(self):
        for sid, getter in ARTICLE_GETTERS.items():
            articles = getter()
            assert len(articles) > 0, f"Getter for '{sid}' returned empty list"

    def test_all_articles_have_required_fields(self):
        required = {"field_key", "title", "order", "description"}
        for sid, getter in ARTICLE_GETTERS.items():
            for article in getter():
                missing = required - set(article.keys())
                assert (
                    not missing
                ), f"Article '{article.get('title', '?')}' in '{sid}' missing: {missing}"

    def test_article_field_keys_unique_within_section(self):
        for sid, getter in ARTICLE_GETTERS.items():
            keys = [a["field_key"] for a in getter()]
            assert len(keys) == len(
                set(keys)
            ), f"Duplicate field_keys in '{sid}': {[k for k in keys if keys.count(k) > 1]}"

    def test_article_orders_sequential_within_section(self):
        for sid, getter in ARTICLE_GETTERS.items():
            orders = [a["order"] for a in getter()]
            assert orders == sorted(
                orders
            ), f"Articles in '{sid}' not in order: {orders}"


class TestContentQuality:
    """Verify content meets quality standards."""

    def test_section_ids_are_valid_slugs(self):
        """Verify all section IDs are valid URL-friendly slugs (lowercase alphanumeric + hyphens)."""
        slug_pattern = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
        for section in SECTIONS:
            sid = section["id"]
            assert slug_pattern.match(sid), (
                f"Section ID '{sid}' is not a valid slug. "
                f"Must match /^[a-z0-9]+(-[a-z0-9]+)*$/"
            )

    def test_section_ids_no_timestamps(self):
        """Verify no section ID contains a long number sequence (timestamp pattern)."""
        timestamp_pattern = re.compile(r"\d{10,}")
        for section in SECTIONS:
            sid = section["id"]
            assert not timestamp_pattern.search(sid), (
                f"Section ID '{sid}' appears to contain a timestamp. "
                f"IDs should be human-readable slugs, not timestamp-based."
            )

    def test_all_articles_have_non_empty_titles(self):
        """Verify no article has an empty or None title."""
        for sid, getter in ARTICLE_GETTERS.items():
            for article in getter():
                title = article.get("title")
                assert title is not None and title.strip() != "", (
                    f"Article '{article.get('field_key', '?')}' in section '{sid}' "
                    f"has an empty or None title"
                )

    def test_articles_with_content_have_html(self):
        """All articles with >50 chars should contain HTML tags."""
        for sid, getter in ARTICLE_GETTERS.items():
            if sid == "e2e-testing":
                continue  # Checklists may be simpler
            for article in getter():
                desc = article["description"]
                if len(desc) > 50:
                    assert (
                        "<" in desc
                    ), f"Article '{article['title']}' in '{sid}' has no HTML tags"

    def test_screenshot_placeholders_are_descriptive(self):
        """Every screenshot placeholder should have a description."""
        for sid, getter in ARTICLE_GETTERS.items():
            for article in getter():
                desc = article["description"]
                # Find all screenshot placeholders
                placeholders = re.findall(
                    r"Screenshot needed:</strong>\s*(.*?)</p>", desc
                )
                for placeholder in placeholders:
                    assert (
                        len(placeholder.strip()) > 5
                    ), f"Empty screenshot placeholder in '{article['title']}' ({sid})"

    def test_external_users_clarification_exists(self):
        """At least one article should mention external users don't use the app."""
        all_content = ""
        for getter in ARTICLE_GETTERS.values():
            for article in getter():
                all_content += article["description"]

        assert (
            "do not use" in all_content.lower()
            or "do not log in" in all_content.lower()
        ), "No article mentions that external users do not use the app"

    def test_admin_section_has_data_list_content(self):
        """Admin section should have comprehensive data list documentation."""
        admin_getter = ARTICLE_GETTERS.get("admin")
        assert admin_getter is not None
        data_list_articles = [
            a for a in admin_getter() if "data list" in (a.get("title") or "").lower()
        ]
        assert (
            len(data_list_articles) >= 1
        ), "Should have at least one data list article"
        desc = data_list_articles[0]["description"].lower()
        assert (
            "unapproved" in desc
        ), "Data list article should mention unapproved documents"
        assert (
            "problematic" in desc
        ), "Data list article should mention problematic projects"

    def test_total_article_count(self):
        total = sum(len(getter()) for getter in ARTICLE_GETTERS.values())
        assert total >= 50, f"Expected at least 50 articles, got {total}"

    def test_e2e_checklists_have_checkbox_markers(self):
        """E2E testing articles should use ☐ checkbox markers."""
        e2e_getter = ARTICLE_GETTERS.get("e2e-testing")
        assert e2e_getter is not None
        for article in e2e_getter():
            desc = article["description"]
            assert (
                "☐" in desc
            ), f"E2E article '{article['title']}' has no ☐ checkbox markers"
