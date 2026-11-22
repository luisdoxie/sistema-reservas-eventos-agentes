# Reglas del agente — FUENTE (este es el archivo que se edita)

> Capa: proyecto. Lo que aplique a todos los proyectos va al template, no acá.

## Rol del agente en este proyecto (1 línea)
Desarrolla y mantiene el sitio de reservas (backend Flask y frontend estático) con cambios pequeños, verificados con las pruebas.

## El proyecto
- Qué hace: sitio web para registrar eventos y ofrecer servicios en línea. Un usuario elige un evento o servicio, deja sus datos y recibe un comprobante de reserva. Una persona administradora registra y gestiona la oferta desde `/admin.html`.
- Stack y versiones: Python 3.14 (probado con 3.14.7), Flask 3.1, SQLite (módulo `sqlite3` de la biblioteca estándar). Frontend en HTML, CSS y JavaScript puro, sin compilación ni dependencias.
- Carpetas principales:
  - `backend/app.py`: validación, rutas, esquema y datos de demostración. Pruebas en `backend/tests/test_api.py`.
  - `frontend/`: `index.html` (catálogo y reserva), `comprobante.html`, `admin.html`. Las llamadas HTTP y utilidades compartidas están en `frontend/api.js`.
  - Flask sirve también `frontend/`: mismo origen, sin CORS.

## Al empezar cada sesión
1. Leer `HANDOFF.md` y `.agents/memory/ESTADO.md` (el hook de inicio los muestra).
2. Leer `.agents/memory/LECCIONES.md` y aplicarlas.

## Al trabajar: el ciclo (Clase 4)
Pensar (plan de 3 líneas) → Actuar → **Verificar** (tests, lint, `harness audit`, revisión del cambio) → Repetir si falla → **Aprender** (lección en imperativo en `LECCIONES.md`).
Usar la skill `ciclo-de-mejora`.

## Al terminar cada sesión
1. Actualizar `HANDOFF.md` y `memory/ESTADO.md` con la fecha.
2. Completar la línea de `memory/BITACORA.md` que deja el hook de fin.

## Reglas
- No declarar "verificado" algo que no se pudo ejecutar: escribir "no verificado" y por qué.
- No leer ni imprimir secretos (`.env`, claves, tokens). Las credenciales van en variables de entorno.
- Respetar `.agents/PERMISSIONS.md`.
- Cambios acotados: modificar solo lo pedido y no tocar otros archivos sin autorización.
- Si cambia el contrato de la API (`/api/eventos`, `/api/reservas`, `/api/reservas/consultar`, `/api/admin/*`), actualizar backend, frontend y `backend/tests/` en el mismo cambio.
- En el frontend, pintar siempre texto del usuario con `textContent` (helper `el()` de `api.js`), nunca con `innerHTML`.
- Los cupos se descuentan de forma atómica en el servidor (`UPDATE ... WHERE cupos >= cantidad`); nunca quedan negativos.
- No se reserva un evento ya ocurrido ni uno oculto. Máximo 10 por reserva.
- El comprobante guarda una copia de los datos del evento y el precio al reservar: editar el evento después no cambia comprobantes emitidos.
- Consultar un comprobante exige código y correo, por `POST` (el correo no debe ir en la URL ni en los logs). Si no coinciden, la respuesta es igual a la de un código inexistente.
- Las rutas `/api/admin/*` exigen `X-Admin-Token`. El token vive en `backend/.env` (`ADMIN_TOKEN`); no leerlo ni mostrarlo.
- El sitio es para Santa Cruz de la Sierra, Bolivia (decidido por la persona el 2026-11-22): moneda boliviano (BOB), que se muestra como `Bs 1.500`. Se configura con `MONEDA` y `FORMATO_MONEDA` de `frontend/api.js`; si cambia una, cambia la otra. Los precios son enteros (sin decimales).

## Mapa del harness
| Dimensión | Archivo |
|-----------|---------|
| 1-2 Tools y APIs | `.agents/TOOLS.md` |
| 3 Memoria | `.agents/memory/` + `HANDOFF.md` |
| 4 Archivos | este mapa |
| 5 Permisos | `.agents/PERMISSIONS.md` + `.claude/settings.json` |
| 6 Runtime | `.agents/RUNTIME.md` + `.agents/hooks/` |
