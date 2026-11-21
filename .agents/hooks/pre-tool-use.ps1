. "$PSScriptRoot\_common.ps1"
$in = [Console]::In.ReadToEnd()
if (-not $in) { [Console]::Error.WriteLine('pre-tool-use: entrada vacia, se bloquea por seguridad'); exit 2 }
Write-HookLog pre (([regex]'"tool_name"\s*:\s*"[^"]*"').Match($in).Value)
if ($in -match '\.env|id_rsa|id_ed25519|\.pem|credentials') { [Console]::Error.WriteLine('Bloqueado (rojo): toca secretos. Ver .agents/PERMISSIONS.md'); exit 2 }
if ($in -match 'rm -rf|Remove-Item.*-Recurse|git reset --hard|push --force|push -f') { [Console]::Error.WriteLine('Bloqueado (rojo): accion destructiva. Ver .agents/PERMISSIONS.md'); exit 2 }
exit 0
