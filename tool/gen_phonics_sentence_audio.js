// Regenerates each letter's phonicsAudio as ONE spoken sentence that
// splices in the user's own recorded phoneme clip(s) for the IPA symbol,
// instead of either (a) a fully TTS-synthesized sentence (isolated-phoneme
// TTS is unreliable, established earlier) or (b) just repeating the raw
// phoneme clip alone with no carrier sentence (loses "A says ... like in
// Apple!" context).
//
// Technique: synthesize the plain-English carrier text ("A says", "like in
// Apple!") via SAPI -- TTS is fine for real words, only isolated phonemes
// were the problem -- then concatenate with the recorded phoneme clip(s)
// via ffmpeg, and loudness-normalize the whole spliced sentence together.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const phonemesDir = path.join(assetsDir, 'audio', 'phonemes');
const lettersDir = path.join(assetsDir, 'audio', 'letters');

const phonemeSlugs = {
  i: 'i', ɪ: 'ih', ɛ: 'eh', æ: 'ae', ɑ: 'aa', ɔ: 'aw', ʊ: 'uh', u: 'uw', ʌ: 'ah', ə: 'schwa',
  eɪ: 'ei', aɪ: 'ai', aʊ: 'au', ɔɪ: 'oi', oʊ: 'ou',
  ɝ: 'er', ɚ: 'axr', ɑr: 'aar', ɛr: 'ehr', ɪr: 'ihr', ɔr: 'awr',
  p: 'p', t: 't', k: 'k', tʃ: 'ch', f: 'f', θ: 'th', s: 's', ʃ: 'sh',
  b: 'b', d: 'd', g: 'g', dʒ: 'jh', v: 'v', ð: 'dh', z: 'z', ʒ: 'zh',
  m: 'm', n: 'n', ŋ: 'ng', l: 'l', w: 'w', j: 'y', h: 'h', r: 'r', ʔ: 'glottal', ɾ: 'flap',
};

const alphabet = JSON.parse(
  fs.readFileSync(path.join(assetsDir, 'data', 'alphabet.json'), 'utf8'),
);
function getEntry(letter) {
  return alphabet.letters.find((l) => l.letter === letter);
}
function clipPath(symbol) {
  const slug = phonemeSlugs[symbol];
  if (!slug) throw new Error(`No slug for phoneme symbol: ${symbol}`);
  return path.join(phonemesDir, `${slug}.wav`);
}

// Builds the ordered segment list for a letter: alternating
// { type: 'text', value } and { type: 'clip', value: <ipa symbol> }.
function buildSegments(letter) {
  const entry = getEntry(letter);
  const word = entry.words[0].text;
  switch (letter) {
    case 'I':
      return [
        { type: 'text', value: 'I says' },
        { type: 'clip', value: 'ɪ' },
        { type: 'text', value: 'and sometimes says its own name' },
        { type: 'clip', value: 'aɪ' },
        { type: 'text', value: 'like Ice cream!' },
      ];
    case 'O':
      return [
        { type: 'text', value: 'O says' },
        { type: 'clip', value: 'ɑ' },
        { type: 'text', value: 'Orange and Owl start with O too!' },
      ];
    case 'U':
      return [
        { type: 'text', value: 'U says' },
        { type: 'clip', value: 'ʌ' },
        { type: 'text', value: 'and sometimes says its own name' },
        { type: 'clip', value: 'j' },
        { type: 'clip', value: 'u' },
        { type: 'text', value: 'like Unicorn!' },
      ];
    case 'X':
      return [
        { type: 'text', value: 'X can sound like' },
        { type: 'clip', value: 'z' },
        { type: 'text', value: 'like Xylophone, or' },
        { type: 'clip', value: 'k' },
        { type: 'clip', value: 's' },
        { type: 'text', value: 'at the end of words, like fox!' },
      ];
    case 'Q':
      return [
        { type: 'text', value: 'Q says' },
        { type: 'clip', value: 'k' },
        { type: 'clip', value: 'w' },
        { type: 'text', value: `like in ${word}!` },
      ];
    default:
      return [
        { type: 'text', value: `${letter} says` },
        { type: 'clip', value: entry.phonicsIpa },
        { type: 'text', value: `like in ${word}!` },
      ];
  }
}

const letters = alphabet.letters.map((l) => l.letter);
const perLetterSegments = {};
const ttsManifest = [];

for (const letter of letters) {
  const segments = buildSegments(letter);
  perLetterSegments[letter] = segments;
  segments.forEach((seg, i) => {
    if (seg.type === 'text') {
      ttsManifest.push({ id: `${letter}_${i}`, text: seg.value });
    }
  });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'englishgo_tts_'));
const manifestPath = path.join(tmpDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(ttsManifest), 'utf8');

console.log(`Synthesizing ${ttsManifest.length} carrier text segments via SAPI...`);
execFileSync(
  'pwsh',
  [
    '-File',
    path.join(root, 'tool', 'tts_batch.ps1').replace(/\\/g, '/'),
    '-ManifestPath',
    manifestPath.replace(/\\/g, '/'),
    '-OutDir',
    tmpDir.replace(/\\/g, '/'),
  ],
  { stdio: 'inherit' },
);

fs.mkdirSync(lettersDir, { recursive: true });

for (const letter of letters) {
  const segments = perLetterSegments[letter];
  const entry = getEntry(letter);
  const inputFiles = segments.map((seg, i) =>
    seg.type === 'text' ? path.join(tmpDir, `${letter}_${i}.wav`) : clipPath(seg.value),
  );

  // Use the concat *filter* (decodes + re-encodes each input), not the
  // concat *demuxer* (raw stream copy). The demuxer assumes every input
  // already shares the same sample rate/channel layout and silently
  // misinterprets bytes when they don't -- confirmed as the cause of a
  // scrambled phoneme clip when the recorded phoneme WAVs ended up at
  // 192kHz vs the TTS segments' 44.1kHz. The filter graph decodes each
  // input to raw samples first, so mismatched source formats can't
  // corrupt the splice.
  const spliced = path.join(tmpDir, `${letter}_spliced.wav`);
  const ffmpegArgs = ['-y', '-hide_banner', '-loglevel', 'error'];
  inputFiles.forEach((f) => ffmpegArgs.push('-i', f));
  const filterInputs = inputFiles.map((_, i) => `[${i}:a]`).join('');
  ffmpegArgs.push(
    '-filter_complex',
    `${filterInputs}concat=n=${inputFiles.length}:v=0:a=1[out]`,
    '-map', '[out]',
    spliced,
  );
  execFileSync('ffmpeg', ffmpegArgs);

  const relOut = entry.phonicsAudio; // e.g. 'audio/letters/a_phonics.m4a'
  const out = path.join(assetsDir, relOut);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', spliced,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1',
    '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '64k',
    out,
  ]);
  console.log(`OK ${relOut}`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Done: all 26 letters regenerated.');
