# Lecciones — correcciones que no hay que repetir (sólo se agrega · 1-15 KB)

Formato obligatorio: **en qué situación, qué hacer y por qué**, en imperativo, empezando con "Cuando".
Si sólo describe lo que pasó, es bitácora, no lección.

Ejemplo que SIRVE:
> Cuando implementes validación de datos de entrada, definí el esquema ANTES de la función que lo usa, para no validar dos veces.

Ejemplo que NO sirve:
> Hubo un problema con la validación y se arregló.

## Lecciones del proyecto
<!-- Agregar abajo, una por línea, empezando con "- Cuando ..." -->
- Cuando el frontend oculte un elemento con el atributo `hidden`, agregá `[hidden] { display: none !important; }` en el CSS, porque una clase con `display: grid` (como `form.vertical`) anula `hidden` y el login seguía visible tras entrar (2026-11-17).
- Cuando una API reciba un dato personal solo para consultar (por ejemplo el correo), usá `POST` con cuerpo JSON y no un `GET` con query string, porque la URL queda en los logs del servidor; verificá con `grep` en el log (2026-11-17).
- Cuando un helper del DOM acepte atributos opcionales, ignorá los valores `null`, `undefined` y `false` antes de llamar a `setAttribute`, porque `disabled: null` escribía `disabled="null"` y dejaba el botón "Reservar" inactivo (2026-11-17).
- Cuando pruebes una pantalla, hacelo en el navegador además de los tests del backend, porque ninguna de las 18 pruebas de la API detectaba los dos fallos del frontend anteriores (2026-11-17).
- Cuando el pedido venga de una foto o diapositiva, buscá primero en el disco la plantilla o el material oficial antes de construir una herramienta propia, porque el `harness.py` armado solo con diapositivas no coincidía con el template oficial y hubo que rehacer el proyecto (2026-11-17).
- Cuando una regla de negocio rechace una acción (por ejemplo, reservar un evento ya ocurrido), aplicá el mismo filtro al listado que la ofrece, porque si no el usuario llena el formulario y recién al enviar recibe el error; escribí primero la prueba, mirala fallar y recién después corregí (2026-11-21).
- Cuando verifiques la sintaxis del JavaScript, corré `node --check` archivo por archivo con un bucle, porque con varios archivos en un solo comando Node revisa solo el primero y devuelve éxito aunque los demás estén rotos; lo comprobé con un archivo roto en la carpeta temporal (2026-11-22).
- Cuando un dato de configuración dependa del país o la región (moneda, formato de números, idioma), preguntá a la persona de qué país es antes de recomendar o cambiar nada, porque `COP` quedó por defecto sin que nadie lo decidiera y llegué a dar por hecho Colombia sin ninguna base en el proyecto (2026-11-22).
- Cuando levantes el servidor para probar en Chrome, elegí un puerto que el navegador no bloquee (evitá 5060 y 5061, de telefonía, y 6000), porque con el 5060 Chrome mostró una página de error aunque `curl` respondía bien, y con el 5071 funcionó (2026-11-22).
- Cuando necesites probar el diseño en ancho de móvil con Chrome, no confíes en `resize_window`: la ventana "cambió" pero el viewport siguió en 1366 px; cargá la página dentro de un iframe del ancho que quieras, porque ahí sí se aplican las reglas `@media` y se puede medir el desborde horizontal (2026-11-22).
- Cuando un hook de cierre deba ocurrir una vez por sesión, no lo enganches al evento `Stop` de Claude Code, porque `Stop` se dispara al terminar cada respuesta (22 `stop` contra 10 `start` en `hooks.log`) y llenó la bitácora de líneas "completar"; escribí solo en `hooks.log` o usá un evento de fin de sesión, y contá los eventos del log antes de suponer cuándo corre un hook (2026-11-24).
