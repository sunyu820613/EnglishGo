// Generates the final bunny mascot, one color/costume variant per theme,
// matching lib/core/theme/theme_assets.dart's single `mascot` field per
// theme (the earlier idle/celebrate/hint 3-state spec in
// docs/ASSET_MANIFEST.md was never actually wired into ThemeAssets, so
// this only produces the one image per theme the code actually uses).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ENV_PATH = path.join(process.env.USERPROFILE, '.englishgo_secrets', 'dashscope.env');
const RAW_DIR = path.join(__dirname, 'raw_mascots');
const ROOT = path.join(__dirname, '..', '..');

function loadEnv() {
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const ENV = loadEnv();
const API_URL = `https://${ENV.WAN_WORKSPACE_HOST}/api/v1/services/aigc/multimodal-generation/generation`;

const STYLE_SUFFIX =
  `, centered on a warm cream background. Soft-clay 3D picture-book illustration style: rounded plump shapes, thick warm dark-brown outline (not black), soft directional studio lighting from the upper-left at 45 degrees creating a soft highlight and gentle shadow, subtle soft shadow underneath the subject, no gradients beyond soft light-to-shadow falloff, no text, no watermark, no additional objects, high-quality children's book illustration, 1:1 square composition, plenty of whitespace around the subject, standing pose, one paw raised in a friendly wave, gentle happy smile, big sparkling eyes.`;

const THEMES = {
  starlight: 'A tiny plump round bunny character with soft cyan-blue fur, wearing a tiny gold star-shaped hair clip, night-sky sparkle theme',
  dino: 'A tiny plump round bunny character with soft sage-green fur, wearing a tiny felt dinosaur-spike hood with warm orange trim',
  robot: 'A tiny plump round bunny character with soft white fur, wearing a tiny rounded blue robot helmet with a small antenna and orange accent buttons',
  moonGarden: 'A tiny plump round bunny character with soft lavender-purple fur, wearing a tiny flower crown with peach and sage-green petals',
  balletCastle: 'A tiny plump round bunny character with soft pink fur, wearing a tiny pink tutu and a small gold bow on one ear',
  dessert: 'A tiny plump round bunny character with soft cream fur, wearing a tiny coral chef hat shaped like a swirl of frosting',
};

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function callApi(prompt) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.DASHSCOPE_API_KEY}` },
    body: JSON.stringify({
      model: 'wan2.7-image-pro',
      input: { messages: [{ role: 'user', content: [{ text: prompt }] }] },
      parameters: { size: '1K', n: 1, watermark: false },
    }),
  });
  const json = await resp.json();
  const url = json?.output?.choices?.[0]?.message?.content?.[0]?.image;
  if (!url) throw new Error('No image URL: ' + JSON.stringify(json).slice(0, 500));
  return url;
}

async function downloadFile(url, destPath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download failed: HTTP ${resp.status}`);
  fs.writeFileSync(destPath, Buffer.from(await resp.arrayBuffer()));
}

async function withRetry(fn, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      console.log(`  attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < retries) await sleep(2000);
    }
  }
  throw lastErr;
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const succeeded = [];
  const failed = [];

  // lib/core/theme/theme_assets.dart uses snake_case folder names for
  // the two multi-word theme ids, unlike the camelCase themeId used
  // elsewhere in the app (e.g. themeControllerProvider) -- confirmed by
  // a 404 when this used the themeId directly as the folder name.
  const folderNames = {
    balletCastle: 'ballet_castle',
    moonGarden: 'moon_garden',
  };

  for (const [themeId, desc] of Object.entries(THEMES)) {
    const outDir = path.join(ROOT, 'assets', 'themes', folderNames[themeId] ?? themeId);
    const outPath = path.join(outDir, 'mascot.webp');
    process.stdout.write(`[${themeId}] generating... `);
    try {
      const prompt = desc + STYLE_SUFFIX;
      await withRetry(async () => {
        const url = await callApi(prompt);
        await downloadFile(url, path.join(RAW_DIR, `${themeId}.png`));
      }, 2);
      fs.mkdirSync(outDir, { recursive: true });
      await sharp(path.join(RAW_DIR, `${themeId}.png`))
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(outPath);
      console.log('OK');
      succeeded.push(themeId);
    } catch (e) {
      console.log('FAILED: ' + e.message);
      failed.push({ themeId, reason: e.message });
    }
    await sleep(1500);
  }

  console.log('\n=== Summary ===');
  console.log(`Succeeded: ${succeeded.length}/${Object.keys(THEMES).length}`);
  for (const f of failed) console.log(`  - ${f.themeId}: ${f.reason}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
