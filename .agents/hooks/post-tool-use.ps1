. "$PSScriptRoot\_common.ps1"
$in = [Console]::In.ReadToEnd()
$tool = ([regex]'"tool_name"\s*:\s*"([^"]*)"').Match($in).Groups[1].Value
Write-HookLog post $(if ($tool) { $tool } else { '?' })
if ($tool -in 'Write','Edit') { 'Recordatorio: si esto cambio el estado, actualiza memory/ESTADO.md.' }
exit 0
