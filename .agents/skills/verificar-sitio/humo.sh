#!/bin/sh
# Prueba de humo del sitio: arranca el servidor REAL con una base temporal, prueba las rutas clave
# por HTTP y lo apaga. No toca backend/datos.db ni lee archivos de secretos (el token va por variable).
# Uso (desde la raíz del proyecto, en Git Bash):  sh .agents/skills/verificar-sitio/humo.sh [puerto]
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PORT="${1:-5057}"
BASE="http://127.0.0.1:$PORT"
TOKEN="token-de-humo"
CORREO="humo@correo.com"
PY="$ROOT/backend/venv/Scripts/python"
[ -x "$PY" ] || PY="$ROOT/backend/venv/bin/python"
[ -x "$PY" ] || { echo "No encuentro el venv en backend/venv. Ver HANDOFF.md (Instalar)."; exit 2; }
if curl -s -o /dev/null "$BASE/"; then echo "El puerto $PORT ya está en uso. Pasa otro puerto como argumento."; exit 2; fi

TMP="$(mktemp -d)"
DB="$TMP/humo.db"
command -v cygpath >/dev/null 2>&1 && DB="$(cygpath -m "$DB")"
PID=""
ok=0; fail=0

check() { # descripción, obtenido, esperado
  if [ "$2" = "$3" ]; then echo "  OK    $1"; ok=$((ok+1)); else echo "  FALLA $1 (esperado $3, obtuvo $2)"; fail=$((fail+1)); fi
}
codigo_http() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
json() { "$PY" -c "import sys, json; d = json.load(sys.stdin); print($1)"; }

parar() {
  if [ -n "$PID" ]; then
    kill "$PID" 2>/dev/null
    W="$(cat "/proc/$PID/winpid" 2>/dev/null)"
    [ -n "$W" ] && taskkill //F //T //PID "$W" >/dev/null 2>&1
    PID=""
  fi
}
limpiar() { parar; [ -n "$TMP" ] && rm -r "$TMP" 2>/dev/null; }
trap limpiar EXIT

cd "$ROOT/backend" || exit 2
DB_PATH="$DB" ADMIN_TOKEN="$TOKEN" SEMILLA_DEMO=1 PORT="$PORT" "$PY" app.py >"$TMP/servidor.log" 2>&1 &
PID=$!
for _ in $(seq 1 30); do curl -s -o /dev/null "$BASE/" && break; sleep 0.5; done

echo "Humo del sitio en $BASE (base temporal, SO: $(uname -s))"
check "GET / (catálogo)"            "$(codigo_http "$BASE/")" 200
check "GET /admin.html"             "$(codigo_http "$BASE/admin.html")" 200
check "GET /comprobante.html"       "$(codigo_http "$BASE/comprobante.html")" 200
check "catálogo con 3 de demo"      "$(curl -s "$BASE/api/eventos" | json 'len(d)')" 3
check "admin sin token da 401"      "$(codigo_http "$BASE/api/admin/eventos")" 401
check "admin con token da 200"      "$(codigo_http -H "X-Admin-Token: $TOKEN" "$BASE/api/admin/eventos")" 200

check "admin crea un evento pasado" "$(codigo_http -X POST -H "X-Admin-Token: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"nombre":"Evento pasado de humo","tipo":"evento","fecha":"2020-01-01T10:00","precio":1000,"cupos":5}' "$BASE/api/admin/eventos")" 201
check "el catálogo oculta el pasado" "$(curl -s "$BASE/api/eventos" | json '"Evento pasado de humo" in [e["nombre"] for e in d]')" False

ID="$(curl -s "$BASE/api/eventos" | json 'd[0]["id"]')"
RESERVA="$(curl -s -X POST -H 'Content-Type: application/json' \
  -d "{\"evento_id\":$ID,\"cantidad\":2,\"nombre\":\"Persona de Humo\",\"documento\":\"12345678\",\"correo\":\"$CORREO\",\"telefono\":\"3001234567\"}" "$BASE/api/reservas")"
CODIGO="$(printf '%s' "$RESERVA" | json 'd.get("codigo", "")')"
check "reserva devuelve código RES-" "$(printf '%s' "$CODIGO" | cut -c1-4)" "RES-"
check "total = precio x cantidad"    "$(printf '%s' "$RESERVA" | json 'd.get("total") == d.get("precio_unitario", 0) * 2')" True
check "consulta con correo correcto" "$(codigo_http -X POST -H 'Content-Type: application/json' -d "{\"codigo\":\"$CODIGO\",\"correo\":\"$CORREO\"}" "$BASE/api/reservas/consultar")" 200
check "consulta con correo malo 404" "$(codigo_http -X POST -H 'Content-Type: application/json' -d "{\"codigo\":\"$CODIGO\",\"correo\":\"otro@correo.com\"}" "$BASE/api/reservas/consultar")" 404
check "el log no contiene el correo" "$(grep -c "$CORREO" "$TMP/servidor.log")" 0

parar
sleep 1
check "servidor apagado" "$(codigo_http --max-time 2 "$BASE/")" 000
echo "Resultado: $ok OK, $fail fallas"
[ "$fail" -eq 0 ]
