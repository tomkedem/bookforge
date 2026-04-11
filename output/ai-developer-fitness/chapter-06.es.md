# Capítulo 5: Ingeniería de Diálogo Defensivo - Deteniendo el Fallo en la Etapa del Prompt

En los capítulos anteriores, aprendimos a identificar decisiones débiles, ejecutar flujos en nuestra cabeza, y criticar código que se ve demasiado convincente. Pero si toda nuestra defensa comienza solo después de que el Agente ya ha escrito el código, estamos respondiendo demasiado tarde.

Aquí comienza la siguiente etapa en el trabajo de ingeniería con Agentes: no solo verificar el output, sino diseñar de antemano las condiciones bajo las cuales será creado.

Cuando un Agente recibe una solicitud demasiado general, tiende a producir una solución genérica, optimista e ingenua. Funcionará bien en el resultado funcional, pero fácilmente ignorará las restricciones reales del sistema: estructura distribuida, dependencias externas, gestión de estado, concurrencia, seguridad y caminos de fallo. Por lo tanto, la responsabilidad del programador no comienza solo en la revisión de código. Comienza ya en la formulación de la solicitud.

Este es el corazón de la ingeniería de diálogo defensivo: la capacidad de formular un prompt que no solo solicita lo que el Agente necesita construir, sino que también dicta dentro de qué límites, bajo qué restricciones, y de qué maneras no se le permite resolver el problema.

Cuando un Agente produce código rápido, la capacidad de ingeniería del programador se mide no solo por lo que identifica en retrospectiva, sino también por lo que sabe prevenir de antemano.

## Por Qué Ya No Puedes Trabajar con un Prompt Vacío

Uno de los errores más comunes al trabajar con Agentes es formular una solicitud que define solo el resultado deseado, pero no las condiciones del sistema en las que se supone que el código debe operar. Tal solicitud puede llamarse un prompt vacío: un prompt que solicita funcionalidad, pero no proporciona contexto, restricciones o límites.

Supongamos que un desarrollador escribe al Agente:
"Escribe una función en Node.js que registre a un nuevo estudiante en el sistema Lomda y guarde los datos en la Base de Datos."

A primera vista, esto parece una solicitud razonable. Es clara, corta, y tiene un resultado definido. Pero desde una perspectiva de ingeniería, esta es una solicitud que deja al Agente demasiado espacio para suposiciones incorrectas. No le dice cómo está construido el sistema, qué no puede asumir, dónde están los límites de responsabilidad, y qué riesgos no puede ignorar.

Cuando un Agente recibe tal solicitud, llena los huecos él mismo. No desde comprensión real del sistema, sino desde la solución estadísticamente más probable que ha visto antes. Por lo tanto tiende a asumir, aunque no explícitamente, que el sistema corre en un solo proceso, que las llamadas a la base de datos tienen éxito normalmente, que no hay competencia por recursos, y que no hay restricciones especiales del sistema.

Aquí exactamente se prueba la capacidad de ingeniería del programador. El Agente no sabe lo que no se le dijo. La responsabilidad del programador no es esperar que adivine la arquitectura, sino formularla. No esperar que entienda las reglas no escritas del sistema por sí mismo, sino hacerlas parte de la solicitud misma.

Por lo tanto, un prompt vacío no es solo un prompt corto. Es un prompt que transfiere un problema al Agente sin su física. El resultado a menudo será código limpio, elegante y genérico, pero uno que se rompe inmediatamente cuando encuentra el sistema real.

La transición profesional más importante al trabajar con Agentes es la transición de un prompt que solicita un resultado, a un prompt que define condiciones. No solo qué construir, sino también en qué entorno, bajo qué restricciones, y de qué maneras no se permite resolver el problema.

## Inyectando Contexto de Infraestructura

Antes de presentar al Agente el problema de negocio o lógico, necesitas definirle la realidad en la que el código va a operar. No es suficiente solicitar funcionalidad. También debes proporcionar condiciones del entorno: si es un sistema distribuido, si el servicio corre en varias instancias paralelas, dónde se almacena el Estado, y qué componentes centrales dictan las reglas del juego.

Aquí exactamente se prueba la capacidad de ingeniería del programador. El Agente no inventará la arquitectura correcta por sí mismo. Llenará los huecos según lo que le parezca razonable. La responsabilidad del programador es reemplazar la probabilidad general con contexto real.

En muchos Agentes modernos, puedes anclar parte de este contexto en archivos de instrucciones dedicados dentro del proyecto, como archivos Markdown que definen para el Agente cómo trabajar con el repositorio. Esta es una mejora importante, pero no cambia el principio: el Agente todavía debe recibir no solo la tarea, sino también las reglas ambientales en las que debe operar. Ya sea que el contexto se entregue dentro del prompt mismo o anclado en archivos de instrucciones del proyecto, la responsabilidad de definirlo permanece con el programador.

Por defecto, un modelo de lenguaje tiende a asumir un entorno demasiado simple: un solo proceso, memoria local disponible, acceso directo a datos, y sin competencia real por recursos. Si no le dictamos una realidad diferente, producirá código que se ve correcto en una computadora de desarrollo local, pero se rompe en el momento que encuentra un sistema distribuido.

Por lo tanto, inyectar contexto de infraestructura no es una bonita adición al prompt. Es una parte esencial del requisito. De hecho, es un párrafo de apertura fijo que define para el Agente las reglas de física del entorno de producción.

## Forzando Escenarios de Fallo

Los Agentes tienden hacia un optimismo peligroso. Por defecto, escriben código adecuado para el camino feliz: un estado donde la red está disponible, la base de datos responde inmediatamente, y los servicios externos operan sin fallo. En un sistema real, esta es una suposición peligrosa.

Para prevenir que el Agente construya una solución que se rompe en el primer encuentro con la realidad, necesitas forzarlo a pensar de antemano sobre escenarios de fallo. No esperar que agregue mecanismos de defensa por iniciativa propia, sino definirlos como parte explícita del requisito.

Aquí nuevamente se prueba la capacidad de ingeniería del programador. El Agente tiende a completar el camino más directo y limpio para realizar la acción. El programador debe forzarlo a también lidiar con lo que sucede cuando el mundo deja de cooperar.

La forma correcta de hacer esto es insertar requisitos explícitos en el prompt para manejo de errores, tiempos de respuesta excepcionales, reintentos, y situaciones donde una operación tiene éxito solo parcialmente. Una vez que los escenarios de fallo se convierten en parte de la solicitud, el código que el Agente produce también deja de ser teórico y se vuelve más resiliente.

**Manejo de Errores:**
Debes asumir que el servicio de pago externo puede responder lentamente, devolver un error 503, o fallar completamente.
Implementa un timeout duro de 3 segundos para la solicitud.
Agrega hasta 3 reintentos con retraso creciente entre intentos.
Si la operación falla después de todos los intentos, debe realizarse una operación de compensación para prevenir inconsistencia de datos.

## Estableciendo Muros y Límites

Los Agentes tienden a elegir el camino más corto al resultado. Desde su perspectiva, si puedes acceder a datos directamente, saltarte una capa de servicio, o dividir una operación compleja en varias operaciones de escritura separadas, esa es una elección razonable. Localmente, a veces incluso parece elegante. Sistémicamente, esta puede ser exactamente la manera en que la arquitectura comienza a agrietarse.

Aquí entra otra capa de ingeniería de diálogo defensivo: no solo explicar al Agente qué necesita construirse, sino también definir explícitamente qué no se le permite hacer.

**Restricciones de Arquitectura:**
Está prohibido acceder directamente a las tablas o la base de datos del User Service.
Para obtener datos de estudiantes, solo debe usarse la API interna del servicio o el Client existente en el proyecto.

**Restricciones de Datos:**
La operación requiere actualizar varios registros juntos. Está prohibido realizar estas actualizaciones como unidades separadas. Todas las operaciones de escritura deben envolverse en una sola Transaction. Si una operación falla, debe realizarse un Rollback completo.

## La Plantilla del Prompt Ingenieril: La Caja de Herramientas del Desarrollador

Una buena plantilla para un prompt de ingeniería se construye de cuatro partes:

- **Contexto del Sistema**
Aquí defines dónde correrá el código y bajo qué condiciones.

- **La Tarea Exacta**
Aquí defines exactamente qué necesita construirse.

- **Muros y Límites**
Aquí defines qué no se le permite hacer al Agente.

- **Manejo de Errores y Escenarios de Fallo**
Aquí defines qué debe tener en cuenta el Agente cuando la realidad no coopera.

Cuando usas esta plantilla, la dinámica cambia. Dejamos de pedir al Agente "código que funciona," y empezamos a exigir código que opera dentro de límites reales.
