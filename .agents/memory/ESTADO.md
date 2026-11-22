# Estado — foco actual (se reescribe cada sesión · 3-10 KB)

- Fecha: 2026-11-22
- Hecho hoy (sin commit): mejora del frontend, nivel 1, probada en Chrome (escritorio y ancho de móvil); reporte en `.harness/reportes/2026-11-22-mejora-frontend-nivel1.md`.
- Última decisión: el sitio es para Santa Cruz, Bolivia; moneda boliviano (BOB, `Bs 1.500`) y precios de demostración en bolivianos. Probado en Chrome; sin commit.
- Foco actual: verificación de `reservas-eventos-harness`. Hecho: skill propia `verificar-sitio` (con `humo.sh`, 14 OK), evidencia de hooks en `RUNTIME.md` (6 OK en Git Bash), comando `node --check` corregido en 3 documentos, y prueba de la interfaz en Chrome (reserva, comprobante, consulta, panel admin, filtros, evento pasado oculto, HTML mostrado como texto); reporte en `.harness/reportes/2026-11-22-prueba-interfaz.md`. 21 pruebas OK y ruff limpio.
- Próximo paso concreto: la persona confirma `IDENTIDAD.md` y `PREFERENCIAS.md` (son borradores) y corre a mano el test de hooks en PowerShell (`.agents/tests/test-hooks.ps1`). Luego: propuesta de mejora al template, repetir `harness audit .` y decidir si la skill va también en `.claude/skills/`.
- Bloqueos: ninguno. La prueba de hooks en PowerShell no se pudo ejecutar desde la sesión (permiso denegado). La interfaz no se probó en móvil, ni la impresión, ni el estado "Agotado".
