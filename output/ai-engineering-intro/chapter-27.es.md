# Los LLMs Están Desconectados del Mundo: El Experto en Aislamiento


Aquí explicamos por qué el modelo, a pesar de su PhD, no puede funcionar como un trabajador independiente sin mediación humana o tecnológica.

1. **Sin Sensores en Tiempo Real**

El modelo no "experimenta" el mundo. No sabe si está lloviendo afuera, no sigue el mercado de valores, y no está consciente de que tu servidor se cayó hace cinco minutos.

**El significado:** Todo lo que sabe viene únicamente del texto que le alimentas en el Prompt. Es un "cerebro en un frasco" que se comunica con el mundo a través de un ojo de cerradura estrecho.

2. **Estadísticas en Lugar de Causalidad (Brecha de Causalidad)**

Como el modelo fue entrenado con datos existentes, entiende relaciones estadísticas entre palabras, pero no entiende causalidad en el mundo real.

Puede explicarte cómo arreglar un bug, pero no "entiende" las implicaciones físicas del bug en tus clientes. Para él, todo es una secuencia de tokens.

3. **Desconexión del Contexto Personal (Falta de Contexto Personal)**

El modelo no sabe quién eres, cuál es tu rol en la organización, o qué se decidió en la reunión de ayer, a menos que esté explícitamente escrito dentro de la Ventana de Contexto. Cada interacción comienza desde cero.

<img src="/ai-engineering-intro/assets/image-16.jpg" alt="image-16.jpg" width="710" height="238" />








**El ángulo escéptico:**

No confundas **Fluidez** con **Consciencia**.

• El modelo puede escribir una publicación conmovedora sobre la situación política actual, pero en realidad no "sigue" las noticias. Simplemente predice lo que un doctor escribiría basándose en patrones pasados.

• **El peligro:** Confiar en el modelo para decisiones que requieren "Sentido Común" o comprensión del contexto social/empresarial cambiante.


**Recomendación:** Para cerrar esta desconexión, debemos usar **Grounding**. No dejamos al modelo desconectado. Lo conectamos a la realidad a través de APIs, búsqueda en tiempo real y RAG.

**El mensaje:** El modelo proporciona el "pensamiento", nosotros proporcionamos los "ojos".

