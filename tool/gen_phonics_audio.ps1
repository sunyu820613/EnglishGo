# Regenerates ONLY the phonics-sound audio (a_phonics.m4a etc.).
#
# History: v1 spelled the sound as an ASCII approximation ("ah" for /ae/,
# "buh" for /b/) -- unreliable, since SAPI just reads whatever English word
# that spelling happens to match. v2 used SAPI's UPS phoneme markup
# (PromptBuilder.AppendTextWithPronunciation) to synthesize the isolated
# phoneme directly -- still unreliable in practice: a generic TTS engine
# synthesizing an abstract vowel completely alone (no consonant context)
# tends to glide/diphthongize, confirmed by ear (heard as two sounds, not
# one clean vowel).
#
# v3 (this version) never asks SAPI to say an isolated phoneme at all.
# It only ever speaks real, whole dictionary words (SAPI's actual area of
# competence) and lets the child notice the shared sound by ear -- e.g.
# "Apple and Ant both start with A!" -- instead of trying to isolate /ae/
# in the abstract. Still placeholder quality (Windows SAPI voice), not
# licensed recording.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' -and $_.Enabled } | Select-Object -First 1
if ($voice) { $synth.SelectVoice($voice.VoiceInfo.Name); Write-Host "Voice: $($voice.VoiceInfo.Name)" }
else { Write-Warning 'No en-US voice found, using default.' }
$synth.Rate = -2

$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

function Write-Speech([string]$text, [string]$relPath) {
    $out = Join-Path $assets $relPath
    $outDir = Split-Path -Parent $out
    New-Item -ItemType Directory -Force $outDir | Out-Null
    $wav = Join-Path $env:TEMP 'englishgo_phonics_tmp.wav'
    $synth.SetOutputToWaveFile($wav, $fmt)
    $synth.Speak($text)
    $synth.SetOutputToNull()
    & ffmpeg -hide_banner -loglevel error -y -i $wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1' -ac 1 -ar 44100 -c:a aac -b:a 64k $out
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relPath" }
    Write-Host "OK $relPath"
}

# Letters whose two taught words start with the SAME sound: just compare
# them by ear. (Everything except I/O/U/X, which get custom scripts below
# because their two words genuinely sound different -- see
# CONTENT_GUIDE.md's documented exceptions. Q's Queen/Quail do share the
# same /kw/ start, so it uses the default template.)
$jsonPath = Join-Path $assets 'data/alphabet.json'
$data = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

foreach ($entry in $data.letters) {
    $L = $entry.letter
    $w1 = $entry.words[0].text
    $w2 = $entry.words[1].text

    $text = switch ($L) {
        'I' { 'I sounds different ways! Short: Iguana. Long, like its own name: Ice cream!' }
        'O' { "O! Orange. Owl. They don't sound exactly the same, but they both start with O!" }
        'U' { 'U sounds different ways! Short: Umbrella. Long, like its own name: Unicorn!' }
        'X' { 'X can sound like z, like in Xylophone. At the end of words it sounds like ks, like fox and X-ray!' }
        default { "$w1 and $w2 both start with $L! $w1! $w2!" }
    }

    Write-Speech $text $entry.phonicsAudio
}

$synth.Dispose()
Write-Host 'Phonics audio regeneration complete.'
