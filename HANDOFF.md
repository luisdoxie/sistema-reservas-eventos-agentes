# HANDOFF — Traspaso

> **Fecha de este estado:** 2026-11-21 · **Quién lo escribió:** Claude Code (agente), en sesión con la persona responsable; pendiente de su revisión
> Si lo lees más de 2 semanas después de esa fecha, verificá antes de creer.
> Criterio: si mañana no sabrías por dónde seguir, este archivo está incompleto.

## Qué es el proyecto (1 línea)
Sitio web para registrar eventos y ofrecer servicios en línea: el usuario reserva y recibe un comprobante con sus datos; un administrador gestiona la oferta (Flask + SQLite + frontend en HTML/JS puro).

## Cómo correrlo
Todos los comandos, en PowerShell y desde `backend/`.

| Qué | Comando | ¿Verificado? (cómo) |
|-----|---------|---------------------|
| Instalar | `python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt -r requirements-dev.txt; if (-not (Test-Path .env)) { Copy-Item .env.example .env }` | Sí, en Git Bash el 2026-11-17: `venv` creado en esta carpeta; Flask 3.1.3, Werkzeug 3.1.9, Jinja2 3.1.6 y ruff 0.17.5 instalados |
| Ejecutar | `python app.py` → http://127.0.0.1:5000 (panel en `/admin.html`) | Sí, el 2026-11-17 desde esta carpeta (puerto 5057, base temporal): `/` y `/admin.html` 200, 3 eventos, reserva 201 con total, consulta con correo correcto 200 y con correo incorrecto 404, admin sin token 401 y con token 200. Interfaz probada en el navegador con el mismo código en el proyecto anterior |
| Tests | `python -m unittest discover -s tests` | Sí: 21 pruebas OK el 2026-11-21, con el `venv` de esta carpeta |
| Lint | `python -m ruff check . --exclude venv` (Python) y, para la sintaxis del JavaScript, un `node --check` por archivo: `for f in ../frontend/*.js; do node --check "$f" || echo "FALLA $f"; done` | Sí el 2026-11-17: ruff "All checks passed" (se corrigieron 3 observaciones de estilo). Sí el 2026-11-22: los 4 archivos `.js` pasan `node --check` revisados uno por uno. Ojo: `node --check ../frontend/*.js` revisa solo el primer archivo, así que la comprobación del 2026-11-17 hecha con ese comando no cubría los 4. No hay linter de estilo para el JavaScript |

Además: `sh .agents/tests/test-hooks.sh` (desde la raíz) → 6 OK, 0 fallas el 2026-11-17, en Git Bash.

**Acceso desde otro equipo:** `127.0.0.1` solo sirve en la máquina donde corre el servidor. Para que otros equipos de la red entren, pon `APP_HOST=0.0.0.0` en `backend/.env` y usa `http://<IP-de-esta-máquina>:5000`. Verificado el 2026-11-17 con la IP de red de esta máquina; **no se probó desde un segundo equipo** ni se revisó el firewall de Windows, que puede bloquear el puerto. Sin HTTPS: el token de administrador viaja sin cifrar, así que solo en una red de confianza. Si llevas el proyecto a otra máquina, crea ahí un `venv` nuevo; el de esta carpeta no es portable.

## Estado real hoy
| Área | Estado | Verificado cómo |
|------|--------|-----------------|
| Catálogo de eventos y servicios, filtro por tipo; no lista eventos ya ocurridos (desde 2026-11-21) | Funciona | Navegador (proyecto anterior) + prueba del backend; el cambio de fecha no se probó en el navegador |
| Reserva con descuento atómico de cupos, máximo 10 por reserva | Funciona | Pruebas del backend + navegador |
| Comprobante (código `RES-XXXXXXXX`, titular, evento, total) imprimible | Funciona | Navegador |
| Consulta del comprobante con código y correo (`POST /api/reservas/consultar`) | Funciona; el correo no va en la URL | Pruebas + navegador + log del servidor sin el correo |
| Panel `/admin.html` con token: registrar, ajustar cupos, ocultar y ver reservas | Funciona | Navegador |
| Cuentas de usuario, pagos, envío del comprobante por correo, cancelación de reservas | No existe | — |
| Despliegue y producción | No existe; solo servidor de desarrollo de Flask | — |
| Pruebas del frontend | No hay automatizadas | Solo prueba manual |

## Próximos pasos (en orden)
1. [x] Crear `backend/venv`, instalar dependencias, correr tests y lint, y arrancar el servidor en esta carpeta (hecho el 2026-11-17).
2. [ ] La persona confirma `memory/IDENTIDAD.md` y `memory/PREFERENCIAS.md` (son borradores).
3. [x] Regla movida de "preguntar" a "permitir" decidida y justificada en `.agents/PERMISSIONS.md`: tests y lint locales (2026-11-17).
4. [x] Skill propia `verificar-sitio` creada el 2026-11-22 en `.agents/skills/verificar-sitio/` (`SKILL.md` + `humo.sh`). Probada: `humo.sh` 14 OK con el servidor real y base temporal; sus pasos de pruebas y lint también pasan. No verificado: la parte de interfaz en el navegador. Las skills de `.agents/skills/` no aparecen en la lista de skills de Claude Code; para invocarla con `/verificar-sitio` habría que copiarla a `.claude/skills/`.
5. [x] `git init` y commit inicial hechos el 2026-11-21 (rama `main`, sin repositorio remoto). Commits del cambio de eventos pasados y de `.gitattributes` (`*.sh text eol=lf`, para que los hooks `.sh` no queden en CRLF) hechos el 2026-11-21.
6. [x] Ciclo completo hecho el 2026-11-21 (catálogo sin eventos pasados); reporte en `.harness/reportes/2026-11-21-eventos-pasados.md`.
7. [ ] Escribir una propuesta de mejora al template en `.harness/propuestas/`.
8. [ ] Correr `harness audit` y guardar la auditoría "después" en `.harness/auditorias/`.

## Preguntas abiertas para el humano
- ¿Cuenta como evidencia el `hooks.log` actual? Desde el 2026-11-21 incluye líneas de sesiones reales de Claude Code (`start`, `pre`, `post` y `stop`; ver `RUNTIME.md`). Sigue en `.gitignore`: ¿debe copiarse al repositorio como evidencia?
- ¿Se agregan cuentas de usuario, correo, cancelación o pagos? ¿Y dónde se desplegaría?
- ¿La moneda por defecto debe seguir siendo COP? Se cambia en `MONEDA` de `frontend/api.js`.
- ¿Se mantiene o se borra el proyecto anterior `reservas-eventos`, que usa una estructura propia que no es la oficial?
