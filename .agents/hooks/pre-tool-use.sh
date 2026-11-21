#!/bin/sh
# Antes de cada tool: registra y BLOQUEA lo rojo (exit 2 = bloquear y avisar al agente).
# No depende de jq: revisa la entrada cruda, así no falla abierto si jq no está instalado.
. "$(dirname "$0")/_common.sh"
input=$(cat)
if [ -z "$input" ]; then echo "pre-tool-use: entrada vacía, se bloquea por seguridad" >&2; exit 2; fi
log pre "$(printf '%s' "$input" | grep -o '"tool_name" *: *"[^"]*"' | head -1)"
case "$input" in
  *.env*|*id_rsa*|*id_ed25519*|*.pem*|*credentials*)
    echo "Bloqueado (rojo): toca secretos. Ver .agents/PERMISSIONS.md" >&2; exit 2 ;;
  *"rm -rf"*|*"git reset --hard"*|*"push --force"*|*"push -f"*)
    echo "Bloqueado (rojo): acción destructiva. Ver .agents/PERMISSIONS.md" >&2; exit 2 ;;
esac
exit 0
