# Capítulo 1: Descomponer Problemas Antes de Activar el Agente

En el trabajo de desarrollo regular, un requisito vago detendría el trabajo. Un desarrollador humano no puede escribir buen código cuando no entiende completamente cuál es el problema, cuáles son las restricciones y cómo luce el éxito.

Un Agente no se detiene. Adivina.

Por lo tanto, el paso más crítico al trabajar con IA ocurre antes del primer prompt. Antes de solicitar código, necesitas detenerte, descomponer la tarea y transformar un requisito de negocio en un contrato de ingeniería claro.

El énfasis en este capítulo no está en cómo pedirle al Agente que trabaje, sino en cómo definir los límites del juego por adelantado, para que no construya una solución convincente pero incorrecta para ti.

## La Trampa del Requisito Vago: Entre el Fracaso Arquitectónico y la Ilusión del Output

Un requisito vago es cualquier solicitud que deja al Agente libre para determinar tu arquitectura por ti. En el mundo del desarrollo tradicional, tal requisito simplemente se quedaría atascado. Un desarrollador humano no puede adivinar lo que el sistema necesita sin hacer preguntas aclaratorias.

Un Agente opera de manera diferente. Tiende a no detenerse y alertar que faltan datos de ingeniería, sino a completar lo que falta según el camino más razonable y producir código que parece funcionar. Aquí es exactamente donde está la trampa: mientras construye una estructura de sistema defectuosa, también crea la impresión de que todo está bien.

A nivel arquitectónico, un requisito vago hace que el Agente construya una única solución que hace todo. Cuando no se definen límites claros, concentra lógica de negocio, acceso a datos y trabajo con servicios externos en la misma implementación. El resultado es un fuerte acoplamiento entre partes que deberían haber permanecido separadas.

**Sobre el Sistema Compañero del Libro: Lomda**
A lo largo del libro, utilizaremos un sistema de ejemplo llamado Lomda, una plataforma de aprendizaje construida para permitirnos discutir problemas reales de ingeniería dentro de un contexto consistente. En lugar de cambiar a un sistema diferente en cada capítulo, volveremos una y otra vez al mismo sistema, y así podremos ver cómo las decisiones locales afectan la arquitectura, los flujos de trabajo, los datos y la experiencia del usuario a lo largo del tiempo.

Lomda no es importante en sí misma, sino como marco de trabajo. Nos da un lenguaje común y ejemplos concretos como: lecciones, estudiantes, calificaciones, resúmenes, alertas, colas y servicios de IA.

A través de este sistema, examinaremos cómo trabajar correctamente con Agentes, cómo descomponer problemas, cómo identificar suposiciones ocultas y cómo mantener el juicio de ingeniería incluso cuando la implementación se escribe rápidamente.

**Examinemos un requisito común en el sistema Lomda:**

"Necesito un servicio que envíe resúmenes de lecciones a los estudiantes por correo electrónico al final de cada día."

Sin descomposición temprana, el Agente escribirá un script que realiza las siguientes acciones en secuencia: consulta la base de datos para saber quién estudió, extrae el contenido, llama a la API de OpenAI para generar un resumen y envía el correo a través de un servicio externo.

El problema comenzará cuando quieras cambiar algo. Si quieres reemplazar el proveedor de correo, tendrás que tocar el código que resumió las lecciones. Si quieres mover la generación de resúmenes a procesamiento asíncrono a través de una cola, descubrirás que el código que el Agente creó está tan entrelazado que el cambio requerirá reescribir todo. La máquina no te construyó un servicio mantenible. Construyó una caja negra rígida.

**El Nivel Perceptual: Cuando el Código se Ve Demasiado Correcto**

El riesgo de requisitos vagos se agrava por la ilusión del output convincente. Los Agentes sobresalen en escribir código que se ve extremadamente profesional: los nombres de variables son precisos, la estructura es limpia y la sintaxis es completamente correcta. Esta ilusión debilita nuestros mecanismos críticos. Cuando un programador recibe tal código en segundos, es muy fácil aprobarlo demasiado rápido solo porque parece listo.

En el sistema Lomda, le pedimos al Agente:

"Agrega un mecanismo que limite al estudiante a solo tres intentos para resolver un examen."

El Agente propuso la siguiente solución:

**Algoritmo: Limitación de Intentos (Implementación del Agente)**

- Recibir solicitud de examen del estudiante.

- Verificar en una variable local en la memoria del servidor cuántos intentos se realizaron.

- Si el contador es menor que 3, ejecutar el examen e incrementar el contador.

- De lo contrario: bloquear la solicitud.

Este algoritmo pasará cada prueba en tu computadora personal. Se verá perfecto. Pero el problema es que el Agente construyó una solución para un solo servidor.

En el sistema real de Lomda, el servicio corre en diez servidores diferentes detrás de un Load Balancer. Un estudiante podrá hacer treinta intentos, tres en cada servidor, porque la información no se almacena en una ubicación central.

El Agente no cometió un error en el sentido clásico. Simplemente resolvió el problema de la manera más fácil que le permite producir output convincente que parece correcto. La velocidad a la que se creó el código nos dificulta hacer las preguntas difíciles sobre infraestructura y casos límite. Un requisito vago nos hace aceptar arquitectura frágil solo porque está envuelta en un bonito empaque de código aparentemente funcional.

La lección es clara: cuando renunciamos a la etapa de descomposición, realmente no estamos ahorrando tiempo. Simplemente estamos transfiriendo al Agente el derecho de tomar decisiones arquitectónicas por nosotros.

## Proceso de Descomposición Sistemática: Requisito, Subproblemas, Restricciones y Criterios de Éxito

Para evitar caer en la trampa donde el Agente simplemente completa lo que falta según su propia manera, debemos adoptar una disciplina de descomposición de problemas. La descomposición no es solo un paso técnico. Es tu manera de definir límites de trabajo, restricciones y condiciones bajo las cuales opera el Agente.

El proceso consiste en cuatro anclas que deben aparecer en cada tarea que entregas al Agente para ejecución automática:

**A. Definición del Requisito**

El requisito es el objetivo de negocio, pero en lenguaje de ingeniería claro.

En lugar de decirle al Agente "Quiero un sistema de alertas,"

Define la esencia: "Crear un mecanismo asíncrono para actualizar a los usuarios sobre eventos en el sistema de aprendizaje."

Esta redacción dirige al Agente al hecho de que esto no es solo un mensaje emergente, sino un mecanismo que necesita correr en segundo plano.

**B. Aislar Subproblemas**

Aquí es donde está el corazón del trabajo arquitectónico. El error común es pedirle al Agente que resuelva el problema como una sola pieza. La descomposición correcta separa lógica de negocio, acceso a datos e interfaz externa.

En el sistema Lomda, si queremos agregar una característica de "calcular un promedio ponderado para un estudiante incluyendo bonificaciones por persistencia," la descomposición sistemática se vería así:

- **Subproblema 1: El Algoritmo**
Una función que recibe una lista de calificaciones y parámetros de tiempo, y devuelve un número, es decir, la calificación. El Agente escribirá solo la lógica matemática. No necesita saber de dónde vienen los datos.

- **Subproblema 2: Capa de Datos**
Un servicio responsable de recopilar datos relevantes de la base de datos y Cache.

- **Subproblema 3: Capa de Coordinación**
La capa de coordinación conecta las partes y decide cuándo activar el cálculo.

**C. Definir Restricciones**

Las restricciones son tus muros protectores. El Agente tiende a elegir la solución más fácil, incluso si no se ajusta a tu infraestructura. Debes definir limitaciones por adelantado:

**Restricciones de Infraestructura:** "La solución debe correr dentro de una función en la nube (Lambda) con un límite de memoria de 256MB."

**Restricciones de Seguridad:** "Está prohibido exponer información identificable (PII) en los logs del sistema."

**Restricciones de Dependencias:** "Solo se deben usar bibliotecas estándar del lenguaje sin importar paquetes externos adicionales."

**D. Criterios de Éxito y Contratos de Output**

No le preguntes al Agente "qué piensas de la solución."

Define exactamente cómo luce una solución correcta usando un contrato. Define la estructura exacta del objeto de retorno.

Por ejemplo: "El output debe ser un objeto JSON que contenga la clave status como booleano, y calculated_grade como número decimal. Cualquier otro formato se considerará un fallo en la ejecución de la tarea."

Usar un contrato claro y bien definido te permite ejecutar una prueba automática sobre lo que el Agente produce antes de integrarlo en el código fuente.

## Identificar Suposiciones Ocultas que el Agente Completará por su Cuenta

Una de las características centrales de los modelos de lenguaje es la tendencia a completar lo que falta. A veces el Agente efectivamente se detendrá, preguntará qué quisiste decir, o presentará varias suposiciones posibles para elegir. Pero no puedes confiar en que siempre identificará por sí mismo cuándo falta información crítica. En lugares donde no se definieron límites claros, aún puede completar lo que falta según el camino más razonable que ha visto antes.

Aquí es exactamente donde comienza el problema. Las suposiciones que el Agente completa no se basan en tu sistema, tus limitaciones de infraestructura o la historia arquitectónica del producto. Se basan en el patrón más general que le pareció razonable.

Las suposiciones ocultas son problemas esperando el momento en que el sistema encuentre condiciones reales. El código se ve correcto, corre, e incluso puede pasar pruebas unitarias básicas. Pero en la práctica, se apoya en escenarios demasiado optimistas que el Agente eligió para cerrar las brechas que no se le definieron.

Analicemos un ejemplo del sistema Lomda. Supongamos que le pediste al Agente: "Escribe un servicio que reciba un archivo PDF de una conferencia y extraiga texto de él para generar un resumen para el estudiante."

El Agente puede producir rápidamente código que se ve profesional, claro y convincente. Pero incluso si hace una o dos preguntas en el camino, todavía es muy posible que complete por su cuenta varias suposiciones críticas que no se declararon explícitamente.

El código que produce puede usar una biblioteca común de procesamiento de PDF y verse completamente correcto. En la práctica, puede ocultar tres suposiciones ocultas críticas:

- **Suposición de Memoria**
El Agente asume que el archivo siempre cabrá en la RAM del servidor de una vez. Si un estudiante sube un PDF de 500 páginas con imágenes de alta resolución, el servidor puede colapsar con un error de Out of Memory. El Agente no planeó un mecanismo de lectura por lotes porque no lo definiste explícitamente como restricción.

- **Suposición del Tipo de Contenido**
El Agente asume que el texto en el PDF siempre es extraíble. No consideró un PDF escaneado como imagen que requiere OCR. Si el archivo está escaneado, el servicio puede devolver una cadena vacía o texto incoherente sin alertar del problema.

- **Suposición de Tiempo de Respuesta**
El Agente escribió una función síncrona que espera hasta que la extracción esté completa. En un sistema moderno, si tal operación toma más de diez segundos, lo cual es bastante posible con un PDF pesado, el Gateway puede desconectar. El Agente asumió que la operación siempre terminaría lo suficientemente rápido como para no bloquear el servidor.

**Cómo Cazar Suposiciones Ocultas**

Como programadores, tu rol en la descomposición de tareas es revisar la solución que el Agente propone y preguntar:

**¿Qué asumió la máquina que no sabe sobre nosotros?**

Para reducir el espacio de adivinanza del Agente, debes definir restricciones de límite ya en la etapa de descomposición:

"Los archivos de hasta 1GB deben manejarse usando solo Streaming."

"En caso de un PDF sin capa de texto, la función debe devolver un error UNSUPPORTED_FORMAT."

"El proceso de extracción debe realizarse asincrónicamente a través de un Background Job, con actualizaciones de estado en la base de datos."

Identificar suposiciones ocultas requiere que desarrolles escepticismo profesional. Debes asumir que el Agente a menudo gravitará hacia el camino de implementación más simple, y luego bloquear ese camino con definiciones técnicas explícitas.
