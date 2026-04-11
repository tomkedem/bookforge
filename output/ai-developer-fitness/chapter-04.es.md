# Capítulo 3: Debugging Mental para un Sistema Donde Partes Fueron Escritas Automáticamente

En los capítulos anteriores, aprendimos a descomponer requisitos y leer código como leer decisiones. Ahora debemos hacer una pregunta más difícil: qué sucederá cuando este código comience a ejecutarse.

Cuando parte del código es escrito por un Agente, es muy fácil recibir un flujo que se ve correcto, organizado y convincente. Precisamente por esto, el programador debe preservar su capacidad de ingeniería: detenerse, ejecutar el flujo en su cabeza e identificar de antemano dónde el código que se ve localmente correcto va a romperse sistémicamente.

El código que se ve correcto dentro de un archivo aún no se ha probado. La prueba real comienza cuando encuentra tiempo, carga, competencia por recursos y fallos parciales. Aquí comienza el rol del debugging mental: la capacidad de identificar de antemano bajo qué condiciones se romperá.

**Cuando un Agente escribe rápido, la responsabilidad del programador no es escribir más, sino pensar mejor.**

## Seguimiento Lógico del Flujo de Ejecución

Cuando leemos código, es fácil entender cada línea por separado y sentir que todo está bien. Obtener, calcular, guardar. Todo está claro, todo está organizado. Pero un sistema no es una colección de líneas aisladas. Es una secuencia de acciones que ocurren en el tiempo.

El seguimiento lógico significa ejecutar en tu cabeza la cadena de eventos que el código crea, no solo como está escrito, sino como realmente ocurre dentro del sistema. Esta es una de las habilidades más importantes que el programador debe preservar, precisamente cuando parte del código es escrito por un Agente. El Agente tiende a completar bien la lógica local, pero no siempre tiene en cuenta cómo el tiempo afecta su corrección.

Examinemos un flujo aparentemente simple para actualizar los puntos de crédito de un estudiante en Lomda:

const student = await db.students.findById(id);

const newBalance = student.credits + awardAmount;

await db.students.update(id, { credits: newBalance });

A primera vista, el código se ve completamente correcto. Es legible, organizado y hace exactamente lo que se solicitó. Pero el seguimiento lógico no solo pregunta qué hace el código, sino qué podría suceder entre paso y paso.

Aquí se crea una brecha peligrosa: el código lee el estado de puntos, calcula un nuevo valor, y solo entonces lo escribe de vuelta. Si durante ese período de tiempo otra operación actualizó los mismos puntos, el cálculo ya se está basando en información que se ha vuelto obsoleta. El resultado es sobrescribir una actualización anterior y pérdida de información.

El problema, entonces, no está en el cálculo mismo, sino en la brecha entre leer y escribir. Mientras leamos el código solo como una secuencia sintáctica, esta brecha es casi invisible. Una vez que ejecutamos el flujo en nuestra cabeza, inmediatamente se convierte en un punto de ruptura.

Aquí es exactamente donde se prueba la capacidad de ingeniería del programador. Un Agente puede producir código que se ve correcto, porque cierra bien la lógica local. El programador, por otro lado, debe preguntar qué más podría cambiar mientras la función se está ejecutando. Esta es la diferencia entre escritura rápida y comprensión sistémica.

Por lo tanto, cuando realizas seguimiento lógico, siempre pregunta:

Dónde lee el código el estado existente

Cuánto tiempo pasa hasta que escribe el nuevo estado

Qué más podría cambiar durante ese período de tiempo

Qué sucederá si el valor leído ya no es actual en el momento de escribir

En sistemas simples, esta brecha puede no causar daño visible. En sistemas reales, es una de las fuentes más comunes de actualizaciones perdidas, corrupción de datos y bugs muy difíciles de reproducir.

## Identificar Estados Paralelos

Si en la sección anterior examinamos qué sucede dentro de un único flujo a lo largo del tiempo, aquí surge una pregunta diferente: qué sucede cuando dos flujos diferentes operan al mismo tiempo sobre los mismos datos.

Este es uno de los lugares donde el código escrito por un Agente puede verse muy correcto, pero ser frágil en la práctica. El Agente tiende a resolver bien la lógica de una única solicitud. El programador debe verificar qué sucederá cuando dos solicitudes diferentes intenten realizar la misma acción casi en el mismo momento.

Examinemos un ejemplo simple de compra de un curso:

const student = await db.students.findById(id);

if (student.credits >= coursePrice) {

// El Agente asume que nada cambia aquí...

await db.students.update(id, {

credits: student.credits - coursePrice

});

return NextResponse.json({ success: true });

}

A primera vista, la lógica se ve correcta. Si el estudiante tiene suficientes puntos, el sistema aprueba la compra y deduce el precio del saldo. Pero la lectura de ingeniería no se detiene en la condición misma. Pregunta qué sucederá si dos solicitudes diferentes llegan casi al mismo tiempo.

Supongamos que el estudiante hizo clic dos veces en el botón de compra, o abrió dos pestañas diferentes y realizó la misma acción en paralelo. Ambas solicitudes leerán el mismo estado inicial, ambas verán que hay suficientes puntos, y ambas pasarán la condición. De aquí en adelante, cada una actuará como si estuviera sola en el sistema.

El resultado es un error lógico: dos acciones diferentes fueron aprobadas basándose en el mismo estado, aunque solo una de ellas debería haber pasado. El problema no está en la condición misma, sino en la suposición oculta de que el estado verificado permanecerá correcto hasta el momento de la actualización.

Aquí nuevamente se prueba la capacidad de ingeniería del programador. Un Agente puede producir código legible y convincente para una única solicitud. El programador necesita preguntar si la misma solicitud podría ejecutarse dos veces, y si dos solicitudes así podrían tomar una decisión como si estuvieran solas en el mundo.

Por lo tanto, cuando leas código, pregunta:

¿Pueden dos solicitudes diferentes ejecutarse aquí en paralelo?

¿Ambas dependen del mismo estado inicial?

¿Pueden ambas tomar una decisión como si fueran las únicas en el sistema?

¿Qué impedirá que ambas realicen una actualización doble o contradictoria?

En un sistema pequeño, esto puede parecer un caso límite. En un sistema real, es una de las fuentes más comunes de duplicaciones, inconsistencia y datos incorrectos.

## Identificar Bloqueos Lógicos

Hay casos donde el problema no es un cálculo incorrecto, sino un estado donde diferentes procesos se impiden mutuamente progresar. Cada uno de ellos mantiene cierto recurso y espera otro recurso ya tomado por otro proceso.

Este es un tipo de fallo muy fácil de pasar por alto cuando se lee cada función por separado. Un Agente puede escribir cada flujo por sí mismo en forma completamente correcta. La capacidad de ingeniería del programador se prueba en la capacidad de ver cómo varios flujos diferentes se encuentran entre sí.

Supongamos que en el sistema Lomda hay dos procesos diferentes. Uno cierra un curso, y el otro actualiza el perfil de un estudiante.

**El proceso de cierre de curso funciona así:**

Bloquea el registro del curso

Actualiza las calificaciones de los estudiantes

Libera el bloqueo

**El proceso de actualización de perfil de estudiante funciona así:**

Bloquea el registro del estudiante

Actualiza los cursos en los que está inscrito

Libera el bloqueo

Ahora intenta ejecutar ambos flujos en tu cabeza al mismo tiempo. Un proceso ya tomó el curso y está esperando al estudiante. Otro proceso ya tomó al estudiante y está esperando el curso. Cada uno de ellos mantiene parte de los recursos y espera la otra parte. En tal estado, el sistema puede quedarse atascado.

Para identificar un bloqueo lógico, no es suficiente leer qué hace cada función por separado. Necesitas mapear el orden de acceso a los recursos. Una vez que dos flujos diferentes acceden a los mismos recursos en orden inverso, se crea un riesgo real de bloqueo.

Por lo tanto, cuando leas código que involucra bloqueos, colas, o espera de recursos externos, pregunta:

¿Cuáles son los recursos que el proceso toma en el camino?

¿En qué orden los toma?

¿Hay otro flujo que toma los mismos recursos en un orden diferente?

¿Qué sucederá si ambos procesos se ejecutan juntos?

Aquí nuevamente se expresa la diferencia entre código que se ve localmente correcto y un sistema operando bajo condiciones reales. Un Agente puede completar exitosamente el flujo de cada función por sí misma. El programador debe verificar si todos estos flujos aún pueden progresar cuando operan juntos.

Un bloqueo lógico no siempre aparece como un mensaje de error claro. A veces simplemente se verá como una solicitud que no termina, una pantalla que no progresa, o un sistema que parece congelado sin explicar por qué.

## Identificar Multiplicación de Estados No Controlada

No todo fallo proviene del timing, competencia por recursos o bloqueo. A veces el problema es más silencioso: el sistema permite demasiados estados, y algunos de ellos nunca debieron existir.

Este es uno de los lugares donde el debugging mental se vuelve especialmente esencial. Cuando leemos código, no solo verificamos qué cambió en una línea particular, sino qué espacio de estados crea este cambio. Si el sistema permite demasiadas combinaciones de flags, campos y condiciones, puede entrar en estados que el código mismo nunca fue diseñado para manejar.

Este también es un patrón típico del código escrito por un Agente. El Agente tiende a resolver cada requisito específico agregando otro campo, otra condición u otro flag. Desde una perspectiva local, cada adición así se ve razonable. La capacidad de ingeniería del programador se prueba en la capacidad de ver qué sucede cuando todas estas adiciones se acumulan en un sistema.

Examinemos por ejemplo una entidad de estudiante en el sistema Lomda. Supongamos que con el tiempo se le agregaron tres campos:

- isActive

- isSuspended

- hasGraduated

Cada uno de ellos se ve razonable en sí mismo. Cada uno resuelve una necesidad específica. Pero una vez que los miramos juntos, comienza el problema. ¿Puede un estudiante estar tanto activo como graduado? ¿Puede un estudiante suspendido aún considerarse activo? ¿La graduación cancela la suspensión, o son dos estados independientes?

Aquí comienza la multiplicación de estados no controlada. El sistema ya no mantiene un estado claro, sino una colección de señales locales que pueden combinarse de maneras contradictorias. En tal momento, incluso si cada actualización individual se ve correcta, la imagen general puede volverse inconsistente.
