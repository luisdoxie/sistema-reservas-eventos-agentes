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
| Lint | Comando y qué necesitan instalado | Desde `backend/`: `python -m ruff check . --exclude venv` (ruff 0.17.5, en `requirements-dev.txt`) y `node --check ../frontend/*.js` para la sintaxis del JavaScript (Node v24) |

## Verificación de hooks
- Fecha: 2026-11-17 · Comando: `.agents/tests/test-hooks.sh` · Resultado: 6 OK, 0 fallas (SO: MINGW64_NT-10.0-26300). Las líneas que dejó en `hooks.log` vienen de este test, no de una sesión real de Claude Code.
