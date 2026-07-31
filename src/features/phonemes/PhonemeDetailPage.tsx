import { Link, Navigate, useParams } from 'react-router-dom';
import { SoundButton } from '../../components/SoundButton';
import { findPhonemeBySlug } from '../../data/phonemes';
import { exampleWordAudioPath, phonemeAudioPath } from '../../data/paths';
import page from '../../styles/page.module.css';
import styles from './PhonemeDetailPage.module.css';

export function PhonemeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const phoneme = slug ? findPhonemeBySlug(slug) : undefined;

  if (!phoneme) {
    return <Navigate to="/phonemes" replace />;
  }

  const primaryAudio = phoneme.audio[0];

  return (
    <div className={page.page}>
      <div className={page.container}>
        <Link to="/phonemes" className={styles.back}>
          &larr; All sounds
        </Link>

        <div className={styles.banner}>
          Mouth-shape animations for this sound are coming soon — for now you can listen and
          practice with example words.
        </div>

        <div className={styles.layout}>
          <div className={styles.left}>
            <span className={styles.ipa}>/{phoneme.ipa}/</span>

            <div className={styles.audioControls}>
              <SoundButton
                src={primaryAudio ? phonemeAudioPath(primaryAudio.src) : undefined}
                label={`Play the sound ${phoneme.ipa}`}
                size="primary"
              />
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
            <div className={styles.animationPlaceholder}>Front view — animation coming soon</div>
            <div className={styles.animationPlaceholder}>Side view — animation coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
