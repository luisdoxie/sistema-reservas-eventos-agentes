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
