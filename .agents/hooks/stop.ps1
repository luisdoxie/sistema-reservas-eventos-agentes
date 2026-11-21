. "$PSScriptRoot\_common.ps1"
$null = [Console]::In.ReadToEnd()
Write-HookLog stop session
"$(Get-Date -Format 'yyyy-MM-dd') · sesion cerrada (completar que se hizo)" | Add-Content (Join-Path $Root '.agents\memory\BITACORA.md') -Encoding UTF8
exit 0
