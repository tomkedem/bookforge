# Tokens de LLM: Las Unidades Fundamentales del Lenguaje (y la Mecánica Detrás de Ellos)

**El Proceso de Tokenización**

Las computadoras, y las redes neuronales en particular, no pueden procesar texto crudo. Para que un modelo de lenguaje pueda "leer", primero debe descomponer el texto en unidades computacionales básicas llamadas **Tokens.**

Como se muestra en la ilustración, la palabra compleja multiculturalism no se lee como una sola unidad. El modelo la descompone en cuatro sub-tokens (Sub-words): multi-, -cul-, -tur-, alism.



<img src="/ai-engineering-intro/assets/image-09.png" alt="image-09.png" width="546" height="321" />






**Puntos Clave:**

1. **Una palabra no es un token (Palabra ≠ Token):** El modelo no ve "palabras". Ve secuencias de caracteres. Palabras muy comunes (como the) usualmente serán un solo token. Términos complejos, raros o técnicos (muy comunes en Verint) se descompondrán en varios tokens.

2. **El texto se convierte en números:** Este es el paso crítico. Cada token se traduce a un identificador numérico único (ID) de un "diccionario" fijo. Toda la "inteligencia" del modelo es en realidad computación estadística compleja sobre estos números.

3. **Comprensión de patrones:** Descomponer en sub-palabras permite al modelo "entender" palabras nuevas que nunca vio durante el entrenamiento, o manejar errores de ortografía (como **Understading** mostrado en la ilustración - falta la letra 'n'). El modelo reconoce las partes familiares de la palabra e infiere el significado del contexto.


**Escepticismo constructivo:**

Al construir arquitectura para un producto, no compares modelos solo por "calidad de respuesta".

**Mi consejo:** Siempre verifica la **Eficiencia de Tokenización**. Cuando reemplazas un modelo dentro del sistema, debes recalcular los límites de memoria (Contexto) y el presupuesto, porque tu Conteo de Tokens va a cambiar.

**No asumas que 1,000 tokens en GPT son los mismos 1,000 tokens en Gemini.**
