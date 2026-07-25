// One-off script: build a contact sheet of all successfully generated word images,
// 256x256 thumbnails, sorted alphabetically A-Z, labeled with the word name.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', '..');
const WORDS_DIR = path.join(ROOT, 'assets', 'images', 'words');
const PROMPTS_PATH = path.join(__dirname, 'word_prompts.json');
const OUT_DIR = path.join(__dirname, 'preview');

const TILE = 256;
const LABEL_H = 28;
const CELL_H = TILE + LABEL_H;
const COLS = 8;

async function main() {
  const wordIds = Object.keys(JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8')));
  const available = wordIds
    .filter((id) => fs.existsSync(path.join(WORDS_DIR, `${id}.webp`)))
    .sort((a, b) => a.localeCompare(b));

  if (available.length === 0) {
    console.log('No generated images found.');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rows = Math.ceil(available.length / COLS);

  const composite = [];
  for (let i = 0; i < available.length; i++) {
    const id = available[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * TILE;
    const y = row * CELL_H;

    const thumb = await sharp(path.join(WORDS_DIR, `${id}.webp`))
      .resize(TILE, TILE, { fit: 'cover' })
      .png()
      .toBuffer();
    composite.push({ input: thumb, left: x, top: y });

    const labelSvg = Buffer.from(
      `<svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2E2A25"/>
        <text x="50%" y="19" font-family="Arial, sans-serif" font-size="15" fill="white" text-anchor="middle">${id}</text>
      </svg>`
    );
    composite.push({ input: labelSvg, left: x, top: y + TILE });
  }

  await sharp({
    create: {
      width: TILE * COLS,
      height: CELL_H * rows,
      channels: 4,
      background: '#F8F1E6',
    },
  })
    .composite(composite)
    .png()
    .toFile(path.join(OUT_DIR, 'contact_sheet_full.png'));

  console.log(`Contact sheet built with ${available.length} images: ${path.join(OUT_DIR, 'contact_sheet_full.png')}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
