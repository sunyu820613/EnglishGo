import { useEffect, useState } from 'react';
import { audioService } from '../../../audio/useAudioService';
import { usePhonemeAnimationSync } from '../../../audio/usePhonemeAnimationSync';
import { exampleWordAudioPath, phonemeAudioPath } from '../../../data/paths';
import type { PhonemeDefinition } from '../../../data/phonemes.types';
import { SoundButton } from '../../../components/SoundButton';
import { FrontMouthRig } from './FrontMouthRig';
import { playSequentialPair } from './playSequentialPair';
import styles from './MinimalPairComparison.module.css';

interface MinimalPairComparisonProps {
  primary: PhonemeDefinition;
  partner: PhonemeDefinition;
}

function useIsVoicePlaying(src: string | undefined): boolean {
  const [playing, setPlaying] = useState(() => !!src && audioService.getPlayingVoiceSrc() === src);

  useEffect(() => {
    if (!src) {
      setPlaying(false);
      return;
    }
    return audioService.addVoiceListener((playingSrc) => setPlaying(playingSrc === src));
  }, [src]);

  return playing;
}

function PairColumn({ phoneme }: { phoneme: PhonemeDefinition }) {
  const audioSrc = phoneme.audio[0] ? phonemeAudioPath(phoneme.audio[0].src) : undefined;
  const isPlaying = useIsVoicePlaying(audioSrc);
  // Only feed the real <audio> element in while THIS phoneme's sound is the
  // one actually on the voice channel — otherwise the mouth stays idle.
  const pose = usePhonemeAnimationSync(
    isPlaying ? audioService.getVoiceElement() : null,
    phoneme.animationRig,
  );
  const exampleWord = phoneme.exampleWords[0];

  return (
    <div className={styles.column}>
      <span className={styles.ipa}>/{phoneme.ipa}/</span>
      <FrontMouthRig
        pose={pose.front}
        transitionMs={pose.transitionMs}
        label={`Mouth shape for the sound ${phoneme.ipa}`}
        className={styles.canvas}
      />
      <SoundButton src={audioSrc} label={`Play the sound ${phoneme.ipa}`} />
      {exampleWord ? (
        <div className={styles.wordRow}>
          <SoundButton
            src={exampleWordAudioPath(exampleWord.audioSlug)}
            label={`Play the word ${exampleWord.word}`}
          />
          <span className={styles.word}>{exampleWord.word}</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Left/right minimal-pair comparison card (docs/phoneme-animation-spec.md
 * §6). Only the front mouth-shape animation is shown per column — the side
 * profile stays on each phoneme's own detail page (§6.1 rationale). The
 * partner phoneme doesn't need its own `animationRig`: PairColumn falls
 * back to a static idle mouth shape when it's missing.
 */
export function MinimalPairComparison({ primary, partner }: MinimalPairComparisonProps) {
  const primarySrc = primary.audio[0] ? phonemeAudioPath(primary.audio[0].src) : undefined;
  const partnerSrc = partner.audio[0] ? phonemeAudioPath(partner.audio[0].src) : undefined;

  return (
    <section className={styles.wrapper} aria-label={`Compare the sounds ${primary.ipa} and ${partner.ipa}`}>
      <div className={styles.pair}>
        <PairColumn phoneme={primary} />
        <span className={styles.vs} aria-hidden="true">
          VS
        </span>
        <PairColumn phoneme={partner} />
      </div>
      <button
        type="button"
        className={styles.playBoth}
        disabled={!primarySrc || !partnerSrc}
        onClick={() => {
          if (primarySrc && partnerSrc) void playSequentialPair(primarySrc, partnerSrc);
        }}
      >
        Play both sounds
      </button>
    </section>
  );
}
