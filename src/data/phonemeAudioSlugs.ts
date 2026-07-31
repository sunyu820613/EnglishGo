/**
 * Maps each recorded IPA symbol to its ASCII-safe audio filename slug.
 *
 * Non-ASCII asset paths get double-percent-encoded by some request paths
 * (confirmed in the original Flutter app: a request for `æ.wav` fetched
 * `%25C3%25A6.wav`, a 404). Recordings are stored under
 * public/audio/phonemes/{slug}.wav using these ASCII names instead.
 *
 * Migrated from lib/core/content/phoneme_audio_slugs.dart.
 */
export const phonemeAudioSlugs: Record<string, string> = {
  'iː': 'i',
  ɪ: 'ih',
  ɛ: 'eh',
  æ: 'ae',
  ɑ: 'aa',
  'ɔː': 'aw',
  ʊ: 'uh',
  'uː': 'uw',
  ʌ: 'ah',
  ə: 'schwa',
  eɪ: 'ei',
  aɪ: 'ai',
  aʊ: 'au',
  ɔɪ: 'oi',
  oʊ: 'ou',
  ɝ: 'er',
  ɚ: 'axr',
  ɑr: 'aar',
  ɛr: 'ehr',
  ɪr: 'ihr',
  ɔr: 'awr',
  p: 'p',
  t: 't',
  k: 'k',
  'tʃ': 'ch',
  f: 'f',
  θ: 'th',
  s: 's',
  'ʃ': 'sh',
  b: 'b',
  d: 'd',
  g: 'g',
  'dʒ': 'jh',
  v: 'v',
  ð: 'dh',
  z: 'z',
  'ʒ': 'zh',
  m: 'm',
  n: 'n',
  ŋ: 'ng',
  l: 'l',
  w: 'w',
  j: 'y',
  h: 'h',
  r: 'r',
  ʔ: 'glottal',
  ɾ: 'flap',
};
