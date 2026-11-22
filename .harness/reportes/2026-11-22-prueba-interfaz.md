# Reporte — prueba de la interfaz en el navegador

Fecha: 2026-11-22 · Paso 3 de la skill `verificar-sitio` · Chrome (extensión Claude in Chrome)

## Cómo se hizo
- Servidor real (`python app.py`) en `http://127.0.0.1:5058` con base temporal (en la carpeta temporal de la sesión), `SEMILLA_DEMO=1` y un token de administrador propio de la prueba. No se tocó `datos.db` ni el archivo de secretos.
- Antes de abrir el navegador se creó por la API un evento con fecha 2020-01-01 para probar el filtro de eventos pasados.
- Datos de prueba: persona "Persona de Prueba", documento 12345678, correo `prueba@correo.com`.

## Resultados (todo lo listado se vio funcionando)
| Qué | Resultado |
|-----|-----------|
| Catálogo | 3 tarjetas (2 eventos y 1 servicio) y el evento pasado NO aparece; sin errores en consola |
| Filtros Todos, Eventos, Servicios | Muestran 3, 2 y 1 tarjetas; `aria-pressed` cambia bien |
| Formulario de reserva | Abre con el evento correcto; el total se recalcula (2 x 30.000 = 60.000 COP) |
| Validación del servidor | Con documento "1" muestra el error bajo "Documento", el aviso general, mantiene el diálogo abierto y reactiva el botón |
| Reserva válida | Redirige al comprobante: código `RES-...`, datos del titular, evento, cantidad, total; la URL solo lleva el código |
| Cupos | Taller de fotografía bajó de 25 a 23 |
| Consulta con correo incorrecto | "No encontramos una reserva con esos datos." y vuelve a pedir el correo |
| Consulta con correo correcto | Muestra el comprobante completo |
| Panel `/admin.html` | Arranca con el login visible y el panel oculto; token malo da "Token de administrador inválido."; con token bueno el login desaparece (lección del atributo `hidden`) |
| Panel: listas | Muestra los 4 eventos (incluido el pasado) y la reserva |
| Ocultar y publicar | Ocultar quita el evento del catálogo público; publicar lo devuelve |
| Editar cupos | Servicio de 10 a 7; la API pública y la tabla coinciden |
| Registrar desde el formulario | Un servicio con `<img ... onerror=...>` en el nombre se muestra como texto, sin imágenes inyectadas y sin ejecutar el código, tanto en el panel como en el catálogo público |
| Botón Salir | Vuelve al login y borra el token de `sessionStorage` |

## Observaciones
- Mis primeros clics por coordenadas en los filtros no tuvieron efecto; con referencias (`ref`) funcionaron. Fue un fallo de mi manera de hacer clic, no de la página.
- La consola no mostró errores. Ojo: la herramienta empieza a registrar desde su primera llamada, así que errores de la primera carga podrían no verse.

## No cubierto
- Impresión del comprobante (no se pulsó "Imprimir o guardar como PDF").
- Diseño en pantalla de móvil (solo escritorio, ventana de 1366 px).
- Estado "Agotado", máximo de 10 por reserva en el campo cantidad y botón "Cancelar" del diálogo.
- Otros navegadores (solo Chrome).
