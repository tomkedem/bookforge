"""
docx_code.py

Code-related helpers used by ingestion:
  * _detect_code_style_language - the AUTHORITATIVE detector.
    Reads the Word paragraph style name ("Code Python", "Code Bash",
    "Code Yaml", ...) and returns the canonical language slug that
    goes into the fenced-code header.
  * _detect_code_language - LEGACY content-based detector. Looks at
    the text and guesses the language from keyword patterns. No
    longer used for paragraph classification (that's style-only
    now) but kept for historical blocks where the style is absent
    but we still need a best-guess label.

The module also exports MONOSPACE_FONTS, which run-level formatting
uses to mark an inline run as code (for ``inline code`` spans
inside a normal paragraph).
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional


# Fonts we treat as "code" when we see them on a RUN inside a
# paragraph. This is only about inline `code spans`; it does NOT
# classify whole paragraphs as code - that's a Word-style decision.
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


# Heuristic patterns used by the legacy content-based language
# detector. Each list is ordered roughly by how distinctive the
# pattern is. We count matches per language and pick the highest
# scorer (with a small override for TypeScript vs JavaScript, see
# _detect_code_language).
LANGUAGE_PATTERNS: Dict[str, List[str]] = {
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


def _detect_code_style_language(style_name: str) -> Optional[str]:
    """
    If a paragraph is explicitly marked with a Word style named
    "Code <Language>" (e.g., "Code Python", "Code Bash", "Code Yaml"),
    return the language portion in lowercase.

    This is the authoritative detector in the current pipeline.
    Authors create paragraph styles per language in Word and apply
    them to each code paragraph; ingest then does not need to guess
    the language from content or font heuristics.

    Matching is case-insensitive and tolerant of common style-naming
    variants Word allows ("Code Python", "code python", "Code-Python",
    "Code_Python", "CodePython"). Returns None if the style is not a
    Code-* style.

    The returned language is lowercased and mapped to its canonical
    form where the author used a short name ("py" -> "python",
    "sh" -> "bash"). This keeps the fenced-code output consistent
    regardless of how the style was named.
    """
    if not style_name:
        return None

    s = style_name.strip().lower()

    lang = None
    for prefix in ("code ", "code-", "code_"):
        if s.startswith(prefix):
            lang = s[len(prefix):].strip()
            break

    # Single-token form ("codepython", "codeyaml") - catches authors
    # who created styles without a separator.
    if lang is None and s.startswith("code") and len(s) > 4 and s[4].isalpha():
        lang = s[4:].strip()

    if not lang:
        return None

    aliases = {
        "py": "python",
        "sh": "bash",
        "shell": "bash",
        "yml": "yaml",
        "js": "javascript",
        "ts": "typescript",
        "md": "markdown",
    }
    return aliases.get(lang, lang)


def _detect_code_language(text: str) -> str:
    """
    Guess the language of a code snippet by counting matches of
    characteristic keyword patterns. Returns an empty string when
    nothing matches.

    This is the LEGACY detector. The pipeline now reads the language
    from the Code-* paragraph style (see _detect_code_style_language);
    this function is kept as a fallback for blocks whose style
    does not carry a language but which are still classified as
    code (e.g. inline-font heuristics in historical content).
    """
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

    # TypeScript looks like JavaScript plus type annotations; when
    # both fire we need a stronger TS signal to prefer it.
    if "typescript" in scores and "javascript" in scores:
        return "typescript" if scores["typescript"] >= 2 else "javascript"

    return max(scores, key=scores.get)