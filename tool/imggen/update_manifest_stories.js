// One-off script: after generate_story.js produces
// assets/images/stories/*.webp, add/update the corresponding storyImage
// entries in assets/manifests/manifest.json.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const STORIES_DIR = path.join(ROOT, 'assets', 'images', 'stories');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'manifests', 'manifest.json');
const PROMPTS_PATH = path.join(__dirname, 'story_prompts.json');

async function main() {
  const ids = Object.keys(JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8')));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const byFile = new Map(manifest.assets.map((e) => [e.file, e]));

  let updatedCount = 0;
  for (const id of ids) {
    const filePath = path.join(STORIES_DIR, `${id}.webp`);
    if (!fs.existsSync(filePath)) continue;

    const rel = `images/stories/${id}.webp`;
    const buf = fs.readFileSync(filePath);
    const meta = await sharp(buf).metadata();
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');

    const entry = {
      file: rel,
      kind: 'storyImage',
      letter: null,
      word: null,
      theme: null,
      source: 'generated',
      sourceDetail: 'Alibaba Cloud wan2.7-image-pro via DashScope API',
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

    const prev = byFile.get(rel);
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
  console.log(`Manifest updated: ${updatedCount} storyImage entries added/updated.`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
