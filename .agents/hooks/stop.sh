#!/bin/sh
# Evento Stop: corre al terminar CADA respuesta, no la sesión. Sólo anota en hooks.log;
# la línea de BITACORA.md la escribe el agente al terminar (ver AGENTS.md).
. "$(dirname "$0")/_common.sh"
cat > /dev/null
log stop session
exit 0
