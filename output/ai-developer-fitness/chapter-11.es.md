# El Proyecto Final: Lomda Engineering Journey

Hemos llegado a la línea de meta del libro. El proyecto ante ustedes no es una prueba teórica ni un ejercicio académico. Esta es una simulación de un día de trabajo real de un desarrollador de software.

A lo largo del libro, se encontraron con Agents que pueden escribir código a velocidad impresionante. Aprendieron cómo dictarles dirección a través de prompts precisos, cómo identificar fallos arquitectónicos en código generado automáticamente y cómo proteger sistemas reales de errores que parecen pequeños pero pueden convertirse en desastres en producción.

Ahora todos estos principios convergen en el proyecto final, Lomda Engineering Journey.

Su objetivo no es solo hacer que el código funcione.

El objetivo es ejercer juicio de ingeniería.

El Agent está a su disposición como una herramienta de trabajo poderosa.

Pero la responsabilidad por el sistema, por la seguridad y por el servidor de producción sigue siendo únicamente suya.

**Preparaciones Preliminares: Configurando el Entorno de Trabajo**

El proyecto se realiza sobre el repositorio de GitHub que acompaña al libro.

Asegúrense de haber descargado la versión más reciente del repositorio en su entorno IDE.

Naveguen en el árbol de directorios a las nuevas adiciones bajo - app/api/final-project

y bajo - app/exercises/final-project.

## Etapa 1: Recibiendo un Requisito Vago y Descomponiendo el Problema

En el directorio app/exercises/final-project encontrarán el archivo TICKET-842.md.

El gerente de producto abrió allí un requisito urgente para agregar una ruta de API para un mecanismo de apelaciones estudiantiles antes del fin del semestre.

El instinto inicial es copiar este ticket al Agent y preguntar:
"Escríbeme una API Route en Next.js para esto."

No hagan eso.

**Su Tarea:**
Lean el requisito. Abran un archivo llamado QUESTIONS.md en el mismo directorio y escriban en él al menos cinco preguntas críticas de negocio y arquitectónicas que faltan en el requisito.

Por ejemplo:

¿La Ruta requiere verificación de identidad del profesor?

¿Qué pasa si el profesor hace clic dos veces por error?

¿Se puede enviar una apelación dos veces para el mismo examen?

Solo después de que estas preguntas estén claras para ustedes, procedan a la siguiente etapa.

## Etapa 2: Revisión de Código Hostil

Un desarrollador junior del equipo, que usó el Agent ciegamente, ya intentó resolver la tarea. Su código está en:

app/api/final-project/appeals-naive/route.ts

El código no muestra errores de TypeScript y parece correcto a primera vista, pero contiene riesgos de ingeniería severos.

**Su Tarea:**
Realicen lectura de código independiente y crítica. Encuentren al menos tres errores de profundidad en este archivo que podrían colapsar el sistema o crear una brecha de seguridad.

Pistas:

Verifiquen cómo el código accede a la base de datos.

Verifiquen cómo maneja el objeto JSON entrante.

Busquen falta de gestión de transacciones.

Agreguen sus comentarios como comentarios directos dentro del archivo.

## Etapa 3: Decisión Arquitectónica Bajo Carga

Antes de escribir la solución correcta, deben tomar una decisión arquitectónica.

Una aplicación Next.js ejecutándose en un entorno Serverless está limitada en tiempo de ejecución. Durante períodos de exámenes, miles de estudiantes pueden enviar una apelación. Si la actualización de base de datos y el envío de correo al profesor toman más de diez segundos, la API fallará.

**Su Tarea:**

Decidan si es mejor implementar la Ruta como una operación síncrona regular, o construir un mecanismo de Background Job o Cola.
