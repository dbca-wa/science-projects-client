"""
Knowledge Base seed content package.

Each section's articles live in their own module. The main command
(seed_knowledge_base.py) imports SECTIONS and ARTICLE_GETTERS from here.
"""

from .helpers import check, screenshot  # noqa: F401
from .sections import ARTICLE_GETTERS, SECTIONS  # noqa: F401
