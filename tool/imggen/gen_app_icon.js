// Generates the app icon (bunny face mark) and exports every platform
// size: web favicon/PWA icons, iOS AppIcon.appiconset, Android mipmaps.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ENV_PATH = path.join(process.env.USERPROFILE, '.englishgo_secrets', 'dashscope.env');
const ROOT = path.join(__dirname, '..', '..');
const RAW_PATH = path.join(__dirname, 'raw_mascots', 'app_icon_source.png');

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

const PROMPT =
  `A cute simple bunny face icon mark: big round head, two round ears folded down at the sides of the head, big friendly round sparkling eyes, small nose, gentle closed-mouth smile, no body, no hands, no accessories. Soft-clay 3D picture-book illustration style, thick warm dark-brown outline, soft directional studio lighting from the upper-left. The bunny face fills most of the frame, centered, on a solid flat sky-blue background (#53C7DE) that fills the entire square edge to edge with no border or vignette. Bold, simple, high-contrast shapes that read clearly even at a very small 16x16 pixel size. No text, no watermark, no additional objects, no gradient background, 1:1 square composition, app icon design.`;

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

async function exportSized(srcBuffer, destPath, size) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await sharp(srcBuffer).resize(size, size).png().toFile(destPath);
}

// Maskable icons need the artwork inside a ~66% safe-zone circle so OS
// crops (circle, squircle, etc.) never cut off the bunny's ears -- pad
// the square canvas with the background color instead of just resizing.
async function exportMaskable(srcBuffer, destPath, size) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const inner = Math.round(size * 0.7);
  const resized = await sharp(srcBuffer).resize(inner, inner).png().toBuffer();
  await sharp({
    create: {
      width: size, height: size, channels: 4,
      background: { r: 0x53, g: 0xc7, b: 0xde, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(destPath);
}

async function main() {
  fs.mkdirSync(path.dirname(RAW_PATH), { recursive: true });
  if (!fs.existsSync(RAW_PATH)) {
    console.log('Generating app icon artwork...');
    await withRetry(async () => {
      const url = await callApi(PROMPT);
      await downloadFile(url, RAW_PATH);
    }, 2);
  } else {
    console.log('Using existing generated artwork (delete raw_mascots/app_icon_source.png to regenerate)');
  }

  const src = await sharp(RAW_PATH).resize(1024, 1024, { fit: 'cover' }).png().toBuffer();

  // --- Web ---
  await exportSized(src, path.join(ROOT, 'web', 'favicon.png'), 16);
  await exportSized(src, path.join(ROOT, 'web', 'icons', 'Icon-192.png'), 192);
  await exportSized(src, path.join(ROOT, 'web', 'icons', 'Icon-512.png'), 512);
  await exportMaskable(src, path.join(ROOT, 'web', 'icons', 'Icon-maskable-192.png'), 192);
  await exportMaskable(src, path.join(ROOT, 'web', 'icons', 'Icon-maskable-512.png'), 512);
  console.log('OK web icons');

  // --- iOS ---
  const iosDir = path.join(ROOT, 'ios', 'Runner', 'Assets.xcassets', 'AppIcon.appiconset');
  const iosSizes = {
    'Icon-App-1024x1024@1x.png': 1024,
    'Icon-App-20x20@1x.png': 20, 'Icon-App-20x20@2x.png': 40, 'Icon-App-20x20@3x.png': 60,
    'Icon-App-29x29@1x.png': 29, 'Icon-App-29x29@2x.png': 58, 'Icon-App-29x29@3x.png': 87,
    'Icon-App-40x40@1x.png': 40, 'Icon-App-40x40@2x.png': 80, 'Icon-App-40x40@3x.png': 120,
    'Icon-App-60x60@2x.png': 120, 'Icon-App-60x60@3x.png': 180,
    'Icon-App-76x76@1x.png': 76, 'Icon-App-76x76@2x.png': 152,
    'Icon-App-83.5x83.5@2x.png': 167,
  };
  for (const [name, size] of Object.entries(iosSizes)) {
    await exportSized(src, path.join(iosDir, name), size);
  }
  console.log('OK ios icons');

  // --- Android ---
  const androidSizes = {
    'mipmap-mdpi': 48, 'mipmap-hdpi': 72, 'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144, 'mipmap-xxxhdpi': 192,
  };
  for (const [dir, size] of Object.entries(androidSizes)) {
    await exportSized(
      src,
      path.join(ROOT, 'android', 'app', 'src', 'main', 'res', dir, 'ic_launcher.png'),
      size,
    );
  }
  console.log('OK android icons');

  console.log('Done.');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
