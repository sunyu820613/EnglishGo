import { phonemeAudioSlugs } from './phonemeAudioSlugs';
import { phonemeExampleWords } from './phonemeExampleWords';
import type { PhonemeCategory, PhonemeDefinition } from './phonemes.types';

/**
 * The 47 IPA symbols grouped by category, in display order.
 * Counts match docs/phonetics-react-rewrite-scope.md: vowel 10 +
 * diphthong 5 + rColoredVowel 6 + voicelessConsonant 8 + voicedConsonant 8 +
 * otherConsonant 10 = 47.
 */
const categoryOrder: Array<{ category: PhonemeCategory; ipas: string[] }> = [
  { category: 'vowel', ipas: ['iː', 'ɪ', 'ɛ', 'æ', 'ɑ', 'ɔː', 'ʊ', 'uː', 'ʌ', 'ə'] },
  { category: 'diphthong', ipas: ['eɪ', 'aɪ', 'aʊ', 'ɔɪ', 'oʊ'] },
  { category: 'rColoredVowel', ipas: ['ɝ', 'ɚ', 'ɑr', 'ɛr', 'ɪr', 'ɔr'] },
  { category: 'voicelessConsonant', ipas: ['p', 't', 'k', 'tʃ', 'f', 'θ', 's', 'ʃ'] },
  { category: 'voicedConsonant', ipas: ['b', 'd', 'g', 'dʒ', 'v', 'ð', 'z', 'ʒ'] },
  { category: 'otherConsonant', ipas: ['m', 'n', 'ŋ', 'l', 'w', 'j', 'h', 'r', 'ʔ', 'ɾ'] },
];

/**
 * Single source of truth for the 47-phoneme learning content. M1 only has
 * one audio variant per phoneme (no male/female or slow speed matrix yet —
 * see docs/phonetics-react-rewrite-scope.md §1), so `audio` carries a single
 * neutral/normal entry that the M1 UI treats as the only playable option.
 */
export const phonemes: PhonemeDefinition[] = categoryOrder.flatMap(({ category, ipas }) =>
  ipas.map((ipa) => {
    const slug = phonemeAudioSlugs[ipa];
    if (!slug) {
      throw new Error(`Missing audio slug for phoneme ${ipa}`);
    }
    return {
      ipa,
      slug,
      category,
      exampleWords: phonemeExampleWords[ipa] ?? [],
      audio: [{ voice: 'neutral', speed: 'normal', src: `${slug}.wav` }],
    };
  }),
);

export function findPhonemeBySlug(slug: string): PhonemeDefinition | undefined {
  return phonemes.find((p) => p.slug === slug);
}
