# Estructura Detallada de la Ventana de Contexto
<img src="/ai-engineering-intro/assets/image-18.png" alt="image-18.png" width="519" height="313" />


En esta ilustración "abrimos el motor" y miramos los internos de la ventana de contexto. Esta es la etapa donde la teoría se convierte en arquitectura real.

**Los componentes principales:**


• **Prompts:** Esto no es solo la pregunta del usuario, sino todo el System Prompt. Estas son las reglas de la casa: definiendo el rol del modelo, sus limitaciones y el formato en el que debe responder.

• **Historial / Memoria:** La capa que permite la continuidad de la conversación. La aplicación necesita decidir qué tan atrás recordar. Una memoria demasiado larga puede confundir al modelo o exceder el presupuesto de tokens.

• **Recursos:** Aquí es donde ocurre la inyección de conocimiento externo (RAG). Esta es la información específica que trajimos de documentos o bases de datos para que el modelo pueda basarse en hechos y no inventar respuestas.

• **Herramientas:** Las definiciones que permiten al modelo invocar funciones externas (Function Calling). Esto podría ser una API, esto podría ser MCP. Y esta es la parte que transforma al modelo de un motor textual a una herramienta capaz de realizar acciones en el mundo real.

**Escepticismo constructivo:**

Hay una tendencia a pensar que "cuanta más información en el contexto - mejor". Este es un error común. Demasiada información crea ruido, aumenta el tiempo de respuesta e infla los costos. Los modelos a veces sufren del problema "Lost in the Middle", donde tienden a ignorar información que aparece en el medio de la ventana de contexto. La ingeniería de calidad es ante todo el arte de filtrar y destilar.

**Importante enfatizar:**

El contexto es inmueble caro. Cada componente que entra tiene un costo en tokens y precisión. Nuestro rol es gestionar un "presupuesto de tokens". Debemos preguntarnos antes de cada llamada al modelo: ¿Esta pieza de información realmente avanza al modelo hacia resolver la tarea, o solo se interpone en su camino?
