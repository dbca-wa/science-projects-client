"""Shared helper functions for knowledge base article content."""


def screenshot(description: str) -> str:
    """Generate a visible screenshot placeholder block.

    Uses a blockquote with an emoji marker so it survives both DOMPurify
    sanitisation and Lexical's HTML-to-node conversion in edit mode.
    """
    return (
        "<blockquote>"
        f"<p>📸 <strong>Screenshot needed:</strong> {description}</p>"
        "</blockquote>"
    )


def check(text: str) -> str:
    """Generate an interactive checklist item with a clickable checkbox."""
    return (
        '<label class="checklist-item">'
        '<input type="checkbox">'
        f"<span>{text}</span>"
        "</label>"
    )
