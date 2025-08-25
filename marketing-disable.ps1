# KOŘEN PROJEKTU
cd C:\Projekty\tvojehnizdo-admin
function Upsert([string]$k,[string]$v){ $p=".\\.env.local"; $t=Get-Content $p -Raw; if($t -match "(?m)^$k="){ $t=($t -replace "(?m)^$k=.*","$k=$v") } else { $t+="`r`n$k=$v" }; $t|Set-Content $p -Encoding UTF8 }
Upsert "MARKETING_ENABLED" "false"
Upsert "NEXT_PUBLIC_MARKETING" "false"
Copy-Item .\public\robots.marketing-off.txt .\public\robots.txt -Force
Write-Host "Marketing vypnut (skrytý)." -ForegroundColor Yellow
