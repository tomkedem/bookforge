# Los LLMs Están Limitados a los Datos con los que Fueron Entrenados: El Efecto "Memento"


Esta ilustración aclara que nuestro "doctor" es en realidad un personaje trágico, similar a Leonard Shelby de la película **Memento**: tiene identidad y habilidades, pero está atascado en un punto específico del tiempo.

1. **Congelación Cognitiva**

El conocimiento del LLM está bloqueado en el momento en que terminó la fase de entrenamiento (Training Cutoff).

**El significado:** El modelo no "vive" en nuestro mundo. No sabe nada que haya pasado después de cierta fecha. No lee noticias, no sigue actualizaciones de API, y no está consciente de cambios en los estándares de la industria a menos que fueran parte de su conjunto de datos original.

2. **La Metáfora de "Memento" - Contexto vs. Memoria**

¿Por qué esta película es la analogía perfecta?

• **Memoria a largo plazo (Entrenamiento):** Estos son los parámetros fijos. Este es el "pasado" del modelo, lo que logró comprimir adentro antes de que "su memoria fuera dañada".

• **Memoria a corto plazo (Ventana de Contexto):** Estas son las notas y tatuajes de Leonard. El modelo puede "recordar" información nueva solo si la empujamos al Prompt (como en RAG). Tan pronto como la conversación termina y la ventana se cierra, todo se borra. El modelo vuelve a ser exactamente el mismo "doctor" del pasado.

<img src="/ai-engineering-intro/assets/image-15.png" alt="image-15.png" width="509" height="340" />





**El ángulo escéptico:**

Debemos dejar de confundir inferencia con aprendizaje:

• **El modelo no aprende de ti:** A diferencia de un programador humano que mejora durante el desarrollo del proyecto, el LLM no mejora de tu interacción. Solo la procesa. Los diales (parámetros) que vimos en las primeras diapositivas son **Inmutables** (no pueden cambiarse) en tiempo de ejecución.

• **El peligro:** El modelo intentará extrapolar del pasado al presente. Si la sintaxis cambió en una biblioteca de código popular en 2025, y el modelo fue entrenado en 2024, te dará código que es "correcto" estadísticamente pero simplemente no funcionará en Runtime.

**Recomendación:**

"El LLM es un experto congelado. Si quieres que conozca la realidad de 2026, debes ser su memoria.

RAG (Retrieval-Augmented Generation) es el 'tatuaje' que le damos al modelo para que pueda funcionar en el mundo moderno."

