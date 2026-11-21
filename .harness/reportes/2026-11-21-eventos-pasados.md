# Reporte de ciclo — catálogo sin eventos pasados

Fecha: 2026-11-21 · Skill: `ciclo-de-mejora`

## Pensar
- Problema: `GET /api/eventos` listaba eventos ya ocurridos; el usuario veía "Reservar" y el servidor respondía 409 al enviar.
- Plan: (1) escribir la prueba y verla fallar, (2) filtrar por fecha en `listar_eventos`, (3) correr pruebas y lint.
- Decisión: filtrar en el backend (no solo marcar en el frontend). Los servicios sin fecha se siguen ofreciendo; el panel de administración sigue viendo todo; los comprobantes no cambian.

## Actuar
- `backend/tests/test_api.py`: prueba `test_catalogo_no_ofrece_eventos_pasados_pero_si_servicios_sin_fecha`.
- `backend/app.py`: `listar_eventos` agrega `AND (fecha IS NULL OR fecha >= ?)` con la hora actual en formato `AAAA-MM-DDTHH:MM`.
- La forma del contrato de la API no cambia (mismos campos); solo cambia qué eventos devuelve. No hizo falta tocar el frontend.

## Verificar
- La prueba nueva falló antes del cambio (el evento pasado aparecía en la lista): confirmado.
- Después del cambio: 21 pruebas OK (`python -m unittest discover -s tests`) y `ruff check` sin observaciones.
- No verificado: la interfaz en el navegador (no se abrió el sitio en esta sesión).
- Límite conocido: un evento que empieza este mismo minuto aún se lista, y `crear_reserva` puede rechazarlo si ya pasaron los segundos. Efecto mínimo.

## Aprender
- Lección agregada a `LECCIONES.md`: aplicar la regla de negocio también al listado que ofrece la acción, y escribir la prueba antes.
