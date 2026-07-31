// One-off: generate a handful of mascot CONCEPT options (not final assets)
// for the user to pick a direction from, in the same soft-clay style as
// the existing 52 word illustrations.

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(process.env.USERPROFILE, '.englishgo_secrets', 'dashscope.env');
const OUT_DIR = path.join(__dirname, 'mascot_concepts');

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
  `, centered on a warm cream background. Soft-clay 3D picture-book illustration style: rounded plump shapes, thick warm dark-brown outline (not black), soft directional studio lighting from the upper-left at 45 degrees creating a soft highlight and gentle shadow, subtle soft shadow underneath the subject, no gradients beyond soft light-to-shadow falloff, no text, no watermark, no additional objects, high-quality children's book illustration, 1:1 square composition, plenty of whitespace around the subject, friendly welcoming pose, big sparkling eyes, waving one hand.`;

const CONCEPTS = {
  bunny: 'A tiny plump round bunny character with big soft ears, sky-blue fur',
  owl: 'A tiny plump round owl character with big round eyes and small wings, sky-blue and cream feathers',
  robot: 'A tiny plump round friendly robot character with a soft rounded body, small antenna, a simple smiling screen face, sky-blue and white',
  dragon: 'A tiny plump round baby dragon character with small stubby wings and a tiny curled tail, sky-blue scales',
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

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [id, desc] of Object.entries(CONCEPTS)) {
    process.stdout.write(`[${id}] generating... `);
    try {
      const prompt = desc + STYLE_SUFFIX;
      const url = await callApi(prompt);
      await downloadFile(url, path.join(OUT_DIR, `${id}.png`));
      console.log('OK');
    } catch (e) {
      console.log('FAILED: ' + e.message);
    }
    await sleep(1500);
  }
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
