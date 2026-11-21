#!/bin/sh
# Después de cada tool: registra y recuerda guardar memoria si hubo cambios
. "$(dirname "$0")/_common.sh"
input=$(cat)
tool=$(printf '%s' "$input" | grep -o '"tool_name" *: *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
log post "${tool:-?}"
case "$tool" in Write|Edit) echo "Recordatorio: si esto cambió el estado, actualizá memory/ESTADO.md." ;; esac
exit 0
