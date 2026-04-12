"""
Organizes chapter markdown files into the output directory.
Creates the folder structure for each book.
Cleans stale files from previous runs and generates content-structure.json.

Now supports dynamic languages - pass any list of language codes.
"""

import json
import re
from pathlib import Path
from .languages import LANGUAGE_CODES, SOURCE_LANGUAGE


def organize(book_name: str, chapters_md: list[dict], output_dir: str = "output",
             languages: list[str] = None,
             book_titles: dict[str, str] = None,
             book_subtitles: dict[str, str] = None,
             book_descriptions: dict[str, str] = None) -> list[str]:
    """
    Organize chapter files into output directory.
    
    Args:
        book_name: Name of the book (used for folder/slug)
        chapters_md: List of chapter dicts with 'content' and optional 'type'
        output_dir: Base output directory
        languages: List of language codes to support (default: all from config)
        book_titles: Dict of {lang: title} for book titles
        book_subtitles: Dict of {lang: subtitle} for book subtitles
        book_descriptions: Dict of {lang: description} for book descriptions
    """
    if languages is None:
        languages = LANGUAGE_CODES
    if book_titles is None:
        book_titles = {}
    if book_subtitles is None:
        book_subtitles = {}
    if book_descriptions is None:
        book_descriptions = {}
        
    slug = _slugify(book_name)
    book_dir = Path(output_dir) / slug
    book_dir.mkdir(parents=True, exist_ok=True)

    # Note: Assets are stored in public/{slug}/assets/, not in output/
    # See parse.py extract_images() for asset handling

    # Clean stale chapter files from previous runs (for all languages)
    _clean_stale_chapters(book_dir, len(chapters_md), languages)

    created = []
    content_chapter_num = 0  # Counter for regular chapters (not intro)

    for chapter in chapters_md:
        chapter_type = chapter.get("type", "content")
        
        if chapter_type == "intro":
            # Introduction saved as intro.he.md
            he_file = book_dir / "intro.he.md"
            print(f"  [INTRO] מבוא נשמר כ-intro.he.md")
        else:
            # Regular chapters numbered from 01
            content_chapter_num += 1
            num = str(content_chapter_num).zfill(2)
            he_file = book_dir / f"chapter-{num}.he.md"
        
        he_file.write_text(chapter["content"], encoding="utf-8")
        created.append(str(he_file))

    # Generate content-structure.json with dynamic language support
    _generate_content_structure(book_dir, chapters_md, languages, book_titles, book_subtitles, book_descriptions)

    return created


def _clean_stale_chapters(book_dir: Path, chapter_count: int, languages: list[str]):
    """Remove chapter files with numbers beyond the current chapter count."""
    # Clean stale chapter files for all languages
    for lang in languages:
        for f in book_dir.glob(f"chapter-*.{lang}.md"):
            match = re.match(r"chapter-(\d+)\.", f.name)
            if match:
                num = int(match.group(1))
                # chapter_count includes intro, so actual chapters = chapter_count - 1
                if num > chapter_count - 1:
                    f.unlink()
                    print(f"  [CLEAN] Removed stale: {f.name}")


def _generate_content_structure(book_dir: Path, chapters_md: list[dict],
                                 languages: list[str],
                                 book_titles: dict[str, str],
                                 book_subtitles: dict[str, str],
                                 book_descriptions: dict[str, str]):
    """Generate content-structure.json from chapter markdown content with dynamic language support."""
    chapters_json = []
    content_chapter_num = 0  # Counter for regular chapters
    default_title = _format_title(book_dir.name)
    
    for ch in chapters_md:
        content = ch["content"]
        lines = content.split("\n")
        chapter_type = ch.get("type", "content")

        # Title from first # heading (source language)
        title_source = ""
        for line in lines:
            m = re.match(r"^#\s+(.+)", line)
            if m:
                title_source = m.group(1).strip()
                break

        sections = sum(1 for line in lines if re.match(r"^##\s+", line))
        has_images = "<img " in content or "![" in content
        word_count = len(content.split())

        if chapter_type == "intro":
            chapter_id = "intro"
            file_slug = "intro"
        else:
            content_chapter_num += 1
            chapter_id = content_chapter_num
            file_slug = f"chapter-{str(content_chapter_num).zfill(2)}"

        # Build titles dict for all languages (placeholder until translation)
        chapter_titles = {lang: title_source for lang in languages}

        chapters_json.append({
            "id": chapter_id,
            "file_slug": file_slug,
            "type": chapter_type,
            "titles": chapter_titles,
            # Legacy fields for backward compatibility
            "title_he": title_source,
            "title_en": title_source,
            "sections": sections,
            "has_images": has_images,
            "word_count": word_count,
            "topics": []
        })

    # Build book-level titles/subtitles/descriptions for all languages
    titles = {}
    subtitles = {}
    descriptions = {}
    
    for lang in languages:
        titles[lang] = book_titles.get(lang) or book_titles.get(SOURCE_LANGUAGE) or default_title
        subtitles[lang] = book_subtitles.get(lang) or book_subtitles.get(SOURCE_LANGUAGE) or ""
        descriptions[lang] = book_descriptions.get(lang) or book_descriptions.get(SOURCE_LANGUAGE) or ""

    data = {
        "book": {
            "titles": titles,
            "subtitles": subtitles,
            "descriptions": descriptions,
            # Legacy fields for backward compatibility
            "title_he": titles.get('he') or default_title,
            "title_en": titles.get('en') or default_title,
            "subtitle_he": subtitles.get('he') or "",
            "subtitle_en": subtitles.get('en') or "",
            "chapters": chapters_json,
            "languages": languages
        }
    }

    json_path = book_dir / "content-structure.json"
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  [OK] content-structure.json: {len(chapters_json)} chapters, {len(languages)} languages")


def _format_title(slug: str) -> str:
    return slug.replace("-", " ").title()


def _slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    return name.strip("-")