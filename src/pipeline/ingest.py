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
    if not para.runs:
        return para.text.strip()
    
    # Group consecutive runs by formatting type
    groups = []  # [(formatting_type, text), ...]
    
    for run in para.runs:
        text = run.text
        if not text:
            continue
        
        # Determine formatting type
        is_bold = bool(run.bold)
        is_italic = bool(run.italic)
        if is_bold and is_italic:
            fmt = "bold_italic"
        elif is_bold:
            fmt = "bold"
        elif is_italic:
            fmt = "italic"
        else:
            fmt = "plain"
        
        # Merge with previous group if same formatting
        if groups and groups[-1][0] == fmt:
            groups[-1] = (fmt, groups[-1][1] + text)
        else:
            groups.append((fmt, text))
    
    # Convert groups to markdown
    parts = []
    for fmt, text in groups:
        if fmt == "bold_italic":
            parts.append(f"***{text}***")
        elif fmt == "bold":
            parts.append(f"**{text}**")
        elif fmt == "italic":
            parts.append(f"*{text}*")
        else:
            parts.append(text)
    
    result = "".join(parts).strip()
    
    # Clean up redundant asterisks: **** → nothing, ** ** → space
    result = _clean_markdown_asterisks(result)
    
    return result if result else para.text.strip()


def _clean_markdown_asterisks(text: str) -> str:
    """
    Clean up malformed markdown asterisks from Word formatting artifacts.
    This is the FIRST cleanup pass - parse.py has a final cleanup for any remaining issues.
    
    Patterns fixed:
    - **** (4+ asterisks) → **
    - **text****more** → **text more**
    - ** ** (space between markers) → space
    - Orphaned ** at start/end
    - Hebrew prefix letters: ה**text** → **הtext**
    """
    import re
    
    # Remove 4+ consecutive asterisks → **
    text = re.sub(r'\*{4,}', '**', text)
    
    # Fix patterns like **text****more** (adjacent bold without space)
    text = re.sub(r'\*\*([^*]+)\*\*\*\*([^*]+)\*\*', r'**\1 \2**', text)
    
    # Fix space between bold markers: ** ** → just space
    text = re.sub(r'\*\*\s+\*\*', ' ', text)
    
    # Clean leading/trailing orphaned **
    text = re.sub(r'^\*\*\s*\*\*', '', text)
    text = re.sub(r'\*\*\s*\*\*$', '', text)
    
    # Fix Hebrew prefix letters before bold: ה**text** → **הtext**
    text = re.sub(r'([הבלמכווש])\*\*([^*]+)\*\*', r'**\1\2**', text)
    
    # Fix **text**.**  → **text**.
    text = re.sub(r'\*\*\.\*\*', '.', text)
    
    # Fix **:** → :
    text = re.sub(r'\*\*:\*\*', ':', text)
    
    return text.strip()


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