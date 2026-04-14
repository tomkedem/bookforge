# RAG (Generación Aumentada por Recuperación)

Este concepto toma la "ingeniería de contexto" y se enfoca en su técnica más central hoy. Si la ventana de contexto es el banco de trabajo, RAG es el bibliotecario que trae el libro exacto de la biblioteca gigante de la organización a la mesa.
<img src="/ai-engineering-intro/assets/image-21.png" alt="image-21.png" width="518" height="255" />

**Los componentes principales:**

• **Conexión a conocimiento externo confiable:** Rompiendo la limitación del "conocimiento congelado" del entrenamiento del modelo. El LLM obtiene acceso a fuentes de información que son la Fuente de Verdad de la organización.

• **Reducción de Alucinaciones:** Usar información real como base para la respuesta en lugar de las conjeturas estadísticas del modelo.

• **Integración de búsqueda e inferencia:** Fusión de dos mundos - la capacidad de encontrar información y la capacidad de entenderla y explicarla (Razonamiento).

• **Ideal para datos organizacionales y privados:** La solución perfecta para trabajar con documentos sensibles (Enterprise) que no pueden o no deben exponerse al modelo en un proceso de reentrenamiento.



• **Respuestas actualizadas en tiempo real:** La capacidad de responder preguntas sobre cosas que pasaron hace una hora, no solo hace dos años.

**Escepticismo constructivo:**

La ilustración presenta una imagen muy optimista, pero como programadores experimentados, debemos mirar la "letra pequeña":

1. **Alucinaciones Fundamentadas:** RAG no elimina las alucinaciones, solo cambia su naturaleza. Si el sistema recupera una pieza de información irrelevante, el modelo intentará por fuerza "soldarla" a la respuesta, lo que crea una mentira que se ve muy creíble porque está basada en "hechos."

2. **La Ilusión del Conocimiento Confiable:** El sistema es tan confiable como los datos en la base de datos vectorial. Si los datos organizacionales están desordenados, son contradictorios o están desactualizados, RAG solo amplificará el problema.

3. **Lo actualizado no es automático:** La capacidad de responder en tiempo real depende completamente del Pipeline de Indexación. Si los datos en el Vector DB no se actualizan frecuentemente, el sistema seguirá viviendo en el pasado.

