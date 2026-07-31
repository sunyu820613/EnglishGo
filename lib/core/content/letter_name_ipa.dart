/// Standard American-English IPA transcription of each letter's own NAME
/// (e.g. how you'd recite the alphabet: "A" /eɪ/, "B" /biː/...).
///
/// This is fixed, universal English-alphabet knowledge -- unlike
/// `phonicsIpa` in alphabet.json (the primary phonics sound, which has
/// per-letter teaching exceptions curated per CONTENT_GUIDE.md), so it's
/// kept here as a static lookup rather than authored content.
const Map<String, String> letterNameIpa = <String, String>{
  'A': 'eɪ',
  'B': 'biː',
  'C': 'siː',
  'D': 'diː',
  'E': 'iː',
  'F': 'ɛf',
  'G': 'dʒiː',
  'H': 'eɪtʃ',
  'I': 'aɪ',
  'J': 'dʒeɪ',
  'K': 'keɪ',
  'L': 'ɛl',
  'M': 'ɛm',
  'N': 'ɛn',
  'O': 'oʊ',
  'P': 'piː',
  'Q': 'kjuː',
  'R': 'ɑːr',
  'S': 'ɛs',
  'T': 'tiː',
  'U': 'juː',
  'V': 'viː',
  'W': 'dʌbəljuː',
  'X': 'ɛks',
  'Y': 'waɪ',
  'Z': 'ziː',
};
