# KOŘEN PROJEKTU
cd C:\Projekty\tvojehnizdo-admin
function Upsert([string]$k,[string]$v){ $p=".\\.env.local"; $t=Get-Content $p -Raw; if($t -match "(?m)^$k="){ $t=($t -replace "(?m)^$k=.*","$k=$v") } else { $t+="`r`n$k=$v" }; $t|Set-Content $p -Encoding UTF8 }
Upsert "MARKETING_ENABLED" "true"
Upsert "NEXT_PUBLIC_MARKETING" "true"
Copy-Item .\public\robots.marketing-on.txt .\public\robots.txt -Force
if (Test-Path .\marketing\content) {
  Get-ChildItem .\marketing\content -Filter *.md | ForEach-Object {
    $raw=Get-Content $_.FullName -Raw
    $raw=$raw -replace 'status:\s*draft','status: published'
    $raw|Set-Content $_.FullName -Encoding UTF8
  }
}
Write-Host "Marketing povolen. Pro prod nezapomeň re-deploy." -ForegroundColor Green
