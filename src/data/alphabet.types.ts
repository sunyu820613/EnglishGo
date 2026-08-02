export interface AlphabetWordExample {
  id: string;
  text: string;
  /** Relative to /audio/words/ */
  audio: string;
  /** Relative to /images/words/ */
  image: string;
  /** Relative to /audio/phrases/ */
  phrase: string;
}

export interface SoundVariantWord {
  id: string;
  text: string;
  /** Relative to /audio/words/ */
  audio: string;
  /** Relative to /images/words/ */
  image: string;
}

/** One additional pronunciation this letter can make (beyond the single
 * primary phonicsIpa/phonicsAudio pair) — e.g. A's /eɪ/ long-vowel reading
 * as in "acorn". Optional per-letter enrichment, not part of the fixed
 * curriculum word list. */
export interface LetterSoundVariant {
  /** Empty when `silent` is true (no phoneme to show, e.g. a word-final
   * silent E) — otherwise rendered wrapped in slashes, e.g. '/eɪ/'. */
  ipa: string;
  /** True for a spelling pattern with no sound of its own (e.g. silent E
   * in "cake"). Renders "Silent" instead of "/ipa/". */
  silent?: boolean;
  /** Short human-readable description, e.g. "Long vowel (open syllable)". */
  label: string;
  words: [SoundVariantWord, SoundVariantWord];
}

export interface AlphabetLetter {
  letter: string; // 'A'..'Z'
  /** Relative to /audio/letters/ — default/neutral letter name pronunciation. */
  letterAudio: string;
  /** Relative to /audio/letters/male/ */
  letterAudioMale?: string;
  /** Relative to /audio/letters/female/ */
  letterAudioFemale?: string;
  /** Relative to /audio/letters/ — phonics (letter sound) pronunciation. */
  phonicsAudio: string;
  /** IPA symbol for the phonics sound, e.g. 'æ'. */
  phonicsIpa: string;
  /**
   * IPA transcription of the letter *name* (e.g. A -> /eɪ/).
   * TODO(content): not present in the source alphabet.json yet — needs
   * phonetics review before being filled in. Left undefined for now so the
   * UI can degrade gracefully instead of guessing.
   */
  letterNameIpa?: string;
  phonicsNote: string | null;
  words: [AlphabetWordExample, AlphabetWordExample];
  /** Extra pronunciations beyond the primary phonicsIpa, each with two
   * example words — currently only populated for A. */
  soundVariants?: LetterSoundVariant[];
}
