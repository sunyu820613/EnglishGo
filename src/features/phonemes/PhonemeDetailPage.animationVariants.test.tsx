import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PhonemeAnimationState } from '../../audio/usePhonemeAnimationSync';
import { audioService } from '../../audio/useAudioService';

const IDLE_STATE: PhonemeAnimationState = {
  front: {
    jawOpen: 0,
    lipRound: 0,
    lipSpread: 0,
    lipCompression: 0,
    cornerPull: 0,
    teethVisible: 0,
    tonguePeek: 0,
  },
  side: {
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
  },
  transitionMs: 320,
};

const { usePhonemeAnimationSyncMock } = vi.hoisted(() => ({
  usePhonemeAnimationSyncMock: vi.fn(),
}));

vi.mock('../../audio/usePhonemeAnimationSync', () => ({
  usePhonemeAnimationSync: usePhonemeAnimationSyncMock,
}));

/**
 * A phoneme with 4 *distinct* audio srcs, unlike the real M2 data (which
 * currently points all 4 voice/speed variants at the same placeholder file
 * — see phonemes.ts TODO). That coincidence previously masked a bug where
 * PhonemeDetailPage only fed the rig a live <audio> element while the
 * *primary* (female/normal) variant's exact src was playing — clicking any
 * other variant button silently left the animation idle. This file uses
 * distinct srcs so the regression is actually exercised.
 */
vi.mock('../../data/phonemes', () => {
  const flatPose = {
    jawOpen: 0.5,
    lipRound: 0,
    lipSpread: 0.5,
    lipCompression: 0,
    cornerPull: 0,
    teethVisible: 0.5,
    tonguePeek: 0,
  };
  const flatSide = {
    jawOpen: 0.5,
    tongueTipHeight: 0.5,
    tongueTipAdvance: 0.5,
    tongueBodyHeight: 0.5,
    tongueBodyAdvance: 0.5,
    tongueRootHeight: 0.5,
    velumOpen: 0,
    lipRound: 0,
    airflow: 'none' as const,
    voicing: true,
  };
  const mockPhoneme = {
    ipa: 'iː',
    slug: 'i',
    category: 'vowel' as const,
    exampleWords: [{ word: 'see', highlightStart: 1, highlightLength: 2, audioSlug: 'see' }],
    audio: [
      { voice: 'female' as const, speed: 'normal' as const, src: 'mock-female-normal.wav' },
      { voice: 'male' as const, speed: 'normal' as const, src: 'mock-male-normal.wav' },
      { voice: 'female' as const, speed: 'slow' as const, src: 'mock-female-slow.wav' },
      { voice: 'male' as const, speed: 'slow' as const, src: 'mock-male-slow.wav' },
    ],
    animationRig: {
      phonemeSlug: 'i',
      keyframes: [
        { t: 0, front: flatPose, side: flatSide },
        { t: 1, front: flatPose, side: flatSide },
      ],
    },
  };
  return {
    findPhonemeBySlug: (slug: string) => (slug === 'i' ? mockPhoneme : undefined),
  };
});

const { PhonemeDetailPage } = await import('./PhonemeDetailPage');

function renderAt(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/phonemes/${slug}`]}>
      <Routes>
        <Route path="/phonemes/:slug" element={<PhonemeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PhonemeDetailPage — animation wiring across audio variants', () => {
  beforeEach(() => {
    usePhonemeAnimationSyncMock.mockReset().mockReturnValue(IDLE_STATE);
    audioService.stopVoice();
  });

  it('is idle (null audio element passed to the rig hook) before anything plays', () => {
    renderAt('i');
    expect(usePhonemeAnimationSyncMock.mock.calls.at(-1)?.[0]).toBeNull();
  });

  it('drives the animation for a non-primary variant (Male · Slow), not just female/normal', () => {
    renderAt('i');

    fireEvent.click(screen.getByRole('button', { name: /^Male · Slow$/ }));

    expect(audioService.getPlayingVoiceSrc()).toBe('/audio/phonemes/mock-male-slow.wav');
    // Regression guard: comparing only against the primary variant's exact
    // src would incorrectly leave this `null`.
    expect(usePhonemeAnimationSyncMock.mock.calls.at(-1)?.[0]).toBe(audioService.getVoiceElement());
  });

  it('drives the animation for every voice/speed variant, not just one', () => {
    renderAt('i');

    for (const label of ['Female · Normal', 'Male · Normal', 'Female · Slow', 'Male · Slow']) {
      // RegExp anchors give an exact match — @testing-library/dom's
      // ByRoleOptions has no `exact` flag (unlike getByText).
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}$`) }));
      expect(usePhonemeAnimationSyncMock.mock.calls.at(-1)?.[0]).toBe(audioService.getVoiceElement());
    }
  });

  it('goes back to idle once a different sound (an example word) takes over the voice channel', () => {
    renderAt('i');
    fireEvent.click(screen.getByRole('button', { name: /^Male · Slow$/ }));
    expect(usePhonemeAnimationSyncMock.mock.calls.at(-1)?.[0]).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Play the word see' }));
    expect(usePhonemeAnimationSyncMock.mock.calls.at(-1)?.[0]).toBeNull();
  });
});
