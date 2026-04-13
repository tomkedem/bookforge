# Arquitectura RAG

Esta es la ilustración de "ejecución". Toma los conceptos abstractos y presenta el plan de trabajo práctico del sistema. El rol central aquí es del Framework, actuando como el director de toda la orquesta.


**Los componentes principales:**

• **Cliente:** El icono del hombre con la estrella. El punto final donde se hace la pregunta cruda ("Question").

• **Framework:** El icono de CPU de IA en el centro. Este es el cerebro operacional. Gestiona el tráfico entre todos los componentes: recibe la pregunta, gestiona la búsqueda, construye el prompt final y lo envía al LLM.

• **LLM:** El icono del cerebro en el lado derecho. La estación final que recibe el prompt enriquecido y genera la respuesta. Nota la flecha regresando al Framework con el título "Post Processing."

• **Base de Datos Vectorial:** Un repositorio de vectores (embeddings) que permite búsqueda por similitud matemática entre representaciones de texto. Usado para realizar Búsqueda Semántica a través de cálculo de proximidad vectorial.

• **Contenido (Original + Nuevo):** El icono de lista de componentes abajo a la derecha. Las fuentes crudas que pasan por un proceso de "vectorización" (por el Framework) antes de que puedan ser buscadas.

**Análisis profesional y escepticismo constructivo:** Esta arquitectura muestra claramente la importancia del Framework como factor conector. Pero como programadores, debemos mirar los puntos de falla potenciales en este diagrama:

<img src="/ai-engineering-intro/assets/image-23.png" alt="image-23.png" width="533" height="393" />

1. **Cuellos de Botella (Latencia):** Cada flecha en el diagrama representa una Llamada de Red. Búsqueda en Vector DB, envío del prompt al LLM, y procesamiento de datos en el Framework. Todo esto se acumula en tiempo de respuesta que puede ser demasiado lento para el usuario.

2. **La Búsqueda Semántica no es magia:** La búsqueda semántica puede devolver resultados que se ven similares lingüísticamente pero no son relevantes para la tarea.

3. **Post Processing:** El diagrama muestra un paso de Post Processing. Como programadores, debemos saber qué lógica se esconde ahí. Si es demasiado agresiva, podríamos perder la precisión que el LLM intentó producir.

**Importante enfatizar:**

Si las diapositivas anteriores fueron el "qué", esta es el "cómo". Nota el Framework en el centro. No solo pasa mensajes, es el Orquestador. Es el que realiza Búsqueda Semántica, recibe los datos, construye el prompt final y lo envía al LLM. Como programadores, la mayoría de nuestro trabajo se enfoca en estas líneas de conexión. No construimos el LLM, construimos el sistema que lo rodea y lo alimenta.


