# Estructura del Flujo de Trabajo del Agente (Agentic Workflow)

Mientras que la ilustración anterior se enfocó en las características del agente, esta ilustración se enfoca en cómo opera a nivel del sistema. Presenta la estructura técnica que separa al LLM como motor de pensamiento del Agente como capa de lógica operacional.




**Los componentes principales:**

• **Agente:** El centro administrativo (Orquestador). No es el modelo de lenguaje en sí, sino el código que gestiona el bucle, toma decisiones y se comunica con otros componentes.

• **Plantilla de Prompt:** Proporciona al agente su "identidad" e instrucciones de operación (Instructions). Aquí es donde se definen el System Prompt y las reglas guía.

• **LLM:** Sirve como el "componente de inferencia" (Planificación / Razonamiento) únicamente. El agente le envía información y recibe una decisión sobre el siguiente paso.

• **Herramientas:** La capacidad de realizar acciones (Actions) en el mundo exterior - ejecutar código, llamar APIs o acceder a bases de datos.

• **Memoria:** Un mecanismo para almacenar y recuperar información (Store / Retrieve). Este es el componente que permite al agente mantener consistencia a lo largo del tiempo y no olvidar el objetivo.

• **Usuario:** La fuente de entrada (Prompt) y el destino para recibir la respuesta final (Response).

<img src="/ai-engineering-intro/assets/image-26.png" alt="image-26.png" width="616" height="380" />



**Escepticismo constructivo:**

El diagrama presenta una separación limpia entre componentes, pero en realidad las líneas son borrosas.

1. **El agente es código, no magia:** La caja central "Agent" es a menudo simplemente un bucle while en Python. La complejidad real está en la Gestión de Estado entre los diferentes pasos.

2. **El cuello de botella del Razonamiento:** El diagrama asume que el LLM siempre devolverá un plan de acción válido. En la práctica, un pequeño error de razonamiento lleva a una acción incorrecta en Tools, lo que puede crear daño irreversible si no hay "barandillas de seguridad" (Guardrails).

3. **Costos de memoria:** Store y Retrieve suenan simples, pero a medida que la conversación se alarga, la gestión de memoria se convierte en un problema de optimización de costos de tokens versus relevancia de información.

