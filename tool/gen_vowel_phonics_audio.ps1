# Regenerates phonics audio for the 5 core vowel letters (A/E/I/O/U) using
# a real extracted vowel sound instead of a synthesized-in-isolation
# phoneme or an ASCII-spelled guess.
#
# Technique: speak a real CVC word slowly (SAPI reliably pronounces whole
# words), locate the internal silence gap that marks the closure of the
# word's final stop consonant via ffmpeg's silencedetect, and trim to just
# the vowel nucleus (skipping a little off the front to avoid the onset
# consonant's release burst too). This gives a naturally-articulated,
# cleanly isolated vowel instead of an abstract synthesized phoneme --
# confirmed by ear on "bad" -> /ae/ before building this out to all 5.
#
# Consonant letters are NOT handled here -- see gen_phonics_audio.ps1's
# word-comparison approach ("Ball and Bear both start with B!"); isolating
# a consonant this way doesn't work since stops are inherently too brief
# to have a clean sustained nucleus to extract.

$ErrorActionPreference = 'Stop'
# PowerShell 7.3+ treats any stderr output from a native command as a
# terminating error when ErrorActionPreference is Stop, even when stderr
# is redirected elsewhere -- ffmpeg always prints its version banner to
# stderr, which would otherwise abort the very first call.
$PSNativeCommandUseErrorActionPreference = $false
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$clipsDir = Join-Path $root 'assets\audio\vowel_clips'
New-Item -ItemType Directory -Force $clipsDir | Out-Null

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -eq 'en-US' -and $_.Enabled } | Select-Object -First 1
if ($voice) { $synth.SelectVoice($voice.VoiceInfo.Name); Write-Host "Voice: $($voice.VoiceInfo.Name)" }
$synth.Rate = -5
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

function Get-VowelClip([string]$word, [double]$onsetTrim) {
    $wordWav = Join-Path $env:TEMP "vowel_src_$word.wav"
    $synth.SetOutputToWaveFile($wordWav, $fmt)
    $synth.Speak($word)
    $synth.SetOutputToNull()

    $errFile = Join-Path $env:TEMP 'ffmpeg_silencedetect.log'
    & ffmpeg -hide_banner -i $wordWav -af "silencedetect=noise=-30dB:d=0.01" -f null - 2> $errFile
    $log = Get-Content $errFile
    $starts = @()
    $ends = @()
    foreach ($line in $log) {
        if ($line -match 'silence_start:\s*([\d.]+)') { $starts += [double]$Matches[1] }
        if ($line -match 'silence_end:\s*([\d.]+)') { $ends += [double]$Matches[1] }
    }
    # $ends[0] = end of leading silence = word start. $starts[1] = start of
    # the first internal gap after the word begins = end of the vowel
    # nucleus (the following stop consonant's closure).
    if ($ends.Count -lt 1 -or $starts.Count -lt 2) {
        throw "Could not find expected silence pattern for '$word' -- got starts=$($starts -join ',') ends=$($ends -join ',')"
    }
    $wordStart = $ends[0]
    $vowelEnd = $starts[1]
    $vowelStart = $wordStart + $onsetTrim
    if ($vowelEnd -le $vowelStart) {
        throw "Bad boundaries for '$word': start=$vowelStart end=$vowelEnd"
    }

    $clipPath = Join-Path $clipsDir "$word.wav"
    & ffmpeg -y -i $wordWav -ss $vowelStart -to $vowelEnd $clipPath 2> $errFile
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg clip extraction failed for $word" }
    Write-Host "Clip: $word -> $($vowelEnd - $vowelStart)s ($vowelStart-$vowelEnd)"
    return $clipPath
}

function Write-VowelPhonics([string]$letter, [string]$vowelWord, [double]$onsetTrim, [string]$repeatWord1, [string]$repeatWord2, [string]$relPath) {
    $clip = Get-VowelClip $vowelWord $onsetTrim
    $pb = New-Object System.Speech.Synthesis.PromptBuilder
    $pb.AppendText("$letter says ")
    $pb.AppendAudio($clip)
    $pb.AppendText(". ")
    $pb.AppendAudio($clip)
    $pb.AppendText(", ")
    $pb.AppendAudio($clip)
    $pb.AppendText(". $repeatWord1! $repeatWord2!")

    $out = Join-Path $assets $relPath
    New-Item -ItemType Directory -Force (Split-Path -Parent $out) | Out-Null
    $wav = Join-Path $env:TEMP 'englishgo_vowel_tmp.wav'
    $synth.SetOutputToWaveFile($wav, $fmt)
    $synth.Speak($pb)
    $synth.SetOutputToNull()
    & ffmpeg -hide_banner -loglevel error -y -i $wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1' -ac 1 -ar 44100 -c:a aac -b:a 64k $out
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relPath" }
    Write-Host "OK $relPath"
}

$jsonPath = Join-Path $assets 'data/alphabet.json'
$data = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
function Get-Entry([string]$L) { $data.letters | Where-Object { $_.letter -eq $L } | Select-Object -First 1 }

function Write-SpeechFile([System.Speech.Synthesis.PromptBuilder]$pb, [string]$relPath) {
    $out = Join-Path $assets $relPath
    New-Item -ItemType Directory -Force (Split-Path -Parent $out) | Out-Null
    $wav = Join-Path $env:TEMP 'englishgo_vowel_tmp.wav'
    $synth.SetOutputToWaveFile($wav, $fmt)
    $synth.Speak($pb)
    $synth.SetOutputToNull()
    & ffmpeg -hide_banner -loglevel error -y -i $wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1' -ac 1 -ar 44100 -c:a aac -b:a 64k $out
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relPath" }
    Write-Host "OK $relPath"
}

$a = Get-Entry 'A'
Write-VowelPhonics 'A' 'bad' 0.04 $a.words[0].text $a.words[1].text $a.phonicsAudio

$e = Get-Entry 'E'
Write-VowelPhonics 'E' 'bed' 0.04 $e.words[0].text $e.words[1].text $e.phonicsAudio

# I, O, U each teach TWO different sounds (CONTENT_GUIDE.md's documented
# exceptions) -- the short sound gets the same real-word extraction
# treatment; the long/name sound is the letter's own name (already taught
# correctly in step 1), so it's fine to just say the example word
# naturally rather than needing an extracted clip for it too.
$i = Get-Entry 'I'
$clipI = Get-VowelClip 'bid' 0.04
$pbI = New-Object System.Speech.Synthesis.PromptBuilder
$pbI.AppendText('I sounds different ways! Short, like this: ')
$pbI.AppendAudio($clipI)
$pbI.AppendText(", $($i.words[1].text)! And sometimes I says its own name, like $($i.words[0].text)!")
Write-SpeechFile $pbI $i.phonicsAudio

$o = Get-Entry 'O'
$clipO = Get-VowelClip 'hot' 0.04
$pbO = New-Object System.Speech.Synthesis.PromptBuilder
$pbO.AppendText('O says ')
$pbO.AppendAudio($clipO)
$pbO.AppendText(". $($o.words[0].text)! $($o.words[1].text) starts with O too, listen closely!")
Write-SpeechFile $pbO $o.phonicsAudio

$u = Get-Entry 'U'
$clipU = Get-VowelClip 'cut' 0.04
$pbU = New-Object System.Speech.Synthesis.PromptBuilder
$pbU.AppendText('U sounds different ways! Short, like this: ')
$pbU.AppendAudio($clipU)
$pbU.AppendText(", $($u.words[0].text)! And sometimes U says its own name, like $($u.words[1].text)!")
Write-SpeechFile $pbU $u.phonicsAudio

$synth.Dispose()
Write-Host 'Vowel phonics regeneration complete (A, E, I, O, U).'
