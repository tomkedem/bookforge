# tasks/todo.md

## משימה נוכחית: העלאת "Practical Python for AI Engineering"

זה הספר הראשון עם קוד אמיתי (Python, Bash, Plaintext). המשתמש עשה הרבה שינויים בקוד — צריך לוודא שהכל עובד.

### שלבים מדויקים

#### שלב 0 — Pre-flight ✅
- [x] וודא שהקובץ קיים: D:\Books\Practical Python for AI Engineering.docx (4.7MB, ✅)
- [x] קרא lessons.md (✅ ראיתי 46 לקחים מהעבר)
- [x] בדוק git status (✅ עץ נקי, לא staged deletions)
- [ ] **עוד:**
  - [ ] Create branch feature/add-practical-python-ai
  - [ ] Verify python run_pipeline.py works correctly

#### שלב 1 — Pipeline Execution
- [ ] הרץ: `python run_pipeline.py "D:\Books\Practical Python for AI Engineering.docx"`
- [ ] בדוק פלטים:
  - [ ] `output/practical-python-ai/chapter-*.he.md` קיימים
  - [ ] `output/practical-python-ai/content-structure.json` קיים
  - [ ] `public/practical-python-ai/assets/` יש תמונות

#### שלב 2 — Code Block Verification (קריטי!)
- [ ] פתח 3 קבצי MD לדוגמה מ-output/practical-python-ai/
- [ ] בדוק Python blocks: `\`\`\`python ... \`\`\`` (פורמט נכון?)
- [ ] בדוק Bash blocks: `\`\`\`bash ... \`\`\`` (pip install, etc.)
- [ ] בדוק Plaintext blocks: `\`\`\`plaintext ... \`\`\`` (output)
- [ ] בדוק Inline code: `` `backtick` `` (קצר)
- [ ] **אם משהו לא נכון:**
  - [ ] הרץ: `python fix_code_blocks.py` ו-commit

#### שלב 3 — Translation
- [ ] Pipeline מריץ תרגום אוטומטי ל-EN ו-ES
- [ ] בדיקה ידנית: grep ב-.en.md שאין "def", "import", "pip" שתורגמו

#### שלב 4 — Image Sync
- [ ] וודא שתמונות מופיעות ב-.en.md וה-.es.md
- [ ] בדוק: `public/practical-python-ai/assets/` יש image-*.png + cover.png

#### שלב 5 — Build
- [ ] הרץ: `npm run build` → zero errors
- [ ] בדוק: `npx astro check` → zero TypeScript errors
- [ ] בדוק: `npm run dev` → dev server מתניע בלי שגיאות

#### שלב 6 — QA
- [ ] פתח דפדפן: `http://localhost:3000/read/practical-python-ai/chapter-01`
- [ ] בדוק CodeRunner:
  - [ ] Python code block עם כפתור "הרץ"
  - [ ] לחץ Run → מקבל פלט
  - [ ] שורות ממוספרות נכון
- [ ] בדוק CodeBlock:
  - [ ] Bash block עם כפתור Copy
  - [ ] Terminal theme (ירוק)
  - [ ] שורות ממוספרות
- [ ] בדוק תמונות:
  - [ ] תמונות טעונות ב-HE ו-EN
  - [ ] חוצצים responsive על mobile
- [ ] בדוק RTL:
  - [ ] עברית מימין לשמאל ✅
  - [ ] Code blocks תמיד LTR ✅

#### שלב 7 — Commit & PR
- [ ] Commit: `git add -A && git commit -m "feat: add Practical Python for AI Engineering book"`
- [ ] Push: `git push -u origin feature/add-practical-python-ai`
- [ ] Open PR עם:
  - [ ] שם הספר: Practical Python for AI Engineering
  - [ ] מספר פרקים
  - [ ] שפות: HE + EN + ES
  - [ ] Note על Python code blocks + Bash + Plaintext

### Notes
- **Source file:** D:\Books\Practical Python for AI Engineering.docx
- **Output slug:** practical-python-ai
- **Branch:** feature/add-practical-python-ai
- **First time:** זה הספר הראשון עם קוד אמיתי — יש להיות זהירים עם זיהוי code blocks
- **Key risk:** Font detection במילת Ingest.py עלול לא לזהות את כל קוד ה-Word

---

## להלן: Lessons learned רלוונטיים

מקובץ lessons.md - שימו לב:

1. **SDT cover detection:** תמונות עשויות להיות בStructured Document Tags, לא רק בparagraphs
2. **Font monospace detection:** `ingest.py` סומך על זיהוי גופן מונו-ספייס
3. **Em dashes:** החלף בקו רגיל (-)
4. **Translation:** קוד לא צריך להיות מתורגם - Translator צריך לדלג
5. **List styling:** Tailwind מסיר list-style - צריך לכתוב `list-style-type: disc/decimal`
6. **Image positioning:** תמונות חייבות עם מימדים ודייקות
7. **Language switching:** מקור אמת יחיד בלבד (localStorage, לא URL)
