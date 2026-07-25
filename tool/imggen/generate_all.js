// One-off batch script: generate 52 word illustrations via DashScope wan2.7-image-pro,
// convert to webp, and register them in assets/manifests/manifest.json.
// Not production code — run once, inspect output, discard.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const PROMPTS_PATH = path.join(__dirname, 'word_prompts.json');
const RAW_DIR = path.join(__dirname, 'raw');
const OUT_DIR = path.join(ROOT, 'assets', 'images', 'words');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'manifests', 'manifest.json');

const TEMPLATE = (desc) =>
  `${desc}, centered on a warm cream background. Soft-clay 3D picture-book illustration style: rounded plump shapes, thick warm dark-brown outline (not black), soft directional studio lighting from the upper-left at 45 degrees creating a soft highlight and gentle shadow, subtle soft shadow underneath the subject, no gradients beyond soft light-to-shadow falloff, no text, no watermark, no additional objects, high-quality children's book illustration, 1:1 square composition, plenty of whitespace around the subject.`;

function loadEnv() {
  const envPath = path.join(process.env.USERPROFILE, '.englishgo_secrets', 'dashscope.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const ENV = loadEnv();
const API_URL = `https://${ENV.WAN_WORKSPACE_HOST}/api/v1/services/aigc/multimodal-generation/generation`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callApi(prompt) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'wan2.7-image-pro',
      input: {
        messages: [{ role: 'user', content: [{ text: prompt }] }],
      },
      parameters: { size: '1K', n: 1, watermark: false },
    }),
  });
  const json = await resp.json();
  const url = json?.output?.choices?.[0]?.message?.content?.[0]?.image;
  if (!url) {
    throw new Error('No image URL in response: ' + JSON.stringify(json).slice(0, 500));
  }
  return url;
}

async function downloadFile(url, destPath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download failed: HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function generateOne(wordId, desc) {
  const prompt = TEMPLATE(desc);
  const rawPath = path.join(RAW_DIR, `${wordId}.png`);
  const imgUrl = await callApi(prompt);
  await downloadFile(imgUrl, rawPath);
  return rawPath;
}

async function withRetry(fn, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.log(`  attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < retries) await sleep(2000);
    }
  }
  throw lastErr;
}

async function main() {
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  const wordIds = Object.keys(prompts);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const succeeded = [];
  const failed = [];

  for (const wordId of wordIds) {
    const outPathCheck = path.join(OUT_DIR, `${wordId}.webp`);
    if (fs.existsSync(outPathCheck)) {
      console.log(`[${wordId}] already exists, skipping`);
      succeeded.push(wordId);
      continue;
    }
    process.stdout.write(`[${wordId}] generating... `);
    try {
      await withRetry(() => generateOne(wordId, prompts[wordId]), 2);
      // convert to webp
      const rawPath = path.join(RAW_DIR, `${wordId}.png`);
      const outPath = path.join(OUT_DIR, `${wordId}.webp`);
      await sharp(rawPath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(outPath);
      console.log('OK');
      succeeded.push(wordId);
    } catch (e) {
      console.log('FAILED: ' + e.message);
      failed.push({ wordId, reason: e.message });
    }
    await sleep(1500);
  }

  fs.writeFileSync(
    path.join(__dirname, 'generation_result.json'),
    JSON.stringify({ succeeded, failed }, null, 2)
  );

  console.log('\n=== Summary ===');
  console.log(`Succeeded: ${succeeded.length}/${wordIds.length}`);
  console.log(`Failed: ${failed.length}`);
  for (const f of failed) console.log(`  - ${f.wordId}: ${f.reason}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
