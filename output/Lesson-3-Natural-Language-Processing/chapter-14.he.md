# תרגול בית: הרחבת הפרויקט המלווה

לאחר ההיכרות עם קבצי הפרויקט המלווה, השלב הבא הוא להרחיב את הדוגמאות הקיימות ולבנות עליהן תרגול עצמאי. מטרת התרגול אינה רק להריץ את הקוד כפי שהוא, אלא לקחת את הרעיונות שנלמדו בשיעור וליישם אותם על בעיות מעט פתוחות יותר.

התרגול מחולק לשלושה חלקים. שני החלקים הראשונים הם תרגילי חובה, והחלק השלישי הוא תרגיל בונוס למי שרוצה להעמיק עוד יותר. בכל תרגיל נציג את מטרת המשימה, את שלבי הפתרון, ואת הקוד המרכזי שמממש את הרעיון.



## תרגיל 1: Word2Vec ו-Sentence Embeddings

בקובץ הראשון, 1_word2vec.ipynb, ראינו כיצד Word2Vec מאפשר להשוות בין מילים בודדות באמצעות ייצוגים וקטוריים. בתרגול זה נרחיב את הרעיון מהשוואה בין מילים בודדות להשוואה בין משפטים שלמים.

כדי לשמור על הפרויקט מסודר, מומלץ לא לערוך את קובץ השיעור המקורי. הקובץ 1_word2vec.ipynb מייצג את חומר השיעור כפי שנלמד, ואילו פתרון תרגול הבית הוא הרחבה עצמאית. לכן נוסיף לפרויקט קובץ חדש בשם:

5_word2vec_sentence_embeddings.py

כך מבנה התיקייה יהיה ברור יותר:

```bash
lesson-03-natural-language-processing/
├── 1_word2vec.ipynb
├── 2_bert.ipynb
├── 3_stemming_lemmatization_nltk.py
├── 4_spacy_ner.py
└── 5_word2vec_sentence_embeddings.py
```

הקובץ החדש ישמש כפתרון מודרך לתרגיל הבית הראשון. מטרתו היא להראות כיצד אפשר לקחת את מה שלמדנו על וקטורים של מילים, ולהשתמש בו כדי לבנות ייצוג פשוט למשפט שלם.

**מטרת התרגיל**

המשימה היא לכתוב פונקציה שמקבלת משפט מלא, למשל:

The bank processed my investment

הפונקציה צריכה לבצע כמה שלבים:

ראשית, לפרק את המשפט למילים.

לאחר מכן, להסיר stop words, כלומר מילים נפוצות מאוד שבדרך כלל אינן מוסיפות הרבה משמעות סמנטית בפני עצמן, כמו the, my, a או of.

לאחר מכן, לקחת מתוך מודל Word2Vec את הווקטור של כל מילה שנותרה במשפט.

לבסוף, לחשב ממוצע של כל הווקטורים האלה. הממוצע הזה ישמש כייצוג וקטורי פשוט של המשפט כולו.

הרעיון כאן פשוט: אם כל מילה מיוצגת כווקטור, אפשר לנסות לייצג משפט שלם באמצעות ממוצע הווקטורים של המילים המרכזיות שבו. זהו פתרון בסיסי, אך הוא מאפשר להבין את המעבר ממילה בודדת לייצוג של יחידת טקסט גדולה יותר.

**שלב ראשון: עדכון קובץ requirements.txt**

מכיוון שהקובץ החדש משתמש ב-gensim לטעינת מודל Word2Vec, וב-numpy לחישוב ממוצע וקטורים ודמיון קוסינוס, יש לוודא שקובץ requirements.txt כולל גם את הספריות האלה.

אם הקובץ כולל כרגע רק:

```bash
spacy>=3.7.0
nltk
```

כדאי לעדכן אותו כך:

```bash
spacy>=3.7.0
nltk
gensim
numpy
```

לאחר העדכון, מתקינים את התלויות מתוך סביבת העבודה הווירטואלית:

```bash
pip install -r requirements.txt
```

**שלב שני: יצירת קובץ פתרון חדש**

בתוך התיקייה:

lesson-03-natural-language-processing

ניצור קובץ חדש בשם:

5_word2vec_sentence_embeddings.py

הבחירה בשם הזה אינה מקרית. המספר 5 ממשיך את סדר קבצי השיעור, והשם word2vec_sentence_embeddings מסביר בדיוק מה הקובץ מדגים: בניית ייצוג משפטים פשוט בעזרת Word2Vec.

**שלב שלישי: טעינת המודל**

בתחילת הקובץ נטען את מודל Word2Vec המוכן:

```python
import gensim.downloader as api

model = api.load("word2vec-google-news-300")
```

המודל word2vec-google-news-300 הוא מודל מוכן מראש שבו כל מילה מוכרת מיוצגת באמצעות וקטור בגודל 300 מספרים. במקום לאמן מודל מאפס, אנחנו משתמשים במודל שכבר למד קשרים סמנטיים מתוך כמות גדולה של טקסטים.

חשוב לדעת שהמודל הזה גדול יחסית, ולכן ההורדה והטעינה הראשונית שלו עשויות לקחת זמן. זה תקין, במיוחד בהרצה הראשונה.

**שלב רביעי: הגדרת Stop Words**

כעת נגדיר רשימה בסיסית של מילים נפוצות שאותן נרצה להסיר מהמשפט:

```python
stop_words = {
    "the", "a", "an", "my", "of", "to", "in", "on", "and", "or", "is", "are", "was", "were"
}
```

Stop words הן מילים שמופיעות הרבה מאוד בשפה, אבל לעיתים קרובות אינן מוסיפות הרבה למשמעות המרכזית של המשפט. לדוגמה, במשפט:

```bash
The bank processed my investment
```

המילים the ו-my פחות חשובות להבנת הנושא המרכזי של המשפט. לעומתן, המילים bank, processed, ו-investment משמעותיות יותר.

**שלב חמישי: פונקציה לניקוי ופירוק משפט**

נכתוב פונקציה קטנה שמקבלת משפט, הופכת אותו לאותיות קטנות, מפרקת אותו למילים, ומסירה מילים נפוצות:

```python
import re

def tokenize_and_clean(sentence):
    words = re.findall(r"\b[a-zA-Z]+\b", sentence.lower())
    meaningful_words = [word for word in words if word not in stop_words]
    return meaningful_words
```

השורה:

```python
sentence.lower()
```

הופכת את כל המשפט לאותיות קטנות, כדי ש-Bank ו-bank ייחשבו לאותה מילה.

השורה:

```python
re.findall(r"\b[a-zA-Z]+\b", sentence.lower())
```

מחלצת מתוך המשפט רק מילים באנגלית. כך אנחנו מתעלמים מסימני פיסוק כמו נקודה או פסיק.

השורה:

```python
meaningful_words = [word for word in words if word not in stop_words]
```

יוצרת רשימה חדשה שמכילה רק את המילים שאינן מופיעות ברשימת ה-stop_words.

**שלב שישי: הפיכת משפט לווקטור**

כעת נכתוב פונקציה שמקבלת משפט ומחזירה וקטור ממוצע:

```python
import numpy as np

def sentence_embedding(sentence, model):
    words = tokenize_and_clean(sentence)

    vectors = []
    for word in words:
        if word in model:
            vectors.append(model[word])

    if not vectors:
        return None

    return np.mean(vectors, axis=0)
```

הפונקציה מתחילה בניקוי המשפט:

```python
words = tokenize_and_clean(sentence)
```

לאחר מכן היא עוברת על כל מילה ובודקת האם המילה קיימת באוצר המילים של המודל:

```python
if word in model:
    vectors.append(model[word])
```

הבדיקה הזו חשובה מאוד. מודל Word2Vec מכיר רק מילים שהופיעו באימון שלו. אם ננסה לקבל וקטור עבור מילה שאינה קיימת במודל, נקבל שגיאה.

בסוף, אם נמצאו וקטורים, הפונקציה מחשבת את הממוצע שלהם:

```python
return np.mean(vectors, axis=0)
```

זהו הרגע שבו משפט שלם הופך לווקטור אחד. במקום לקבל וקטור לכל מילה בנפרד, אנחנו מקבלים ייצוג מספרי אחד שמנסה לייצג את המשמעות הכללית של המשפט.

**שלב שביעי: חישוב דמיון בין שני משפטים**

כעת נכתוב פונקציה שמחשבת דמיון בין שני וקטורים:

```python
def cosine_similarity(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0

    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
```

כאן אנחנו משתמשים במדד שנקרא Cosine Similarity. המדד הזה בודק עד כמה שני וקטורים מצביעים לכיוון דומה במרחב.

אם הציון קרוב ל-1, המשפטים דומים יותר מבחינה סמנטית.

אם הציון קרוב ל-0, המשפטים פחות דומים.

**שלב שמיני: בדיקה על שני המשפטים שקיבלנו**

כעת נבדוק את שני המשפטים מתוך התרגיל:

```bash
sentence_a = "The financial institution handled my capital contribution."
sentence_b = "A primary lender managed the equity funding."

embedding_a = sentence_embedding(sentence_a, model)
embedding_b = sentence_embedding(sentence_b, model)

score = cosine_similarity(embedding_a, embedding_b)

print("Sentence A:", sentence_a)
print("Sentence B:", sentence_b)
print("Similarity score:", score)
```

המטרה היא לבדוק האם המודל מצליח לזהות ששני המשפטים עוסקים בעולם משמעות דומה, גם אם הם אינם משתמשים בדיוק באותן מילים.

המשפט הראשון כולל ביטויים כמו:

```bash
financial institution
capital contribution
```

והמשפט השני כולל ביטויים כמו:

```bash
primary lender
equity funding
```

המילים אינן זהות, אבל שתיהן קשורות לעולם פיננסי של מוסדות, מימון, השקעה והון.

**שלב שביעי: קוד מלא לתרגיל הראשון**

```python
import re
import numpy as np
import gensim.downloader as api

model = api.load("word2vec-google-news-300")

stop_words = {
    "the", "a", "an", "my", "of", "to", "in", "on", "and", "or", "is", "are", "was", "were"
}

def tokenize_and_clean(sentence):
    words = re.findall(r"\b[a-zA-Z]+\b", sentence.lower())
    meaningful_words = [word for word in words if word not in stop_words]
    return meaningful_words

def sentence_embedding(sentence, model):
    words = tokenize_and_clean(sentence)

    vectors = []
    for word in words:
        if word in model:
            vectors.append(model[word])

    if not vectors:
        return None

    return np.mean(vectors, axis=0)

def cosine_similarity(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0

    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

sentence_a = "The financial institution handled my capital contribution."
sentence_b = "A primary lender managed the equity funding."

embedding_a = sentence_embedding(sentence_a, model)
embedding_b = sentence_embedding(sentence_b, model)

score = cosine_similarity(embedding_a, embedding_b)

print("Sentence A:", sentence_a)
print("Sentence B:", sentence_b)
print("Similarity score:", score)
```

**הרצת הקובץ**

לאחר יצירת הקובץ, נריץ אותו מתוך התיקייה של השיעור:

```bash
python 5_word2vec_sentence_embeddings.py
```

בהרצה הראשונה, ייתכן שהמודל ייטען לאט יותר משום שהוא גדול יחסית. לאחר מכן, אם המודל כבר נמצא במטמון המקומי, ההרצה תהיה מהירה יותר.

**תוצאת הרצת הקובץ**

כאשר מריצים את הקובץ:

```bash
python 5_word2vec_sentence_embeddings.py
```

בהרצה הראשונה המודל יורד למחשב, ולכן מתקבלת גם שורת הורדה של המודל:

```bash
Loading Word2Vec model...
[==================================================] 100.0% 1662.8/1662.8MB downloaded
```

לאחר טעינת המודל מתקבל הפלט הבא:

```bash
Sentence A: The financial institution handled my capital contribution.
Cleaned A: ['financial', 'institution', 'handled', 'capital', 'contribution']

Sentence B: A primary lender managed the equity funding.
Cleaned B: ['primary', 'lender', 'managed', 'equity', 'funding']

Similarity score: 0.5344
```

הפלט הזה מאפשר לראות את שלבי העבודה בפועל.

ראשית, ניתן לראות שהמשפט הראשון עבר ניקוי, והמילים שנשארו הן:

```bash
['financial', 'institution', 'handled', 'capital', 'contribution']
```

כלומר, מילים נפוצות כמו The ו-my הוסרו, ונשארו בעיקר המילים שנושאות את המשמעות המרכזית של המשפט.

גם המשפט השני עבר ניקוי, והמילים שנשארו הן:

```bash
['primary', 'lender', 'managed', 'equity', 'funding']
```

גם כאן הוסרה המילה A, ונשארו המילים המרכזיות מבחינה סמנטית.

ציון הדמיון שהתקבל הוא:

```bash
0.5344
```

זהו ציון דמיון בינוני-גבוה יחסית. הוא מראה שהמודל מזהה קרבה סמנטית מסוימת בין שני המשפטים, אף שהם אינם משתמשים באותן מילים בדיוק. שני המשפטים עוסקים בעולם פיננסי: מוסד פיננסי, מלווה, הון, השקעה ומימון.

עם זאת, הציון אינו קרוב מאוד ל-1, וזה חשוב. הסיבה היא שהשיטה שבה השתמשנו פשוטה יחסית: היא מחשבת ממוצע של וקטורי מילים. היא אינה מבינה את מבנה המשפט, את סדר המילים, או את היחסים המדויקים בין הביטויים.

לכן היא מצליחה לזהות קרבה כללית בין המשפטים, אך לא מייצרת הבנה עמוקה כמו מודלים מודרניים יותר שמיועדים ל-Sentence Embeddings.

המסקנה מההרצה היא כפולה: מצד אחד, גם Word2Vec פשוט יכול לזהות קשר סמנטי בסיסי בין משפטים שונים. מצד שני, כאשר רוצים להשוות משפטים בצורה מדויקת יותר,

עדיף להשתמש במודלים שמיועדים למשפטים שלמים, כמו Sentence Transformers או מודלים מבוססי BERT.

**עדכון README**

כדאי להוסיף ל-README.md של תיקיית השיעור סעיף קצר שמסביר את הקובץ החדש:

```python
## Home Practice 1: Word2Vec Sentence Embeddings

This script extends the first Word2Vec notebook by creating a simple sentence embedding.
It removes stop words, averages the vectors of the remaining words, and compares two sentences using cosine similarity.

Run:

```bash
python 5_word2vec_sentence_embeddings.py
```

```text
העלאה ל-Git

לאחר שהקובץ עובד, אפשר להוסיף אותו לריפוזיטורי:


git status
git add lesson-03-natural-language-processing/5_word2vec_sentence_embeddings.py
git add lesson-03-natural-language-processing/requirements.txt
git add lesson-03-natural-language-processing/README.md
git commit -m "Add word2vec sentence embeddings practice solution"
git push origin main
**מה לומדים מהתרגיל הראשון?**
התרגיל הזה מדגים כיצד אפשר לבנות Sentence Embedding פשוט מתוך וקטורים של מילים. במקום להשוות מילה מול מילה, אנחנו מייצגים משפט שלם באמצעות ממוצע של הווקטורים של המילים המרכזיות שבו.
זהו פתרון פשוט ויעיל, אבל יש לו מגבלות חשובות. ממוצע וקטורים אינו מבין באמת את סדר המילים, את מבנה המשפט, את היחסים בין המילים, או את ההבדל בין משפט חיובי לשלילי. לדוגמה, שני משפטים עם אותן מילים אך בסדר או במשמעות שונים עשויים לקבל ייצוג דומה מדי.
לכן התרגיל הזה חשוב כשלב ביניים. הוא עוזר להבין את הרעיון של ייצוג משפטים, אבל גם מסביר מדוע בהמשך נרצה להשתמש במודלים מתקדמים יותר כמו BERT או Sentence Transformers.
מבחינה הנדסית, זהו שיעור חשוב: גם פתרון פשוט יכול לתת ערך, אבל צריך להבין היטב את גבולותיו.
Word2Vec מאפשר לזהות קרבה סמנטית בסיסית, אך הוא אינו מחליף מודל שמבין הקשר מלא של משפט.

תרגיל 2: BERT ובניית מנוע חיפוש סמנטי ל-FAQ
בקובץ השני, 2_bert.ipynb, ראינו כיצד מודלים מבוססי BERT מאפשרים לייצג משפטים בצורה עשירה יותר ותלויה בהקשר. בתרגול זה נשתמש ברעיון הזה כדי לבנות מנוע חיפוש סמנטי קטן עבור מערכת FAQ.
כדי לשמור על הפרויקט מסודר, גם כאן מומלץ לא לערוך את קובץ השיעור המקורי. הקובץ 2_bert.ipynb מייצג את חומר השיעור, ואילו פתרון תרגול הבית הוא הרחבה עצמאית. לכן נוסיף לפרויקט קובץ חדש בשם:
6_bert_faq_semantic_search.py
כך מבנה התיקייה ימשיך להיות ברור:
lesson-03-natural-language-processing/
├── 1_word2vec.ipynb
├── 2_bert.ipynb
├── 3_stemming_lemmatization_nltk.py
├── 4_spacy_ner.py
├── 5_word2vec_sentence_embeddings.py
└── 6_bert_faq_semantic_search.py
הקובץ החדש ישמש כפתרון מודרך לתרגיל הבית השני. מטרתו היא להראות כיצד אפשר להשתמש ב-Sentence Embeddings כדי לבנות חיפוש סמנטי קטן, כלומר חיפוש שמנסה למצוא תשובות לפי משמעות ולא רק לפי התאמה מילולית של מילים.
**מטרת התרגיל**
המשימה היא לבנות פונקציה שמקבלת שאלה של משתמש, משווה אותה מול מאגר ידע קטן, ומחזירה את שלוש התשובות הרלוונטיות ביותר.
בנוסף, נוסיף מנגנון Thresholding, כלומר סף מינימלי לדמיון. אם המערכת לא מוצאת תשובה מספיק קרובה, היא לא תחזיר תשובה לא רלוונטית רק כדי "לענות משהו", אלא תחזיר הודעה מסודרת שאין לה מידע מתאים.
זו נקודה חשובה מאוד מבחינה הנדסית. במערכות אמיתיות, איכות המערכת לא נמדדת רק ביכולת למצוא תשובות, אלא גם ביכולת להימנע מתשובות מטעות כאשר אין התאמה טובה.
**שלב ראשון: עדכון קובץ requirements.txt**
מכיוון שהקובץ החדש משתמש בספרייה sentence-transformers, יש לוודא שקובץ requirements.txt כולל גם אותה.
אם הקובץ עודכן בתרגיל הקודם כך:
spacy>=3.7.0
nltk
gensim
numpy
כעת נוסיף אליו:
sentence-transformers
כך הקובץ ייראה:
spacy>=3.7.0
nltk
gensim
numpy
sentence-transformers
לאחר העדכון, מתקינים את התלויות מתוך סביבת העבודה הווירטואלית:
pip install -r requirements.txt
**שלב שני: יצירת קובץ פתרון חדש**
בתוך התיקייה:
lesson-03-natural-language-processing
ניצור קובץ חדש בשם:
6_bert_faq_semantic_search.py
המספר 6 ממשיך את סדר קבצי הפרויקט, והשם bert_faq_semantic_search מסביר את מטרת הקובץ: בניית מנוע חיפוש סמנטי קטן עבור FAQ באמצעות מודל מבוסס Transformer.
**שלב שלישי: טעינת המודל**
בתחילת הקובץ נטען את המודל all-MiniLM-L6-v2:
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")
הספרייה sentence-transformers מספקת מודלים שמותאמים במיוחד ליצירת Embeddings של משפטים שלמים.
המודל all-MiniLM-L6-v2 מקבל משפט ומחזיר עבורו וקטור שמייצג את המשמעות הסמנטית שלו. בניגוד ל-Word2Vec, שבו בנינו ייצוג משפט באמצעות ממוצע של וקטורי מילים, כאן המודל עצמו יודע לייצר ייצוג למשפט שלם.
זו נקודה חשובה: בתרגיל הראשון בנינו Sentence Embedding פשוט בעצמנו. בתרגיל השני אנחנו משתמשים במודל שכבר אומן במיוחד למשימה הזאת.
**שלב רביעי: יצירת Knowledge Base**
כעת ניצור מאגר ידע קטן בתחום של ספריית אוניברסיטה:
KNOWLEDGE_BASE = [
 "The library is open from 8 AM to 10 PM on weekdays.",
 "Students can borrow up to five books at a time.",
 "Books can be renewed online through the student portal.",
 "Late returns may result in a small daily fine.",
 "Study rooms can be reserved up to one week in advance.",
 "The library provides access to academic journals and research databases.",
 "Printing and scanning services are available on the first floor.",
 "Laptops can be borrowed from the front desk for up to three hours.",
 "Food is not allowed inside the main reading rooms.",
 "Library staff can help students find books and research materials."
]
כל משפט במאגר הוא תשובה אפשרית שהמערכת יכולה להחזיר למשתמש.
במערכת אמיתית, מאגר כזה יכול להגיע מקבצי עזרה, דפי FAQ, מסמכים פנימיים, בסיס נתונים, או מערכת ניהול ידע. כאן אנחנו שומרים אותו כרשימת משפטים פשוטה כדי להתמקד בעיקרון המרכזי: השוואה סמנטית בין שאילתה לבין תשובות אפשריות.
**שלב חמישי: הפיכת מאגר הידע ל-Embeddings**
כדי שלא נחשב את הייצוגים של מאגר הידע בכל פעם מחדש, נחשב אותם פעם אחת בתחילת ההרצה:
kb_embeddings = model.encode(KNOWLEDGE_BASE, convert_to_tensor=True)
השורה הזו הופכת את כל המשפטים במאגר הידע ל-Embeddings.
הפרמטר:
convert_to_tensor=True
אומר להחזיר את התוצאה כ-Tensor, כלומר כמבנה מספרי שמתאים לחישובים יעילים באמצעות ספריית החישוב שבה משתמש המודל.
בפועל, אם יש לנו עשרה משפטים במאגר, נקבל עשרה וקטורים. כל וקטור מייצג משפט אחד.
**שלב שישי: כתיבת הפונקציה get_top_k_answers**
כעת נכתוב את הפונקציה המרכזית:
def get_top_k_answers(query, kb, kb_embeddings, model, k=3, threshold=0.2):
 query_embedding = model.encode(query, convert_to_tensor=True)

 similarities = util.cos_sim(query_embedding, kb_embeddings)[0]

 top_results = similarities.topk(k)

 best_score = top_results.values[0].item()

 if best_score < threshold:
 return "I'm sorry, I don't have information on that."

 results = []
 for score, index in zip(top_results.values, top_results.indices):
 results.append({
 "answer": kb[index],
 "score": score.item()
 })

 return results
נפרק את הפונקציה.
השורה:
query_embedding = model.encode(query, convert_to_tensor=True)
הופכת את שאלת המשתמש ל-Embedding.
לדוגמה, אם המשתמש שואל:
Can I book a study room?
המודל הופך את המשפט לווקטור שמייצג את המשמעות שלו.
השורה:
similarities = util.cos_sim(query_embedding, kb_embeddings)[0]
מחשבת את הדמיון הסמנטי בין שאלת המשתמש לבין כל המשפטים במאגר הידע.
הפונקציה cos_sim מחשבת Cosine Similarity, כלומר עד כמה שני וקטורים קרובים בכיוון שלהם במרחב הסמנטי.
השורה:
top_results = similarities.topk(k)
מחזירה את k התוצאות עם ציוני הדמיון הגבוהים ביותר. במקרה שלנו, ברירת המחדל היא:
k=3
כלומר, נחזיר את שלוש התשובות הרלוונטיות ביותר.
השורה:
best_score = top_results.values[0].item()
שומרת את ציון הדמיון הגבוה ביותר.
לאחר מכן מופיע מנגנון הסף:
if best_score < threshold:
 return "I'm sorry, I don't have information on that."
אם אפילו התוצאה הטובה ביותר אינה מספיק קרובה לשאלה, המערכת לא מחזירה תשובה מתוך המאגר.
זהו מנגנון פשוט אך חשוב מאוד. בלי סף כזה, המערכת תמיד תחזיר את התשובה "הכי קרובה", גם אם בפועל היא לא באמת קשורה לשאלה. במערכות אמיתיות זו אחת הסיבות לתשובות מטעות.
בסוף, אם יש התאמה טובה מספיק, הפונקציה מחזירה רשימה של תשובות יחד עם ציון הדמיון שלהן:
results.append({
 "answer": kb[index],
 "score": score.item()
})
כך אפשר לא רק להציג את התשובות, אלא גם לראות עד כמה כל אחת מהן קרובה לשאילתת המשתמש.
**שלב שביעי: בדיקה עם שאלה רלוונטית**
נבדוק את המערכת עם שאלה שקשורה למאגר הידע:
query = "How can I reserve a study room?"

answers = get_top_k_answers(
 query=query,
 kb=KNOWLEDGE_BASE,
 kb_embeddings=kb_embeddings,
 model=model,
 k=3,
 threshold=0.2
)

print("Query:", query)
print("Answers:")
for item in answers:
 print(f"{item['score']:.3f} | {item['answer']}")
כאן אנחנו מצפים שהתשובה שקשורה להזמנת חדרי לימוד תהיה בין התוצאות הראשונות:
Study rooms can be reserved up to one week in advance.
שימו לב שהשאלה משתמשת במילה reserve, וגם התשובה משתמשת באותה מילה. אבל מנוע סמנטי טוב אמור לעבוד גם כאשר המילים אינן זהות לגמרי, למשל אם המשתמש היה שואל:
Can I book a study room?
המילה book יכולה להיות קרובה במשמעות ל-reserve בהקשר של חדרים, ולכן המערכת עדיין אמורה לזהות קשר.
**שלב שמיני: בדיקה עם שאלה לא קשורה**
כעת נבדוק שאלה שאינה קשורה לספרייה:
query = "How do I fix my car engine?"

answers = get_top_k_answers(
 query=query,
 kb=KNOWLEDGE_BASE,
 kb_embeddings=kb_embeddings,
 model=model,
 k=3,
 threshold=0.2
)

print("Query:", query)
print("Answers:", answers)
אם ציון הדמיון הטוב ביותר נמוך מ-0.2, הפונקציה תחזיר:
I'm sorry, I don't have information on that.
הבדיקה הזו חשובה מאוד, כי היא בודקת את היכולת של המערכת לא לענות כאשר אין לה בסיס טוב לענות.
במערכת Production, התנהגות כזאת חשובה יותר מכפי שנדמה. משתמש מעדיף לקבל תשובה כנה שאין מידע מתאים, מאשר לקבל תשובה שנשמעת בטוחה אבל אינה קשורה לשאלה.
**הקוד המלא לקובץ 6_bert_faq_semantic_search.py**
זהו הקוד המלא שאפשר לשים בקובץ החדש:
"""
Home Practice 2: BERT FAQ Semantic Search.

This script builds a small FAQ semantic search engine using Sentence Transformers.
It returns the top-k most relevant answers from a small knowledge base and uses
a similarity threshold to avoid returning unrelated answers.

Run:
 python 6_bert_faq_semantic_search.py
"""

from sentence_transformers import SentenceTransformer, util


KNOWLEDGE_BASE = [
 "The library is open from 8 AM to 10 PM on weekdays.",
 "Students can borrow up to five books at a time.",
 "Books can be renewed online through the student portal.",
 "Late returns may result in a small daily fine.",
 "Study rooms can be reserved up to one week in advance.",
 "The library provides access to academic journals and research databases.",
 "Printing and scanning services are available on the first floor.",
 "Laptops can be borrowed from the front desk for up to three hours.",
 "Food is not allowed inside the main reading rooms.",
 "Library staff can help students find books and research materials.",
]


def get_top_k_answers(
 query: str,
 kb: list[str],
 kb_embeddings,
 model: SentenceTransformer,
 k: int = 3,
 threshold: float = 0.2,
):
 """Return the top-k FAQ answers for a query, or a fallback message if no answer is relevant."""
 query_embedding = model.encode(query, convert_to_tensor=True)

 similarities = util.cos_sim(query_embedding, kb_embeddings)[0]
 top_results = similarities.topk(k)

 best_score = top_results.values[0].item()
 if best_score < threshold:
 return "I'm sorry, I don't have information on that."

 results = []
 for score, index in zip(top_results.values, top_results.indices):
 results.append(
 {
 "answer": kb[index],
 "score": score.item(),
 }
 )

 return results


def print_answers(query: str, answers) -> None:
 """Print answers returned by get_top_k_answers in a readable format."""
 print("Query:", query)

 if isinstance(answers, str):
 print("Answers:", answers)
 return

 print("Answers:")
 for item in answers:
 print(f"{item['score']:.3f} | {item['answer']}")


def main() -> None:
 print("Loading Sentence Transformer model...")
 model = SentenceTransformer("all-MiniLM-L6-v2")

 print("Encoding knowledge base...")
 kb_embeddings = model.encode(KNOWLEDGE_BASE, convert_to_tensor=True)

 relevant_query = "How can I reserve a study room?"
 relevant_answers = get_top_k_answers(
 query=relevant_query,
 kb=KNOWLEDGE_BASE,
 kb_embeddings=kb_embeddings,
 model=model,
 k=3,
 threshold=0.2,
 )

 print()
 print_answers(relevant_query, relevant_answers)

 unrelated_query = "How do I fix my car engine?"
 unrelated_answers = get_top_k_answers(
 query=unrelated_query,
 kb=KNOWLEDGE_BASE,
 kb_embeddings=kb_embeddings,
 model=model,
 k=3,
 threshold=0.2,
 )

 print()
 print_answers(unrelated_query, unrelated_answers)


if __name__ == "__main__":
 main()

**תוצאת הרצת הקובץ**
כאשר מריצים את הקובץ:
python 6_bert_faq_semantic_search.py
מתקבל הפלט הבא:
Loading Sentence Transformer model...
Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
Loading weights: 100%|██████████████████████████████████████████████████| 103/103 [00:00<00:00, 8800.61it/s]
Encoding knowledge base...

Query: How can I reserve a study room?
Answers:
0.761 | Study rooms can be reserved up to one week in advance.
0.416 | Students can borrow up to five books at a time.
0.374 | Books can be renewed online through the student portal.

Query: How do I fix my car engine?
Answers: I'm sorry, I don't have information on that.
בתחילת ההרצה המודל all-MiniLM-L6-v2 נטען דרך ספריית sentence-transformers. ההודעה על HF Hub אינה שגיאה. היא רק אומרת שהמודל ירד מ-Hugging Face ללא הזדהות עם HF_TOKEN. לצורך תרגול מקומי זה תקין לחלוטין. במערכות גדולות יותר או בהרצות רבות, שימוש ב-HF_TOKEN יכול לאפשר מגבלות שימוש נוחות יותר והורדה מהירה או יציבה יותר.
לאחר מכן מופיעה השורה:
Encoding knowledge base...
בשלב הזה המערכת ממירה את כל משפטי מאגר הידע ל-Embeddings. כלומר, כל תשובה אפשרית במאגר הופכת לווקטור מספרי שמייצג את המשמעות שלה.
השאלה הראשונה שנבדקה היא:
How can I reserve a study room?
זו שאלה שמתאימה היטב למאגר הידע של ספריית האוניברסיטה. לכן התוצאה הראשונה שקיבלנו היא:
0.761 | Study rooms can be reserved up to one week in advance.
זהו ציון גבוה יחסית, והתשובה שנבחרה אכן רלוונטית מאוד לשאלה. המערכת הצליחה לזהות שהמשתמש שואל על הזמנת חדר לימוד, ולהחזיר את המשפט המתאים ביותר מתוך מאגר הידע.
שתי התוצאות הבאות קיבלו ציונים נמוכים יותר:
0.416 | Students can borrow up to five books at a time.
0.374 | Books can be renewed online through the student portal.
הן קשורות לעולם הספרייה, אבל פחות קשורות לשאלה הספציפית על חדר לימוד. זה מדגים נקודה חשובה: כאשר מחזירים top 3, לא כל התוצאות בהכרח יהיו באותה איכות. במערכת אמיתית ייתכן שנרצה להציג רק תוצאות שעוברות סף נוסף, או להציג למשתמש בעיקר את התוצאה הראשונה כאשר היא חזקה וברורה.
השאלה השנייה שנבדקה היא:
How do I fix my car engine?
זו שאלה שאינה קשורה למאגר הידע של הספרייה. לכן מנגנון ה-Thresholding נכנס לפעולה, והמערכת מחזירה:
I'm sorry, I don't have information on that.
זוהי התנהגות נכונה. במקום להחזיר תשובה חלשה ולא קשורה מתוך מאגר הספרייה, המערכת מזהה שאין התאמה מספיק טובה ומחזירה הודעת fallback.
המסקנה מההרצה היא שמנוע החיפוש הסמנטי מצליח לבצע שני דברים חשובים: כאשר קיימת התאמה טובה, הוא מחזיר את התשובה הרלוונטית ביותר. וכאשר אין התאמה מספקת, הוא נמנע מלהחזיר תשובה מטעה. מבחינה הנדסית, זו אחת היכולות החשובות ביותר במערכות RAG, צ'אטבוטים ומנועי חיפוש סמנטיים.
**עדכון README**
כדאי להוסיף ל-README.md של תיקיית השיעור סעיף קצר שמסביר את הקובץ החדש:
## Home Practice 2: BERT FAQ Semantic Search

This script builds a small FAQ semantic search engine using Sentence Transformers.
It returns the top-k most relevant answers from a small knowledge base and uses
a similarity threshold to avoid returning unrelated answers.

Run:

```bash
python 6_bert_faq_semantic_search.py
```

```python
העלאה ל-Git

לאחר שהקובץ עובד, אפשר להוסיף אותו לריפוזיטורי:
```

```bash


git status
git add lesson-03-natural-language-processing/6_bert_faq_semantic_search.py
git add lesson-03-natural-language-processing/requirements.txt
git add lesson-03-natural-language-processing/README.md
git commit -m "Add BERT FAQ semantic search practice solution"
git push origin main
```

**מה לומדים מהתרגיל השני?**

התרגיל הזה מדגים כיצד אפשר לבנות מנוע חיפוש סמנטי קטן בעזרת Sentence Embeddings.

בניגוד לחיפוש רגיל, שמחפש התאמה מילולית בין מילים, חיפוש סמנטי מנסה למצוא התאמה לפי משמעות. לכן הוא יכול לזהות קשר בין שאלה לתשובה גם כאשר הן לא משתמשות בדיוק באותם ניסוחים.

התרגיל גם מדגיש עיקרון חשוב מאוד במערכות מבוססות AI: לא תמיד צריך לענות. אם אין התאמה טובה במאגר הידע, עדיף להחזיר הודעה שאין מידע מתאים מאשר להחזיר תשובה חלשה או לא קשורה.

מבחינה הנדסית, זהו בסיס קטן לרעיון גדול יותר: מערכות RAG, צ'אטבוטים ארגוניים, חיפוש במסמכים, ומערכות תמיכה חכמות. כולן נשענות במידה רבה על אותה יכולת בסיסית: להפוך טקסטים לייצוגים מספריים, למדוד דמיון סמנטי, להחזיר את התוצאות הקרובות ביותר, ולדעת מתי אין התאמה מספיק טובה.



## תרגיל בונוס: BERT ו-Clustering של פידבק לקוחות

בקובץ השני, 2_bert.ipynb, ראינו כיצד מודלים מבוססי BERT יכולים לייצר ייצוגים וקטוריים למשפטים. בתרגיל הקודם השתמשנו בייצוגים האלה כדי להשוות שאלה של משתמש מול מאגר תשובות. בתרגיל הבונוס נשתמש באותו רעיון לכיוון אחר: קיבוץ אוטומטי של טקסטים דומים.

כדי לשמור על הפרויקט מסודר, נוסיף גם לתרגיל הזה קובץ חדש, ולא נערוך את קבצי השיעור המקוריים. שם הקובץ המומלץ הוא:

7_bert_customer_feedback_clustering.py

כך מבנה התיקייה ימשיך להיות ברור:

```bash
lesson-03-natural-language-processing/
├── 1_word2vec.ipynb
├── 2_bert.ipynb
├── 3_stemming_lemmatization_nltk.py
├── 4_spacy_ner.py
├── 5_word2vec_sentence_embeddings.py
├── 6_bert_faq_semantic_search.py
└── 7_bert_customer_feedback_clustering.py
```

הקובץ החדש ישמש כפתרון מודרך לתרגיל הבונוס. מטרתו היא להראות כיצד אפשר לקחת אוסף של משפטי פידבק מלקוחות, להפוך כל משפט ל-Embedding, ואז להשתמש באלגוריתם K-Means כדי לבדוק האם המשפטים מתחלקים באופן טבעי לקבוצות נושא.

**מטרת התרגיל**

המשימה היא לאסוף רשימה של 12 עד 15 משפטי פידבק מלקוחות, מסוגים שונים:

משפטים שמתארים בעיות חיוב ותשלום.

משפטים שמתארים באגים או תקלות באפליקציה.

משפטים חיוביים שמביעים שביעות רצון.

לאחר מכן, נהפוך כל משפט ל-Embedding באמצעות המודל:

all-MiniLM-L6-v2

ולבסוף נשתמש ב-K-Means כדי לחלק את המשפטים לשלוש קבוצות.

הרעיון המרכזי הוא שהאלגוריתם אינו מקבל מראש את התוויות "billing", "bugs" או "praise". הוא מקבל רק וקטורים, ומנסה לקבץ יחד משפטים שקרובים זה לזה מבחינה מתמטית. לאחר מכן אנחנו מסתכלים על התוצאה ומנסים להבין מה המשמעות של כל קבוצה.

**שלב ראשון: עדכון קובץ requirements.txt**

מכיוון שכבר הוספנו בתרגיל הקודם את sentence-transformers, נצטרך להוסיף כאן גם את scikit-learn, כי דרכה נשתמש ב-K-Means.

קובץ requirements.txt צריך להיראות כך:

```bash
spacy>=3.7.0
nltk
gensim
numpy
sentence-transformers
scikit-learn
```

לאחר העדכון, מתקינים את התלויות:

pip install -r requirements.txt

**שלב שני: יצירת קובץ פתרון חדש**

בתוך התיקייה:

lesson-03-natural-language-processing

ניצור קובץ חדש בשם:

7_bert_customer_feedback_clustering.py

המספר 7 ממשיך את סדר קבצי הפרויקט, והשם bert_customer_feedback_clustering מסביר את מטרת הקובץ: קיבוץ פידבק לקוחות באמצעות ייצוגים סמנטיים ומודל מבוסס Transformer.

**שלב שלישי: יצירת משפטי פידבק לדוגמה**

ניצור רשימת משפטים שמדמה פידבק אמיתי של לקוחות:

```python
FEEDBACK_SENTENCES = [
    "I was charged twice for my monthly subscription.",
    "The invoice amount is higher than expected.",
    "I need help understanding my last bill.",
    "My payment failed even though my card is valid.",
    "I was charged for a service I did not use.",
    "The app crashes every time I open the dashboard.",
    "I cannot log in after the latest update.",
    "The search button does not work on my phone.",
    "The screen freezes when I try to upload a file.",
    "The app shows an error when I reset my password.",
    "The new design is very clean and easy to use.",
    "Customer support answered my question quickly.",
    "The app is much faster after the update.",
    "I really like the new notification settings.",
    "The checkout process is simple and clear.",
]
```

הרשימה בנויה בכוונה משלושה סוגי משפטים.

חלק מהמשפטים עוסקים בחיוב ותשלומים, למשל:

```python
I was charged twice for my monthly subscription.
```

חלק מהמשפטים עוסקים בבאגים, למשל:

```python
The app crashes every time I open the dashboard.
```

וחלק מהמשפטים הם משובים חיוביים, למשל:

```python
The new design is very clean and easy to use.
```

אנחנו, כבני אדם, יודעים לזהות את שלוש הקבוצות האלה. השאלה היא האם המודל והאלגוריתם יצליחו לגלות אותן בצורה אוטומטית מתוך המשמעות של המשפטים.

**שלב רביעי: טעינת המודל והמרת המשפטים ל-Embeddings**

כעת נטען את המודל ונמיר את כל המשפטים לייצוגים וקטוריים:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(FEEDBACK_SENTENCES)
```

השורה:

```python
model = SentenceTransformer("all-MiniLM-L6-v2")
```

טוענת מודל שמותאם ליצירת Sentence Embeddings.

השורה:

```python
embeddings = model.encode(FEEDBACK_SENTENCES)
```

מעבירה את כל משפטי הפידבק דרך המודל ומחזירה וקטור עבור כל משפט.

כלומר, אם יש לנו 15 משפטים, נקבל 15 וקטורים. כל וקטור מייצג את המשמעות הסמנטית של משפט אחד.

**שלב חמישי: הפעלת K-Means**

עכשיו נשתמש באלגוריתם K-Means כדי לחלק את המשפטים לשלוש קבוצות:

```python
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3, random_state=42, n_init="auto")
labels = kmeans.fit_predict(embeddings)
```

הפרמטר:

n_clusters=3

אומר לאלגוריתם לחפש שלוש קבוצות.

בחרנו שלוש קבוצות כי אנחנו יודעים שבנינו את הדאטה סביב שלושה נושאים כלליים: חיוב, באגים ומשוב חיובי.

הפרמטר:

random_state=42

נועד להפוך את ההרצה ליציבה יותר. אלגוריתם K-Means מתחיל מנקודות התחלה אקראיות, ולכן ללא random_state ייתכן שנקבל חלוקה מעט שונה בהרצות שונות.

השורה:

```python
labels = kmeans.fit_predict(embeddings)
```

מבצעת שני דברים יחד: היא מאמנת את האלגוריתם על ה-Embeddings, ואז מחזירה לכל משפט מספר קבוצה.

לדוגמה, ייתכן שהפלט יהיה משהו כזה:

[2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]

כל מספר מייצג את האשכול שאליו שובץ המשפט.

**שלב שישי: הדפסת המשפטים לפי קבוצות**

כדי להבין את התוצאה, נדפיס את המשפטים לפי האשכול שאליו שובצו:

```python
def group_sentences_by_cluster(sentences, labels):
    clusters = {}

    for sentence, label in zip(sentences, labels):
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(sentence)

    return clusters
```

הפונקציה מקבלת את רשימת המשפטים ואת התוויות שהחזיר K-Means, ומחזירה מילון שבו כל מפתח הוא מספר אשכול, וכל ערך הוא רשימת המשפטים ששייכים לאותו אשכול.

לאחר מכן נדפיס את התוצאה:

```python
clusters = group_sentences_by_cluster(FEEDBACK_SENTENCES, labels)

for label, sentences in clusters.items():
    print(f"\nCluster {label}:")
    for sentence in sentences:
        print("-", sentence)
```

המטרה כאן אינה רק לראות מספרים, אלא לקרוא את המשפטים בכל אשכול ולבדוק האם הקיבוץ נראה הגיוני.

אם אשכול אחד מכיל בעיקר משפטים על חיובים, אשכול שני בעיקר משפטים על תקלות, ואשכול שלישי בעיקר משפטים חיוביים, אז האלגוריתם הצליח לזהות מבנה סמנטי בסיסי בתוך הטקסטים.

**הקוד המלא לקובץ 7_bert_customer_feedback_clustering.py**

זהו הקוד המלא שאפשר לשים בקובץ החדש:

```python
"""
Home Practice Bonus: BERT Customer Feedback Clustering.

This script converts customer feedback sentences into sentence embeddings
and uses K-Means clustering to group similar feedback items together.

Run:
    python 7_bert_customer_feedback_clustering.py
"""

from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans


FEEDBACK_SENTENCES = [
    "I was charged twice for my monthly subscription.",
    "The invoice amount is higher than expected.",
    "I need help understanding my last bill.",
    "My payment failed even though my card is valid.",
    "I was charged for a service I did not use.",
    "The app crashes every time I open the dashboard.",
    "I cannot log in after the latest update.",
    "The search button does not work on my phone.",
    "The screen freezes when I try to upload a file.",
    "The app shows an error when I reset my password.",
    "The new design is very clean and easy to use.",
    "Customer support answered my question quickly.",
    "The app is much faster after the update.",
    "I really like the new notification settings.",
    "The checkout process is simple and clear.",
]


def group_sentences_by_cluster(sentences: list[str], labels) -> dict[int, list[str]]:
    """Group sentences by their assigned cluster label."""
    clusters: dict[int, list[str]] = {}

    for sentence, label in zip(sentences, labels):
        label = int(label)

        if label not in clusters:
            clusters[label] = []

        clusters[label].append(sentence)

    return clusters


def main() -> None:
    print("Loading Sentence Transformer model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("Encoding customer feedback...")
    embeddings = model.encode(FEEDBACK_SENTENCES)

    print("Running K-Means clustering...")
    kmeans = KMeans(n_clusters=3, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(embeddings)

    clusters = group_sentences_by_cluster(FEEDBACK_SENTENCES, labels)

    for label, sentences in sorted(clusters.items()):
        print(f"\nCluster {label}:")
        for sentence in sentences:
            print("-", sentence)


if __name__ == "__main__":
    main()
```

**הרצת הקובץ**

לאחר יצירת הקובץ, נריץ אותו מתוך התיקייה של השיעור:

python 7_bert_customer_feedback_clustering.py

בהרצה הראשונה, ייתכן שהמודל כבר יהיה קיים במחשב מהתרגיל הקודם. אם כן, הוא לא יירד מחדש אלא ייטען מהמטמון המקומי.

**תוצאת הרצת הקובץ**

תוצאת ההרצה עשויה להשתנות מעט בין מחשבים וסביבות, אבל היא צפויה להיראות בערך כך:

Loading Sentence Transformer model...

Encoding customer feedback...

Running K-Means clustering...

```bash
Cluster 0:
- The app crashes every time I open the dashboard.
- I cannot log in after the latest update.
- The search button does not work on my phone.
- The screen freezes when I try to upload a file.
- The app shows an error when I reset my password.
- The app is much faster after the update.
- I really like the new notification settings.

Cluster 1:
- The new design is very clean and easy to use.
- Customer support answered my question quickly.
- The checkout process is simple and clear.

Cluster 2:
- I was charged twice for my monthly subscription.
- The invoice amount is higher than expected.
- I need help understanding my last bill.
- My payment failed even though my card is valid.
- I was charged for a service I did not use.
```

הפלט הזה מציג את המשפטים כשהם מחולקים לשלושה אשכולות.

אם ההרצה מחלקת את המשפטים בצורה דומה, אפשר לראות ש-K-Means הצליח להפריד בין שלושה נושאים מרכזיים:

אשכול אחד של תקלות באפליקציה.

אשכול אחד של משובים חיוביים.

אשכול אחד של בעיות חיוב ותשלום.

חשוב להבין שהמספרים של האשכולות, למשל Cluster 0, Cluster 1, ו-Cluster 2, אינם נושאים אמיתיים בפני עצמם. האלגוריתם לא יודע לקרוא לאשכול "בעיות חיוב" או "באגים". הוא רק מחלק את המשפטים לקבוצות לפי קרבה מתמטית. אנחנו אלה שמסתכלים על המשפטים בכל קבוצה ונותנים לה פרשנות.

**איך מנתחים את התוצאה?**

אם באשכול מסוים מופיעים משפטים כמו:

```bash
I was charged twice for my monthly subscription.
The invoice amount is higher than expected.
I need help understanding my last bill.
```

אפשר להבין שהאשכול הזה עוסק בבעיות חיוב.

אם באשכול אחר מופיעים משפטים כמו:

```bash
The app crashes every time I open the dashboard.
The screen freezes when I try to upload a file.
The app shows an error when I reset my password.
```

אפשר להבין שמדובר באשכול של באגים ותקלות טכניות.

ואם באשכול נוסף מופיעים משפטים כמו:

```bash
The new design is very clean and easy to use.
The app is much faster after the update.
Customer support answered my question quickly.
```

אפשר להבין שזה אשכול של פידבק חיובי.

הנקודה החשובה היא שהקיבוץ לא נעשה לפי מילת מפתח אחת בלבד. המודל יוצר ייצוג סמנטי למשפט כולו, ו-K-Means מנסה למצוא קבוצות של משפטים שהייצוגים שלהם קרובים זה לזה.

**עדכון README**

כדאי להוסיף ל-README.md של תיקיית השיעור סעיף קצר שמסביר את הקובץ החדש:

```bash
## Home Practice Bonus: BERT Customer Feedback Clustering

This script converts customer feedback sentences into sentence embeddings
and uses K-Means clustering to group similar feedback items together.

Run:

```bash
python 7_bert_customer_feedback_clustering.py
```

העלאה ל-Git

לאחר שהקובץ עובד, אפשר להוסיף אותו לריפוזיטורי:

git status
git add lesson-03-natural-language-processing/7_bert_customer_feedback_clustering.py
git add lesson-03-natural-language-processing/requirements.txt
git add lesson-03-natural-language-processing/README.md
git commit -m "Add home practice bonus BERT feedback clustering solution"
git push origin main
```

**מה לומדים מתרגיל הבונוס?**

התרגיל מראה ש-Embeddings אינם שימושיים רק לחיפוש סמנטי או להשוואה בין שאלה לתשובה. אפשר להשתמש בהם גם כדי לנתח אוסף של טקסטים, לזהות קבוצות טבעיות, ולגלות דפוסים בתוך מידע לא מובנה.

מבחינה הנדסית, זהו רעיון חזק מאוד. בארגון אמיתי יכולים להתקבל מאות או אלפי פידבקים, פניות שירות, הודעות צ'אט או תגובות משתמשים. במקום לקרוא הכול ידנית, אפשר להמיר את הטקסטים ל-Embeddings, להפעיל Clustering, ולקבל תמונת מצב ראשונית של הנושאים המרכזיים שעולים מהשטח.

עם זאת, חשוב לזכור ש-Clustering אינו נותן אמת מוחלטת. הוא כלי חקירה. לפעמים החלוקה תהיה טובה וברורה, ולפעמים משפטים מסוימים ישובצו בקבוצה לא מושלמת. לכן במערכות אמיתיות משתמשים בו כשלב עזר לניתוח, ולא כמנגנון יחיד לקבלת החלטות.

ביחד עם שני תרגילי הבית הקודמים, תרגיל הבונוס סוגר את המעגל: התחלנו מייצוג מילים, עברנו לייצוג משפטים, בנינו חיפוש סמנטי קטן, ולבסוף השתמשנו בייצוגים כדי לגלות קבוצות בתוך טקסטים לא מתויגים. זו בדיוק הדרך שבה רעיונות תאורטיים ב-NLP מתחילים להפוך לכלים הנדסיים שימושיים.
