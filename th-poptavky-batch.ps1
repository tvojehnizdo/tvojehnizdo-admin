# KOŘEN PROJEKTU
cd C:\Projekty\tvojehnizdo-admin
$ErrorActionPreference = "Stop"
$Origin = "http://127.0.0.1:3002"
$Imports = Join-Path $PWD "imports"
$CsvIn   = Join-Path $Imports "poptavky.csv"
$Exports = Join-Path $PWD "exports"

function Log([string]$m,[string]$color="Gray"){ Write-Host $m -ForegroundColor $color }
function Wait-Health([string]$origin,[int]$sec=60){
  for($i=0;$i -lt [Math]::Ceiling($sec/2);$i++){
    try{ $r=Invoke-RestMethod "$origin/api/health" -TimeoutSec 2; if($r.ok){ return $true } }catch{}; Start-Sleep 2
  }; return $false
}

Log "=== Kontroluji dev server  $Origin ===" "Cyan"
if(-not (Wait-Health $Origin 2)){
  if(Test-Path ".\th-oneclick.ps1"){
    Log "Spouštím th-oneclick.ps1" "Yellow"
    pwsh -NoProfile -ExecutionPolicy Bypass -File .\th-oneclick.ps1
  } else {
    if(Test-Path .\.next){ Remove-Item .\.next -Recurse -Force }
    $dev=(Get-Command pnpm -ErrorAction SilentlyContinue) ? "pnpm dev -- -p 3002 -H 127.0.0.1" : "npm run dev -- -p 3002 -- -H 127.0.0.1"
    Start-Process pwsh -ArgumentList @("-NoExit","-Command","Set-Location `"$PWD`"; $dev")
  }
  if(-not (Wait-Health $Origin 90)){ throw "Dev server se nerozběhl - koukni do okna se serverem." }
}
Log "Health OK: $Origin" "Green"

# === Získání vstupu: Sheets  fallback CSV ===
$rows = @()
$envTxt = (Test-Path ".\.env.local") ? (Get-Content ".\.env.local" -Raw) : ""
$hasSheets = ($envTxt -match "(?m)^POPTAVKY_SHEETS_ID=" -and $envTxt -match "(?m)^GOOGLE_SERVICE_ACCOUNT_JSON=")

if($hasSheets){
  Log "Zkouším načíst z Google Sheets (/api/poptavky/fetch)" "Cyan"
  try{
    $fetch = Invoke-RestMethod "$Origin/api/poptavky/fetch" -Method Get -TimeoutSec 30
    $rows = @($fetch.rows)
    Log "Načteno ze Sheets: $($rows.Count) záznamů." "Green"
  }catch{
    Log "  Sheets fetch selhal: $($_.Exception.Message)" "Yellow"
  }
}

if($rows.Count -eq 0){
  Log "Fallback: načítám lokální CSV  $CsvIn" "Cyan"
  if(-not (Test-Path $CsvIn)){ throw "Chybí $CsvIn (vytvořil jsem šablonu - doplň a spusť znovu)" }
  $rows = Import-Csv -Path $CsvIn
  # Pro lokální CSV si dopočítáme idx (číslo řádku ~ 1-based + header)
  $i=2; $rows = $rows | ForEach-Object { $_ | Add-Member -NotePropertyName idx -NotePropertyValue $i -Force; $i++; $_ }
  Log "Načteno z CSV: $($rows.Count) záznamů." "Green"
}

if(-not $rows.Count){ Log "Nenalezeny žádné vstupy - končím." "Yellow"; exit 0 }

# === Klasifikace přes /api/ai/status ===
Log "Klasifikuji $($rows.Count) záznamů" "Cyan"
$results = New-Object System.Collections.Generic.List[object]
$ok=0; $fail=0
foreach($r in $rows){
  $inquiry = @"
Jméno: $($r.jmeno)
E-mail: $($r.email)
Poznámka: $($r.poznamka)
Konfigurace: $($r.konfigurace)
"@
  try{
    $res = Invoke-RestMethod "$Origin/api/ai/status" -Method Post -ContentType "application/json" -Body (@{ inquiry = $inquiry } | ConvertTo-Json -Depth 4)
    $results.Add([pscustomobject]@{ idx=($r.idx ?? ""); datum=($r.datum ?? ""); jmeno=$r.jmeno; email=$r.email; status=$res.status; reason=$res.reason })
    $ok++
  }catch{
    $results.Add([pscustomobject]@{ idx=($r.idx ?? ""); datum=($r.datum ?? ""); jmeno=$r.jmeno; email=$r.email; status="Error"; reason=$_.Exception.Message })
    $fail++
  }
}
Log "Hotovo: OK=$ok, Fail=$fail" "Green"

# === Export CSV ===
if(-not (Test-Path $Exports)){ New-Item -ItemType Directory -Force -Path $Exports | Out-Null }
$csvPath = Join-Path $Exports ("poptavky_status-"+(Get-Date -Format "yyyyMMdd-HHmm")+".csv")
$results | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
Log "CSV export  $csvPath" "Green"

# === Append do Sheets (pokud jsou envy) ===
if($hasSheets){
  try{
    $values = @(); foreach($x in $results){ $values += ,(@( (Get-Date).ToString("s"), $x.idx, $x.jmeno, $x.email, $x.status, $x.reason )) }
    $append = Invoke-RestMethod "$Origin/api/poptavky/append-status" -Method Post -ContentType "application/json" -Body (@{ values = $values } | ConvertTo-Json -Depth 5)
    Log "Sheets append OK: $($append.count) řádků." "Green"
  }catch{
    Log "  Sheets append selhal: $($_.Exception.Message)" "Yellow"
  }
}else{
  Log "Sheets zápis přeskočen (není POPTAVKY_SHEETS_ID/GOOGLE_SERVICE_ACCOUNT_JSON)." "Yellow"
}

Log "HOTOVO - výsledky v CSV + (pokud nastaveno) zapsány do Sheets." "Cyan"
