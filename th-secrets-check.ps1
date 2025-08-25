# KOŘEN PROJEKTU
cd C:\Projekty\tvojehnizdo-admin
$ErrorActionPreference = "Stop"
$BindHost = "127.0.0.1"
$Port     = 3002

function IsValidBase($v){ return $v -and ($v -match '^https?://.+/v1/?$') }
function IsValidKey($v){
  if(-not $v){return $false}
  if($v -match 'sk-tvuj|placeholder|changeme'){return $false}
  return ($v -match '^sk-[A-Za-z0-9_\-]{12,}$')
}
function Upsert([string]$k,[string]$v){
  if($script:envTxt -match "(?m)^$k="){ $script:envTxt = ($script:envTxt -replace "(?m)^$k=.*","$k=$v") }
  else { $script:envTxt += "`r`n$k=$v" }
}

# 1) Načti aktuální .env.local
$envp = ".\.env.local"
if(-not (Test-Path $envp)){ New-Item -ItemType File -Path $envp | Out-Null }
$envTxt = Get-Content $envp -Raw
$base = [regex]::Match($envTxt,'(?m)^OPENAI_API_BASE=(.+)$').Groups[1].Value.Trim()
$key  = [regex]::Match($envTxt,'(?m)^OPENAI_API_KEY=(.+)$').Groups[1].Value.Trim()

# 2) Pokud chybí/je špatně, zkus nejdřív najít (bez dotazu)
# 2a) Windows Credential Manager (OPENAI_API_BASE, OPENAI_API_KEY)
try{
  if(-not (IsValidKey $key)){
    Import-Module CredentialManager -ErrorAction SilentlyContinue
    $credKey = Get-StoredCredential -Target 'OPENAI_API_KEY'
    if($credKey){ $key = $credKey.Password }
  }
  if(-not (IsValidBase $base)){
    $credBase = Get-StoredCredential -Target 'OPENAI_API_BASE'
    if($credBase){ $base = ($credBase.Password ?? $credBase.Username) }
  }
}catch{}

# 2b) Souborový trezor (C:\Projekty\trezor\openai.json) – { "base": ".../v1", "key": "sk-..." }
$vault = 'C:\Projekty\trezor\openai.json'
if(Test-Path $vault){
  try{
    $json = Get-Content $vault -Raw | ConvertFrom-Json
    if(-not (IsValidBase $base) -and $json.base){ $base = "$($json.base)".Trim() }
    if(-not (IsValidKey  $key ) -and $json.key ){ $key  = "$($json.key)".Trim()  }
  }catch{}
}

# 2c) Až jako poslední možnost – interaktivně
if(-not (IsValidBase $base)){ $base = Read-Host "OPENAI_API_BASE (např. https://api.openai.com/v1)" }
if(-not (IsValidKey  $key )){
  $sec = Read-Host "OPENAI_API_KEY (sk-…)" -AsSecureString
  $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

# 3) Zapiš .env.local + sjednoť další envy
$envTxt = Get-Content $envp -Raw
Upsert "OPENAI_API_BASE" $base
Upsert "OPENAI_API_KEY"  $key
if($envTxt -notmatch "(?m)^OPENAI_MODEL="){ $envTxt += "`r`nOPENAI_MODEL=gpt-4o-mini" }
Upsert "AI_ALLOWED_ORIGINS" "http://${BindHost}:${Port},https://tvojehnizdo.com,https://admin.tvojehnizdo.com"
Upsert "NEXT_PUBLIC_BASE_URL" "http://${BindHost}:${Port}"
$envTxt | Set-Content $envp -Encoding UTF8

# 4) Pokud health neodpovídá, restartni dev (bind na 127.0.0.1)
function Wait-Health([string]$origin,[int]$sec=90){
  for($i=0;$i -lt [Math]::Ceiling($sec/2);$i++){
    try{ $r=Invoke-RestMethod "$origin/api/health" -TimeoutSec 2; if($r.ok){ return $true } }catch{}
    Start-Sleep 2
  }; return $false
}
$Origin = "http://${BindHost}:${Port}"
$ok = $false
try{ $ok = Wait-Health $Origin 1 }catch{ $ok = $false }
if(-not $ok){
  if (Test-Path .\.next) { Remove-Item .\.next -Recurse -Force }
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force } catch {} }
  $DevCmd = if (Get-Command pnpm -ErrorAction SilentlyContinue) { "pnpm dev -- -p $Port -H $BindHost" } else { "npm run dev -- -p $Port -- -H $BindHost" }
  Start-Process pwsh -ArgumentList @("-NoExit","-Command","Set-Location `"$PWD`"; $DevCmd")
  if(-not (Wait-Health $Origin 90)){ throw "Dev server se nerozběhl – mrkni do okna s chybou." }
}

# 5) Smoke testy AI endpointů (chat + tools)
try{
  $body = @{ messages = @(@{ role="user"; content="Jednou větou: co je Tvoje Hnízdo?"}) } | ConvertTo-Json -Depth 5
  $chat = Invoke-RestMethod "$Origin/api/ai/chat" -Method Post -ContentType "application/json" -Headers @{ Origin=$Origin } -Body $body
  Write-Host ("AI chat OK: " + ($chat.content ?? "")) -ForegroundColor Green
}catch{ Write-Host ("❌ AI chat selhal: " + $_.Exception.Message) -ForegroundColor Red }

try{
  $tool = @{ name="computePrice"; input=@{ area=80; standard="na_klic" } } | ConvertTo-Json
  $res  = Invoke-RestMethod "$Origin/api/ai/tools" -Method Post -ContentType "application/json" -Headers @{ Origin=$Origin } -Body $tool
  Write-Host ("AI tools OK: " + ($res | ConvertTo-Json -Depth 5)) -ForegroundColor Green
}catch{ Write-Host ("❌ AI tools selhaly: " + $_.Exception.Message) -ForegroundColor Red }

# 6) Otevři hlavní stránky
Start-Process "$Origin/api/health"
Start-Process "$Origin/ai-chat-embed"
Start-Process "$Origin/admin/ai-odpoved"
