// Regenerates example-word narration (public/audio/words/*.m4a) via Azure AI
// Speech, same voice as generate-phonics-audio.mjs for a consistent narrator.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
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

function extractWords(alphabetTs) {
  return [...alphabetTs.matchAll(/text: '([^']*)', audio: '([^']*)'/g)].map((m) => ({
    text: m[1],
    file: m[2],
  }));
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

const alphabetTs = readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'alphabet.ts'), 'utf8');
const words = extractWords(alphabetTs);
const tmp = mkdtempSync(join(tmpdir(), 'words-'));

for (const { text, file } of words) {
  const mp3Path = join(tmp, `${file}.mp3`);
  const m4aPath = join(OUT_DIR, file);
  console.log(`${text} -> ${m4aPath}`);
  const mp3 = await synthesize(ssml(text));
  writeFileSync(mp3Path, mp3);
  execFileSync('ffmpeg', ['-y', '-i', mp3Path, '-c:a', 'aac', '-b:a', '96k', m4aPath], {
    stdio: 'ignore',
  });
}

rmSync(tmp, { recursive: true, force: true });
console.log(`Done: ${words.length} files written to ${OUT_DIR}`);
