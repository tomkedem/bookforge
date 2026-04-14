# Agentes de IA (AI Agents)

Hasta ahora hablamos del modelo como una herramienta pasiva esperando información (RAG). Aquí presentamos un salto cuántico: el modelo se convierte en un sistema activo que opera en el mundo. Esta es la transición de "chatbot" a "trabajador digital."

<img src="/ai-engineering-intro/assets/image-23.png" alt="image-23.png" width="533" height="393" />
**Los componentes principales:**

• **Sistema autónomo:** El agente no solo responde una pregunta. Recibe un objetivo y decide por sí mismo el orden de acciones requeridas para lograrlo.

• **Percepción del entorno:** El agente "ve" el estado actual a través de entradas (texto, archivos, respuestas de API).

• **Razonamiento:** El modelo usa sus capacidades lógicas para descomponer una tarea compleja en sub-tareas.

• **Uso de herramientas:** Este es el corazón del agente. Puede ejecutar código, acceder a una base de datos o enviar un email. No solo habla, hace.

• **Mínima intervención humana:** La aspiración es cerrar el bucle para que el agente se corrija a sí mismo y continúe hasta completar la tarea.

**Escepticismo constructivo:**

El término "autónomo" suena prometedor, pero como programadores y gerentes de equipos, debería encender alarmas:

1. **Bucles infinitos:** Los agentes pueden "atascarse" en lógica defectuosa y desperdiciar miles de tokens (y dinero) sin llegar a un resultado.

2. **Pérdida de control:** A diferencia del código regular, es difícil predecir de antemano cada acción que el agente elegirá hacer. Este es un desafío enorme para sistemas de Producción que requieren estabilidad.

3. **Costos (Token Overhead):** Agentes que "piensan en voz alta" (como en el método ReAct) consumen una cantidad enorme de tokens en cada pequeño paso.

**Fortalezas en la diapositiva:**

• Define claramente la diferencia entre un LLM regular y un Agente (la capacidad de tomar decisiones y actuar).

• Establece el objetivo final: lograr objetivos específicos con mínima intervención humana.

**Importante enfatizar:**

El agente es el nivel más alto de "ingeniería de contexto". Para que un agente funcione, necesita contexto que incluya no solo datos (RAG), sino también **definiciones de herramientas** (Tools) claras y un mecanismo para gestionar sus pasos. Si RAG es un "examen con libro abierto", entonces un agente es un "pasante" que enviamos a la oficina con acceso a computadora y teléfono. Nuestra responsabilidad es darle las instrucciones y herramientas correctas para que no cause daño.

