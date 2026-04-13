# Software Tradicional vs. Aplicaciones de IA

La ilustración presenta las diferencias fundamentales entre el desarrollo de software clásico y la construcción de sistemas basados en inteligencia artificial. Esto no es meramente una mejora tecnológica, sino una transición completa en metodología de trabajo y gestión de riesgos del proyecto.



**Los componentes principales para comparación:**

• **Fuente de lógica:** En software tradicional, la lógica se dicta de arriba hacia abajo por un programador que escribe reglas explícitas. En aplicaciones de IA, la lógica crece de abajo hacia arriba a través del reconocimiento de patrones de los datos.

• **Tipo de salida:** El software tradicional es determinístico. Una entrada fija siempre llevará a un resultado idéntico. Las aplicaciones de IA son probabilísticas - la salida es la "mejor suposición" y puede cambiar ligeramente entre diferentes ejecuciones con exactamente la misma entrada.

• **Foco del trabajo:** En software regular nos enfocamos en la calidad del código y la lógica. En IA, el éxito depende de la calidad y cantidad de datos de entrenamiento.

• **Estabilidad:** El código regular permanece estable mientras no lo hayamos cambiado.

En modelos de IA hay un fenómeno de "Deriva del Modelo" (Model Drift). El modelo se vuelve menos preciso con el tiempo porque el mundo cambia y los datos con los que fue entrenado se vuelven obsoletos.

• **Interpretabilidad:** El código es transparente. Puedes leerlo y entender por qué se tomó una decisión. La IA es una "caja negra" - la lógica está enterrada dentro de millones de pesos numéricos, haciendo la explicación del "por qué" una tarea difícil.

**Escepticismo constructivo:**

<img src="/ai-engineering-intro/assets/image-27.jpg" alt="image-27.jpg" width="682" height="323" />

Como programadores, deberíamos mirar esta tabla críticamente para entender los desafíos reales:

1. **Muerte del Unit Test tradicional:** En software tradicional, la prueba de corrección es simple. En IA, debido a la naturaleza probabilística, no puedes esperar un resultado "correcto". Esto nos obliga a cambiar a medir "porcentaje de precisión" en lugar de "pasa/falla."

2. **Peligro de Caja Negra:** El hecho de que la lógica se almacene en pesos numéricos significa que cuando el agente cometa un error, no podremos "Debuguear" una línea de código. Necesitaremos "Debuguear" los datos o el contexto.

3. **La ilusión de "Confiabilidad Estática":** Los programadores regulares asumen que lo que funcionó hoy funcionará mañana. Esta ilustración advierte que esto no es cierto en IA. El modelo es "orgánico" en cierto sentido, y requiere mantenimiento que no conocíamos en el viejo mundo del software.

**Importante enfatizar:**

Estas diferencias son la razón por la que la IA a menudo falla en organizaciones que intentan gestionarla como un proyecto de software regular. No puedes esperar determinismo de un sistema probabilístico, y no puedes esperar transparencia completa de un sistema basado en patrones.

