# Dimensión 6 — Runtime: dónde corre cada cosa

> Si no está escrito, el agente asume — y asume mal.

| Componente | Qué declarar | Valor |
|------------|--------------|-------|
| Agente | Herramienta y modelo | Claude Code. El modelo lo fija la sesión; esta configuración se preparó con Claude Sonnet 5.5 |
| Sistema operativo | SO y shell real (`ls -l /bin/sh` o `$PSVersionTable`) | Windows 11 Home (10.0.26300). Los hooks y tests corren en Git Bash (`uname`: MINGW64_NT-10.0-26300; `/bin/sh` -> `/bin/sh`, `which sh`: `/usr/bin/sh`). También hay PowerShell 5.1 |
| Hooks | Intérprete por SO | Linux/macOS: `sh` (POSIX) · Windows: PowerShell (`.ps1`). En esta máquina `.claude/settings.json` usa los `.sh` con el `sh` de Git Bash y pasan los tests; `settings.windows.json` (PowerShell) no se ha probado |
| Servidores de herramientas (MCP) | Dónde y cómo arrancan | Ninguno configurado (no hay `.mcp.json`) |
| Base de datos | Dónde vive y cómo se conecta | SQLite, archivo `backend/datos.db` (ruta con `DB_PATH`). El esquema se crea al arrancar; sin servidor ni migraciones. Con `SEMILLA_DEMO=1` carga 3 eventos de ejemplo si está vacía |
| Servidor | Cómo arranca | `python app.py` desde `backend/` sirve API y frontend en `http://127.0.0.1:5000` (puerto con `PORT`). Por defecto solo escucha en la propia máquina; con `APP_HOST=0.0.0.0` (en `backend/.env`) también por la IP de red, en `http://<IP>:5000` (verificado el 2026-11-17). Servidor de desarrollo de Flask, sin HTTPS, no apto para producción |
| Tests | Comando y qué necesitan instalado | Desde `backend/`: `python -m unittest discover -s tests`. Necesita Python 3 y Flask (`pip install -r requirements.txt`). Usan una base SQLite temporal. El frontend no tiene pruebas automatizadas |
| Lint | Comando y qué necesitan instalado | Desde `backend/`: `python -m ruff check . --exclude venv` (ruff 0.17.5, en `requirements-dev.txt`) y, para la sintaxis del JavaScript (Node v24), un `node --check` por archivo: `for f in ../frontend/*.js; do node --check "$f" || echo "FALLA $f"; done`. No uses `node --check ../frontend/*.js`: con varios archivos Node revisa solo el primero |

## Verificación de hooks
- Fecha: 2026-11-17 · Comando: `.agents/tests/test-hooks.sh` · Resultado: 6 OK, 0 fallas (SO: MINGW64_NT-10.0-26300). Las líneas que dejó en `hooks.log` vienen de este test, no de una sesión real de Claude Code.
- Fecha: 2026-11-22 · Comando: `sh .agents/tests/test-hooks.sh` (Git Bash) · Resultado: 6 OK, 0 fallas (SO: MINGW64_NT-10.0-26300, Windows 11).
- Fecha: 2026-11-27 · Comando: `sh .agents/tests/test-hooks.sh` (Git Bash) · Resultado: 9 OK, 0 fallas. Se agregaron 3 comprobaciones de `stop`, que ya no escribe en la bitácora. `stop.ps1` cambió igual: su sintaxis tiene 0 errores (analizador de PowerShell 5.1.26100.9818).
- `stop.ps1`, 2026-11-27: prueba ejecutada por la persona en Windows PowerShell 5.1, dos veces sobre una carpeta temporal · `salida: 0` en ambas, bitácora de prueba sin cambios y 2 líneas `stop session`. El modo automático no permitió que la ejecutara el agente.
- Sesión real, 2026-11-27 de 22:33 a 22:57: 10 eventos `stop session` en `hooks.log` y ninguna línea "completar" nueva en `BITACORA.md`.
- Evidencia de sesión real en `.agents/hooks.log` (113 líneas el 2026-11-22): 6 `start session`, 8 `stop session`, 55 `pre` y 44 `post`, de sesiones de Claude Code del 2026-11-21 y 2026-11-22 (ya no solo líneas del test). Hay más `pre` que `post`; probablemente por llamadas bloqueadas o denegadas (el bloqueo de `pre-tool-use` se vio en pantalla dos veces) y alguna en curso, pero no revisé una por una las 11 diferencias. `hooks.log` está en `.gitignore`: la evidencia vive en esta máquina, no en el repositorio.
- No verificado: la variante PowerShell (`.agents/tests/test-hooks.ps1` y `settings.windows.json`). El 2026-11-22 Claude Code denegó el permiso para ejecutar ese test desde la sesión; hay que correrlo a mano en una terminal.
