# מעבדה: מעבר מהבנה ליישום

עד כה נבנתה הבנה תאורטית של עולם ה-Machine Learning:

הוצגו מושגים מרכזיים, סוגי למידה שונים, והיגיון הפעולה של מודלים.

אך ידע תאורטי לבדו אינו מספיק.

מודלים אינם פועלים במנותק. הם חלק ממערכת שלמה: 
מערכת שמקבלת נתונים, מעבדת אותם, מאמנת מודל, בודקת את ביצועיו, ולבסוף משתמשת בו לקבלת החלטות.

בחלק המעשי של השיעור, הוצגו מספר קבצי קוד שמדגימים את המעבר הזה בפועל. 
קבצים אלו אינם אוסף מקרי של דוגמאות, אלא ייצוג של שלבים שונים בתהליך עבודה אמיתי.

קבצי הקוד של המעבדה זמינים גם במאגר ייעודי ב-GitHub,

https://github.com/tomerkedem/ai-engineering-course

ומאפשרים לעבוד עם החומר בצורה פעילה: להריץ את הקוד, לשנות ערכים, ולבחון כיצד השינויים משפיעים על התוצאה.

מטרת המעבדה אינה ללמד תחביר של קוד, 
אלא להמחיש כיצד הרעיונות שנלמדו בחלק התאורטי מתורגמים לפעולות קונקרטיות.

המעבדה מתמקדת בארבעה היבטים מרכזיים:

- עבודה עם נתונים כבסיס לכל תהליך למידה

- שימוש בכלים חישוביים יעילים

- יישום מודלים על נתונים אמיתיים

- מדידה והבנה של תוצאות

למרות שהקבצים שיוצגו בהמשך עוסקים בנושאים שונים, 
ניתן לזהות ביניהם מבנה עבודה חוזר, שמאפיין כמעט כל מערכת Machine Learning:

- טעינת נתונים

- עיבוד והכנה

- אימון מודל

- ביצוע תחזיות

- הערכת ביצועים

מבנה זה ילווה אותנו לאורך כל המעבדה, ומהווה את הבסיס להבנת האופן שבו מערכות Machine Learning פועלות בפועל.

## פרק 1: עבודה עם נתונים וחישוב יעיל באמצעות NumPy

**📁 1_numpy_performance_demo.py**

אם זו הפעם הראשונה שאתה נכנס לחלק המעשי של Machine Learning, יש סיכוי שהיית מצפה לראות כאן משהו “חכם” יותר.

מודל, אלגוריתם, אולי איזו תחזית.

במקום זה, אתה מקבל קובץ שעושה חיבור, כפל וסכימה.

וזה מרגיש כמעט… פשוט מדי.

**אבל זה בדיוק הרגע שבו צריך לעצור.**

כי הקובץ הזה לא בא ללמד אותך מודל. 
הוא בא להשים אותך מול שאלה הרבה יותר בסיסית: 
איך הקוד שלך מתנהג כשיש עליו עומס אמיתי.

**הקוד מהשיעור**

זה הקובץ בדיוק כפי שהוא ניתן:

```python
import numpy as np
import time


def python_list_addition(list1, list2):
    """Element-wise addition using Python lists."""
    return [a + b for a, b in zip(list1, list2)]


def python_list_multiplication(list1, list2):
    """Element-wise multiplication using Python lists."""
    return [a * b for a, b in zip(list1, list2)]


def python_list_sum(arr):
    """Sum of elements using Python lists."""
    return sum(arr)


def numpy_add(a, b):
    return a + b


def numpy_multiply(a, b):
    return a * b


def numpy_sum(a):
    return np.sum(a)


def benchmark_operation(name, python_func, numpy_func, python_args, numpy_args):
    """Benchmark a Python function against its NumPy equivalent."""
    # Warm-up runs
    _ = python_func(*python_args)
    _ = numpy_func(*numpy_args)
    
    # Benchmark Python version
    start_time = time.perf_counter()
    for _ in range(100):
        python_func(*python_args)
    python_time = time.perf_counter() - start_time
    
    # Benchmark NumPy version
    start_time = time.perf_counter()
    for _ in range(100):
        numpy_func(*numpy_args)
    numpy_time = time.perf_counter() - start_time
    
    speedup = python_time / numpy_time if numpy_time > 0 else float('inf')
    
    print(f"\n{name}:")
    print(f"  Python list time: {python_time:.6f} seconds (100 iterations)")
    print(f"  NumPy array time: {numpy_time:.6f} seconds (100 iterations)")
    print(f"  Speedup: {speedup:.2f}x faster with NumPy")
    
    return python_time, numpy_time, speedup


def run_benchmarks(size: int) -> None:
    """Create test data and run all benchmark comparisons."""
    print(f"\n{'=' * 70}")
    print(f"Array Size: {size:,} elements")
    print(f"{'=' * 70}")

    python_list1 = [float(i) for i in range(size)]
    python_list2 = [float(i * 2) for i in range(size)]
    numpy_array1 = np.array(python_list1)
    numpy_array2 = np.array(python_list2)

    benchmark_operation(
        "Element-wise Addition",
        python_list_addition,
        numpy_add,
        (python_list1, python_list2),
        (numpy_array1, numpy_array2),
    )

    benchmark_operation(
        "Element-wise Multiplication",
        python_list_multiplication,
        numpy_multiply,
        (python_list1, python_list2),
        (numpy_array1, numpy_array2),
    )

    benchmark_operation(
        "Sum of Elements",
        python_list_sum,
        numpy_sum,
        (python_list1,),
        (numpy_array1,),
    )


def main():
    """Main function to run all benchmarks."""
    print("=" * 70)
    print("NumPy vs Python Lists Performance Comparison")
    print("=" * 70)

    run_benchmarks(100000)

    print(f"\n{'=' * 70}")
    print("Summary:")
    print("=" * 70)
    print("NumPy is significantly faster than Python lists because:")
    print("  1. NumPy arrays are stored in contiguous memory blocks")
    print("  2. NumPy operations are implemented in C/C++/Fortran")
    print("  3. NumPy uses vectorized operations (SIMD instructions)")
    print("  4. NumPy avoids Python's overhead (type checking, etc.)")
    print("=" * 70)


if __name__ == "__main__":
    main()
```

**הרצה ראשונה**

אתה מריץ את הקובץ כמו שהוא:

python 1_numpy_performance_demo.py

ולא משנה באיזה מחשב אתה עובד, אתה תקבל פלט עם אותו מבנה.

אצלך זה נראה כך:

```bash
NumPy array time: 0.004471 seconds (100 iterations)
  Speedup: 94.80x faster with NumPy

Element-wise Multiplication:
  Python list time: 0.418953 seconds (100 iterations)
  NumPy array time: 0.004197 seconds (100 iterations)
  Speedup: 99.82x faster with NumPy

Sum of Elements:
  Python list time: 0.052219 seconds (100 iterations)
  NumPy array time: 0.003413 seconds (100 iterations)
  Speedup: 15.30x faster with NumPy

======================================================================
Summary:
======================================================================
NumPy is significantly faster than Python lists because:
  1. NumPy arrays are stored in contiguous memory blocks
  2. NumPy operations are implemented in C/C++/Fortran
  3. NumPy uses vectorized operations (SIMD instructions)
  4. NumPy avoids Python's overhead (type checking, etc.)
======================================================================
```

**בוא נקרא את זה כמו שצריך**

הקוד מתחיל בכותרת, רק כדי להכניס אותך להקשר.

ואז מגיעה שורה אחת שמכתיבה את כל מה שתראה:

```python
Array Size: 100,000 elements
```

זה אומר שכל פעולה שתראה עכשיו רצה על מאה אלף איברים.

לא עשרה. 
לא אלף.

מאה אלף.

ואז מתחיל החלק המעניין.

**חיבור**

```bash
Element-wise Addition:
  Python list time: 0.423826 seconds (100 iterations)
  NumPy array time: 0.004471 seconds (100 iterations)
  Speedup: 94.80x faster with NumPy
```

הקוד לוקח פעולה פשוטה מאוד: חיבור בין שני מערכים.

לא משהו מורכב. 
לא מודל.

רק:

a + b

והוא מריץ את זה 100 פעמים.

בפייתון רגיל, זה לוקח בערך 0.42 שניות. 
עם NumPy, זה לוקח בערך 0.004.

זו לא טעות הקלדה.

פי תשעים וארבע.

**כפל**

```bash
Element-wise Multiplication:
  Python list time: 0.418953 seconds (100 iterations)
  NumPy array time: 0.004197 seconds (100 iterations)
  Speedup: 99.82x faster with NumPy
```

אותו סיפור.

רק שהפעם זה אפילו יותר קיצוני.

כמעט פי 100.

וזה כבר מתחיל להרגיש לא מקרי.

**סכימה**

```bash
Sum of Elements:
  Python list time: 0.052219 seconds (100 iterations)
  NumPy array time: 0.003413 seconds (100 iterations)
  Speedup: 15.30x faster with NumPy
```

כאן הפער קטן יותר.

ועדיין, פי 15.

גם זה לא משהו שאפשר להתעלם ממנו.

**עכשיו מגיע הרגע שבו אתה נוגע בקוד**

כל הקובץ הזה מתנקז לשורה אחת:

```python
run_benchmarks(100000)
```

זו השורה היחידה שבאמת קובעת כמה עבודה תתבצע.

**נסה להקטין**

```python
run_benchmarks(10000)
```

תריץ שוב.

פתאום:

- הכול רץ מהר יותר

- הפער עדיין קיים, אבל פחות דרמטי

**עכשיו תגדיל**

```python
run_benchmarks(1000000)
```

תריץ שוב.

כאן כבר אין ספק:

- הזמנים קופצים

- הפער נהיה עצום

**ואם אתה רוצה לראות את זה מתפתח**

```python
run_benchmarks(10000)
run_benchmarks(100000)
run_benchmarks(1000000)
```

פתאום אתה רואה תהליך.

לא “דוגמה”, אלא שינוי אמיתי.

**מה באמת קורה כאן**

לא שינית את האלגוריתם. 
לא שינית את הקוד.

שינית רק דבר אחד:

כמה נתונים עוברים דרך הקוד.

וזה מספיק כדי להפוך קוד “תמים” למשהו שלא עומד בעומס.

הקובץ הזה לא נועד להרשים אותך.

הוא נועד לגרום לך להבין רגע אחד פשוט:

יש הבדל עצום בין קוד שעובד על מעט נתונים, לבין קוד שעובד על הרבה נתונים.

וההבדל הזה מתחיל כבר בפעולות הכי בסיסיות שיש.



## פרק 2: עבודה עם נתונים - מעבר למבנה

**📁 2_pandas_dataframe_demo.py**

אחרי שראית בפרק הקודם איך עובדים עם מערכים ומה המשמעות של ביצועים כשכמות הנתונים גדלה, מגיע שלב אחר לגמרי.

עד עכשיו עבדת עם מספרים.

רשימות.

מערכים.

חישובים.

אבל כמעט אף מערכת אמיתית לא עובדת רק עם מספרים מנותקים.

היא עובדת עם מידע.

שמות של אנשים.

גילאים.

ערים.

משכורות.

ובדרך כלל, כל זה מגיע בצורה של טבלה.

**למה בכלל צריך pandas**

תחשוב על זה רגע.

אם היית מקבל את הנתונים האלה כרשימות רגילות בפייתון, זה היה נראה בערך כך:

```python
names = ['Alice', 'Bob', 'Charlie']
ages = [25, 30, 35]
```

כבר כאן מתחילה בעיה.

אין קשר ברור בין השם לגיל. אין מבנה אחד שמכיל את הכול. כל פעולה הופכת להיות מסורבלת.

pandas פותר את זה בכך שהוא נותן לך מבנה אחד שמחזיק את כל הנתונים יחד.

הוא קורא לזה DataFrame.

וזה נראה בדיוק כמו טבלה.

**הרצה ראשונה**

אתה מריץ את הקובץ:

python 2_pandas_dataframe_demo.py

והדבר הראשון שאתה רואה:

```bash
======================================================================
Pandas DataFrame Basic Examples
======================================================================
```

זה רק אומר לך: עכשיו עובדים עם נתונים.

1. **יצירת DataFrame**

מיד אחר כך מופיעה הטבלה:

```bash
1. Creating a DataFrame from a dictionary:
----------------------------------------------------------------------
      Name  Age      City  Salary
0    Alice   25  New York   50000
1      Bob   30    London   60000
2  Charlie   35     Tokyo   70000
3    Diana   28     Paris   55000
4      Eve   32    Sydney   65000
```

זה מגיע מהקוד:

```python
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'Age': [25, 30, 35, 28, 32],
    'City': ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'],
    'Salary': [50000, 60000, 70000, 55000, 65000]
}

df = pd.DataFrame(data)
```

מה שקרה כאן בפועל:

- כל עמודה קיבלה שם

- כל שורה היא רשומה אחת

- pandas בנה לך טבלה שלמה מתוך מבנה פשוט

אם אתה רגיל ל-Excel, זה מרגיש מוכר מיד.

2. **להבין מה יש לך ביד**

הקוד ממשיך:

```bash
DataFrame Info:
----------------------------------------------------------------------
```

```python

Shape (rows, columns): (5, 4)
```

זה אומר:

יש 5 שורות ו-4 עמודות.

```python
Column names: ['Name', 'Age', 'City', 'Salary']
```

אלה השמות שאתה תשתמש בהם בהמשך.

```bash
Data types:
Name        str
Age       int64
City        str
Salary    int64
```

כאן קורה משהו חשוב.

לא כל הנתונים זהים.

- Name הוא טקסט

- Age הוא מספר

- Salary הוא מספר

וזה קובע מה אפשר לעשות עליהם.

3. **לראות חלק מהנתונים**

```bash
3. First 3 rows:
----------------------------------------------------------------------
Alice, Bob, Charlie
```

זה מגיע מ:

```python
df.head(3)
```

הקוד מראה לך רק את ההתחלה.

```bash
4. Last 2 rows:
----------------------------------------------------------------------
Diana, Eve
```

מ:

```python
df.tail(2)
```

אותו רעיון, רק מהסוף.

4. **לבחור עמודה**

```bash
5. Selecting a single column (Name):
----------------------------------------------------------------------
Alice, Bob, Charlie...
```

הקוד:

```python
df['Name']
```

וכאן קורה שינוי קטן אבל חשוב.

זו כבר לא טבלה.

ואז אתה רואה:

```bash
Type: <class 'pandas.Series'>
```

לקחת עמודה אחת ← קיבלת מבנה אחר.

5. **לבחור כמה עמודות**

```bash
6. Selecting multiple columns (Name and Age):
```

הקוד:

```python
df[['Name', 'Age']]
```

עכשיו חזרת לטבלה, אבל קטנה יותר.

6. **לסנן נתונים**

```bash
7. Filtering: People older than 30:
----------------------------------------------------------------------
Charlie, Eve
```

הקוד:

```python
df[df['Age'] > 30]
```

מה שקרה:

- כל השורות נבדקו

- נשארו רק אלה שעומדות בתנאי

```bash
8. Filtering: People with salary greater than 55000:
----------------------------------------------------------------------
Bob, Charlie, Eve
```

אותו רעיון, תנאי אחר.

7. **חישובים**

```bash
9. Basic Statistics:
----------------------------------------------------------------------
Mean Age: 30
Max Salary: 70000
```

הקוד לא עובר שורה שורה.

הוא עובד על עמודה שלמה.

ואז:

```bash
10. Summary statistics for numeric columns:
```

טבלה מלאה עם ממוצע, סטיית תקן, מינימום, מקסימום.

זה מגיע מ:

```python
df.describe()
```

8. **להוסיף עמודה**

```bash
11. Adding a new column (Bonus = 10% of Salary):
```

הקוד:

```python
df['Bonus'] = df['Salary'] * 0.10
```

מה שקרה:

עמודה חדשה נוצרה 
והיא מחושבת לכל השורות

בלי לולאה

9. **לשנות ערך**

```bash
12. Modifying a value (Alice's age to 26):
```

הקוד:

```python
df.loc[df['Name'] == 'Alice', 'Age'] = 26
```

רק שורה אחת משתנה.

10. **למיין**

```bash
13. Sorting by Salary (descending):
```

הקוד:

```python
df.sort_values('Salary', ascending=False)
```

אותם נתונים, סדר אחר.

11. **טבלה נוספת**

```bash
14. Creating DataFrame from a list of lists:
```

כאן אתה בונה טבלה מסוג אחר.

ואז:

```python
df2['Total'] = df2['Quantity'] * df2['Price']
```

ושוב, פעולה אחת על כל השורות.

**עכשיו תיגע בזה**

שנה את הנתונים.

שנה תנאים.

שנה חישובים.

הרץ שוב.

לאט לאט אתה מפסיק לקרוא קוד, ומתחיל לעבוד עם נתונים כמו מערכת אמיתית.



## פרק 3: המפגש הראשון עם מודל

**📁 3_linear_regression_classifier.py**

עד עכשיו ראית איך הנתונים נראים, איך מסדרים, מסננים ומעבדים אותם. 
לאורך כל השלבים האלה, אתה היית זה שהפעיל את ההיגיון. 
אתה שאלת את השאלות, קיבלת את ההחלטות וביצעת את החישובים.

בפרק הזה הגישה משתנה.

כאן אתה מפסיק להכתיב את החוקים בעצמך, ומתחיל לתת למערכת ללמוד אותם ישירות מתוך הנתונים. זה לא קסם, וזה גם לא מסובך כמו שזה נשמע. הכול נשען על מנגנון אחד פשוט מאוד: מציאת קשרים.

**מה המערכת מנסה להבין**

יש לנו נתונים על בתים. לא בית אחד או שניים, אלא אלפים. 
כל נכס מתואר בעזרת עשרות מאפיינים, אבל כרגע נתמקד בנתון אחד בלבד: שטח הבית. 
לצידו מופיע נתון המטרה, זה שבאמת מעניין אותנו: מחיר המכירה.

המשימה ברורה.

לנתח מספיק דוגמאות של בתים קיימים, כדי להבין כיצד שטח הבית משפיע על המחיר שלו. 
המטרה היא שברגע שנקבל נתונים על בית חדש שהמערכת טרם ראתה, היא תוכל לספק הערכת שווי סבירה.

זה בדיוק מה שהקוד הבא מבצע.

**הקוד**

```python
"""
Linear Regression using scikit-learn for predicting continuous sale prices from living area.
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

DEFAULT_CSV = Path(__file__).resolve().parent.parent / "data" / "AmesHousing.csv"

def prepare_data(csv_path=DEFAULT_CSV, test_size=0.2):
    df = pd.read_csv(csv_path)
    print(df.head())

    data = df[["Gr Liv Area", "SalePrice"]]

    X = data[["Gr Liv Area"]].values
    y = data["SalePrice"].values

    return train_test_split(X, y, test_size=test_size, random_state=42)

def train_model(X_train, y_train):
    print("\nTraining Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model

def evaluate(y_train, y_train_pred, y_test, y_test_pred):
    print("\nTraining Results:")
    print(f"  Mean Squared Error: {mean_squared_error(y_train, y_train_pred):.2f}")

    print("\nTesting Results:")
    print(f"  Mean Squared Error: {mean_squared_error(y_test, y_test_pred):.2f}")

def main():
    print("\n" + "=" * 60)
    print("SCIKIT-LEARN LINEAR REGRESSION DEMO")
    print("=" * 60)

    X_train, X_test, y_train, y_test = prepare_data()

    model = train_model(X_train, y_train)

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    evaluate(y_train, y_train_pred, y_test, y_test_pred)

    sample_input = np.array([[1500]])
    prediction = model.predict(sample_input)

    print("\nExample Prediction:")
    print(f"  Input: {sample_input[0][0]} sq ft")
    print(f"  Predicted Price: ${prediction[0]:,.2f}")

    plt.scatter(X_train, y_train, color="blue", alpha=0.5)
    plt.scatter(X_test, y_test, color="green", alpha=0.5)

    X_line = np.linspace(X_train.min(), X_train.max(), 100).reshape(-1, 1)
    y_line = model.predict(X_line)

    plt.plot(X_line, y_line, color="red")

    plt.xlabel("Living Area")
    plt.ylabel("Price")
    plt.title("Linear Regression")
    plt.show()

    print("\n" + "=" * 60)
    print("PROGRAM COMPLETED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
```

**מה קורה בקוד: שלב אחרי שלב**

אם מסתכלים על הקוד רגע מהצד, רואים שהוא בנוי מחלקים קטנים, שכל אחד עושה דבר אחד בלבד. זה בדיוק מה שמאפשר להבין מה קורה כאן באמת.

**טעינת הנתונים**

```python
df = pd.read_csv(csv_path)
print(df.head())
```

כאן הקוד קורא קובץ CSV ומכניס אותו ל-DataFrame.

מה שחשוב להבין:

- הקובץ מכיל עשרות עמודות

- אנחנו לא משתמשים בכולן

ואז מגיע הצמצום:

```python
data = df[["Gr Liv Area", "SalePrice"]]
```

כלומר, המודל מקבל רק שטח ומחיר. זו החלטה מודעת. 
אנחנו בודקים כמה מידע אפשר להוציא ממשתנה אחד בלבד.

**יצירת X ו-y**

```python
X = data[["Gr Liv Area"]].values
y = data["SalePrice"].values
```

כאן קורה מעבר חשוב.

- X הוא הקלט (שטח)

- y הוא התוצאה (מחיר)

בנקודה הזו, הטבלה מפסיקה להיות טבלה רגילה. היא הופכת לבעיה שהמודל צריך לפתור.

**חלוקה ל-Train ו-Test**

```python
train_test_split(X, y, test_size=0.2)
```

הקוד מחלק את הנתונים:

- 80% לאימון

- 20% לבדיקה

למה זה חשוב?

כי אם תבדוק על אותם נתונים שהתאמנת עליהם, תקבל תוצאה טובה מדי ולא אמינה.

**אימון המודל**

```python
model = LinearRegression()
model.fit(X_train, y_train)
```

זו השורה שבה הכול קורה.

המודל מנסה למצוא קו:

מחיר ≈ a * שטח + b

הוא לא “מבין” בתים. הוא רק מתאים קו למספרים.

**חיזוי**

```python
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)
```

כאן המודל מייצר תחזיות:

- על נתונים שהוא למד מהם

- ועל נתונים שהוא לא ראה

**מדידת איכות**

```python
mean_squared_error(...)
```

זה המדד שמודפס.

המשמעות שלו: עד כמה רחוק המודל מהמציאות. 
הטעות נמדדת בריבוע, ולכן המספרים גדולים. 
חשוב להבין: טעות גדולה מקבלת משקל הרבה יותר גבוה מטעות קטנה.

**חיזוי ידני**

```python
sample_input = np.array([[1500]])
model.predict(sample_input)
```

כאן אתה נותן קלט חדש.

והמודל מחזיר תשובה.

**גרף**

```python
plt.scatter(...)
plt.plot(...)
```

הקוד מצייר:

- נקודות מייצגות את הנתונים

- קו מייצג את המודל

וזה מאפשר להבין בעיניים מה קרה.

**מה אומר פלט ההרצה שלך**

**שלב ראשון**

```bash
[5 rows x 82 columns]
```

יש הרבה מידע, אבל המודל משתמש רק בחלק קטן ממנו.

**שלב האימון**

```bash
Training Linear Regression model...
```

המודל לומד קשר

**התוצאות**

```bash
Training Results:
  Mean Squared Error: 3046332173.40

Testing Results:
  Mean Squared Error: 3821184066.27
```

מה חשוב כאן:

- ה-Training קטן יותר

- ה-Testing גדול יותר

זה תקין.

מה זה אומר בפועל?

המודל לא מושלם, אבל הוא כן לומד משהו

**החיזוי**

```bash
Input: 1500 sq ft
Predicted Price: $179,344.29
```

זה החלק הכי חשוב.

זה כבר שימוש במודל, לא רק ניתוח



**איך לקרוא את הגרף שנוצר בהרצה**

בנוסף לפלט שמופיע בטרמינל, הקוד פותח חלון עם גרף.

<img src="/Lesson-2-Machine-Learning/assets/image-34.png" alt="image-34.png" width="632" height="459" />


בגרף הזה כל נקודה מייצגת בית אחד. 
ציר ה-X מציג את שטח המגורים מעל הקרקע, וציר ה-Y מציג את מחיר המכירה.

- הנקודות הכחולות הן נתוני האימון

- הנקודות הירוקות הן נתוני הבדיקה

- הקו האדום הוא קו הרגרסיה שהמודל מצא

הדבר הראשון שרואים הוא שהקו האדום עולה. זה אומר שהמודל מצא קשר חיובי בין שטח הבית למחיר: ככל שהשטח גדול יותר, המחיר החזוי גבוה יותר.

אבל הדבר השני שרואים חשוב לא פחות. 
הנקודות לא יושבות על הקו. הן מפוזרות סביבו, לפעמים רחוק ממנו.

זה אומר שהשטח משפיע על המחיר, אבל הוא לא הסיפור כולו.

יש בתים קטנים יחסית שנמכרו ביוקר, ויש בתים גדולים יחסית שנמכרו במחיר נמוך יותר מהצפוי.

וזו בדיוק המגבלה של המודל בפרק הזה: הוא משתמש במשתנה אחד בלבד. 
הוא לא יודע על מיקום, מצב הנכס, איכות הבנייה, שנת המכירה או מאפיינים נוספים מתוך 82 העמודות שבקובץ.

לכן הגרף חשוב לא פחות מהמספרים.

ה-MSE אומר שהמודל טועה.הגרף מראה לך איך הטעות הזו נראית.

**התובנה החשובה ביותר כאן**

אם משהו אחד צריך להישאר מהפרק הזה, זה זה:

**המודל לא נכשל, הוא מוגבל**

הוא מקבל מעט מידע, ולכן הוא מחזיר תשובה חלקית

**כשאתה משנה משהו בקוד**

כל שינוי שאתה עושה משפיע על אחד משלושה דברים:

- הדאטה

- המודל

- המדידה

ולכן כל שינוי קטן שאתה עושה בקוד הופך מיד לניסוי אמיתי שמלמד אותך משהו חדש.



## פרק 4: מעבר מרגרסיה לסיווג

**📁 4_logistic_regression_classifier.py**

בפרק הקודם עבדת עם מודל שמחזיר ערך מספרי. נתת לו קלט, והוא החזיר תוצאה רציפה. במקרה של מחירי בתים, זה הגיוני. אם שטח הבית גדל, המחיר משתנה בהתאם, ואין נקודה שבה “קופצים” בין שתי אפשרויות. הכול רציף.

בפרק הזה סוג הבעיה משתנה לחלוטין. במקום לשאול “כמה”, אנחנו שואלים “האם”. האם המשתמש יקנה מוצר או לא. האם פעולה מסוימת תקרה או לא. זו כבר לא בעיה של חיזוי ערך, אלא בעיה של קבלת החלטה.

זה שינוי קטן בניסוח, אבל שינוי גדול מאוד במודל. כאן אנחנו נכנסים לעולם של סיווג, ובפרט לסיווג בינארי, שבו יש שתי תוצאות אפשריות בלבד.

**מה הבעיה שאנחנו פותרים**

הדאטה בפרק הזה מתאר משתמשים. לכל משתמש יש שני מאפיינים: גיל ומשכורת. בנוסף יש עמודה שמציינת האם אותו משתמש רכש מוצר מסוים. הערך מיוצג כ-0 או 1, כאשר 0 מייצג “לא קנה” ו-1 מייצג “קנה”.

המטרה היא ללמוד מתוך הדוגמאות האלה דפוס התנהגות. כלומר, להבין כיצד גיל ומשכורת משפיעים על ההחלטה האם לקנות. לאחר שהמודל למד את הדפוס, ניתן להזין לו נתונים של משתמש חדש, והוא ייתן הערכה האם אותו משתמש צפוי לבצע רכישה.

בניגוד לפרק הקודם, כאן לא מחפשים מספר מדויק, אלא החלטה. עם זאת, המודל עדיין עובד דרך הסתברויות. הוא לא “יודע” בוודאות, אלא מחשב עד כמה סביר שכל אחת מהאפשרויות תתרחש.

**הקוד**

הקוד בפרק הזה בנוי באותו מבנה שראית קודם: טעינת נתונים, חלוקה ל-train ו-test, אימון מודל, חיזוי, והערכה. ההבדל אינו במבנה, אלא במשמעות של מה שמתבצע בתוך כל שלב.

```python
"""
Logistic Regression Classifier using scikit-learn
This program demonstrates classification tasks using logistic regression.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt

def prepare_data(csv_path: str = "data/Social_Network_Ads.csv"):
    """
    Load the Social Network Ads CSV, extract features and target, print a short
    summary, and split into training and test sets for supervised learning.
    """
    # Resolve CSV path relative to this script's directory for robustness
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_full_path = os.path.join(script_dir, "..", "data", "Social_Network_Ads.csv")
    df = pd.read_csv(csv_full_path)
    # Feature matrix: two numeric columns as NumPy arrays (rows = samples).
    X = df[["Age", "EstimatedSalary"]].values
    # Target vector: binary label (0 = did not purchase, 1 = purchased).
    y = df["Purchased"].values

    print(f"\nDataset Info:")
    print(f"  Total samples: {len(df)}")
    print(f"  Features: Age, EstimatedSalary")
    print(f"  Target: Purchased (0 = No, 1 = Yes)")
    print(f"  Purchased: {df['Purchased'].sum()} ({df['Purchased'].sum()/len(df)*100:.1f}%)")
    print(
        f"  Not Purchased: {(df['Purchased']==0).sum()} ({(df['Purchased']==0).sum()/len(df)*100:.1f}%)"
    )

    # Hold out 20% for testing; random_state keeps the split reproducible.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    # Full X, y are returned for plotting the decision boundary on all points.
    return X_train, X_test, y_train, y_test, X, y

def train_classifier(X_train, y_train):
    """
    Build a logistic regression model and fit it so it learns weights that map
    Age and EstimatedSalary to the probability of Purchased=1.
    """
    print("\nTraining Logistic Regression classifier...")
    # max_iter caps optimization steps; random_state fixes any internal RNG use.
    model = LogisticRegression(max_iter=1000, random_state=42)
    # Fit coefficients and intercept by minimizing the logistic loss on training rows.
    model.fit(X_train, y_train)
    return model

def run_predictions(model, X_train, X_test):
    """
    Apply the fitted model to training and test inputs: discrete class labels
    (0 or 1) and, for the test set, class probabilities per row.
    """
    # Predicted class (argmax of learned probabilities) on training data.
    y_train_pred = model.predict(X_train)
    # Same on held-out test data for unbiased evaluation.
    y_test_pred = model.predict(X_test)
    # Per-row probability for each class (column order follows model.classes_).
    y_test_proba = model.predict_proba(X_test)
    return y_train_pred, y_test_pred, y_test_proba

def calculate_quality(model, y_train, y_test, y_train_pred, y_test_pred):
    """
    Evaluate the classifier: accuracy on train vs test, per-class precision/
    recall on test, confusion matrix, learned weights, and a few hand-picked
    examples with predicted class and probabilities.
    """
    # Fraction of correct predictions (training can look optimistic if overfit).
    train_accuracy = accuracy_score(y_train, y_train_pred)
    # Test accuracy reflects generalization to unseen rows.
    test_accuracy = accuracy_score(y_test, y_test_pred)

    print(f"\nTraining Results:")
    print(f"  Accuracy: {train_accuracy:.4f}")

    print(f"\nTesting Results:")
    print(f"  Accuracy: {test_accuracy:.4f}")

    print(f"\nClassification Report:")
    # Precision, recall, F1 per class and support on the test set only.
    print(
        classification_report(
            y_test, y_test_pred, target_names=["Not Purchased", "Purchased"]
        )
    )

    print(f"\nConfusion Matrix:")
    # Rows = true label, columns = predicted label for binary case [[TN, FP], [FN, TP]].
    cm = confusion_matrix(y_test, y_test_pred)
    print(cm)
    print(f"  True Negatives: {cm[0][0]}, False Positives: {cm[0][1]}")
    print(f"  False Negatives: {cm[1][0]}, True Positives: {cm[1][1]}")

    # Fixed (Age, Salary) tuples to illustrate predictions outside the CSV.
    sample_inputs = np.array(
        [
            [25, 50000],
            [45, 120000],
            [30, 30000],
        ]
    )
    sample_predictions = model.predict(sample_inputs)
    sample_proba = model.predict_proba(sample_inputs)

    print(f"\nExample Predictions:")
    for i, (age, salary) in enumerate(sample_inputs):
        pred = sample_predictions[i]
        proba = sample_proba[i]
        print(f"  Age: {age}, Salary: ${salary:,}")
        print(f"    Predicted: {'Purchased' if pred == 1 else 'Not Purchased'}")
        print(f"    Probability (Not Purchased): {proba[0]:.4f}")
        print(f"    Probability (Purchased): {proba[1]:.4f}")

    # Return confusion matrix for the heatmap in show_plot.
    return cm

def show_plot(model, X, y, cm):
    """
    Draw a two-panel figure: (1) feature space with filled decision regions and
    scatter of true labels; (2) confusion matrix as an annotated heatmap.
    """
    plt.figure(figsize=(14, 6))

    # --- Left: decision boundary in (Age, EstimatedSalary) space ---
    plt.subplot(1, 2, 1)
    # Grid step for building a dense set of (age, salary) points to classify.
    h = 0.5
    # Extend ranges slightly so points are not clipped at the plot edge.
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1000, X[:, 1].max() + 1000
    xx, yy = np.meshgrid(
        np.arange(x_min, x_max, h), np.arange(y_min, y_max, h)
    )

    # Predict class for every grid cell, then reshape back to 2D for contourf.
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    # Background colors show which side of the boundary the model assigns to each class.
    plt.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.RdYlBu)

    # Overlay actual samples: red circles vs blue squares by true label.
    plt.scatter(
        X[y == 0, 0],
        X[y == 0, 1],
        c="red",
        marker="o",
        label="Not Purchased",
        alpha=0.6,
        s=30,
    )
    plt.scatter(
        X[y == 1, 0],
        X[y == 1, 1],
        c="blue",
        marker="s",
        label="Purchased",
        alpha=0.6,
        s=30,
    )

    plt.xlabel("Age", fontsize=12)
    plt.ylabel("Estimated Salary ($)", fontsize=12)
    plt.title("Logistic Regression: Decision Boundary", fontsize=14, fontweight="bold")
    plt.legend(fontsize=10)
    plt.grid(True, alpha=0.3)

    ax = plt.gca()
    # Format salary axis with dollar signs and thousands separators.
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f"${x:,.0f}"))

    # --- Right: confusion matrix visualization ---
    plt.subplot(1, 2, 2)
    plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    plt.title("Confusion Matrix", fontsize=14, fontweight="bold")
    plt.colorbar()
    tick_marks = np.arange(2)
    plt.xticks(tick_marks, ["Not Purchased", "Purchased"])
    plt.yticks(tick_marks, ["Not Purchased", "Purchased"])

    # Pick text color so counts stay readable on light vs dark cells.
    thresh = cm.max() / 2.0
    for i, j in np.ndindex(cm.shape):
        plt.text(
            j,
            i,
            format(cm[i, j], "d"),
            horizontalalignment="center",
            color="white" if cm[i, j] > thresh else "black",
            fontsize=14,
            fontweight="bold",
        )

    plt.ylabel("True Label", fontsize=12)
    plt.xlabel("Predicted Label", fontsize=12)

    plt.tight_layout()
    plt.show()

def logistic_regression_classifier_example():
    """
    End-to-end demo: load and split data, train logistic regression, predict on
    train/test, print metrics and coefficients, plot boundary and confusion matrix.
    Uses Social Network Ads: predict Purchased from Age and EstimatedSalary.
    """
    print("\n" + "=" * 60)
    print("LOGISTIC REGRESSION CLASSIFIER EXAMPLE")
    print("=" * 60)

    # Load CSV, build X/y, print summary, 80/20 train-test split.
    X_train, X_test, y_train, y_test, X, y = prepare_data()

    # Fit the classifier on training rows only.
    log_reg_model = train_classifier(X_train, y_train)

    # Get hard labels (and test probabilities; discard here if unused downstream).
    y_train_pred, y_test_pred, _y_test_proba = run_predictions(
        log_reg_model, X_train, X_test
    )

    # Print scores, report, matrix, weights, examples; get cm for plotting.
    cm = calculate_quality(
        log_reg_model, y_train, y_test, y_train_pred, y_test_pred
    )

    # Visualize learned separation and test-set confusion counts.
    show_plot(log_reg_model, X, y, cm)

    # Expose model and test outputs for callers that import this module.
    return log_reg_model, X_test, y_test, y_test_pred

def main():
    """
    Script entry point: print a banner, run the full example pipeline, then a
    completion banner. When run as a program (not imported), this is what executes.
    """
    print("\n" + "=" * 60)
    print("SCIKIT-LEARN LOGISTIC REGRESSION CLASSIFIER DEMO")
    print("=" * 60)

    # Run data → train → evaluate → plot; unpack return values for possible extension.
    log_reg_model, X_test, y_test, y_pred = logistic_regression_classifier_example()

    print("\n" + "=" * 60)
    print("PROGRAM COMPLETED SUCCESSFULLY")
    print("=" * 60)

# Run the demo only when this file is executed directly (`python .../4_logistic_regression_classifier.py`).
if __name__ == "__main__":
    main()
```

**מה קורה בקוד**

**טעינת הנתונים והגדרת הקלט**

```python
X = df[["Age", "EstimatedSalary"]].values
y = df["Purchased"].values
```

בשלב הזה נבחרים המשתנים שישמשו כקלט למודל. בניגוד לפרק הקודם שבו השתמשנו במשתנה אחד, כאן יש שניים. המשמעות היא שהמודל פועל במרחב דו-ממדי. כל נקודה מייצגת אדם, כאשר המיקום שלה נקבע לפי גיל ומשכורת.

המשתנה y הוא התוצאה שאנחנו מנסים לחזות. זהו ערך בינארי שמציין האם המשתמש רכש או לא.

**חלוקה לנתוני אימון ובדיקה**

בדומה לפרק הקודם, גם כאן הנתונים מחולקים לשתי קבוצות. חלק מהנתונים משמשים לאימון המודל, וחלקם נשמרים לבדיקה. המטרה היא להעריך את ביצועי המודל על נתונים שלא נראו במהלך האימון, כדי לקבל תמונה אמיתית של היכולת שלו להכליל.

**אימון המודל**

```python
model = LogisticRegression()
model.fit(X_train, y_train)
```

זהו שלב האימון. למרות שהקוד נראה דומה מאוד ל-Linear Regression, המודל כאן שונה במהותו. במקום להתאים קו שמנסה להעריך ערך מספרי, המודל לומד גבול החלטה שמפריד בין שתי קבוצות.

במילים אחרות, הוא מנסה לענות על השאלה: באיזה אזור במרחב נמצאים המשתמשים שקונים, ובאיזה אזור נמצאים אלה שלא.

**חיזוי והסתברויות**

```python
model.predict(X)
model.predict_proba(X)
```

כאן מופיע אחד ההבדלים החשובים ביותר. המודל לא מחזיר רק החלטה, אלא גם הסתברות. הפונקציה predict מחזירה את ההחלטה הסופית, אבל predict_proba מחזירה את הסיכוי לכל אחת מהאפשרויות.

זה מאפשר להבין לא רק מה המודל חושב, אלא גם עד כמה הוא בטוח בכך.

**תוצאת הריצה**

הפלט מתחיל במידע כללי על הדאטה:

```bash
Total samples: 400
Purchased: 143 (35.8%)
Not Purchased: 257 (64.2%)
```

כאן כבר רואים שהדאטה לא מאוזן. יש יותר משתמשים שלא רכשו מאשר כאלה שכן. זה משפיע על המודל, וחשוב לזכור את זה כשמפרשים את התוצאות.

**Accuracy**

```bash
Testing Accuracy: 0.8875
```

המודל מצליח בכ-89% מהמקרים. זה נתון טוב, אבל הוא לא מספיק בפני עצמו. Accuracy יכול להיות מטעה, במיוחד כאשר הדאטה לא מאוזן.

**Classification Report**

```bash
Not Purchased recall: 0.96
Purchased recall: 0.75
```

כאן מתחילים לראות את התמונה המלאה. המודל מצליח לזהות היטב משתמשים שלא רוכשים, אבל פחות טוב בזיהוי משתמשים שכן רוכשים. המשמעות היא שהוא מפספס חלק מהמקרים החשובים יותר, תלוי בהקשר העסקי.

**Confusion Matrix**

```bash
[[50  2]
 [ 7 21]]
```

זו הצגה מפורטת של כל התוצאות:

- 50 מקרים שבהם המודל צדק שלא תהיה רכישה

- 2 מקרים שבהם המודל טעה וחשב שתהיה רכישה

- 7 מקרים שבהם המודל פספס רכישה אמיתית

- 21 מקרים שבהם המודל צדק בזיהוי רכישה

זה אחד הכלים החשובים ביותר להבנת ביצועי מודל, כי הוא מציג את סוגי הטעויות ולא רק את הכמות הכוללת שלהן.

הגרף והמשמעות שלוראש הטופס

<img src="/Lesson-2-Machine-Learning/assets/image-35.png" alt="image-35.png" width="710" height="341" />


בגרף רואים את הנתונים עצמם ואת גבול ההחלטה של המודל. כל נקודה מייצגת משתמש, כאשר הצבע מציין האם הוא רכש או לא. הרקע הצבוע מייצג את ההחלטה של המודל עבור כל אזור.

הקו שבין האזורים הוא גבול ההחלטה. הוא לא חייב להיות קו ישר לחלוטין, אבל במקרה הזה הוא לינארי כי זהו מודל פשוט.

מה שחשוב להבין הוא שהמודל לא “ממקם” כל נקודה בדיוק, אלא מחלק את המרחב לאזורים. כל נקודה שנופלת בצד מסוים של הגבול תקבל את אותה החלטה.

**התובנה המרכזית מהפרק**

בפרק הקודם למדת איך מודל מנסה להתאים קו לנתונים כדי להעריך ערך מספרי. כאן אתה לומד איך מודל מחלק את המרחב לאזורים כדי לקבל החלטות.

זה שינוי מהותי. במקום לחשוב על התאמה, אתה מתחיל לחשוב על הפרדה. במקום לשאול “כמה”, אתה שואל “לאיזה צד זה שייך”.

ההבדל הזה עומד בבסיס של כמעט כל מערכת סיווג בעולם, והוא הבסיס להבנה של מודלים מורכבים יותר בהמשך.



## פרק 5: כשהקשר כבר לא ישר

**📁 5_decision_tree_classifier.py**

עד עכשיו עבדת עם מודלים שמחפשים קשר יחסית “חלק” בין הנתונים.

בפרק הקודם עבדת עם Logistic Regression. המודל קיבל החלטה על בסיס גבול לינארי, כלומר קו שמפריד בין קבוצות. כל נקודה הייתה בצד אחד של הקו או בצד השני, וההחלטה הייתה נגזרת מהמיקום שלה ביחס אליו.

הגישה הזו עובדת טוב, אבל יש לה מגבלה ברורה. היא מניחה שהגבול שמפריד בין הקבוצות הוא פשוט יחסית. בעולם האמיתי, הנתונים לא תמיד מתנהגים בצורה כל כך מסודרת. לפעמים הקשרים מורכבים יותר, ולא ניתן להפריד אותם בעזרת קו אחד.

כאן נכנס מודל אחר לגמרי, גם בצורה שבה הוא נראה וגם בצורה שבה הוא חושב.

Decision Tree לא מנסה למצוא קו. הוא בונה סדרה של שאלות.

במקום לשאול “באיזה צד של הקו אתה”, הוא שואל “האם הערך קטן מ-X? ואם לא, האם הוא קטן מ-Y?” וכן הלאה.

זו צורת חשיבה שונה לחלוטין, והיא הרבה יותר קרובה לאופן שבו בני אדם מקבלים החלטות.

**מה הבעיה שאנחנו פותרים**

הדאטה בפרק הזה מגיע מ-Iris dataset, אחד הדאטה-סטים הקלאסיים בלמידת מכונה. כל שורה מתארת פרח, עם ארבעה מאפיינים:

- SepalLength

- SepalWidth

- PetalLength

- PetalWidth

המטרה היא לזהות לאיזה סוג שייך הפרח:

- Iris-setosa

- Iris-versicolor

- Iris-virginica

בניגוד לפרק הקודם, שבו היו שתי אפשרויות בלבד, כאן מדובר בשלוש מחלקות. כלומר, זו בעיית סיווג רב-מחלקתי.

**הקוד**

הקוד בפרק הזה כבר מעט יותר עשיר, והוא מחולק לפונקציות ברורות: טעינת נתונים, אימון, חיזוי, הערכה והצגה גרפית.

הדבר החשוב שכדאי לשים לב אליו הוא לא רק מה כל פונקציה עושה, אלא איך הכול מתחבר יחד ליצירת מודל שלם.

```python
"""
Decision Tree Classifier Example using Iris Dataset

This script demonstrates how to:
1. Load and preprocess the Iris dataset
2. Train a Decision Tree classifier
3. Evaluate the model performance
4. Visualize the decision tree
5. Make predictions on new data
"""

from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt



def load_dataframe(csv_path: str) -> pd.DataFrame:
    """Load Iris CSV and print a short overview."""
    import os
    print("Loading Iris dataset...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_full_path = os.path.join(script_dir, "..", "data", "Iris.csv")
    df = pd.read_csv(csv_full_path)
    print("\nDataset Info:")
    print(df.info())
    print("\nFirst few rows:")
    print(df.head())
    print("\nDataset shape:", df.shape)
    print("\nClass distribution:")
    print(df['Species'].value_counts())
    return df

def train(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> tuple[DecisionTreeClassifier, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Index]:
    """
    Prepare features/target, split, and fit the decision tree (train stage).
    Returns the fitted model and train/test splits plus feature column index.
    """
    X = df.drop(['Id', 'Species'], axis=1)
    y = df['Species']
    print("\nFeatures:", X.columns.tolist())
    print("\nTarget classes:", y.unique())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    print(f"\nTraining set size: {X_train.shape[0]} samples")
    print(f"Test set size: {X_test.shape[0]} samples")

    print("\nTraining Decision Tree Classifier...")
    dt_classifier = DecisionTreeClassifier(
        random_state=random_state,
        max_depth=3,
        min_samples_split=5,
        min_samples_leaf=2,
    )
    dt_classifier.fit(X_train, y_train)
    return dt_classifier, X_train, X_test, y_train, y_test, X.columns

def predict(
    dt_classifier: DecisionTreeClassifier,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
) -> tuple[np.ndarray, np.ndarray]:
    """Run predictions on train and test splits (predict stage)."""
    y_train_pred = dt_classifier.predict(X_train)
    y_test_pred = dt_classifier.predict(X_test)
    return y_train_pred, y_test_pred

def calculate_quality(
    dt_classifier: DecisionTreeClassifier,
    feature_columns: pd.Index,
    y_train: pd.Series,
    y_test: pd.Series,
    y_train_pred: np.ndarray,
    y_test_pred: np.ndarray,
) -> None:
    """Print accuracy, classification report, confusion matrix, feature importance."""
    train_accuracy = accuracy_score(y_train, y_train_pred)
    test_accuracy = accuracy_score(y_test, y_test_pred)

    print("\n" + "="*50)
    print("MODEL PERFORMANCE")
    print("="*50)
    print(f"Training Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
    print(f"Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")

    print("\nClassification Report:")
    print(classification_report(y_test, y_test_pred))

    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_test_pred)
    print(cm)

    print("\nFeature Importance:")
    feature_importance = pd.DataFrame({
        'Feature': feature_columns,
        'Importance': dt_classifier.feature_importances_
    }).sort_values('Importance', ascending=False)
    print(feature_importance)

def show_plot(
    dt_classifier: DecisionTreeClassifier,
    feature_names: pd.Index,
    save_path: str = 'images/decision_tree_visualization.png',
) -> None:
    """Render and save the decision tree figure (plot stage)."""
    plt.figure(figsize=(20, 10))
    plot_tree(
        dt_classifier,
        feature_names=feature_names,
        class_names=dt_classifier.classes_,
        filled=True,
        rounded=True,
        fontsize=10,
    )
    plt.title('Decision Tree Visualization', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.show()
    print(f"\ndone'")

def print_prediction_examples(
    dt_classifier: DecisionTreeClassifier,
    example_samples: list[list[float]],
    feature_columns: pd.Index,
) -> None:
    """Predict and print probabilities for hand-picked feature rows."""
    print("\n" + "="*50)
    print("PREDICTION EXAMPLES")
    print("="*50)

    X_examples = pd.DataFrame(example_samples, columns=feature_columns)
    predictions = dt_classifier.predict(X_examples)
    probas = dt_classifier.predict_proba(X_examples)

    for i, (sample, prediction, probabilities) in enumerate(
        zip(example_samples, predictions, probas), 1
    ):

        print(f"\nExample {i}:")
        print(f"  Features: SepalLength={sample[0]}, SepalWidth={sample[1]}, "
              f"PetalLength={sample[2]}, PetalWidth={sample[3]}")
        print(f"  Predicted Species: {prediction}")
        print(f"  Prediction Probabilities:")
        for class_name, prob in zip(dt_classifier.classes_, probabilities):
            print(f"    {class_name}: {prob:.4f} ({prob*100:.2f}%)")

def main() -> None:
    df = load_dataframe('data/Iris.csv')

    dt_classifier, X_train, X_test, y_train, y_test, feature_columns = train(df)

    y_train_pred, y_test_pred = predict(dt_classifier, X_train, X_test)

    calculate_quality(
        dt_classifier,
        feature_columns,
        y_train,
        y_test,
        y_train_pred,
        y_test_pred,
    )

    show_plot(dt_classifier, feature_columns)

    example_samples = [
        [5.1, 3.5, 1.4, 0.2],
        [6.0, 3.0, 4.5, 1.5],
        [6.5, 3.0, 5.8, 2.2],
    ]
    print_prediction_examples(dt_classifier, example_samples, feature_columns)

    print("\n" + "="*50)
    print("Script completed successfully!")
    print("="*50)

if __name__ == "__main__":
    main()
```

**מה קורה בקוד**

**טעינת הנתונים**

```python
df = pd.read_csv(...)
print(df.info())
print(df.head())
```

כאן נטען הדאטה ומודפס מידע בסיסי עליו. לפי הפלט שלך, ניתן לראות:

- 150 דוגמאות

- 4 מאפיינים מספריים

- עמודת יעד אחת (Species)

בנוסף, הדאטה מאוזן לחלוטין:

```bash
Iris-setosa        50
Iris-versicolor    50
Iris-virginica     50
```

זה מצב אידיאלי ללמידה, כי אין הטיה לכיוון מחלקה מסוימת.

**הגדרת המשתנים**

```python
X = df.drop(['Id', 'Species'], axis=1)
y = df['Species']
```

בשורה הזו לא בוחרים במפורש את המאפיינים שנכנסים למודל, אלא מסירים את העמודות שלא רלוונטיות ללמידה.

כדי להבין מה באמת נכנס ל-X, צריך להסתכל רגע על מבנה הדאטה:

```bash
Id  
SepalLengthCm  
SepalWidthCm  
PetalLengthCm  
PetalWidthCm  
Species  
```

אנחנו מסירים שתי עמודות:

- Id - מזהה, שאין לו משמעות ללמידה

- Species - זו התוצאה שאותה אנחנו רוצים לחזות

מה שנשאר הוא הקלט למודל:

- SepalLengthCm

- SepalWidthCm

- PetalLengthCm

- PetalWidthCm

כלומר, המודל מקבל ארבעה מאפיינים שמתארים את הפרח, ומנסה ללמוד מהם לאיזה סוג הוא שייך.

**אימון המודל**

```python
DecisionTreeClassifier(
    max_depth=3,
    min_samples_split=5,
    min_samples_leaf=2
)
```

זה אחד החלקים הכי חשובים בקוד.

בניגוד למודלים הקודמים, כאן יש שליטה ישירה על המורכבות של המודל:

- max_depth=3 מגביל את עומק העץ

- min_samples_split קובע מתי מותר לפצל

- min_samples_leaf קובע כמה דוגמאות מינימום בכל עלה

למה זה חשוב? כי בלי הגבלות, העץ יכול ללמוד את הדאטה “יותר מדי טוב”, ולהיכשל על נתונים חדשים.

**תוצאת הריצה**

**מבנה הדאטה**

```bash
Dataset shape: (150, 6)
```

כלומר 150 שורות ו-6 עמודות, מתוכן 4 משמשות ללמידה.

**חלוקת הנתונים**

```bash
Training set size: 120
Test set size: 30
```

80% לאימון ו-20% לבדיקה, בדיוק כמו בפרקים הקודמים.

**ביצועי המודל**

```bash
Training Accuracy: 98.33%
Test Accuracy: 96.67%
```

אלה תוצאות גבוהות מאוד.

מה שחשוב לשים לב אליו הוא שהפער בין train ל-test קטן. זה סימן טוב לכך שהמודל לא “שינן” את הדאטה, אלא למד דפוס כללי.

```bash
Classification Report
Iris-setosa       1.00
Iris-versicolor   0.90
Iris-virginica    1.00
```

המודל מזהה בצורה מושלמת את setosa ו-virginica, אבל מעט מתקשה עם versicolor. זה הגיוני, כי versicolor נמצא “באמצע” והוא דומה יותר למחלקות האחרות.

```bash
Confusion Matrix
[[10  0  0]
 [ 0  9  1]
 [ 0  0 10]]
```

המשמעות:

- כל ה-setosa זוהו נכון

- אחד מ-versicolor זוהה בטעות כ-virginica

- כל ה-virginica זוהו נכון

זו תמונה כמעט מושלמת.

**העץ עצמו**

<img src="/Lesson-2-Machine-Learning/assets/image-36.png" alt="image-36.png" width="710" height="354" />


כאן קורה משהו חדש לגמרי.

במקום קו או גבול, אתה רואה מבנה של עץ. כל צומת בעץ מייצג שאלה.

לדוגמה:

```bash
PetalLengthCm <= 2.45
```

זו השאלה הראשונה. אם התשובה היא כן, הולכים שמאלה. אם לא, הולכים ימינה.

כל צומת כזה מפצל את הדאטה לשתי קבוצות, וכל פיצול נעשה בצורה שמפרידה טוב יותר בין המחלקות.

**איך לקרוא את העץ**

כל צומת מציג:

- gini מדד “בלבול” (כמה מעורבות המחלקות)

- samples כמה דוגמאות הגיעו לצומת

- value כמה דוגמאות מכל מחלקה

- class המחלקה הדומיננטית

ככל שה-gini נמוך יותר, הצומת “נקי” יותר, כלומר רוב הדוגמאות שייכות לאותה מחלקה.

בעלים של העץ (הקצוות) מתקבלת ההחלטה הסופית.

```bash
Feature Importance
PetalLengthCm    0.579
PetalWidthCm     0.420
SepalWidthCm     0.000
SepalLengthCm    0.000
```

זה אחד החלקים הכי מעניינים.

המודל בעצם אומר:

כמעט כל ההחלטות מבוססות על PetalLength ו-PetalWidth

והמאפיינים האחרים כמעט לא רלוונטיים.

זו תובנה שהמודל גילה לבד.

**התובנה המרכזית מהפרק**

אם בפרק הקודם למדת שמודל יכול להפריד בין קבוצות בעזרת גבול לינארי, כאן אתה רואה גישה אחרת לגמרי.

Decision Tree לא מנסה לפשט את הבעיה לקו אחד. הוא מפרק אותה לסדרה של החלטות קטנות. כל החלטה היא פשוטה מאוד, אבל יחד הן יוצרות מערכת שמסוגלת להתמודד עם בעיות מורכבות יותר.

המודל הזה גם נותן לך משהו שלא קיבלת קודם: שקיפות. אתה יכול לראות בדיוק איך הוא הגיע לכל החלטה, שלב אחרי שלב.

וזו אחת הסיבות המרכזיות לכך שעצי החלטה הם כלי כל כך חשוב בלמידת מכונה.



## פרק 6: לא עץ אחד, אלא הרבה עצים

**📁 6_random_forest_classifier.py**

בפרק הקודם ראית איך Decision Tree מקבל החלטות. הוא לא מנסה למצוא קו, אלא בונה סדרה של שאלות: האם אורך עלה הכותרת קטן מערך מסוים, האם רוחב עלה הכותרת גדול מערך אחר, וכן הלאה. כל שאלה מפצלת את הנתונים, עד שבסוף מגיעים להחלטה.

זה מודל נוח מאוד להבנה, כי אפשר ממש לראות את דרך החשיבה שלו. אבל לעץ החלטה יש גם חולשה: הוא עלול להיות רגיש מדי לנתונים שעליהם הוא התאמן. שינוי קטן בדאטה יכול לשנות את מבנה העץ, ולעיתים עץ אחד לומד את הדאטה “יותר מדי טוב”.

כאן נכנס Random Forest.

במקום לבנות עץ אחד, בונים הרבה עצים. כל עץ רואה חלק מעט שונה מהנתונים או מהמאפיינים, וכל אחד מהם מקבל החלטה. בסוף, המודל לא מסתמך על עץ בודד, אלא על הצבעה של הרבה עצים יחד.

הרעיון פשוט מאוד: עץ אחד יכול לטעות, אבל אם הרבה עצים מצביעים יחד, ההחלטה בדרך כלל יציבה יותר.

**הקוד**

```python
"""
Random Forest Classifier Example using Iris Dataset

This script demonstrates how to:
1. Load and preprocess the Iris dataset
2. Train a Random Forest classifier
3. Evaluate the model performance
4. Visualize individual trees from the forest
5. Analyze feature importance
6. Make predictions on new data
"""

import os

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import plot_tree
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
from collections import Counter

def ensure_images_dir(path="images"):
    """Create the output images directory if it does not exist."""
    os.makedirs(path, exist_ok=True)

def read_iris(csv_path):
    """Load the Iris CSV into a DataFrame (no preprocessing)."""
    # Resolve CSV path relative to this script's directory for robustness
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_full_path = os.path.join(script_dir, "..", "data", "Iris.csv")
    return pd.read_csv(csv_full_path)

def print_data_overview(df):
    """Print schema, sample rows, shape, and target class balance."""
    print("Loading Iris dataset...")
    print("\nDataset Info:")
    print(df.info())
    print("\nFirst few rows:")
    print(df.head())
    print("\nDataset shape:", df.shape)
    print("\nClass distribution:")
    print(df["Species"].value_counts())

def make_train_test_split(df, test_size, random_state):
    """Split features vs label, then stratified train/test split; also return feature column names."""
    # Features: all numeric columns except Id; target: Species
    X = df.drop(["Id", "Species"], axis=1)
    y = df["Species"]

    print("\nFeatures:", X.columns.tolist())
    print("\nTarget classes:", y.unique())

    # Stratify keeps class proportions equal in train and test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    print(f"\nTraining set size: {X_train.shape[0]} samples")
    print(f"Test set size: {X_test.shape[0]} samples")

    return X_train, X_test, y_train, y_test, X.columns

def load_data(csv_path="data/Iris.csv", test_size=0.2, random_state=42):
    """Load CSV, print overview, return stratified splits and feature column names."""
    df = read_iris(csv_path)
    print_data_overview(df)
    return make_train_test_split(df, test_size, random_state)

def train(X_train, y_train):
    """Build and fit RandomForestClassifier with regularization-friendly hyperparameters."""
    print("\nTraining Random Forest Classifier...")
    # n_estimators: number of trees; max_features sqrt: random subset of features per split
    # bootstrap + oob_score: out-of-bag estimate of generalization error
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        bootstrap=True,
        oob_score=True,
    )
    rf_classifier.fit(X_train, y_train)
    return rf_classifier

def predict(rf_classifier, X_train, X_test):
    """Predict labels for training and test sets (checks fit vs held-out)."""
    y_train_pred = rf_classifier.predict(X_train)
    y_test_pred = rf_classifier.predict(X_test)
    return y_train_pred, y_test_pred

def feature_importance_df(rf_classifier, X_columns):
    """Return a DataFrame of feature names and importances, sorted high to low."""
    return pd.DataFrame(
        {"Feature": X_columns, "Importance": rf_classifier.feature_importances_}
    ).sort_values("Importance", ascending=False)

def compute_accuracy(y_train, y_train_pred, y_test, y_test_pred):
    """Compute accuracy on train and test from true labels vs predictions."""
    return {
        "train_accuracy": accuracy_score(y_train, y_train_pred),
        "test_accuracy": accuracy_score(y_test, y_test_pred),
    }

def print_quality_report(rf_classifier, acc, y_test, y_test_pred, feature_importance):
    """Print accuracies, OOB (if available), classification report, confusion matrix, importances."""
    print("\n" + "=" * 50)
    print("MODEL PERFORMANCE")
    print("=" * 50)
    train_accuracy = acc["train_accuracy"]
    test_accuracy = acc["test_accuracy"]
    print(f"Training Accuracy: {train_accuracy:.4f} ({train_accuracy * 100:.2f}%)")
    print(f"Test Accuracy: {test_accuracy:.4f} ({test_accuracy * 100:.2f}%)")

    # OOB is only meaningful when bootstrap=True (default here)
    if hasattr(rf_classifier, "oob_score_"):
        print(
            f"Out-of-Bag Score: {rf_classifier.oob_score_:.4f} ({rf_classifier.oob_score_ * 100:.2f}%)"
        )
        print("  -> OOB score is an estimate of generalization performance")

    # Per-class precision/recall/F1 on the test set
    print("\nClassification Report:")
    print(classification_report(y_test, y_test_pred))

    # Where predictions disagree with true labels (rows=true, cols=predicted)
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_test_pred)
    print(cm)

    print("\nFeature Importance:")
    print(feature_importance)

    return cm

def calculate_quality(
    rf_classifier, X_columns, y_train, y_train_pred, y_test, y_test_pred
):
    """Compute metrics and importances, print report, return a dict of results."""
    acc = compute_accuracy(y_train, y_train_pred, y_test, y_test_pred)
    feature_importance = feature_importance_df(rf_classifier, X_columns)
    cm = print_quality_report(
        rf_classifier, acc, y_test, y_test_pred, feature_importance
    )
    return {
        "train_accuracy": acc["train_accuracy"],
        "test_accuracy": acc["test_accuracy"],
        "confusion_matrix": cm,
        "feature_importance": feature_importance,
    }

def plot_feature_importance(rf_classifier, X_columns):
    """Horizontal bar chart of importances; save under images/."""
    feature_importance = feature_importance_df(rf_classifier, X_columns)

    plt.figure(figsize=(10, 6))
    # Barh: longest bar = most important feature (invert_yaxis shows highest on top)
    plt.barh(feature_importance["Feature"], feature_importance["Importance"])
    plt.xlabel("Importance")
    plt.title("Random Forest Feature Importance", fontsize=14, fontweight="bold")
    plt.gca().invert_yaxis()
    plt.tight_layout()
    ensure_images_dir()
    plt.savefig(
        "images/random_forest_feature_importance.png",
        dpi=300,
        bbox_inches="tight",
    )
    print(
        "\nFeature importance plot saved as 'images/random_forest_feature_importance.png'"
    )

def plot_sample_trees(rf_classifier, X_columns):
    """Plot up to three estimators from the forest as decision-tree diagrams."""
    print("\nVisualizing sample trees from the forest...")
    n_trees_to_show = min(3, len(rf_classifier.estimators_))
    # Single row of subplots so trees are comparable at a glance
    fig, axes = plt.subplots(1, n_trees_to_show, figsize=(20, 6))
    if n_trees_to_show == 1:
        axes = [axes]

    for i in range(n_trees_to_show):
        # Each estimators_[i] is one DecisionTreeClassifier trained on a bootstrap sample
        plot_tree(
            rf_classifier.estimators_[i],
            feature_names=X_columns,
            class_names=rf_classifier.classes_,
            filled=True,
            rounded=True,
            fontsize=8,
            ax=axes[i],
        )
        axes[i].set_title(
            f"Tree {i + 1} of {len(rf_classifier.estimators_)}",
            fontsize=12,
            fontweight="bold",
        )

    plt.suptitle("Sample Trees from Random Forest", fontsize=16, fontweight="bold")
    plt.tight_layout()
    ensure_images_dir()
    # High DPI for readable node text when zooming
    plt.savefig("images/random_forest_trees.png", dpi=300, bbox_inches="tight")
    print(f"Sample trees visualization saved as 'images/random_forest_trees.png'")

def show_plot(rf_classifier, X_columns):
    """Generate and save both feature-importance and sample-tree figures."""
    plot_feature_importance(rf_classifier, X_columns)
    plot_sample_trees(rf_classifier, X_columns)

def predict_examples(rf_classifier, X_columns):
    """Run the forest on hand-picked rows; show class probs and per-tree vote breakdown."""
    print("\n" + "=" * 50)
    print("PREDICTION EXAMPLES")
    print("=" * 50)

    # Fixed feature vectors in the same order as X_columns (Iris measurements)
    example_samples = [
        [5.1, 3.5, 1.4, 0.2],
        [6.0, 3.0, 4.5, 1.5],
        [6.5, 3.0, 5.8, 2.2],
    ]
    example_df = pd.DataFrame(example_samples, columns=X_columns)

    for i, sample in enumerate(example_samples, 1):
        row = example_df.iloc[[i - 1]]  # 2D slice keeps DataFrame API for sklearn
        prediction = rf_classifier.predict(row)
        probabilities = rf_classifier.predict_proba(row)[0]

        print(f"\nExample {i}:")
        print(
            f"  Features: SepalLength={sample[0]}, SepalWidth={sample[1]}, "
            f"PetalLength={sample[2]}, PetalWidth={sample[3]}"
        )
        print(f"  Predicted Species: {prediction[0]}")
        print(f"  Prediction Probabilities:")
        for class_name, prob in zip(rf_classifier.classes_, probabilities):
            print(f"    {class_name}: {prob:.4f} ({prob * 100:.2f}%)")

        # Majority vote: ask each tree for its class, then count votes per species
        X_row = row.to_numpy(dtype=np.float64, copy=False)
        tree_predictions = [
            rf_classifier.classes_[int(np.asarray(tree.predict(X_row))[0])]
            for tree in rf_classifier.estimators_
        ]
        vote_counts = Counter(tree_predictions)
        print(f"  Tree Votes:")
        for class_name in rf_classifier.classes_:
            votes = vote_counts.get(class_name, 0)
            print(
                f"    {class_name}: {votes} trees ({votes / len(rf_classifier.estimators_) * 100:.1f}%)"
            )

def main():
    """End-to-end demo: load data, train, evaluate, plot, explain, and example predictions."""
    # 1. Load Iris, show overview, stratified train/test split
    X_train, X_test, y_train, y_test, X_columns = load_data()
    # 2. Fit random forest on training labels
    rf_classifier = train(X_train, y_train)
    # 3. Class predictions on train and test (for accuracy and reports)
    y_train_pred, y_test_pred = predict(rf_classifier, X_train, X_test)
    # 4. Metrics, confusion matrix, feature table, printed report
    calculate_quality(rf_classifier, X_columns, y_train, y_train_pred, y_test, y_test_pred)
    # 5. Persist importance and sample-tree PNGs
    show_plot(rf_classifier, X_columns)

    print("\n" + "=" * 50)
    print("Script completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    main()
```

**מה המערכת מנסה להבין**

גם כאן אנחנו עובדים עם Iris dataset, אותו דאטה מהפרק הקודם. כל שורה מתארת פרח, והמודל מקבל ארבעה מאפיינים:

- SepalLengthCm

- SepalWidthCm

- PetalLengthCm

- PetalWidthCm

המטרה נשארת זהה: לחזות את סוג הפרח.

אבל הדרך משתנה. במקום Decision Tree יחיד, נבנה Random Forest, כלומר אוסף של עצי החלטה.

**מה קורה בקוד**

אם מסתכלים על הקוד רגע מהצד, רואים שהוא ממשיך את אותו pipeline שכבר פגשת: טעינת נתונים, חלוקה ל-train ו-test, אימון, חיזוי, מדידה, ואז יצירת גרפים. ההבדל המרכזי נמצא במודל עצמו. במקום DecisionTreeClassifier, משתמשים כאן ב-RandomForestClassifier.

**טעינת הנתונים**

```python
df = read_iris(csv_path)
print_data_overview(df)
```

כאן נטען קובץ Iris.csv, ואז מודפס מידע בסיסי על הדאטה: מבנה העמודות, השורות הראשונות, גודל הטבלה והתפלגות המחלקות.

הפלט מראה שיש 150 דוגמאות, 6 עמודות, ומתוכן ארבע עמודות מספריות שמתארות את הפרח. יש גם עמודת Id, שהיא מזהה בלבד, ועמודת Species, שהיא התוצאה שהמודל צריך ללמוד לחזות.

**הפרדת קלט ותוצאה**

```python
X = df.drop(["Id", "Species"], axis=1)
y = df["Species"]
```

גם כאן חשוב לא לדלג על ההבנה.

השורה הראשונה לא אומרת “בחר ארבע עמודות”, אלא “קח את כל העמודות, חוץ מ-Id ו-Species”.

כלומר, אחרי שמסירים את Id ואת Species, נשארות ארבע עמודות הקלט:

- SepalLengthCm

- SepalWidthCm

- PetalLengthCm

- PetalWidthCm

המשתנה y מכיל את התוצאה, כלומר את סוג הפרח.

**חלוקה לנתוני אימון ובדיקה**

```python
train_test_split(
    X, y, test_size=test_size, random_state=random_state, stratify=y
)
```

הקוד מחלק את הנתונים ל-train ול-test. גם כאן משתמשים ב-stratify=y, וזה חשוב במיוחד כשיש כמה מחלקות. המשמעות היא שהחלוקה שומרת על היחס בין סוגי הפרחים גם באימון וגם בבדיקה.

בפלט שלך רואים:

```bash
Training set size: 120 samples
Test set size: 30 samples
```

כלומר, 120 דוגמאות משמשות לאימון, ו-30 דוגמאות נשמרות לבדיקה.

**אימון Random Forest**

```python
rf_classifier = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    max_depth=5,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features="sqrt",
    bootstrap=True,
    oob_score=True,
)
rf_classifier.fit(X_train, y_train)
```

זה החלק המרכזי בפרק.

**n_estimators=100** אומר שהיער יכלול 100 עצים. זה ההבדל הגדול מעץ החלטה רגיל. במקום מודל יחיד, יש כאן קבוצה של מודלים.

**max_depth=5** מגביל את עומק העצים. זה מונע מהם להפוך למורכבים מדי.

**min_samples_split=5** ו-**min_samples_leaf=2** מונעים פיצולים קטנים מדי, כאלה שעלולים להתאים יותר מדי לדוגמאות בודדות.

**max_features="sqrt"**

אומר שכל עץ לא מסתכל תמיד על כל המאפיינים בכל פיצול, אלא על תת-קבוצה מהם. זה יוצר גיוון בין העצים.

**bootstrap=True** אומר שכל עץ מתאמן על דגימה מעט שונה מהדאטה. שוב, המטרה היא ליצור עצים שונים זה מזה.

**oob_score=True** מאפשר לחשב מדד נוסף שנקרא Out-of-Bag Score, שנראה בפלט בהמשך.

**מה אומר פלט ההרצה שלך**

הפלט מתחיל בטעינת הדאטה:

```bash
Loading Iris dataset...
```

לאחר מכן מתקבל מידע על מבנה הטבלה:

```bash
RangeIndex: 150 entries, 0 to 149
Data columns (total 6 columns)
```

כלומר, יש 150 שורות ו-6 עמודות.

בהמשך מופיעות העמודות:

```bash
Id
SepalLengthCm
SepalWidthCm
PetalLengthCm
PetalWidthCm
Species
```

כאן רואים בדיוק מה יש בדאטה. Id הוא מזהה. ארבע העמודות האמצעיות הן מאפייני הפרח. Species היא התוצאה.

אחר כך מוצגות חמש השורות הראשונות. זה נותן הצצה ממשית לדאטה, ולא רק למבנה שלו.

**התפלגות המחלקות**

```bash
Iris-setosa        50
Iris-versicolor    50
Iris-virginica     50
```

זה דאטה מאוזן. יש בדיוק 50 דוגמאות מכל סוג. זה מצב נוח ללמידה, כי המודל לא מוטה מראש למחלקה אחת גדולה במיוחד.

**המאפיינים והמחלקות**

```bash
Features: ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm']
```

כאן הקוד כבר אומר במפורש מה נכנס למודל.

```python
Target classes:
['Iris-setosa', 'Iris-versicolor', 'Iris-virginica']
```

אלה המחלקות שהמודל צריך להבחין ביניהן.

**ביצועי המודל**

אחרי האימון מתקבל:

```bash
Training Random Forest Classifier...
```

ואז:

```bash
Training Accuracy: 0.9833 (98.33%)
Test Accuracy: 0.9667 (96.67%)
Out-of-Bag Score: 0.9500 (95.00%)
```

יש כאן שלושה מספרים חשובים.

ה-**Training Accuracy** אומר עד כמה המודל מצליח על הנתונים שעליהם התאמן. כאן הוא מגיע ל-98.33%.

ה-**Test Accuracy** אומר עד כמה הוא מצליח על נתונים שלא שימשו לאימון. כאן הוא מגיע ל-96.67%.

הפער ביניהם קטן, וזה סימן טוב. אם ה-Training היה גבוה מאוד וה-Test נמוך בהרבה, זה היה רמז לכך שהמודל שינן את הדאטה במקום ללמוד דפוס כללי.

ה-**Out-of-Bag Score** הוא מדד מעניין במיוחד ב-Random Forest.

מכיוון שכל עץ מתאמן על דגימה חלקית מהנתונים, יש דוגמאות שלא נכנסו לאימון של אותו עץ. אפשר להשתמש בדוגמאות האלה כדי להעריך את הביצועים, בלי ליצור סט בדיקה נוסף. במקרה שלך, ה-OOB הוא 95%, קרוב מאוד ל-Test Accuracy, וזה מחזק את התחושה שהמודל מתנהג בצורה יציבה.

```bash
Classification Report
Iris-setosa       precision 1.00  recall 1.00  f1-score 1.00
Iris-versicolor   precision 1.00  recall 0.90  f1-score 0.95
Iris-virginica    precision 0.91  recall 1.00  f1-score 0.95
```

כאן רואים שהמודל מזהה את Iris-setosa בצורה מושלמת. זה נפוץ בדאטה הזה, כי setosa בדרך כלל נפרדת היטב מהמחלקות האחרות.

הטעות היחידה כמעט נמצאת בין Iris-versicolor לבין Iris-virginica. זה הגיוני, כי שתי המחלקות האלה דומות יותר זו לזו.

```bash
Confusion Matrix
[[10  0  0]
 [ 0  9  1]
 [ 0  0 10]]
```

זו אותה תמונה בצורה מספרית.

השורה הראשונה אומרת שכל 10 הדוגמאות של Iris-setosa זוהו נכון.

השורה השנייה אומרת שמתוך 10 דוגמאות של Iris-versicolor, תשע זוהו נכון ואחת זוהתה בטעות כ-Iris-virginica.

השורה השלישית אומרת שכל 10 הדוגמאות של Iris-virginica זוהו נכון.

כלומר, מתוך 30 דוגמאות בדיקה, הייתה טעות אחת בלבד.

**מידת החשיבות של כל מאפיין במודל**

```bash
Feature Importance:
         Feature  Importance
3   PetalWidthCm    0.443527
2  PetalLengthCm    0.436516
0  SepalLengthCm    0.112375
1   SepalWidthCm    0.007582
```

זה חלק חשוב מאוד.

המודל קיבל ארבעה מאפיינים, אבל הוא לא משתמש בהם באותה מידה. לפי הפלט, שני המאפיינים החשובים ביותר הם:

- PetalWidthCm

- PetalLengthCm

כלומר, רוחב ואורך עלה הכותרת הם אלה שהכי עוזרים להבחין בין סוגי הפרחים.

לעומת זאת, SepalWidthCm כמעט לא משפיע. זה לא אומר שהוא לא נכנס למודל, אלא שהוא לא תרם הרבה להחלטות של היער.

זו נקודה שכדאי להדגיש: יש הבדל בין מה שנותנים למודל לבין מה שהמודל באמת מוצא כשימושי.

**התמונות שנוצרות בהרצה**

בסוף הפלט מופיעות שתי הודעות:

Feature importance plot saved as 'images/random_forest_feature_importance.png'

<img src="/Lesson-2-Machine-Learning/assets/image-37.png" alt="image-37.png" width="637" height="376" />


וגם:

Sample trees visualization saved as 'images/random_forest_trees.png'

<img src="/Lesson-2-Machine-Learning/assets/image-38.png" alt="image-38.png" width="710" height="207" />


הקוד לא רק מדפיס מדדים למסך, אלא גם שומר תמונות לתיקיית images.

התמונה הראשונה מציגה את חשיבות המאפיינים בגרף עמודות. היא עוזרת לראות בעיניים ש-PetalWidthCm ו-PetalLengthCm הם הדומיננטיים.

התמונה השנייה מציגה כמה עצים מתוך היער. חשוב להבין: זה לא כל היער, אלא דוגמאות מתוך 100 העצים. כל עץ עשוי להיראות קצת אחרת, כי כל אחד מהם אומן על דגימה מעט שונה ומתחשב בתתי-מאפיינים שונים.

וזו בדיוק הנקודה של Random Forest: לא עץ אחד שמחליט לבד, אלא הרבה עצים שמצביעים יחד.

**מה כדאי לשנות בקוד כדי ללמוד**

אפשר לבצע שינויים קטנים בקוד ולראות איך הם משפיעים על המודל.

אפשר להתחיל מ-n_estimators:

```python
n_estimators=100
```

נסה להקטין ל-10. המודל ירוץ מהר יותר, אבל ייתכן שהתוצאות יהיו פחות יציבות.

אפשר גם להגדיל ל-200. זה לא בהכרח ישפר את התוצאה, אבל יראה לך מה קורה כשמוסיפים עוד עצים ליער.

אפשר לשנות גם את עומק העצים:

```python
max_depth=5
```

אם תקטין ל-2, העצים יהיו פשוטים יותר. אם תגדיל ל-10, הם יהיו מורכבים יותר. חשוב להסתכל על הפער בין Training Accuracy לבין Test Accuracy. אם ה-Training עולה מאוד אבל ה-Test לא משתפר, ייתכן שהמודל מתחיל להתאים את עצמו יותר מדי לדאטה.

אפשר גם לשנות את max_features:

```python
max_features="sqrt"
```

זה משפיע על כמות המאפיינים שכל עץ שוקל בכל פיצול. שינוי כזה יכול להשפיע על הגיוון בין העצים.

בכל שינוי כזה, כדאי להריץ שוב ולבדוק שלושה דברים:

- האם ה-Test Accuracy השתנה

- האם ה-OOB Score השתנה

- האם Feature Importance נשאר דומה או השתנה

אם התוצאות נשארות דומות, זה סימן שהמודל יציב. אם הן משתנות מאוד, זה אומר שהמודל רגיש יותר ממה שנראה בהתחלה.

המעבר מ-Decision Tree ל-Random Forest הוא מעבר חשוב. בפרק הקודם ראית מודל אחד שמקבל החלטות בצורה שקופה. כאן אתה רואה איך לוקחים את אותו רעיון בסיסי, ומחזקים אותו בעזרת קבוצה של עצים.

עץ אחד יכול להיות ברור, אבל רגיש. יער של עצים קצת פחות שקוף, אבל בדרך כלל יציב וחזק יותר.

## פרק 7 במעבדה: כשאין תשובות מראש

**📁 7_kmeans_clustering.py**

עד עכשיו עבדת רק עם מצבים שבהם הייתה תשובה ידועה. בכל אחד מהפרקים הקודמים היה לך גם קלט וגם תוצאה. המודל למד לחבר ביניהם.

בפרק הזה הדבר הזה נעלם לגמרי. אין עמודת תוצאה, אין “אמת” להשוות אליה, ואין דרך למדוד הצלחה כמו Accuracy.

במקום זה, המודל מקבל רק נתונים, והמטרה שלו היא לנסות למצוא בהם מבנה פנימי. כלומר, לזהות האם יש קבוצות של נקודות שדומות זו לזו יותר מאחרות. זו נקודת כניסה לעולם של Unsupervised Learning.

**מה יש בדאטה**

הדאטה בפרק הזה מגיע מ-Penguins dataset. כל שורה מייצגת פינגווין, וכל עמודה היא מדידה מספרית:

- bill_length_mm

- bill_depth_mm

- flipper_length_mm

- body_mass_g

בניגוד לפרקים הקודמים, אין כאן עמודת יעד. אנחנו לא יודעים “מה התשובה”, וגם לא מנסים לחזות אותה. השאלה היחידה היא האם ניתן לחלק את הפינגווינים לקבוצות לפי הדמיון ביניהם.

**הקוד**

```python
"""
Minimal K-means example on the Penguins dataset: cluster and plot two features.
"""

import os

import pandas as pd
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

NUMERICAL_FEATURES = [
    "bill_length_mm",
    "bill_depth_mm",
    "flipper_length_mm",
    "body_mass_g",
]
N_CLUSTERS = 3
RANDOM_STATE = 42
OUT_PATH = "images/kmeans_clusters.png"

def ensure_output_dir(file_path):
    """Create the parent directory for file_path if it does not exist."""
    parent = os.path.dirname(file_path)
    if parent:
        os.makedirs(parent, exist_ok=True)

def load_X(csv_path="data/penguins.csv"):
    # Resolve CSV path relative to this script's directory for robustness
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_full_path = os.path.join(script_dir, "..", "data", "penguins.csv")
    df = pd.read_csv(csv_full_path)
    return df[NUMERICAL_FEATURES].dropna().values

def plot_clusters(X, labels, centroids, out_path=OUT_PATH):
    fig, ax = plt.subplots(figsize=(8, 6))
    sc = ax.scatter(
        X[:, 0],
        X[:, 1],
        c=labels,
        cmap="viridis",
        alpha=0.7,
        edgecolors="black",
        linewidths=0.3,
    )
    ax.scatter(
        centroids[:, 0],
        centroids[:, 1],
        c="red",
        marker="X",
        s=200,
        linewidths=2,
        label="Centroids",
    )
    ax.set_xlabel(NUMERICAL_FEATURES[0])
    ax.set_ylabel(NUMERICAL_FEATURES[1])
    ax.set_title(f"K-Means clustering (K={N_CLUSTERS})")
    ax.legend()
    fig.colorbar(sc, ax=ax, label="Cluster")
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    ensure_output_dir(out_path)
    fig.savefig(out_path, dpi=300, bbox_inches="tight")
    print(f"Saved {out_path} ({len(X)} points)")
    plt.show()

def main():
    X = load_X()
    model = KMeans(
        n_clusters=N_CLUSTERS,
        random_state=RANDOM_STATE,
        n_init=10,
        max_iter=300,
    )
    labels = model.fit_predict(X)
    plot_clusters(X, labels, model.cluster_centers_)

if __name__ == "__main__":
    main()
```

**מבנה הקוד**

**הקוד בפרק הזה פשוט יחסית ומורכב משלושה שלבים:**

1. טעינת הנתונים

2. הרצת מודל K-Means

3. הצגת התוצאה בגרף

אין כאן שלב של מדידה, כי אין למה להשוות.

**טעינת הנתונים**

```python
X = load_X()
```

הפונקציה load_X קוראת את קובץ הנתונים ובוחרת רק את העמודות המספריות. בנוסף, היא מסירה שורות עם ערכים חסרים. התוצאה היא מטריצה שבה כל שורה היא פינגווין וכל עמודה היא מאפיין.

חשוב לשים לב: אין כאן משתנה y. זה שונה מכל מה שעשית עד עכשיו.

**יצירת המודל**

```python
model = KMeans(
    n_clusters=3,
    random_state=42,
    n_init=10,
    max_iter=300,
)
```

הפרמטר המרכזי כאן הוא **n_clusters**. אתה קובע מראש לכמה קבוצות לחלק את הנתונים. המודל לא יודע אם זה נכון, הוא פשוט מנסה לבצע את החלוקה.

**n_init=10** אומר שהמודל ינסה כמה נקודות התחלה שונות, כי התוצאה יכולה להשתנות בהתאם לנקודת ההתחלה.

**max_iter=300** מגביל את מספר האיטרציות.

**random_state** נועד כדי לקבל תוצאה יציבה בין הרצות.

**הרצת המודל**

```python
labels = model.fit_predict(X)
```

זה השלב שבו כל העבודה מתבצעת.

המודל מתחיל מבחירת מרכזים אקראיים. לאחר מכן הוא משייך כל נקודה למרכז הקרוב אליה. אחרי זה הוא מחשב מחדש את מיקום המרכזים לפי הנקודות ששויכו אליהם. התהליך הזה חוזר על עצמו עד שהחלוקה מתייצבת.

בסוף מתקבלת תוצאה שבה לכל נקודה יש מספר קבוצה, למשל 0, 1 או 2.



**התוצאה**

<img src="/Lesson-2-Machine-Learning/assets/image-39.png" alt="image-39.png" width="710" height="594" />


הקוד לא מדפיס טקסט אלא יוצר גרף ושומר אותו. זה הפלט היחיד של הפרק.

**איך לקרוא את הגרף**

בגרף כל נקודה היא פינגווין. הצירים מייצגים שני מאפיינים, בדרך כלל **bill_length** ו-**bill_depth**. הצבע של הנקודה מייצג את הקבוצה שאליה היא שויכה.

בנוסף מופיעים סימונים אדומים. אלה המרכזים של הקבוצות. כל קבוצה מוגדרת על ידי מרכז כזה, וכל נקודה משויכת למרכז הקרוב אליה.

**מה המודל עושה בפועל**

המודל לא “מבין” את הדאטה. הוא לא יודע מה זה פינגווין, ולא יודע מה נכון או לא נכון. הוא עובד רק על בסיס מרחקים בין נקודות.

אם נקודות קרובות זו לזו, הן יקבלו את אותו **label**. אם הן רחוקות, הן יופרדו לקבוצות שונות.

**מה חשוב להבין כאן**

אין כאן דרך לבדוק אם התוצאה “נכונה”. אין תשובה להשוות אליה. אפשר רק להסתכל על הגרף ולשאול האם החלוקה נראית הגיונית.

במילים אחרות, אתה לא מודד דיוק, אלא מנסה להבין מבנה.

**איך לשחק עם הקוד**

כדי להבין באמת מה קורה, כדאי לשנות כמה דברים:

שנה את מספר הקבוצות:

```python
n_clusters=3
```

נסה 2 או 4 ותראה איך החלוקה משתנה.

שנה את המאפיינים שמוצגים בגרף. כרגע משתמשים בשני מאפיינים בלבד לציור, אבל המודל עובד עם כולם. שינוי המאפיינים ישנה את איך שהקבוצות נראות.

שנה את הפרמטרים כמו **n_init** או **max_iter** ובדוק אם זה משפיע על התוצאה.

**מה למדת מהפרק**

עד עכשיו עבדת עם מודלים שלומדים מתשובות. כאן אתה רואה מודל שמנסה להבין את הנתונים בלי תשובות.

זה שינוי חשוב מאוד. בעולם האמיתי לא תמיד יש תוויות, אבל עדיין יש דאטה. במקרים כאלה, מודלים כמו K-Means מאפשרים להתחיל להבין מה יש בתוך הנתונים גם בלי לדעת מראש מה מחפשים.



תחתית הטופס
