import { getSampleAnimationRig, phonemeAnimationRigs } from './phonemeAnimationRigs';
import { phonemeAudioSlugs } from './phonemeAudioSlugs';
import { phonemeExampleWords } from './phonemeExampleWords';
import type { PhonemeAudioVariant, PhonemeCategory, PhonemeDefinition } from './phonemes.types';

/**
 * M2 sample phonemes (docs/phonetics-react-rewrite-scope.md M2). Each needs
 * a full male/female x normal/slow audio matrix per the M2 acceptance
 * criteria, but no such recordings exist yet (only one neutral/normal file
 * per phoneme — see docs/phonetics-react-rewrite-scope.md §0). All four
 * variants below point at the same existing file as a placeholder so every
 * voice/speed button is real and clickable.
 * TODO: replace with real male/female + slow recordings once available.
 */
const sampleAudioMatrix: Record<string, PhonemeAudioVariant[]> = Object.fromEntries(
  Object.keys(phonemeAnimationRigs).map((slug) => [
    slug,
    [
      { voice: 'female', speed: 'normal', src: `${slug}.wav` },
      { voice: 'male', speed: 'normal', src: `${slug}.wav` },
      { voice: 'female', speed: 'slow', src: `${slug}.wav` },
      { voice: 'male', speed: 'slow', src: `${slug}.wav` },
    ],
  ]),
);

/**
 * Minimal-pair partners for the M2 sample phonemes (docs/phoneme-animation-spec.md
 * §6). Partners are looked up by slug; they don't need their own
 * `animationRig` — the comparison UI falls back to a static mouth shape for
 * phonemes without rig data (docs/phoneme-animation-spec.md "空状态").
 */
const sampleMinimalPairs: Record<string, string[]> = {
  i: ['ih'], // /iː/ vs /ɪ/ — see/sit
  ae: ['eh'], // /æ/ vs /ɛ/ — cat/bed
  th: ['dh'], // /θ/ vs /ð/ — think/this
  r: ['l'], // /r/ vs /l/ — run/lion
  ng: ['n'], // /ŋ/ vs /n/ — sing/sun
};

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
      audio: sampleAudioMatrix[slug] ?? [{ voice: 'neutral', speed: 'normal', src: `${slug}.wav` }],
      minimalPairs: sampleMinimalPairs[slug],
      animationRig: getSampleAnimationRig(slug),
    };
  }),
);

export function findPhonemeBySlug(slug: string): PhonemeDefinition | undefined {
  return phonemes.find((p) => p.slug === slug);
}
