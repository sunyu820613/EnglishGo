# Generates PLACEHOLDER audio for development only.
# TODO(audio): replace with licensed native en-US recordings before release.
# Pipeline: Windows SAPI (System.Speech) -> WAV -> ffmpeg AAC m4a 64k mono 44.1kHz.
# Output paths match assets/data/alphabet.json exactly.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$tmpDir = Join-Path $env:TEMP 'englishgo_tts'
New-Item -ItemType Directory -Force $tmpDir | Out-Null

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' -and $_.Enabled } | Select-Object -First 1
if ($voice) { $synth.SelectVoice($voice.VoiceInfo.Name); Write-Host "Voice: $($voice.VoiceInfo.Name)" }
else { Write-Warning 'No en-US voice found, using default.' }
$synth.Rate = -2

$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

function New-SpeechFile([string]$text, [string]$relPath) {
    $out = Join-Path $assets $relPath
    $outDir = Split-Path -Parent $out
    New-Item -ItemType Directory -Force $outDir | Out-Null
    if (Test-Path $out) { return }
    $wav = Join-Path $tmpDir 'tmp.wav'
    $synth.SetOutputToWaveFile($wav, $fmt)
    $synth.Speak($text)
    $synth.SetOutputToNull()
    & ffmpeg -hide_banner -loglevel error -y -i $wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1' -ac 1 -ar 44100 -c:a aac -b:a 64k $out
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relPath" }
    Write-Host "OK $relPath"
}

# Approximate phonics phrases (placeholder quality only).
$phonics = @{
    'A' = 'A says ah. ah, ah, Apple!'
    'B' = 'B says buh. buh, buh, Ball!'
    'C' = 'C says kuh. kuh, kuh, Cat!'
    'D' = 'D says duh. duh, duh, Dog!'
    'E' = 'E says eh. eh, eh, Egg!'
    'F' = 'F says fff. fff, fff, Fish!'
    'G' = 'G says guh. guh, guh, Goat!'
    'H' = 'H says huh. huh, huh, Hat!'
    'I' = 'I says ih. ih, ih, Iguana! And sometimes I says its name, like Ice cream!'
    'J' = 'J says juh. juh, juh, Juice!'
    'K' = 'K says kuh. kuh, kuh, Kite!'
    'L' = 'L says lll. lll, lll, Lion!'
    'M' = 'M says mmm. mmm, mmm, Moon!'
    'N' = 'N says nnn. nnn, nnn, Nest!'
    'O' = 'O says ah. ah, ah, Orange! Owl starts with O too, listen closely!'
    'P' = 'P says puh. puh, puh, Panda!'
    'Q' = 'Q says kwuh. kwuh, kwuh, Queen!'
    'R' = 'R says rrr. rrr, rrr, Rabbit!'
    'S' = 'S says sss. sss, sss, Sun!'
    'T' = 'T says tuh. tuh, tuh, Tiger!'
    'U' = 'U says uh. uh, uh, Umbrella! And sometimes U says its name, like Unicorn!'
    'V' = 'V says vvv. vvv, vvv, Van!'
    'W' = 'W says wuh. wuh, wuh, Whale!'
    'X' = 'X can sound like z, like Xylophone. At the end of words it sounds like ks, like fox and X-ray!'
    'Y' = 'Y says yuh. yuh, yuh, Yak!'
    'Z' = 'Z says zzz. zzz, zzz, Zebra!'
}

$data = Get-Content (Join-Path $assets 'data/alphabet.json') -Raw | ConvertFrom-Json
foreach ($entry in $data.letters) {
    $L = $entry.letter
    New-SpeechFile "$L!" $entry.letterAudio
    New-SpeechFile $phonics[$L] $entry.phonicsAudio
    foreach ($w in $entry.words) {
        New-SpeechFile "$($w.text)!" $w.audio
        New-SpeechFile "$L is for $($w.text)!" $w.phrase
    }
}
$synth.Dispose()
Write-Host 'Placeholder audio generation complete.'
