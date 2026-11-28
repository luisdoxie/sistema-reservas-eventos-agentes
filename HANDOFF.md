# HANDOFF — Traspaso

> **Fecha de este estado:** 2026-11-27 · **Quién lo escribió:** Claude Code (agente), en sesión con la persona responsable; pendiente de su revisión
> Si lo lees más de 2 semanas después de esa fecha, verificá antes de creer.
> Criterio: si mañana no sabrías por dónde seguir, este archivo está incompleto.

## Qué es el proyecto (1 línea)
Sitio web para registrar eventos y ofrecer servicios en línea: el usuario reserva y recibe un comprobante con sus datos; un administrador gestiona la oferta (Flask + SQLite + frontend en HTML/JS puro).

## Cómo correrlo
Todos los comandos, en PowerShell y desde `backend/`.

| Qué | Comando | ¿Verificado? (cómo) |
|-----|---------|---------------------|
| Instalar | `python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt -r requirements-dev.txt; if (-not (Test-Path .env)) { Copy-Item .env.example .env }` | Sí, en Git Bash el 2026-11-17: `venv` creado en esta carpeta; Flask 3.1.3, Werkzeug 3.1.9, Jinja2 3.1.6 y ruff 0.17.5 instalados |
| Ejecutar | `python app.py` → http://127.0.0.1:5000 (panel en `/admin.html`) | Sí, el 2026-11-17 desde esta carpeta (puerto 5057, base temporal): `/` y `/admin.html` 200, 3 eventos, reserva 201 con total, consulta con correo correcto 200 y con correo incorrecto 404, admin sin token 401 y con token 200. Interfaz probada en el navegador el 2026-11-22 desde esta carpeta (ver `.harness/reportes/2026-11-22-prueba-interfaz.md`) |
| Tests | `python -m unittest discover -s tests` | Sí: 21 pruebas OK el 2026-11-27, con el `venv` de esta carpeta |
| Lint | `python -m ruff check . --exclude venv` (Python) y, para la sintaxis del JavaScript, un `node --check` por archivo: `for f in ../frontend/*.js; do node --check "$f" || echo "FALLA $f"; done` | Sí el 2026-11-17: ruff "All checks passed" (se corrigieron 3 observaciones de estilo). Sí el 2026-11-22: los 4 archivos `.js` pasan `node --check` revisados uno por uno. Ojo: `node --check ../frontend/*.js` revisa solo el primer archivo, así que la comprobación del 2026-11-17 hecha con ese comando no cubría los 4. No hay linter de estilo para el JavaScript |

Además: `sh .agents/tests/test-hooks.sh` (desde la raíz) → 9 OK, 0 fallas el 2026-11-27, en Git Bash.

**Acceso desde otro equipo:** `127.0.0.1` solo sirve en la máquina donde corre el servidor. Para que otros equipos de la red entren, pon `APP_HOST=0.0.0.0` en `backend/.env` y usa `http://<IP-de-esta-máquina>:5000`. Verificado el 2026-11-17 con la IP de red de esta máquina; **no se probó desde un segundo equipo** ni se revisó el firewall de Windows, que puede bloquear el puerto. Sin HTTPS: el token de administrador viaja sin cifrar, así que solo en una red de confianza. Si llevas el proyecto a otra máquina, crea ahí un `venv` nuevo; el de esta carpeta no es portable.

## Estado real hoy
| Área | Estado | Verificado cómo |
|------|--------|-----------------|
| Catálogo de eventos y servicios, filtro por tipo; no lista eventos ya ocurridos (desde 2026-11-21) | Funciona | Navegador el 2026-11-22 (catálogo, filtros y evento pasado oculto) + prueba del backend |
| Reserva con descuento atómico de cupos, máximo 10 por reserva | Funciona | Pruebas del backend + navegador |
| Comprobante (código `RES-XXXXXXXX`, titular, evento, total) imprimible | Funciona | Navegador |
| Consulta del comprobante con código y correo (`POST /api/reservas/consultar`) | Funciona; el correo no va en la URL | Pruebas + navegador + log del servidor sin el correo |
| Panel `/admin.html` con token: resumen, registrar, editar completo, ajustar cupos, ocultar y ver y buscar reservas | Funciona | Navegador (2026-11-22) |
| Cuentas de usuario, pagos, envío del comprobante por correo, cancelación de reservas | No existe | — |
| Despliegue y producción | No existe; solo servidor de desarrollo de Flask | — |
| Pruebas del frontend | No hay automatizadas | Solo prueba manual |

## Decisiones tomadas
- 2026-11-27: el hook `stop` ya no escribe en `memory/BITACORA.md` (agregaba una línea vacía en cada respuesta); solo anota en `hooks.log`. La línea de la bitácora la escribe el agente al cerrar, con `reintentos=N` si la tarea tuvo verificación. Ciclo de la Clase 4 y tareas para la próxima clase en `.harness/reportes/2026-11-27-ciclo-clase4.md`. `stop.ps1` cambiado y probado por la persona sobre una carpeta temporal.

- 2026-11-22: el sitio es para Santa Cruz de la Sierra, Bolivia. Moneda: boliviano (BOB), mostrada como `Bs 1.500` (`MONEDA` y `FORMATO_MONEDA` en `frontend/api.js`). Los precios de demostración se pasaron a bolivianos (Bs 80, Bs 150 y Bs 1.500); solo se aplican a una base nueva, porque la semilla solo corre si la tabla está vacía. Probado en Chrome (catálogo, reserva, comprobante y panel admin). Las fechas siguen en 24 horas (`es`). Los precios siguen siendo enteros, sin centavos.

- 2026-11-22: mejora del frontend, nivel 1 (solo `frontend/`): portada, tarjetas con fecha en bloque e insignias de cupos, buscador, validación en el navegador, "Copiar código", y en el panel resumen, buscador de reservas y edición completa. Sin imágenes por evento, sin QR y sin cambios de API. Probado en Chrome en escritorio y en ancho de móvil (iframe); detalle y límites en `.harness/reportes/2026-11-22-mejora-frontend-nivel1.md`. No probado: tema claro, impresión, teléfono real ni lector de pantalla. Las reglas de validación del formulario existen ahora también en `frontend/index.js`: si cambian en `backend/app.py`, cambiarlas allí.

- 2026-11-22: publicado en GitHub como repositorio **público**: https://github.com/luisdoxie/sistema-reservas-eventos-agentes (rama `main`, licencia MIT, remoto `origin`). Antes de publicar se reescribió el historial para usar el correo "noreply" de GitHub y se sacaron del historial `IDENTIDAD.md` y `PREFERENCIAS.md`; siguen solo en esta carpeta (están en `.gitignore`). Los hashes de commits anteriores a esa fecha ya no existen. El README describe la arquitectura de agentes. `harness sync` NO se aplicó: la versión actual del template distribuye los archivos de otra forma y reemplazaría el `AGENTS.md` de la raíz; ese archivo se regeneró a mano (cabecera + `.agents/AGENTS.md`).

## Próximos pasos (en orden)
1. [x] Crear `backend/venv`, instalar dependencias, correr tests y lint, y arrancar el servidor en esta carpeta (hecho el 2026-11-17).
2. [ ] La persona confirma `memory/IDENTIDAD.md` y `memory/PREFERENCIAS.md` (son borradores).
3. [x] Regla movida de "preguntar" a "permitir" decidida y justificada en `.agents/PERMISSIONS.md`: tests y lint locales (2026-11-17).
4. [x] Skill propia `verificar-sitio` creada el 2026-11-22 en `.agents/skills/verificar-sitio/` (`SKILL.md` + `humo.sh`). Probada: `humo.sh` 14 OK con el servidor real y base temporal; sus pasos de pruebas y lint también pasan. Interfaz en el navegador probada el 2026-11-22 (reporte en `.harness/reportes/`). Las skills de `.agents/skills/` no aparecen en la lista de skills de Claude Code; para invocarla con `/verificar-sitio` habría que copiarla a `.claude/skills/`.
5. [x] `git init` y commit inicial hechos el 2026-11-21 (rama `main`, sin repositorio remoto). Commits del cambio de eventos pasados y de `.gitattributes` (`*.sh text eol=lf`, para que los hooks `.sh` no queden en CRLF) hechos el 2026-11-21.
6. [x] Ciclo completo hecho el 2026-11-21 (catálogo sin eventos pasados); reporte en `.harness/reportes/2026-11-21-eventos-pasados.md`.
7. [x] Propuesta de mejora al template escrita el 2026-11-24 en `.harness/propuestas/2026-11-24-hooks-y-deteccion-de-proyecto.md` (3 problemas con evidencia). No se envió ni se aplicó al template: falta que la persona la revise.
8. [x] Auditoría "después" guardada el 2026-11-27 en `.harness/auditorias/`, con `sh bin/harness.sh audit <proyecto>` de la plantilla en `documento/harness-template` (fuera de este repositorio). Sale "incompleto": no faltan archivos, y las 7 marcas son menciones de la palabra que busca (bitácora, propuesta y README). La entrega pide llegar a 0: la persona decide si se reescriben esas menciones o se corrige la auditoría.
9. [ ] La persona decide si lleva el cambio de `stop` a la plantilla (`seed/.agents/hooks/`), que conserva el fallo.
10. [x] Comprobado en una sesión real el 2026-11-27: 10 `stop` en `hooks.log` después del cambio y ninguna línea "completar" nueva en `BITACORA.md`.
11. [x] `stop.ps1` probado el 2026-11-27 por la persona, dos veces sobre una carpeta temporal: salida 0, bitácora de prueba sin cambios y 2 líneas `stop session`. `test-hooks.ps1` no cubre `stop` y no se ha ejecutado.

## Preguntas abiertas para el humano
- ¿Cuenta como evidencia el `hooks.log` actual? Desde el 2026-11-21 incluye líneas de sesiones reales de Claude Code (`start`, `pre`, `post` y `stop`; ver `RUNTIME.md`). Sigue en `.gitignore`: ¿debe copiarse al repositorio como evidencia?
- ¿Se agregan cuentas de usuario, correo, cancelación o pagos? ¿Y dónde se desplegaría?
- ¿Se mantiene o se borra el proyecto anterior `reservas-eventos`, que usa una estructura propia que no es la oficial?
