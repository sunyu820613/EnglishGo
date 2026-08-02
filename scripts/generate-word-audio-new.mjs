// One-off: generate word audio only for the new A soundVariants words that
// don't already have a file (acorn, cake, sofa, banana, father, pasta,
// salt, parent, care, package, cabbage) — reuses the exact voice/pipeline
// from generate-word-audio.mjs but scoped to avoid re-touching the 52
// existing curriculum word files.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const { SPEECH_KEY, SPEECH_REGION } = { ...loadEnv(), ...process.env };
if (!SPEECH_KEY || !SPEECH_REGION) {
  console.error('Missing SPEECH_KEY / SPEECH_REGION (checked .env and process.env)');
  process.exit(1);
}

const VOICE = 'en-US-JennyNeural';
const OUT_DIR = join(import.meta.dirname, '..', 'public', 'audio', 'words');

const NEW_WORDS = [
  { text: 'Acorn', file: 'acorn.m4a' },
  { text: 'Cake', file: 'cake.m4a' },
  { text: 'Sofa', file: 'sofa.m4a' },
  { text: 'Banana', file: 'banana.m4a' },
  { text: 'Father', file: 'father.m4a' },
  { text: 'Pasta', file: 'pasta.m4a' },
  { text: 'Salt', file: 'salt.m4a' },
  { text: 'Parent', file: 'parent.m4a' },
  { text: 'Care', file: 'care.m4a' },
  { text: 'Package', file: 'package.m4a' },
  { text: 'Cabbage', file: 'cabbage.m4a' },
  { text: 'Evening', file: 'evening.m4a' },
  { text: 'Event', file: 'event.m4a' },
  { text: 'Effect', file: 'effect.m4a' },
  { text: 'Camera', file: 'camera.m4a' },
  { text: 'Garden', file: 'garden.m4a' },
  { text: 'Fern', file: 'fern.m4a' },
  { text: 'Term', file: 'term.m4a' },
  { text: 'Bike', file: 'bike.m4a' },
  { text: 'Café', file: 'cafe.m4a' },
  { text: 'Résumé', file: 'resume.m4a' },
  // I
  { text: 'Insect', file: 'insect.m4a' },
  { text: 'Pin', file: 'pin.m4a' },
  { text: 'Island', file: 'island.m4a' },
  { text: 'Pie', file: 'pie.m4a' },
  { text: 'Machine', file: 'machine.m4a' },
  { text: 'Ski', file: 'ski.m4a' },
  { text: 'Bird', file: 'bird.m4a' },
  { text: 'Shirt', file: 'shirt.m4a' },
  { text: 'Onion', file: 'onion.m4a' },
  { text: 'Million', file: 'million.m4a' },
  { text: 'Pencil', file: 'pencil.m4a' },
  { text: 'Cousin', file: 'cousin.m4a' },
  // O
  { text: 'Octopus', file: 'octopus.m4a' },
  { text: 'Box', file: 'box.m4a' },
  { text: 'Ocean', file: 'ocean.m4a' },
  { text: 'Boat', file: 'boat.m4a' },
  { text: 'Oven', file: 'oven.m4a' },
  { text: 'Glove', file: 'glove.m4a' },
  { text: 'Shoe', file: 'shoe.m4a' },
  { text: 'Canoe', file: 'canoe.m4a' },
  { text: 'Wolf', file: 'wolf.m4a' },
  { text: 'Woman', file: 'woman.m4a' },
  { text: 'Lemon', file: 'lemon.m4a' },
  { text: 'Dragon', file: 'dragon.m4a' },
  { text: 'Fork', file: 'fork.m4a' },
  { text: 'Corn', file: 'corn.m4a' },
  { text: 'Worm', file: 'worm.m4a' },
  { text: 'World', file: 'world.m4a' },
  { text: 'People', file: 'people.m4a' },
  // U
  { text: 'Cup', file: 'cup.m4a' },
  { text: 'Flute', file: 'flute.m4a' },
  { text: 'Rule', file: 'rule.m4a' },
  { text: 'Bull', file: 'bull.m4a' },
  { text: 'Bush', file: 'bush.m4a' },
  { text: 'Music', file: 'music.m4a' },
  { text: 'Circus', file: 'circus.m4a' },
  { text: 'Album', file: 'album.m4a' },
  { text: 'Nurse', file: 'nurse.m4a' },
  { text: 'Turtle', file: 'turtle.m4a' },
  { text: 'Business', file: 'business.m4a' },
  { text: 'Minute', file: 'minute.m4a' },
  { text: 'Quilt', file: 'quilt.m4a' },
  { text: 'Quarter', file: 'quarter.m4a' },
  { text: 'Guitar', file: 'guitar.m4a' },
  { text: 'Guard', file: 'guard.m4a' },
  // Y
  { text: 'Yarn', file: 'yarn.m4a' },
  { text: 'Yacht', file: 'yacht.m4a' },
  { text: 'Sky', file: 'sky.m4a' },
  { text: 'Fly', file: 'fly.m4a' },
  { text: 'Baby', file: 'baby.m4a' },
  { text: 'Candy', file: 'candy.m4a' },
  { text: 'Gym', file: 'gym.m4a' },
  { text: 'Lynx', file: 'lynx.m4a' },
  // B
  { text: 'Lamb', file: 'lamb.m4a' },
  { text: 'Thumb', file: 'thumb.m4a' },
  // C
  { text: 'City', file: 'city.m4a' },
  { text: 'Cent', file: 'cent.m4a' },
  { text: 'Physician', file: 'physician.m4a' },
  { text: 'Musician', file: 'musician.m4a' },
  { text: 'Cello', file: 'cello.m4a' },
  { text: 'Cappuccino', file: 'cappuccino.m4a' },
  { text: 'Muscle', file: 'muscle.m4a' },
  { text: 'Scissors', file: 'scissors.m4a' },
  // D
  { text: 'Soldier', file: 'soldier.m4a' },
  { text: 'Education', file: 'education.m4a' },
  { text: 'Wednesday', file: 'wednesday.m4a' },
  { text: 'Handkerchief', file: 'handkerchief.m4a' },
  // G
  { text: 'Giraffe', file: 'giraffe.m4a' },
  { text: 'Gem', file: 'gem.m4a' },
  { text: 'Genre', file: 'genre.m4a' },
  { text: 'Garage', file: 'garage.m4a' },
  { text: 'Gnome', file: 'gnome.m4a' },
  { text: 'Sign', file: 'sign.m4a' },
  // H
  { text: 'Hour', file: 'hour.m4a' },
  { text: 'Heir', file: 'heir.m4a' },
  // J
  { text: 'Fjord', file: 'fjord.m4a' },
  { text: 'Jalapeño', file: 'jalapeno.m4a' },
  // K
  { text: 'Knee', file: 'knee.m4a' },
  { text: 'Knife', file: 'knife.m4a' },
  // L
  { text: 'Milk', file: 'milk.m4a' },
  { text: 'Calf', file: 'calf.m4a' },
  { text: 'Yolk', file: 'yolk.m4a' },
  // M
  { text: 'Rhythm', file: 'rhythm.m4a' },
  { text: 'Prism', file: 'prism.m4a' },
  { text: 'Mnemonic', file: 'mnemonic.m4a' },
  // N
  { text: 'Bank', file: 'bank.m4a' },
  { text: 'Uncle', file: 'uncle.m4a' },
  { text: 'Autumn', file: 'autumn.m4a' },
  { text: 'Column', file: 'column.m4a' },
  // P
  { text: 'Spoon', file: 'spoon.m4a' },
  { text: 'Spider', file: 'spider.m4a' },
  { text: 'Psychology', file: 'psychology.m4a' },
  { text: 'Pterodactyl', file: 'pterodactyl.m4a' },
  // Q
  { text: 'Antique', file: 'antique.m4a' },
  { text: 'Mosque', file: 'mosque.m4a' },
  // S
  { text: 'Bus', file: 'bus.m4a' },
  { text: 'Rose', file: 'rose.m4a' },
  { text: 'Keys', file: 'keys.m4a' },
  { text: 'Sugar', file: 'sugar.m4a' },
  { text: 'Tissue', file: 'tissue.m4a' },
  { text: 'Vision', file: 'vision.m4a' },
  { text: 'Treasure', file: 'treasure.m4a' },
  { text: 'Aisle', file: 'aisle.m4a' },
  // T
  { text: 'Water', file: 'water.m4a' },
  { text: 'Butter', file: 'butter.m4a' },
  { text: 'Button', file: 'button.m4a' },
  { text: 'Mountain', file: 'mountain.m4a' },
  { text: 'Nation', file: 'nation.m4a' },
  { text: 'Station', file: 'station.m4a' },
  { text: 'Picture', file: 'picture.m4a' },
  { text: 'Nature', file: 'nature.m4a' },
  { text: 'Castle', file: 'castle.m4a' },
  { text: 'Whistle', file: 'whistle.m4a' },
  // W
  { text: 'Wagon', file: 'wagon.m4a' },
  { text: 'Window', file: 'window.m4a' },
  { text: 'Wrist', file: 'wrist.m4a' },
  { text: 'Sword', file: 'sword.m4a' },
  // X
  { text: 'Fox', file: 'fox.m4a' },
  { text: 'Wax', file: 'wax.m4a' },
  { text: 'Exam', file: 'exam.m4a' },
  { text: 'Exhibit', file: 'exhibit.m4a' },
  { text: 'Xenon', file: 'xenon.m4a' },
  { text: 'Complexion', file: 'complexion.m4a' },
  { text: 'Luxury', file: 'luxury.m4a' },
  { text: 'Roux', file: 'roux.m4a' },
  // Z
  { text: 'Zipper', file: 'zipper.m4a' },
  { text: 'Azure', file: 'azure.m4a' },
  { text: 'Quartz', file: 'quartz.m4a' },
  { text: 'Pizza', file: 'pizza.m4a' },
  { text: 'Song', file: 'song.m4a' },
  { text: 'Coffee', file: 'coffee.m4a' },
  { text: 'Wall', file: 'wall.m4a' },
  { text: 'Shark', file: 'shark.m4a' },
  { text: 'Yard', file: 'yard.m4a' },
  { text: 'Snake', file: 'snake.m4a' },
];

function loadEnv() {
  try {
    const text = readFileSync(join(import.meta.dirname, '..', '.env'), 'utf8');
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

function ssml(text) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${VOICE}">${text}</voice>
</speak>`;
}

async function synthesize(ssmlBody) {
  const res = await fetch(
    `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'englishgo-word-gen',
      },
      body: ssmlBody,
    },
  );
  if (!res.ok) {
    throw new Error(`Azure TTS ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const tmp = mkdtempSync(join(tmpdir(), 'words-new-'));

for (const { text, file } of NEW_WORDS) {
  const m4aPath = join(OUT_DIR, file);
  if (existsSync(m4aPath)) {
    console.log(`skip (exists): ${file}`);
    continue;
  }
  const mp3Path = join(tmp, `${file}.mp3`);
  console.log(`${text} -> ${m4aPath}`);
  const mp3 = await synthesize(ssml(text));
  writeFileSync(mp3Path, mp3);
  execFileSync('ffmpeg', ['-y', '-i', mp3Path, '-c:a', 'aac', '-b:a', '96k', m4aPath], {
    stdio: 'ignore',
  });
}

rmSync(tmp, { recursive: true, force: true });
console.log('Done.');
