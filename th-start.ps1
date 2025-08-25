# KOŘEN PROJEKTU (pevně na 1. řádku)
cd C:\Projekty\tvojehnizdo-admin

# === Tvoje Hnízdo – auto start + wait + smoke tests ===
$ErrorActionPreference = "Stop"
$BindHost = "127.0.0.1"
$Port     = 3002

# 0) Kontrola nástrojů
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js není nainstalovaný (potřeba v18+)." }

# 1) Uvolni port (pro jistotu)
Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { try { Stop-Process -Id $_ -Force } catch {} }

# 2) ENV – sjednoť CORS a BASE_URL na zvolený port/host
$envp = ".\.env.local"
if (-not (Test-Path $envp)) { New-Item -ItemType File -Path $envp | Out-Null }
$envTxt = Get-Content $envp -Raw
$allowed = "AI_ALLOWED_ORIGINS=http://${BindHost}:${Port},https://tvojehnizdo.com,https://admin.tvojehnizdo.com"
if ($envTxt -match '(?m)^AI_ALLOWED_ORIGINS=') { $envTxt = ($envTxt -replace '(?m)^AI_ALLOWED_ORIGINS=.*', $allowed) } else { $envTxt += "`r`n$allowed" }
$baseUrl = "NEXT_PUBLIC_BASE_URL=http://${BindHost}:${Port}"
if ($envTxt -match '(?m)^NEXT_PUBLIC_BASE_URL=') { $envTxt = ($envTxt -replace '(?m)^NEXT_PUBLIC_BASE_URL=.*', $baseUrl) } else { $envTxt += "`r`n$baseUrl" }
if ($envTxt -notmatch '(?m)^OPENAI_MODEL=') { $envTxt += "`r`nOPENAI_MODEL=gpt-4o-mini" }
$envTxt | Set-Content $envp -Encoding UTF8

# 3) Čistý start dev serveru do nového okna (bind na 127.0.0.1)
if (Test-Path .\.next) { Remove-Item .\.next -Recurse -Force }
$DevCmd = if (Get-Command pnpm -ErrorAction SilentlyContinue) { "pnpm dev -- -p $Port -H $BindHost" } else { "npm run dev -- -p $Port -- -H $BindHost" }
Start-Process pwsh -ArgumentList @("-NoExit","-Command","Set-Location `"$PWD`"; $DevCmd")

# 4) Počkej na /api/health (max 90 s)
$Origin = "http://${BindHost}:${Port}"
$healthy = $false
for ($i=0; $i -lt 45; $i++) {
  try {
    $r = Invoke-RestMethod "$Origin/api/health" -TimeoutSec 2
    if ($r.ok) { $healthy = $true; break }
  } catch {}
  Start-Sleep 2
}
if (-not $healthy) {
  Write-Host "⚠️  Server na $Origin zatím neodpovídá. Zkontroluj okno s dev serverem (první červená hláška)." -ForegroundColor Yellow
  exit 1
}
Write-Host "✅ Health OK na $Origin" -ForegroundColor Green

# 5) Smoke testy AI endpointů
try {
  $body = @{ messages = @(@{ role="user"; content="Jednou větou: co je Tvoje Hnízdo?"}) } | ConvertTo-Json -Depth 5
  $chat = Invoke-RestMethod "$Origin/api/ai/chat" -Method Post -ContentType "application/json" -Headers @{ Origin=$Origin } -Body $body
  $preview = ($chat.content ?? "")
  Write-Host ("AI chat OK: " + $preview.Substring(0, [Math]::Min(120, [Math]::Max(0, $preview.Length)))) -ForegroundColor Green
} catch { Write-Host ("❌ AI chat selhal: " + $_.Exception.Message) -ForegroundColor Red }

try {
  $tool = @{ name="computePrice"; input=@{ area=80; standard="na_klic" } } | ConvertTo-Json
  $res  = Invoke-RestMethod "$Origin/api/ai/tools" -Method Post -ContentType "application/json" -Headers @{ Origin=$Origin } -Body $tool
  Write-Host ("AI tools OK: " + ($res | ConvertTo-Json -Depth 5)) -ForegroundColor Green
} catch { Write-Host ("❌ AI tools selhaly: " + $_.Exception.Message) -ForegroundColor Red }

# 6) Otevři užitečné stránky
Start-Process "$Origin/api/health"
Start-Process "$Origin/ai-chat-embed"
Start-Process "$Origin/admin/ai-odpoved"

Write-Host "HOTOVO – dev běží na $Origin" -ForegroundColor Cyan
