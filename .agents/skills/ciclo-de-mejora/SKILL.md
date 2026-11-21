---
name: ciclo-de-mejora
description: Corre el ciclo completo (pensar, actuar, verificar, repetir, aprender) sobre una tarea y deja la lección escrita. Usar al empezar cualquier tarea de código o cuando pidan "ciclo", "loop" o "lección".
---

# Ciclo de mejora

1. Copiá `.agents/specs/TAREA_TEMPLATE.md` a `.harness/reportes/AAAA-MM-DD-<tarea>.md`.
2. **Pensar:** leé `memory/LECCIONES.md` y escribí el plan de 3 líneas antes de tocar código.
3. **Actuar:** hacé el cambio más chico que resuelve la tarea.
4. **Verificar:** corré las 4 capas (tests, linter, `harness audit .`, revisión del diff). Ninguna reemplaza a otra. Si una no se puede correr, escribí "no verificado" y por qué.
5. **Repetir:** si algo falla, anotá por qué y volvé a 3 con un plan mejor. Contá los reintentos.
6. **Aprender:** escribí una lección en imperativo en `memory/LECCIONES.md` ("- Cuando ..., hacé ..., porque ...").
7. Actualizá `memory/ESTADO.md` y `HANDOFF.md`.
