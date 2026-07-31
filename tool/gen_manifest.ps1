# Regenerates assets/manifests/manifest.json from files on disk.
# Preserves humanReviewed/source/license fields of existing entries; recomputes bytes/sha256.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$manifestPath = Join-Path $assets 'manifests/manifest.json'

$existing = @{}
if (Test-Path $manifestPath) {
    # Get-Content -Raw mis-decodes UTF8 (no BOM) on this system, mangling
    # non-ASCII text (e.g. the Chinese license notes) -- read raw bytes
    # with an explicit UTF8 decoder instead.
    $old = [System.IO.File]::ReadAllText($manifestPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    foreach ($e in $old.assets) { $existing[$e.file] = $e }
}

function Get-Kind([string]$rel) {
    if ($rel -like 'images/words/*') { return 'wordImage' }
    if ($rel -like 'images/mascots/*') { return 'mascot' }
    if ($rel -like 'images/themes/*') { return 'scene' }
    if ($rel -like 'audio/letters/*_name.m4a') { return 'letterAudio' }
    if ($rel -like 'audio/letters/*_phonics.m4a') { return 'phonicsAudio' }
    if ($rel -like 'audio/words/*') { return 'wordAudio' }
    if ($rel -like 'audio/phrases/*') { return 'phraseAudio' }
    if ($rel -like 'audio/sfx/*') { return 'sfx' }
    if ($rel -like 'audio/bgm/*') { return 'bgm' }
    if ($rel -like 'fonts/*') { return 'font' }
    return 'other'
}

$patterns = @('images', 'audio', 'fonts')
$entries = @()
foreach ($p in $patterns) {
    $dir = Join-Path $assets $p
    if (-not (Test-Path $dir)) { continue }
    foreach ($f in Get-ChildItem $dir -Recurse -File | Where-Object { $_.Extension -in '.webp', '.png', '.m4a', '.wav', '.ttf', '.otf' }) {
        $rel = $f.FullName.Substring($assets.Length + 1).Replace('\', '/')
        $kind = Get-Kind $rel
        $prev = $existing[$rel]
        $letter = $null; $word = $null
        if ($rel -match '^audio/letters/([a-z])_') { $letter = $Matches[1].ToUpper() }
        if ($rel -match '^audio/words/([a-z_]+)\.') { $word = $Matches[1] }
        if ($rel -match '^audio/phrases/([a-z])_is_for_([a-z_]+)\.') { $letter = $Matches[1].ToUpper(); $word = $Matches[2] }
        if ($rel -match '^images/words/([a-z_]+)\.') { $word = $Matches[1] }
        $isFont = $kind -eq 'font'
        $entries += [ordered]@{
            file          = $rel
            kind          = $kind
            letter        = if ($prev -and $prev.letter) { $prev.letter } else { $letter }
            word          = if ($prev -and $prev.word) { $prev.word } else { $word }
            theme         = if ($prev) { $prev.theme } else { $null }
            source        = if ($prev -and $prev.source) { $prev.source } else { if ($isFont) { 'licensed' } else { 'generated' } }
            sourceDetail  = if ($prev -and $prev.sourceDetail) { $prev.sourceDetail } else { if ($isFont) { 'Google Fonts repo' } else { 'Windows SAPI placeholder (tool/gen_placeholder_audio.ps1)' } }
            license       = if ($prev -and $prev.license) { $prev.license } else { if ($isFont) { 'OFL' } else { 'placeholder-dev-only' } }
            width         = if ($prev) { $prev.width } else { $null }
            height        = if ($prev) { $prev.height } else { $null }
            bytes         = $f.Length
            sha256        = (Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLower()
            humanReviewed = if ($prev) { [bool]$prev.humanReviewed } else { $false }
            placeholder   = if ($prev -and $null -ne $prev.placeholder) { [bool]$prev.placeholder } else { -not $isFont }
        }
    }
}

New-Item -ItemType Directory -Force (Split-Path -Parent $manifestPath) | Out-Null
$doc = [ordered]@{ schemaVersion = 1; generatedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'); assets = $entries }
$doc | ConvertTo-Json -Depth 5 | Set-Content $manifestPath -Encoding utf8
Write-Host "Manifest written: $($entries.Count) assets"
