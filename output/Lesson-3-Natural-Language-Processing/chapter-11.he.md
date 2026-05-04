# GPT Training - Unsupervised Pre-training

במהלך שלב האימון הבלתי מפוקח (Unsupervised Pre-training), המודל מקבל **קלט** (Features) כמו "a robot must" ומנבא את המילה הבאה. במקרה הזה, המודל מנבא את המילה "exterminate", בעוד שהמילה הנכונה הייתה "obey". אחרי כל ניבוי שגוי, המודל מקבל עדכון לפי **הטעות** שנעשתה ומחשב את השגיאה על פי הפלט הנכון.

שלב זה מתבצע מיליארדי פעמים על מנת להבטיח שהמודל יוכל ללמוד את הדפוסים השונים בשפה, ויספק תוצאות נכונות יותר בעת ההשקה.

<img src="/Lesson-3-Natural-Language-Processing/assets/image-10.png" alt="image-10.png" width="705" height="518" />



