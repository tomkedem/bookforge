# Definiendo el Flujo de Trabajo (The Flow)
<img src="/ai-engineering-intro/assets/image-17.png" alt="image-17.png" width="637" height="275" />

La ilustración define las "reglas del juego" del sistema que estás construyendo.

**Los componentes principales:**

• **El Usuario:** La entrada cruda. Es importante entender que lo que el usuario quiere no siempre es lo que escribe.

• **La Aplicación (App):** Este es el centro de gravedad. Aquí reside tu lógica. La aplicación no es solo una "tubería" que pasa texto. Es el procesador central. Es la que decide qué datos recuperar, qué filtros aplicar y cómo "empaquetar" todo para el modelo.



• **La Ventana de Contexto - El rectángulo púrpura vacío:** Este es el espacio inmobiliario donde ocurre el procesamiento. El hecho de que esté vacío en esta diapositiva enfatiza que es **un recurso a gestionar**. Esta es la Memoria operacional del modelo.

• **El LLM:** El motor que está al final. Recibe lo que cocinaste para él en la ventana de contexto y produce un resultado.

**Análisis profesional y escepticismo constructivo:**

Una suposición común pero errónea es que el LLM es el "cerebro" que contiene todo el conocimiento. Esta diapositiva corrige este error y muestra que el LLM es simplemente un **Motor de Inferencia**. Es "tonto" sin la información que se le transmite en tiempo real.

**Fortalezas en la ilustración:**

• Separa claramente la aplicación del modelo. Esto es crítico para desarrolladores que tienden a pensar que están "programando el LLM". En la práctica, están programando la aplicación que construye el contexto para el LLM.

• Aísla la "ventana de contexto" como una entidad independiente. Esto te permite hablar sobre sus limitaciones (conteo de tokens, costos, Latencia).

**Importante enfatizar:** Como programadores, nuestro trabajo no es "hablar con el LLM", sino **llenar el rectángulo púrpura** de la manera más eficiente posible. Este rectángulo es la única Entrada que el modelo conoce en cualquier momento dado. Si el rectángulo está vacío o desordenado, el resultado será acorde.
