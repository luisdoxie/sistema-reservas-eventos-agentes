. "$PSScriptRoot\_common.ps1"
$null = [Console]::In.ReadToEnd()
Write-HookLog start session
'=== ESTADO ==='; Get-Content (Join-Path $Root '.agents\memory\ESTADO.md') -ErrorAction SilentlyContinue
'=== LECCIONES ==='; Get-Content (Join-Path $Root '.agents\memory\LECCIONES.md') -ErrorAction SilentlyContinue
$n = (Get-ChildItem (Join-Path $Root '.agents'), (Join-Path $Root 'HANDOFF.md') -Recurse -File -ErrorAction SilentlyContinue | Select-String 'TODO' -List | Measure-Object).Count
if ($n) { "AVISO: $n archivo(s) del harness siguen con TODO. Corre: harness audit ." }
exit 0
