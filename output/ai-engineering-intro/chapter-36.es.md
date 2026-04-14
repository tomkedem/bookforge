# Características Clave de los Agentes de IA

Esta diapositiva descompone el concepto general de "agente" en una lista de requisitos funcionales. Define qué transforma un sistema de IA de solo un "chatbot" a un sistema de software complejo capaz de gestionar flujos de trabajo.

<img src="/ai-engineering-intro/assets/image-24.png" alt="image-24.png" width="472" height="218" />

**Los componentes principales:**

• **Autonomía:** La capacidad de descomponer un objetivo grande (ej., "prepara un informe de ventas") en sub-tareas sin que el usuario necesite guiar cada paso.

• **Percepción:** Más allá del texto solamente. El agente es capaz de procesar entradas multi-modales como feeds de datos en tiempo real o sensores.

• **Razonamiento:** Usando marcos de trabajo lógicos como "Chain-of-Thought." El agente "piensa" antes de actuar, evalúa posibles resultados y planifica una secuencia de acciones.

• **Uso de Herramientas:** Interacción con el mundo exterior. Ejecutar código, llamadas API y usar aplicaciones de terceros.

• **Persistencia:** Memoria a largo plazo. La capacidad de recordar interacciones previas y preferencias del usuario para mejorar el rendimiento con el tiempo.

• **Auto-Corrección:** La capacidad de identificar un "callejón sin salida" o error en el proceso y cambiar automáticamente de estrategia.

• **Proactividad:** El agente no solo espera un comando. Puede iniciar una acción o alerta basada en cambios ambientales o horarios definidos.






**Escepticismo constructivo:**

Esta lista de características es la "lista de deseos" de todo desarrollador de IA, pero en Producción, crean desafíos de ingeniería difíciles:

1. **La ilusión de auto-corrección:** En realidad, los agentes a menudo entran en bucles de "alucinaciones de corrección" - identifican un error e intentan arreglarlo con otro error, quemando tokens sin avanzar.

2. **Complejidad de memoria:** Gestionar memoria a largo plazo no es solo almacenar texto en una BD. El desafío es recuperar la pieza de información relevante exactamente en el momento correcto sin inundar la ventana de contexto con ruido.

3. **Proactividad peligrosa:** Un sistema que inicia acciones por sí mismo requiere mecanismos de protección (Guardrails) muy estrictos. Sin supervisión, un agente proactivo puede realizar acciones irreversibles o costosas debido a malinterpretación de un cambio ambiental.



**Fortalezas en la ilustración:**

• Establece un estándar claro de lo que cuenta como "agente de calidad."

• Enfatiza que un agente es una combinación de capacidades cognitivas (Razonamiento) con capacidades técnicas (Uso de Herramientas).

**Importante enfatizar:**

Estas características son lo que diferencia un juguete de un producto. Nota **Persistencia** y **Auto-Corrección**. Estas son las dos características más difíciles de implementar. Un agente sin memoria es un agente con amnesia, y un agente sin auto-corrección es un agente que se rompe en el primer obstáculo. Como programadores, nuestro trabajo es construir la infraestructura que soporte estas características - bases de datos vectoriales para memoria y lógica de control para auto-corrección.

