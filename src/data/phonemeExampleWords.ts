import type { WordExample } from './phonemes.types';

/**
 * Three example words per recorded IPA symbol, with the highlighted
 * range being the letter(s) that spell that phoneme in that word.
 * Migrated from lib/core/content/phoneme_example_words.dart.
 */
export const phonemeExampleWords: Record<string, WordExample[]> = {
  'iː': [
    { word: 'see', highlightStart: 1, highlightLength: 2, audioSlug: 'see' },
    { word: 'tree', highlightStart: 2, highlightLength: 2, audioSlug: 'tree' },
    { word: 'key', highlightStart: 1, highlightLength: 2, audioSlug: 'key' },
  ],
  'ɪ': [
    { word: 'sit', highlightStart: 1, highlightLength: 1, audioSlug: 'sit' },
    { word: 'fish', highlightStart: 1, highlightLength: 1, audioSlug: 'fish' },
    { word: 'big', highlightStart: 1, highlightLength: 1, audioSlug: 'big' },
  ],
  'ɛ': [
    { word: 'bed', highlightStart: 1, highlightLength: 1, audioSlug: 'bed' },
    { word: 'red', highlightStart: 1, highlightLength: 1, audioSlug: 'red' },
    { word: 'ten', highlightStart: 1, highlightLength: 1, audioSlug: 'ten' },
  ],
  'æ': [
    { word: 'cat', highlightStart: 1, highlightLength: 1, audioSlug: 'cat' },
    { word: 'hat', highlightStart: 1, highlightLength: 1, audioSlug: 'hat' },
    { word: 'apple', highlightStart: 0, highlightLength: 1, audioSlug: 'apple' },
  ],
  'ɑ': [
    { word: 'hot', highlightStart: 1, highlightLength: 1, audioSlug: 'hot' },
    { word: 'sock', highlightStart: 1, highlightLength: 1, audioSlug: 'sock' },
    { word: 'top', highlightStart: 1, highlightLength: 1, audioSlug: 'top' },
  ],
  'ɔː': [
    { word: 'ball', highlightStart: 1, highlightLength: 1, audioSlug: 'ball' },
    { word: 'saw', highlightStart: 1, highlightLength: 2, audioSlug: 'saw' },
    { word: 'tall', highlightStart: 1, highlightLength: 1, audioSlug: 'tall' },
  ],
  'ʊ': [
    { word: 'book', highlightStart: 1, highlightLength: 2, audioSlug: 'book' },
    { word: 'foot', highlightStart: 1, highlightLength: 2, audioSlug: 'foot' },
    { word: 'put', highlightStart: 1, highlightLength: 1, audioSlug: 'put' },
  ],
  'uː': [
    { word: 'blue', highlightStart: 2, highlightLength: 2, audioSlug: 'blue' },
    { word: 'moon', highlightStart: 1, highlightLength: 2, audioSlug: 'moon' },
    { word: 'food', highlightStart: 1, highlightLength: 2, audioSlug: 'food' },
  ],
  'ʌ': [
    { word: 'cup', highlightStart: 1, highlightLength: 1, audioSlug: 'cup' },
    { word: 'sun', highlightStart: 1, highlightLength: 1, audioSlug: 'sun' },
    { word: 'run', highlightStart: 1, highlightLength: 1, audioSlug: 'run' },
  ],
  'ə': [
    { word: 'about', highlightStart: 0, highlightLength: 1, audioSlug: 'about' },
    { word: 'sofa', highlightStart: 3, highlightLength: 1, audioSlug: 'sofa' },
    { word: 'banana', highlightStart: 1, highlightLength: 1, audioSlug: 'banana' },
  ],
  'eɪ': [
    { word: 'day', highlightStart: 1, highlightLength: 2, audioSlug: 'day' },
    { word: 'rain', highlightStart: 1, highlightLength: 2, audioSlug: 'rain' },
    { word: 'eight', highlightStart: 0, highlightLength: 4, audioSlug: 'eight' },
  ],
  'aɪ': [
    { word: 'eye', highlightStart: 0, highlightLength: 3, audioSlug: 'eye' },
    { word: 'pie', highlightStart: 1, highlightLength: 2, audioSlug: 'pie' },
    { word: 'fly', highlightStart: 2, highlightLength: 1, audioSlug: 'fly' },
  ],
  'aʊ': [
    { word: 'house', highlightStart: 1, highlightLength: 2, audioSlug: 'house' },
    { word: 'cow', highlightStart: 1, highlightLength: 2, audioSlug: 'cow' },
    { word: 'mouth', highlightStart: 1, highlightLength: 2, audioSlug: 'mouth' },
  ],
  'ɔɪ': [
    { word: 'boy', highlightStart: 1, highlightLength: 2, audioSlug: 'boy' },
    { word: 'toy', highlightStart: 1, highlightLength: 2, audioSlug: 'toy' },
    { word: 'coin', highlightStart: 1, highlightLength: 2, audioSlug: 'coin' },
  ],
  'oʊ': [
    { word: 'go', highlightStart: 1, highlightLength: 1, audioSlug: 'go' },
    { word: 'boat', highlightStart: 1, highlightLength: 2, audioSlug: 'boat' },
    { word: 'snow', highlightStart: 2, highlightLength: 2, audioSlug: 'snow' },
  ],
  'ɝ': [
    { word: 'bird', highlightStart: 1, highlightLength: 2, audioSlug: 'bird' },
    { word: 'girl', highlightStart: 1, highlightLength: 2, audioSlug: 'girl' },
    { word: 'first', highlightStart: 1, highlightLength: 2, audioSlug: 'first' },
  ],
  'ɚ': [
    { word: 'mother', highlightStart: 4, highlightLength: 2, audioSlug: 'mother' },
    { word: 'teacher', highlightStart: 5, highlightLength: 2, audioSlug: 'teacher' },
    { word: 'dinner', highlightStart: 4, highlightLength: 2, audioSlug: 'dinner' },
  ],
  'ɑr': [
    { word: 'car', highlightStart: 1, highlightLength: 2, audioSlug: 'car' },
    { word: 'star', highlightStart: 2, highlightLength: 2, audioSlug: 'star' },
    { word: 'far', highlightStart: 1, highlightLength: 2, audioSlug: 'far' },
  ],
  'ɛr': [
    { word: 'hair', highlightStart: 1, highlightLength: 3, audioSlug: 'hair' },
    { word: 'bear', highlightStart: 1, highlightLength: 3, audioSlug: 'bear' },
    { word: 'chair', highlightStart: 2, highlightLength: 3, audioSlug: 'chair' },
  ],
  'ɪr': [
    { word: 'ear', highlightStart: 0, highlightLength: 3, audioSlug: 'ear' },
    { word: 'deer', highlightStart: 1, highlightLength: 3, audioSlug: 'deer' },
    { word: 'here', highlightStart: 1, highlightLength: 3, audioSlug: 'here' },
  ],
  'ɔr': [
    { word: 'door', highlightStart: 1, highlightLength: 3, audioSlug: 'door' },
    { word: 'four', highlightStart: 1, highlightLength: 3, audioSlug: 'four' },
    { word: 'corn', highlightStart: 1, highlightLength: 2, audioSlug: 'corn' },
  ],
  'p': [
    { word: 'pen', highlightStart: 0, highlightLength: 1, audioSlug: 'pen' },
    { word: 'cup', highlightStart: 2, highlightLength: 1, audioSlug: 'cup' },
    { word: 'apple', highlightStart: 1, highlightLength: 2, audioSlug: 'apple' },
  ],
  't': [
    { word: 'top', highlightStart: 0, highlightLength: 1, audioSlug: 'top' },
    { word: 'cat', highlightStart: 2, highlightLength: 1, audioSlug: 'cat' },
    { word: 'stop', highlightStart: 1, highlightLength: 1, audioSlug: 'stop' },
  ],
  'k': [
    { word: 'cat', highlightStart: 0, highlightLength: 1, audioSlug: 'cat' },
    { word: 'key', highlightStart: 0, highlightLength: 1, audioSlug: 'key' },
    { word: 'book', highlightStart: 3, highlightLength: 1, audioSlug: 'book' },
  ],
  'tʃ': [
    { word: 'chair', highlightStart: 0, highlightLength: 2, audioSlug: 'chair' },
    { word: 'cheese', highlightStart: 0, highlightLength: 2, audioSlug: 'cheese' },
    { word: 'watch', highlightStart: 2, highlightLength: 3, audioSlug: 'watch' },
  ],
  'f': [
    { word: 'fish', highlightStart: 0, highlightLength: 1, audioSlug: 'fish' },
    { word: 'leaf', highlightStart: 3, highlightLength: 1, audioSlug: 'leaf' },
    { word: 'coffee', highlightStart: 2, highlightLength: 2, audioSlug: 'coffee' },
  ],
  'θ': [
    { word: 'think', highlightStart: 0, highlightLength: 2, audioSlug: 'think' },
    { word: 'teeth', highlightStart: 3, highlightLength: 2, audioSlug: 'teeth' },
    { word: 'bath', highlightStart: 2, highlightLength: 2, audioSlug: 'bath' },
  ],
  's': [
    { word: 'sun', highlightStart: 0, highlightLength: 1, audioSlug: 'sun' },
    { word: 'bus', highlightStart: 2, highlightLength: 1, audioSlug: 'bus' },
    { word: 'snake', highlightStart: 0, highlightLength: 1, audioSlug: 'snake' },
  ],
  'ʃ': [
    { word: 'shoe', highlightStart: 0, highlightLength: 2, audioSlug: 'shoe' },
    { word: 'fish', highlightStart: 2, highlightLength: 2, audioSlug: 'fish' },
    { word: 'wash', highlightStart: 2, highlightLength: 2, audioSlug: 'wash' },
  ],
  'b': [
    { word: 'ball', highlightStart: 0, highlightLength: 1, audioSlug: 'ball' },
    { word: 'baby', highlightStart: 0, highlightLength: 1, audioSlug: 'baby' },
    { word: 'tub', highlightStart: 2, highlightLength: 1, audioSlug: 'tub' },
  ],
  'd': [
    { word: 'dog', highlightStart: 0, highlightLength: 1, audioSlug: 'dog' },
    { word: 'red', highlightStart: 2, highlightLength: 1, audioSlug: 'red' },
    { word: 'bed', highlightStart: 2, highlightLength: 1, audioSlug: 'bed' },
  ],
  'g': [
    { word: 'go', highlightStart: 0, highlightLength: 1, audioSlug: 'go' },
    { word: 'dog', highlightStart: 2, highlightLength: 1, audioSlug: 'dog' },
    { word: 'egg', highlightStart: 1, highlightLength: 2, audioSlug: 'egg' },
  ],
  'dʒ': [
    { word: 'jump', highlightStart: 0, highlightLength: 1, audioSlug: 'jump' },
    { word: 'juice', highlightStart: 0, highlightLength: 1, audioSlug: 'juice' },
    { word: 'orange', highlightStart: 4, highlightLength: 1, audioSlug: 'orange' },
  ],
  'v': [
    { word: 'van', highlightStart: 0, highlightLength: 1, audioSlug: 'van' },
    { word: 'love', highlightStart: 2, highlightLength: 1, audioSlug: 'love' },
    { word: 'seven', highlightStart: 2, highlightLength: 1, audioSlug: 'seven' },
  ],
  'ð': [
    { word: 'this', highlightStart: 0, highlightLength: 2, audioSlug: 'this' },
    { word: 'mother', highlightStart: 2, highlightLength: 2, audioSlug: 'mother' },
    { word: 'bathe', highlightStart: 2, highlightLength: 2, audioSlug: 'bathe' },
  ],
  'z': [
    { word: 'zoo', highlightStart: 0, highlightLength: 1, audioSlug: 'zoo' },
    { word: 'lazy', highlightStart: 2, highlightLength: 1, audioSlug: 'lazy' },
    { word: 'nose', highlightStart: 2, highlightLength: 1, audioSlug: 'nose' },
  ],
  'ʒ': [
    { word: 'vision', highlightStart: 2, highlightLength: 2, audioSlug: 'vision' },
    { word: 'treasure', highlightStart: 4, highlightLength: 1, audioSlug: 'treasure' },
    { word: 'measure', highlightStart: 3, highlightLength: 1, audioSlug: 'measure' },
  ],
  'm': [
    { word: 'moon', highlightStart: 0, highlightLength: 1, audioSlug: 'moon' },
    { word: 'mom', highlightStart: 0, highlightLength: 1, audioSlug: 'mom' },
    { word: 'swim', highlightStart: 3, highlightLength: 1, audioSlug: 'swim' },
  ],
  'n': [
    { word: 'nose', highlightStart: 0, highlightLength: 1, audioSlug: 'nose' },
    { word: 'sun', highlightStart: 2, highlightLength: 1, audioSlug: 'sun' },
    { word: 'banana', highlightStart: 2, highlightLength: 1, audioSlug: 'banana' },
  ],
  'ŋ': [
    { word: 'sing', highlightStart: 2, highlightLength: 2, audioSlug: 'sing' },
    { word: 'ring', highlightStart: 2, highlightLength: 2, audioSlug: 'ring' },
    { word: 'king', highlightStart: 2, highlightLength: 2, audioSlug: 'king' },
  ],
  'l': [
    { word: 'lion', highlightStart: 0, highlightLength: 1, audioSlug: 'lion' },
    { word: 'ball', highlightStart: 2, highlightLength: 2, audioSlug: 'ball' },
    { word: 'apple', highlightStart: 3, highlightLength: 1, audioSlug: 'apple' },
  ],
  'w': [
    { word: 'water', highlightStart: 0, highlightLength: 1, audioSlug: 'water' },
    { word: 'wet', highlightStart: 0, highlightLength: 1, audioSlug: 'wet' },
    { word: 'away', highlightStart: 1, highlightLength: 1, audioSlug: 'away' },
  ],
  'j': [
    { word: 'yes', highlightStart: 0, highlightLength: 1, audioSlug: 'yes' },
    { word: 'yellow', highlightStart: 0, highlightLength: 1, audioSlug: 'yellow' },
    { word: 'yard', highlightStart: 0, highlightLength: 1, audioSlug: 'yard' },
  ],
  'h': [
    { word: 'hat', highlightStart: 0, highlightLength: 1, audioSlug: 'hat' },
    { word: 'house', highlightStart: 0, highlightLength: 1, audioSlug: 'house' },
    { word: 'hello', highlightStart: 0, highlightLength: 1, audioSlug: 'hello' },
  ],
  'r': [
    { word: 'run', highlightStart: 0, highlightLength: 1, audioSlug: 'run' },
    { word: 'zero', highlightStart: 2, highlightLength: 1, audioSlug: 'zero' },
    { word: 'rabbit', highlightStart: 0, highlightLength: 1, audioSlug: 'rabbit' },
  ],
  'ʔ': [
    { word: 'uh-oh', highlightStart: 2, highlightLength: 1, audioSlug: 'uh_oh' },
    { word: 'button', highlightStart: 2, highlightLength: 2, audioSlug: 'button' },
    { word: 'kitten', highlightStart: 2, highlightLength: 2, audioSlug: 'kitten' },
  ],
  'ɾ': [
    { word: 'butter', highlightStart: 2, highlightLength: 2, audioSlug: 'butter' },
    { word: 'water', highlightStart: 2, highlightLength: 1, audioSlug: 'water' },
    { word: 'ladder', highlightStart: 2, highlightLength: 2, audioSlug: 'ladder' },
  ],
};
