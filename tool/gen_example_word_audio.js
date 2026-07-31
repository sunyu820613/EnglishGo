// Generates one audio clip per unique example word used in
// lib/core/content/phoneme_example_words.dart, via SAPI TTS (real whole
// words -- TTS is reliable here, unlike isolated phonemes).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const outDir = path.join(assetsDir, 'audio', 'example_words');

const dartSource = fs.readFileSync(
  path.join(root, 'lib', 'core', 'content', 'phoneme_example_words.dart'),
  'utf8',
);
const words = [...new Set(
  [...dartSource.matchAll(/WordExample\('([^']+)'/g)].map((m) => m[1]),
)];
const missingWords = words.filter(
  (w) => !fs.existsSync(path.join(outDir, `${w.replaceAll('-', '_')}.m4a`)),
);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'englishgo_word_tts_'));
const manifest = missingWords.map((w) => ({ id: w.replaceAll('-', '_'), text: w }));
if (manifest.length === 0) {
  console.log('Nothing new to synthesize.');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.exit(0);
}
const manifestPath = path.join(tmpDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest), 'utf8');

console.log(`Synthesizing ${missingWords.length} new example words via SAPI...`);
execFileSync(
  'pwsh',
  [
    '-File', path.join(root, 'tool', 'tts_batch.ps1').replace(/\\/g, '/'),
    '-ManifestPath', manifestPath.replace(/\\/g, '/'),
    '-OutDir', tmpDir.replace(/\\/g, '/'),
  ],
  { stdio: 'inherit' },
);

fs.mkdirSync(outDir, { recursive: true });
for (const entry of manifest) {
  const src = path.join(tmpDir, `${entry.id}.wav`);
  const out = path.join(outDir, `${entry.id}.m4a`);
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', src,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_threshold=-45dB,apad=pad_dur=0.2,adelay=200:all=1',
    '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '64k',
    out,
  ]);
  console.log(`OK ${entry.id}.m4a`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Done: ${manifest.length} example word audio files.`);
