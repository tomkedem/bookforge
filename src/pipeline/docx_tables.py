"""
docx_tables.py

Table extraction. Produces structured dicts with per-cell runs and
pre-rendered markdown text, ready for parse.py to format into pipe
tables.

Bold inheritance
----------------
Word Table Styles can declare that the header row and/or the first
column render in bold without putting <w:b> on individual runs.
python-docx's run.bold returns None in that case, so a naive pass
through _runs_to_markdown would drop the emphasis entirely.

We recover the intent with two heuristics:
  1. Every cell in the first row of a table is treated as header
     and gets bold.
  2. Any cell whose <w:cnfStyle w:firstColumn="1"> is set gets bold.

These match how typical Hebrew technical tables are authored. False
positives are possible if a Table Style deliberately skips the
first-column bold, but that combination is rare.
"""

from __future__ import annotations

from typing import Any, Dict, List

from .docx_common import W_NS
from .docx_runs import _empty_format_flags, _extract_runs_data, _runs_to_markdown


def _cell_has_first_column_style(tc) -> bool:
    """
    Return True when the cell is tagged as the table's first column
    via Word's conditional formatting (<w:cnfStyle w:firstColumn="1">).
    """
    try:
        tc_pr = tc.find(f"{W_NS}tcPr")
        if tc_pr is None:
            return False
        cnf = tc_pr.find(f"{W_NS}cnfStyle")
        if cnf is None:
            return False
        first_col = cnf.get(f"{W_NS}firstColumn")
        return first_col == "1"
    except Exception:
        return False


def _force_bold_on_runs(runs: List[dict]) -> List[dict]:
    """
    Return a copy of runs with bold=True forced on every run that
    has visible text. Whitespace-only runs are left alone - wrapping
    them in bold produces "** **" which is broken markdown.

    We don't mutate the input; the same run dicts may be referenced
    elsewhere.
    """
    out: List[dict] = []
    for r in runs:
        new_fmt = dict(r.get("format", _empty_format_flags()))
        if r.get("text", "").strip():
            new_fmt["bold"] = True
        out.append({
            "text": r.get("text", ""),
            "format": new_fmt,
            "hyperlink": r.get("hyperlink"),
        })
    return out


def _extract_table_cell_runs(tc, paragraph_map, doc_hyperlinks: Dict[str, str]) -> List[dict]:
    """
    Extract runs from a table cell with full formatting preserved.

    A cell contains one or more paragraphs, each with its own runs.
    We call _extract_runs_data (the same helper used for body
    paragraphs) per paragraph, and insert a newline run between
    adjacent paragraphs so the logical break is not lost.

    parse.py's pipe-table builder will later collapse newlines into
    spaces (pipe tables cannot contain real line breaks), but the
    runs themselves keep the break for any downstream tooling that
    wants it.
    """
    # Imported here instead of at module level because the docx
    # import chain is heavy; tables are the only consumer.
    from docx.text.paragraph import Paragraph

    all_runs: List[dict] = []

    try:
        cell_paragraphs = tc.findall(f"{W_NS}p")
        if not cell_paragraphs:
            # Some cells nest paragraphs inside other elements
            # (sdt content controls, for example).
            cell_paragraphs = tc.findall(f".//{W_NS}p")

        for p_idx, p_elem in enumerate(cell_paragraphs):
            # Paragraph wrapper needs a "parent" for style inheritance;
            # None is acceptable because we only read runs.
            para = Paragraph(p_elem, None)
            para_runs = _extract_runs_data(para, doc_hyperlinks)

            if p_idx > 0 and para_runs:
                all_runs.append({
                    "text": "\n",
                    "format": _empty_format_flags(),
                    "hyperlink": None,
                })

            all_runs.extend(para_runs)
    except Exception:
        pass

    return all_runs


def _extract_table_data(
    tbl_element,
    doc_index: int,
    paragraph_map: Dict[Any, Any],
    doc_hyperlinks: Dict[str, str],
) -> dict:
    """
    Extract a table into a structured dict.

    Each cell carries:
      - runs: list of run dicts with format flags
      - text: markdown string built from the runs, with pipe
        characters escaped so they don't break pipe-table syntax

    Bold is force-applied to the header row and to any cell marked
    as firstColumn via cnfStyle (see module docstring).
    """
    rows = []

    try:
        tr_elements = tbl_element.findall(f".//{W_NS}tr")
        for row_idx, tr in enumerate(tr_elements):
            row = []
            is_header_row = (row_idx == 0)
            for tc in tr.findall(f".//{W_NS}tc"):
                runs = _extract_table_cell_runs(tc, paragraph_map, doc_hyperlinks)

                if is_header_row or _cell_has_first_column_style(tc):
                    runs = _force_bold_on_runs(runs)

                md_text = _runs_to_markdown(runs)
                # Escape pipes so they don't break pipe-table syntax.
                md_text = md_text.replace("|", r"\|")
                row.append(
                    {
                        "text": md_text,
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