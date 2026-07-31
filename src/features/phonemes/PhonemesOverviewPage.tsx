import { Link } from 'react-router-dom';
import { phonemes } from '../../data/phonemes';
import type { PhonemeCategory } from '../../data/phonemes.types';
import page from '../../styles/page.module.css';
import styles from './PhonemesOverviewPage.module.css';

const categoryLabels: Record<PhonemeCategory, string> = {
  vowel: 'Vowels',
  diphthong: 'Diphthongs',
  rColoredVowel: 'R-colored vowels',
  voicelessConsonant: 'Voiceless consonants',
  voicedConsonant: 'Voiced consonants',
  otherConsonant: 'Other consonants',
};

export function PhonemesOverviewPage() {
  const byCategory = new Map<PhonemeCategory, typeof phonemes>();
  for (const p of phonemes) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  return (
    <div className={page.page}>
      <div className={page.container}>
        <h1 className={styles.title}>Phonics sounds</h1>
        <p className={styles.subtitle}>
          Tap a symbol to hear the sound. Mouth-shape animations are coming soon.
        </p>

        {Array.from(byCategory.entries()).map(([category, list]) => (
          <section key={category} className={styles.section}>
            <h2 className={styles.categoryTitle}>{categoryLabels[category]}</h2>
            <div className={styles.chipGrid}>
              {list.map((p) => (
                <Link key={p.slug} to={`/phonemes/${p.slug}`} className={styles.chip}>
                  /{p.ipa}/
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
