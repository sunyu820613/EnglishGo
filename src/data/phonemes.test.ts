import { describe, expect, it } from 'vitest';
import { phonemes, findPhonemeBySlug } from './phonemes';

describe('phonemes data', () => {
  it('has exactly 47 phonemes total', () => {
    expect(phonemes).toHaveLength(47);
  });

  it('matches the documented category breakdown (10/5/6/8/8/10)', () => {
    const counts: Record<string, number> = {};
    for (const p of phonemes) counts[p.category] = (counts[p.category] ?? 0) + 1;
    expect(counts).toEqual({
      vowel: 10,
      diphthong: 5,
      rColoredVowel: 6,
      voicelessConsonant: 8,
      voicedConsonant: 8,
      otherConsonant: 10,
    });
  });

  it('every phoneme has a unique ASCII slug and at least one audio variant', () => {
    const slugs = new Set(phonemes.map((p) => p.slug));
    expect(slugs.size).toBe(phonemes.length);
    for (const p of phonemes) {
      expect(p.audio.length).toBeGreaterThan(0);
    }
  });

  it('findPhonemeBySlug resolves a known phoneme and returns undefined for unknown slugs', () => {
    expect(findPhonemeBySlug('th')?.ipa).toBe('θ');
    expect(findPhonemeBySlug('not-a-real-slug')).toBeUndefined();
  });

  describe('M2 sample phonemes (/iː/ /æ/ /θ/ /r/ /ŋ/)', () => {
    const sampleSlugs = ['i', 'ae', 'th', 'r', 'ng'];

    it('each has an animationRig and the other 42 phonemes do not', () => {
      for (const p of phonemes) {
        if (sampleSlugs.includes(p.slug)) {
          expect(p.animationRig).toBeDefined();
        } else {
          expect(p.animationRig).toBeUndefined();
        }
      }
    });

    it('each has a full male/female x normal/slow audio matrix (4 variants)', () => {
      for (const slug of sampleSlugs) {
        const p = findPhonemeBySlug(slug);
        expect(p?.audio).toHaveLength(4);
        for (const voice of ['male', 'female'] as const) {
          for (const speed of ['normal', 'slow'] as const) {
            expect(p?.audio.some((v) => v.voice === voice && v.speed === speed)).toBe(true);
          }
        }
      }
    });

    it('each has at least 2 example words', () => {
      for (const slug of sampleSlugs) {
        const p = findPhonemeBySlug(slug);
        expect(p?.exampleWords.length ?? 0).toBeGreaterThanOrEqual(2);
      }
    });

    it('each has a minimal-pair partner that resolves to a real phoneme', () => {
      for (const slug of sampleSlugs) {
        const p = findPhonemeBySlug(slug);
        expect(p?.minimalPairs?.length).toBeGreaterThan(0);
        const partnerSlug = p?.minimalPairs?.[0];
        expect(partnerSlug ? findPhonemeBySlug(partnerSlug) : undefined).toBeDefined();
      }
    });
  });
});
