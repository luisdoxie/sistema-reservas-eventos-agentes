$Root = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { (Get-Location).Path }
$Log = Join-Path $Root '.agents\hooks.log'
function Write-HookLog($fase, $msg) { "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') $fase $msg" | Add-Content $Log -Encoding UTF8 }
