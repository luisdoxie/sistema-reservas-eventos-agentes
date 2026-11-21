# Reservas de eventos y servicios

Sitio web para registrar eventos y ofrecer servicios en línea. El usuario elige un evento o servicio, deja sus datos y recibe un comprobante de reserva con su código, sus datos y el total.

**Stack:** Python + Flask + SQLite (backend) y HTML/CSS/JavaScript puro (frontend, sin compilación). Flask sirve ambos.

```
backend/    API Flask + SQLite (app.py, tests/)
frontend/   index.html (catálogo y reserva), comprobante.html, admin.html
.agents/    harness del agente: reglas, memoria, hooks y permisos (creado con `harness bootstrap`)
```

## Arrancar

Desde `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
python app.py
```

Abre http://127.0.0.1:5000. Panel de administración: http://127.0.0.1:5000/admin.html.

Define `ADMIN_TOKEN` en `backend/.env`; si lo dejas vacío, se genera un token temporal y se imprime en la consola. Con `SEMILLA_DEMO=1` (por defecto) se cargan 3 eventos de ejemplo si la base está vacía.

## Cómo se usa

- **Usuario:** elige un evento o servicio, completa nombre, documento, teléfono, correo y cantidad, y confirma. Se abre su comprobante, que puede imprimir o guardar como PDF. Para volver a verlo: "Mi comprobante" con el código y el correo.
- **Administrador:** entra a `/admin.html` con el token, registra eventos o servicios, ajusta cupos, oculta o publica y ve las reservas recibidas.

## API

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /api/eventos` | público | Lista lo publicado |
| `GET /api/eventos/<id>` | público | Detalle |
| `POST /api/reservas` | público | Crea la reserva y devuelve el comprobante (201) |
| `POST /api/reservas/consultar` | público | Devuelve el comprobante si el código y el correo coinciden |
| `GET/POST /api/admin/eventos`, `PUT /api/admin/eventos/<id>` | admin | Lista, registra y edita |
| `GET /api/admin/reservas` | admin | Lista las reservas |

Las rutas de admin exigen el encabezado `X-Admin-Token`. Errores: `{"error": "...", "campos": {...}}` con 400 (validación), 401, 404 o 409 (sin cupos o evento ya ocurrido).

## Reglas

- Los cupos se descuentan de forma atómica; nunca quedan negativos.
- No se reserva un evento pasado u oculto. Máximo 10 por reserva.
- El comprobante conserva los datos del evento y el precio del momento de la reserva.
- El correo no viaja en la URL (la consulta es `POST`), para que no quede en los logs.

## Pruebas

Desde `backend/`: `python -m unittest discover -s tests`

## Límites conocidos

Sin cuentas de usuario, pagos, envío del comprobante por correo ni cancelación de reservas. Usa el servidor de desarrollo de Flask: para producción hace falta un servidor WSGI, HTTPS y copias de seguridad de `backend/datos.db`.
