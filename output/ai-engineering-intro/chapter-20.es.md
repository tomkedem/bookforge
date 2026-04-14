# LLM: La "Caja Negra" de los Parámetros

Hablaremos a un nivel muy Alto - entraremos en detalles en las siguientes lecciones.

Hablemos a un nivel alto, y profundizaremos en los detalles después.

Estamos hablando de un modelo compuesto por muchas "neuronas", donde cada neurona es esencialmente una función matemática simple que recibe valores, realiza un cálculo y pasa el resultado hacia adelante.


<img src="/ai-engineering-intro/assets/image-10.png" alt="image-10.png" width="558" height="272" />


Las neuronas están conectadas entre sí en una red grande, por lo que el resultado de una afecta a las otras, y juntas crean un cálculo complejo que lleva a predecir el siguiente token.


**Puntos Clave:**

1. **Escala de Parámetros:** Los modelos de élite de hoy usan miles de millones y trillones de nodos para predecir el siguiente token.

2. **Cómputo en Tiempo de Inferencia:** Los modelos más modernos ya no solo "sueltan" una respuesta. Usan computación interna (Razonamiento) antes de dar la respuesta, un proceso que puede compararse con "girar los diales" dentro de la caja para llegar a la lógica correcta.

3. **Eficiencia de arquitectura:** La tendencia hoy no es solo aumentar el número de diales, sino hacerlos dispersos - es decir, el modelo activa solo los diales relevantes para la tarea (por ejemplo, solo código o solo comprensión de lenguaje) para ahorrar energía y tiempo.

