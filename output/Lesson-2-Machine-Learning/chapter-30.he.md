# תרגילים:

מתוך שיעורי הבית:

## תרגיל 1: אימון המודל ושמירה בתיקיית models

בשיעורי הבית ביקשו מאיתנו לקחת את קוד ה-Linear Regression מהשיעור, אבל לא להשאיר אותו כקובץ אחד שעושה הכול בכל הרצה.

עד עכשיו עבדנו עם תוכנית אחת שמבצעת את כל השלבים יחד: טעינת נתונים, אימון מודל, וחיזוי. זה נוח ללמידה, אבל זו לא צורת עבודה נכונה כשמתקדמים לשימוש אמיתי.

הדרישה כאן היא לבצע הפרדה ברורה בין שלבים.

במקום קובץ אחד, אנחנו יוצרים שני קבצים נפרדים:

- קובץ אחד שתפקידו לאמן את המודל ולשמור אותו

- קובץ שני שתפקידו להשתמש במודל שכבר אומן

בתרגיל הזה אנחנו מטפלים רק בחלק הראשון.

המטרה של הקובץ שנכתוב עכשיו היא פשוטה מאוד: לטעון את הנתונים, לאמן את המודל, ולשמור אותו לקובץ בתוך תיקיית models. הקובץ הזה לא מקבל קלט מהמשתמש, ולא מבצע תחזיות. הוא קובץ ייעודי לאימון בלבד.

זה שינוי חשוב בגישה. במקום לאמן את המודל בכל הרצה מחדש, אנחנו יוצרים קובץ ייעודי שכל תפקידו הוא לבצע את שלב האימון ולשמור את התוצאה לשימוש בהמשך.

במילים אחרות, הקובץ שאנחנו כותבים כאן הוא קובץ חדש ונפרד, ולא המשך ישיר של הקוד מהשיעור. הוא מייצג שלב אחד מתוך תהליך רחב יותר.

**שלב ראשון: יצירת קובץ חדש**

גש לתיקיית scripts בפרויקט שלך.

צור קובץ חדש בשם:

3_train_linear_regression_model.py

זה יהיה קובץ נפרד לחלוטין מהקוד של השיעור. 
אל תערוך את הקובץ הישן. אנחנו בונים משהו חדש.

**שלב שני: כתיבת הקוד**

הקובץ מבצע שלושה שלבים עיקריים, שמפורקים בפועל למספר פעולות קטנות יותר בקוד

1. לטעון את הנתונים

2. לאמן את המודל

3. לשמור את המודל לקובץ

**הקוד המלא:**

```python
from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression


# ----------------------------------------
# Project paths
# ----------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "AmesHousing.csv"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "linear_regression_model.pkl"

def main():
    # ----------------------------------------
    # 1. Load dataset
    # ----------------------------------------
    df = pd.read_csv(DATA_PATH)

    # ----------------------------------------
    # 2. Select relevant columns
    # ----------------------------------------
    data = df[["Gr Liv Area", "SalePrice"]].dropna()

    X = data[["Gr Liv Area"]].values
    y = data["SalePrice"].values

    # ----------------------------------------
    # 3. Train model
    # ----------------------------------------
    model = LinearRegression()
    model.fit(X, y)

    # ----------------------------------------
    # 4. Create models directory if needed
    # ----------------------------------------
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # ----------------------------------------
    # 5. Save model to file
    # ----------------------------------------
    joblib.dump(model, MODEL_PATH)

    print("Model trained and saved successfully.")
    print(f"Saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()
```

**שלב שלישי: הרצת הקובץ**

פתח טרמינל בתוך תיקיית scripts והריץ:

```bash
python 3_train_linear_regression_model.py
```

אם הכול תקין, אתה אמור לראות הודעה:

```bash
Model trained and saved successfully.
```

**שלב רביעי: בדיקה שהכול עבד**

גש לתיקיית models.

אם התרגיל בוצע נכון, אתה תראה קובץ חדש:

linear_regression_model.pkl

זה הקובץ שמכיל את הפרמטרים שהמודל למד במהלך האימון, והוא ישמש אותנו בתרגיל הבא כדי לבצע תחזיות בלי לאמן את המודל מחדש.

חשוב להבין: אם לא מריצים את הקובץ הזה קודם, הקובץ linear_regression_model.pkl לא יווצר. במקרה כזה, התוכנית שנכתוב בתרגיל הבא לא תוכל לטעון את המודל, ולכן היא תיכשל כבר בתחילת הריצה.

**הסבר מלא - מה באמת קורה כאן**

הקוד נראה אולי מוכר, אבל יש בו שינוי אחד קריטי.

בהתחלה, אנחנו טוענים את קובץ הנתונים. זה בדיוק כמו שעשינו בשיעור. אין כאן משהו חדש, אלא חזרה על אותו שלב כדי לבנות בסיס נכון.

אחר כך אנחנו בוחרים את העמודות הרלוונטיות. אנחנו לא משתמשים בכל הדאטה, אלא רק במה שהמודל צריך. במקרה הזה, זה הקשר בין שטח הבית (Gr Liv Area) לבין המחיר (SalePrice). בנוסף, אנחנו מנקים נתונים חסרים, כי מודל לא יודע להתמודד עם ערכים ריקים.

בשלב הבא אנחנו מפרידים בין הקלט לבין התוצאה. זה שלב חשוב מאוד להבנה: המודל לא עובד על טבלה כללית, אלא על מבנה מאוד ברור של X ו-y. הקלט הוא תמיד מבנה דו-ממדי, והתוצאה היא וקטור.

אחר כך מגיע שלב האימון. כאן המודל “לומד” את הקשר בין הקלט לתוצאה. זו אותה פעולה שעשינו בשיעור, ואין בה שינוי.

השלב הבא הוא שלב שלא היה אצלנו קודם. אנחנו דואגים שתיקיית models קיימת. אם היא לא קיימת, אנחנו יוצרים אותה. זה נשמע טכני, אבל זה בדיוק סוג הדברים שגורמים לקוד להיכשל אם לא חושבים עליהם מראש.

ואז מגיע החלק הכי חשוב בתרגיל. במקום להשתמש במודל מיד אחרי האימון, אנחנו שומרים אותו לקובץ.

זו השורה הכי חשובה בתרגיל:

```python
joblib.dump(model, MODEL_PATH)
```

השורה הזו שומרת את המודל לקובץ. כל מה שהמודל למד במהלך האימון נכתב לדיסק, כך שנוכל לטעון אותו בהמשך בלי לאמן מחדש את המודל.

**מה השתנה לעומת השיעור**

אם מסתכלים רגע אחורה, השינוי בקוד הוא לא גדול, אבל הוא גדול מאוד בגישה.

**בשיעור:** 
המודל היה זמני. הוא נוצר בזמן הריצה, השתמשנו בו, והוא נעלם בסיום התוכנית.

**כאן:** 
המודל נשמר לקובץ, ולכן הוא הופך מתוצאה זמנית של הרצה לנכס שאפשר לטעון ולהשתמש בו שוב בתוכנית אחרת.

**למה זה חשוב**

זה בדיוק השלב שבו עוברים מקוד לימודי למשהו שמתחיל להיראות כמו מערכת.

במקום לחשוב “איך להריץ את הקוד”, מתחילים לחשוב:

איך שומרים תוצאה 
איך משתמשים בה שוב 
איך בונים תהליך

וזה מה שהתרגיל הזה מנסה ללמד.

אם זה ברור, השלב הבא יהיה לקחת את הקובץ ששמרנו כאן, ולהשתמש בו בתוכנית אחרת שמקבלת קלט מהמשתמש.

**טיפ חשוב להרצה**

אם קיבלת שגיאה בהרצה שקשורה ל-pandas או לכך ש-.venv לא נמצא, כדאי לבדוק מאיפה אתה מפעיל את הסביבה הווירטואלית.

בפרויקט הזה תיקיית .venv נמצאת בתוך lesson-02, ולכן צריך להפעיל אותה מתוך התיקייה הזו:

```bash
cd lesson-02
..venv\Scripts\Activate.ps1
```

לאחר ההפעלה תראה (.venv) בתחילת שורת הפקודה.

הסיבה לכך היא שהסביבה הווירטואלית שייכת לתיקייה שבה היא נוצרה, ולכן יש להפעיל אותה מהמיקום הנכון.

## תרגיל 2: טעינת המודל וקבלת קלט מהמשתמש דרך CLI

מתוך שיעורי הבית:

load the trained model and allows the user to input numbers through CLI

אחרי שבתרגיל 1 יצרנו קובץ שאחראי על אימון המודל ושמירתו בתיקיית models, עכשיו עוברים לשלב השני: כתיבת תוכנית חדשה שתשתמש במודל שכבר אומן.

הנקודה החשובה כאן היא שלא מאמנים את המודל שוב. זה כל הרעיון של ההפרדה שעשינו בתרגיל הקודם. אם כבר שמרנו את המודל לקובץ, אין סיבה לחזור שוב על שלב האימון בכל הרצה. במקום זה, התוכנית החדשה תטען את הקובץ שנוצר בתרגיל 1, תקבל מהמשתמש מספר דרך שורת הפקודה, ותשתמש במודל כדי להחזיר תחזית.

במילים פשוטות, בתרגיל 1 בנינו את “המוח”. בתרגיל הזה אנחנו בונים דרך להשתמש בו.

**מה אנחנו בונים בתרגיל הזה**

בתרגיל הזה ניצור קובץ חדש ונפרד. גם כאן לא עורכים את הקובץ המקורי מהשיעור, ולא עורכים את קובץ האימון שיצרנו בתרגיל 1. אנחנו יוצרים קובץ ייעודי לתחזיות.

**שם הקובץ:** 3_predict_sale_price_cli.py

**המיקום שלו:** lesson-02/scripts

המטרה של הקובץ:

1. לטעון את המודל ששמרנו בתרגיל 1

2. לקבל מהמשתמש שטח בית דרך CLI

3. להעביר את המספר למודל

4. להדפיס את מחיר המכירה החזוי

בשלב הזה עדיין לא נתמקד בטיפול מלא בקלט לא חוקי. זה יגיע בתרגיל הבא. אבל כן נכתוב מבנה נכון שיכין אותנו לזה.

**שלב ראשון: יצירת קובץ חדש**

גש לתיקיית scripts בתוך lesson-02.

**צור קובץ חדש בשם:** 3_predict_sale_price_cli.py

מבנה התיקיות אמור להיראות כך:

```bash
lesson-02/scripts/3_train_linear_regression_model.py
lesson-02/scripts/3_predict_sale_price_cli.py
```

הקובץ הראשון מאמן ושומר את המודל. 
הקובץ השני טוען את המודל ומשתמש בו.

ההפרדה הזו חשובה מאוד, כי היא מראה את המעבר מקוד לימודי לקוד שמתחיל להיות דומה לתהליך אמיתי: שלב אימון בנפרד, שלב שימוש בנפרד.

**שלב שני: לחשוב מה הקובץ צריך לדעת**

לפני שכותבים קוד, חשוב להבין מה הקובץ החדש צריך לדעת.

הוא צריך לדעת איפה נמצא קובץ המודל:

```bash
lesson-02/models/linear_regression_model.pkl
```

הוא צריך לדעת איך לטעון אותו:

```python
joblib.load(...)
```

והוא צריך לדעת איך לשלוח למודל קלט בצורה ש-scikit-learn מצפה לקבל.

כאן יש נקודה קטנה אבל חשובה: המודל לא מקבל מספר בודד כמו 1500. הוא מצפה לקבל מבנה דו-ממדי, כלומר משהו בצורה הזו:

```python
[[1500]]
```

לכן גם אם המשתמש מזין מספר אחד, אנחנו נעטוף אותו בתוך רשימה פנימית לפני שנשלח אותו למודל.



**שלב שלישי: הקוד המלא**

```python
from pathlib import Path

import joblib
import numpy as np


# ----------------------------------------
# Project paths
# ----------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Path to the trained model file
MODEL_PATH = BASE_DIR / "models" / "linear_regression_model.pkl"


def load_model():
    # ----------------------------------------
    # Load trained model from disk
    # ----------------------------------------
    # The model must already exist.
    # It is created by running:
    # 3_train_linear_regression_model.py
    return joblib.load(MODEL_PATH)


def predict_price(model, living_area):
    # ----------------------------------------
    # Convert user input into model input format
    # ----------------------------------------
    # scikit-learn expects a 2D array:
    # rows = samples
    # columns = features
    input_data = np.array([[living_area]])

    # ----------------------------------------
    # Run prediction
    # ----------------------------------------
    prediction = model.predict(input_data)

    # prediction is an array, so we return the first value
    return prediction[0]


def main():
    # ----------------------------------------
    # 1. Load model once
    # ----------------------------------------
    model = load_model()

    print("Linear Regression model loaded successfully.")
    print("Enter a living area in square feet.")

    # ----------------------------------------
    # 2. Read input from user
    # ----------------------------------------
    user_input = input("Living area: ")

    # ----------------------------------------
    # 3. Convert input to number
    # ----------------------------------------
    living_area = float(user_input)

    # ----------------------------------------
    # 4. Predict sale price
    # ----------------------------------------
    predicted_price = predict_price(model, living_area)

    # ----------------------------------------
    # 5. Print result
    # ----------------------------------------
    print(f"Predicted Sale Price: ${predicted_price:,.2f}")


if __name__ == "__main__":
    main()
```

**מה קורה בקוד הזה**

הקוד מתחיל בהגדרת הנתיב לקובץ המודל:

```python
MODEL_PATH = BASE_DIR / "models" / "linear_regression_model.pkl"
```

זה אותו קובץ שנוצר בתרגיל 1. אם הקובץ הזה לא קיים, התוכנית לא תוכל להמשיך. לכן חשוב מאוד להריץ קודם את קובץ האימון.

לאחר מכן יש פונקציה בשם load_model:

```python
return joblib.load(MODEL_PATH)
```

זו השורה שטוענת את המודל מהדיסק בחזרה לזיכרון. כלומר, במקום לאמן מודל חדש, אנחנו מקבלים את אותו מודל שכבר אומן ונשמר.

השלב הבא הוא קבלת קלט מהמשתמש:

```python
user_input = input("Living area: ")
```

המשתמש מקליד מספר, לדוגמה 1500.

אבל input תמיד מחזיר טקסט. גם אם המשתמש הקליד מספר, מבחינת Python זה עדיין string. לכן צריך להמיר אותו למספר:

```python
living_area = float(user_input)
```

אחרי שיש לנו מספר, שולחים אותו למודל:

```python
predicted_price = predict_price(model, living_area)
```

ובתוך הפונקציה הזו מתבצע שלב חשוב:

```python
input_data = np.array([[living_area]])
```

זה נראה קצת מוזר בהתחלה, אבל זו הצורה ש-scikit-learn מצפה לקבל. המודל אומן על טבלת קלט שבה כל שורה היא דוגמה וכל עמודה היא מאפיין. גם כשיש לנו רק דוגמה אחת ורק מאפיין אחד, עדיין צריך לשמור על אותו מבנה.

לכן:

1500 הוא לא מספיק.

[1500] עדיין לא המבנה הנכון.

[[1500]] הוא המבנה המתאים.

**שלב רביעי: הרצת התוכנית**

לפני שמריצים את התוכנית הזו, צריך לוודא שקובץ המודל באמת קיים.

כלומר, צריך שכבר הרצתה התוכנית מהתרגיל הראשון:

```bash
3_train_linear_regression_model.py
```

ורק אחרי שנוצר הקובץ:

```bash
lesson-02/models/linear_regression_model.pkl
```

אפשר להריץ את קובץ התחזית.

מתוך תיקיית scripts הרץ:

```bash
python 3_predict_sale_price_cli.py
```

אם הכול תקין, תראה משהו בסגנון:

```bash
Linear Regression model loaded successfully.
Enter a living area in square feet.
Living area:
```

עכשיו אפשר להזין מספר, לדוגמה:

1500

והתוכנית תחזיר תחזית:

```bash
Predicted Sale Price: $180,830.64
```

המספר המדויק יכול להשתנות אם המודל אומן בצורה מעט שונה, אבל המבנה אמור להיות זהה.

**מה השתנה לעומת תרגיל 1**

בתרגיל 1 המודל נוצר ונשמר.

בתרגיל 2 המודל כבר לא נוצר. הוא נטען.

זה ההבדל המרכזי:

בתרגיל 1:

```python
model.fit(...)
```

בתרגיל 2:

```python
joblib.load(...)
```

כלומר, אנחנו כבר לא מלמדים את המודל, אלא משתמשים במה שהוא למד קודם.

זו הפרדה חשובה מאוד. בתהליך אמיתי, אימון מודל יכול לקחת זמן, לפעמים הרבה זמן. לכן לא מבצעים אימון בכל פעם שמשתמש מבקש תחזית. מאמנים פעם אחת, שומרים, ואז משתמשים במודל השמור.

**בעיה שעדיין קיימת**

הקוד הזה עובד אם המשתמש מזין מספר תקין.

אבל אם המשתמש יזין משהו כמו:

abc

או ישאיר שדה ריק, התוכנית תקרוס בשורה הזו:

```python
living_area = float(user_input)
```

וזה מוביל אותנו בדיוק לדרישה הבאה בשיעורי הבית: טיפול בקלט לא חוקי.

כלומר, תרגיל 2 בונה את ה-CLI הבסיסי.

תרגיל 3 יהפוך אותו לעמיד יותר, כך שהתוכנית לא תקרוס בגלל קלט שגוי.

**תרגיל 3: טיפול בקלט לא חוקי**

מתוך שיעורי הבית:

handle illegal input

בתרגיל הקודם בנינו תוכנית שטוענת את המודל השמור, מקבלת מהמשתמש שטח בית דרך ה-CLI, ומחזירה תחזית למחיר המכירה. כל עוד המשתמש מזין מספר תקין, התוכנית עובדת.

אבל יש כאן בעיה ברורה: אנחנו לא יכולים להניח שהמשתמש תמיד יזין ערך תקין.

המשתמש יכול להזין טקסט, להשאיר שדה ריק, להזין מספר שלילי, להזין אפס, או לכתוב ערך שלא ניתן להמיר למספר. במקרה כזה, אם לא נטפל בזה בצורה מסודרת, התוכנית תקרוס.

וזה בדיוק מה שהתרגיל השלישי מבקש מאיתנו לתקן.

המטרה של התרגיל הזה היא להפוך את תוכנית ה-CLI לקצת יותר בוגרת: במקום לקרוס בגלל קלט לא תקין, היא תזהה את הבעיה, תציג הודעה ברורה, ותאפשר למשתמש לנסות שוב.

**מה הבעיה בקוד הקודם**

בקוד של תרגיל 2 הייתה לנו שורה כזו:

living_area = float(user_input)

השורה הזו עובדת רק אם המשתמש באמת הזין מספר.

לדוגמה, זה יעבוד:

1500

אבל זה לא יעבוד:

abc

וזה גם לא מספיק טוב:

-50

כי מבחינת Python זה מספר תקין, אבל מבחינת המשמעות של התוכנית, שטח בית לא יכול להיות שלילי.

לכן אנחנו צריכים להוסיף בדיקה.

**מה נרצה שהקוד יעשה**

ההתנהגות הרצויה היא כזו:

אם המשתמש מזין מספר חיובי, התוכנית תחשב תחזית ותציג מחיר.

אם המשתמש מזין טקסט, התוכנית תציג הודעת שגיאה.

אם המשתמש מזין מספר שלילי או אפס, התוכנית תציג הודעת שגיאה.

אם המשתמש רוצה לצאת, הוא יוכל לכתוב exit.

כלומר, במקום שהתוכנית תעבוד פעם אחת ותסתיים, נבנה לולאה שמאפשרת להזין כמה ערכים ברצף.

**שלב ראשון: ניצור פונקציה שמטפלת בקלט**

במקום לפזר את בדיקת הקלט בתוך main, ניצור פונקציה ייעודית:

def parse_living_area(user_input: str) -> float: 
 value = float(user_input) 
 
 if value <= 0: 
 raise ValueError("Living area must be greater than zero.") 
 
 return value

מה הפונקציה הזו עושה?

קודם היא מנסה להמיר את הקלט למספר:

value = float(user_input)

אם המשתמש הזין משהו שאינו מספר, למשל abc, השורה הזו תזרוק ValueError.

אחר כך אנחנו בודקים שהמספר גדול מאפס:

if value <= 0: 
 raise ValueError("Living area must be greater than zero.")

אם הערך הוא אפס או שלילי, אנחנו מתייחסים אליו כקלט לא חוקי.

בסוף, אם הכול תקין, הפונקציה מחזירה את הערך המספרי.

**שלב שני: נעטוף את הקלט ב-try / except**

עכשיו צריך להשתמש בפונקציה הזו בתוך הלולאה:

try: 
 living_area = parse_living_area(user_input) 
 predicted_price = predict_price(model, living_area) 
 print(f"Predicted Sale Price: ${predicted_price:,.2f}") 
except ValueError: 
 print("Invalid input. Please enter a positive number, for example: 1500")

המבנה הזה אומר:

נסה להמיר את הקלט ולחשב תחזית.

אם הכול תקין, הדפס מחיר.

אם הייתה בעיה, אל תקרוס. הצג הודעה ברורה.

**שלב שלישי: הקוד המלא לאחר התיקון**

זה הקובץ המעודכן של תרגיל 3.

שם הקובץ נשאר:

3_predict_sale_price_cli.py

אנחנו לא צריכים ליצור קובץ חדש, אלא לשפר את הקובץ של תרגיל 2.

from pathlib import Path 
 
import joblib 
import numpy as np 
 
 
# ---------------------------------------- 
# Project paths 
# ---------------------------------------- 
BASE_DIR = Path(__file__).resolve().parent.parent 
 
# Path to the trained model file 
MODEL_PATH = BASE_DIR / "models" / "linear_regression_model.pkl" 
 
 
def load_model(): 
 # ---------------------------------------- 
 # Load trained model from disk 
 # ---------------------------------------- 
 # The model must already exist. 
 # It is created by running: 
 # 3_train_linear_regression_model.py 
 return joblib.load(MODEL_PATH) 
 
 
def parse_living_area(user_input: str) -> float: 
 # ---------------------------------------- 
 # Convert CLI input into a valid number 
 # ---------------------------------------- 
 # input() always returns text. 
 # We need to convert it to float before using it. 
 value = float(user_input) 
 
 # ---------------------------------------- 
 # Validate business meaning 
 # ---------------------------------------- 
 # A house living area must be greater than zero. 
 if value <= 0: 
 raise ValueError("Living area must be greater than zero.") 
 
 return value 
 
 
def predict_price(model, living_area: float) -> float: 
 # ---------------------------------------- 
 # Convert user input into model input format 
 # ---------------------------------------- 
 # scikit-learn expects a 2D array: 
 # rows = samples 
 # columns = features 
 input_data = np.array([[living_area]]) 
 
 # ---------------------------------------- 
 # Run prediction 
 # ---------------------------------------- 
 prediction = model.predict(input_data) 
 
 # prediction is an array, so we return the first value 
 return prediction[0] 
 
 
def main(): 
 # ---------------------------------------- 
 # 1. Load model once 
 # ---------------------------------------- 
 model = load_model() 
 
 print("Linear Regression model loaded successfully.") 
 print("Enter a living area in square feet.") 
 print("Type 'exit' to quit.") 
 
 # ---------------------------------------- 
 # 2. Keep asking the user for input 
 # ---------------------------------------- 
 while True: 
 user_input = input("\nLiving area: ").strip() 
 
 # ---------------------------------------- 
 # 3. Allow the user to exit the program 
 # ---------------------------------------- 
 if user_input.lower() in {"exit", "quit", "q"}: 
 print("Goodbye.") 
 break 
 
 try: 
 # ---------------------------------------- 
 # 4. Parse and validate input 
 # ---------------------------------------- 
 living_area = parse_living_area(user_input) 
 
 # ---------------------------------------- 
 # 5. Predict sale price 
 # ---------------------------------------- 
 predicted_price = predict_price(model, living_area) 
 
 # ---------------------------------------- 
 # 6. Print result 
 # ---------------------------------------- 
 print(f"Predicted Sale Price: ${predicted_price:,.2f}") 
 
 except ValueError: 
 # ---------------------------------------- 
 # Handle illegal input without crashing 
 # ---------------------------------------- 
 print("Invalid input. Please enter a positive number, for example: 1500") 
 
 
if __name__ == "__main__": 
 main()

**מה השתנה לעומת תרגיל 2**

בתרגיל 2 קיבלנו קלט והמרנו אותו ישירות למספר:

living_area = float(user_input)

זה היה פשוט, אבל לא בטוח.

בתרגיל 3 העברנו את האחריות הזו לפונקציה נפרדת:

parse_living_area(user_input)

וזה שיפור חשוב, כי עכשיו ברור שיש מקום אחד שאחראי על בדיקת הקלט.

הוספנו גם לולאת while True, כדי שהמשתמש יוכל לבצע כמה תחזיות ברצף בלי להריץ את התוכנית מחדש בכל פעם.

**דוגמת הרצה תקינה**

לאחר הרצה של הקובץ:

Linear Regression model loaded successfully. 
Enter a living area in square feet. 
Type 'exit' to quit. 
 
Living area: 1500 
Predicted Sale Price: $179,344.29

המשתמש הזין מספר חיובי, ולכן התוכנית חישבה תחזית.

**דוגמת קלט לא חוקי**

אם המשתמש מזין טקסט:

Living area: abc 
Invalid input. Please enter a positive number, for example: 1500

התוכנית לא קורסת.

היא מזהה שהקלט לא חוקי ומבקשת מהמשתמש להזין ערך מתאים.

**דוגמת מספר לא חוקי**

אם המשתמש מזין מספר שלילי:

Living area: -100 
Invalid input. Please enter a positive number, for example: 1500

גם כאן התוכנית לא קורסת.

הסיבה היא שמבחינה עסקית, שטח בית לא יכול להיות שלילי.

**יציאה מהתוכנית**

אם המשתמש רוצה לצאת:

Living area: exit 
Goodbye.

זה הופך את התוכנית לנוחה יותר לשימוש, כי לא צריך לעצור אותה בכוח.

**למה התיקון הזה חשוב**

טיפול בקלט לא חוקי הוא לא “תוספת נחמדה”. זה חלק בסיסי מכתיבת תוכנה שמיועדת למשתמש.

בקוד לימודי קל להניח שהכול תקין, אבל בקוד אמיתי אסור להניח את זה. משתמשים מזינים ערכים לא צפויים, טועים בהקלדה, משאירים שדות ריקים, או מכניסים ערכים שלא מתאימים למשמעות של המערכת.

לכן התרגיל הזה מלמד משהו חשוב מעבר ל-Machine Learning: מודל טוב לא מספיק. צריך גם תוכנית שיודעת לעבוד בצורה יציבה סביב המודל.

כאן בדיוק מתחילים לראות את ההבדל בין דוגמת מעבדה לבין קוד שמתחיל להתנהג כמו מערכת.

## תרגיל 3: טיפול בקלט לא חוקי

מתוך שיעורי הבית:

handle illegal input

בתרגיל הקודם בנינו תוכנית שטוענת את המודל השמור, מקבלת מהמשתמש שטח בית דרך ה-CLI, ומחזירה תחזית למחיר המכירה. כל עוד המשתמש מזין מספר תקין, התוכנית עובדת.

אבל יש כאן בעיה ברורה: אנחנו לא יכולים להניח שהמשתמש תמיד יזין ערך תקין.

המשתמש יכול להזין טקסט, להשאיר שדה ריק, להזין מספר שלילי, להזין אפס, או לכתוב ערך שלא ניתן להמיר למספר. במקרה כזה, אם לא נטפל בזה בצורה מסודרת, התוכנית תקרוס.

וזה בדיוק מה שהתרגיל השלישי מבקש מאיתנו לתקן.

המטרה של התרגיל הזה היא להפוך את תוכנית ה-CLI לקצת יותר בוגרת: במקום לקרוס בגלל קלט לא תקין, היא תזהה את הבעיה, תציג הודעה ברורה, ותאפשר למשתמש לנסות שוב.

**מה הבעיה בקוד הקודם**

בקוד של תרגיל 2 הייתה לנו שורה כזו:

```python
living_area = float(user_input)
```

השורה הזו עובדת רק אם המשתמש באמת הזין מספר.

לדוגמה,

**זה יעבוד:** 1500

**אבל זה לא יעבוד:** abc

**וזה גם לא מספיק טוב:** -50

כי מבחינת Python זה מספר תקין, אבל מבחינת המשמעות של התוכנית, שטח בית לא יכול להיות שלילי.

לכן אנחנו צריכים להוסיף בדיקה.

**מה נרצה שהקוד יעשה**

ההתנהגות הרצויה היא כזו:

אם המשתמש מזין מספר חיובי, התוכנית תחשב תחזית ותציג מחיר.

אם המשתמש מזין טקסט, התוכנית תציג הודעת שגיאה.

אם המשתמש מזין מספר שלילי או אפס, התוכנית תציג הודעת שגיאה.

אם המשתמש רוצה לצאת, הוא יוכל לכתוב exit.

כלומר, במקום שהתוכנית תעבוד פעם אחת ותסתיים, נבנה לולאה שמאפשרת להזין כמה ערכים ברצף.

**שלב ראשון: ניצור פונקציה שמטפלת בקלט**

במקום לפזר את בדיקת הקלט בתוך main, ניצור פונקציה ייעודית:

```python
def parse_living_area(user_input: str) -> float:
    value = float(user_input)

    if value <= 0:
        raise ValueError("Living area must be greater than zero.")

    return value
```

מה הפונקציה הזו עושה?

קודם היא מנסה להמיר את הקלט למספר:

```python
value = float(user_input)
```

אם המשתמש הזין משהו שאינו מספר, למשל abc, השורה הזו תזרוק ValueError.

אחר כך אנחנו בודקים שהמספר גדול מאפס:

```python
if value <= 0:
    raise ValueError("Living area must be greater than zero.")
```

אם הערך הוא אפס או שלילי, אנחנו מתייחסים אליו כקלט לא חוקי.

בסוף, אם הכול תקין, הפונקציה מחזירה את הערך המספרי.

**שלב שני: נעטוף את הקלט ב-try / except**

עכשיו צריך להשתמש בפונקציה הזו בתוך הלולאה:

```python
try:
    living_area = parse_living_area(user_input)
    predicted_price = predict_price(model, living_area)
    print(f"Predicted Sale Price: ${predicted_price:,.2f}")
except ValueError:
    print("Invalid input. Please enter a positive number, for example: 1500")
```

המבנה הזה אומר:

נסה להמיר את הקלט ולחשב תחזית.

אם הכול תקין, הדפס מחיר.

אם הייתה בעיה, אל תקרוס. הצג הודעה ברורה.

**שלב שלישי: הקוד המלא לאחר התיקון**

זה הקובץ המעודכן של תרגיל 3.

**שם הקובץ נשאר:** 3_predict_sale_price_cli.py

אנחנו לא צריכים ליצור קובץ חדש, אלא לשפר את הקובץ של תרגיל 2.

```python
from pathlib import Path

import joblib
import numpy as np


# ----------------------------------------
# Project paths
# ----------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Path to the trained model file
MODEL_PATH = BASE_DIR / "models" / "linear_regression_model.pkl"


def load_model():
    # ----------------------------------------
    # Load trained model from disk
    # ----------------------------------------
    # The model must already exist.
    # It is created by running:
    # 3_train_linear_regression_model.py
    return joblib.load(MODEL_PATH)


def parse_living_area(user_input: str) -> float:
    # ----------------------------------------
    # Convert CLI input into a valid number
    # ----------------------------------------
    # input() always returns text.
    # We need to convert it to float before using it.
    value = float(user_input)

    # ----------------------------------------
    # Validate business meaning
    # ----------------------------------------
    # A house living area must be greater than zero.
    if value <= 0:
        raise ValueError("Living area must be greater than zero.")

    return value


def predict_price(model, living_area: float) -> float:
    # ----------------------------------------
    # Convert user input into model input format
    # ----------------------------------------
    # scikit-learn expects a 2D array:
    # rows = samples
    # columns = features
    input_data = np.array([[living_area]])

    # ----------------------------------------
    # Run prediction
    # ----------------------------------------
    prediction = model.predict(input_data)

    # prediction is an array, so we return the first value
    return prediction[0]


def main():
    # ----------------------------------------
    # 1. Load model once
    # ----------------------------------------
    model = load_model()

    print("Linear Regression model loaded successfully.")
    print("Enter a living area in square feet.")
    print("Type 'exit' to quit.")

    # ----------------------------------------
    # 2. Keep asking the user for input
    # ----------------------------------------
    while True:
        user_input = input("\nLiving area: ").strip()

        # ----------------------------------------
        # 3. Allow the user to exit the program
        # ----------------------------------------
        if user_input.lower() in {"exit", "quit", "q"}:
            print("Goodbye.")
            break

        try:
            # ----------------------------------------
            # 4. Parse and validate input
            # ----------------------------------------
            living_area = parse_living_area(user_input)

            # ----------------------------------------
            # 5. Predict sale price
            # ----------------------------------------
            predicted_price = predict_price(model, living_area)

            # ----------------------------------------
            # 6. Print result
            # ----------------------------------------
            print(f"Predicted Sale Price: ${predicted_price:,.2f}")

        except ValueError:
            # ----------------------------------------
            # Handle illegal input without crashing
            # ----------------------------------------
            print("Invalid input. Please enter a positive number, for example: 1500")


if __name__ == "__main__":
    main()
```

**מה השתנה לעומת תרגיל 2**

בתרגיל 2 קיבלנו קלט והמרנו אותו ישירות למספר:

```python
living_area = float(user_input)
```

זה היה פשוט, אבל לא בטוח.

בתרגיל 3 העברנו את האחריות הזו לפונקציה נפרדת:

```python
parse_living_area(user_input)
```

וזה שיפור חשוב, כי עכשיו ברור שיש מקום אחד שאחראי על בדיקת הקלט.

הוספנו גם לולאת **while True**, כדי שהמשתמש יוכל לבצע כמה תחזיות ברצף בלי להריץ את התוכנית מחדש בכל פעם.

**דוגמת הרצה תקינה**

לאחר הרצה של הקובץ:

```bash
Linear Regression model loaded successfully.
Enter a living area in square feet.
Type 'exit' to quit.

Living area: 1500
Predicted Sale Price: $179,344.29
```

המשתמש הזין מספר חיובי, ולכן התוכנית חישבה תחזית.

**דוגמת קלט לא חוקי**

אם המשתמש מזין טקסט:

```bash
Living area: abc
Invalid input. Please enter a positive number, for example: 1500
```

התוכנית לא קורסת.

היא מזהה שהקלט לא חוקי ומבקשת מהמשתמש להזין ערך מתאים.

**דוגמת מספר לא חוקי**

אם המשתמש מזין מספר שלילי:

```bash
Living area: -100
Invalid input. Please enter a positive number, for example: 1500
```

גם כאן התוכנית לא קורסת.

הסיבה היא שמבחינה עסקית, שטח בית לא יכול להיות שלילי.

**יציאה מהתוכנית**

אם המשתמש רוצה לצאת:

```bash
Living area: exit
Goodbye.
```

זה הופך את התוכנית לנוחה יותר לשימוש, כי לא צריך לעצור אותה בכוח.

**למה התיקון הזה חשוב**

טיפול בקלט לא חוקי הוא לא “תוספת נחמדה”. זה חלק בסיסי מכתיבת תוכנה שמיועדת למשתמש.

בקוד לימודי קל להניח שהכול תקין, אבל בקוד אמיתי אסור להניח את זה. משתמשים מזינים ערכים לא צפויים, טועים בהקלדה, משאירים שדות ריקים, או מכניסים ערכים שלא מתאימים למשמעות של המערכת.

לכן התרגיל הזה מלמד משהו חשוב מעבר ל-Machine Learning:

**מודל טוב לא מספיק. צריך גם תוכנית שיודעת לעבוד בצורה יציבה סביב המודל.**

כאן בדיוק מתחילים לראות את ההבדל בין דוגמת מעבדה לבין קוד שמתחיל להתנהג כמו מערכת.

## תרגיל 4: יעילות - טעינת המודל פעם אחת בזמן עליית התוכנית

מתוך שיעורי הבית:

make the program efficient - load the model during startup time

אחרי שבתרגיל 3 טיפלנו בקלט לא חוקי והפכנו את ה-CLI ליציב יותר, מגיע השלב האחרון: לוודא שהתוכנית גם יעילה.

הדרישה כאן נשמעת פשוטה, אבל היא מאוד חשובה. אנחנו צריכים לוודא שהמודל נטען פעם אחת בלבד, בתחילת הריצה, ולא בכל פעם שהמשתמש מזין ערך.

אם לא עושים את זה נכון, כל איטרציה של הקלט תגרום לטעינה מחדש של המודל מהדיסק. זה אולי לא מורגש עם מודל קטן כמו Linear Regression, אבל במודלים גדולים יותר זה יכול להיות איטי מאוד.

התרגיל הזה בעצם מלמד אותנו עיקרון בסיסי: פעולות כבדות מבצעים פעם אחת, לא בתוך לולאה.

**מה הבעיה שצריך לזהות**

הבעיה יכולה להופיע בצורה כזו:

```python
while True:
    model = load_model()
    user_input = input("Living area: ")
```

הקוד הזה עובד, אבל הוא לא יעיל.

בכל סיבוב של הלולאה, כלומר בכל קלט חדש מהמשתמש, התוכנית טוענת מחדש את המודל מהקובץ. זה אומר גישה לדיסק בכל פעם, וזה בזבוז.

**מהי ההתנהגות הרצויה**

אנחנו רוצים מבנה כזה:

1. טוענים את המודל פעם אחת

2. נכנסים ללולאה

3. משתמשים באותו מודל שוב ושוב

כלומר, טעינה מחוץ ללולאה, שימוש בתוך הלולאה.

**שלב ראשון: לוודא שהטעינה מחוץ ללולאה**

בפונקציית main, שורת הטעינה צריכה להופיע לפני הלולאה:

```python
model = load_model()
```

ולא בתוך **while.**

**שלב שני: שימוש חוזר במודל**

בתוך הלולאה, אנחנו רק משתמשים במודל:

```python
predicted_price = predict_price(model, living_area)
```

המודל כבר נמצא בזיכרון, ואין צורך לטעון אותו שוב.

**הקוד המלא לאחר התיקון**

זה הקובץ הסופי לאחר כל התרגילים (2, 3, ו-4 יחד):

```python
from pathlib import Path

import joblib
import numpy as np


# ----------------------------------------
# Project paths
# ----------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "linear_regression_model.pkl"


def load_model():
    return joblib.load(MODEL_PATH)


def parse_living_area(user_input: str) -> float:
    value = float(user_input)

    if value <= 0:
        raise ValueError("Living area must be greater than zero.")

    return value


def predict_price(model, living_area: float) -> float:
    input_data = np.array([[living_area]])
    prediction = model.predict(input_data)
    return prediction[0]


def main():
    # ----------------------------------------
    # Load model once (startup time)
    # ----------------------------------------
    model = load_model()

    print("Model loaded successfully.")
    print("Type 'exit' to quit.")

    while True:
        user_input = input("\nLiving area: ").strip()

        if user_input.lower() in {"exit", "quit", "q"}:
            print("Goodbye.")
            break

        try:
            living_area = parse_living_area(user_input)
            predicted_price = predict_price(model, living_area)

            print(f"Predicted Sale Price: ${predicted_price:,.2f}")

        except ValueError:
            print("Invalid input. Please enter a positive number.")


if __name__ == "__main__":
    main()
```

**מה השתנה בפועל**

אם מסתכלים על הקוד, השינוי קטן מאוד:

```python
model = load_model()
```

הוזז לפני הלולאה.

אבל המשמעות גדולה.

לפני השינוי, כל קלט גרם לטעינה מחדש של המודל.

אחרי השינוי, המודל נטען פעם אחת בלבד, ונשאר בזיכרון לאורך כל הריצה.

**למה זה חשוב**

זה אחד ההבדלים המרכזיים בין קוד שעובד לבין קוד שעובד נכון.

כשעובדים עם מודלים גדולים, טעינה מהדיסק יכולה לקחת זמן. אם טוענים את המודל בכל פעולה, הביצועים נפגעים בצורה משמעותית.

**לכן, העיקרון הוא:**

טעינה פעם אחת

שימוש הרבה פעמים

זה עיקרון שחוזר כמעט בכל מערכת.

**איך זה מתחבר לכל התרגילים**

בתרגיל 1 בנינו מודל ושמרנו אותו.

בתרגיל 2 למדנו לטעון אותו ולהשתמש בו.

בתרגיל 3 דאגנו שהקלט לא יפיל את התוכנית.

בתרגיל 4 דאגנו שהתוכנית תהיה יעילה.

זה כבר לא רק קוד שמדגים אלגוריתם. זו תוכנית שלמה שעובדת בצורה מסודרת, יציבה, ויעילה.

אם מסתכלים על הקוד, ניתן לראות שהמודל כבר נטען לפני הכניסה ללולאה, ולכן אין כאן שינוי קונקרטי שצריך לבצע.

התרגיל הזה לא נועד “לתקן” את הקוד, אלא לוודא שאנחנו מבינים את העיקרון שעומד מאחוריו: טעינת המודל היא פעולה שמתבצעת פעם אחת בלבד בזמן עליית התוכנית, ולא בכל איטרציה של קלט מהמשתמש.

גם אם הקוד כבר כתוב נכון, חשוב לזהות את המבנה הזה באופן מודע, ולהבין מדוע הוא נכון. במערכות אמיתיות, טעינה חוזרת של מודל בתוך לולאה עלולה לגרום לפגיעה משמעותית בביצועים, במיוחד כאשר מדובר במודלים גדולים יותר.

**בהצלחה בהמשך הקורס**
