# Propuesta de mejora al template — hooks de fin de turno y detección de proyectos

**Fecha:** 2026-11-24 · **Proyecto de origen:** `reservas-eventos-harness` · **Estado:** propuesta, sin enviar ni aplicar al template
**Versión del template revisada:** `template/manifest.json` 1.0.0 y `harness.py` de la carpeta superior (`proyecto/`)

Son tres problemas que aparecieron trabajando en este proyecto. Van ordenados de más a menos urgente. Cada uno trae la evidencia que se puede volver a comprobar y una propuesta concreta. Ninguna propuesta se aplicó al template: ese cambio lo decide quien lo mantiene.

---

## 1. `harness.py` no reconoce proyectos cuya carpeta es `.agents/`

**Problema.** `encontrar_proyectos` (en `harness.py`, función `es_proyecto`) acepta una carpeta solo si tiene `.harness.json` o si tiene `CLAUDE.md` y una carpeta `agents/` en minúscula y sin punto. Este proyecto usa `.agents/` (con punto) y nunca tuvo `.harness.json`, así que `audit` no lo ve.

**Evidencia.**
- La última auditoría guardada es la del 2026-11-17 (`.harness/auditorias/2026-11-17-final.txt`). Hoy no se pudo repetir con la versión actual de la herramienta.
- `harness sync --dry-run` sobre este proyecto planeó crear 11 archivos nuevos y reemplazar el `AGENTS.md` de la raíz, que aquí es una copia generada a mano de `.agents/AGENTS.md`. Por eso no se aplicó.
- El `manifest.json` del template usa nombres en inglés (`agents/memory/state.md`, `logbook.md`…). Este proyecto usa otros (`ESTADO.md`, `BITACORA.md`…). Los dos diseños no se migran solos.

**Propuesta.**
1. Reconocer también `.agents/` en `es_proyecto`, o mejor, que el arranque del proyecto cree siempre `.harness.json` para no depender de adivinar carpetas.
2. Que `sync` detecte que el proyecto tiene otra distribución y se niegue a escribir: que muestre qué archivos de la raíz pisaría y pida una opción explícita (por ejemplo `--forzar`) para continuar.
3. Documentar en `template/harness.md` cómo pasar un proyecto de una distribución antigua a la actual.

**Cómo comprobar que quedó bien.** `python harness.py --root .. audit` lista este proyecto, y `sync --dry-run` no propone sobrescribir archivos personalizados sin una opción explícita.

---

## 2. El hook `Stop` agrega una línea "completar" a la bitácora en cada turno

**Problema.** El evento `Stop` de Claude Code se dispara cuando el agente termina de responder, es decir en cada turno, no solo al final de la sesión. El hook `stop.sh` de este proyecto escribe una línea "sesión cerrada (completar qué se hizo)" en `BITACORA.md` en cada disparo. La bitácora se llena de líneas vacías que alguien tiene que borrar a mano.

**Evidencia.**
- `.agents/hooks.log` tiene 22 eventos `stop` frente a 10 de `start` (inicio, reanudación y compactación cuentan como inicio). La bitácora tiene 10 entradas reales.
- El historial de git tiene tres commits dedicados solo a completar, reemplazar o quitar esas líneas de la bitácora: `5d45be9`, `3a89829` y `9f13567`.
- En dos ocasiones la línea sin completar llegó a quedar en un commit, porque el script de limpieza falló a la mitad y el commit se hizo igual (la corrección vino en un commit posterior).

**Propuesta.** Cambiar el hook en el template, con una de estas dos opciones (la A es la recomendada):
- **A.** Que `stop` no toque la bitácora y escriba solo en `hooks.log`. Que el cierre de la bitácora lo haga el agente al terminar (ya figura en `AGENTS.md`, sección "Al terminar cada sesión") o un hook `SessionEnd`, que sí se dispara una vez por sesión.
- **B.** Si se mantiene en `Stop`, que no agregue una línea nueva cuando la última línea de la bitácora ya es el marcador "completar" de hoy.

Además, que `harness audit` marque como pendiente cualquier línea con el texto "completar qué se hizo", igual que hoy marca los `TODO`.

**Cómo comprobar que quedó bien.** Dos turnos seguidos en una sesión nueva no aumentan el número de líneas de `BITACORA.md`, y `harness audit` falla si queda un marcador sin completar.

---

## 3. El aviso de "archivos con TODO" cuenta los propios scripts del hook

**Problema.** `session-start.sh` busca la palabra `TODO` con `grep -rl` en toda la carpeta `.agents/`. Los dos scripts que hacen esa búsqueda (`session-start.sh` y `session-start.ps1`) contienen la palabra en su propio código, así que el aviso siempre dice "2 archivo(s) del harness siguen con TODO" aunque no quede ningún pendiente real.

**Evidencia.** `grep -rln TODO` sobre el proyecto, sin contar `venv`, `.git` ni `hooks.log`, devuelve esos dos scripts, los tres archivos de auditoría guardados y el `README.md` (que menciona el aviso en su tabla de hooks). El hook solo mira `.agents/` y `HANDOFF.md`, y ahí solo lo contienen los dos scripts. Ningún archivo base de memoria o de reglas lo contiene. El inicio de sesión de hoy mostró "2 archivo(s) del harness siguen con TODO" con 0 pendientes reales.

**Propuesta.** Buscar el marcador solo en los archivos base (`*.md` fuera de `hooks/` y de `.harness/`), o con un patrón que no coincida con el propio script, por ejemplo una búsqueda de `TO` seguido de `DO` armada con dos partes. Un aviso que siempre dice lo mismo se aprende a ignorar, y entonces deja de avisar cuando algo sí está pendiente.

**Cómo comprobar que quedó bien.** Sin pendientes reales, el inicio de sesión no muestra el aviso. Si se agrega un `TODO` en `ESTADO.md`, el aviso aparece y nombra ese archivo.

---

## Lo que no se propone
- No se pide cambiar el nombre de la carpeta de este proyecto: funciona y está documentado. El cambio útil está en la herramienta, que debería tolerar las dos formas.
- No se propone agregar hooks nuevos al template. Se pide arreglar los que ya existen.

## Qué falta para cerrar esta propuesta
- Que la persona responsable la revise y decida si la lleva al template.
- Los hooks de PowerShell (`*.ps1`) no se verificaron en este equipo; si el template los incluye, el punto 2 hay que probarlo también ahí.
