const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const names = ['apple', 'ant', 'ball', 'bear', 'cat', 'car'];
const svgDir = path.join(__dirname, 'svg');
const outDir = path.join(__dirname, 'preview');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const name of names) {
    const svgPath = path.join(svgDir, `${name}.svg`);
    const pngOut = path.join(outDir, `${name}.png`);
    await sharp(svgPath, { density: 96 }).resize(512, 512).png().toFile(pngOut);
    console.log('rendered', name);
  }

  // Build a contact sheet grid 3x2
  const tile = 512;
  const cols = 3;
  const rows = 2;
  const composite = [];
  for (let i = 0; i < names.length; i++) {
    const x = (i % cols) * tile;
    const y = Math.floor(i / cols) * tile;
    composite.push({ input: path.join(outDir, `${names[i]}.png`), left: x, top: y });
  }
  await sharp({
    create: { width: tile * cols, height: tile * rows, channels: 4, background: '#F8F1E6' },
  })
    .composite(composite)
    .png()
    .toFile(path.join(outDir, 'contact_sheet.png'));
  console.log('contact sheet done');
})();
