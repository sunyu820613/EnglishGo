# Batch-synthesizes plain English text segments to WAV files via SAPI.
# Input: a JSON manifest [{ "id": "...", "text": "..." }, ...] (plain ASCII
# English only -- no IPA needed here, so no unicode-in-.ps1-source risk).
# Output: one WAV per entry at <OutDir>/<id>.wav (44.1kHz/16-bit/mono).

param(
    [Parameter(Mandatory = $true)][string]$ManifestPath,
    [Parameter(Mandatory = $true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutDir | Out-Null

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' -and $_.Enabled } | Select-Object -First 1
if ($voice) { $synth.SelectVoice($voice.VoiceInfo.Name); Write-Host "Voice: $($voice.VoiceInfo.Name)" }
$synth.Rate = -2
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

$manifest = [System.IO.File]::ReadAllText($ManifestPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

foreach ($entry in $manifest) {
    $out = Join-Path $OutDir "$($entry.id).wav"
    $synth.SetOutputToWaveFile($out, $fmt)
    $synth.Speak($entry.text)
    $synth.SetOutputToNull()
    Write-Host "OK $($entry.id): $($entry.text)"
}

$synth.Dispose()
Write-Host "Batch TTS complete: $($manifest.Count) segments."
