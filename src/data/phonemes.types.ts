export type PhonemeCategory =
  | 'vowel' // 10
  | 'diphthong' // 5
  | 'rColoredVowel' // 6
  | 'voicelessConsonant' // 8
  | 'voicedConsonant' // 8
  | 'otherConsonant'; // 10 — total 47

export interface WordExample {
  word: string;
  highlightStart: number; // highlight start character index
  highlightLength: number; // highlight length
  /** Relative to /audio/example_words/{audioSlug}.m4a */
  audioSlug: string;
}

export type VoiceGender = 'male' | 'female' | 'neutral';
export type PlaybackSpeed = 'normal' | 'slow';

export interface PhonemeAudioVariant {
  voice: VoiceGender;
  speed: PlaybackSpeed;
  /** Relative to /audio/phonemes/ */
  src: string;
}

/**
 * Positions params for the front (face-on) mouth view. All [0,1] unless noted.
 * M2 will implement the renderer; M1 only carries the type so the contract
 * is locked in without being built yet.
 */
export interface FrontMouthPose {
  jawOpen: number;
  lipRound: number;
  lipSpread: number;
  lipCompression: number;
  cornerPull: number;
  teethVisible: number;
  tonguePeek: number;
}

/**
 * Side (cross-section) mouth/throat view params. The `tongue*` fields drive
 * a parametric fallback tongue shape used for phonemes that don't (yet) have
 * a real reference-SVG outline in src/data/phonemeTonguePaths.ts (M3+); kept
 * even though the 5 M2 sample phonemes now render their tongue via
 * `tongueMorphT` instead (see SideProfileRig).
 */
export interface SideProfilePose {
  jawOpen: number;
  tongueTipHeight: number;
  tongueTipAdvance: number;
  tongueBodyHeight: number;
  tongueBodyAdvance: number;
  tongueRootHeight: number;
  velumOpen: number;
  lipRound: number;
  airflow: 'none' | 'continuous' | 'burst';
  voicing: boolean;
  /**
   * [0,1] progress from the neutral (rest) tongue outline to this phoneme's
   * real reference-SVG tongue outline (src/data/phonemeTonguePaths.ts),
   * interpolated point-by-point by lerpTonguePath. Optional/undefined for
   * phonemes without a real outline yet, in which case SideProfileRig falls
   * back to the parametric tongue* fields above.
   */
  tongueMorphT?: number;
}

export interface PhonemeAnimationKeyframe {
  t: number; // normalized time [0,1]
  front: Partial<FrontMouthPose>;
  side: Partial<SideProfilePose>;
}

export interface PhonemeAnimationRig {
  phonemeSlug: string;
  keyframes: PhonemeAnimationKeyframe[];
  loop?: boolean;
}

export interface PhonemeDefinition {
  ipa: string; // e.g. 'iː'
  slug: string; // e.g. 'i' (from phonemeAudioSlugs)
  category: PhonemeCategory;
  exampleWords: WordExample[];
  audio: PhonemeAudioVariant[];
  minimalPairs?: string[]; // M3 content, empty in M1
  animationRig?: PhonemeAnimationRig; // M2 content, undefined in M1
}
