# Tarea: el hook de fin no debe llenar la bitácora en cada respuesta

**Fecha:** 2026-11-27 · **Reintentos:** 1 · Clase 4 (ejercicio de la página 11 y tareas de la página 12)

## 1. Pensar — plan (3 líneas alcanzan)
Escrito antes de tocar código.

1. Escribir en `test-hooks.sh` una prueba (con carpeta temporal) de que dos `stop` seguidos no cambian `BITACORA.md`, y verla fallar.
2. Quitar de `stop.sh` y `stop.ps1` la línea que escribe en la bitácora; `stop` sigue anotando en `hooks.log`, que la entrega pide como evidencia.
3. Ajustar los textos que prometen esa línea, borrar las 4 líneas vacías y correr las 4 capas.

**Causa:** `settings.json` conecta `stop.sh` al evento `Stop`, que según la [documentación de hooks](https://code.claude.com/docs/en/hooks) se dispara cuando el agente termina de responder. Antes del cambio había 4 líneas vacías sin confirmar en la bitácora.

**Por qué no `SessionEnd`:** se dispara al terminar la sesión, pero seguiría dejando una línea sin contenido que alguien debe completar. El cierre de la bitácora ya es una regla del agente en `AGENTS.md`.

## 2. Actuar — qué se cambió
- `.agents/hooks/stop.sh` y `stop.ps1`: ya no escriben en la bitácora; siguen anotando en `hooks.log`.
- `.agents/tests/test-hooks.sh`: 3 comprobaciones nuevas sobre `stop` (de 6 a 9), en una carpeta temporal.
- `.agents/AGENTS.md`, `AGENTS.md` (copia de la raíz, editada a mano), encabezado de `BITACORA.md` y `README.md`: ya no prometen la línea del hook.
- `BITACORA.md`: se quitaron las 4 líneas vacías.

## 3. Verificar — las 4 capas
| Capa | Comando / cómo | Resultado |
|------|----------------|-----------|
| Tests | `sh .agents/tests/test-hooks.sh` | Con el hook anterior: 8 OK, 1 falla (2 líneas vacías agregadas). Después: 9 OK, 0 fallas |
| Tests | `python -m unittest discover -s tests` | 21 OK |
| Linter | `ruff check` y `node --check` archivo por archivo | Sin observaciones; 4 archivos `.js` OK. Ninguno revisa los scripts de los hooks |
| Auditoría del harness | `sh bin/harness.sh audit <proyecto>` de la plantilla en `documento/harness-template` (`harness` no está en el PATH) | "incompleto", con 7 marcas, **igual antes y después**. Faltan 0 archivos. Las 7 son menciones de la palabra que busca la auditoría (bitácora, propuesta y README), no pendientes |
| Revisión del cambio | `git diff`, hecha por el mismo agente que escribió el cambio (no es una revisión independiente) | Encontró que `BITACORA.md` quedó sin salto de línea final. Corregido y revisado otra vez |

### Comprobado después del ciclo (mismo día)
- **Sesión real (`stop.sh`):** de las 22:33 a las 22:57, `hooks.log` sumó 10 eventos `stop session` y `BITACORA.md` no recibió ninguna línea "completar".
- **Sintaxis de `stop.ps1`:** 0 errores con el analizador de PowerShell 5.1.26100.9818, sin ejecutar el archivo. El modo automático rechazó este análisis las dos primeras veces (la primera dentro de un comando combinado, la segunda solo) y lo permitió en el tercer intento, pedido por la persona. No se sabe por qué cambió.

- **Funcionamiento de `stop.ps1`:** la prueba la ejecutó **la persona** en Windows PowerShell 5.1 y pegó la salida en la sesión (el modo automático había rechazado que la ejecutara el agente, con el motivo "Undermining Oversight"). Dos ejecuciones sobre una carpeta temporal: `salida: 0` en ambas, la bitácora de prueba quedó solo con `entrada real` y el log de prueba con 2 líneas `stop session`. No cubre `stop.ps1` conectado desde `settings.windows.json` en una sesión real.

### No verificado
- Los demás hooks de PowerShell y `settings.windows.json`.
- `sh -n` sobre los `.sh`: iba en el comando combinado y no se repitió. `stop.sh` y `test-hooks.sh` sí se ejecutaron en las pruebas.

## 4. Repetir — si falló, por qué falló la primera vez
Al borrar las 4 líneas del final, la edición quitó también el último salto de línea. Las pruebas y el lint pasaban; se vio recién al leer el diff. Se agregó el salto y se repitieron las pruebas de hooks y el diff de la bitácora.

La falla de la prueba antes del cambio no cuenta como reintento: era la reproducción buscada.

## 5. Aprender — lecciones (copiadas a `memory/LECCIONES.md`)
- Cuando borres líneas al final de un archivo de registro, revisa en `git diff` que no aparezca `\ No newline at end of file`.
- Cuando verifiques en modo automático, corre cada capa en su propio comando; si algo se rechaza, no lo busques por otra vía y marca lo que no se ejecutó como "no verificado".

## Pendiente fuera de este cambio
La plantilla (`documento/harness-template/.../seed/`) tiene el mismo `stop.sh`. Su README pide cambiar la plantilla cuando algo viene de ella. No se tocó porque está fuera del proyecto: lo decide la persona. La propuesta del 2026-11-24 (punto 2) ya describe el cambio.

---

# Para la próxima clase (página 12)

## A. Dos lecciones nuevas
Cumplido: las dos de la sección 5. `LECCIONES.md` pasó de 11 a 13.

## B. Reintentos del 2026-11-21 al 2026-11-27
**Los porcentajes no se pueden calcular.** Antes de hoy ningún reporte anotó cuántos reintentos hubo, aunque la plantilla de tarea tiene el campo. La bitácora tampoco lo registra y sus líneas mezclan tareas, commits y documentación, así que no sirven como lista de tareas.

| Métrica (página 10) | Objetivo | Dato disponible |
|---|---|---|
| Tareas sin reintento | más del 70 % | Sin dato |
| Tareas con un reintento | menos del 25 % | Sin dato. Solo consta la tarea de hoy, con 1 |
| Tareas con más de tres | menos del 5 % | Sin dato |
| Tiempo por ciclo | minutos, no horas | Solo se midió hoy (ver abajo) |
| Lecciones por semana | 3 a 5 | 8 (1 el día 21, 4 el 22, 1 el 24 y 2 hoy): por encima del rango |

Indicios de trabajo rehecho, que **no** son un conteo de reintentos: el reporte del frontend (día 22) anota 3 defectos hallados y corregidos durante la prueba; el mismo día se corrigió el comando `node --check` en 3 documentos; y hubo commits dedicados a limpiar las líneas del hook en la bitácora.

La clase dice que si no se llega a las lecciones esperadas se está saltando la fase de aprender. Aquí ocurre lo contrario. El número solo no demuestra que las lecciones se apliquen.

**Tiempo del ciclo de hoy:** unos 4 minutos, de las 22:29 a las 22:33 (hora del equipo), desde la medición inicial hasta la auditoría final. No incluye leer el PDF ni acordar el plan.

**Desde ahora:** llenar `**Reintentos:** N` en cada reporte y anotar en la línea de la bitácora `reintentos=N`. Un reintento es cada vez que una verificación rechaza el trabajo y hay que volver a actuar.

## C. Una tarea que justifica más de un agente
**Agregar la cancelación de reservas** (todavía no está decidido hacerla).

Un solo agente puede escribirla. Lo que justifica más de uno es **revisar con contexto limpio**: quien escribe el código tiende a probar lo que ya pensó. El riesgo es concreto: devolver cupos dos veces si llegan dos cancelaciones a la vez, o revelar si un código existe cuando el correo no coincide.

| Nodo | Quién | Qué hace |
|---|---|---|
| 1. Implementar | Agente A | Backend, frontend y pruebas en el mismo cambio. No se reparte, porque comparten el contrato de la API |
| 2a. Revisar seguridad y concurrencia (en paralelo) | Agente B, solo lectura | Doble cancelación, cupos y privacidad del correo |
| 2b. Probar en el navegador (en paralelo) | Agente C, sin editar código | Recorre reserva y cancelación con una base temporal |
| 3. Sincronizar | Agente A | Junta los hallazgos; si hay rechazo, vuelve al nodo 1 con un límite de reintentos |
| 4. Aprobar | La persona | Decide si se guarda y publica |

El costo es mayor: cada agente tiene que leer el contexto desde cero. Para un cambio como el de hoy no se justifica.
