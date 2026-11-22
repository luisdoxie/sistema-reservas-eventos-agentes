---
name: verificar-sitio
description: Verifica el sitio de reservas de punta a punta antes de dar un cambio por bueno: pruebas, lint, servidor real con base temporal y revisión de la interfaz. Usar al terminar cualquier cambio en backend/ o frontend/, o cuando pidan "verifica", "prueba el sitio" o "humo".
---

# Verificar el sitio

Existe porque las pruebas del backend no detectaron dos fallos del frontend (`hidden` y `disabled="null"`; ver `LECCIONES.md`). Ninguna capa reemplaza a otra. Todo se corre en Git Bash.

## Pasos
1. **Pruebas y lint**, desde `backend/`:
   - `./venv/Scripts/python -m unittest discover -s tests`
   - `./venv/Scripts/python -m ruff check . --exclude venv` (sin `--fix` salvo permiso)
   - `for f in ../frontend/*.js; do node --check "$f" || echo "FALLA $f"; done`
     (con un solo `node --check *.js` Node revisa únicamente el primer archivo y los demás pasan sin mirarse)
2. **Humo con el servidor real**, desde la raíz: `sh .agents/skills/verificar-sitio/humo.sh [puerto]`.
   Arranca `app.py` con una base temporal y un token propio (no toca `datos.db` ni lee secretos), prueba por HTTP las páginas, el catálogo, el admin con y sin token, la reserva, la consulta con correo bueno y malo, que el log no contenga el correo y que un evento pasado no aparezca. Lo apaga al final. Si el puerto está ocupado, pasa otro.
3. **Interfaz en el navegador** (el humo NO ejecuta el JavaScript): abre el sitio, reserva, mira el comprobante y entra a `/admin.html`. Si no se pudo hacer, escribe "interfaz no verificada" en el reporte.
4. **Informa lo que realmente se corrió**: cada capa con su resultado. Si una falló o no se ejecutó, dilo; nunca escribas "verificado" por las demás.

## Qué no cubre
- Comportamiento de la interfaz (clics, formularios, estilos).
- Concurrencia de reservas al mismo tiempo (la cubren las pruebas del backend, no el humo).
- Producción: el sitio solo corre con el servidor de desarrollo de Flask.

## Reglas
- No leas ni imprimas el archivo de secretos del backend. El humo usa su propio token temporal.
- Si cambia el contrato de la API, actualiza backend, frontend y `backend/tests/` en el mismo cambio.
