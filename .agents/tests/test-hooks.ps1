$H = (Resolve-Path "$PSScriptRoot\..\hooks").Path; $env:CLAUDE_PROJECT_DIR = (Resolve-Path "$H\..\..").Path
$script:ok = 0; $script:fail = 0
function Check($name, $json, $file, $want) {
  $json | powershell -NoProfile -ExecutionPolicy Bypass -File "$H\$file" *> $null; $got = $LASTEXITCODE
  if ($got -eq $want) { "  OK    $name"; $script:ok++ } else { "  FALLA $name (esperado $want, obtuvo $got)"; $script:fail++ } }
Check 'permite ls'   '{"tool_name":"Bash","tool_input":{"command":"ls"}}'       'pre-tool-use.ps1' 0
Check 'bloquea .env' '{"tool_name":"Bash","tool_input":{"command":"cat .env"}}' 'pre-tool-use.ps1' 2
Check 'bloquea rm'   '{"tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' 'pre-tool-use.ps1' 2
Check 'post'         '{"tool_name":"Edit"}'                                     'post-tool-use.ps1' 0
"Resultado: $($script:ok) OK, $($script:fail) fallas (Windows, PowerShell $($PSVersionTable.PSVersion))"
