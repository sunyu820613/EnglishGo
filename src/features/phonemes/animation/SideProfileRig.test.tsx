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
});
