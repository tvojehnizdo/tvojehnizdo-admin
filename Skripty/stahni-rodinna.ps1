# === CRAWL CELÉHO WEBNODE WEBU → STÁHNOUT OBRÁZKY DO SLOŽEK NA PLOŠE ===
# Funguje i když se mění slugy; začne z homepage a projde odkazy do hloubky 2.
$StartUrl  = "https://tvojehnizdo.webnode.cz/"
$Desktop   = [Environment]::GetFolderPath("Desktop")
$OutRoot   = Join-Path $Desktop "TvojeHnizdo-Obrazky"
New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

# Lepší TLS pro starší endpointy
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function AbsUrl([string]$base, [string]$maybe) {
  try {
    $u = [Uri]$maybe
    if ($u.IsAbsoluteUri) { return $u.AbsoluteUri }
    $b = [Uri]$base
    return (New-Object System.Uri($b, $maybe)).AbsoluteUri
  } catch { return $null }
}

function DetectNumber([string]$s) {
  $m = [regex]::Match($s, '(\d{2,3})\s?(?:m2|m²)?', 'IgnoreCase')
  if ($m.Success) { return $m.Groups[1].Value } else { return $null }
}

function DetectCategory([string]$urlOrHtml) {
  $t = $urlOrHtml.ToLower()
  if ($t -match 'lux|premium|villa|reziden') { return 'Luxusni-hnizda' }
  if ($t -match 'mini|tiny|kompakt')        { return 'Mini-hnizda' }
  if ($t -match 'rekre|chata|chalup')       { return 'Rekreacni-hnizda' }
  return 'Rodinna-hnizda'
}

function CleanTitle([string]$html) {
  $t = [regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase').Groups[1].Value
  if (-not $t) { $t = [regex]::Match($html, '<h1[^>]*>(.*?)</h1>', 'IgnoreCase').Groups[1].Value }
  $t = ($t -replace '<.*?>','') -replace '&nbsp;',' ' -replace '&amp;','&'
  return $t.Trim()
}

function BigImage([string]$u) {
  # odfiltruj thumbnaily/ikony
  if ($u -match '(\bthumb\b|\bsmall\b|\bicon\b|/(\d{1,3})x(\d{1,3})/|[\?&]w=\d{2,3}\b)') { return $false }
  return $true
}

$hostName = ([Uri]$StartUrl).Host
$queue = New-Object System.Collections.Generic.Queue[string]
$seen  = New-Object System.Collections.Generic.HashSet[string]
$details = New-Object System.Collections.Generic.HashSet[string]

$queue.Enqueue($StartUrl)

$maxDepth = 2
$mapDepth = @{ }
$mapDepth[$StartUrl] = 0

Write-Host "Procházím web od: $StartUrl" -ForegroundColor Cyan

while ($queue.Count -gt 0) {
  $url = $queue.Dequeue()
  if ($seen.Contains($url)) { continue }
  $seen.Add($url) | Out-Null

  $depth = $mapDepth[$url]
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{ "User-Agent"="Mozilla/5.0" }
  } catch {
    continue
  }

  # Detaily domů: URL obsahující "hnizdo-XXm2"
  if ($url -match 'hnizdo-\d{2,3}m2') {
    $details.Add($url) | Out-Null
  }

  if ($depth -ge $maxDepth) { continue }

  foreach ($a in $resp.Links) {
    $href = $a.href
    if (-not $href) { continue }
    $abs = AbsUrl $url $href
    if (-not $abs) { continue }
    try { $u = [Uri]$abs } catch { continue }
    if ($u.Host -ne $hostName) { continue }
    if ($abs -match '\.(css|js|pdf|zip|doc|ico|svg)$') { continue }
    if (-not $mapDepth.ContainsKey($abs)) {
      $mapDepth[$abs] = $depth + 1
      $queue.Enqueue($abs)
    }
  }
}

Write-Host ("Nalezeno detailů domů: {0}" -f $details.Count) -ForegroundColor Green

foreach ($detail in $details) {
  Write-Host "`nZpracovávám: $detail" -ForegroundColor Yellow
  try {
    $page = Invoke-WebRequest -Uri $detail -UseBasicParsing -Headers @{ "User-Agent"="Mozilla/5.0" }
  } catch { continue }

  $html = $page.Content
  $num = DetectNumber("$detail $html")
  $catFolder = DetectCategory("$detail $html")
  $outCat = Join-Path $OutRoot $catFolder
  New-Item -ItemType Directory -Force -Path $outCat | Out-Null

  $folderName = if ($num) { "Hnízdo $num" } else { CleanTitle $html }
  if (-not $folderName) { $folderName = "Hnízdo" }
  $houseDir = Join-Path $outCat $folderName
  New-Item -ItemType Directory -Force -Path $houseDir | Out-Null

  # obrázky z detailu
  $imgs = $page.Images | Where-Object { $_.src -match '\.(jpg|jpeg|png|webp)$' } |
          ForEach-Object { AbsUrl $detail $_.src } |
          Where-Object { $_ -and (BigImage $_) } |
          Select-Object -Unique

  $i = 1
  foreach ($imgUrl in $imgs) {
    $ext = [IO.Path]::GetExtension($imgUrl); if (-not $ext) { $ext = ".jpg" }
    $file = if ($num) { if ($i -eq 1) { "hnizdo-$num$ext" } else { "hnizdo-$num-$i$ext" } } else { "dum-$i$ext" }
    $target = Join-Path $houseDir $file
    try {
      Invoke-WebRequest -Uri $imgUrl -OutFile $target -Headers @{ "User-Agent"="Mozilla/5.0" }
      Write-Host "  Uloženo: $target"
    } catch {
      Write-Host "  CHYBA: $imgUrl" -ForegroundColor Red
    }
    $i++
  }
}

Write-Host "`nHOTOVO ✅ Obrázky na ploše: $OutRoot" -ForegroundColor Green
