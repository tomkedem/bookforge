## Project Index


### סוכנים
.claude/agents/explorer.md           סורק מבנה קבצים
.claude/agents/parser.md             מחלץ פרקים ותמונות
.claude/agents/content-architect.md  מארגן מבנה התוכן
.claude/agents/organizer.md          מסדר קבצי MD
.claude/agents/translator.md         מתרגם מעברית לאנגלית
.claude/agents/ui-designer.md        מעצב קומפוננטים
.claude/agents/builder.md            בונה קוד Next.js
.claude/agents/memory-keeper.md      שומר עקביות
.claude/agents/error-handler.md      מזהה ומתקן שגיאות
.claude/agents/code-reviewer.md      בודק איכות קוד
.claude/agents/quality-gate.md       שער איכות סופי

## סדר הפעלת הסוכנים

כשמקבלים קובץ Word או PDF לעיבוד:

1. הפעל Explorer על הקובץ
   קלט: נתיב הקובץ
   פלט: JSON עם מבנה הספר

2. הפעל Parser
   קלט: נתיב הקובץ + JSON מ-Explorer
   פלט: קבצי chapter-XX.he.md

3. הפעל Content Architect
   קלט: כל קבצי chapter-XX.he.md
   פלט: content-structure.json

4. הפעל Organizer
   קלט: content-structure.json + קבצי MD
   פלט: מבנה תיקיות מסודר ב-output/

5. הפעל Translator
   קלט: כל קבצי chapter-XX.he.md
   פלט: כל קבצי chapter-XX.en.md

6. הפעל UI Designer
   קלט: content-structure.json
   פלט: design-system.json

7. הפעל Builder
   קלט: כל קבצי MD + design-system.json
   פלט: קומפוננטים ב-Next.js

8. הפעל במקביל: Memory Keeper, Error Handler, Code Reviewer
   קלט: פלט ה-Builder
   פלט: דוחות ממצאים

9. הפעל Quality Gate
   קלט: כל הדוחות
   פלט: אישור או דחייה

### פלט
output/{book-name}/chapter-01.he.md    פרק בעברית
output/{book-name}/chapter-01.en.md    פרק באנגלית
output/{book-name}/assets/             תמונות

## כלל בחירה: Subagents או Agent Teams

השתמש ב-Subagents כשהמשימות עצמאיות:
Explorer, Parser, Content Architect, Organizer,
Translator, UI Designer, Builder.
כל אחד עובד לבד ומחזיר תוצאה לסוכן הראשי.

השתמש ב-Agent Teams כשהסוכנים צריכים לדבר:
Memory Keeper, Error Handler, Code Reviewer.
שלושתם עובדים על אותו קומפוננט בו זמנית
ומשפיעים אחד על השני תוך כדי עבודה.
