# אסטרטגיית Token Optimization של BookForge

## עקרון מרכזי

המודל צריך להתאים לסוג החשיבה שהמשימה דורשת.
Haiku לסריקה וארגון. Sonnet להבנה והחלטות.

## בחירת מודל לכל סוכן

| סוכן             | מודל   | סיבה                          |
|------------------|--------|-------------------------------|
| Explorer         | Haiku  | סורק ומדווח, אין שיקול דעת   |
| Parser           | Sonnet | מחלץ ומבין מבנה, דורש הבנה   |
| Content Architect| Sonnet | מחליט על מבנה, דורש שיקול דעת|
| Organizer        | Haiku  | מעביר קבצים, אין שיקול דעת   |
| Translator       | Sonnet | מתרגם בצורה טבעית, דורש הבנה |
| UI Designer      | Sonnet | מגדיר עיצוב, דורש שיקול דעת  |
| Builder          | Sonnet | כותב קוד, דורש הבנה עמוקה    |
| Memory Keeper    | Sonnet | מחליט על עקביות, דורש שיקול  |
| Error Handler    | Sonnet | מאבחן ומתקן, דורש הבנה       |
| Code Reviewer    | Sonnet | בודק איכות, דורש שיקול דעת   |
| Quality Gate     | Sonnet | מאשר או דוחה, דורש שיקול דעת |

## שימוש ב-/effort

```bash
# משימות מכניות
/effort low
"הפעל Explorer על AI_Developer_Fitness.docx"

# משימות רגילות
/effort medium
"הפעל Parser על הקובץ"

# החלטות קריטיות
/effort high
"הפעל Quality Gate על הקומפוננטים החדשים"
```
## Haiku לאורקסטרציה

הסוכן הראשי מתאם בין הסוכנים אבל לא מבצע משימות מורכבות.
פתח את Claude Code כך:

Windows:
claude --model claude-haiku-4-5-20251001

Mac / Linux:
claude --model claude-haiku-4-5-20251001

שני הפתרונות יחד, /compact ו-Haiku לאורקסטרציה,
יכולים לחסוך 40-60% מעלות הריצה.

נכון לאפריל 2026. בדוק את שם המודל העדכני בכתובת code.claude.com

## שימוש ב-/compact

הסוכן הראשי צובר tokens בכל שלב. אחרי תשעה שלבים ה-context מלא
בתוצאות ביניים שכבר לא נחוצות.

/compact מחליפה את כל היסטוריית השיחה בסיכום קצר.
המידע החשוב נשמר, tokens מיותרים נמחקים.

הסוכן הראשי מריץ אותה לבד אחרי כל שלב לפי ההגדרה ב-CLAUDE.md.
חיסכון משוער: 40-60% מה-tokens של הסוכן הראשי.

## שימוש ב-/batch

```bash
# תרגום כל הפרקים במקביל
/batch "תרגם את כל קבצי chapter-XX.he.md לאנגלית"

# בדיקת כל הקומפוננטים במקביל
/batch "הרץ Code Reviewer על כל קומפוננט ב-src/components/"

# חילוץ תמונות במקביל
/batch "חלץ תמונות מכל קבצי chapter-XX.he.md"
```

## כללי Project Index

עדכן את ה-Index בכל פעם שמוסיפים קובץ חדש.
Index שלא מעודכן גרוע יותר מאין Index.
משפט אחד לכל קובץ, לא יותר.

## כלל הגישה ההיברידית

Subagents עם Haiku: Explorer, Organizer.
Subagents עם Sonnet: שאר הסוכנים.
Agent Team עם Sonnet: Memory Keeper, Error Handler, Code Reviewer.
Agent Team רץ פעם אחת בסוף, לא בכל שלב.

> נכון לאפריל 2026.
> בדוק זמינות הפקודות בכתובת code.claude.com