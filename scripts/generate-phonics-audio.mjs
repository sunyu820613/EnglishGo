// Regenerates "A says /æ/" style letter-phonics narration via Azure AI
// Speech (REST TTS), replacing public/audio/letters/{letter}_phonics.m4a.
// ponytail: plain REST + fetch, no Azure SDK dependency for one script.
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
const OUT_DIR = join(import.meta.dirname, '..', 'public', 'audio', 'letters');

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

function extractLetterPhonics(alphabetTs) {
  return alphabetTs
    .split(/(?=    letter: '[A-Z]',)/)
    .slice(1)
    .map((block) => ({
      letter: block.match(/letter: '([A-Z])'/)[1],
      ipa: block.match(/phonicsIpa: '([^']*)'/)[1],
    }));
}

function ssml(letter, ipa) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${VOICE}">
    <say-as interpret-as="characters">${letter}</say-as>
    <break time="150ms"/> says <break time="120ms"/>
    <phoneme alphabet="ipa" ph="${ipa}">${letter.toLowerCase()}</phoneme>
  </voice>
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
        'User-Agent': 'englishgo-phonics-gen',
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
const letters = extractLetterPhonics(alphabetTs);
const tmp = mkdtempSync(join(tmpdir(), 'phonics-'));

for (const { letter, ipa } of letters) {
  const mp3Path = join(tmp, `${letter}.mp3`);
  const m4aPath = join(OUT_DIR, `${letter.toLowerCase()}_phonics.m4a`);
  console.log(`${letter} says /${ipa}/ -> ${m4aPath}`);
  const mp3 = await synthesize(ssml(letter, ipa));
  writeFileSync(mp3Path, mp3);
  execFileSync('ffmpeg', ['-y', '-i', mp3Path, '-c:a', 'aac', '-b:a', '96k', m4aPath], {
    stdio: 'inherit',
  });
}

rmSync(tmp, { recursive: true, force: true });
console.log(`Done: ${letters.length} files written to ${OUT_DIR}`);
