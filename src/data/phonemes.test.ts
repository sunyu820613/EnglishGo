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
});
