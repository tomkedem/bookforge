# CLAUDE.local.md

## סביבה מקומית

- Python: `C:\Python312`
- Node: `C:\Program Files\nodejs`
- PowerShell כברירת מחדל (לא bash/cmd)
- קובץ עיבוד נוכחי: `D:\Books\AI_Developer_Fitness.docx`
- ספרי בדיקה:
  - `D:\Books\Practical Python for AI Engineering.docx` (18 פרקים, portrait cover)
  - `D:\Books\Lesson 1- Introduction to AI Engineering and Generative AI.docx`
    (29 פרקים, landscape cover, עם SDT cover page)

## פרויקט נוכחי

`D:\2025 Stu\AI Engineer\AllBooks2026\Claude Code - Book\bookforge\`

## העדפות אישיות

- **שפת דיון**: עברית
- **שפת UI באתר**: אנגלית גם בספר עברי
- **הצג התקדמות**: בעברית
- **לפני כל פעולה destructive**: שאל אותי
- **אחרי `Ctrl+C` של dev server**: אני רץ `npm run dev` מחדש בעצמי
- **ביקורת כנה**: אני מעדיף ביקורת ישירה ופרקטית ("תכלס") על
  פידבק מעודד. אל תתבזבז על אימות - אם משהו לא טוב, תגיד
- **אין em dashes** (`—` / `–`) בתוכן עברי

## סגנון עבודה עם Claude

### מה עובד לי

- **קובץ מלא מעודכן** עדיף על פני הוראות חיפוש/החלפה ידניות
- כשיש ריפקטור גדול, **הצג את השינוי המלא** לפני ביצוע
- **אל תוותר מהר** - כשמשהו לא עבד, תאבחן עם DevTools
- **סעיף אחד בכל פעם** לאישור. אל תשלח חמישה שינויים בבת אחת
- **שמור על קוד הקיים**. אל תיזרם ותתחיל לייצר. תשתמש בתשתית

### מה לא עובד לי

- הוראות "חפש את X והחלף ב-Y" בקובץ של 1500 שורות - שגיאה אחת בדרך
  ומפסידים שעה
- **דופליקציות בקוד אחרי `str_replace`** - תמיד תבדוק אחרי
  `grep -c "function foo"` לפני שמסיימים
- להמציא content שלא ביקשתי - אם יש ספק, תשאל

### איך לבדוק עבודה

אחרי כל שינוי:

1. `Ctrl+Shift+R` בדפדפן (אני אעשה)
2. פתח Console (F12 → Console) - **לא בטאב Elements!**
3. אם יש שגיאות אדומות, צלם ושלח לי
4. אם מדובר בעיית CSS, `Inspect` על האלמנט ותראה את הפאנל Styles

## טיפים טכניים לסשן הנוכחי

### PowerShell queries שימושיות

```powershell
# חיפוש טקסט בכל הפרויקט
Get-ChildItem -Path "..." -Recurse -Include "*.astro","*.ts","*.css" |
  ForEach-Object { Select-String -LiteralPath $_.FullName -Pattern "PATTERN" -List }

# בדיקת duplicate function
Select-String -LiteralPath "FILE" -Pattern "function FN_NAME" |
  Measure-Object | Select-Object Count

# שם קובץ דורש case change (Windows trick)
Rename-Item "old.ts" "temp.ts"
Rename-Item "temp.ts" "new.ts"
```

### Console JS שימושיות

```javascript
// בדוק state של כל בלוקי הקוד
document.querySelectorAll('.coderunner').forEach((b, i) =>
  console.log(i, 'initialized:', b.dataset.initialized,
                 'has copy:', !!b.querySelector('.cr-copy-btn')));

// בדוק computed style
getComputedStyle(document.querySelector('.cr-theme-icon-sun')).display

// טריגר theme switch ידני
document.documentElement.setAttribute('data-code-theme', 'light');
```

## החלטות שנסגרו בסשן עיצוב הקוד (אפריל 2026)

- **BashBlock** → Stripe Navy, פרומפט ציאן
- **CodeRunner** → GitHub Dark (default) + Light
- **Theme picker**: כפתור פר בלוק עם שמש/ירח zoom
- **BashBlock לא מקבל theme** - תמיד נייבי
- **אייקונים**: gradient + glow, לא stroke contour
- **שמש**: `#fff8b0 → #ffdd55 → #ff9500` עם 8 קרניים
- **ירח**: `#fffef8 → #e8e4d0 → #a8a495` עם craters

## Yuval - הקשר מוצרי מקומי לספריית AI

- Yuval היא כרגע ספריית ידע לתכני AI בלבד.
- כל התוכן ב-Yuval קשור ל-AI, הנדסת AI, מערכות AI, סוכנים, MCP, Python ל-AI, סיכומי קורסים, מאמרים והדרכות AI.
- רק תומר מוסיף תוכן לספרייה.
- התוכן מתווסף רק דרך pipeline קיים בקוד של BookForge.
- אין כרגע העלאת תכנים על ידי משתמשים.
- אין כרגע upload UI.
- אין כרגע upload button פעיל או לא פעיל שמרמז על העלאה ציבורית.
- אין כרגע database-backed CMS.
- אין כרגע תוכן שאינו AI.
- אין כרגע תמחור פעיל, paywall פעיל או הרשאות תוכן בתשלום.
- בעתיד ייתכן שחלק מהתכנים יהיו חופשיים וחלק זמינים במסלולים מתקדמים, אבל לא לממש זאת עד שתומר מבקש במפורש.
- אין לכתוב UI שמרמז שמשתמשים יכולים להעלות ספרים, קורסים, מאמרים או קבצים.
- ניסוחים אסורים ב-UI:
  - upload a book
  - add your content
  - upload your files
  - create your own library
  - העלה ספר
  - הוסף תוכן משלך
  - העלה קובץ
- הניסוח המוצרי הנכון:
  - Yuval is a living AI knowledge space generated from AI content processed by the BookForge pipeline.
  - בעברית: Yuval היא מרחב ידע חי לתכני AI שעובדו דרך BookForge.

## תוכן אמיתי שקיים או מתוכנן ב-Yuval

- סיכומי קורס מהנדס AI שתומר לומד:
  - כרגע צורפו 3 סיכומים מתוך 16.
- קורס AI שתומר בונה בעצמו:
  - השלב הבסיסי כולל כרגע 3 ספרים מוכנים או קיימים:
    - AI Developer Fitness
    - Building AI Systems with MCP
    - Practical Python for AI Engineering
  - עוד 4 ספרים נמצאים בשלב תיקונים ועריכות אחרונות.
  - עוד ספר נוסף בדרך.
- מאמרי AI מקוריים שתומר כותב.
- הדרכות AI מעשיות, למשל:
  - מפקודה למוצר
  - בניית מערכות סוכנים עם Claude Code

## כיוון ויזואלי מחייב ל-/library

- עמוד `/library` צריך להתכנס בהדרגה ליעד הוויזואלי הרשמי שתומר סיפק.
- זה לא דשבורד גנרי ולא רשימת ספרים רגילה.
- בדסקטופ זה צריך להרגיש כמו dashboard קולנועי אחד בגובה המסך.
- מבנה הדסקטופ המחייב:
  - top app bar נקי
  - left sidebar פונקציונלי עם המשך למידה, הסבר קצר, סטטיסטיקות ותוכן מומלץ
  - center hero גדול
  - central galaxy stage עם ליבת ידע זוהרת
  - floating tilted content cards סביב הליבה
  - narrow right pill toolbar בלבד עם AI assistant, bookmarks, history
  - bottom recommendation strip משולב כחלק מהמסך
- לא להמשיך לכיוון של "דף ארוך עם sections".
- לא להמשיך לדשבורד עסקי כללי.
- לא להוסיף פאנלים גדולים בצד ימין. הצד הימני בדסקטופ הוא toolbar צר בלבד.
- אם יש פאנלים פונקציונליים, הם שייכים לסיידבר השמאלי או לרצועת ההמלצות.

## מובייל וטאבלט עבור /library

- מובייל לא צריך לחקות את קומפוזיציית ה-orbit של הדסקטופ.
- מובייל צריך להיות phone-first, קריא ומהיר.
- מבנה מובייל מומלץ:
  - compact hero
  - continue reading
  - horizontal featured carousel
  - knowledge explanation
  - stats
  - recommendations
  - quick actions
- טאבלט צריך להישאר קרוב יותר למובייל אם קומפוזיציית הדסקטופ נשברת.
- אין לדחוס את ה-orbit desktop layout למסכים קטנים.
