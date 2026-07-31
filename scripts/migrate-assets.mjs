#!/usr/bin/env node
/**
 * One-time asset migration from the old Flutter `assets/` tree into the
 * Vite `public/` tree used by the React app.
 *
 * - Plain copies (no transcode): audio/{letters,words,phrases,example_words}
 *   and images/words. Filenames are preserved.
 * - Transcodes: audio/letters/{male,female}/*.ogg -> *.m4a via ffmpeg
 *   (Safari/iPad compatibility — see docs/architecture-react-rewrite.md §7).
 * - audio/phonemes/*.wav is copied as-is, excluding the 3 known dev-leftover
 *   test files (_male_b_test.wav, _male_d_test.wav, _male_g_test.wav — see
 *   docs/phonetics-react-rewrite-scope.md §5).
 * - After copying, every audio/image path referenced by the data layer
 *   (src/data/alphabet.ts, phonemeAudioSlugs.ts, phonemeExampleWords.ts) is
 *   checked to exist in public/ — any miss aborts with a non-zero exit code
 *   and a printed list, so a broken migration can never pass silently.
 *
 * Usage: node scripts/migrate-assets.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC = path.join(ROOT, 'public');

const EXCLUDED_PHONEME_FILES = new Set([
  '_male_b_test.wav',
  '_male_d_test.wav',
  '_male_g_test.wav',
]);

let copiedCount = 0;
let transcodedCount = 0;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDirFlat(srcDir, dstDir, { filter } = {}) {
  await ensureDir(dstDir);
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (filter && !filter(entry.name)) continue;
    await fs.copyFile(path.join(srcDir, entry.name), path.join(dstDir, entry.name));
    copiedCount += 1;
  }
}

function transcodeOggToM4a(srcFile, dstFile) {
  execFileSync('ffmpeg', ['-y', '-i', srcFile, '-c:a', 'aac', '-b:a', '96k', dstFile], {
    stdio: 'ignore',
  });
  transcodedCount += 1;
}

async function transcodeDirOggToM4a(srcDir, dstDir) {
  await ensureDir(dstDir);
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.ogg')) continue;
    const dstName = entry.name.replace(/\.ogg$/, '.m4a');
    transcodeOggToM4a(path.join(srcDir, entry.name), path.join(dstDir, dstName));
  }
}

async function main() {
  console.log('== EnglishGo asset migration ==');

  // 1. Plain copies.
  await copyDirFlat(path.join(ASSETS, 'audio/letters'), path.join(PUBLIC, 'audio/letters'), {
    filter: (name) => name.endsWith('.m4a'),
  });
  await copyDirFlat(path.join(ASSETS, 'audio/words'), path.join(PUBLIC, 'audio/words'));
  await copyDirFlat(path.join(ASSETS, 'audio/phrases'), path.join(PUBLIC, 'audio/phrases'));
  await copyDirFlat(
    path.join(ASSETS, 'audio/example_words'),
    path.join(PUBLIC, 'audio/example_words'),
  );
  await copyDirFlat(path.join(ASSETS, 'audio/phonemes'), path.join(PUBLIC, 'audio/phonemes'), {
    filter: (name) => !EXCLUDED_PHONEME_FILES.has(name),
  });
  await copyDirFlat(path.join(ASSETS, 'images/words'), path.join(PUBLIC, 'images/words'));

  // 2. Transcodes (.ogg -> .m4a).
  await transcodeDirOggToM4a(
    path.join(ASSETS, 'audio/letters/male'),
    path.join(PUBLIC, 'audio/letters/male'),
  );
  await transcodeDirOggToM4a(
    path.join(ASSETS, 'audio/letters/female'),
    path.join(PUBLIC, 'audio/letters/female'),
  );

  console.log(`Copied ${copiedCount} files, transcoded ${transcodedCount} files.`);

  // 3. Existence validation against the data layer.
  const toModuleUrl = (relative) => pathToFileURL(path.join(ROOT, relative)).href;
  const { alphabet } = await import(toModuleUrl('src/data/alphabet.ts'));
  const { phonemeAudioSlugs } = await import(toModuleUrl('src/data/phonemeAudioSlugs.ts'));
  const { phonemeExampleWords } = await import(toModuleUrl('src/data/phonemeExampleWords.ts'));

  const missing = [];
  function check(relativePublicPath) {
    if (!existsSync(path.join(PUBLIC, relativePublicPath))) {
      missing.push(relativePublicPath);
    }
  }

  for (const letter of alphabet) {
    check(`audio/letters/${letter.letterAudio}`);
    check(`audio/letters/${letter.phonicsAudio}`);
    if (letter.letterAudioMale) check(`audio/letters/${letter.letterAudioMale}`);
    if (letter.letterAudioFemale) check(`audio/letters/${letter.letterAudioFemale}`);
    for (const word of letter.words) {
      check(`audio/words/${word.audio}`);
      check(`images/words/${word.image}`);
      check(`audio/phrases/${word.phrase}`);
    }
  }

  for (const slug of Object.values(phonemeAudioSlugs)) {
    check(`audio/phonemes/${slug}.wav`);
  }

  for (const words of Object.values(phonemeExampleWords)) {
    for (const w of words) {
      check(`audio/example_words/${w.audioSlug}.m4a`);
    }
  }

  if (missing.length > 0) {
    console.error(`\nMigration validation FAILED — ${missing.length} referenced file(s) missing:`);
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }

  console.log('Validation passed — every path referenced by the data layer exists in public/.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
