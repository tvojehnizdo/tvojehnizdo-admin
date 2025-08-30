# === STAŽENÍ VŠECH DOMŮ (RODINNÁ HNÍZDA) Z WEBNODE NA PLOCHU ===
$CategoryUrl = "https://tvojehnizdo.webnode.cz/rodinna-hnizda-60-100-m2/"   # URL kategorie
$Desktop     = [Environment]::GetFolderPath("Desktop")
$OutRoot     = Join-Path $Desktop "TvojeHnizdo-Obrazky\Rodinna-hnizda"
New-Item -ItemType Directory -Force -Path $OutRoot | Out-Null

function Get-AbsUrl([string]$base, [string]$maybe) {
  try {
    $u = [Uri]$maybe
    if ($u.IsAbsoluteUri) { return $u.AbsoluteUri }
    $b = [Uri]$base
    return (New-Object System.Uri($b, $maybe)).AbsoluteUri
  } catch { return $null }
}

function Detect-Number([string]$s) {
  $m = [regex]::Match($s, '(\d{2,3})\s?(?:m2|m²)?', 'IgnoreCase')
  if ($m.Success) { return $m.Groups[1].Value }
  return $null
}

function Clean-Name([string]$title) {
  $title = $title -replace '<.*?>',''
  $title = $title -replace '&nbsp;',' '
  $title = $title.Trim()
  return $title
}

Write-Host "Načítám kategorii: $CategoryUrl" -ForegroundColor Cyan
$cat = Invoke-WebRequest -Uri $CategoryUrl -UseBasicParsing

# Najdi odkazy na detail domů
$detailUrls = @()
foreach ($a in $cat.Links) {
  $href = $a.href
  if ($href -match "hnizdo-\d{2,3}") {
    $detailUrls += (Get-AbsUrl $CategoryUrl $href)
  }
}
$detailUrls = $detailUrls | Sort-Object -Unique
Write-Host "Nalezeno domů:" $detailUrls.Count -ForegroundColor Green

foreach ($url in $detailUrls) {
  Write-Host "`nZpracovávám dům:" $url -ForegroundColor Yellow
  $page = Invoke-WebRequest -Uri $url -UseBasicParsing
  $html = $page.Content

  # číslo domu a název složky
  $num = Detect-Number $url
  $title = Clean-Name ($page.ParsedHtml.title)
  if ($num) { $folder = "Hnízdo $num" } else { $folder = $title }
  $houseDir = Join-Path $OutRoot $folder
  New-Item -ItemType Directory -Force -Path $houseDir | Out-Null

  # najdi všechny obrázky
  $imgs = $page.Images | Where-Object { $_.src -match "\.(jpg|jpeg|png|webp)$" }
  $i = 1
  foreach ($img in $imgs) {
    $imgUrl = Get-AbsUrl $url $img.src
    $ext = [IO.Path]::GetExtension($imgUrl)
    if (-not $ext) { $ext = ".jpg" }

    # hlavní obrázek = hnizdo-XX.jpg, ostatní hnizdo-XX-2.jpg …
    $fileName = if ($i -eq 1 -and $num) { "hnizdo-$num$ext" } elseif ($num) { "hnizdo-$num-$i$ext" } else { "dum-$i$ext" }
    $target = Join-Path $houseDir $fileName

    try {
      Invoke-WebRequest -Uri $imgUrl -OutFile $target -Headers @{ "User-Agent"="Mozilla/5.0" }
      Write-Host "  Uloženo: $target"
    } catch {
      Write-Host "  CHYBA: $imgUrl" -ForegroundColor Red
    }
    $i++
  }
}
Write-Host "`nHOTOVO ✅ Obrázky jsou uložené v $OutRoot" -ForegroundColor Green
