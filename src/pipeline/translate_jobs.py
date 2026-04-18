from pathlib import Path
from pipeline.languages import get_language_meta
from .translation_config import resolve_target_languages


def get_chapters_to_translate(book_dir: str, target_languages: list[str] = None) -> list[dict]:
    """
    Find Hebrew chapters that need translation for requested target languages.
    """
    book_path = Path(book_dir)
    to_translate = []

    langs = resolve_target_languages(target_languages)

    for lang in langs:
        intro_file = book_path / "intro.he.md"
        if intro_file.exists():
            target_file = book_path / f"intro.{lang['code']}.md"
            needs_translation = (
                not target_file.exists()
                or target_file.stat().st_mtime < intro_file.stat().st_mtime
            )
            if needs_translation:
                to_translate.append({
                    "number": "intro",
                    "he_path": str(intro_file),
                    "target_path": str(target_file),
                    "lang_code": lang["code"],
                    "lang_name": lang["name"],
                })

        for he_file in sorted(book_path.glob("chapter-*.he.md")):
            target_file = he_file.with_name(
                he_file.name.replace(".he.md", f".{lang['code']}.md")
            )
            num = he_file.name.replace("chapter-", "").replace(".he.md", "")

            needs_translation = (
                not target_file.exists()
                or target_file.stat().st_mtime < he_file.stat().st_mtime
            )

            if needs_translation:
                to_translate.append({
                    "number": num,
                    "he_path": str(he_file),
                    "target_path": str(target_file),
                    "lang_code": lang["code"],
                    "lang_name": lang["name"],
                })

    return to_translate


# 🔥 NEW: strict safety rules (centralized)
TRANSLATION_RULES = """
כללים (חובה):
- שמור על אותו מבנה Markdown בדיוק (כותרות, רשימות, טבלאות)
- אל תשנה בשום אופן תגיות HTML, במיוחד <img> (השאר אותן בדיוק כפי שהן)
- אל תשנה בלוקים של קוד (``` ```), השאר אותם בדיוק כפי שהם
- אל תשנה קישורים או נתיבים
- תרגם רק את הטקסט הקריא למשתמש
- תרגם בצורה טבעית, לא מילולית
- מונחים טכניים שאינם ניתנים לתרגום: השאר במקור
- אל תוסיף ואל תקצר תוכן
- אל תוסיף הסברים, רק תוכן מתורגם
"""


def build_translation_prompt(he_path: str, target_path: str, lang_name: str) -> str:
    """Single file translation prompt."""
    he_content = Path(he_path).read_text(encoding="utf-8")

    return f"""תרגם את הקובץ הבא מעברית ל-{lang_name}.

{TRANSLATION_RULES}

קובץ מקור: {he_path}
קובץ יעד: {target_path}

תוכן לתרגום:

{he_content}

החזר רק את התוכן המתורגם המלא.
"""


def build_batch_prompt(chapters: list[dict], target_languages: list[str] = None) -> str:
    if not chapters:
        return ""

    file_list = "\n".join(
        f"  {i+1}. [{ch['lang_name']}] {ch['he_path']} → {ch['target_path']}"
        for i, ch in enumerate(chapters)
    )

    unique_codes = list(dict.fromkeys(ch["lang_code"] for ch in chapters))
    lang_summary = ", ".join(
        f"{get_language_meta(code).label_en} (.{code}.md)"
        for code in unique_codes
        if get_language_meta(code)
    )

    return f"""מצב Batch: תרגם {len(chapters)} פרקים מעברית לשפות היעד ({lang_summary}).

{TRANSLATION_RULES}

רשימת קבצים לתרגום:
{file_list}

הוראות עבודה:
1. קרא כל קובץ .he.md מהרשימה
2. תרגם אותו לשפה המצוינת
3. כתוב את התוצאה לקובץ היעד המקביל
4. עבור מיד לקובץ הבא - אל תחכה לאישור

בסיום דווח:
- translated: מספר קבצים שתורגמו
- skipped: מספר קבצים שדולגו (אם יש)
- total_words: אומדן כולל של מילים שתורגמו
"""


def partition_chapters(chapters: list[dict], num_groups: int = 3) -> list[list[dict]]:
    if not chapters:
        return []

    num_groups = min(num_groups, len(chapters))
    groups = [[] for _ in range(num_groups)]

    for i, chapter in enumerate(chapters):
        groups[i % num_groups].append(chapter)

    return [g for g in groups if g]


def build_group_prompt(chapters: list[dict], group_id: int, total_groups: int) -> str:
    if not chapters:
        return ""

    file_list = "\n".join(
        f"  {i+1}. [{ch['lang_name']}] {ch['he_path']} → {ch['target_path']}"
        for i, ch in enumerate(chapters)
    )

    unique_langs = list(dict.fromkeys(ch["lang_name"] for ch in chapters))
    lang_str = ", ".join(unique_langs)

    return f"""אתה Translator {group_id} מתוך {total_groups} (מצב מקבילי).

משימתך: תרגם {len(chapters)} פרקים מעברית ל-{lang_str}.

{TRANSLATION_RULES}

רשימת קבצים שלך:
{file_list}

הוראות:
1. קרא כל קובץ .he.md
2. תרגם לשפה המצוינת
3. כתוב לקובץ היעד
4. עבור מיד לקובץ הבא - אל תחכה לאישור

בסיום דווח:
- translated: מספר קבצים
- total_words: אומדן מילים
"""