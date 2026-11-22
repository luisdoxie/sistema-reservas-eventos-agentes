# Dimensiones 1 y 2 — Tools y APIs

> Listar sólo lo que el agente usa **de verdad** (evidencia: `.agents/hooks.log`), no lo que podría usar.

## Tools que usa
| Tool | Para qué | Evidencia de uso |
|------|----------|------------------|
| Read, Grep, Glob | Leer y buscar en el código y los documentos | Permitidas en `.claude/settings.json`. Uso real registrado en `.agents/hooks.log` (sesiones del 2026-11-21 y 2026-11-22) |
| Edit, Write | Cambiar `backend/` y `frontend/` y la memoria del harness | El hook `post-tool-use` registra `Write` y `Edit` |
| Bash (`python -m unittest`, `ruff`, `node --check`, `python app.py`, `sh .agents/tests/test-hooks.sh`, `sh .agents/skills/verificar-sitio/humo.sh`, `git`) | Correr pruebas, lint, el servidor local y el control de versiones | Ejecutados en las sesiones del 2026-11-17, 2026-11-21 y 2026-11-22 (ver `RUNTIME.md` y `.harness/reportes/`) |
| Claude in Chrome (extensión del navegador, vía MCP) | Probar la interfaz real: reserva, comprobante, panel | Reportes `.harness/reportes/2026-11-22-prueba-interfaz.md` y `2026-11-22-mejora-frontend-nivel1.md` |

No hay servidores MCP propios del proyecto (no existe `.mcp.json`); la extensión de Chrome es una herramienta de la sesión, no del código.

## Binarios que necesita el proyecto
| Binario | Versión | ¿Instalado? (`which` / `where`) |
|---------|---------|---------------------------------|
| python | 3.14.7 | Sí (`python --version`) |
| flask (paquete de pip) | 3.1.3 | En `backend/venv` (creado el 2026-11-17) |
| ruff (paquete de pip) | 0.17.5 | En `backend/venv` (`requirements-dev.txt`) |
| node | v24 | Sí; solo para `node --check` de la sintaxis del JavaScript |
| sh (Git Bash) | — | Sí, `/usr/bin/sh` |

## APIs externas (las 4 reglas: una puerta, credenciales fuera del código, errores visibles, límites declarados)
| API | Puerta de entrada única | Credencial (variable de entorno) | Límites / cuotas | ¿Qué pasa si falla? |
|-----|------------------------|----------------------------------|------------------|---------------------|
| Ninguna | — | — (solo `ADMIN_TOKEN` para el panel propio, en `backend/.env`) | — | — |
