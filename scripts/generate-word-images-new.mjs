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
  {
    id: 'evening',
    prompt: `A single crescent moon with one small sparkling star beside it, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'event',
    prompt: `A single bunch of three colorful round party balloons tied together with a curly ribbon, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'effect',
    prompt: `A single water droplet falling and creating one gentle circular ripple on a still pond surface, viewed from a slight angle, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'camera',
    prompt: `A single retro cartoon camera with a round lens and a small flash on top, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'garden',
    prompt: `A single terracotta flower pot with a blooming red flower and green leaves, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'fern',
    prompt: `A single leafy green fern frond with symmetrical leaflets, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'term',
    prompt: `A single closed hardcover book with a bookmark ribbon, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'bike',
    prompt: `A single simple bicycle with round wheels and a basket on front, side view, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'cafe',
    prompt: `A single cup of coffee in a round cup with saucer and a small wisp of steam, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  {
    id: 'resume',
    prompt: `A single sheet of paper with a few lines of text and a small pencil resting beside it, centered on a warm cream background. ${STYLE_SUFFIX}`,
  },
  // I
  { id: 'insect', prompt: `A single friendly cartoon ladybug insect with round wings, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'pin', prompt: `A single silver safety pin, closed, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'island', prompt: `A single small tropical island with one palm tree, surrounded by a ring of blue water, viewed from above, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'pie', prompt: `A single slice of fruit pie with a golden lattice crust, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'machine', prompt: `A single simple friendly cartoon robot-like machine with a round body, a dial, and one lever, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'ski', prompt: `A single pair of crossed snow skis with ski poles, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'bird', prompt: `A single small round friendly cartoon bird with a bright orange beak, perched, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'shirt', prompt: `A single folded short-sleeve collared shirt in soft green, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'onion', prompt: `A single round yellow-brown onion with one green sprout on top, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'million', prompt: `A single small stack of shiny gold coins, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'pencil', prompt: `A single yellow pencil with a pink eraser and sharp point, diagonal, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'cousin', prompt: `Two friendly cartoon children characters, a boy and a girl about the same height, standing together smiling, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  // O
  { id: 'octopus', prompt: `A single friendly cartoon octopus with big round eyes and eight curled arms, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'box', prompt: `A single closed cardboard box, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'ocean', prompt: `A single gentle cartoon ocean wave curling, deep blue with a white foam crest, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'boat', prompt: `A single small red sailboat with one white sail, side view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'oven', prompt: `A single retro kitchen oven with a round window and two dials, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'glove', prompt: `A single knitted winter glove in soft red, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'shoe', prompt: `A single friendly cartoon sneaker shoe in soft blue, side view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'canoe', prompt: `A single wooden canoe with one paddle resting inside, side view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'wolf', prompt: `A single cute cartoon wolf puppy sitting calmly with soft grey fur, round friendly eyes, closed mouth, and a gentle smile, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'woman', prompt: `A single friendly cartoon woman character with shoulder-length brown hair and a warm smile, wearing a simple yellow top, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'lemon', prompt: `A single bright yellow lemon with one small green leaf, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'dragon', prompt: `A single friendly cartoon baby dragon with small round wings and a curled tail, smiling, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'fork', prompt: `A single silver dinner fork, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'corn', prompt: `A single ear of corn with golden kernels and green husk peeled back, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'worm', prompt: `A single friendly cartoon pink earthworm curled into a loose spiral, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'world', prompt: `A single cartoon globe of the world on a small stand, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'people', prompt: `Three friendly diverse cartoon people characters of different heights standing together smiling, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  // U
  { id: 'cup', prompt: `A single simple drinking cup with a handle, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'flute', prompt: `A single silver flute laid diagonally, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'rule', prompt: `A single wooden ruler with measurement marks, diagonal, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'bull', prompt: `A single friendly cartoon bull standing, with small curved horns, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'bush', prompt: `A single round leafy green bush shrub, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'music', prompt: `A single pair of curled musical eighth notes, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'circus', prompt: `A single red-and-white striped circus tent, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'album', prompt: `A single vinyl record album leaning against its record sleeve, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'nurse', prompt: `A single friendly cartoon nurse character wearing light blue scrubs and a warm smile, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'turtle', prompt: `A single friendly cartoon turtle with a round green shell, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'business', prompt: `A single closed brown leather briefcase, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'minute', prompt: `A single round analog clock face showing a few minutes past the hour, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'quilt', prompt: `A single folded patchwork quilt blanket with colorful squares, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'quarter', prompt: `A single silver quarter coin, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'guitar', prompt: `A single acoustic guitar, front view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'guard', prompt: `A single friendly cartoon guard character wearing a simple navy uniform and cap, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  // Y
  { id: 'yarn', prompt: `A single round ball of soft red yarn with a loose thread end, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'yacht', prompt: `A single small white yacht boat with a tall mast, side view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'sky', prompt: `A single fluffy white cartoon cloud in a soft blue sky, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'fly', prompt: `A single friendly round cartoon housefly with big eyes and small wings, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'baby', prompt: `A single friendly cartoon baby character sitting, wearing a soft yellow onesie, smiling, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'candy', prompt: `A single round swirled lollipop candy on a stick, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'gym', prompt: `A single pair of cartoon dumbbells, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'lynx', prompt: `A single friendly cartoon lynx wildcat sitting, with tufted ears, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // B
  { id: 'lamb', prompt: `A single friendly cartoon baby lamb with fluffy white wool, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'thumb', prompt: `A single friendly cartoon hand giving a thumbs-up, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // C
  { id: 'city', prompt: `A single simple city skyline with three rounded buildings of different heights, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'cent', prompt: `A single copper penny coin, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'physician', prompt: `A single friendly cartoon doctor character wearing a white coat and a stethoscope, warm smile, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'musician', prompt: `A single friendly cartoon musician character holding a small violin, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'cello', prompt: `A single wooden cello standing upright with its bow leaning beside it, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'cappuccino', prompt: `A single cappuccino coffee in a round cup with visible foam swirl on top, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'muscle', prompt: `A single friendly cartoon flexed arm showing a round bicep muscle, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'scissors', prompt: `A single pair of round-tipped safety scissors, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // D
  { id: 'soldier', prompt: `A single friendly cartoon toy soldier character standing at attention in a simple red uniform, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'education', prompt: `A single graduation cap with a tassel, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'wednesday', prompt: `A single desk calendar page, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'handkerchief', prompt: `A single folded cloth handkerchief square with a scalloped edge, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // G
  { id: 'giraffe', prompt: `A single friendly cartoon giraffe with a long spotted neck, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'gem', prompt: `A single sparkling cut purple gemstone, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'genre', prompt: `A single pair of curled musical eighth notes above a small film clapperboard, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'garage', prompt: `A single house garage with a closed panel door, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'gnome', prompt: `A single friendly cartoon garden gnome character with a tall pointed red hat and white beard, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'sign', prompt: `A single round red stop-style road sign on a post, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // H
  { id: 'hour', prompt: `A single sand hourglass timer, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'heir', prompt: `A single friendly cartoon child character wearing a small golden crown, smiling, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  // J
  { id: 'fjord', prompt: `A single narrow blue fjord inlet between two rounded green cliffs, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'jalapeno', prompt: `A single shiny green jalapeño pepper, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // K
  { id: 'knee', prompt: `A single friendly cartoon bent leg showing a round knee, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'knife', prompt: `A single round-tipped kitchen butter knife, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // L
  { id: 'milk', prompt: `A single glass of white milk, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'calf', prompt: `A single friendly cartoon baby cow calf with soft brown-and-white spots, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'yolk', prompt: `A single cracked egg showing a round golden-yellow yolk, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // M
  { id: 'rhythm', prompt: `A single row of three curled musical eighth notes, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'prism', prompt: `A single glass triangular prism splitting light into a small rainbow, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'mnemonic', prompt: `A single friendly cartoon brain character with a glowing lightbulb above it, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // N
  { id: 'bank', prompt: `A single round pink piggy bank with a coin slot, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'uncle', prompt: `A single friendly cartoon man character with a mustache and glasses, wearing a simple green sweater, shown from the waist up, centered on a warm cream background. ${CHARACTER_STYLE_SUFFIX}` },
  { id: 'autumn', prompt: `A single small pile of orange and red fallen autumn leaves, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'column', prompt: `A single classical stone architectural column, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // P
  { id: 'spoon', prompt: `A single silver dinner spoon, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'spider', prompt: `A single friendly round cartoon spider with eight small legs, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'psychology', prompt: `A single friendly cartoon head silhouette with a swirl pattern inside representing thoughts, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'pterodactyl', prompt: `A single friendly cartoon flying pterodactyl dinosaur with rounded wings, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // Q
  { id: 'antique', prompt: `A single ornate antique golden pocket watch, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'mosque', prompt: `A single simple mosque building silhouette with one dome and one minaret, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // S
  { id: 'bus', prompt: `A single friendly cartoon yellow school bus, side view, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'rose', prompt: `A single blooming red rose with a green stem and one leaf, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'keys', prompt: `A single small ring with two silver keys, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'sugar', prompt: `A single small glass bowl filled with white sugar cubes, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'tissue', prompt: `A single tissue box with one tissue popping out, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'vision', prompt: `A single friendly cartoon eye with long lashes, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'treasure', prompt: `A single open wooden treasure chest with gold coins spilling out, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'aisle', prompt: `A single grocery store aisle view with shelves on either side, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // T
  { id: 'water', prompt: `A single glass of clear water with a droplet beside it, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'butter', prompt: `A single stick of butter on a small dish, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'button', prompt: `A single round clothing button with four holes, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'mountain', prompt: `A single snow-capped mountain peak, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'nation', prompt: `A single small cartoon flag on a pole, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'station', prompt: `A single small train station building with a clock, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'picture', prompt: `A single framed picture of a simple landscape, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'nature', prompt: `A single small tree with a round leafy top beside one flower, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'castle', prompt: `A single fairytale castle with two round towers and small flags, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'whistle', prompt: `A single silver referee whistle on a cord, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // W
  { id: 'wagon', prompt: `A single red toy wagon with four wheels, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'window', prompt: `A single house window with four panes and curtains, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'wrist', prompt: `A single friendly cartoon hand and wrist wearing a small watch, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'sword', prompt: `A single friendly cartoon toy knight's sword with a rounded blunt tip and ornate handle, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // X
  { id: 'fox', prompt: `A single friendly cartoon fox sitting, with a bushy orange tail, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'wax', prompt: `A single lit candle with dripping wax, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'exam', prompt: `A single test paper with a checkmark and a pencil beside it, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'exhibit', prompt: `A single framed painting displayed on a small museum stand, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'xenon', prompt: `A single glowing blue-purple gas-filled glass tube light, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'complexion', prompt: `A single friendly cartoon smiling face close-up showing rosy cheeks, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'luxury', prompt: `A single sparkling golden crown with jewels, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'roux', prompt: `A single small saucepan with a wooden spoon stirring a light golden mixture, centered on a warm cream background. ${STYLE_SUFFIX}` },
  // Z
  { id: 'zipper', prompt: `A single metal zipper pull on a strip of fabric, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'azure', prompt: `A single round paint swatch drop of azure blue color, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'quartz', prompt: `A single clear pointed quartz crystal, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'pizza', prompt: `A single slice of pizza with melted cheese and pepperoni, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'song', prompt: `A single curled musical eighth note beside a small speech bubble, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'coffee', prompt: `A single tall cup of coffee with a lid and a cardboard sleeve, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'wall', prompt: `A single short section of red brick wall, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'shark', prompt: `A single friendly cartoon shark swimming, with a round snout and small fin, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'yard', prompt: `A single small fenced backyard patch of green grass with one flower, centered on a warm cream background. ${STYLE_SUFFIX}` },
  { id: 'snake', prompt: `A single friendly cartoon snake coiled in a loose spiral with a small smile, centered on a warm cream background. ${STYLE_SUFFIX}` },
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

const failed = [];
for (const { id, prompt } of WORDS) {
  const webpPath = join(OUT_DIR, `${id}.webp`);
  if (existsSync(webpPath)) {
    console.log(`skip (exists): ${id}.webp`);
    continue;
  }
  console.log(`generating ${id}...`);
  try {
    const imageUrl = await generate(prompt);
    const pngPath = join(tmp, `${id}.png`);
    const pngRes = await fetch(imageUrl);
    writeFileSync(pngPath, Buffer.from(await pngRes.arrayBuffer()));
    execFileSync('ffmpeg', ['-y', '-i', pngPath, '-q:v', '75', webpPath], { stdio: 'ignore' });
    console.log(`  -> ${webpPath}`);
  } catch (err) {
    console.error(`  FAILED ${id}: ${err.message}`);
    failed.push(id);
  }
}

rmSync(tmp, { recursive: true, force: true });
if (failed.length) console.log(`Failed (${failed.length}): ${failed.join(', ')}`);
console.log('Done.');
