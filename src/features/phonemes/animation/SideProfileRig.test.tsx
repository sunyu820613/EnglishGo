import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveFullPoseAtFrame, phonemeAnimationRigs } from '../../../data/phonemeAnimationRigs';
import styles from './SideProfileRig.module.css';
import { SideProfileRig } from './SideProfileRig';

describe('SideProfileRig', () => {
  it('renders an accessible image with the given label', () => {
    const { side } = resolveFullPoseAtFrame(phonemeAnimationRigs.ng, 1);
    render(<SideProfileRig pose={side} label="Side view for the sound ŋ" />);
    expect(screen.getByRole('img', { name: 'Side view for the sound ŋ' })).toBeInTheDocument();
  });

  it('marks the vocal-cords indicator active for a voiced sound and inactive for a voiceless one', () => {
    const voiced = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side; // /iː/ voicing=true
    const voiceless = resolveFullPoseAtFrame(phonemeAnimationRigs.th, 1).side; // /θ/ voicing=false

    const { container: voicedContainer } = render(<SideProfileRig pose={voiced} />);
    expect(voicedContainer.querySelector(`.${styles.glottisActive}`)).toBeTruthy();

    const { container: voicelessContainer } = render(<SideProfileRig pose={voiceless} />);
    expect(voicelessContainer.querySelector(`.${styles.glottisActive}`)).toBeFalsy();
  });

  it('/ŋ/ (velumOpen=1) shows the nose-outlet airflow layer and hides the mouth-outlet layer', () => {
    const ng = resolveFullPoseAtFrame(phonemeAnimationRigs.ng, 1).side;
    const { container } = render(<SideProfileRig pose={ng} />);
    const mouthLayer = container.querySelector(`.${styles.airflowMouth}`);
    const noseLayer = container.querySelector(`.${styles.airflowNose}`);
    expect(mouthLayer).toHaveStyle({ opacity: '0' });
    expect(noseLayer).toHaveStyle({ opacity: '1' });
  });

  it('/θ/ (velumOpen=0, airflow=continuous) shows the mouth-outlet layer and hides the nose-outlet layer', () => {
    const th = resolveFullPoseAtFrame(phonemeAnimationRigs.th, 1).side;
    const { container } = render(<SideProfileRig pose={th} />);
    const mouthLayer = container.querySelector(`.${styles.airflowMouth}`);
    const noseLayer = container.querySelector(`.${styles.airflowNose}`);
    expect(mouthLayer).toHaveStyle({ opacity: '1' });
    expect(noseLayer).toHaveStyle({ opacity: '0' });
  });

  it('/iː/ (airflow=none) hides both airflow layers', () => {
    const i = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side;
    const { container } = render(<SideProfileRig pose={i} />);
    const mouthLayer = container.querySelector(`.${styles.airflowMouth}`);
    const noseLayer = container.querySelector(`.${styles.airflowNose}`);
    expect(mouthLayer).toHaveStyle({ opacity: '0' });
    expect(noseLayer).toHaveStyle({ opacity: '0' });
  });

  describe('tongue shape', () => {
    it('with no tonguePathSlug, falls back to the parametric tongue path (unchanged pre-M2-revision behavior)', () => {
      const i = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side;
      const { container } = render(<SideProfileRig pose={i} />);
      const tongue = container.querySelector(`.${styles.tongue}`);
      expect(tongue?.getAttribute('d')).toMatch(/^M128 164 L/);
    });

    it('with a tonguePathSlug, morphs the real reference-SVG outline instead of the parametric shape', () => {
      const i = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side;
      const { container } = render(<SideProfileRig pose={i} tonguePathSlug="i" />);
      const tongue = container.querySelector(`.${styles.tongue}`);
      expect(tongue?.getAttribute('d')).not.toMatch(/^M128 164 L/);
      expect(tongue?.getAttribute('d')).toMatch(/^M-?\d/);
    });

    it('produces a different tongue outline for two phonemes with different tongueMorphT targets', () => {
      const i = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side;
      const ae = resolveFullPoseAtFrame(phonemeAnimationRigs.ae, 1).side;
      const { container: iContainer } = render(<SideProfileRig pose={i} tonguePathSlug="i" />);
      const { container: aeContainer } = render(<SideProfileRig pose={ae} tonguePathSlug="ae" />);
      const iD = iContainer.querySelector(`.${styles.tongue}`)?.getAttribute('d');
      const aeD = aeContainer.querySelector(`.${styles.tongue}`)?.getAttribute('d');
      expect(iD).not.toEqual(aeD);
    });

    it('tongueMorphT interpolates: a mid-progress pose sits between the idle and sustain outlines', () => {
      const onset = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 0).side; // tongueMorphT ~0.7
      const sustain = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).side; // tongueMorphT 1
      const idle = { ...sustain, tongueMorphT: 0 };
      const { container: idleContainer } = render(<SideProfileRig pose={idle} tonguePathSlug="i" />);
      const { container: onsetContainer } = render(<SideProfileRig pose={onset} tonguePathSlug="i" />);
      const { container: sustainContainer } = render(<SideProfileRig pose={sustain} tonguePathSlug="i" />);
      const idleD = idleContainer.querySelector(`.${styles.tongue}`)?.getAttribute('d');
      const onsetD = onsetContainer.querySelector(`.${styles.tongue}`)?.getAttribute('d');
      const sustainD = sustainContainer.querySelector(`.${styles.tongue}`)?.getAttribute('d');
      expect(onsetD).not.toEqual(idleD);
      expect(onsetD).not.toEqual(sustainD);
    });
  });
});
