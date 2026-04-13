# Definiendo la Disciplina: Ingeniería de Contexto


Esta ilustración cambia la terminología y aclara que lo que pensábamos que era toda la profesión es en realidad solo una pequeña parte de una imagen mucho más amplia.

**Los componentes principales:**

• **Ingeniería de Prompts (El círculo interno):** Enfoque en el texto en sí. La redacción, el tono, técnicas como Chain of Thought o Few-shot. Este es el "cómo" nos dirigimos al modelo.

<img src="/ai-engineering-intro/assets/image-20.jpg" alt="image-20.jpg" width="401" height="232" />

• **Ingeniería de Contexto (La envoltura más amplia):** La disciplina que rodea al prompt. Incluye todo lo que sucede **antes** de que se envíe el texto: recuperación de información, clasificación de relevancia, gestión de memoria del usuario y selección dinámica de las herramientas correctas para la situación.

• **Los iconos alrededor:** Bases de datos vectoriales, filtros y conexiones API. Estos son los "engranajes" de la ingeniería de contexto que la convierten en una tarea de software y no solo en una tarea de escritura.

**Análisis profesional y escepticismo constructivo:**

El error común en el mercado hoy es la expectativa de que un "prompt mágico" resolverá problemas de datos faltantes o desactualizados. En sistemas de producción, la ingeniería de prompts es frágil. Un pequeño cambio en la versión del modelo puede destruir un prompt que funcionaba muy bien. La ingeniería de contexto, por otro lado, es **más robusta** porque se basa en arquitectura de datos y no solo en "magia" verbal.

**Fortalezas en la ilustración:**

• **Cambio de paradigma:** Eleva el estatus del desarrollador de "escritor de solicitudes" a "ingeniero de sistemas."

• **Jerarquía clara:** Muestra que incluso el mejor prompt del mundo no vale mucho si opera dentro de un contexto vacío o incorrecto.

**Importante enfatizar:** La ingeniería de prompts es arte, pero la ingeniería de contexto es ciencia. Si quieres construir un producto que funcione a Escala y no solo en el Playground, debes dejar de perder todo tu tiempo cambiando palabras dentro del prompt y empezar a invertir en mejorar la información que lo rodea. La pregunta no es "¿cómo pedir?", sino "¿qué darle al modelo para que tenga éxito?".
