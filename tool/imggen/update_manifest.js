// One-off script: after generate_all.js produces assets/images/words/*.webp,
// add/update the corresponding wordImage entries in assets/manifests/manifest.json.
// Leaves all non-wordImage entries untouched.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const WORDS_DIR = path.join(ROOT, 'assets', 'images', 'words');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'manifests', 'manifest.json');
const PROMPTS_PATH = path.join(__dirname, 'word_prompts.json');
const ALPHABET_PATH = path.join(ROOT, 'assets', 'data', 'alphabet.json');

async function main() {
  const wordIds = Object.keys(JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8')));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const alphabet = JSON.parse(fs.readFileSync(ALPHABET_PATH, 'utf8'));

  const letterByWordId = new Map();
  for (const entry of alphabet.letters) {
    for (const word of entry.words) {
      letterByWordId.set(word.id, entry.letter);
    }
  }

  const byFile = new Map(manifest.assets.map((e) => [e.file, e]));

  let updatedCount = 0;
  for (const wordId of wordIds) {
    const filePath = path.join(WORDS_DIR, `${wordId}.webp`);
    if (!fs.existsSync(filePath)) continue;

    const rel = `images/words/${wordId}.webp`;
    const buf = fs.readFileSync(filePath);
    const meta = await sharp(buf).metadata();
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');

    const prev = byFile.get(rel);
    const entry = {
      file: rel,
      kind: 'wordImage',
      letter: letterByWordId.get(wordId) ?? null,
      word: wordId,
      theme: prev ? prev.theme ?? null : null,
      source: 'generated',
      sourceDetail: 'Alibaba Cloud wan2.7-image-pro via DashScope API',
      // Confirmed against 阿里云百炼服务协议 (paid API, not the free
      // "体验服务" trial which bars commercial use) §7.5/7.6: generated
      // content's IP is conditionally the caller's, but Alibaba Cloud
      // disclaims guaranteeing copyrightability or freedom from
      // third-party IP disputes -- caller bears that risk.
      license:
        'ai-generated-commercial-use-permitted-no-ip-guarantee' +
        '（阿里云百炼付费 API 生成，非免费体验服务；商用不受限，' +
        '但平台不保证生成内容的可版权性/不侵权，需自行承担风险）',
      width: meta.width,
      height: meta.height,
      bytes: buf.length,
      sha256,
      humanReviewed: false,
      placeholder: false,
    };

    if (prev) {
      Object.assign(prev, entry);
    } else {
      manifest.assets.push(entry);
      byFile.set(rel, entry);
    }
    updatedCount++;
  }

  manifest.generatedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Manifest updated: ${updatedCount} wordImage entries added/updated.`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
