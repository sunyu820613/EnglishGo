import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { audioService } from '../../audio/useAudioService';
import { usePhonemeAnimationSync } from '../../audio/usePhonemeAnimationSync';
import { SoundButton } from '../../components/SoundButton';
import { exampleWordAudioPath, phonemeAudioPath } from '../../data/paths';
import { findPhonemeBySlug } from '../../data/phonemes';
import type { PhonemeAudioVariant, VoiceGender, PlaybackSpeed } from '../../data/phonemes.types';
import { FrontMouthRig } from './animation/FrontMouthRig';
import { MinimalPairComparison } from './animation/MinimalPairComparison';
import page from '../../styles/page.module.css';
import { SideProfileRig } from './animation/SideProfileRig';
import styles from './PhonemeDetailPage.module.css';

const VOICE_SPEED_COMBOS: Array<{ voice: VoiceGender; speed: PlaybackSpeed; label: string }> = [
  { voice: 'female', speed: 'normal', label: 'Female · Normal' },
  { voice: 'male', speed: 'normal', label: 'Male · Normal' },
  { voice: 'female', speed: 'slow', label: 'Female · Slow' },
  { voice: 'male', speed: 'slow', label: 'Male · Slow' },
];

function findVariant(
  audio: PhonemeAudioVariant[],
  voice: VoiceGender,
  speed: PlaybackSpeed,
): PhonemeAudioVariant | undefined {
  return audio.find((v) => v.voice === voice && v.speed === speed);
}

export function PhonemeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const phoneme = slug ? findPhonemeBySlug(slug) : undefined;

  const [playingVoiceSrc, setPlayingVoiceSrc] = useState(() => audioService.getPlayingVoiceSrc());
  useEffect(() => audioService.addVoiceListener(setPlayingVoiceSrc), []);

  // All hooks must run unconditionally on every render (React rules of
  // hooks), so these are computed with optional chaining *before* the
  // `!phoneme` early return below, even though they only matter once a
  // phoneme is resolved.
  const rig = phoneme?.animationRig;
  const primaryVariant = phoneme
    ? (findVariant(phoneme.audio, 'female', 'normal') ?? phoneme.audio[0])
    : undefined;
  const primaryAudio = primaryVariant ? phonemeAudioPath(primaryVariant.src) : undefined;
  // The rig must animate for *any* of this phoneme's audio variants
  // (all 4 voice/speed buttons, not just the primary big SoundButton) —
  // comparing only against `primaryAudio` would silently stop animating
  // for every other button. Currently all 4 variants point at the same
  // placeholder file (see phonemes.ts TODO), which coincidentally makes a
  // primary-only check look like it works; this check must stay
  // "any variant" once real distinct male/female/slow recordings land, or
  // clicking those buttons will animate nothing.
  const isThisPhonemePlaying =
    !!phoneme && phoneme.audio.some((v) => phonemeAudioPath(v.src) === playingVoiceSrc);

  const animationState = usePhonemeAnimationSync(
    rig && isThisPhonemePlaying ? audioService.getVoiceElement() : null,
    rig,
  );

  if (!phoneme) {
    return <Navigate to="/phonemes" replace />;
  }

  const partner =
    phoneme.minimalPairs?.[0] !== undefined ? findPhonemeBySlug(phoneme.minimalPairs[0]) : undefined;

  return (
    <div className={page.page}>
      <div className={page.container}>
        <Link to="/phonemes" className={styles.back}>
          &larr; All sounds
        </Link>

        {!rig ? (
          <div className={styles.banner}>
            Mouth-shape animations for this sound are coming soon — for now you can listen and
            practice with example words.
          </div>
        ) : null}

        <div className={styles.layout}>
          <div className={styles.left}>
            <span className={styles.ipa}>/{phoneme.ipa}/</span>

            <div className={styles.audioControls}>
              <SoundButton
                src={primaryAudio}
                label={`Play the sound ${phoneme.ipa}`}
                size="primary"
              />

              {rig ? (
                <div className={styles.variantGrid}>
                  {VOICE_SPEED_COMBOS.map(({ voice, speed, label }) => {
                    const variant = findVariant(phoneme.audio, voice, speed);
                    return (
                      <button
                        key={label}
                        type="button"
                        className={styles.variantButton}
                        disabled={!variant}
                        onClick={() => {
                          if (variant) void audioService.playVoice(phonemeAudioPath(variant.src));
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className={styles.variantRow}>
                    <button type="button" className={styles.variantChip} disabled>
                      Male voice
                    </button>
                    <button type="button" className={styles.variantChip} disabled>
                      Slow
                    </button>
                  </div>
                  <p className={styles.variantHint}>
                    More voices and slow playback are coming in a future update.
                  </p>
                </>
              )}
            </div>

            <section className={styles.words}>
              {phoneme.exampleWords.map((w) => (
                <div key={w.word} className={styles.wordRow}>
                  <SoundButton
                    src={exampleWordAudioPath(w.audioSlug)}
                    label={`Play the word ${w.word}`}
                  />
                  <span className={styles.word}>{w.word}</span>
                </div>
              ))}
            </section>
          </div>

          <div className={styles.right}>
            {rig ? (
              <>
                <FrontMouthRig
                  pose={animationState.front}
                  transitionMs={animationState.transitionMs}
                  label={`Front mouth-shape view for the sound ${phoneme.ipa}`}
                  className={styles.rigCanvas}
                />
                <SideProfileRig
                  pose={animationState.side}
                  transitionMs={animationState.transitionMs}
                  label={`Side mouth cross-section view for the sound ${phoneme.ipa}`}
                  className={styles.rigCanvas}
                  tonguePathSlug={rig.phonemeSlug}
                />
              </>
            ) : (
              <>
                <div className={styles.animationPlaceholder}>
                  Front view — animation coming soon
                </div>
                <div className={styles.animationPlaceholder}>
                  Side view — animation coming soon
                </div>
              </>
            )}
          </div>
        </div>

        {partner ? (
          <section className={styles.minimalPairSection}>
            <h2 className={styles.sectionTitle}>Compare similar sounds</h2>
            <MinimalPairComparison primary={phoneme} partner={partner} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
