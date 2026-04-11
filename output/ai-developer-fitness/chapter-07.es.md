# Capítulo 6: Tomando Decisiones Cuando el Agent Sugiere Alternativas pero No Asume Responsabilidad La Ilusión de la Comparación Objetiva

En capítulos anteriores aprendimos a formular requisitos mejor, identificar código débil más rápido y criticar soluciones que parecen demasiado convincentes. Ahora avanzamos otro nivel: no solo examinar código, sino decidir entre alternativas que el Agent nos presenta.

Este es un momento particularmente peligroso. Cuando un Agent sugiere tres opciones, adjunta una tabla comparativa y marca una como la recomendación preferida, es muy fácil confundir análisis con decisión. El Agent sabe presentar alternativas bien, pero no asume responsabilidad por sus resultados.

Aquí es precisamente donde se pone a prueba la capacidad del ingeniero. El Agent puede ayudar a pensar, mapear posibilidades y formular pros y contras. Pero la decisión misma sigue siendo humana. Quien tendrá que vivir con el costo, con la complejidad, con el mantenimiento y el posible fallo, no es el Agent sino el equipo.

En este capítulo aprenderemos a leer alternativas no como recomendaciones para selección rápida, sino como materia prima para la toma de decisiones. Las examinaremos a través de cuatro filtros fijos: ajuste técnico, ajuste de negocio, evaluación de riesgos y distinción entre decisiones fáciles de revertir y decisiones casi imposibles de deshacer.

Cuando el Agent genera opciones rápidamente, la capacidad del ingeniero se mide en la habilidad de permanecer como el tomador de decisiones.

## Consideraciones Técnicas Versus Lo Que el Sistema Realmente Puede Soportar

Cuando un Agent sugiere alternativas técnicas, tiende a preferir la solución impresionante, generalizada y teóricamente "correcta". Si le presentas un problema de carga, tenderá a sugerir colas de mensajes dedicadas, transición a arquitectura de eventos o componentes de infraestructura avanzados que se ven excelentes en una tabla comparativa.

Desde una perspectiva puramente técnica, estas recomendaciones pueden ser correctas. El problema es que la ingeniería de software no ocurre en un vacío. Una buena solución no es solo la que suena correcta, sino la que el sistema existente, el equipo existente y las capacidades operativas existentes pueden soportar.

Aquí es precisamente donde se pone a prueba la capacidad del ingeniero. El Agent pregunta qué se puede construir. El ingeniero debe preguntar qué se puede construir, operar, depurar y mantener a lo largo del tiempo.

Por lo tanto, cuando el Agent sugiere una alternativa técnica, vale la pena examinarla contra tres preguntas fundamentales:

**Ajuste a la Caja de Herramientas Existente**

¿La solución se basa en infraestructura y herramientas que ya existen en el sistema, o introduce un componente completamente nuevo? En un sistema que ya usa profundamente Azure y Redis, una solución razonable que se construye sobre lo que ya está integrado puede ser más apropiada que una solución "perfecta" que agrega una nueva capa de complejidad.

**El Costo del Día Después**

Es muy fácil pedirle al Agent que genere código de configuración para nueva tecnología. Es mucho más difícil depurarla durante un fallo, operarla bajo carga y mantenerla un año después. Una solución con la que nadie en el equipo tiene experiencia práctica es un riesgo, aunque suene más avanzada.

**Dependencia y Compatibilidad a Largo Plazo**

¿La alternativa crea nueva dependencia de un proveedor, un SDK específico o un componente de infraestructura que te vinculará en dos años aunque te arrepientas? El Agent tiende a resaltar las ventajas a corto plazo de una solución, pero tu responsabilidad es preguntar qué libertad te cuesta más adelante.

Supongamos, por ejemplo, que el Agent sugiere introducir un nuevo componente de cola de mensajes para resolver un problema de carga específico. Sobre el papel, esta podría ser una excelente recomendación. Pero si el equipo ya tiene experiencia profunda en Redis, y si Redis Streams puede proporcionar el nivel de rendimiento requerido, quizás la solución menos "elegante" sería más correcta.

Por lo tanto, leer las alternativas técnicas del Agent no termina preguntando qué solución suena más avanzada. La pregunta importante es qué solución puede contener realmente nuestro sistema sin pagar costos operativos y organizacionales innecesarios.

Cuando el Agent propone alternativas rápidamente, la capacidad del ingeniero también se mide en la habilidad de preferir la solución apropiada, no la impresionante.

## Consideraciones de Negocio: El Filtro de Realidad Versus la Utopía del Agent

Un Agent sabe comparar alternativas técnicas bien. Puede evaluar complejidad, explicar ventajas de rendimiento y señalar flexibilidad futura. Pero opera dentro de un espacio casi teórico. No siente presión de fechas límite, no ve limitaciones presupuestarias y no sabe cuánto tiempo le queda realmente al equipo para completar la tarea.

Aquí es precisamente donde comienza la brecha entre buen análisis técnico y decisión correcta.

Aquí es donde se vuelve a poner a prueba la capacidad del ingeniero. El Agent puede sugerir lo que suena correcto en papel. El ingeniero debe preguntar qué es correcto dentro de las restricciones de negocio reales de la organización.

Por lo tanto, cuando el Agent presenta una alternativa que parece óptima, debe pasar por tres preguntas simples de realidad:

**Tiempo para Valor**
¿Esta alternativa permite avanzar al ritmo que el negocio necesita, o requerirá semanas de configuración, aprendizaje y ajustes? A menudo, la solución correcta no es la más ideal, sino la que entrega valor real a tiempo.

**Costo Directo e Indirecto**
¿La recomendación requiere un servicio administrado costoso, nuevas licencias, adiciones de infraestructura o muchas horas de trabajo de integración y mantenimiento? El Agent podría recomendar un componente técnicamente excelente, pero no asume el costo cuando el presupuesto se infla.

**Curva de Aprendizaje y Capacidad de Ejecución**
¿Puede el equipo realmente construir, operar y mantener esta solución? Un Agent a menudo asume que toda tecnología está igualmente disponible para todos los equipos. En la práctica, una alternativa que requiere conocimiento que no existe en la organización puede convertirse rápidamente en dependencia de una persona o una capa de complejidad que nadie quiere tocar.

Supongamos, por ejemplo, que el Agent recomienda una solución avanzada e impresionante que requiere nueva configuración de infraestructura, cambios en los flujos de trabajo del equipo y aprender una herramienta con la que nadie tiene experiencia. Puede que sea técnicamente correcta. Pero si la organización necesita una demostración para un cliente en una semana, si el presupuesto es limitado y si nadie en el equipo podrá mantener esta decisión en tres meses, esta no es la decisión correcta.

Aquí es precisamente donde se pone a prueba la propiedad humana de la decisión. El ingeniero responsable no solo pregunta cuál es la mejor solución bajo condiciones ideales. Pregunta cuál es la solución correcta para nosotros ahora mismo.

Por lo tanto, ante cada alternativa que el Agent sugiere, pregunta:

¿Se ajusta a nuestro cronograma real?

¿Su costo seguirá siendo razonable más allá de la escritura inicial del código?

¿El equipo tiene capacidad real para operarla y mantenerla?

¿Podría una solución menos impresionante ser más correcta desde una perspectiva de negocio?

Tu profesionalismo hoy no se mide solo por la capacidad de elegir la solución más elegante. Se mide por la capacidad de elegir la solución que el negocio y el sistema realmente pueden permitirse.

## Evaluación de Riesgos: De la Teoría a la Responsabilidad en el Campo

Cuando un Agent presenta alternativas arquitectónicas, casi siempre sabe adjuntar una lista de riesgos a cada una. Podría notar problemas de consistencia de datos, complejidad en monitoreo y observabilidad, dependencia de una biblioteca específica o costos de rendimiento. En la superficie, esto parece un análisis maduro y responsable.

Pero aquí es precisamente donde se necesita precaución. El Agent describe riesgos pero no los asume. Su análisis permanece teórico. Sabe identificar qué podría salir mal según patrones familiares, pero no conoce el significado real de esos riesgos dentro de tu equipo, infraestructura y organización.

Aquí es donde se vuelve a poner a prueba la capacidad del ingeniero. El Agent sabe enumerar riesgos. El ingeniero debe evaluarlos dentro de su realidad.

Para hacer esto correctamente, vale la pena pasar cada riesgo que el Agent presenta a través de tres prismas simples:

**Riesgo Operativo**
¿Qué sucederá si esta solución falla en tiempo real? ¿El equipo tiene el conocimiento, las herramientas y la madurez para localizar la falla, arreglarla y restaurar el sistema a operación rápidamente? Una solución avanzada que nadie sabe mantener bajo presión es un alto riesgo, aunque sea muy impresionante en papel.

**Riesgo de Dependencia a Largo Plazo**
¿La alternativa depende de una biblioteca, herramienta o comunidad que podría debilitarse después? El Agent tiende a basarse en lo que parece popular o establecido, pero realmente no verifica qué pasará en dos años si el ritmo de mantenimiento disminuye, si las actualizaciones se retrasan o si quedas solo con un componente en el que nadie invierte más.

**Riesgo de Compatibilidad Organizacional y Seguridad**
¿La solución pasa las restricciones de la organización? La alternativa podría sonar genial, pero requiere abrir rutas de comunicación, usar un servicio no aprobado o cambios que la política de seguridad no permitirá avanzar. Una solución que no puede pasar las puertas de la organización no es una alternativa real, aunque suene técnicamente correcta.

Supongamos, por ejemplo, que el Agent recomienda un nuevo componente de infraestructura para gestión de carga. A nivel de análisis técnico, esta podría ser una buena recomendación. Pero si nadie en el equipo sabe operar este componente durante un fallo, si la comunidad alrededor es débil y si seguridad requerirá meses de aprobaciones, esta decisión podría ser mucho más costosa de lo que muestra la tabla comparativa.

Por lo tanto, la evaluación de riesgos no termina leyendo la lista de desventajas que el Agent produjo. Comienza solo cuando preguntas: ¿cuáles de estos riesgos realmente podemos contener, y cuáles nos derribarán en momento crítico?

Ante cada alternativa que el Agent sugiere, pregunta:

¿El equipo sabe manejar este riesgo cuando se materialice?

¿La dependencia creada aquí es segura a largo plazo?

¿Esta alternativa cumple con las políticas y restricciones de la organización?

¿Qué riesgo parece pequeño en la tabla pero se volverá muy costoso durante un fallo?

La alternativa correcta no es la que no tiene riesgos. Es aquella cuyos riesgos son conocidos, tolerables y manejables dentro de tu realidad.

## Comparando Alternativas Imperfectas: Aceptando el Compromiso Feo

Cuando un Agent presenta dos o tres alternativas, tiende a exponerlas de manera equilibrada, organizada y convincente. Cada alternativa tiene ventajas claras, desventajas razonables y una tabla comparativa que parece que puedes llegar a una decisión clara desde ella. Pero las decisiones de ingeniería reales no se toman bajo condiciones estériles.

En la práctica, casi nunca eliges una solución perfecta. Eliges una solución cuyo precio es más razonable que el precio de las otras alternativas.

Aquí es donde se vuelve a poner a prueba la capacidad del ingeniero. El Agent presenta los pros y contras. El ingeniero debe identificar con qué desventajas la organización realmente puede vivir.
