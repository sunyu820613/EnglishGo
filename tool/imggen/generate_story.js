// One-off batch script: generate mini-story illustrations via DashScope
// wan2.7-image-pro, convert to webp. Mirrors generate_all.js but reads
// story_prompts.json and writes to assets/images/stories/.
// Not production code — run once, inspect output, discard.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const PROMPTS_PATH = path.join(__dirname, 'story_prompts.json');
const RAW_DIR = path.join(__dirname, 'raw_stories');
const OUT_DIR = path.join(ROOT, 'assets', 'images', 'stories');

const TEMPLATE = (desc) =>
  `${desc}, centered on a warm cream background. Soft-clay 3D picture-book illustration style: rounded plump shapes, thick warm dark-brown outline (not black), soft directional studio lighting from the upper-left at 45 degrees creating a soft highlight and gentle shadow, subtle soft shadow underneath the subject, no gradients beyond soft light-to-shadow falloff, no text, no watermark, high-quality children's book illustration, 1:1 square composition, plenty of whitespace around the subjects.`;

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

async function generateOne(id, desc) {
  const prompt = TEMPLATE(desc);
  const rawPath = path.join(RAW_DIR, `${id}.png`);
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
  const ids = Object.keys(prompts);

  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const succeeded = [];
  const failed = [];

  for (const id of ids) {
    const outPathCheck = path.join(OUT_DIR, `${id}.webp`);
    if (fs.existsSync(outPathCheck)) {
      console.log(`[${id}] already exists, skipping`);
      succeeded.push(id);
      continue;
    }
    process.stdout.write(`[${id}] generating... `);
    try {
      await withRetry(() => generateOne(id, prompts[id]), 2);
      const rawPath = path.join(RAW_DIR, `${id}.png`);
      const outPath = path.join(OUT_DIR, `${id}.webp`);
      await sharp(rawPath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(outPath);
      console.log('OK');
      succeeded.push(id);
    } catch (e) {
      console.log('FAILED: ' + e.message);
      failed.push({ id, reason: e.message });
    }
    await sleep(1500);
  }

  fs.writeFileSync(
    path.join(__dirname, 'generation_result_stories.json'),
    JSON.stringify({ succeeded, failed }, null, 2)
  );

  console.log('\n=== Summary ===');
  console.log(`Succeeded: ${succeeded.length}/${ids.length}`);
  console.log(`Failed: ${failed.length}`);
  for (const f of failed) console.log(`  - ${f.id}: ${f.reason}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
