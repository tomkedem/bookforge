"""
docx_runs.py

Run-level (inline) text extraction and markdown formatting.

A Word paragraph is made up of "runs" - contiguous spans of text
that share the same formatting (bold, italic, font, hyperlink,
etc.). This module owns everything about converting runs to
markdown:

  * _get_run_format / _empty_format_flags - read a run's formatting
    as a dict of booleans.
  * _apply_markdown_format - wrap a run's text with the right
    markdown / HTML formatting, moving leading/trailing whitespace
    outside the wrappers so emphasis doesn't include stray spaces.
  * _extract_runs_data - walk a paragraph's runs and return a list
    of {text, format, hyperlink} dicts.
  * _runs_to_markdown - merge runs with identical formatting and
    concatenate their markdown form into the paragraph's text.

The module also owns the hyperlink plumbing (_extract_document_hyperlinks,
_extract_paragraph_hyperlinks, _match_run_to_hyperlink). Those live
here because they feed directly into the run dicts produced by
_extract_runs_data, and keeping them in the same file means the
hyperlink cursor logic stays close to where it's used.

Footnote extraction (_extract_footnotes) lives here too - it
operates on the document once to build a dict the run-processing
loop later consults when it encounters <w:footnoteReference>.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from .docx_common import (
    W_NS,
    R_NS,
    DEFAULT_FONT_SIZE,
    SMALL_FONT_THRESHOLD,
    _safe_find,
)
from .docx_code import MONOSPACE_FONTS


# ── Hyperlink extraction ───────────────────────────────────────────

def _extract_document_hyperlinks(doc) -> Dict[str, str]:
    """
    Return a dict {rel_id: target_url} for every hyperlink
    relationship on the document part. Called once per document.
    """
    hyperlinks: Dict[str, str] = {}
    try:
        for rel in doc.part.rels.values():
            if "hyperlink" in rel.reltype:
                hyperlinks[rel.rId] = rel._target
    except Exception:
        pass
    return hyperlinks


def _extract_paragraph_hyperlinks(para, doc_hyperlinks: Dict[str, str]) -> List[Tuple[str, str]]:
    """
    Return an ordered list of (visible_text, url) for hyperlinks
    inside this paragraph. The order matters so _match_run_to_hyperlink
    can walk through the runs with a simple cursor.
    """
    result: List[Tuple[str, str]] = []
    try:
        for hl in para._element.findall(f".//{W_NS}hyperlink"):
            r_id = hl.get(f"{R_NS}id")
            if not r_id or r_id not in doc_hyperlinks:
                continue

            url = doc_hyperlinks[r_id]
            text = "".join(t.text or "" for t in hl.findall(f".//{W_NS}t")).strip()
            if text:
                result.append((text, url))
    except Exception:
        pass
    return result


def _match_run_to_hyperlink(
    run_text: str,
    ordered_hyperlinks: List[Tuple[str, str]],
    cursor: int,
) -> Tuple[Optional[str], int]:
    """
    Try to match a run's text to the next hyperlink in the paragraph.

    The cursor advances only when a run exactly equals the hyperlink's
    visible text; partial overlaps keep the cursor so a second run
    within the same hyperlink can also claim it.
    """
    if not run_text or cursor >= len(ordered_hyperlinks):
        return None, cursor

    link_text, url = ordered_hyperlinks[cursor]

    if run_text == link_text:
        return url, cursor + 1

    if run_text in link_text or link_text in run_text:
        return url, cursor

    return None, cursor


# ── Footnote extraction ────────────────────────────────────────────

def _extract_footnotes(doc) -> Dict[str, str]:
    """
    Return a dict {footnote_id: text} for every footnote in the
    document. The special IDs "0" and "-1" are Word's separator
    footnotes and are skipped.
    """
    footnotes: Dict[str, str] = {}
    try:
        footnotes_part = doc.part.footnotes_part
        if footnotes_part:
            footnotes_xml = footnotes_part._element
            for fn in footnotes_xml.findall(f".//{W_NS}footnote"):
                fn_id = fn.get(f"{W_NS}id")
                if fn_id and fn_id not in {"0", "-1"}:
                    text = "".join(t.text or "" for t in fn.findall(f".//{W_NS}t")).strip()
                    if text:
                        footnotes[fn_id] = text
    except Exception:
        pass
    return footnotes


# ── Run formatting ─────────────────────────────────────────────────

def _empty_format_flags() -> Dict[str, bool]:
    """Return a default format flags dict with all flags set to False."""
    return {
        "bold": False,
        "italic": False,
        "underline": False,
        "code": False,
        "small": False,
        "superscript": False,
        "subscript": False,
    }


def _get_run_format(run) -> Dict[str, bool]:
    """
    Return a dict of formatting flags for this run.

    Each run can have multiple flags set at once (e.g. bold + underline).
    This dict representation allows adjacent runs with identical
    formatting to be merged correctly, which eliminates most of the
    "broken markdown" artifacts that previously required regex
    cleanup downstream.

    Rules:
    - If the font is monospace, only `code` is set; all other flags
      are False. Markdown code spans cannot contain other inline
      formatting, so we short-circuit there.
    - superscript and subscript are mutually exclusive by nature;
      if both are somehow set, superscript wins.
    """
    flags = _empty_format_flags()

    # Code (monospace font) takes priority and suppresses other flags.
    try:
        font_name = run.font.name
        if font_name and font_name.lower() in MONOSPACE_FONTS:
            flags["code"] = True
            return flags
    except Exception:
        pass

    flags["bold"] = bool(getattr(run, "bold", False))
    flags["italic"] = bool(getattr(run, "italic", False))
    flags["underline"] = bool(getattr(run, "underline", False))

    font_size = None
    try:
        if run.font.size:
            # python-docx gives size in points; we store half-points.
            font_size = run.font.size.pt * 2
        else:
            r_pr = _safe_find(run._element, f"{W_NS}rPr")
            if r_pr is not None:
                sz = _safe_find(r_pr, f"{W_NS}sz")
                if sz is not None:
                    font_size = int(sz.get(f"{W_NS}val", DEFAULT_FONT_SIZE))
    except Exception:
        font_size = None

    flags["small"] = bool(font_size and font_size <= SMALL_FONT_THRESHOLD)

    try:
        r_pr = _safe_find(run._element, f"{W_NS}rPr")
        if r_pr is not None:
            vert_align = _safe_find(r_pr, f"{W_NS}vertAlign")
            if vert_align is not None:
                val = vert_align.get(f"{W_NS}val")
                if val == "superscript":
                    flags["superscript"] = True
                elif val == "subscript":
                    flags["subscript"] = True
    except Exception:
        pass

    if flags["superscript"]:
        flags["subscript"] = False

    return flags


def _apply_markdown_format(flags: Dict[str, bool], text: str) -> str:
    """
    Apply markdown/HTML formatting to text based on a flags dict.

    Wrapping order matters for readability of the output. We apply from
    innermost to outermost as follows (outer wrappers are applied last):

      1. code        - innermost, and Markdown disallows other formatting
                       inside a code span, so if code is set, we stop here.
      2. superscript / subscript  (mutually exclusive)
      3. small
      4. underline
      5. italic
      6. bold        - outermost

    The order means a run that is both bold and italic becomes
    `**_text_**` (bold on the outside, italic inside).

    Leading and trailing whitespace inside the text is moved OUTSIDE
    the wrappers before applying them. This matters because Word
    authors often include a trailing space inside a bold run
    (e.g. "AI ") which would otherwise render as "**AI **" in markdown.
    Some renderers tolerate that; others (and assistive tech) treat
    the trailing space as part of the emphasis, which is noisy and
    semantically wrong. Moving the whitespace outside produces
    "**AI** " which renders and reads correctly everywhere.

    If text is empty or whitespace-only, no formatting is applied,
    because `** **` and similar produce malformed markdown.
    """
    if not text:
        return text

    if flags.get("code"):
        if "\n" in text:
            return text
        return f"`{text}`"

    if not text.strip():
        return text

    # Split out leading/trailing whitespace so wrappers hug just the
    # visible content. We reattach the whitespace after wrapping.
    stripped = text.strip()
    leading_len = len(text) - len(text.lstrip())
    trailing_len = len(text) - len(text.rstrip())
    leading = text[:leading_len]
    trailing = text[len(text) - trailing_len:] if trailing_len else ""

    result = stripped

    if flags.get("superscript"):
        result = f"<sup>{result}</sup>"
    elif flags.get("subscript"):
        result = f"<sub>{result}</sub>"

    if flags.get("small"):
        result = f"<small>{result}</small>"

    if flags.get("underline"):
        result = f"<u>{result}</u>"

    if flags.get("italic"):
        result = f"*{result}*"

    if flags.get("bold"):
        result = f"**{result}**"

    return f"{leading}{result}{trailing}"


# ── Run extraction and conversion ──────────────────────────────────

def _extract_runs_data(para, doc_hyperlinks: Dict[str, str]) -> List[dict]:
    """
    Walk a paragraph's runs and return a list of dicts, one per run,
    with keys {text, format, hyperlink}.

    The text preserves Word's soft line breaks (<w:br/> -> "\\n") and
    tabs (<w:tab/> -> "\\t"), because downstream code-block handling
    needs them intact to preserve indentation.
    """
    runs_data: List[dict] = []
    ordered_hyperlinks = _extract_paragraph_hyperlinks(para, doc_hyperlinks)
    hyperlink_cursor = 0

    for run in para.runs:
        run_xml = run._element
        text_parts: List[str] = []

        for child in run_xml:
            tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
            if tag == "t":
                text_parts.append(child.text or "")
            elif tag == "br":
                text_parts.append("\n")
            elif tag == "tab":
                text_parts.append("\t")

        text = "".join(text_parts) if text_parts else (run.text or "")
        if not text:
            continue

        hyperlink, hyperlink_cursor = _match_run_to_hyperlink(
            text, ordered_hyperlinks, hyperlink_cursor
        )

        runs_data.append(
            {
                "text": text,
                "format": _get_run_format(run),
                "hyperlink": hyperlink,
            }
        )

    return runs_data


def _runs_to_markdown(runs_data: List[dict]) -> str:
    """
    Convert a list of run dicts into a single markdown string.

    Runs are merged when their format flags are identical AND their
    hyperlink targets match. This is what eliminates the
    `**text****text**` style artifacts that used to require regex
    cleanup: when Word arbitrarily splits a bold span into two runs
    with the same formatting, they merge back into one before
    markdown wrapping is applied.
    """
    if not runs_data:
        return ""

    merged: List[dict] = []

    for item in runs_data:
        same_format = (
            merged
            and merged[-1]["format"] == item["format"]
            and merged[-1]["hyperlink"] == item["hyperlink"]
        )
        if same_format:
            merged[-1]["text"] += item["text"]
        else:
            merged.append(dict(item))

    parts: List[str] = []

    for item in merged:
        formatted = _apply_markdown_format(item["format"], item["text"])
        if item["hyperlink"]:
            formatted = f"[{formatted}]({item['hyperlink']})"
        parts.append(formatted)

    return "".join(parts).strip()


# ── Per-paragraph helpers ──────────────────────────────────────────

def _append_footnote_refs(para, markdown_text: str, footnotes: Dict[str, str]) -> str:
    """
    Append a markdown footnote reference like [^3] for every
    <w:footnoteReference> inside the paragraph that has a known
    body in the footnotes dict. Returns the original text unchanged
    if there are no references.
    """
    try:
        for fn_ref in para._element.findall(f".//{W_NS}footnoteReference"):
            fn_id = fn_ref.get(f"{W_NS}id")
            if fn_id and fn_id in footnotes:
                markdown_text += f"[^{fn_id}]"
    except Exception:
        pass
    return markdown_text