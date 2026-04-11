# Capítulo 2: Leer Código Escrito por Humanos y por Agentes

En el capítulo anterior, discutimos la escritura de código con la ayuda de un Agente. Ahora nos enfocaremos en una habilidad igualmente importante: la lectura crítica de código, identificar las decisiones incrustadas en él y comprender su costo de ingeniería.

Leer código no es solo entender sintaxis. Es un intento de descubrir las decisiones incrustadas en él. Cuando leemos código escrito por un humano o un Agente, no solo preguntamos si funciona, sino qué problema el escritor intentó resolver, qué suposiciones fueron incrustadas en la implementación, y cuál es el costo futuro de las elecciones hechas en el camino.

A medida que la escritura de código se vuelve más rápida, más barata y más accesible, el valor del juicio de ingeniería aumenta. Un Agente puede producir código limpio, organizado y legible, y aún así introducir decisiones de diseño débiles, responsabilidades mezcladas o manejo ingenuo de estados de fallo en el sistema. Por lo tanto, el propósito de este capítulo no es solo leer líneas de código, sino leer intenciones, suposiciones, compensaciones y riesgos.

**En este capítulo, aprenderemos a leer código en cuatro capas:**

- Qué hace

- Qué problema intenta resolver

- Qué suposiciones están incrustadas en él

- Cuál es el costo de ingeniería que resulta de él

## Cómo Entender del Código Qué Problema Intentaron Resolver

Después de verificar qué hace realmente el código, la siguiente pregunta es qué problema el escritor intentó resolver. Esto ya no es solo leer líneas, sino un intento de entender el diagnóstico detrás de ellas.

El código no es una secuencia neutral de comandos. Refleja la manera en que quien lo escribió entendió el problema en ese momento. Por lo tanto, cuando leemos código existente, la primera tarea no es solo entender cómo funciona, sino identificar cómo se definió el problema. ¿El escritor intentó resolver un síntoma local, o abordar una causa más amplia dentro del sistema?

Esta distinción es especialmente importante cuando se trabaja con agentes de IA. Supongamos que la aplicación Lomda comienza a responder lentamente bajo carga. Si le pedimos al Agente que "arregle la lentitud", podría devolver un Pull Request con cambios en docenas de archivos. A primera vista, el código podría verse organizado, consistente e incluso convincente. En cada componente se agregó un pequeño ajuste, en cada pantalla se insertó un Cache local, y en cada punto se realizó una mejora específica.

Pero aquí es exactamente donde se requiere lectura crítica. No es suficiente ver que el código "mejoró algo." Necesitas preguntar qué problema se diagnosticó aquí. Si el mismo patrón se repite una y otra vez en muchos lugares, el escritor puede no haber identificado una sola causa central, sino trató síntomas locales. En tal caso, la solución no es evidencia de comprensión profunda del sistema, sino evidencia de que el problema se interpretó como una colección de desaceleraciones separadas.

Un programador experimentado verificará inmediatamente si la fuente del problema está realmente en un lugar más central, como una consulta ineficiente en la capa de datos, una estructura de carga incorrecta, o un límite de responsabilidad problemático entre componentes. Si ese es el caso, una corrección distribuida en docenas de archivos no es una solución sistémica. Solo oculta el hecho de que el problema real nunca se abordó.

Por lo tanto, cuando leas código, primero busca el diagnóstico incrustado en él. La repetición es una señal importante. Si la misma corrección aparece una y otra vez con ligeras variaciones, el escritor probablemente resolvió donde se sintió el dolor, pero no la causa que lo creó. Por otro lado, cuando la solución se concentra en un punto, o un pequeño número de puntos con un rol claro, hay una mayor probabilidad de que el problema se entendió a nivel sistémico.

En otras palabras, la pregunta no es solo qué se arregló, sino cómo se definió el problema. La lectura correcta de código comienza con identificar el diagnóstico que lo generó.

Cuando intentes entender qué problema resuelve el código, haz tres preguntas:

- ¿La solución está concentrada o distribuida?

- ¿Aborda la causa o el síntoma?

- ¿Cambia la estructura del sistema o solo agrega correcciones locales?

## Cómo Identificar Decisiones de Diseño en Código que Parece Simple

Después de entender qué problema intenta resolver el código y qué decisiones fueron incrustadas en él, necesitamos hacer una pregunta adicional: ¿Es esta solución realmente correcta para nuestro sistema?

Aquí es importante distinguir entre dos cosas muy diferentes: código legible y una solución correcta.

El código legible es código fácil de seguir. Los nombres de variables son claros, la estructura está organizada y el flujo parece lógico.

Pero una solución correcta se mide de manera diferente. Se examina no solo por su forma, sino por su ajuste a la realidad en la que opera el sistema: estructura de datos, requisitos de sincronización, límites de responsabilidad, estados de fallo y costo de mantenimiento a lo largo del tiempo.

Aquí es exactamente donde es fácil cometer errores al trabajar con agentes de IA. Un Agente tiende a producir código que se ve muy bien a primera vista. Adhiere a estructura, nombres, separación sintáctica, y a veces también al uso de patrones aceptados de bibliotecas y frameworks familiares. Pero el ajuste sintáctico o estilístico no es garantía de que la solución se ajuste al sistema que tenemos delante.

Volvamos al ejemplo de Lomda. Supongamos que el Agente agregó un mecanismo de Cache local en cada uno de los componentes de interfaz, y en cada archivo el código se ve organizado y limpio. Incluso puedes ver mejora local en la respuesta de la pantalla. Pero si los datos en el sistema se supone que son consistentes en tiempo real, la distribución de mecanismos de Cache locales en muchos componentes crea una fuente de inconsistencia. Cada componente puede mantener una imagen ligeramente diferente del estado real.

En tal caso, el problema no está en la legibilidad del código. Al contrario. Precisamente su legibilidad puede adormecer la crítica. El código se ve bien, y por lo tanto es fácil aprobarlo demasiado rápido. Pero en una lectura de ingeniería más profunda, queda claro que la solución no es correcta, porque daña la consistencia del sistema y distribuye responsabilidad en lugar de concentrarla.

Por lo tanto, cuando leas código que se ve limpio y convincente, no solo preguntes si es comprensible. Pregunta si se ajusta. ¿Preserva las restricciones importantes del sistema? ¿Previene la duplicación de datos? ¿Considera estados de fallo? ¿Es correcto solo para el ejemplo frente a tus ojos, o también para la realidad más amplia en la que operará el sistema?

La legibilidad es un rasgo importante, pero no es la medida última. El buen código necesita ser tanto legible como correcto. Cuando estas dos cosas entran en conflicto, la corrección de ingeniería tiene precedencia sobre la estética local.

**Cuando el código se ve demasiado bien, eso no es una señal para aprobarlo más rápido. A veces es precisamente una señal para detenerse y examinarlo más profundamente.**

## Cómo Identificar Puntos de Riesgo Típicos en Código Escrito por un Agente

Después de examinar qué hace el código, qué problema intenta resolver, qué suposiciones fueron incrustadas en él, y si la solución realmente se ajusta al sistema, podemos pasar a la siguiente etapa: escaneo enfocado de puntos de riesgo típicos.

Es importante ser preciso: el Agente no inventa un nuevo tipo de código débil. Los humanos también escriben código que maneja bien solo un estado donde todo funciona como se espera, mezcla responsabilidades, o se basa en suposiciones no probadas. La diferencia es que el Agente es capaz de producir tal código a alta velocidad, en amplio alcance, y en una forma que se ve limpia y convincente.

Por lo tanto, al leer código creado con la ayuda de un Agente, vale la pena realizar un escaneo sistemático de varios puntos de riesgo que se repiten una y otra vez.

**El primer punto de riesgo es enfocarse solo en el estado donde todo funciona como se espera.**

Los Agentes tienden a tener éxito principalmente en el caso donde todo funciona como esperábamos. Escriben la lógica principal, pero no siempre verifican qué sucede cuando faltan datos, un servicio externo no responde, la entrada es inválida, o el estado del sistema es ligeramente diferente del ejemplo en el que se basaron. Por lo tanto, una de las primeras preguntas a hacer es: qué sucederá aquí cuando todo no vaya según el plan.

**El segundo es mezclar responsabilidades.**

El Agente a menudo elegirá el camino más corto para completar una tarea. Si se requiere cambiar la UI, puede agregar obtención de datos, validación, o cálculo de negocio en el mismo lugar. El resultado a veces parece eficiente a corto plazo, pero en la práctica difumina los límites entre las capas del sistema. Por lo tanto, es importante verificar no solo si el código funciona, sino también si la responsabilidad se colocó en el lugar correcto.

**El tercer punto de riesgo es la falta de aislamiento.**

El buen código debe ser comprensible y testeable incluso fuera del contexto amplio en el que fue escrito. Cuando el código nuevo depende del estado global, variables externas, o dependencia indirecta de otro componente, se vuelve más frágil y más difícil de probar. Los Agentes a menudo usan tales atajos para hacer que el código funcione rápidamente, por lo que es importante preguntar: ¿puede este componente ser entendido, ejecutado y probado sin depender del resto del sistema?

**El cuarto son las suposiciones implícitas.**

Este es uno de los riesgos más silenciosos. A veces el Agente asume que la estructura de datos es uniforme en todo el sistema, que todas las llamadas devolverán la misma estructura, o que cada componente consume los mismos campos. Estas suposiciones no están escritas explícitamente, por lo que también son difíciles de identificar a primera vista. La manera de exponerlas es preguntar: qué debe ser verdad para que este código funcione, y ¿esa cosa está realmente garantizada en nuestro sistema?

En lugar de solo preguntar "¿funciona esto?", es mejor hacer cuatro preguntas de escaneo fijas:

Qué sucede aquí cuando las cosas no van como se espera

¿Está la responsabilidad en el lugar correcto?

¿Es el código testeable y comprensible sin depender del resto del sistema?

¿Qué suposiciones implícitas deben ser verdaderas para que funcione?

Estas no son solo preguntas para código escrito por un Agente. Estas son preguntas de lectura de ingeniería en general. Pero cuando el código se crea rápida y relativamente fácilmente, y en amplio alcance, se vuelven aún más importantes.

## Cómo Leer Código como Leer Decisiones, No Leer Líneas

En esta etapa, llegamos al corazón del capítulo. La lectura de código de alto nivel no es un paso sistemático de línea en línea, sino un intento de entender qué decisiones crearon la estructura que vemos ante nosotros.

Cuando leemos código solo a nivel de sintaxis, preguntamos qué hace. Cuando leemos código a nivel de ingeniería, preguntamos por qué está construido de esta manera y no de otra. Esta es la transición de la lectura técnica a la lectura de decisiones.

Para leer código de esta manera, vale la pena adoptar una forma de pensar simple: no conformarse con lo que está frente a tus ojos, sino preguntar qué opciones fueron rechazadas en el camino. Cada línea de código representa una elección.

Si la lógica está dentro del Handler, se decidió no extraerla a una capa de servicio. Si una función devuelve más información de la necesaria, se decidió no estrechar sus límites de responsabilidad. Si no hay manejo explícito de fallos, en realidad se decidió asumir que todo funcionará como se espera.

Tomemos por ejemplo la línea:

const student = await db.students.findById(studentId);

En lectura técnica, esto es simplemente una obtención de datos de estudiante. Pero en lectura de decisiones, esta línea dice algo más amplio: la capa de API accede directamente a la capa de datos. Esta es una decisión de diseño, porque renuncia a una capa de mediación que podría haber concentrado validación, Cache, o lógica de negocio adicional. Una vez que lees el código de esta manera, ya no ves solo una acción única, sino una elección estructural.

Lo mismo es verdad cuando el Agente cambia docenas de archivos para "mejorar el rendimiento." En lectura superficial, ves muchas pequeñas mejoras. En lectura de ingeniería, ves una gran decisión: la responsabilidad de manejar el rendimiento fue distribuida en muchas partes del sistema. Esto ya no es solo una línea de código, sino una concepción completa del problema y cómo manejarlo.

Por lo tanto, en lugar de leer código como una secuencia de instrucciones, vale la pena leerlo a través de varias preguntas fijas:

Por qué este código está ubicado precisamente aquí

Qué responsabilidad se le colocó en la práctica
