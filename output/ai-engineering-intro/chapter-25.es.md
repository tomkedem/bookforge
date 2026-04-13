# Los LLMs A Veces Alucinan:

Uno de los fenómenos más discutidos en IA. La redacción precisa es importante aquí: la alucinación no es un bug aleatorio. Es un subproducto necesario e incorporado del mecanismo que vimos antes.

1. **La Fuente Técnica: La Predicción Debe Continuar**

Como vimos en el Pipeline de Inferencia y el Bucle de Retroalimentación (Auto-regresión), el modelo está programado para predecir el siguiente token. Cuando el modelo llega al borde de su ventana de contexto, o cuando se le pide producir información que no está en sus parámetros, encuentra un problema.

2. **La Paradoja del PhD: Prefiere Ser Fluido Sobre Ser Preciso**

<img src="/ai-engineering-intro/assets/image-14.png" alt="image-14.png" width="434" height="289" />

Un doctor real sabe cuándo decir "no sé". El LLM, por su misma definición como motor de **Autocompletado**, debe completar la oración.

En lugar de detenerse, el modelo usa su "doctorado" para predecir el token que **parece** más probable y convincente lingüísticamente, incluso si es completamente incorrecto factualmente. El modelo prefiere Tonterías Fluidas sobre el silencio.


**El ángulo escéptico:**

Este es "el doctor que miente con confianza completa". El peligro no es el error, sino el alto nivel del lenguaje (el PhD) que hace que la mentira suene completamente creíble. Cuanto más fuerte el modelo, más difíciles de detectar son sus alucinaciones.

**Recomendación:**

No confíes en el LLM como Única Fuente de Verdad. El LLM es un **motor de síntesis e inferencia**, no un **mecanismo de verificación**. La responsabilidad de la **Validación** y la **Revisión por Pares** permanece con nosotros.

