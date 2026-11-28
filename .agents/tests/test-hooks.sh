#!/bin/sh
# Test de los hooks: un hook roto rompe todas las sesiones. Correr tras cada cambio.
H="$(cd "$(dirname "$0")/../hooks" && pwd)"
CLAUDE_PROJECT_DIR="$(cd "$H/../.." && pwd)"; export CLAUDE_PROJECT_DIR
ok=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "  OK    $1"; ok=$((ok+1)); else echo "  FALLA $1 (esperado $3, obtuvo $2)"; fail=$((fail+1)); fi; }
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}'       | sh "$H/pre-tool-use.sh" >/dev/null 2>&1; check "permite ls"            $? 0
echo '{"tool_name":"Bash","tool_input":{"command":"cat .env"}}' | sh "$H/pre-tool-use.sh" >/dev/null 2>&1; check "bloquea .env"          $? 2
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | sh "$H/pre-tool-use.sh" >/dev/null 2>&1; check "bloquea rm -rf"        $? 2
printf ''                                                       | sh "$H/pre-tool-use.sh" >/dev/null 2>&1; check "bloquea entrada vacía" $? 2
echo '{"tool_name":"Edit"}' | sh "$H/post-tool-use.sh" >/dev/null 2>&1; check "post-tool-use" $? 0
echo '{}'                   | sh "$H/session-start.sh" >/dev/null 2>&1; check "session-start" $? 0
# stop corre al terminar cada respuesta: anota en hooks.log y no toca la bitácora (se prueba en una copia temporal)
T="$(mktemp -d)" || exit 1; mkdir -p "$T/.agents/memory"; printf 'entrada real\n' > "$T/.agents/memory/BITACORA.md"
echo '{}' | CLAUDE_PROJECT_DIR="$T" sh "$H/stop.sh" >/dev/null 2>&1; check "stop" $? 0
echo '{}' | CLAUDE_PROJECT_DIR="$T" sh "$H/stop.sh" >/dev/null 2>&1
check "dos stop no cambian la bitácora" "$(cat "$T/.agents/memory/BITACORA.md")" "entrada real"
check "dos stop quedan en hooks.log" "$(grep -c ' stop session' "$T/.agents/hooks.log")" 2
rm -r "$T"
echo "Resultado: $ok OK, $fail fallas (SO: $(uname -s), /bin/sh -> $(readlink -f /bin/sh 2>/dev/null || echo '?'))"
[ "$fail" -eq 0 ]
