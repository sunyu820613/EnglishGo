// One-off: generate word images for the new A soundVariants words via the
// same Alibaba Cloud DashScope wan2.7-image-pro pipeline used for the
// existing 52 curriculum word images (see tool/imggen/wanx_test*.sh on the
// main/Flutter branch) — same prompt template (soft-clay 3D picture-book
// style, warm cream background, thick warm dark-brown outline, upper-left
// 45deg studio lighting, 1:1, no text/watermark), scoped to just the 11
// missing words.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const { DASHSCOPE_API_KEY, WAN_WORKSPACE_HOST } = loadSecrets();
if (!DASHSCOPE_API_KEY || !WAN_WORKSPACE_HOST) {
  console.error('Missing DASHSCOPE_API_KEY / WAN_WORKSPACE_HOST');
  process.exit(1);
}

const OUT_DIR = join(import.meta.dirname, '..', 'public', 'images', 'words');

const STYLE_SUFFIX =
  'Soft-clay 3D picture-book illustration style: rounded plump shape, thick warm dark-brown outline (not black), ' +
  'soft directional studio lighting from the upper-left at 45 degrees creating one large soft highlight and gentle ' +
  'core shadow, subtle ambient occlusion shadow underneath, no gradients beyond soft light-to-shadow falloff, no text, ' +
  'no watermark, no additional objects, high-quality children\'s book illustration, clean vector-like shapes, ' +
  '1:1 square composition, plenty of whitespace around the subject.';

const CHARACTER_STYLE_SUFFIX =
  'Soft-clay 3D picture-book illustration style: rounded plump features, thick warm dark-brown outline (not black), ' +
  'soft directional studio lighting from the upper-left at 45 degrees creating one large soft highlight and gentle ' +
  'core shadow, subtle ambient occlusion shadow underneath, no gradients beyond soft light-to-shadow falloff, no text, ' +
  'no watermark, no additional objects, high-quality children\'s book illustration, friendly rounded proportions like ' +
  'a toy figure, 1:1 square composition, plenty of whitespace around the subject, front-facing pose.';

const WORDS = [
  {
    id: 'acorn',
    prompt: `A single acorn (oak nut) with a textured brown cap and smooth tan-brown shell, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'cake',
    prompt: `A single round birthday cake with white frosting, colorful sprinkles, and one lit candle on top, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'sofa',
    prompt: `A single cozy two-cushion sofa in soft blue fabric with rounded wooden legs, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'banana',
    prompt: `A single curved ripe yellow banana with a small brown stem, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'father',
    prompt: `A single friendly cartoon dad character with short brown hair, a warm smile, wearing a simple blue collared shirt, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}`,
  },
  {
    id: 'pasta',
    prompt: `A single bowl of spaghetti pasta twirled neatly with red tomato sauce, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'salt',
    prompt: `A single glass salt shaker with a silver lid, filled with white salt, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'parent',
    prompt: `A single friendly cartoon parent character gently holding hands with a small child, both smiling, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}`,
  },
  {
    id: 'care',
    prompt: `A pair of gentle cupped cartoon hands softly holding a small glowing warm-red heart, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'package',
    prompt: `A single wrapped gift package tied with a bow ribbon, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'cabbage',
    prompt: `A single round green cabbage with curled leafy layers, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
];

function loadSecrets() {
  try {
    const text = readFileSync(join(homedir(), '.englishgo_secrets', 'dashscope.env'), 'utf8');
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

async function generate(prompt) {
  const res = await fetch(
    `https://${WAN_WORKSPACE_HOST}/api/v1/services/aigc/multimodal-generation/generation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'wan2.7-image-pro',
        input: { messages: [{ role: 'user', content: [{ text: prompt }] }] },
        parameters: { size: '1K', n: 1, watermark: false },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`DashScope ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const url = json?.output?.choices?.[0]?.message?.content?.[0]?.image;
  if (!url) throw new Error(`No image URL in response: ${JSON.stringify(json)}`);
  return url;
}

const tmp = mkdtempSync(join(tmpdir(), 'word-images-'));

for (const { id, prompt } of WORDS) {
  const webpPath = join(OUT_DIR, `${id}.webp`);
  if (existsSync(webpPath)) {
    console.log(`skip (exists): ${id}.webp`);
    continue;
  }
  console.log(`generating ${id}...`);
  const imageUrl = await generate(prompt);
  const pngPath = join(tmp, `${id}.png`);
  const pngRes = await fetch(imageUrl);
  writeFileSync(pngPath, Buffer.from(await pngRes.arrayBuffer()));
  execFileSync('ffmpeg', ['-y', '-i', pngPath, '-q:v', '75', webpPath], { stdio: 'ignore' });
  console.log(`  -> ${webpPath}`);
}

rmSync(tmp, { recursive: true, force: true });
console.log('Done.');
