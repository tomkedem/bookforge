"""
Reads a Word or PDF file and extracts raw text.
Supports .docx and .pdf formats.
"""

from pathlib import Path
from docx import Document


def ingest(file_path: str) -> dict:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if path.suffix == ".docx":
        return _ingest_docx(path)
    elif path.suffix == ".pdf":
        return _ingest_pdf(path)
    else:
        raise ValueError(f"Unsupported format: {path.suffix}")


def _format_runs(para) -> str:
    """
    Convert paragraph runs to Markdown-formatted text.
    Preserves bold (**text**), italic (*text*), and bold+italic (***text***).
    Consecutive runs with the same formatting are merged before wrapping.
    """
    parts = []
    for run in para.runs:
        text = run.text
        if not text:
            continue
        is_bold = bool(run.bold)
        is_italic = bool(run.italic)
        if is_bold and is_italic:
            text = f"***{text}***"
        elif is_bold:
            text = f"**{text}**"
        elif is_italic:
            text = f"*{text}*"
        parts.append(text)
    result = "".join(parts).strip()
    # Fallback to plain text if runs produce empty string
    return result if result else para.text.strip()


def _ingest_docx(path: Path) -> dict:
    doc = Document(path)
    paragraphs = []

    for doc_idx, para in enumerate(doc.paragraphs):
        if para.text.strip():
            paragraphs.append({
                "text": _format_runs(para),
                "style": para.style.name,
                "doc_para_index": doc_idx
            })

    return {
        "file": path.name,
        "format": "docx",
        "paragraphs": paragraphs,
        "total": len(paragraphs)
    }


def _ingest_pdf(path: Path) -> dict:
    try:
        from pypdf import PdfReader
    except ImportError:
        raise ImportError("pip install pypdf")

    reader = PdfReader(path)
    paragraphs = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            for line in text.split("\n"):
                if line.strip():
                    paragraphs.append({
                        "text": line.strip(),
                        "style": "Normal"
                    })

    return {
        "file": path.name,
        "format": "pdf",
        "paragraphs": paragraphs,
        "total": len(paragraphs)
    }