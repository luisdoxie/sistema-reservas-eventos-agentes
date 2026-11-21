#!/bin/sh
# Inicio de sesión: carga estado y lecciones en el contexto (lo que imprime lo lee el agente)
. "$(dirname "$0")/_common.sh"
cat > /dev/null
log start session
echo "=== ESTADO ==="; cat "$ROOT/.agents/memory/ESTADO.md" 2>/dev/null
echo "=== LECCIONES ==="; cat "$ROOT/.agents/memory/LECCIONES.md" 2>/dev/null
n=$(grep -rl 'TODO' "$ROOT/.agents" "$ROOT/HANDOFF.md" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n" -gt 0 ]; then echo "AVISO: $n archivo(s) del harness siguen con TODO. Corré: harness audit ."; fi
exit 0
