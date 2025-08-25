# KOŘEN PROJEKTU
cd C:\Projekty\tvojehnizdo-admin
$ErrorActionPreference="Stop"; $BindHost="127.0.0.1"; $Ports=3002..3004

function Upsert([string]$k,[string]$v){ $p=".\\.env.local"; if(-not(Test-Path $p)){New-Item -ItemType File -Path $p|Out-Null}; $t=Get-Content $p -Raw; if($t -match "(?m)^$k="){ $t=($t -replace "(?m)^$k=.*","$k=$v") } else { $t+="`r`n$k=$v" }; $t|Set-Content $p -Encoding UTF8 }
function Wait-Health([string]$o,[int]$s=90){ for($i=0;$i -lt [Math]::Ceiling($s/2);$i++){ try{$r=Invoke-RestMethod "$o/api/health" -TimeoutSec 2; if($r.ok){return $true}}catch{}; Start-Sleep 2 }; return $false }

# vyber port a srovnej ENV (nešahá na tajné KEY/BASE)
$Port = ($Ports | Where-Object { -not (Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue) } | Select-Object -First 1); if(-not $Port){$Port=3002}
Upsert "AI_ALLOWED_ORIGINS" "http://127.0.0.1:$Port,https://tvojehnizdo.com,https://admin.tvojehnizdo.com"
Upsert "NEXT_PUBLIC_BASE_URL" "http://127.0.0.1:$Port"
if(-not (Get-Content .\.env.local -Raw) -match '(?m)^OPENAI_MODEL='){ Upsert "OPENAI_MODEL" "gpt-4o-mini" }

# uvolni porty 3002..3004 a smaž cache
foreach($p in $Ports){ Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select -Expand OwningProcess -Unique | % { try{ Stop-Process -Id $_ -Force }catch{} } }
if(Test-Path .\.next){ Remove-Item .\.next -Recurse -Force }

# start dev v novém okně (bind 127.0.0.1)
$dev=(Get-Command pnpm -ErrorAction SilentlyContinue) ? "pnpm dev -- -p $Port -H 127.0.0.1" : "npm run dev -- -p $Port -- -H 127.0.0.1"
Start-Process pwsh -ArgumentList @("-NoExit","-Command","Set-Location `"$PWD`"; $dev")

# čekej na health
$origin="http://127.0.0.1:$Port"
if(-not (Wait-Health $origin 90)){ throw "Dev server se nerozběhl – mrkni do okna se serverem (první červená hláška)." }

# smoke testy
try{
  $body=@{messages=@(@{role="user";content="Jednou větou: co je Tvoje Hnízdo?"})}|ConvertTo-Json -Depth 5
  $chat=Invoke-RestMethod "$origin/api/ai/chat" -Method Post -ContentType "application/json" -Headers @{Origin=$origin} -Body $body
  Write-Host ("AI chat OK: " + (($chat.content ?? "") -replace '\r?\n',' ') ).Substring(0, [Math]::Min(120, [Math]::Max(0, ($chat.content ?? "").Length))) -ForegroundColor Green
}catch{ Write-Host ("❌ AI chat selhal: " + $_.Exception.Message) -ForegroundColor Red }

try{
  $tool=@{name="computePrice";input=@{area=80;standard="na_klic"}}|ConvertTo-Json
  $res =Invoke-RestMethod "$origin/api/ai/tools" -Method Post -ContentType "application/json" -Headers @{Origin=$origin} -Body $tool
  Write-Host ("AI tools OK: " + ($res|ConvertTo-Json -Depth 5)) -ForegroundColor Green
}catch{ Write-Host ("❌ AI tools selhaly: " + $_.Exception.Message) -ForegroundColor Red }

Start-Process "$origin/api/health"
Start-Process "$origin/ai-chat-embed"
Start-Process "$origin/admin/ai-odpoved"
Write-Host "HOTOVO – dev běží na $origin" -ForegroundColor Cyan
