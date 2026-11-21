#!/bin/sh
# Fin de sesión: cierra la bitácora y recuerda dejar el estado
. "$(dirname "$0")/_common.sh"
cat > /dev/null
log stop session
printf '%s · sesión cerrada (completar qué se hizo)\n' "$(date '+%Y-%m-%d')" >> "$ROOT/.agents/memory/BITACORA.md"
exit 0
