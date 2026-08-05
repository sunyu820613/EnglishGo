// One-off: generate the lesson-flow prompt phrases (gentle-retry, quiz/match
// instructions, reward closing) that the new lesson feature needs. Follows
// the exact same Azure TTS pipeline as generate-word-audio-new.mjs (same
// voice, same .env keys) for consistency with all existing production audio.
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
const OUT_DIR = join(import.meta.dirname, '..', 'public', 'audio', 'phrases');

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const PHRASES = [
  { text: "Let's listen again!", file: 'lets_listen_again.m4a' },
  { text: 'Listen and find!', file: 'listen_and_find.m4a' },
  { text: 'Wonderful!', file: 'wonderful.m4a' },
  ...LETTERS.map((letter) => ({
    text: `Find the letter ${letter}!`,
    file: `find_the_letter_${letter.toLowerCase()}.m4a`,
  })),
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
        'User-Agent': 'englishgo-lesson-audio-gen',
      },
      body: ssmlBody,
    },
  );
  if (!res.ok) {
    throw new Error(`Azure TTS ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const tmp = mkdtempSync(join(tmpdir(), 'lesson-audio-'));

for (const { text, file } of PHRASES) {
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
