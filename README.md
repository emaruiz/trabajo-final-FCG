# Sistema solar

Trabajo final realizado para la materia Fundamentos de la Computación Gráfica donde hice un sistema solar 3D en una web. Esta hecho con HTML, CSS, JavaScript, WebGL y GLSL.

## Requisitos para visualizar

Tener instalado un navegador web que soporte WebGL version 1.

## ¿Cómo visualizarlo?

Abrir el archivo index.html con un navegador web.

## Instrucciones de uso

La idea es que en la pantalla se pueda ver un objeto 3D que representa al sol y el resto de objetos 3D a los planetas. Para el primero se puede elegir textura y tamaño. Mientras que para el resto se puede elegir textura, tamaño, activar traslación y darle un valor a la velocidad de traslación.

Entrando en detalle desde la interfaz se puede aplicar un efecto:
-  en todos los objetos:
    - elegir un modelo (archivos .obj) dentro de la carpeta models por medio del boton examinar
    - activar o desactivar todas las texturas para poder verlas o no por medio del checkbox
    - activar o desactivar la rotación sobre el eje Y por medio del checkbox
    - en caso de estar activada la rotación sobre el eje Y también se puede asignarle un valor por medio del control deslizante
    - activar o desactivar el intercambio de las coordenas Y por Z cuando se muestre cada uno de los modelos por medio del checkbox
- a cada objeto en particular:
    - elegir una textura (archivos .jpg) dentro de la carpeta models por medio del boton examinar
    - elegir un tamaño por medio del control deslizante
    - activar o desactivar la traslación por medio del checkbox
    - en caso de estar activada la traslación también se puede elegir un valor de velocidad por medio del control deslizante

Se recomienda elegir un modelo y activar las texturas para poder ver objetos 3D en pantalla. Y luego probar los demás efectos.
