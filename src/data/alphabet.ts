import type { AlphabetLetter } from './alphabet.types';

/**
 * Migrated from assets/data/alphabet.json (Flutter baseline).
 * This module is the single source of truth for alphabet content —
 * do not hardcode letter audio paths / IPA symbols elsewhere.
 */
export const alphabet: AlphabetLetter[] = [
  {
    letter: 'A',
    letterAudio: 'a_name.m4a',
    letterAudioMale: 'male/letter_a_male.m4a',
    letterAudioFemale: 'female/letter_a_female.m4a',
    phonicsAudio: 'a_phonics.m4a',
    phonicsIpa: 'æ',
    letterNameIpa: 'eɪ',
    phonicsNote: null,
    words: [
      { id: 'apple', text: 'Apple', audio: 'apple.m4a', image: 'apple.webp', phrase: 'a_is_for_apple.m4a' },
      { id: 'ant', text: 'Ant', audio: 'ant.m4a', image: 'ant.webp', phrase: 'a_is_for_ant.m4a' },
    ],
    // /æ/ (core short vowel, same words as the `words` field above) is
    // listed first here so the letter page can render one unified "A
    // says..." table instead of a separate word-card row plus this list.
    soundVariants: [
      {
        ipa: 'æ',
        label: 'Core short vowel',
        words: [
          { id: 'apple', text: 'Apple', audio: 'apple.m4a', image: 'apple.webp' },
          { id: 'ant', text: 'Ant', audio: 'ant.m4a', image: 'ant.webp' },
        ],
      },
      {
        ipa: 'eɪ',
        label: 'Long vowel (open syllable / a_e)',
        words: [
          { id: 'acorn', text: 'Acorn', audio: 'acorn.m4a', image: 'acorn.webp' },
          { id: 'snake', text: 'Snake', audio: 'snake.m4a', image: 'snake.webp' },
        ],
      },
      {
        ipa: 'ə',
        label: 'Unstressed (schwa)',
        words: [
          { id: 'sofa', text: 'Sofa', audio: 'sofa.m4a', image: 'sofa.webp' },
          { id: 'banana', text: 'Banana', audio: 'banana.m4a', image: 'banana.webp' },
        ],
      },
      {
        ipa: 'ɑ',
        label: 'Common in American English',
        words: [
          { id: 'father', text: 'Father', audio: 'father.m4a', image: 'father.webp' },
          { id: 'pasta', text: 'Pasta', audio: 'pasta.m4a', image: 'pasta.webp' },
        ],
      },
      {
        ipa: 'ɔ',
        label: 'Before ll/lt (accent-dependent)',
        words: [
          { id: 'wall', text: 'Wall', audio: 'wall.m4a', image: 'wall.webp' },
          { id: 'salt', text: 'Salt', audio: 'salt.m4a', image: 'salt.webp' },
        ],
      },
      {
        ipa: 'ɑr',
        label: '"ar" combination',
        words: [
          { id: 'shark', text: 'Shark', audio: 'shark.m4a', image: 'shark.webp' },
          { id: 'yard', text: 'Yard', audio: 'yard.m4a', image: 'yard.webp' },
        ],
      },
      {
        ipa: 'ɛr',
        label: 'Special "ar/are" environment',
        words: [
          { id: 'parent', text: 'Parent', audio: 'parent.m4a', image: 'parent.webp' },
          { id: 'care', text: 'Care', audio: 'care.m4a', image: 'care.webp' },
        ],
      },
      {
        ipa: 'ə~ɪ',
        label: 'Unstressed, varies by dialect',
        words: [
          { id: 'package', text: 'Package', audio: 'package.m4a', image: 'package.webp' },
          { id: 'cabbage', text: 'Cabbage', audio: 'cabbage.m4a', image: 'cabbage.webp' },
        ],
      },
    ],
  },
  {
    letter: 'B',
    letterAudio: 'b_name.m4a',
    letterAudioMale: 'male/letter_b_male.m4a',
    letterAudioFemale: 'female/letter_b_female.m4a',
    phonicsAudio: 'b_phonics.m4a',
    phonicsIpa: 'b',
    letterNameIpa: 'biː',
    phonicsNote: null,
    words: [
      { id: 'ball', text: 'Ball', audio: 'ball.m4a', image: 'ball.webp', phrase: 'b_is_for_ball.m4a' },
      { id: 'bear', text: 'Bear', audio: 'bear.m4a', image: 'bear.webp', phrase: 'b_is_for_bear.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'b',
        label: 'Core sound',
        words: [
          { id: 'ball', text: 'Ball', audio: 'ball.m4a', image: 'ball.webp' },
          { id: 'bear', text: 'Bear', audio: 'bear.m4a', image: 'bear.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-final "mb"',
        words: [
          { id: 'lamb', text: 'Lamb', audio: 'lamb.m4a', image: 'lamb.webp' },
          { id: 'thumb', text: 'Thumb', audio: 'thumb.m4a', image: 'thumb.webp' },
        ],
      },
    ],
  },
  {
    letter: 'C',
    letterAudio: 'c_name.m4a',
    letterAudioMale: 'male/letter_c_male.m4a',
    letterAudioFemale: 'female/letter_c_female.m4a',
    phonicsAudio: 'c_phonics.m4a',
    phonicsIpa: 'k',
    letterNameIpa: 'siː',
    phonicsNote: null,
    words: [
      { id: 'cat', text: 'Cat', audio: 'cat.m4a', image: 'cat.webp', phrase: 'c_is_for_cat.m4a' },
      { id: 'car', text: 'Car', audio: 'car.m4a', image: 'car.webp', phrase: 'c_is_for_car.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'k',
        label: 'Hard C',
        words: [
          { id: 'cat', text: 'Cat', audio: 'cat.m4a', image: 'cat.webp' },
          { id: 'car', text: 'Car', audio: 'car.m4a', image: 'car.webp' },
        ],
      },
      {
        ipa: 's',
        label: 'Soft C — before e, i, y',
        words: [
          { id: 'city', text: 'City', audio: 'city.m4a', image: 'city.webp' },
          { id: 'cent', text: 'Cent', audio: 'cent.m4a', image: 'cent.webp' },
        ],
      },
      {
        ipa: 'ʃ',
        label: '"ci" + vowel',
        words: [
          { id: 'physician', text: 'Physician', audio: 'physician.m4a', image: 'physician.webp' },
          { id: 'musician', text: 'Musician', audio: 'musician.m4a', image: 'musician.webp' },
        ],
      },
      {
        ipa: 'tʃ',
        label: 'From Italian loanwords',
        words: [
          { id: 'cello', text: 'Cello', audio: 'cello.m4a', image: 'cello.webp' },
          { id: 'cappuccino', text: 'Cappuccino', audio: 'cappuccino.m4a', image: 'cappuccino.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Irregular',
        words: [
          { id: 'muscle', text: 'Muscle', audio: 'muscle.m4a', image: 'muscle.webp' },
          { id: 'scissors', text: 'Scissors', audio: 'scissors.m4a', image: 'scissors.webp' },
        ],
      },
    ],
  },
  {
    letter: 'D',
    letterAudio: 'd_name.m4a',
    letterAudioMale: 'male/letter_d_male.m4a',
    letterAudioFemale: 'female/letter_d_female.m4a',
    phonicsAudio: 'd_phonics.m4a',
    phonicsIpa: 'd',
    letterNameIpa: 'diː',
    phonicsNote: null,
    words: [
      { id: 'dog', text: 'Dog', audio: 'dog.m4a', image: 'dog.webp', phrase: 'd_is_for_dog.m4a' },
      { id: 'duck', text: 'Duck', audio: 'duck.m4a', image: 'duck.webp', phrase: 'd_is_for_duck.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'd',
        label: 'Core sound',
        words: [
          { id: 'dog', text: 'Dog', audio: 'dog.m4a', image: 'dog.webp' },
          { id: 'duck', text: 'Duck', audio: 'duck.m4a', image: 'duck.webp' },
        ],
      },
      {
        ipa: 'dʒ',
        label: 'Softened before i/u',
        words: [
          { id: 'soldier', text: 'Soldier', audio: 'soldier.m4a', image: 'soldier.webp' },
          { id: 'education', text: 'Education', audio: 'education.m4a', image: 'education.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Special words',
        words: [
          { id: 'wednesday', text: 'Wednesday', audio: 'wednesday.m4a', image: 'wednesday.webp' },
          { id: 'handkerchief', text: 'Handkerchief', audio: 'handkerchief.m4a', image: 'handkerchief.webp' },
        ],
      },
    ],
  },
  {
    letter: 'E',
    letterAudio: 'e_name.m4a',
    letterAudioMale: 'male/letter_e_male.m4a',
    letterAudioFemale: 'female/letter_e_female.m4a',
    phonicsAudio: 'e_phonics.m4a',
    phonicsIpa: 'ɛ',
    letterNameIpa: 'iː',
    phonicsNote: null,
    words: [
      { id: 'egg', text: 'Egg', audio: 'egg.m4a', image: 'egg.webp', phrase: 'e_is_for_egg.m4a' },
      { id: 'elephant', text: 'Elephant', audio: 'elephant.m4a', image: 'elephant.webp', phrase: 'e_is_for_elephant.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'ɛ',
        label: 'Core short vowel',
        words: [
          { id: 'egg', text: 'Egg', audio: 'egg.m4a', image: 'egg.webp' },
          { id: 'elephant', text: 'Elephant', audio: 'elephant.m4a', image: 'elephant.webp' },
        ],
      },
      {
        ipa: 'iː',
        label: 'Long vowel',
        words: [
          { id: 'zebra', text: 'Zebra', audio: 'zebra.m4a', image: 'zebra.webp' },
          { id: 'evening', text: 'Evening', audio: 'evening.m4a', image: 'evening.webp' },
        ],
      },
      {
        ipa: 'ɪ~ə',
        label: 'Unstressed start, often weakened',
        words: [
          { id: 'event', text: 'Event', audio: 'event.m4a', image: 'event.webp' },
          { id: 'effect', text: 'Effect', audio: 'effect.m4a', image: 'effect.webp' },
        ],
      },
      {
        ipa: 'ə',
        label: 'Unstressed (schwa)',
        words: [
          { id: 'camera', text: 'Camera', audio: 'camera.m4a', image: 'camera.webp' },
          { id: 'garden', text: 'Garden', audio: 'garden.m4a', image: 'garden.webp' },
        ],
      },
      {
        ipa: 'ɝ',
        label: '"er" — R-controlled vowel',
        words: [
          { id: 'fern', text: 'Fern', audio: 'fern.m4a', image: 'fern.webp' },
          { id: 'term', text: 'Term', audio: 'term.m4a', image: 'term.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-final silent E — usually changes the vowel before it',
        words: [
          { id: 'cake', text: 'Cake', audio: 'cake.m4a', image: 'cake.webp' },
          { id: 'bike', text: 'Bike', audio: 'bike.m4a', image: 'bike.webp' },
        ],
      },
      {
        ipa: 'eɪ',
        label: 'Word-final E in loanwords (not a beginner-level pattern)',
        words: [
          { id: 'cafe', text: 'Café', audio: 'cafe.m4a', image: 'cafe.webp' },
          { id: 'resume', text: 'Résumé', audio: 'resume.m4a', image: 'resume.webp' },
        ],
      },
    ],
  },
  {
    letter: 'F',
    letterAudio: 'f_name.m4a',
    letterAudioMale: 'male/letter_f_male.m4a',
    letterAudioFemale: 'female/letter_f_female.m4a',
    phonicsAudio: 'f_phonics.m4a',
    phonicsIpa: 'f',
    letterNameIpa: 'ɛf',
    phonicsNote: null,
    words: [
      { id: 'fish', text: 'Fish', audio: 'fish.m4a', image: 'fish.webp', phrase: 'f_is_for_fish.m4a' },
      { id: 'frog', text: 'Frog', audio: 'frog.m4a', image: 'frog.webp', phrase: 'f_is_for_frog.m4a' },
    ],
    // The only other common F sound is /v/ (as in "of"), but there's no
    // beginner-friendly single-word noun for it — not worth a second row.
    soundVariants: [
      {
        ipa: 'f',
        label: 'Core sound — nearly the only common reading',
        words: [
          { id: 'fish', text: 'Fish', audio: 'fish.m4a', image: 'fish.webp' },
          { id: 'frog', text: 'Frog', audio: 'frog.m4a', image: 'frog.webp' },
        ],
      },
    ],
  },
  {
    letter: 'G',
    letterAudio: 'g_name.m4a',
    letterAudioMale: 'male/letter_g_male.m4a',
    letterAudioFemale: 'female/letter_g_female.m4a',
    phonicsAudio: 'g_phonics.m4a',
    phonicsIpa: 'g',
    letterNameIpa: 'dʒiː',
    phonicsNote: null,
    words: [
      { id: 'goat', text: 'Goat', audio: 'goat.m4a', image: 'goat.webp', phrase: 'g_is_for_goat.m4a' },
      { id: 'grapes', text: 'Grapes', audio: 'grapes.m4a', image: 'grapes.webp', phrase: 'g_is_for_grapes.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'g',
        label: 'Hard G',
        words: [
          { id: 'goat', text: 'Goat', audio: 'goat.m4a', image: 'goat.webp' },
          { id: 'grapes', text: 'Grapes', audio: 'grapes.m4a', image: 'grapes.webp' },
        ],
      },
      {
        ipa: 'dʒ',
        label: 'Soft G',
        words: [
          { id: 'giraffe', text: 'Giraffe', audio: 'giraffe.m4a', image: 'giraffe.webp' },
          { id: 'gem', text: 'Gem', audio: 'gem.m4a', image: 'gem.webp' },
        ],
      },
      {
        ipa: 'ʒ',
        label: 'From French loanwords',
        words: [
          { id: 'genre', text: 'Genre', audio: 'genre.m4a', image: 'genre.webp' },
          { id: 'garage', text: 'Garage', audio: 'garage.m4a', image: 'garage.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: '"gn" or special words',
        words: [
          { id: 'gnome', text: 'Gnome', audio: 'gnome.m4a', image: 'gnome.webp' },
          { id: 'sign', text: 'Sign', audio: 'sign.m4a', image: 'sign.webp' },
        ],
      },
    ],
  },
  {
    letter: 'H',
    letterAudio: 'h_name.m4a',
    letterAudioMale: 'male/letter_h_male.m4a',
    letterAudioFemale: 'female/letter_h_female.m4a',
    phonicsAudio: 'h_phonics.m4a',
    phonicsIpa: 'h',
    letterNameIpa: 'eɪtʃ',
    phonicsNote: null,
    words: [
      { id: 'hat', text: 'Hat', audio: 'hat.m4a', image: 'hat.webp', phrase: 'h_is_for_hat.m4a' },
      { id: 'horse', text: 'Horse', audio: 'horse.m4a', image: 'horse.webp', phrase: 'h_is_for_horse.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'h',
        label: 'Core sound',
        words: [
          { id: 'hat', text: 'Hat', audio: 'hat.m4a', image: 'hat.webp' },
          { id: 'horse', text: 'Horse', audio: 'horse.m4a', image: 'horse.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Irregular',
        words: [
          { id: 'hour', text: 'Hour', audio: 'hour.m4a', image: 'hour.webp' },
          { id: 'heir', text: 'Heir', audio: 'heir.m4a', image: 'heir.webp' },
        ],
      },
    ],
  },
  {
    letter: 'I',
    letterAudio: 'i_name.m4a',
    letterAudioMale: 'male/letter_i_male.m4a',
    letterAudioFemale: 'female/letter_i_female.m4a',
    phonicsAudio: 'i_phonics.m4a',
    phonicsIpa: 'ɪ',
    letterNameIpa: 'aɪ',
    phonicsNote: "I says /I/, and sometimes says its name /aI/, like Ice cream!",
    words: [
      { id: 'ice_cream', text: 'Ice cream', audio: 'ice_cream.m4a', image: 'ice_cream.webp', phrase: 'i_is_for_ice_cream.m4a' },
      { id: 'iguana', text: 'Iguana', audio: 'iguana.m4a', image: 'iguana.webp', phrase: 'i_is_for_iguana.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'ɪ',
        label: 'Core short vowel',
        words: [
          { id: 'insect', text: 'Insect', audio: 'insect.m4a', image: 'insect.webp' },
          { id: 'pin', text: 'Pin', audio: 'pin.m4a', image: 'pin.webp' },
        ],
      },
      {
        ipa: 'aɪ',
        label: 'Long vowel',
        words: [
          { id: 'island', text: 'Island', audio: 'island.m4a', image: 'island.webp' },
          { id: 'pie', text: 'Pie', audio: 'pie.m4a', image: 'pie.webp' },
        ],
      },
      {
        ipa: 'iː',
        label: 'Loanwords or certain endings',
        words: [
          { id: 'machine', text: 'Machine', audio: 'machine.m4a', image: 'machine.webp' },
          { id: 'ski', text: 'Ski', audio: 'ski.m4a', image: 'ski.webp' },
        ],
      },
      {
        ipa: 'ɝ',
        label: '"ir" — R-controlled vowel',
        words: [
          { id: 'bird', text: 'Bird', audio: 'bird.m4a', image: 'bird.webp' },
          { id: 'shirt', text: 'Shirt', audio: 'shirt.m4a', image: 'shirt.webp' },
        ],
      },
      {
        ipa: 'j',
        label: 'Before a vowel, sounds like Y',
        words: [
          { id: 'onion', text: 'Onion', audio: 'onion.m4a', image: 'onion.webp' },
          { id: 'million', text: 'Million', audio: 'million.m4a', image: 'million.webp' },
        ],
      },
      {
        ipa: 'ə~ɪ',
        label: 'Unstressed, weakened',
        words: [
          { id: 'pencil', text: 'Pencil', audio: 'pencil.m4a', image: 'pencil.webp' },
          { id: 'cousin', text: 'Cousin', audio: 'cousin.m4a', image: 'cousin.webp' },
        ],
      },
    ],
  },
  {
    letter: 'J',
    letterAudio: 'j_name.m4a',
    letterAudioMale: 'male/letter_j_male.m4a',
    letterAudioFemale: 'female/letter_j_female.m4a',
    phonicsAudio: 'j_phonics.m4a',
    phonicsIpa: 'dʒ',
    letterNameIpa: 'dʒeɪ',
    phonicsNote: null,
    words: [
      { id: 'juice', text: 'Juice', audio: 'juice.m4a', image: 'juice.webp', phrase: 'j_is_for_juice.m4a' },
      { id: 'jellyfish', text: 'Jellyfish', audio: 'jellyfish.m4a', image: 'jellyfish.webp', phrase: 'j_is_for_jellyfish.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'dʒ',
        label: 'Core sound',
        words: [
          { id: 'juice', text: 'Juice', audio: 'juice.m4a', image: 'juice.webp' },
          { id: 'jellyfish', text: 'Jellyfish', audio: 'jellyfish.m4a', image: 'jellyfish.webp' },
        ],
      },
      {
        ipa: 'j',
        label: 'From Scandinavian loanwords (low frequency)',
        words: [{ id: 'fjord', text: 'Fjord', audio: 'fjord.m4a', image: 'fjord.webp' }],
      },
      {
        ipa: 'h',
        label: 'From Spanish loanwords',
        words: [{ id: 'jalapeno', text: 'Jalapeño', audio: 'jalapeno.m4a', image: 'jalapeno.webp' }],
      },
    ],
  },
  {
    letter: 'K',
    letterAudio: 'k_name.m4a',
    letterAudioMale: 'male/letter_k_male.m4a',
    letterAudioFemale: 'female/letter_k_female.m4a',
    phonicsAudio: 'k_phonics.m4a',
    phonicsIpa: 'k',
    letterNameIpa: 'keɪ',
    phonicsNote: null,
    words: [
      { id: 'kite', text: 'Kite', audio: 'kite.m4a', image: 'kite.webp', phrase: 'k_is_for_kite.m4a' },
      { id: 'koala', text: 'Koala', audio: 'koala.m4a', image: 'koala.webp', phrase: 'k_is_for_koala.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'k',
        label: 'Core sound',
        words: [
          { id: 'kite', text: 'Kite', audio: 'kite.m4a', image: 'kite.webp' },
          { id: 'koala', text: 'Koala', audio: 'koala.m4a', image: 'koala.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-initial "kn"',
        words: [
          { id: 'knee', text: 'Knee', audio: 'knee.m4a', image: 'knee.webp' },
          { id: 'knife', text: 'Knife', audio: 'knife.m4a', image: 'knife.webp' },
        ],
      },
    ],
  },
  {
    letter: 'L',
    letterAudio: 'l_name.m4a',
    letterAudioMale: 'male/letter_l_male.m4a',
    letterAudioFemale: 'female/letter_l_female.m4a',
    phonicsAudio: 'l_phonics.m4a',
    phonicsIpa: 'l',
    letterNameIpa: 'ɛl',
    phonicsNote: null,
    words: [
      { id: 'lion', text: 'Lion', audio: 'lion.m4a', image: 'lion.webp', phrase: 'l_is_for_lion.m4a' },
      { id: 'leaf', text: 'Leaf', audio: 'leaf.m4a', image: 'leaf.webp', phrase: 'l_is_for_leaf.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'l',
        label: 'Clear L',
        words: [
          { id: 'lion', text: 'Lion', audio: 'lion.m4a', image: 'lion.webp' },
          { id: 'leaf', text: 'Leaf', audio: 'leaf.m4a', image: 'leaf.webp' },
        ],
      },
      {
        ipa: 'l',
        label: 'Dark L — word-final or before a consonant',
        words: [
          { id: 'owl', text: 'Owl', audio: 'owl.m4a', image: 'owl.webp' },
          { id: 'milk', text: 'Milk', audio: 'milk.m4a', image: 'milk.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Special spellings',
        words: [
          { id: 'calf', text: 'Calf', audio: 'calf.m4a', image: 'calf.webp' },
          { id: 'yolk', text: 'Yolk', audio: 'yolk.m4a', image: 'yolk.webp' },
        ],
      },
    ],
  },
  {
    letter: 'M',
    letterAudio: 'm_name.m4a',
    letterAudioMale: 'male/letter_m_male.m4a',
    letterAudioFemale: 'female/letter_m_female.m4a',
    phonicsAudio: 'm_phonics.m4a',
    phonicsIpa: 'm',
    letterNameIpa: 'ɛm',
    phonicsNote: null,
    words: [
      { id: 'moon', text: 'Moon', audio: 'moon.m4a', image: 'moon.webp', phrase: 'm_is_for_moon.m4a' },
      { id: 'monkey', text: 'Monkey', audio: 'monkey.m4a', image: 'monkey.webp', phrase: 'm_is_for_monkey.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'm',
        label: 'Core sound',
        words: [
          { id: 'moon', text: 'Moon', audio: 'moon.m4a', image: 'moon.webp' },
          { id: 'monkey', text: 'Monkey', audio: 'monkey.m4a', image: 'monkey.webp' },
        ],
      },
      {
        ipa: 'm',
        label: 'Syllabic M — still the /m/ sound',
        words: [
          { id: 'rhythm', text: 'Rhythm', audio: 'rhythm.m4a', image: 'rhythm.webp' },
          { id: 'prism', text: 'Prism', audio: 'prism.m4a', image: 'prism.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Rare word-initial "mn"',
        words: [{ id: 'mnemonic', text: 'Mnemonic', audio: 'mnemonic.m4a', image: 'mnemonic.webp' }],
      },
    ],
  },
  {
    letter: 'N',
    letterAudio: 'n_name.m4a',
    letterAudioMale: 'male/letter_n_male.m4a',
    letterAudioFemale: 'female/letter_n_female.m4a',
    phonicsAudio: 'n_phonics.m4a',
    phonicsIpa: 'n',
    letterNameIpa: 'ɛn',
    phonicsNote: null,
    words: [
      { id: 'nest', text: 'Nest', audio: 'nest.m4a', image: 'nest.webp', phrase: 'n_is_for_nest.m4a' },
      { id: 'nose', text: 'Nose', audio: 'nose.m4a', image: 'nose.webp', phrase: 'n_is_for_nose.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'n',
        label: 'Core sound',
        words: [
          { id: 'nest', text: 'Nest', audio: 'nest.m4a', image: 'nest.webp' },
          { id: 'nose', text: 'Nose', audio: 'nose.m4a', image: 'nose.webp' },
        ],
      },
      {
        ipa: 'ŋ',
        label: 'Before /k/ or /g/',
        words: [
          { id: 'bank', text: 'Bank', audio: 'bank.m4a', image: 'bank.webp' },
          { id: 'uncle', text: 'Uncle', audio: 'uncle.m4a', image: 'uncle.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-final "mn"',
        words: [
          { id: 'autumn', text: 'Autumn', audio: 'autumn.m4a', image: 'autumn.webp' },
          { id: 'column', text: 'Column', audio: 'column.m4a', image: 'column.webp' },
        ],
      },
    ],
  },
  {
    letter: 'O',
    letterAudio: 'o_name.m4a',
    letterAudioMale: 'male/letter_o_male.m4a',
    letterAudioFemale: 'female/letter_o_female.m4a',
    phonicsAudio: 'o_phonics.m4a',
    phonicsIpa: 'ɑ',
    letterNameIpa: 'oʊ',
    phonicsNote: "O says /ah/. Orange and Owl start with O too - listen closely!",
    words: [
      { id: 'orange', text: 'Orange', audio: 'orange.m4a', image: 'orange.webp', phrase: 'o_is_for_orange.m4a' },
      { id: 'owl', text: 'Owl', audio: 'owl.m4a', image: 'owl.webp', phrase: 'o_is_for_owl.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'ɑ',
        label: 'American short O',
        words: [
          { id: 'octopus', text: 'Octopus', audio: 'octopus.m4a', image: 'octopus.webp' },
          { id: 'box', text: 'Box', audio: 'box.m4a', image: 'box.webp' },
        ],
      },
      {
        ipa: 'oʊ',
        label: 'Long O',
        words: [
          { id: 'ocean', text: 'Ocean', audio: 'ocean.m4a', image: 'ocean.webp' },
          { id: 'boat', text: 'Boat', audio: 'boat.m4a', image: 'boat.webp' },
        ],
      },
      {
        ipa: 'ʌ',
        label: 'Irregular, but very common',
        words: [
          { id: 'oven', text: 'Oven', audio: 'oven.m4a', image: 'oven.webp' },
          { id: 'glove', text: 'Glove', audio: 'glove.m4a', image: 'glove.webp' },
        ],
      },
      {
        ipa: 'uː',
        label: 'Special spelling ("oe")',
        words: [
          { id: 'shoe', text: 'Shoe', audio: 'shoe.m4a', image: 'shoe.webp' },
          { id: 'canoe', text: 'Canoe', audio: 'canoe.m4a', image: 'canoe.webp' },
        ],
      },
      {
        ipa: 'ʊ',
        label: 'Special short sound',
        words: [
          { id: 'wolf', text: 'Wolf', audio: 'wolf.m4a', image: 'wolf.webp' },
          { id: 'woman', text: 'Woman', audio: 'woman.m4a', image: 'woman.webp' },
        ],
      },
      {
        ipa: 'ə',
        label: 'Unstressed (schwa)',
        words: [
          { id: 'lemon', text: 'Lemon', audio: 'lemon.m4a', image: 'lemon.webp' },
          { id: 'dragon', text: 'Dragon', audio: 'dragon.m4a', image: 'dragon.webp' },
        ],
      },
      {
        ipa: 'ɔr',
        label: '"or" — R-controlled vowel',
        words: [
          { id: 'fork', text: 'Fork', audio: 'fork.m4a', image: 'fork.webp' },
          { id: 'corn', text: 'Corn', audio: 'corn.m4a', image: 'corn.webp' },
        ],
      },
      {
        ipa: 'ɝ',
        label: '"wor" — a special R-controlled case',
        words: [
          { id: 'worm', text: 'Worm', audio: 'worm.m4a', image: 'worm.webp' },
          { id: 'world', text: 'World', audio: 'world.m4a', image: 'world.webp' },
        ],
      },
      {
        ipa: 'ɔ~ɑ',
        label: 'Varies by accent (cot-caught)',
        words: [
          { id: 'song', text: 'Song', audio: 'song.m4a', image: 'song.webp' },
          { id: 'coffee', text: 'Coffee', audio: 'coffee.m4a', image: 'coffee.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Part of an irregular spelling ("eo")',
        words: [{ id: 'people', text: 'People', audio: 'people.m4a', image: 'people.webp' }],
      },
    ],
  },
  {
    letter: 'P',
    letterAudio: 'p_name.m4a',
    letterAudioMale: 'male/letter_p_male.m4a',
    letterAudioFemale: 'female/letter_p_female.m4a',
    phonicsAudio: 'p_phonics.m4a',
    phonicsIpa: 'p',
    letterNameIpa: 'piː',
    phonicsNote: null,
    words: [
      { id: 'panda', text: 'Panda', audio: 'panda.m4a', image: 'panda.webp', phrase: 'p_is_for_panda.m4a' },
      { id: 'pig', text: 'Pig', audio: 'pig.m4a', image: 'pig.webp', phrase: 'p_is_for_pig.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'p',
        label: 'Core sound',
        words: [
          { id: 'panda', text: 'Panda', audio: 'panda.m4a', image: 'panda.webp' },
          { id: 'pig', text: 'Pig', audio: 'pig.m4a', image: 'pig.webp' },
        ],
      },
      {
        ipa: 'p',
        label: 'Unaspirated after S — still /p/',
        words: [
          { id: 'spoon', text: 'Spoon', audio: 'spoon.m4a', image: 'spoon.webp' },
          { id: 'spider', text: 'Spider', audio: 'spider.m4a', image: 'spider.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-initial "ps"/"pt"',
        words: [
          { id: 'psychology', text: 'Psychology', audio: 'psychology.m4a', image: 'psychology.webp' },
          { id: 'pterodactyl', text: 'Pterodactyl', audio: 'pterodactyl.m4a', image: 'pterodactyl.webp' },
        ],
      },
    ],
  },
  {
    letter: 'Q',
    letterAudio: 'q_name.m4a',
    letterAudioMale: 'male/letter_q_male.m4a',
    letterAudioFemale: 'female/letter_q_female.m4a',
    phonicsAudio: 'q_phonics.m4a',
    phonicsIpa: 'kw',
    letterNameIpa: 'kjuː',
    phonicsNote: null,
    words: [
      { id: 'queen', text: 'Queen', audio: 'queen.m4a', image: 'queen.webp', phrase: 'q_is_for_queen.m4a' },
      { id: 'quail', text: 'Quail', audio: 'quail.m4a', image: 'quail.webp', phrase: 'q_is_for_quail.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'kw',
        label: 'Core sound — the "qu" combination',
        words: [
          { id: 'queen', text: 'Queen', audio: 'queen.m4a', image: 'queen.webp' },
          { id: 'quail', text: 'Quail', audio: 'quail.m4a', image: 'quail.webp' },
        ],
      },
      {
        ipa: 'k',
        label: 'No /w/ — "que" ending',
        words: [
          { id: 'antique', text: 'Antique', audio: 'antique.m4a', image: 'antique.webp' },
          { id: 'mosque', text: 'Mosque', audio: 'mosque.m4a', image: 'mosque.webp' },
        ],
      },
    ],
  },
  {
    letter: 'R',
    letterAudio: 'r_name.m4a',
    letterAudioMale: 'male/letter_r_male.m4a',
    letterAudioFemale: 'female/letter_r_female.m4a',
    phonicsAudio: 'r_phonics.m4a',
    phonicsIpa: 'r',
    letterNameIpa: 'ɑr',
    phonicsNote: null,
    words: [
      { id: 'rabbit', text: 'Rabbit', audio: 'rabbit.m4a', image: 'rabbit.webp', phrase: 'r_is_for_rabbit.m4a' },
      { id: 'robot', text: 'Robot', audio: 'robot.m4a', image: 'robot.webp', phrase: 'r_is_for_robot.m4a' },
    ],
    // General American English has essentially one R sound — no second row.
    soundVariants: [
      {
        ipa: 'ɹ',
        label: 'Core sound — general American English',
        words: [
          { id: 'rabbit', text: 'Rabbit', audio: 'rabbit.m4a', image: 'rabbit.webp' },
          { id: 'robot', text: 'Robot', audio: 'robot.m4a', image: 'robot.webp' },
        ],
      },
    ],
  },
  {
    letter: 'S',
    letterAudio: 's_name.m4a',
    letterAudioMale: 'male/letter_s_male.m4a',
    letterAudioFemale: 'female/letter_s_female.m4a',
    phonicsAudio: 's_phonics.m4a',
    phonicsIpa: 's',
    letterNameIpa: 'ɛs',
    phonicsNote: null,
    words: [
      { id: 'sun', text: 'Sun', audio: 'sun.m4a', image: 'sun.webp', phrase: 's_is_for_sun.m4a' },
      { id: 'star', text: 'Star', audio: 'star.m4a', image: 'star.webp', phrase: 's_is_for_star.m4a' },
    ],
    soundVariants: [
      {
        ipa: 's',
        label: 'Voiceless',
        words: [
          { id: 'sun', text: 'Sun', audio: 'sun.m4a', image: 'sun.webp' },
          { id: 'bus', text: 'Bus', audio: 'bus.m4a', image: 'bus.webp' },
        ],
      },
      {
        ipa: 'z',
        label: 'Voiced',
        words: [
          { id: 'rose', text: 'Rose', audio: 'rose.m4a', image: 'rose.webp' },
          { id: 'keys', text: 'Keys', audio: 'keys.m4a', image: 'keys.webp' },
        ],
      },
      {
        ipa: 'ʃ',
        label: 'Special environment',
        words: [
          { id: 'sugar', text: 'Sugar', audio: 'sugar.m4a', image: 'sugar.webp' },
          { id: 'tissue', text: 'Tissue', audio: 'tissue.m4a', image: 'tissue.webp' },
        ],
      },
      {
        ipa: 'ʒ',
        label: 'Common in unstressed syllables',
        words: [
          { id: 'vision', text: 'Vision', audio: 'vision.m4a', image: 'vision.webp' },
          { id: 'treasure', text: 'Treasure', audio: 'treasure.m4a', image: 'treasure.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Irregular',
        words: [{ id: 'aisle', text: 'Aisle', audio: 'aisle.m4a', image: 'aisle.webp' }],
      },
    ],
  },
  {
    letter: 'T',
    letterAudio: 't_name.m4a',
    letterAudioMale: 'male/letter_t_male.m4a',
    letterAudioFemale: 'female/letter_t_female.m4a',
    phonicsAudio: 't_phonics.m4a',
    phonicsIpa: 't',
    letterNameIpa: 'tiː',
    phonicsNote: null,
    words: [
      { id: 'tiger', text: 'Tiger', audio: 'tiger.m4a', image: 'tiger.webp', phrase: 't_is_for_tiger.m4a' },
      { id: 'train', text: 'Train', audio: 'train.m4a', image: 'train.webp', phrase: 't_is_for_train.m4a' },
    ],
    soundVariants: [
      {
        ipa: 't',
        label: 'Core sound',
        words: [
          { id: 'tiger', text: 'Tiger', audio: 'tiger.m4a', image: 'tiger.webp' },
          { id: 'train', text: 'Train', audio: 'train.m4a', image: 'train.webp' },
        ],
      },
      {
        ipa: 't',
        label: 'American "flap T" — still /t/',
        words: [
          { id: 'water', text: 'Water', audio: 'water.m4a', image: 'water.webp' },
          { id: 'butter', text: 'Butter', audio: 'butter.m4a', image: 'butter.webp' },
        ],
      },
      {
        ipa: 't',
        label: 'American glottal stop — still /t/',
        words: [
          { id: 'button', text: 'Button', audio: 'button.m4a', image: 'button.webp' },
          { id: 'mountain', text: 'Mountain', audio: 'mountain.m4a', image: 'mountain.webp' },
        ],
      },
      {
        ipa: 'ʃ',
        label: '"tion" ending',
        words: [
          { id: 'nation', text: 'Nation', audio: 'nation.m4a', image: 'nation.webp' },
          { id: 'station', text: 'Station', audio: 'station.m4a', image: 'station.webp' },
        ],
      },
      {
        ipa: 'tʃ',
        label: '"ture" ending',
        words: [
          { id: 'picture', text: 'Picture', audio: 'picture.m4a', image: 'picture.webp' },
          { id: 'nature', text: 'Nature', audio: 'nature.m4a', image: 'nature.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Special words',
        words: [
          { id: 'castle', text: 'Castle', audio: 'castle.m4a', image: 'castle.webp' },
          { id: 'whistle', text: 'Whistle', audio: 'whistle.m4a', image: 'whistle.webp' },
        ],
      },
    ],
  },
  {
    letter: 'U',
    letterAudio: 'u_name.m4a',
    letterAudioMale: 'male/letter_u_male.m4a',
    letterAudioFemale: 'female/letter_u_female.m4a',
    phonicsAudio: 'u_phonics.m4a',
    phonicsIpa: 'ʌ',
    letterNameIpa: 'juː',
    phonicsNote: "U says /uh/, and sometimes says its name /yoo/, like Unicorn!",
    words: [
      { id: 'umbrella', text: 'Umbrella', audio: 'umbrella.m4a', image: 'umbrella.webp', phrase: 'u_is_for_umbrella.m4a' },
      { id: 'unicorn', text: 'Unicorn', audio: 'unicorn.m4a', image: 'unicorn.webp', phrase: 'u_is_for_unicorn.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'ʌ',
        label: 'Core short vowel',
        words: [
          { id: 'umbrella', text: 'Umbrella', audio: 'umbrella.m4a', image: 'umbrella.webp' },
          { id: 'cup', text: 'Cup', audio: 'cup.m4a', image: 'cup.webp' },
        ],
      },
      {
        ipa: 'uː',
        label: 'Long U without the /j/ glide',
        words: [
          { id: 'flute', text: 'Flute', audio: 'flute.m4a', image: 'flute.webp' },
          { id: 'rule', text: 'Rule', audio: 'rule.m4a', image: 'rule.webp' },
        ],
      },
      {
        ipa: 'ʊ',
        label: 'Special short sound',
        words: [
          { id: 'bull', text: 'Bull', audio: 'bull.m4a', image: 'bull.webp' },
          { id: 'bush', text: 'Bush', audio: 'bush.m4a', image: 'bush.webp' },
        ],
      },
      {
        ipa: 'juː',
        label: 'The "yoo" sound — the letter name itself',
        words: [
          { id: 'unicorn', text: 'Unicorn', audio: 'unicorn.m4a', image: 'unicorn.webp' },
          { id: 'music', text: 'Music', audio: 'music.m4a', image: 'music.webp' },
        ],
      },
      {
        ipa: 'ə',
        label: 'Unstressed (schwa)',
        words: [
          { id: 'circus', text: 'Circus', audio: 'circus.m4a', image: 'circus.webp' },
          { id: 'album', text: 'Album', audio: 'album.m4a', image: 'album.webp' },
        ],
      },
      {
        ipa: 'ɝ',
        label: '"ur" — R-controlled vowel',
        words: [
          { id: 'nurse', text: 'Nurse', audio: 'nurse.m4a', image: 'nurse.webp' },
          { id: 'turtle', text: 'Turtle', audio: 'turtle.m4a', image: 'turtle.webp' },
        ],
      },
      {
        ipa: 'ɪ',
        label: 'Irregular',
        words: [
          { id: 'business', text: 'Business', audio: 'business.m4a', image: 'business.webp' },
          { id: 'minute', text: 'Minute', audio: 'minute.m4a', image: 'minute.webp' },
        ],
      },
      {
        ipa: 'w',
        label: 'Inside the "qu" combination',
        words: [
          { id: 'quilt', text: 'Quilt', audio: 'quilt.m4a', image: 'quilt.webp' },
          { id: 'quarter', text: 'Quarter', audio: 'quarter.m4a', image: 'quarter.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Inside "gu"',
        words: [
          { id: 'guitar', text: 'Guitar', audio: 'guitar.m4a', image: 'guitar.webp' },
          { id: 'guard', text: 'Guard', audio: 'guard.m4a', image: 'guard.webp' },
        ],
      },
    ],
  },
  {
    letter: 'V',
    letterAudio: 'v_name.m4a',
    letterAudioMale: 'male/letter_v_male.m4a',
    letterAudioFemale: 'female/letter_v_female.m4a',
    phonicsAudio: 'v_phonics.m4a',
    phonicsIpa: 'v',
    letterNameIpa: 'viː',
    phonicsNote: null,
    words: [
      { id: 'van', text: 'Van', audio: 'van.m4a', image: 'van.webp', phrase: 'v_is_for_van.m4a' },
      { id: 'violin', text: 'Violin', audio: 'violin.m4a', image: 'violin.webp', phrase: 'v_is_for_violin.m4a' },
    ],
    // Practically only one common V sound — no second row.
    soundVariants: [
      {
        ipa: 'v',
        label: 'Core sound — nearly the only common reading',
        words: [
          { id: 'van', text: 'Van', audio: 'van.m4a', image: 'van.webp' },
          { id: 'violin', text: 'Violin', audio: 'violin.m4a', image: 'violin.webp' },
        ],
      },
    ],
  },
  {
    letter: 'W',
    letterAudio: 'w_name.m4a',
    letterAudioMale: 'male/letter_w_male.m4a',
    letterAudioFemale: 'female/letter_w_female.m4a',
    phonicsAudio: 'w_phonics.m4a',
    phonicsIpa: 'w',
    letterNameIpa: 'ˈdʌbəljuː',
    phonicsNote: null,
    words: [
      { id: 'whale', text: 'Whale', audio: 'whale.m4a', image: 'whale.webp', phrase: 'w_is_for_whale.m4a' },
      { id: 'watch', text: 'Watch', audio: 'watch.m4a', image: 'watch.webp', phrase: 'w_is_for_watch.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'w',
        label: 'Core sound',
        words: [
          { id: 'wagon', text: 'Wagon', audio: 'wagon.m4a', image: 'wagon.webp' },
          { id: 'window', text: 'Window', audio: 'window.m4a', image: 'window.webp' },
        ],
      },
      {
        ipa: '',
        silent: true,
        label: 'Word-initial "wr" or special words',
        words: [
          { id: 'wrist', text: 'Wrist', audio: 'wrist.m4a', image: 'wrist.webp' },
          { id: 'sword', text: 'Sword', audio: 'sword.m4a', image: 'sword.webp' },
        ],
      },
    ],
  },
  {
    letter: 'X',
    letterAudio: 'x_name.m4a',
    letterAudioMale: 'male/letter_x_male.m4a',
    letterAudioFemale: 'female/letter_x_female.m4a',
    phonicsAudio: 'x_phonics.m4a',
    phonicsIpa: 'ks',
    letterNameIpa: 'ɛks',
    phonicsNote: "X can sound like /z/ at the start, like Xylophone. At the end of words it sounds like /ks/, like fox and X-ray!",
    words: [
      { id: 'xylophone', text: 'Xylophone', audio: 'xylophone.m4a', image: 'xylophone.webp', phrase: 'x_is_for_xylophone.m4a' },
      { id: 'x_ray', text: 'X-ray', audio: 'x_ray.m4a', image: 'x_ray.webp', phrase: 'x_is_for_x_ray.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'ks',
        label: 'Most common',
        words: [
          { id: 'fox', text: 'Fox', audio: 'fox.m4a', image: 'fox.webp' },
          { id: 'wax', text: 'Wax', audio: 'wax.m4a', image: 'wax.webp' },
        ],
      },
      {
        ipa: 'gz',
        label: 'Before a stressed vowel',
        words: [
          { id: 'exam', text: 'Exam', audio: 'exam.m4a', image: 'exam.webp' },
          { id: 'exhibit', text: 'Exhibit', audio: 'exhibit.m4a', image: 'exhibit.webp' },
        ],
      },
      {
        ipa: 'z',
        label: 'Word-initial X',
        words: [{ id: 'xylophone', text: 'Xylophone', audio: 'xylophone.m4a', image: 'xylophone.webp' }],
      },
      {
        ipa: 'kʃ',
        label: '"x" + "ion" ending',
        words: [{ id: 'complexion', text: 'Complexion', audio: 'complexion.m4a', image: 'complexion.webp' }],
      },
      {
        ipa: 'gʒ',
        label: 'Common American reading',
        words: [{ id: 'luxury', text: 'Luxury', audio: 'luxury.m4a', image: 'luxury.webp' }],
      },
      {
        ipa: '',
        silent: true,
        label: 'From a French loanword',
        words: [{ id: 'roux', text: 'Roux', audio: 'roux.m4a', image: 'roux.webp' }],
      },
    ],
  },
  {
    letter: 'Y',
    letterAudio: 'y_name.m4a',
    letterAudioMale: 'male/letter_y_male.m4a',
    letterAudioFemale: 'female/letter_y_female.m4a',
    phonicsAudio: 'y_phonics.m4a',
    phonicsIpa: 'j',
    letterNameIpa: 'waɪ',
    phonicsNote: null,
    words: [
      { id: 'yak', text: 'Yak', audio: 'yak.m4a', image: 'yak.webp', phrase: 'y_is_for_yak.m4a' },
      { id: 'yo_yo', text: 'Yo-yo', audio: 'yo_yo.m4a', image: 'yo_yo.webp', phrase: 'y_is_for_yo_yo.m4a' },
    ],
    soundVariants: [
      {
        ipa: 'j',
        label: 'Consonant Y',
        words: [
          { id: 'yarn', text: 'Yarn', audio: 'yarn.m4a', image: 'yarn.webp' },
          { id: 'yacht', text: 'Yacht', audio: 'yacht.m4a', image: 'yacht.webp' },
        ],
      },
      {
        ipa: 'aɪ',
        label: 'Word-final long I',
        words: [
          { id: 'sky', text: 'Sky', audio: 'sky.m4a', image: 'sky.webp' },
          { id: 'fly', text: 'Fly', audio: 'fly.m4a', image: 'fly.webp' },
        ],
      },
      {
        ipa: 'iː',
        label: 'Unstressed word-final long E',
        words: [
          { id: 'baby', text: 'Baby', audio: 'baby.m4a', image: 'baby.webp' },
          { id: 'candy', text: 'Candy', audio: 'candy.m4a', image: 'candy.webp' },
        ],
      },
      {
        ipa: 'ɪ',
        label: 'Vowel Y, short sound',
        words: [
          { id: 'gym', text: 'Gym', audio: 'gym.m4a', image: 'gym.webp' },
          { id: 'lynx', text: 'Lynx', audio: 'lynx.m4a', image: 'lynx.webp' },
        ],
      },
    ],
  },
  {
    letter: 'Z',
    letterAudio: 'z_name.m4a',
    letterAudioMale: 'male/letter_z_male.m4a',
    letterAudioFemale: 'female/letter_z_female.m4a',
    phonicsAudio: 'z_phonics.m4a',
    phonicsIpa: 'z',
    letterNameIpa: 'ziː',
    phonicsNote: null,
    words: [
      { id: 'zebra', text: 'Zebra', audio: 'zebra.m4a', image: 'zebra.webp', phrase: 'z_is_for_zebra.m4a' },
      { id: 'zoo', text: 'Zoo', audio: 'zoo.m4a', image: 'zoo.webp', phrase: 'z_is_for_zoo.m4a' },
    ],
    // "Zebra" is already used as E's long-vowel example, so this row uses
    // a different Z word instead of repeating it.
    soundVariants: [
      {
        ipa: 'z',
        label: 'Core sound',
        words: [
          { id: 'zipper', text: 'Zipper', audio: 'zipper.m4a', image: 'zipper.webp' },
          { id: 'zoo', text: 'Zoo', audio: 'zoo.m4a', image: 'zoo.webp' },
        ],
      },
      {
        ipa: 'ʒ',
        label: 'From a French loanword',
        words: [{ id: 'azure', text: 'Azure', audio: 'azure.m4a', image: 'azure.webp' }],
      },
      {
        ipa: 'ts',
        label: '"z"/"zz"/"tz" spelling',
        words: [
          { id: 'quartz', text: 'Quartz', audio: 'quartz.m4a', image: 'quartz.webp' },
          { id: 'pizza', text: 'Pizza', audio: 'pizza.m4a', image: 'pizza.webp' },
        ],
      },
    ],
  },
];
