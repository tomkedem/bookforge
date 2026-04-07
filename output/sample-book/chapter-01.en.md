# פרק הכנה: פרויקט ההדגמה והסביבה [EN]

מה זה BookForge ו-Yuval ולמה [TRANSLATED]

הספר עוסק בבניית מערכות סוכנים. אבל בניגוד לרוב הספרים שעוסקים בנושא, לא נדון בתיאוריה. נבנה מוצר אמיתי. [TRANSLATED]

הפרויקט נקרא BookForge, וכל מה שיילמד בספר ייושם דרכו. BookForge הוא פרויקט פיתוח תוכנה שמדגים כיצד להשתמש ביכולות המתקדמות של Claude Code, ריבוי סוכנים, צוותי סוכנים, וביקורת עצמית, לבניית מוצר אמיתי. הוא מקבל ספר בעברית בפורמט Word או PDF, מפרק אותו לפרקים, מייצר לכל פרק קובץ MD נפרד, ומתרגם כל פרק לאנגלית אוטומטית. הפלט הסופי הוא שתי גרסאות מלאות של הספר, עברית ואנגלית, שמהן נבנית Yuval. [TRANSLATED]

Yuval היא פלטפורמת קריאה דיגיטלית. לא עוד אתר ספרים שנראה כמו כולם. פלטפורמה עם עיצוב שלא קיים כיום בשום מקום, שתומכת בעברית ובאנגלית מהיום הראשון, ומאפשרת לקרוא ספרים בכל מכשיר בצורה נוחה וחכמה. [TRANSLATED]

הטכנולוגיה: Astro כ-framework, Tailwind CSS לעיצוב רספונסיבי מלא, TypeScript לאורך כל הפרויקט. [TRANSLATED]

עיצוב: Mobile-first. הממשק מתוכנן קודם למסך קטן ואז מורחב למסך גדול. בטלפון, טקסט נקי שתופס את כל המסך. במחשב, עיצוב יוקרתי עם תפריטים צידיים. [TRANSLATED]

שלושת פיצ'רי הגרסה הראשונה: Reading Progress, הקורא ממשיך לקרוא בדיוק מאותו מקום בכל מכשיר. שיתוף ציטוט, סימון טקסט מייצר תמונה יפה לשיתוף. Mobile-first design, חווית קריאה מושלמת בכל מסך. [TRANSLATED]

הספר הראשון שיעלה ל-Yuval הוא AI Developer Fitness, שנכתב על ידי אותו מפתח שבנה את הפלטפורמה. [TRANSLATED]

שני הפרויקטים קשורים: BookForge הוא המנוע, Yuval הוא המוצר. ויחד הם מוכיחים את הנקודה המרכזית של הספר: עם תכנון נכון של מערכת סוכנים, מפתח אחד יכול לבנות מה שצוות שלם לא הצליח. [TRANSLATED]

מפת הסוכנים של BookForge [TRANSLATED]

הסבר: [TRANSLATED]

הדיאגרמה מציגה את מערכת הסוכנים המלאה שנבנה לאורך הספר. כל סוכן אחראי על תפקיד אחד בלבד. הסוכנים הירוקים מבצעים, הסוכנים הכתומים בודקים, ושער האיכות האדום הוא נקודת הכניסה האחרונה לפני שהפלט יוצא. הלולאה המקווקוות בתחתית מייצגת את הביקורת העצמית שרצה לאורך כל התהליך. [TRANSLATED]

הגדרת סביבה [TRANSLATED]

לפני שממשיכים, ודא שהדברים הבאים מותקנים: [TRANSLATED]

bash [TRANSLATED]

node --version      # 18  ומעלה [TRANSLATED]

git --version [TRANSLATED]

claude --version    # Claude Code v2.1.32 ומעלה [TRANSLATED]

python --version    # 3.8 ומעלה [TRANSLATED]

pip install python-docx [TRANSLATED]

התקנת Claude Code: [TRANSLATED]

bash [TRANSLATED]

npm install -g @anthropic-ai/claude-code [TRANSLATED]

claude login [TRANSLATED]

לאחר ההתקנה תראה את מסך הפתיחה של Claude Code עם פרטי החשבון שלך, הגרסה הנוכחית, והתיקייה שבה אתה עובד. זה אומר שהכל מוכן. [TRANSLATED]

הורדת הפרויקט [TRANSLATED]

כל הקוד של הספר זמין ב:  https://github.com/tomkedem/bookforge [TRANSLATED]

כדי להוריד אותו למחשב שלך: [TRANSLATED]

bash [TRANSLATED]

git clone https://github.com/tomkedem/bookforge.git [TRANSLATED]

cd bookforge [TRANSLATED]

מכאן אפשר לעקוב אחרי כל פרק, לראות את הקוד בפעולה, ולשאול שאלות ב-Issues. [TRANSLATED]

README.md [TRANSLATED]

ב-repository תמצא את הקובץ הבא: [TRANSLATED]

markdown [TRANSLATED]

# BookForge [EN]

פרויקט פיתוח תוכנה שמדגים שימוש ביכולות המתקדמות [TRANSLATED]

של Claude Code לבניית מוצר אמיתי. [TRANSLATED]

מקבל ספר בפורמט Word או PDF ובונה ממנו את Yuval, [TRANSLATED]

פלטפורמת קריאה דיגיטלית ברמה עולמית. [TRANSLATED]

## הסוכנים במערכת [EN]

## דרישות [EN]

Node.js 18 ומעלה [TRANSLATED]

Claude Code v2.1.32 ומעלה [TRANSLATED]

Git [TRANSLATED]

## מבנה הפרויקט [EN]

יתעדכן פרק אחר פרק לאורך הספר. [TRANSLATED]

זה כל מה שיש עכשיו. פרויקט ריק עם כיוון ברור. הסוכנים עוד לא נולדו. [TRANSLATED]

