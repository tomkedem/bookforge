# GPT Training

במהלך שלב האימון, GPT מקבל טקסטים שנכנסים לו כמילים או ביטויים, ואז יוצר דוגמאות אימון חדשות בהן הוא לומד לחזות את המילה או הטוקן הבא בהקשר.

לדוגמה, עבור הטקסט "Second Law of Robotics: A robot must obey the orders given it by human beings", נוצרות דוגמאות אימון בהן המודל לומד לחזות את המילה או המונח הבא אחרי כל רצף מילים.

- **דוגמה 1:** הקלט (Input): "Second law of robotics" → פלט נכון (Correct output): "a"

- **דוגמה 2:** הקלט: "Second law of robotics : " ← פלט נכון: "robot"

- **דוגמה 3:** הקלט: "Second law of robotics : a" ← פלט נכון: "robot"

המודל לומד לחזות את המילים באופן שהן משולבות בטקסט, בהתבסס על ההקשרים שבהם הן מופיעות.

<img src="/Lesson-3-Natural-Language-Processing/assets/image-09.png" alt="image-09.png" width="709" height="445" />

