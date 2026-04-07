# פרק 2: CLAUDE.md כארכיטקטורה [EN]

CLAUDE.md כחוקה [TRANSLATED]

רוב המפתחים שמשתמשים ב-Claude Code כותבים CLAUDE.md פעם אחת, שמים בו כמה הוראות כלליות, ושוכחים ממנו. התוצאה היא סוכן שמתנהג אחרת בכל session, מקבל החלטות שגויות, וגורם לך לחזור ולתקן את אותם דברים שוב ושוב. [TRANSLATED]

CLAUDE.md הוא לא README. הוא לא תיעוד. הוא החוקה של הפרויקט. [TRANSLATED]

ההבדל בין מסמך לחוקה הוא פשוט: מסמך מתאר. חוקה מחייבת. כשאתה כותב ב-CLAUDE.md "אל תגע בקבצי output ללא אישור מפורש", זה לא המלצה. זה כלל שהסוכן מכבד בכל session ובכל משימה שהוא מבצע. [TRANSLATED]

הסוכן קורא את CLAUDE.md בתחילת כל session. מה שלא כתבת שם, הוא יחליט לבד. ולא תמיד כמו שתרצה. [TRANSLATED]

לפני שממשיכים, צור את הקבצים הבאים בשורש הפרויקט: [TRANSLATED]

Mac / Linux: [TRANSLATED]

Bash [TRANSLATED]

touch CLAUDE.md [TRANSLATED]

touch CLAUDE.local.md [TRANSLATED]

touch .gitignore [TRANSLATED]

mkdir tasks [TRANSLATED]

touch tasks/todo.md [TRANSLATED]

touch tasks/lessons.md [TRANSLATED]

Windows: [TRANSLATED]

Powershell [TRANSLATED]

ni CLAUDE.md [TRANSLATED]

ni CLAUDE.local.md [TRANSLATED]

ni .gitignore [TRANSLATED]

ni -ItemType Directory tasks [TRANSLATED]

ni tasks\todo.md [TRANSLATED]

ni tasks\lessons.md [TRANSLATED]

.gitignore [TRANSLATED]

הקובץ הראשון שנמלא הוא .gitignore הוא מגדיר אילו קבצים Git לא יעלה לעולם ל-GitHub. [TRANSLATED]

פתח את .gitignore והוסף: [TRANSLATED]

# קבצים אישיים שלא עולים ל-GitHub [EN]

CLAUDE.local.md [TRANSLATED]

# תלויות [EN]

node_modules/ [TRANSLATED]

# קבצי סביבה [EN]

.env [TRANSLATED]

.env.local [TRANSLATED]

Mac / Linux: [TRANSLATED]

bash [TRANSLATED]

echo "CLAUDE.local.md" >> .gitignore [TRANSLATED]

Windows: [TRANSLATED]

powershell [TRANSLATED]

Add-Content .gitignore "CLAUDE.local.md" [TRANSLATED]

CLAUDE.local.md להגדרות אישיות [TRANSLATED]

יש הגדרות ששייכות לפרויקט ויש הגדרות ששייכות למכונה שלך בלבד. [TRANSLATED]

CLAUDE.md עולה ל-GitHub ומשותף עם כל מי שעובד על הפרויקט. לכן הוא מכיל כללים אוניברסליים: ארכיטקטורה, גבולות, תקנים. [TRANSLATED]

CLAUDE.local.md נשאר אצלך בלבד. הוא נמצא ב-.gitignore ולא עולה לשום מקום. שמים שם דברים אישיים: [TRANSLATED]

markdown [TRANSLATED]

# CLAUDE.local.md [EN]

## סביבה מקומית [EN]

- Python נמצא ב: C:\Python312 [TRANSLATED]

- Node נמצא ב: C:\Program Files\nodejs [TRANSLATED]

- קובץ הספר לעיבוד: D:\Books\AI_Developer_Fitness.docx [TRANSLATED]

## העדפות אישיות [EN]

- תמיד הצג התקדמות בעברית [TRANSLATED]

- לפני כל פעולה destructive שאל אותי [TRANSLATED]

פתח את CLAUDE.local.md וכתוב בו את הנתיבים של הסביבה שלך. זה הקובץ היחיד בפרויקט שאף אחד מלבדך לא יראה. [TRANSLATED]

tasks/todo.md ו-tasks/lessons.md [TRANSLATED]

שני הקבצים האלה הם הזיכרון החי של הפרויקט. [TRANSLATED]

tasks/todo.md הוא תוכנית העבודה. לפני כל משימה שהסוכן מבצע, הוא כותב לשם את התוכנית ולא מתחיל לכתוב קוד לפני שאתה מאשר. זה מונע את אחת הבעיות הנפוצות ביותר: סוכן שמתחיל לבצע ורק אחר כך מגלה שהבין את המשימה אחרת. [TRANSLATED]

markdown [TRANSLATED]

# tasks/todo.md [EN]

## משימה נוכחית [EN]

פירוק AI_Developer_Fitness.docx לפרקים [TRANSLATED]

## תוכנית [EN]

- [ ] Explorer סורק את הקובץ ומדווח על מבנה [TRANSLATED]

- [ ] Parser מחלץ כל פרק לקובץ נפרד [TRANSLATED]

- [ ] Translator מתרגם כל פרק לאנגלית [TRANSLATED]

- [ ] Organizer מסדר את הקבצים במבנה הנכון [TRANSLATED]

## סטטוס [EN]

בביצוע [TRANSLATED]

tasks/lessons.md הוא הזיכרון המצטבר. בכל פעם שאתה מתקן את הסוכן, הוא כותב לשם את הלקח. בפתיחת session חדש, הסוכן קורא את הקובץ הזה לפני שמתחיל לעבוד. [TRANSLATED]

markdown [TRANSLATED]

# tasks/lessons.md [EN]

## לקחים [EN]

### 2026-04-05 [EN]

כשמחלצים תמונות מ-Word, חייב לשמור את שם המשתנה [TRANSLATED]

המקורי ולא לשנות אותו. תמונה ששמה השתנה שוברת [TRANSLATED]

את ההפניה בתוך קובץ ה-MD. [TRANSLATED]

### 2026-04-05 [EN]

Translator לא מתרגם כותרות עם מספרים. צריך [TRANSLATED]

להוסיף לו הוראה מפורשת לכך. [TRANSLATED]

אחרי שבוע של עבודה, lessons.md הוא המסמך הכי יקר בפרויקט. הוא מכיל את כל מה שלמדת על האופן שבו הסוכנים שלך מתנהגים. [TRANSLATED]

מי כותב ל-lessons.md? שניהם. הסוכן כותב כשהוא מתקן שגיאה בעצמו, Error Handler מוגדר לכתוב אחרי כל תיקון. אתה כותב כשאתה מגלה תובנה ארכיטקטונית שהסוכן לא יכול לדעת לבד. [TRANSLATED]

מי קורא את lessons.md? הסוכן קורא אותו בתחילת כל session לפני שהוא מתחיל לעבוד. זה מה שמאפשר לו לדעת מראש מה לא לעשות, בלי לשאול אותך ובלי לחזור שוב על טעויות ישנות. [TRANSLATED]

Claude Code לא זוכר בין sessions. כל session מתחיל מאפס. lessons.md הוא מה שמחבר בין sessions ומונע מהמערכת לחזור על אותן טעויות שוב ושוב. זהו הזיכרון של המערכת. [TRANSLATED]

פתח את שני הקבצים והוסף כותרת ראשונית: [TRANSLATED]

tasks/todo.md: [TRANSLATED]

markdown [TRANSLATED]

# tasks/todo.md [EN]

## משימה נוכחית [EN]

_תתעדכן לפני כל משימה_ [TRANSLATED]

tasks/lessons.md: [TRANSLATED]

markdown [TRANSLATED]

# tasks/lessons.md [EN]

## לקחים [EN]

_יתעדכן לאחר כל תיקון_ [TRANSLATED]

הקוד בפעולה [TRANSLATED]

הקוד המלא של פרק זה זמין ב:  https://github.com/tomkedem/bookforge [TRANSLATED]

עיין בשינויים, הרץ, ושאל שאלות ישירות ב-Issues. [TRANSLATED]

Project Index למניעת קריאות כפולות [TRANSLATED]

אחת הבעיות הנפוצות ביותר במערכות סוכנים היא קריאות כפולות. הסוכן פותח את אותו קובץ שוב ושוב, שורף tokens מיותרים, ומאט את כל הפרויקט. מחקר שנעשה על 132 sessions הראה ש-71% מכלל קריאות הקבצים היו קבצים שהסוכן כבר פתח באותו session. [TRANSLATED]

הפתרון הוא Project Index, מפה של הפרויקט שהסוכן קורא פעם אחת בתחילת כל session ומשתמש בה כדי לדעת מה יש בכל קובץ לפני שהוא פותח אותו. [TRANSLATED]

Project Index נכתב ישירות בתוך CLAUDE.md: [TRANSLATED]

markdown [TRANSLATED]

## Project Index [EN]

### קבצי מקור [EN]

src/pipeline/ingest.py       קריאת קובץ Word או PDF וחילוץ טקסט גולמי [TRANSLATED]

src/pipeline/parse.py        פירוק לפרקים לפי כותרות [TRANSLATED]

src/pipeline/organize.py     בניית מבנה קבצי MD לפי שפה [TRANSLATED]

src/pipeline/build.py        יצירת skeleton של אפליקציית Astro [TRANSLATED]

### סוכנים [EN]

.claude/agents/explorer.md      סורק מבנה קבצים [TRANSLATED]

.claude/agents/parser.md        מחלץ פרקים ותמונות [TRANSLATED]

.claude/agents/translator.md    מתרגם מעברית לאנגלית [TRANSLATED]

.claude/agents/organizer.md     מסדר קבצי MD [TRANSLATED]

.claude/agents/ui-designer.md   מעצב קומפוננטים [TRANSLATED]

.claude/agents/builder.md       בונה קוד Astro [TRANSLATED]

### פלט [EN]

output/{book-name}/chapter-01.he.md    פרק בעברית [TRANSLATED]

output/{book-name}/chapter-01.en.md    פרק באנגלית [TRANSLATED]

output/{book-name}/assets/             תמונות [TRANSLATED]

כל פעם שמוסיפים קובץ חדש לפרויקט, מעדכנים את ה-Index. הסוכן לא צריך לסרוק את הפרויקט מאפס בכל session, הוא כבר יודע מה יש ואיפה. [TRANSLATED]

פתח את CLAUDE.md והוסף את ה-Project Index שלך. עדכן אותו לפי מבנה הפרויקט הספציפי שלך. [TRANSLATED]

הקוד בפעולה [TRANSLATED]

הקוד המלא של פרק זה זמין ב:  https://github.com/tomkedem/bookforge [TRANSLATED]

עיין בשינויים, הרץ, ושאל שאלות ישירות ב-Issues. [TRANSLATED]

מה יש עכשיו ב-GitHub [TRANSLATED]

bookforge/ [TRANSLATED]

├── README.md [TRANSLATED]

├── CLAUDE.md [TRANSLATED]

├── .gitignore [TRANSLATED]

├── docs/ [TRANSLATED]

│   └── architecture-thinking.md [TRANSLATED]

└── tasks/ [TRANSLATED]

├── todo.md [TRANSLATED]

└── lessons.md [TRANSLATED]

לפרק הכנה הבאנו README.md. פרק 1 הביא את architecture-thinking.md. פרק 2 הביא את CLAUDE.md, .gitignore, ואת תיקיית tasks. [TRANSLATED]

הפרויקט מתחיל לקבל צורה. עדיין אין קוד. עדיין אין סוכנים. אבל יש ארכיטקטורה, חוקה, וזיכרון. [TRANSLATED]

