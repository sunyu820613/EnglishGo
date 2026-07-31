import type {
  FrontMouthPose,
  PhonemeAnimationKeyframe,
  PhonemeAnimationRig,
  SideProfilePose,
} from './phonemes.types';

/**
 * Neutral "mouth at rest" pose. Used both as the animation's baseline (the
 * onset/release keyframes are computed as a fraction of the sustain target,
 * see buildRig()) and as the pose components render when no audio for this
 * phoneme is currently playing.
 */
export const IDLE_FRONT_POSE: FrontMouthPose = {
  jawOpen: 0,
  lipRound: 0,
  lipSpread: 0,
  lipCompression: 0,
  cornerPull: 0,
  teethVisible: 0,
  tonguePeek: 0,
};

export const IDLE_SIDE_POSE: SideProfilePose = {
  jawOpen: 0,
  tongueTipHeight: 0,
  tongueTipAdvance: 0,
  tongueBodyHeight: 0,
  tongueBodyAdvance: 0,
  tongueRootHeight: 0,
  velumOpen: 0,
  lipRound: 0,
  airflow: 'none',
  voicing: false,
};

/**
 * Merges every keyframe up to and including `frameIndex`, in order, so that
 * non-lerped fields declared once (e.g. `voicing`/`airflow` at t=0.15, see
 * docs/phoneme-animation-spec.md §4) carry forward to later frames that omit
 * them, while numeric fields simply take the most recently declared value.
 */
export function resolveFullPoseAtFrame(
  rig: PhonemeAnimationRig,
  frameIndex: number,
): { front: FrontMouthPose; side: SideProfilePose } {
  let front = IDLE_FRONT_POSE;
  let side = IDLE_SIDE_POSE;
  const upTo = Math.min(frameIndex, rig.keyframes.length - 1);
  for (let i = 0; i <= upTo; i++) {
    const frame = rig.keyframes[i];
    if (!frame) continue;
    front = { ...front, ...frame.front };
    side = { ...side, ...frame.side };
  }
  return { front, side };
}

/** Sustain (t=0.15..0.85) target pose for one of the five M2 sample phonemes. */
interface SustainPose {
  front: FrontMouthPose;
  side: SideProfilePose;
}

function scaleFront(pose: FrontMouthPose, factor: number): FrontMouthPose {
  return {
    jawOpen: pose.jawOpen * factor,
    lipRound: pose.lipRound * factor,
    lipSpread: pose.lipSpread * factor,
    lipCompression: pose.lipCompression * factor,
    cornerPull: pose.cornerPull * factor,
    teethVisible: pose.teethVisible * factor,
    tonguePeek: pose.tonguePeek * factor,
  };
}

/** Scales only the numeric (lerp-able) fields; `airflow`/`voicing` are set explicitly per keyframe. */
function scaleSideNumeric(
  pose: SideProfilePose,
  factor: number,
): Omit<SideProfilePose, 'airflow' | 'voicing'> {
  return {
    jawOpen: pose.jawOpen * factor,
    tongueTipHeight: pose.tongueTipHeight * factor,
    tongueTipAdvance: pose.tongueTipAdvance * factor,
    tongueBodyHeight: pose.tongueBodyHeight * factor,
    tongueBodyAdvance: pose.tongueBodyAdvance * factor,
    tongueRootHeight: pose.tongueRootHeight * factor,
    velumOpen: pose.velumOpen * factor,
    lipRound: pose.lipRound * factor,
    tongueMorphT: (pose.tongueMorphT ?? 0) * factor,
  };
}

/**
 * Builds the 4 fixed keyframes (t=0/0.15/0.85/1) defined in
 * docs/phoneme-animation-spec.md §4 from a single sustain-phase target pose:
 * onset reaches 70% of target, sustain-in/out hold 100%, release eases back
 * to 90%. `voicing`/`airflow` are only declared once, at sustain-in, and
 * carry forward (see resolveFullPoseAtFrame).
 */
function buildRig(slug: string, sustain: SustainPose): PhonemeAnimationRig {
  const keyframes: PhonemeAnimationKeyframe[] = [
    { t: 0, front: scaleFront(sustain.front, 0.7), side: scaleSideNumeric(sustain.side, 0.7) },
    {
      t: 0.15,
      front: scaleFront(sustain.front, 1),
      side: {
        ...scaleSideNumeric(sustain.side, 1),
        airflow: sustain.side.airflow,
        voicing: sustain.side.voicing,
      },
    },
    { t: 0.85, front: scaleFront(sustain.front, 1), side: scaleSideNumeric(sustain.side, 1) },
    { t: 1, front: scaleFront(sustain.front, 0.9), side: scaleSideNumeric(sustain.side, 0.9) },
  ];
  return { phonemeSlug: slug, keyframes };
}

/** /iː/ — spread high front vowel, voiced. docs/phoneme-animation-spec.md §3. */
const i: SustainPose = {
  front: {
    jawOpen: 0.15,
    lipRound: 0,
    lipSpread: 0.8,
    lipCompression: 0,
    cornerPull: 0.5,
    teethVisible: 0.5,
    tonguePeek: 0,
  },
  side: {
    jawOpen: 0.15,
    tongueTipHeight: 0.55,
    tongueTipAdvance: 0.8,
    tongueBodyHeight: 0.9,
    tongueBodyAdvance: 0.85,
    tongueRootHeight: 0.3,
    velumOpen: 0,
    lipRound: 0,
    tongueMorphT: 1,
    airflow: 'none',
    voicing: true,
  },
};

/** /æ/ — low front vowel, natural lip shape, voiced. */
const ae: SustainPose = {
  front: {
    jawOpen: 0.75,
    lipRound: 0,
    lipSpread: 0.3,
    lipCompression: 0,
    cornerPull: 0.15,
    teethVisible: 0.35,
    tonguePeek: 0,
  },
  side: {
    jawOpen: 0.75,
    tongueTipHeight: 0.25,
    tongueTipAdvance: 0.7,
    tongueBodyHeight: 0.2,
    tongueBodyAdvance: 0.75,
    tongueRootHeight: 0.2,
    velumOpen: 0,
    lipRound: 0,
    tongueMorphT: 1,
    airflow: 'none',
    voicing: true,
  },
};

/** /θ/ — interdental fricative, voiceless. */
const th: SustainPose = {
  front: {
    jawOpen: 0.3,
    lipRound: 0,
    lipSpread: 0.15,
    lipCompression: 0.1,
    cornerPull: 0.05,
    teethVisible: 0.65,
    tonguePeek: 0.85,
  },
  side: {
    jawOpen: 0.3,
    tongueTipHeight: 0.55,
    tongueTipAdvance: 1.0,
    tongueBodyHeight: 0.4,
    tongueBodyAdvance: 0.6,
    tongueRootHeight: 0.3,
    velumOpen: 0,
    lipRound: 0,
    tongueMorphT: 1,
    airflow: 'continuous',
    voicing: false,
  },
};

/** /r/ (American) — rhotic approximant, voiced. */
const r: SustainPose = {
  front: {
    jawOpen: 0.35,
    lipRound: 0.5,
    lipSpread: 0.1,
    lipCompression: 0,
    cornerPull: 0.1,
    teethVisible: 0.15,
    tonguePeek: 0,
  },
  side: {
    jawOpen: 0.35,
    tongueTipHeight: 0.75,
    tongueTipAdvance: 0.55,
    tongueBodyHeight: 0.55,
    tongueBodyAdvance: 0.4,
    tongueRootHeight: 0.35,
    velumOpen: 0,
    lipRound: 0.5,
    tongueMorphT: 1,
    airflow: 'none',
    voicing: true,
  },
};

/** /ŋ/ — velar nasal, voiced. Airflow exits through the nose (velumOpen=1). */
const ng: SustainPose = {
  front: {
    jawOpen: 0.2,
    lipRound: 0,
    lipSpread: 0,
    lipCompression: 0,
    cornerPull: 0,
    teethVisible: 0.1,
    tonguePeek: 0,
  },
  side: {
    jawOpen: 0.2,
    tongueTipHeight: 0.15,
    tongueTipAdvance: 0.3,
    tongueBodyHeight: 0.5,
    tongueBodyAdvance: 0.3,
    tongueRootHeight: 0.9,
    velumOpen: 1,
    lipRound: 0,
    tongueMorphT: 1,
    airflow: 'continuous',
    voicing: true,
  },
};

export type M2SampleSlug = 'i' | 'ae' | 'th' | 'r' | 'ng';

/**
 * M2 sample rigs, keyed by the phoneme's ASCII slug (see phonemeAudioSlugs).
 * Only these 5 phonemes have `animationRig` data — the remaining 42 keep
 * `animationRig: undefined` in src/data/phonemes.ts and the detail page
 * falls back to the "coming soon" placeholder.
 */
export const phonemeAnimationRigs: Record<M2SampleSlug, PhonemeAnimationRig> = {
  i: buildRig('i', i),
  ae: buildRig('ae', ae),
  th: buildRig('th', th),
  r: buildRig('r', r),
  ng: buildRig('ng', ng),
};

/** Safe lookup for phonemes.ts, which only has a generic `string` slug at hand. */
export function getSampleAnimationRig(slug: string): PhonemeAnimationRig | undefined {
  return (phonemeAnimationRigs as Record<string, PhonemeAnimationRig | undefined>)[slug];
}
