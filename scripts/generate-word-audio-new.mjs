// One-off: generate word audio only for the new A soundVariants words that
// don't already have a file (acorn, cake, sofa, banana, father, pasta,
// salt, parent, care, package, cabbage) — reuses the exact voice/pipeline
// from generate-word-audio.mjs but scoped to avoid re-touching the 52
// existing curriculum word files.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const { SPEECH_KEY, SPEECH_REGION } = { ...loadEnv(), ...process.env };
if (!SPEECH_KEY || !SPEECH_REGION) {
  console.error('Missing SPEECH_KEY / SPEECH_REGION (checked .env and process.env)');
  process.exit(1);
}

const VOICE = 'en-US-JennyNeural';
const OUT_DIR = join(import.meta.dirname, '..', 'public', 'audio', 'words');

const NEW_WORDS = [
  { text: 'Acorn', file: 'acorn.m4a' },
  { text: 'Cake', file: 'cake.m4a' },
  { text: 'Sofa', file: 'sofa.m4a' },
  { text: 'Banana', file: 'banana.m4a' },
  { text: 'Father', file: 'father.m4a' },
  { text: 'Pasta', file: 'pasta.m4a' },
  { text: 'Salt', file: 'salt.m4a' },
  { text: 'Parent', file: 'parent.m4a' },
  { text: 'Care', file: 'care.m4a' },
  { text: 'Package', file: 'package.m4a' },
  { text: 'Cabbage', file: 'cabbage.m4a' },
];

function loadEnv() {
  try {
    const text = readFileSync(join(import.meta.dirname, '..', '.env'), 'utf8');
    return Object.fromEntries(
      text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => l.split('=').map((s) => s.trim())),
    );
  } catch {
    return {};
  }
}

function ssml(text) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${VOICE}">${text}</voice>
</speak>`;
}

async function synthesize(ssmlBody) {
  const res = await fetch(
    `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'englishgo-word-gen',
      },
      body: ssmlBody,
    },
  );
  if (!res.ok) {
    throw new Error(`Azure TTS ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const tmp = mkdtempSync(join(tmpdir(), 'words-new-'));

for (const { text, file } of NEW_WORDS) {
  const m4aPath = join(OUT_DIR, file);
  if (existsSync(m4aPath)) {
    console.log(`skip (exists): ${file}`);
    continue;
  }
  const mp3Path = join(tmp, `${file}.mp3`);
  console.log(`${text} -> ${m4aPath}`);
  const mp3 = await synthesize(ssml(text));
  writeFileSync(mp3Path, mp3);
  execFileSync('ffmpeg', ['-y', '-i', mp3Path, '-c:a', 'aac', '-b:a', '96k', m4aPath], {
    stdio: 'ignore',
  });
}

rmSync(tmp, { recursive: true, force: true });
console.log('Done.');
