"""
ingest.py

Faithful DOCX ingestion for Hebrew and mixed-direction Word documents.

Goals:
- Preserve paragraph order
- Preserve paragraph layout:
  alignment, direction, left/right indent, first-line indent, hanging indent,
  spacing before/after, line spacing
- Preserve inline formatting (runs)
- Preserve hyperlinks
- Preserve footnotes
- Preserve numbering metadata
- Preserve tables as structured data
- Keep JSON as the source of truth
- Do NOT force HTML wrappers into code blocks
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from docx import Document
except ImportError:
    raise ImportError(
        "\n\n" + "=" * 60 + "\n"
        "חסרה חבילת python-docx!\n"
        "התקן באמצעות: pip install python-docx\n"
        + "=" * 60 + "\n"
    )


W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

DEFAULT_FONT_SIZE = 24
SMALL_FONT_THRESHOLD = 18

MONOSPACE_FONTS = {
    "courier",
    "courier new",
    "consolas",
    "monaco",
    "menlo",
    "lucida console",
    "dejavu sans mono",
    "source code pro",
    "fira code",
    "jetbrains mono",
    "inconsolata",
    "roboto mono",
}

LANGUAGE_PATTERNS = {
    "python": [
        r"\bdef\s+\w+\s*\(",
        r"\bclass\s+\w+[:\(]",
        r"\bimport\s+\w+",
        r"\bfrom\s+\w+\s+import",
        r"\bprint\s*\(",
        r"\bif\s+__name__\s*==",
        r"\bself\.",
        r"\bfor\s+\w+\s+in\s+",
        r"\blen\s*\(",
        r"\brange\s*\(",
        r"\breturn\s+",
        r"^\s*#\s*[^\!]",
    ],
    "bash": [
        r"^#!/bin/(ba)?sh",
        r"\$\{?\w+\}?",
        r"\becho\s+",
        r"\bcd\s+",
        r"\bls\b",
        r"\bmkdir\s+",
        r"\brm\s+",
        r"\bcp\s+",
        r"\bmv\s+",
        r"\bcat\s+",
        r"\bgrep\s+",
        r"\bawk\s+",
        r"\bsed\s+",
        r"\bcurl\s+",
        r"\bwget\s+",
        r"\bsudo\s+",
        r"\bapt(?:-get)?\s+",
        r"\bnpm\s+",
        r"\bpip\s+",
        r"\bgit\s+",
        r"\bdocker\s+",
        r"\s+\|\s+",
        r"\s+&&\s+",
    ],
    "javascript": [
        r"\bconst\s+\w+\s*=",
        r"\blet\s+\w+\s*=",
        r"\bvar\s+\w+\s*=",
        r"\bfunction\s+\w+\s*\(",
        r"=>\s*[{\(]?",
        r"\bconsole\.(?:log|error|warn)",
        r"\brequire\s*\(",
        r"\bexport\s+(?:default\s+)?",
        r"\basync\s+function",
        r"\bawait\s+",
        r"\.then\s*\(",
        r"\.forEach\s*\(",
        r"\.map\s*\(",
    ],
    "typescript": [
        r":\s*(?:string|number|boolean|void|any)\b",
        r"\binterface\s+\w+",
        r"\btype\s+\w+\s*=",
        r"<\w+>",
        r"\bas\s+\w+",
    ],
    "json": [
        r'^\s*\{[\s\n]*"',
        r"^\s*\[[\s\n]*[\{\[]",
    ],
    "sql": [
        r"\bSELECT\b",
        r"\bFROM\b",
        r"\bWHERE\b",
        r"\bINSERT\s+INTO\b",
        r"\bUPDATE\b",
        r"\bDELETE\s+FROM\b",
        r"\bCREATE\s+TABLE\b",
    ],
    "html": [
        r"<(?:!DOCTYPE|html|head|body|div|span|p|a|img)",
        r"</\w+>",
    ],
    "css": [
        r"\{\s*[\w-]+\s*:",
        r"\.[a-zA-Z][\w-]*\s*\{",
        r"#[a-zA-Z][\w-]*\s*\{",
    ],
}


def _safe_find(element: Any, xpath: str):
    try:
        return element.find(xpath)
    except Exception:
        return None


def _to_int(value: Optional[str]) -> Optional[int]:
    try:
        return int(value) if value is not None else None
    except Exception:
        return None


def _safe_text(value: Optional[str]) -> str:
    return value or ""


def _safe_paragraph_text(para) -> str:
    try:
        return para.text or ""
    except Exception:
        return ""


def _safe_style_name(para) -> str:
    try:
        style = para.style
        if style is None:
            return "Unknown"
        name = getattr(style, "name", None)
        return name or "Unknown"
    except Exception:
        return "Unknown"


def _build_paragraph_element_map(doc) -> Dict[Any, Any]:
    mapping: Dict[Any, Any] = {}
    try:
        for para in doc.paragraphs:
            mapping[para._element] = para
    except Exception:
        pass
    return mapping


def _extract_document_hyperlinks(doc) -> Dict[str, str]:
    hyperlinks: Dict[str, str] = {}
    try:
        for rel in doc.part.rels.values():
            if "hyperlink" in rel.reltype:
                hyperlinks[rel.rId] = rel._target
    except Exception:
        pass
    return hyperlinks


def _extract_footnotes(doc) -> Dict[str, str]:
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


def _extract_paragraph_hyperlinks(para, doc_hyperlinks: Dict[str, str]) -> List[Tuple[str, str]]:
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
    if not run_text or cursor >= len(ordered_hyperlinks):
        return None, cursor

    link_text, url = ordered_hyperlinks[cursor]

    if run_text == link_text:
        return url, cursor + 1

    if run_text in link_text or link_text in run_text:
        return url, cursor

    return None, cursor


def _clean_markdown_asterisks(text: str) -> str:
    text = re.sub(r"\*{4,}", "**", text)
    text = re.sub(r"\*\*([^*]+)\*\*\*\*([^*]+)\*\*", r"**\1 \2**", text)
    text = re.sub(r"\*\*\s+\*\*", " ", text)
    text = re.sub(r"^\*\*\s*\*\*", "", text)
    text = re.sub(r"\*\*\s*\*\*$", "", text)
    text = re.sub(r"([הובכלמש])\*\*([^*]+)\*\*", r"**\1\2**", text)
    text = re.sub(r"\*\*\.\*\*", ".", text)
    text = re.sub(r"\*\*:\*\*", ":", text)
    return text.strip()


def _detect_code_language(text: str) -> str:
    if not text or not text.strip():
        return ""

    scores: Dict[str, int] = {}

    for lang, patterns in LANGUAGE_PATTERNS.items():
        score = 0
        for pattern in patterns:
            try:
                score += len(re.findall(pattern, text, re.MULTILINE | re.IGNORECASE))
            except Exception:
                continue
        if score > 0:
            scores[lang] = score

    if not scores:
        return ""

    if "typescript" in scores and "javascript" in scores:
        return "typescript" if scores["typescript"] >= 2 else "javascript"

    return max(scores, key=scores.get)


def _get_run_format(run) -> str:
    try:
        font_name = run.font.name
        if font_name and font_name.lower() in MONOSPACE_FONTS:
            return "code"
    except Exception:
        pass

    is_bold = bool(getattr(run, "bold", False))
    is_italic = bool(getattr(run, "italic", False))
    is_underline = bool(getattr(run, "underline", False))

    font_size = None
    try:
        if run.font.size:
            font_size = run.font.size.pt * 2
        else:
            r_pr = _safe_find(run._element, f"{W_NS}rPr")
            if r_pr is not None:
                sz = _safe_find(r_pr, f"{W_NS}sz")
                if sz is not None:
                    font_size = int(sz.get(f"{W_NS}val", DEFAULT_FONT_SIZE))
    except Exception:
        font_size = None

    is_small = bool(font_size and font_size <= SMALL_FONT_THRESHOLD)

    is_superscript = False
    is_subscript = False
    try:
        r_pr = _safe_find(run._element, f"{W_NS}rPr")
        if r_pr is not None:
            vert_align = _safe_find(r_pr, f"{W_NS}vertAlign")
            if vert_align is not None:
                val = vert_align.get(f"{W_NS}val")
                if val == "superscript":
                    is_superscript = True
                elif val == "subscript":
                    is_subscript = True
    except Exception:
        pass

    if is_superscript:
        return "superscript"
    if is_subscript:
        return "subscript"
    if is_bold and is_italic:
        return "bold_italic"
    if is_bold:
        return "bold"
    if is_italic:
        return "italic"
    if is_underline:
        return "underline"
    if is_small:
        return "small"

    return "plain"


def _apply_markdown_format(fmt: str, text: str) -> str:
    if fmt == "bold_italic":
        return f"***{text}***"
    if fmt == "bold":
        return f"**{text}**"
    if fmt == "italic":
        return f"*{text}*"
    if fmt == "code":
        if "\n" in text:
            return text
        return f"`{text}`"
    if fmt == "underline":
        return f"<u>{text}</u>"
    if fmt == "superscript":
        return f"<sup>{text}</sup>"
    if fmt == "subscript":
        return f"<sub>{text}</sub>"
    if fmt == "small":
        return f"<small>{text}</small>"
    return text


def _extract_runs_data(para, doc_hyperlinks: Dict[str, str]) -> List[dict]:
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
    if not runs_data:
        return ""

    merged: List[dict] = []

    for item in runs_data:
        if (
            merged
            and merged[-1]["format"] == item["format"]
            and merged[-1]["hyperlink"] == item["hyperlink"]
        ):
            merged[-1]["text"] += item["text"]
        else:
            merged.append(dict(item))

    parts: List[str] = []

    for item in merged:
        formatted = _apply_markdown_format(item["format"], item["text"])
        if item["hyperlink"]:
            formatted = f"[{formatted}]({item['hyperlink']})"
        parts.append(formatted)

    return _clean_markdown_asterisks("".join(parts).strip())


def _extract_paragraph_layout(para) -> dict:
    p_pr = _safe_find(para._element, f"{W_NS}pPr")

    layout = {
        "alignment": None,
        "direction": None,
        "left_indent_twips": None,
        "right_indent_twips": None,
        "first_line_indent_twips": None,
        "hanging_indent_twips": None,
        "space_before_twips": None,
        "space_after_twips": None,
        "line_spacing_twips": None,
    }

    if p_pr is None:
        return layout

    jc = _safe_find(p_pr, f"{W_NS}jc")
    if jc is not None:
        val = jc.get(f"{W_NS}val")
        layout["alignment"] = {
            "left": "left",
            "right": "right",
            "center": "center",
            "both": "justify",
            "start": "left",
            "end": "right",
        }.get(val)

    bidi = _safe_find(p_pr, f"{W_NS}bidi")
    layout["direction"] = "rtl" if bidi is not None else "ltr"

    ind = _safe_find(p_pr, f"{W_NS}ind")
    if ind is not None:
        layout["left_indent_twips"] = _to_int(ind.get(f"{W_NS}left") or ind.get(f"{W_NS}start"))
        layout["right_indent_twips"] = _to_int(ind.get(f"{W_NS}right") or ind.get(f"{W_NS}end"))
        layout["first_line_indent_twips"] = _to_int(ind.get(f"{W_NS}firstLine"))
        layout["hanging_indent_twips"] = _to_int(ind.get(f"{W_NS}hanging"))

    spacing = _safe_find(p_pr, f"{W_NS}spacing")
    if spacing is not None:
        layout["space_before_twips"] = _to_int(spacing.get(f"{W_NS}before"))
        layout["space_after_twips"] = _to_int(spacing.get(f"{W_NS}after"))
        layout["line_spacing_twips"] = _to_int(spacing.get(f"{W_NS}line"))

    return layout


def _extract_numbering_formats(doc) -> Dict[Tuple[str, str], Dict[str, Any]]:
    formats: Dict[Tuple[str, str], Dict[str, Any]] = {}

    try:
        numbering_part = doc.part.numbering_part
        if numbering_part is None:
            return formats

        numbering_xml = numbering_part._element
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


def _to_roman(num: int) -> str:
    values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    result = ""
    for i, value in enumerate(values):
        while num >= value:
            result += symbols[i]
            num -= value
    return result


def _to_hebrew_letter(num: int) -> str:
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


def _extract_list_data(para, numbering_counters, numbering_formats) -> dict:
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
            prefix = _get_bullet_char(lvl_text)
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


def _append_footnote_refs(para, markdown_text: str, footnotes: Dict[str, str]) -> str:
    try:
        for fn_ref in para._element.findall(f".//{W_NS}footnoteReference"):
            fn_id = fn_ref.get(f"{W_NS}id")
            if fn_id and fn_id in footnotes:
                markdown_text += f"[^{fn_id}]"
    except Exception:
        pass
    return markdown_text


def _classify_paragraph_block(style_name: str, runs_data: List[dict], markdown_text: str) -> str:
    style_lower = (style_name or "").lower()

    if style_lower.startswith("heading") or "כותרת" in style_lower:
        return "heading"

    if markdown_text.count("\n") >= 2:
        code_ratio = 0
        if runs_data:
            code_runs = sum(1 for r in runs_data if r["format"] == "code")
            code_ratio = code_runs / max(1, len(runs_data))

        detected_lang = _detect_code_language(markdown_text)
        if code_ratio >= 0.4 or detected_lang:
            return "code"

    return "paragraph"


def _extract_table_cell_runs(tc) -> List[dict]:
    text = []
    try:
        for t in tc.findall(f".//{W_NS}t"):
            text.append(t.text or "")
    except Exception:
        pass

    joined = "".join(text).strip()
    if not joined:
        return []

    return [
        {
            "text": joined,
            "format": "plain",
            "hyperlink": None,
        }
    ]


def _extract_table_data(tbl_element, doc_index: int) -> dict:
    rows = []

    try:
        for tr in tbl_element.findall(f".//{W_NS}tr"):
            row = []
            for tc in tr.findall(f".//{W_NS}tc"):
                runs = _extract_table_cell_runs(tc)
                text = "".join(r["text"] for r in runs).replace("|", r"\|")
                row.append(
                    {
                        "text": text,
                        "runs": runs,
                    }
                )
            if row:
                rows.append(row)
    except Exception:
        pass

    return {
        "id": f"tbl-{doc_index}",
        "type": "table",
        "doc_index": doc_index,
        "rows": rows,
    }


def _extract_document_metadata(doc, path: Path) -> dict:
    props = None
    try:
        props = doc.core_properties
    except Exception:
        props = None

    title = None
    author = None

    try:
        title = props.title if props and props.title else None
    except Exception:
        title = None

    try:
        author = props.author if props and props.author else None
    except Exception:
        author = None

    if not title:
        title = path.stem

    return {
        "title": title,
        "author": author,
    }


def _ingest_docx(path: Path, language: str = "he") -> dict:
    doc = Document(path)
    paragraph_map = _build_paragraph_element_map(doc)
    numbering_formats = _extract_numbering_formats(doc)
    numbering_counters: Dict[Tuple[str, str], int] = {}
    doc_hyperlinks = _extract_document_hyperlinks(doc)
    footnotes = _extract_footnotes(doc)
    metadata = _extract_document_metadata(doc, path)

    blocks: List[dict] = []
    body = doc._element.body
    doc_index = 0

    for element in body:
        tag = element.tag.split("}")[-1] if "}" in element.tag else element.tag

        if tag == "p":
            para = paragraph_map.get(element)
            if para is None:
                doc_index += 1
                continue

            raw_text = _safe_paragraph_text(para)
            style_name = _safe_style_name(para)
            runs_data = _extract_runs_data(para, doc_hyperlinks)
            markdown_text = _runs_to_markdown(runs_data)
            markdown_text = _append_footnote_refs(para, markdown_text, footnotes)
            layout = _extract_paragraph_layout(para)
            list_data = _extract_list_data(para, numbering_counters, numbering_formats)
            block_type = _classify_paragraph_block(style_name, runs_data, raw_text)

            if list_data["prefix"] and block_type != "code":
                indent = "  " * int(list_data["ilvl"] or 0)
                markdown_text = f"{indent}{list_data['prefix']} {markdown_text}"

            if raw_text.strip() or runs_data:
                block = {
                    "id": f"p-{doc_index}",
                    "type": block_type,
                    "text": markdown_text,
                    "raw_text": raw_text,
                    "style": style_name,
                    "doc_index": doc_index,
                    "runs": runs_data,
                    "layout": layout,
                    "list": list_data,
                }

                if block_type == "code":
                    block["language"] = _detect_code_language(raw_text)

                blocks.append(block)

            doc_index += 1
            continue

        if tag == "tbl":
            table_block = _extract_table_data(element, doc_index)
            if table_block["rows"]:
                blocks.append(table_block)
            doc_index += 1
            continue

        doc_index += 1

    return {
        "file": path.name,
        "format": "docx",
        "language": language,
        "metadata": metadata,
        "blocks": blocks,
        "footnotes": footnotes,
        "total_blocks": len(blocks),
    }


def ingest(file_path: str, language: str = "he") -> dict:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix == ".docx":
        return _ingest_docx(path, language=language)

    if suffix == ".pdf":
        raise ValueError(
            "\n" + "=" * 60 + "\n"
            "פורמט PDF לא נתמך.\n"
            "המר את הקובץ ל-Word (.docx) לפני העיבוד.\n"
            + "=" * 60
        )

    raise ValueError(f"Unsupported format: {path.suffix}. Use .docx files only.")


def write_content_structure(structure: dict, output_path: str | Path) -> Path:
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    with output.open("w", encoding="utf-8") as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)

    return output


def ingest_and_write_json(
    file_path: str,
    output_path: str | Path,
    language: str = "he",
) -> dict:
    structure = ingest(file_path, language=language)
    write_content_structure(structure, output_path)
    return structure