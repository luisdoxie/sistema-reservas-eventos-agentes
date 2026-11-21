# Funciones comunes de los hooks (POSIX sh: nada de [[ ]], arrays, <<<, source)
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG="$ROOT/.agents/hooks.log"
log() { printf '%s %s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S')" "$1" "$2" >> "$LOG"; }
