import { describe, expect, it } from 'vitest';
import { alphabet } from './alphabet';

describe('alphabet data', () => {
  it('has all 26 letters, A through Z, in order', () => {
    expect(alphabet).toHaveLength(26);
    const expected = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    expect(alphabet.map((l) => l.letter)).toEqual(expected);
  });

  it('every letter has letter audio, phonics audio, an IPA symbol, and exactly two words', () => {
    for (const entry of alphabet) {
      expect(entry.letterAudio).toMatch(/\.m4a$/);
      expect(entry.phonicsAudio).toMatch(/\.m4a$/);
      expect(entry.phonicsIpa.length).toBeGreaterThan(0);
      expect(entry.words).toHaveLength(2);
      for (const word of entry.words) {
        expect(word.audio).toMatch(/\.m4a$/);
        expect(word.image).toMatch(/\.webp$/);
        expect(word.phrase).toMatch(/\.m4a$/);
      }
    }
  });

  it('every sound-variant entry (A, E) has a label and two well-formed example words, with an IPA symbol unless marked silent', () => {
    const lettersWithVariants = alphabet.filter((entry) => entry.soundVariants);
    expect(lettersWithVariants.length).toBeGreaterThanOrEqual(2);
    for (const entry of lettersWithVariants) {
      for (const variant of entry.soundVariants ?? []) {
        if (!variant.silent) expect(variant.ipa.length).toBeGreaterThan(0);
        expect(variant.label.length).toBeGreaterThan(0);
        expect(variant.words).toHaveLength(2);
        for (const word of variant.words) {
          expect(word.audio).toMatch(/\.m4a$/);
          expect(word.image).toMatch(/\.webp$/);
        }
      }
    }
  });

  it('every letter has male and female name audio references', () => {
    for (const entry of alphabet) {
      expect(entry.letterAudioMale).toMatch(/^male\/letter_.+_male\.m4a$/);
      expect(entry.letterAudioFemale).toMatch(/^female\/letter_.+_female\.m4a$/);
    }
  });
});
