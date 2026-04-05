# agent-team-design.md
# תכנון צוות הסוכנים של BookForge

## מתי משתמשים ב-Agent Teams

Agent Teams מופעלים כשיש צורך בתקשורת ישירה בין סוכנים.
ב-BookForge זה קורה בשלב הביקורת, כשMemory Keeper,
Error Handler, ו-Code Reviewer עובדים במקביל על אותו קומפוננט.

## הרכב הצוות

### team lead
הסוכן הראשי של BookForge. מחלק משימות ומאחד תוצאות.

### teammates
- memory: בודק עקביות עם design-system.json ו-tasks/lessons.md
- reviewer: בודק איכות קוד ועמידה בעקרונות SOLID
- error: מזהה ומתקן שגיאות

## תקשורת מותרת בין teammates

memory   <-> reviewer
memory   <-> error
error    <-> builder
reviewer  -> quality-gate
memory    -> quality-gate
error     -> quality-gate
builder   -> quality-gate

כל תקשורת שלא מוגדרת כאן עוברת דרך הסוכן הראשי.

## מבנה ה-inbox

.claude/
└── team/
├── memory-inbox.json
├── reviewer-inbox.json
├── error-inbox.json
└── quality-gate-inbox.json
## פורמט הודעה
```json
{
  "from": "string",
  "to": "string",
  "type": "question" | "alert" | "info",
  "content": "string",
  "priority": "critical" | "high" | "medium" | "low",
  "timestamp": "ISO string"
}
```

## סוגי הודעות

question: שאלה שדורשת תשובה לפני המשך העבודה
alert: התראה על בעיה קריטית שלא דורשת תשובה
info: מידע שימושי שלא דורש תגובה

## כללי תקשורת

### timeout
אם teammate לא מגיב תוך 5 דקות:
דווח לסוכן הראשי ואל תחכה יותר.

### עדיפות
הודעות critical מטופלות לפני הכל.
הודעות high מטופלות לפני המשך העבודה.
הודעות medium ו-info מטופלות בסיום המשימה הנוכחית.

### קונפליקט
אם שני teammates מגיעים למסקנות סותרות:
שניהם מדווחים לסוכן הראשי.
הסוכן הראשי מחליט.

## תרחיש לדוגמה

Code Reviewer מגלה שקומפוננט BookCard לא עקבי עם design-system.json:

1. reviewer שולח question ל-memory עם priority: high
2. memory בודק ומאשר את הקונפליקט
3. memory שולח alert ל-error
4. error מתקן את הקומפוננט
5. reviewer בודק שוב ומאשר
6. כולם שולחים info ל-quality-gate
7. quality-gate מאשר להמשיך

## הפעלה

הוסף ל-settings.json:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

דרוש Claude Code v2.1.32 ומעלה.

> נכון לאפריל 2026.
> בדוק את התיעוד הרשמי בכתובת code.claude.com לפני יישום.