// Trims all recorded phoneme clips (except æ... wait, all of them) down
// to a natural short duration -- the original recordings were sustained
// ~1s per the recording script's guidance for clarity, which sounds
// unnaturally drawn-out both standalone and especially when several are
// played back-to-back (e.g. tokenizePhonemes splicing 'ɛ'+'f' for a
// letter name). This finds each clip's actual voiced region via
// silencedetect and extracts a short centered window from it, sized by
// phoneme category (diphthongs need more time to show the glide than a
// simple stop or monophthong does).
//
// Skips 'aa.wav' (/ɑ/) -- already manually fixed and confirmed by ear.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const dir = path.resolve(__dirname, '..', 'assets', 'audio', 'phonemes');

const DIPHTHONGS = new Set(['ei', 'ai', 'au', 'oi', 'ou']);
const R_COLORED = new Set(['er', 'axr', 'aar', 'ehr', 'ihr', 'awr']);
const AFFRICATES = new Set(['ch', 'jh']);
// Stops: the only perceptually identifiable part is the release burst at
// the very start of the voiced region, not a sustained middle -- a
// centered window grabs mostly silent closure/decay, unrecognizable.
const STOPS = new Set(['p', 't', 'k', 'b', 'd', 'g']);
// Weak/context-dependent sounds: nasals and schwa are quiet and need more
// duration to be identifiable in isolation than a stop or clear vowel.
const NEEDS_MORE_TIME = new Set(['m', 'n', 'ng', 'schwa']);

function targetDuration(slug) {
  if (DIPHTHONGS.has(slug)) return 0.32;
  if (AFFRICATES.has(slug)) return 0.22;
  if (R_COLORED.has(slug)) return 0.22;
  if (STOPS.has(slug)) return 0.09;
  if (NEEDS_MORE_TIME.has(slug)) return 0.26;
  return 0.16;
}

function run(args) {
  return execFileSync('ffmpeg', args, { encoding: 'utf8' });
}
function runProbe(args) {
  return execFileSync('ffprobe', args, { encoding: 'utf8' }).trim();
}

function getDuration(file) {
  return parseFloat(
    runProbe([
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', file,
    ]),
  );
}

function getVoicedRegion(file, totalDuration) {
  const tmp = path.join(os.tmpdir(), 'sd_' + path.basename(file) + '.log');
  try {
    execFileSync(
      'ffmpeg',
      ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-35dB:d=0.01', '-f', 'null', '-'],
      { stdio: ['ignore', 'ignore', fs.openSync(tmp, 'w')] },
    );
  } catch (e) {
    // ffmpeg with -f null exits non-zero sometimes even on success; ignore.
  }
  const log = fs.readFileSync(tmp, 'utf8');
  fs.unlinkSync(tmp);
  const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  // Voiced region = from end of leading silence to start of trailing silence
  // (or file boundaries if no silence detected there).
  const voicedStart = ends.length > 0 && starts[0] === 0 ? ends[0] : 0;
  let voicedEnd = totalDuration;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] > voicedStart) { voicedEnd = starts[i]; break; }
  }
  // A handful of clips have a brief loud onset then drop under the
  // threshold before recovering (or have an overall quieter level),
  // which falsely ends the "voiced" region almost immediately -- e.g.
  // æ/ɛ/ŋ/ə/j all collapsed to a 1-18ms span this way. Any span that
  // short can't be the real sustained phoneme, so fall back to the
  // full remaining duration instead of trusting the false cutoff.
  if (voicedEnd - voicedStart < 0.1) {
    voicedEnd = totalDuration;
  }
  return [voicedStart, voicedEnd];
}

// Optional: pass specific slugs (e.g. `node shorten_phoneme_clips.js b d g`)
// to reprocess only those files instead of the whole directory -- needed
// when re-tuning one category without re-touching already-approved clips
// (re-running the trim+fade pipeline on an already-shortened file stacks
// a second fade on top of the first).
const onlySlugs = process.argv.slice(2);
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.wav') && f !== 'aa.wav')
  .filter((f) => onlySlugs.length === 0 || onlySlugs.includes(f.replace(/\.wav$/, '')));
console.log(`Processing ${files.length} clips...`);

for (const f of files) {
  const slug = f.replace(/\.wav$/, '');
  const full = path.join(dir, f);
  const totalDuration = getDuration(full);
  const [voicedStart, voicedEnd] = getVoicedRegion(full, totalDuration);
  const voicedLen = Math.max(0.05, voicedEnd - voicedStart);
  const target = Math.min(targetDuration(slug), voicedLen);
  let winStart;
  let winEnd;
  if (STOPS.has(slug)) {
    // Anchor at the release burst (start of voicing), not centered.
    winStart = voicedStart;
    winEnd = voicedStart + target;
  } else {
    const center = (voicedStart + voicedEnd) / 2;
    winStart = center - target / 2;
    winEnd = center + target / 2;
  }
  if (winStart < voicedStart) { winEnd += voicedStart - winStart; winStart = voicedStart; }
  if (winEnd > voicedEnd) { winStart -= winEnd - voicedEnd; winEnd = voicedEnd; }
  winStart = Math.max(0, winStart);

  const step1 = path.join(os.tmpdir(), 'trim_' + f);
  const step2 = path.join(os.tmpdir(), 'fade_' + f);
  run(['-y', '-hide_banner', '-loglevel', 'error', '-i', full, '-ss', String(winStart), '-t', String(target), step1]);
  const fadeOutStart = Math.max(0, target - 0.02);
  run(['-y', '-hide_banner', '-loglevel', 'error', '-i', step1,
    '-af', `afade=t=in:d=0.015,afade=t=out:st=${fadeOutStart}:d=0.02`, step2]);
  fs.copyFileSync(step2, full);
  fs.unlinkSync(step1);
  fs.unlinkSync(step2);
  console.log(`OK ${f}: ${totalDuration.toFixed(3)}s -> ${target.toFixed(3)}s (voiced ${voicedStart.toFixed(3)}-${voicedEnd.toFixed(3)})`);
}

console.log('Done.');
