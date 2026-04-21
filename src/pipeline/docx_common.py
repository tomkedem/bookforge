"""
docx_common.py

Shared constants and tiny safe-access helpers used across the
ingestion modules. Kept intentionally small; if something grows
beyond trivial glue it belongs in a more focused module.

The XML namespace constants here are the Word wordprocessingML
namespace (W_NS) and the Office relationships namespace (R_NS).
python-docx exposes most runs/paragraphs through its object model,
but several places in ingestion need to read lower-level XML
attributes (images, structured-document tags, conditional table
formatting) where the namespaced tag is necessary.
"""

from __future__ import annotations

from typing import Any, Optional


W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

# Word stores font size in half-points (so 12pt = 24). We use the
# half-point number everywhere rather than converting back and forth.
DEFAULT_FONT_SIZE = 24

# A run whose font size is below this (in half-points) is considered
# "small print" and wrapped in <small>...</small> in the markdown.
# The threshold is 9pt; anything smaller is likely a caption or a
# footnote-style gloss.
SMALL_FONT_THRESHOLD = 18


def _safe_find(element: Any, xpath: str):
    """
    element.find(xpath) that swallows exceptions and returns None.

    Some elements are not full python-docx wrappers and the find
    call may raise; we always want a None-or-Element result so
    callers can just test truthiness.
    """
    try:
        return element.find(xpath)
    except Exception:
        return None


def _to_int(value: Optional[str]) -> Optional[int]:
    """
    Convert a Word attribute string to int, preserving None for
    missing values and for non-numeric input.
    """
    try:
        return int(value) if value is not None else None
    except Exception:
        return None


def _safe_text(value: Optional[str]) -> str:
    """Coerce a possibly-None string to an empty string."""
    return value or ""


def _safe_paragraph_text(para) -> str:
    """Read para.text without raising on malformed paragraphs."""
    try:
        return para.text or ""
    except Exception:
        return ""


def _safe_style_name(para) -> str:
    """
    Return a paragraph's style name, or the string "Unknown" when
    the style object is missing or unreadable. A stable fallback
    keeps classification logic simple.
    """
    try:
        style = para.style
        if style is None:
            return "Unknown"
        name = getattr(style, "name", None)
        return name or "Unknown"
    except Exception:
        return "Unknown"