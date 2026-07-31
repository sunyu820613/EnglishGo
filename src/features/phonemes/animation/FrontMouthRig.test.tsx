import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveFullPoseAtFrame, phonemeAnimationRigs } from '../../../data/phonemeAnimationRigs';
import { FrontMouthRig } from './FrontMouthRig';
import styles from './FrontMouthRig.module.css';

describe('FrontMouthRig', () => {
  it('renders an accessible image with the given label', () => {
    const { front } = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1);
    render(<FrontMouthRig pose={front} label="Mouth shape for the sound iː" />);
    expect(screen.getByRole('img', { name: 'Mouth shape for the sound iː' })).toBeInTheDocument();
  });

  it('is hidden from the accessibility tree when no label is given (decorative use)', () => {
    const { front } = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1);
    const { container } = render(<FrontMouthRig pose={front} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('reveals the tongue-peek shape for /θ/ (tonguePeek=0.85) and hides it for /iː/ (tonguePeek=0)', () => {
    const th = resolveFullPoseAtFrame(phonemeAnimationRigs.th, 1).front;
    const i = resolveFullPoseAtFrame(phonemeAnimationRigs.i, 1).front;

    const { container: thContainer } = render(<FrontMouthRig pose={th} />);
    const thTongue = thContainer.querySelector(`.${styles.tonguePeek}`);
    expect(thTongue).toHaveStyle({ opacity: '1' });

    const { container: iContainer } = render(<FrontMouthRig pose={i} />);
    const iTongue = iContainer.querySelector(`.${styles.tonguePeek}`);
    expect(iTongue).toHaveStyle({ opacity: '0' });
  });

  it('applies the requested transition duration to the animated layers', () => {
    const { front } = resolveFullPoseAtFrame(phonemeAnimationRigs.ae, 1);
    const { container } = render(<FrontMouthRig pose={front} transitionMs={250} />);
    const upperLip = container.querySelector(`.${styles.upperLip}`);
    expect(upperLip).toHaveStyle({ transitionDuration: '250ms' });
  });
});
