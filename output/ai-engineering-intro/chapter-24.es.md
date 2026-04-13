# Limitaciones de LLM: Más Allá de la Fluidez Lingüística

Esta declaración establece los límites de ingeniería del modelo. Aunque suene como un experto (PhD), tiene limitaciones incorporadas que provienen de cómo fue construido y entrenado.

1. **Ventana de Contexto - "Memoria de Trabajo" Limitada**

Cada modelo tiene un límite físico de la cantidad de texto que puede "mantener en mente" a la vez.

• **El problema:** A medida que la conversación o el documento se alarga, el modelo comienza a perder conexión con el principio de las cosas. Hoy conocemos bien el fenómeno **Lost in the Middle** - el modelo da peso excesivo al principio y al final de la entrada, y descuida la información en el medio.

• **La conclusión:** El modelo no te "recuerda". Solo procesa lo que está actualmente dentro de su ventana de memoria temporal.

2. **Corte de Conocimiento - El Modelo como una "Instantánea"**

El conocimiento del modelo está congelado en el tiempo. Representa internet tal como era en el momento en que terminó su entrenamiento.

• **El problema:** Sin conexión externa (como RAG), el modelo no está consciente de eventos que pasaron ayer, nuevas actualizaciones de versiones de código, o cambios en el mercado. Vive dentro de una "burbuja del pasado" estática.

• **La conclusión:** Los diales (parámetros) que vimos en las diapositivas anteriores son fijos. No cambian durante la conversación.

3. **Lógica vs. Estadística (Razonamiento vs. Probabilidad)**

Esta es la limitación más importante de entender profesionalmente. El modelo es un motor estadístico, no un motor de inferencia lógica.

• **El problema:** Puede resolver problemas matemáticos o escribir código no porque "entienda" las reglas de la lógica, sino porque reconoce patrones de soluciones similares de los datos de entrenamiento. Al encontrar un problema completamente nuevo que requiere lógica original, el modelo puede colapsar.

• **La conclusión:** Estamos hablando de una simulación de pensamiento, no pensamiento consciente.

Vale la pena conocer el término **Diales** = elementos matemáticos en el modelo que pueden ajustarse y que dictan cómo calcula probabilidades, determinados principalmente durante el entrenamiento. Cada "dial" representa un **Peso** o **Parámetro** en el modelo. El modelo incluye **miles de millones a trillones de tales diales**. Durante el entrenamiento, el sistema los "gira" para aprender relaciones entre palabras e ideas.

¡Nota! La mayoría de los diales se establecen **durante la fase de entrenamiento**, no durante el uso.

**El ángulo escéptico:**

Debemos dejar de tratar al LLM como un "cerebro" y empezar a tratarlo como un **procesador de texto estadístico**. Estas limitaciones no son bugs que se pueden arreglar con un botón. Son parte de la definición de la tecnología.

**El riesgo principal:** El modelo intentará responder incluso cuando esté fuera de su ventana de contexto o cuando le falte conocimiento actual. No dirá "se me acabó la memoria", simplemente continuará prediciendo tokens basándose en información parcial.

**Recomendación:** No confíes en el modelo como Única Fuente de Verdad para datos cambiantes o lógica especialmente compleja. Úsalo para creación, síntesis y procesamiento, pero mantén la gestión lógica de la tarea contigo.
