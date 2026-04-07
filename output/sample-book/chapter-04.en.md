# פרק 3: Subagents, חלוקת עבודה נכונה [EN]

מדוע סוכן אחד לא מספיק [TRANSLATED]

נחזור לרגע למשימה שלנו: לקחת ספר בפורמט Word או PDF ולבנות ממנו פלטפורמת קריאה דיגיטלית בשתי שפות. [TRANSLATED]

אם תתן את המשימה הזאת לסוכן אחד, אחד משלושה דברים יקרה. [TRANSLATED]

הוא ינסה לעשות הכל בבת אחת וייצר קוד שמערבב פירוק תוכן, תרגום, עיצוב, ובנייה בקובץ אחד בלתי ניתן לתחזוקה. [TRANSLATED]

או שיגמר לו ה-context באמצע והוא יעצור. [TRANSLATED]

או שהוא יקבל החלטות שגויות בגלל שהוא מנסה לחשוב על יותר מדי דברים בו זמנית. [TRANSLATED]

הפתרון הוא עקרון שכל מהנדס תוכנה מכיר: הפרדת אחריות. כל רכיב אחראי על דבר אחד בלבד. [TRANSLATED]

ב-Claude Code הרכיבים האלה נקראים Subagents. [TRANSLATED]

מה זה Subagent [TRANSLATED]

Subagent הוא סוכן מתמחה שרץ ב-context window נפרד משלו. הוא מקבל משימה מהסוכן הראשי, מבצע אותה, ומחזיר תוצאה. הסוכן הראשי לא מתמלא בפרטים של כל חקירה, הוא רק מקבל את התוצאה הסופית. [TRANSLATED]

זה אומר שלוש דברים בפועל: [TRANSLATED]

ראשית, כל סוכן יכול להתמחות. [TRANSLATED]

Explorer לא צריך לדעת איך לתרגם. [TRANSLATED]

Translator לא צריך לדעת איך לבנות קומפוננט React. [TRANSLATED]

שנית, context window נשמר נקי. הסוכן הראשי לא מתמלא בקריאות קוד ובתוצאות ביניים. [TRANSLATED]

שלישית, ניתן לנתב משימות לדגמים זולים יותר. [TRANSLATED]

Explorer שרק קורא קבצים יכול לרוץ על Haiku. [TRANSLATED]

Quality Gate שמקבל החלטות מורכבות ירוץ על Sonnet. [TRANSLATED]

אחד עשר הסוכנים של BookForge [TRANSLATED]

לפני שנבנה כל סוכן, חשוב להבין את התפקיד המדויק של כל אחד ואת הסדר שבו הם פועלים. [TRANSLATED]

מפת הסוכנים המלאה של BookForge נמצאת בפרק ההכנה. הנה הסדר שבו הם פועלים בפועל: [TRANSLATED]

יצירה, כלים, מודל לכל סוכן [TRANSLATED]

כל subagent ב-Claude Code מוגדר בקובץ Markdown בתיקייה /claude/agents/. הקובץ מכיל שני חלקים: frontmatter עם ההגדרות הטכניות, וגוף הקובץ עם הוראות הסוכן. [TRANSLATED]

כל אחד עשר הסוכנים של BookForge [TRANSLATED]

להלן הגדרת כל סוכן מוכנה להכנסה לקובץ שלו בתיקייה /claude/agents. [TRANSLATED]

explorer.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: explorer [TRANSLATED]

description: > [TRANSLATED]

סורק קובץ Word או PDF ומדווח על מבנהו. [TRANSLATED]

הפעל אותי לפני כל פעולה על קובץ חדש. [TRANSLATED]

model: haiku [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

--- [TRANSLATED]

אתה Explorer. תפקידך אחד: לקרוא ולדווח. [TRANSLATED]

אל תשנה שום דבר. אל תפרק. אל תתרגם. [TRANSLATED]

קרא את הקובץ וחזור עם JSON שמכיל: [TRANSLATED]

- מספר פרקים [TRANSLATED]

- כותרת כל פרק [TRANSLATED]

- האם יש תמונות [TRANSLATED]

- שפת המקור [TRANSLATED]

parser.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: parser [TRANSLATED]

description: > [TRANSLATED]

מחלץ פרקים מקובץ Word או PDF תוך שמירה על [TRANSLATED]

מבנה מלא: כותרות, בולטים, טבלאות, ותמונות. [TRANSLATED]

הפעל אותי אחרי Explorer. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה Parser. תפקידך: לחלץ ולשמור. [TRANSLATED]

לכל פרק צור קובץ MD נפרד בשם chapter-XX.he.md. [TRANSLATED]

שמור על כל אלה בפורמט Markdown תקני: [TRANSLATED]

- כותרות וכותרות משנה [TRANSLATED]

- טקסט מודגש ונטוי [TRANSLATED]

- רשימות ממוספרות ונקודות [TRANSLATED]

- טבלאות [TRANSLATED]

- ציטוטים [TRANSLATED]

תמונות: חלץ לתיקיית assets/chapter-XX/ והוסף הפניה בקובץ ה-MD. [TRANSLATED]

אל תתרגם. אל תשנה תוכן. רק חלץ ושמור. [TRANSLATED]

content-architect.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: content-architect [TRANSLATED]

description: > [TRANSLATED]

מקבל את הפרקים שחלץ Parser ומחליט על [TRANSLATED]

מבנה התוכן הסופי לפני הארגון. [TRANSLATED]

הפעל אותי אחרי Parser. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה Content Architect. תפקידך: להחליט על מבנה. [TRANSLATED]

קרא את כל קבצי chapter-XX.he.md וצור קובץ [TRANSLATED]

content-structure.json שמכיל: [TRANSLATED]

- סדר הפרקים [TRANSLATED]

- קשרים בין פרקים [TRANSLATED]

- פרקי מבוא ופרקי סיכום [TRANSLATED]

- המלצות לניווט ב-Yuval [TRANSLATED]

אל תשנה תוכן. רק מפה ומחליט על מבנה. [TRANSLATED]

organizer.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: organizer [TRANSLATED]

description: > [TRANSLATED]

מסדר את קבצי ה-MD במבנה הסופי לפי החלטות [TRANSLATED]

Content Architect. הפעל אותי אחרי content-architect. [TRANSLATED]

model: haiku [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה Organizer. תפקידך: לסדר ולארגן. [TRANSLATED]

קרא את content-structure.json וסדר את הקבצים: [TRANSLATED]

output/{book-name}/chapter-01.he.md [TRANSLATED]

output/{book-name}/chapter-02.he.md [TRANSLATED]

output/{book-name}/assets/chapter-01/ [TRANSLATED]

אל תשנה תוכן. רק העבר וסדר. [TRANSLATED]

translator.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: translator [TRANSLATED]

description: > [TRANSLATED]

מתרגם כל קובץ MD מעברית לאנגלית תוך שמירה [TRANSLATED]

על מבנה מלא. הפעל אותי אחרי Organizer. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה Translator. תפקידך: לתרגם בלבד. [TRANSLATED]

לכל קובץ chapter-XX.he.md צור chapter-XX.en.md. [TRANSLATED]

שמור על כל אלה: [TRANSLATED]

- מבנה הכותרות המקורי [TRANSLATED]

- הדגשות ובולטים [TRANSLATED]

- טבלאות [TRANSLATED]

- הפניות לתמונות [TRANSLATED]

תרגם בצורה טבעית, לא מילולית. [TRANSLATED]

אל תשנה מבנה. אל תוסיף תוכן. רק תרגם. [TRANSLATED]

ui-designer.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: ui-designer [TRANSLATED]

description: > [TRANSLATED]

מגדיר את מערכת העיצוב של Yuval לפני שה-Builder [TRANSLATED]

מתחיל לבנות. הפעל אותי פעם אחת בתחילת הפרויקט. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה UI Designer. תפקידך: להגדיר מערכת עיצוב. [TRANSLATED]

צור קובץ design-system.json שמכיל: [TRANSLATED]

- פלטת צבעים [TRANSLATED]

- גופנים וגדלים [TRANSLATED]

- רכיבים בסיסיים: כרטיסיית ספר, דף קריאה, ניווט [TRANSLATED]

- כללי RTL לעברית [TRANSLATED]

- כללי LTR לאנגלית [TRANSLATED]

כל קומפוננט שה-Builder יכתוב חייב להתבסס על מסמך זה. [TRANSLATED]

builder.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: builder [TRANSLATED]

description: > [TRANSLATED]

בונה קומפוננטים ב- Astro  על בסיס מערכת העיצוב [TRANSLATED]

ותוכן ה-MD. הפעל אותי אחרי ui-designer. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

- bash [TRANSLATED]

--- [TRANSLATED]

אתה Builder. תפקידך: לבנות קוד בלבד. [TRANSLATED]

בנה קומפוננטים ב- Astro לפי design-system.json. [TRANSLATED]

כל קומפוננט חייב: [TRANSLATED]

- לתמוך בעברית ואנגלית [TRANSLATED]

- להשתמש ברכיבים משותפים קיימים [TRANSLATED]

- לעמוד בעקרונות SOLID [TRANSLATED]

- לכלול TypeScript types [TRANSLATED]

אל תחליט על עיצוב. אל תשנה design-system.json. [TRANSLATED]

memory-keeper.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: memory-keeper [TRANSLATED]

description: > [TRANSLATED]

שומר על עקביות לאורך כל הפרויקט. הפעל אותי [TRANSLATED]

לפני כל החלטה ארכיטקטונית חדשה. [TRANSLATED]

model: sonnet [TRANSLATED]

memory: user [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

--- [TRANSLATED]

אתה Memory Keeper. תפקידך: לזכור ולוודא עקביות. [TRANSLATED]

לפני כל החלטה חדשה בדוק שהיא עקבית עם: [TRANSLATED]

- design-system.json [TRANSLATED]

- content-structure.json [TRANSLATED]

- כל ההחלטות שנרשמו ב-tasks/lessons.md [TRANSLATED]

אם יש סתירה, דווח לסוכן הראשי לפני שממשיכים. [TRANSLATED]

error-handler.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: error-handler [TRANSLATED]

description: > [TRANSLATED]

מזהה שגיאות ומתקן אותן. הפעל אותי כשסוכן [TRANSLATED]

אחר נתקל בשגיאה שאינו יכול לפתור. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- write [TRANSLATED]

- bash [TRANSLATED]

--- [TRANSLATED]

אתה Error Handler. תפקידך: לזהות ולתקן שגיאות. [TRANSLATED]

כשאתה מקבל שגיאה: [TRANSLATED]

1. זהה את הסיבה השורשית [TRANSLATED]

2. בדוק אם הפתרון קיים ב-tasks/lessons.md [TRANSLATED]

3. תקן את הבעיה [TRANSLATED]

4. תעד את הפתרון ב-tasks/lessons.md [TRANSLATED]

אל תמשיך אם אינך בטוח בפתרון. דווח לסוכן הראשי. [TRANSLATED]

code-reviewer.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: code-reviewer [TRANSLATED]

description: > [TRANSLATED]

בודק קוד שכתב Builder לפני שעובר לשלב הבא. [TRANSLATED]

הפעל אותי אחרי כל קומפוננט חדש שנכתב. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

--- [TRANSLATED]

אתה Code Reviewer. תפקידך: לבדוק בלבד. [TRANSLATED]

לכל קומפוננט שאתה מקבל בדוק: [TRANSLATED]

- עמידה בעקרונות SOLID [TRANSLATED]

- שימוש ברכיבים משותפים קיימים [TRANSLATED]

- תמיכה בעברית ואנגלית [TRANSLATED]

- TypeScript types תקינים [TRANSLATED]

- אין קוד כפול [TRANSLATED]

החזר דוח עם ממצאים בלבד. אל תתקן בעצמך. [TRANSLATED]

quality-gate.md [TRANSLATED]

markdown [TRANSLATED]

--- [TRANSLATED]

name: quality-gate [TRANSLATED]

description: > [TRANSLATED]

שער האיכות הסופי. הפעל אותי לפני כל commit. [TRANSLATED]

אם אני לא מאשר, העבודה לא נגמרה. [TRANSLATED]

model: sonnet [TRANSLATED]

tools: [TRANSLATED]

- read [TRANSLATED]

- bash [TRANSLATED]

--- [TRANSLATED]

אתה Quality Gate. תפקידך: לאשר או לדחות. [TRANSLATED]

לפני כל commit שאל שאלה אחת: [TRANSLATED]

"Would a staff engineer approve this?" [TRANSLATED]

אם התשובה לא ברורה, החזר את העבודה. [TRANSLATED]

בדוק: [TRANSLATED]

- כל הבדיקות עוברות [TRANSLATED]

- אין קבצים שנשכחו [TRANSLATED]

- code-reviewer אישר [TRANSLATED]

- memory-keeper אישר עקביות [TRANSLATED]

רק אם הכל תקין, אשר להמשיך. [TRANSLATED]

בחר את דגם Haiku העדכני ביותר הזמין בחשבונך. בדוק את רשימת הדגמים הזמינים בכתובת code.claude.com. [TRANSLATED]

שים לב לשלושה דברים: [TRANSLATED]

ראשית, model: claude-haiku-4-5. Explorer רק קורא ומדווח. אין שום סיבה להריץ אותו על Sonnet. [TRANSLATED]

Haiku זול יותר ומהיר יותר לסריקה. [TRANSLATED]

שנית, tools: read בלבד. [TRANSLATED]

Explorer לא יכול לכתוב, לא יכול למחוק, לא יכול להריץ פקודות. הגבלת הכלים היא שכבת בטיחות. [TRANSLATED]

שלישית, ה-description כתוב בצורה שמסביר לסוכן הראשי מתי לקרוא לו. Claude Code מחליט אוטונומית מתי להעביר משימה לכל סוכן על בסיס ה-description. [TRANSLATED]

נכון לאפריל 2026. בדוק את התיעוד הרשמי בכתובת code.claude.com לפני יישום. [TRANSLATED]

מה עושים עכשיו [TRANSLATED]

צור את כל הקבצים בתיקייה .claude/agents/: [TRANSLATED]

Windows: [TRANSLATED]

powershell [TRANSLATED]

ni .claude\agents\explorer.md [TRANSLATED]

ni .claude\agents\parser.md [TRANSLATED]

ni .claude\agents\content-architect.md [TRANSLATED]

ni .claude\agents\organizer.md [TRANSLATED]

ni .claude\agents\translator.md [TRANSLATED]

ni .claude\agents\ui-designer.md [TRANSLATED]

ni .claude\agents\builder.md [TRANSLATED]

ni .claude\agents\memory-keeper.md [TRANSLATED]

ni .claude\agents\error-handler.md [TRANSLATED]

ni .claude\agents\code-reviewer.md [TRANSLATED]

ni .claude\agents\quality-gate.md [TRANSLATED]

Mac / Linux: [TRANSLATED]

bash [TRANSLATED]

touch .claude/agents/{explorer,parser,content-architect,organizer,translator,ui-designer,builder,memory-keeper,error-handler,code-reviewer,quality-gate}.md [TRANSLATED]

העתק את תוכן כל סוכן לקובץ המתאים. [TRANSLATED]

נכון לאפריל 2026. בדוק את התיעוד הרשמי בכתובת code.claude.com לפני יישום. [TRANSLATED]

פלט דו לשוני: chapter-01.he.md ו-chapter-01.en.md [TRANSLATED]

אחת ההחלטות הארכיטקטוניות שקיבלנו בפרק 1 היא שכל פרק מיוצר בשתי שפות במקביל. זה לא תרגום אוטומטי פשוט. זו מערכת שמייצרת שני מוצרים מלאים מאותו מקור. [TRANSLATED]

כך נראה הפלט של BookForge אחרי שהסוכנים מסיימים את עבודתם: [TRANSLATED]

output/ [TRANSLATED]

└── ai-developer-fitness/ [TRANSLATED]

├── chapter-01.he.md [TRANSLATED]

├── chapter-01.en.md [TRANSLATED]

├── chapter-02.he.md [TRANSLATED]

├── chapter-02.en.md [TRANSLATED]

└── assets/ [TRANSLATED]

├── chapter-01/ [TRANSLATED]

│   ├── image-01.png [TRANSLATED]

│   └── image-02.png [TRANSLATED]

└── chapter-02/ [TRANSLATED]

└── image-01.png [TRANSLATED]

כל קובץ עברי מכיל את התוכן המקורי עם כל המבנה שמור: כותרות, בולטים, טבלאות, ותמונות. כל קובץ אנגלי הוא תרגום מלא עם אותו מבנה בדיוק. [TRANSLATED]

Yuval קוראת את שני הקבצים ומגישה את הנכון לפי ההעדפה השמורה של המשתמש. [TRANSLATED]

מה עושים עכשיו [TRANSLATED]

צור את תיקיית הפלט: [TRANSLATED]

Windows: [TRANSLATED]

powershell [TRANSLATED]

ni -ItemType Directory output [TRANSLATED]

ni -ItemType Directory output\ai-developer-fitness [TRANSLATED]

ni -ItemType Directory output\ai-developer-fitness\assets [TRANSLATED]

Mac / Linux: [TRANSLATED]

bash [TRANSLATED]

mkdir -p output/ai-developer-fitness/assets [TRANSLATED]

Chaining בין סוכנים [TRANSLATED]

Chaining הוא הדפוס שבו פלט של סוכן אחד הופך לקלט של הסוכן הבא. זה הלב של מערכת BookForge. [TRANSLATED]

בלי chaining, כל סוכן עובד בבועה. עם chaining, הסוכנים יוצרים pipeline שזורם מקצה לקצה. [TRANSLATED]

כך נראה chaining בפועל ב-CLAUDE.md: [TRANSLATED]

markdown [TRANSLATED]

## סדר הפעלת הסוכנים [EN]

כשמקבלים קובץ Word או PDF לעיבוד: [TRANSLATED]

1. הפעל Explorer על הקובץ [TRANSLATED]

קלט: נתיב הקובץ [TRANSLATED]

פלט: JSON עם מבנה הספר [TRANSLATED]

2. הפעל Parser [TRANSLATED]

קלט: נתיב הקובץ + JSON מ-Explorer [TRANSLATED]

פלט: קבצי chapter-XX.he.md [TRANSLATED]

3. הפעל Content Architect [TRANSLATED]

קלט: כל קבצי chapter-XX.he.md [TRANSLATED]

פלט: content-structure.json [TRANSLATED]

4. הפעל Organizer [TRANSLATED]

קלט: content-structure.json + קבצי MD [TRANSLATED]

פלט: מבנה תיקיות מסודר ב-output/ [TRANSLATED]

5. הפעל Translator [TRANSLATED]

קלט: כל קבצי chapter-XX.he.md [TRANSLATED]

פלט: כל קבצי chapter-XX.en.md [TRANSLATED]

6. הפעל UI Designer [TRANSLATED]

קלט: content-structure.json [TRANSLATED]

פלט: design-system.json [TRANSLATED]

7. הפעל Builder [TRANSLATED]

קלט: כל קבצי MD + design-system.json [TRANSLATED]

פלט: קומפוננטים ב- Astro [TRANSLATED]

8. הפעל במקביל: Memory Keeper, Error Handler, Code Reviewer [TRANSLATED]

קלט: פלט ה-Builder [TRANSLATED]

פלט: דוחות ממצאים [TRANSLATED]

9. הפעל Quality Gate [TRANSLATED]

קלט: כל הדוחות [TRANSLATED]

פלט: אישור או דחייה [TRANSLATED]

שלושה דברים חשובים בהגדרה זו: [TRANSLATED]

ראשית, כל שלב מגדיר בדיוק מה הוא מקבל ומה הוא מחזיר. הסוכן הראשי יודע מתי שלב אחד הסתיים ומתי להפעיל את הבא. [TRANSLATED]

שנית, שלב 8 מריץ שלושה סוכנים במקביל. Memory Keeper, Error Handler, ו-Code Reviewer הם לא תלויים אחד בשני ויכולים לרוץ בו זמנית. [TRANSLATED]

שלישית, Quality Gate הוא תמיד האחרון. שום דבר לא יוצא מהמערכת בלי אישורו. [TRANSLATED]

הוסף את הגדרת ה-chaining ל-CLAUDE.md שלך תחת הכותרת "סדר הפעלת הסוכנים". [TRANSLATED]

הקוד בפעולה [TRANSLATED]

הקוד המלא של פרק זה זמין ב: https://github.com/tomkedem/bookforge [TRANSLATED]

עיין בשינויים, הרץ, ושאל שאלות ישירות ב-Issues. [TRANSLATED]

מה יש עכשיו ב-GitHub [TRANSLATED]

bookforge/ [TRANSLATED]

├── README.md [TRANSLATED]

├── CLAUDE.md [TRANSLATED]

├── .gitignore [TRANSLATED]

├── docs/ [TRANSLATED]

│   └── architecture-thinking.md [TRANSLATED]

├── tasks/ [TRANSLATED]

│   ├── todo.md [TRANSLATED]

│   └── lessons.md [TRANSLATED]

├── output/ [TRANSLATED]

│   └── ai-developer-fitness/ [TRANSLATED]

│       └── assets/ [TRANSLATED]

└── .claude/ [TRANSLATED]

└── agents/ [TRANSLATED]

├── explorer.md [TRANSLATED]

├── parser.md [TRANSLATED]

├── content-architect.md [TRANSLATED]

├── organizer.md [TRANSLATED]

├── translator.md [TRANSLATED]

├── ui-designer.md [TRANSLATED]

├── builder.md [TRANSLATED]

├── memory-keeper.md [TRANSLATED]

├── error-handler.md [TRANSLATED]

├── code-reviewer.md [TRANSLATED]

└── quality-gate.md [TRANSLATED]

