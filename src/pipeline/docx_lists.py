"""
docx_lists.py

Numbering-definition parsing and per-paragraph list-data extraction.

Word stores list formatting in two places:
  1. /word/numbering.xml - the DEFINITIONS. abstractNum entries
     describe the format per level (bullet style, decimal,
     lowerLetter, ...), and num entries bind a numId to an
     abstractNumId.
  2. Inside each paragraph's <w:pPr><w:numPr> - the ASSIGNMENT.
     The paragraph points at a numId and a level (ilvl).

_extract_numbering_formats flattens (1) into a {(numId, ilvl):
format_info} dict once per document.
_extract_list_data reads (2) for a single paragraph, bumps the
running counter for that (numId, ilvl), and composes the visible
prefix string ("1.", "a)", "•", ...).

The format helpers (_to_roman, _to_hebrew_letter, _get_bullet_char)
are small enough that they live here next to their one caller.
"""

from __future__ import annotations

from typing import Any, Dict, Tuple

from .docx_common import W_NS, _safe_find


# ── numbering.xml parsing ──────────────────────────────────────────

def _extract_numbering_formats(doc) -> Dict[Tuple[str, str], Dict[str, Any]]:
    """
    Read /word/numbering.xml and return a flat dict keyed by
    (numId, ilvl). Values are {numFmt, lvlText, start}.

    Missing data at either level silently falls through to defaults,
    because many Word documents use incomplete numbering definitions
    that still render correctly in Word's own UI.
    """
    formats: Dict[Tuple[str, str], Dict[str, Any]] = {}

    try:
        numbering_part = doc.part.numbering_part
        if numbering_part is None:
            return formats

        numbering_xml = numbering_part._element

        # Step 1: collect abstractNum definitions -> per-level format info.
        abstract_nums: Dict[str, Dict[str, Dict[str, Any]]] = {}

        for abstract_num in numbering_xml.findall(f"{W_NS}abstractNum"):
            abstract_id = abstract_num.get(f"{W_NS}abstractNumId")
            if not abstract_id:
                continue

            abstract_nums[abstract_id] = {}

            for lvl in abstract_num.findall(f"{W_NS}lvl"):
                ilvl = lvl.get(f"{W_NS}ilvl", "0")

                num_fmt_elem = _safe_find(lvl, f"{W_NS}numFmt")
                lvl_text_elem = _safe_find(lvl, f"{W_NS}lvlText")
                start_elem = _safe_find(lvl, f"{W_NS}start")

                num_fmt = num_fmt_elem.get(f"{W_NS}val", "decimal") if num_fmt_elem is not None else "decimal"
                lvl_text = lvl_text_elem.get(f"{W_NS}val", "%1.") if lvl_text_elem is not None else "%1."
                start = int(start_elem.get(f"{W_NS}val", "1")) if start_elem is not None else 1

                abstract_nums[abstract_id][ilvl] = {
                    "numFmt": num_fmt,
                    "lvlText": lvl_text,
                    "start": start,
                }

        # Step 2: bind numId -> abstractNumId and expand to (numId, ilvl) keys.
        for num in numbering_xml.findall(f"{W_NS}num"):
            num_id = num.get(f"{W_NS}numId")
            abstract_ref = _safe_find(num, f"{W_NS}abstractNumId")
            if num_id and abstract_ref is not None:
                abstract_id = abstract_ref.get(f"{W_NS}val")
                if abstract_id in abstract_nums:
                    for ilvl, fmt_info in abstract_nums[abstract_id].items():
                        formats[(num_id, ilvl)] = fmt_info

    except Exception:
        pass

    return formats


# ── Number formatters ──────────────────────────────────────────────

def _to_roman(num: int) -> str:
    """Convert a positive integer to uppercase Roman numerals."""
    values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    result = ""
    for i, value in enumerate(values):
        while num >= value:
            result += symbols[i]
            num -= value
    return result


def _to_hebrew_letter(num: int) -> str:
    """
    Convert 1..499 to Hebrew-letter numerals (א, ב, ... כ, ל, ... קצט).
    Falls back to the decimal string for values outside this range.
    """
    if num <= 0:
        return str(num)

    ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
    tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"]
    hundreds = ["", "ק", "ר", "ש", "ת"]

    if num < 10:
        return ones[num]
    if num < 100:
        return tens[num // 10] + ones[num % 10]
    if num < 500:
        return hundreds[num // 100] + tens[(num % 100) // 10] + ones[num % 10]
    return str(num)


def _get_bullet_char(lvl_text: str) -> str:
    """
    Translate Word's internal bullet glyphs (often Symbol-font PUA
    codepoints) into readable Unicode bullets. Returns "•" when the
    input is empty or unrecognised, so callers always get a
    displayable character.
    """
    if not lvl_text:
        return "•"

    bullet_map = {
        "\uf0b7": "•",
        "\uf0a7": "§",
        "\uf076": "◆",
        "\uf0d8": "►",
        "\uf0fc": "✓",
        "\uf06f": "○",
        "\uf06e": "■",
        "\uf0a8": "➢",
        "•": "•",
        "○": "○",
        "●": "●",
        "■": "■",
        "□": "□",
        "◆": "◆",
        "◇": "◇",
        "►": "►",
        "▶": "▶",
        "➢": "➢",
        "➤": "➤",
        "→": "→",
        "✓": "✓",
        "✗": "✗",
        "★": "★",
        "☆": "☆",
        "-": "-",
    }

    if lvl_text in bullet_map:
        return bullet_map[lvl_text]

    for char in lvl_text:
        if char in bullet_map:
            return bullet_map[char]

    return "•"


# ── Per-paragraph list data ────────────────────────────────────────

def _extract_list_data(para, numbering_counters, numbering_formats) -> dict:
    """
    Return a dict describing this paragraph's position in a Word list,
    or all-None defaults when the paragraph is not a list item.

    numbering_counters is a mutable {(numId, ilvl): current_value}
    dict maintained across paragraphs in the document. We read and
    bump it here so successive list items get 1, 2, 3, ... without
    the caller having to track anything.
    """
    list_data = {
        "num_id": None,
        "ilvl": None,
        "prefix": None,
        "num_format": None,
    }

    try:
        p_pr = _safe_find(para._element, f"{W_NS}pPr")
        if p_pr is None:
            return list_data

        num_pr = _safe_find(p_pr, f"{W_NS}numPr")
        if num_pr is None:
            return list_data

        num_id_elem = _safe_find(num_pr, f"{W_NS}numId")
        ilvl_elem = _safe_find(num_pr, f"{W_NS}ilvl")

        if num_id_elem is None:
            return list_data

        num_id = num_id_elem.get(f"{W_NS}val")
        ilvl = ilvl_elem.get(f"{W_NS}val", "0") if ilvl_elem is not None else "0"

        # numId=0 is Word's sentinel for "not actually a list".
        if num_id == "0":
            return list_data

        key = (num_id, ilvl)
        fmt_info = numbering_formats.get(
            key,
            {"numFmt": "decimal", "lvlText": "%1.", "start": 1},
        )

        if key not in numbering_counters:
            numbering_counters[key] = fmt_info.get("start", 1)
        else:
            numbering_counters[key] += 1

        current_num = numbering_counters[key]
        num_fmt = fmt_info["numFmt"]
        lvl_text = fmt_info["lvlText"]

        if num_fmt == "bullet":
            # Emit a standard markdown bullet marker ("-") instead of
            # the original Unicode glyph from Word (•, ◆, ►, ...).
            #
            # Downstream, Astro's markdown pipeline turns "- text"
            # into <ul><li>...</li></ul> (with list styling, hanging
            # indent, and accessibility treatment), whereas "• text"
            # renders as a plain <p> that happens to start with a
            # bullet character. Only the HTML-list form benefits
            # from the reading view's list styles and from assistive
            # technology recognising it as a list.
            prefix = "-"
        elif num_fmt == "decimal":
            prefix = lvl_text.replace("%1", str(current_num))
        elif num_fmt == "lowerLetter":
            prefix = lvl_text.replace("%1", chr(ord("a") + (current_num - 1) % 26))
        elif num_fmt == "upperLetter":
            prefix = lvl_text.replace("%1", chr(ord("A") + (current_num - 1) % 26))
        elif num_fmt == "lowerRoman":
            prefix = lvl_text.replace("%1", _to_roman(current_num).lower())
        elif num_fmt == "upperRoman":
            prefix = lvl_text.replace("%1", _to_roman(current_num))
        elif num_fmt in {"hebrew1", "hebrew2"}:
            prefix = lvl_text.replace("%1", _to_hebrew_letter(current_num))
        else:
            prefix = lvl_text.replace("%1", str(current_num))

        list_data["num_id"] = num_id
        list_data["ilvl"] = int(ilvl)
        list_data["prefix"] = prefix
        list_data["num_format"] = num_fmt

    except Exception:
        pass

    return list_data