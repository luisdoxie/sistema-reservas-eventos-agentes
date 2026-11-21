# Dimensiones 1 y 2 — Tools y APIs

> Listar sólo lo que el agente usa **de verdad** (evidencia: `.agents/hooks.log`), no lo que podría usar.

## Tools que usa
| Tool | Para qué | Evidencia de uso |
|------|----------|------------------|
| Read, Grep, Glob | Leer y buscar en el código y los documentos | Permitidas en `.claude/settings.json`. Uso real: pendiente de registrarse en `hooks.log` en sesiones con Claude Code |
| Edit, Write | Cambiar `backend/` y `frontend/` y la memoria del harness | El hook `post-tool-use` registra `Write` y `Edit` |
| Bash (`python -m unittest`, `python app.py`, `sh .agents/tests/test-hooks.sh`) | Correr pruebas y el servidor local | Pruebas y test de hooks ejecutados el 2026-11-17 (ver `RUNTIME.md`) |

No se usan servidores MCP ni otras tools.

## Binarios que necesita el proyecto
| Binario | Versión | ¿Instalado? (`which` / `where`) |
|---------|---------|---------------------------------|
| python | 3.14.7 | Sí (`python --version`) |
| flask (paquete de pip) | 3.1.3 | En el entorno virtual del proyecto anterior; en esta copia aún no se crea `backend/venv` |
| sh (Git Bash) | — | Sí, `/usr/bin/sh` |

## APIs externas (las 4 reglas: una puerta, credenciales fuera del código, errores visibles, límites declarados)
| API | Puerta de entrada única | Credencial (variable de entorno) | Límites / cuotas | ¿Qué pasa si falla? |
|-----|------------------------|----------------------------------|------------------|---------------------|
| Ninguna | — | — (solo `ADMIN_TOKEN` para el panel propio, en `backend/.env`) | — | — |
