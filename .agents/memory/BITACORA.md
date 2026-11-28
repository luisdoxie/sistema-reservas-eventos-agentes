# Bitácora — historia (sólo se agrega · 50-500 KB)

Formato: `AAAA-MM-DD · qué se hizo · resultado`. Al terminar la sesión, el agente agrega su línea (ningún hook la escribe).

2026-11-17 · bootstrap del template oficial, código de reservas copiado desde el proyecto anterior y archivos base del harness llenados · test-hooks 6 OK y 20 pruebas del backend OK; queda pendiente la regla de PERMISSIONS.md que decide la persona
2026-11-17 · actividad puntos 1-3: venv, 20 pruebas, ruff y node --check OK, servidor probado, regla de permisos decidida, auditoría final sin pendientes
2026-11-21 · análisis del proyecto, git init con commit inicial y primer ciclo completo: el catálogo ya no ofrece eventos pasados · 21 pruebas OK, ruff limpio, interfaz no probada en navegador, cambio sin commit
2026-11-21 · commits del cambio de eventos pasados, de `.gitattributes` (LF en hooks .sh) y de HANDOFF/ESTADO · árbol limpio, 21 pruebas OK
2026-11-22 · skill propia verificar-sitio (SKILL.md + humo.sh), evidencia de hooks en RUNTIME.md, lección sobre node --check · humo 14 OK, 21 pruebas OK, ruff limpio; PowerShell de hooks no verificado (permiso denegado) e interfaz sin probar en navegador
2026-11-22 · corregido el comando de node --check (un archivo por vez, con bucle) en HANDOFF, PERMISSIONS y RUNTIME · los 3 documentos coinciden con la skill verificar-sitio
2026-11-22 · prueba de la interfaz en Chrome con servidor temporal: catálogo, filtros, reserva, comprobante, consulta, panel admin y HTML como texto · todo OK sin errores de consola; sin probar móvil, impresión ni estado Agotado; sin commit
2026-11-22 · decidido: sitio para Santa Cruz, Bolivia; moneda BOB (Bs) en frontend/api.js y precios demo en bolivianos en backend/app.py · 21 pruebas OK, ruff limpio, humo 14 OK y 4 pantallas probadas en Chrome; sin commit; AGENTS.md de la raíz (generado) sin regenerar
2026-11-22 · mejora del frontend nivel 1 (portada, tarjetas, buscador, validación local, copiar código, resumen y edición en el panel) · 21 pruebas OK, ruff limpio, humo 14 OK, probado en Chrome escritorio y móvil (iframe); sin tema claro, impresión ni teléfono real; sin commit
2026-11-22 · repositorio publicado en GitHub (público, MIT): historial reescrito con correo noreply y sin los borradores de memoria personal, README con la arquitectura de agentes, AGENTS.md regenerado a mano (harness sync no aplicado) · 21 pruebas OK, revisión de secretos limpia, diagrama Mermaid verificado en GitHub; falta subir esta nota
2026-11-24 · punto 7 y 8 de la tarea: propuesta de mejora al template en `.harness/propuestas/` (3 problemas con evidencia: detección de `.agents/`, hook Stop en cada turno, aviso TODO falso) y lección nueva sobre el evento Stop · propuesta revisada contra hooks.log, git y harness.py; no enviada al template; sin commit
2026-11-27 · ciclo de la Clase 4: el hook stop ya no escribe en la bitácora; métricas de la semana y propuesta de tarea con varios agentes · hooks 9 OK, 21 pruebas OK, lint limpio, reintentos=1; stop.ps1 no verificado; sin commit
2026-11-27 · notas actualizadas: stop.sh comprobado en sesión real (10 stop, 0 líneas "completar") y sintaxis de stop.ps1 · 0 errores de sintaxis; funcionamiento de stop.ps1 sin probar (rechazado por el modo automático); sin commit
2026-11-27 · prueba de stop.ps1 ejecutada por la persona sobre una carpeta temporal y anotada en las notas · salida 0 dos veces, bitácora de prueba sin cambios, 2 líneas stop en el log; sin commit
2026-11-27 · commit y push a main del ciclo de la Clase 4, pedidos por la persona · autor con correo noreply; cambios revisados sin secretos ni datos personales
