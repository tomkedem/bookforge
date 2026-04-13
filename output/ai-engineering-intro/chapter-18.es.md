# LLM = Large Language Model (Modelo de Lenguaje Grande)

**¿Qué es realmente un LLM? (Desglosando el concepto)**

Es simplemente todos los modelos que usamos

1. **Large (Grande):** El significado no es solo el volumen de texto en el que el modelo fue entrenado (petabytes de datos), sino principalmente el número de parámetros (pesos en la red neuronal).

Cuanto más "grande" es el modelo, más capaz es de capturar relaciones complejas entre conceptos y realizar "razonamiento" a un nivel más alto.

2. **Language (Lenguaje):** El modelo fue entrenado en el medio humano más complejo - el lenguaje.

Esto incluye no solo inglés o hebreo, sino también lenguajes de programación, lógica matemática y estructuras de datos (JSON, YAML). El modelo "entiende" las estadísticas del lenguaje.

3. **Model (Modelo):** Esta es una representación matemática (algoritmo) que se guarda como archivo.

<img src="/ai-engineering-intro/assets/image-09.png" alt="image-09.png" width="546" height="321" />

No es un motor de búsqueda y no es una base de datos. Es una "instantánea" de todo el conocimiento que el modelo adquirió durante el entrenamiento, permitiéndole predecir la siguiente salida.

**Escepticismo constructivo:**

Aunque la palabra **Language** aparece en el centro, es importante recordar que el modelo no "entiende" el lenguaje de la manera en que nosotros lo entendemos. Entiende la **sintaxis** (estructura) y las **relaciones estadísticas** entre palabras.

**¿Por qué esto importa para nosotros como desarrolladores?**

Porque cuando construimos un producto, debemos recordar **que el Modelo** es estático. No se actualiza en tiempo real. Si algo pasó esta mañana, el modelo no lo sabrá porque no es parte de **los Large** datos en los que fue entrenado. Aquí es donde entra la necesidad de soluciones de ingeniería como RAG para "completar" al modelo lo que le falta.
