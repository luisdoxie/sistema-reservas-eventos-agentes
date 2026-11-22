# Dimensión 5 — Permisos en tres niveles

> Generoso en lectura, cauto en lo que sale de la máquina. Si todo es "preguntar", el agente deja de ser útil.
> Se aplica en `.claude/settings.json` (allow / ask / deny) y en el hook `pre-tool-use`.

## Verde — permitir sin preguntar
- Leer archivos, listar, buscar
- `git status`, `git diff`, `git log`
- Correr tests y lint locales, desde `backend/`: `python -m unittest discover -s tests`, `python -m ruff check . --exclude venv` y, para la sintaxis del JavaScript, un `node --check` por archivo: `for f in ../frontend/*.js; do node --check "$f" || echo "FALLA $f"; done` (con un solo `node --check *.js` Node revisa únicamente el primero)

## Amarillo — preguntar siempre
- Instalar dependencias (`npm install`, `pip install`, ...)
- `git push`, publicar, desplegar
- Reiniciar servicios o contenedores

## Rojo — prohibido
- Borrados masivos (`rm -rf`), `git reset --hard`, `git push --force`
- Leer o imprimir secretos (`.env`, `*.pem`, `id_rsa`, credenciales)
- Fuerza bruta o escaneos contra sistemas ajenos

## Regla movida de "preguntar" a "permitir"
- Regla: correr los tests y el lint locales sin pedir confirmación: `python -m unittest`, `python -m ruff check` y `node --check` (y las variantes con `./venv/Scripts/python`). Decidida por la persona el 2026-11-17. Antes no estaban en `allow` de `.claude/settings.json`, así que Claude Code pedía confirmación en cada ejecución; ahora están en `allow` (en `settings.json` y en `settings.windows.json`).
- Por qué es segura: sólo ejecuta código y archivos del propio proyecto; las pruebas usan una base SQLite temporal y no tocan `datos.db`; no usa la red; no instala nada (instalar sigue en "preguntar"); no lee `.env` (sigue denegado); `ruff check` sin `--fix` sólo informa. Límite conocido: el patrón por prefijo no impide agregar `--fix`, así que el agente no debe usarlo sin pedir permiso.
