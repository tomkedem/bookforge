# Capítulo 8: Código Seguro Contra un Agent Ciego

## La Ilusión del Código Seguro: La Trampa Estadística

Una de las suposiciones más peligrosas al trabajar con Agents es que si el código se ve limpio, claro y funciona bien, probablemente también es seguro. Esta es una suposición incorrecta.

La calidad funcional y la seguridad de la información no son lo mismo. Un Agent puede producir una función legible, organizada y muy convincente, y en el mismo aliento incorporar una vulnerabilidad clásica como inyección SQL, exposición de secretos o uso de una biblioteca externa peligrosa.

Aquí es precisamente donde se pone a prueba la capacidad del ingeniero. El Agent no aplica juicio de seguridad. Opera desde patrones estadísticos. Si en el código público en el que fue entrenado hay soluciones rápidas, comunes y vulnerables, puede reproducirlas sin entender en absoluto que es un riesgo.

En otras palabras, el Agent no pregunta si el código es seguro. Pregunta cuál es la solución más probable de producir.

Por lo tanto, al trabajar con un Agent, el valor por defecto debe invertirse:

No asumas que el código es seguro hasta que se demuestre lo contrario. Asume desde el principio que cada salida puede contener una vulnerabilidad conocida, y que ustedes son quienes necesitan exponerla antes de que entre al sistema.

En este capítulo aprenderemos a identificar tres áreas de riesgo principales: fuga de secretos desde prompts, introducción de dependencias externas no verificadas y escritura de código que interactúa con entrada externa sin límites de seguridad estrictos. El objetivo no es temer al Agent, sino trabajar con él desde una disciplina de seguridad.

Cuando el Agent escribe rápido, la capacidad del ingeniero también se mide en la habilidad de asumir desde el principio que el código necesita sospecha, no confianza.

## Fuga de Secretos: El Peligro del Copiar-Pegar

Uno de los peligros más prácticos al trabajar con Agents no viene del código que el Agent escribe, sino de la información que le enviamos. En momentos de presión, es muy fácil copiar un error, un fragmento de código, un archivo de configuración o un log completo, y pegar todo en la ventana del chat para obtener una respuesta rápida. Este es exactamente el punto donde puede ocurrir una fuga.

No se trata solo de una contraseña dejada por error en un archivo. A veces la fuga parece mucho más inocente: una cadena de conexión, un token de acceso, una dirección de servicio interno, un identificador de usuario, datos personales de un log o una estructura de infraestructura que la organización nunca tuvo intención de exponer.

Aquí es donde se vuelve a poner a prueba la capacidad del ingeniero. El Agent no sabe qué estaba prohibido enviarle. La responsabilidad de detenerse, verificar y limpiar el texto antes de pegar sigue siendo completamente humana.

Hay dos hábitos que deben convertirse en el valor por defecto:

**Limpieza Activa Antes de Cada Pegado**
Antes de pegar código, logs o archivos de configuración en la ventana del chat, detente un momento y revisa el material con ojos críticos. Busca claves, tokens, contraseñas, identificadores, direcciones internas y datos personales. Cualquier valor sensible se reemplaza inmediatamente con una cadena clara como REDACTED o REDACTED_API_KEY.

**Separación Completa Entre Secretos y Código**
Si tus secretos no aparecen en el código, el riesgo es significativamente menor desde el principio. El código que extrae valores de variables de entorno o un mecanismo de gestión de secretos es más seguro para trabajar que el código que contiene valores sensibles dentro. Esto no es solo buena práctica de seguridad. También es práctica de trabajo correcta con Agents.

El principio aquí es simple:
Antes de preguntar al Agent qué hacer con el código, necesitas preguntar qué no debe exponer este código.

Por lo tanto, antes de cada pegado en la ventana del chat, pregunta:

¿Hay algún secreto aquí, aunque no parezca una contraseña?

¿Hay datos personales, un identificador o un detalle interno del sistema aquí?

¿Este texto es seguro incluso si fuera leído fuera de la organización?

¿Se puede limpiar la información sin dañar la pregunta técnica?

El riesgo en la fuga de secretos casi nunca viene de mala intención. Viene de mal hábito. Por lo tanto, la mejor defensa aquí no es el miedo, sino la disciplina.

**Regla de Trabajo Corta**

Antes de cada pegado al Agent, detente, limpia y solo entonces envía.

## Bibliotecas Inventadas o Peligrosas: El Peligro de Agregar Dependencias

Un Agent tiende a completar una respuesta incluso cuando carece de conocimiento real. Cuando se le pide resolver un problema inusual, puede sugerir una biblioteca externa que suena confiable, adecuada e incluso familiar, aunque no exista en absoluto. En otros casos, la biblioteca existe pero no es estable, no tiene mantenimiento o simplemente no es digna de entrar en un sistema real.

Aquí el riesgo ya no es solo un error técnico. Se convierte en un riesgo de cadena de suministro.

Si un desarrollador copia un nombre de paquete del Agent y lo instala sin verificar, esencialmente está introduciendo código extraño en el sistema sin realizar ningún filtrado profesional sobre él. Incluso si la biblioteca realmente existe, el mero hecho de que el Agent la recomendó no constituye ninguna aprobación de calidad, seguridad o idoneidad para el sistema.

Aquí es donde se vuelve a poner a prueba la capacidad del ingeniero. El Agent sabe sugerir. El ingeniero debe validar.

Hay tres cosas que deben verificarse antes de agregar una nueva dependencia que el Agent recomendó:

**Existencia Real en la Fuente Oficial**
Verifica que el paquete realmente existe en el repositorio oficial del gestor de paquetes relevante, y no solo en la ventana del chat.

**Señales de Vida y Comunidad**
Verifica cuándo fue actualizado por última vez, qué tan ampliamente se usa, si tiene mantenimiento activo y si hay un cuerpo reconocido detrás o al menos un proyecto que parece confiable y serio.

**Ajuste al Sistema y Política Organizacional**
Verifica si siquiera es correcto agregar una nueva dependencia. A veces la solución que sugiere el Agent suena elegante, pero en la práctica crea una dependencia innecesaria de una biblioteca externa para un problema que puede resolverse con herramientas que ya existen en el proyecto.

En otras palabras, no solo verifiques si el paquete existe. También verifica si es digno de entrar.

Por lo tanto, antes de cualquier instalación de una biblioteca que vino del Agent, pregunta:
