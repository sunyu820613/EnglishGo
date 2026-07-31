import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Fakes just enough of AudioService's public surface (playVoice +
 * addVoiceListener + getPlayingVoiceSrc) for playSequentialPair, without
 * touching a real HTMLAudioElement (jsdom doesn't implement media playback
 * — see AudioService.test.ts for the same pattern applied there).
 *
 * `playVoice` mirrors the real AudioService.playVoice() sequencing: it
 * always notifies listeners with `null` (the "stopVoice()" half) before
 * notifying them with the new src, synchronously, in that order — this is
 * exactly the sequencing playSequentialPair's preemption-detection logic
 * has to disambiguate from a genuine natural end.
 */
let currentSrc: string | null = null;
const listeners = new Set<(src: string | null) => void>();
const playVoice = vi.fn((src: string) => {
  currentSrc = null;
  for (const l of listeners) l(null);
  currentSrc = src;
  for (const l of listeners) l(src);
  return Promise.resolve();
});

vi.mock('../../../audio/useAudioService', () => ({
  audioService: {
    playVoice: (src: string) => playVoice(src),
    getPlayingVoiceSrc: () => currentSrc,
    addVoiceListener: (listener: (src: string | null) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  },
}));

/** Simulates the currently-playing sound reaching its natural end. */
function simulatePlaybackEnded() {
  currentSrc = null;
  for (const l of listeners) l(null);
}

const { playSequentialPair } = await import('./playSequentialPair');

describe('playSequentialPair', () => {
  beforeEach(() => {
    playVoice.mockClear();
    listeners.clear();
    currentSrc = null;
  });

  it('plays the first sound, waits for it to finish plus a gap, then plays the second — never overlapping', async () => {
    vi.useFakeTimers();

    const promise = playSequentialPair('/audio/phonemes/i.wav', '/audio/phonemes/ih.wav');

    await vi.advanceTimersByTimeAsync(0);
    expect(playVoice).toHaveBeenCalledWith('/audio/phonemes/i.wav');
    expect(playVoice).not.toHaveBeenCalledWith('/audio/phonemes/ih.wav');

    simulatePlaybackEnded();
    await vi.advanceTimersByTimeAsync(0); // flush the queueMicrotask that confirms a natural end

    // Still within the ~420ms post-playback gap — second sound must not have started yet.
    await vi.advanceTimersByTimeAsync(100);
    expect(playVoice).not.toHaveBeenCalledWith('/audio/phonemes/ih.wav');

    await vi.advanceTimersByTimeAsync(400);
    expect(playVoice).toHaveBeenCalledWith('/audio/phonemes/ih.wav');

    await promise;
    vi.useRealTimers();
  });

  it('does not play the second sound if the first is preempted by an unrelated sound before it naturally ends', async () => {
    vi.useFakeTimers();

    const promise = playSequentialPair('/audio/phonemes/i.wav', '/audio/phonemes/ih.wav');
    await vi.advanceTimersByTimeAsync(0);
    expect(playVoice).toHaveBeenCalledWith('/audio/phonemes/i.wav');

    // Something else (e.g. the user clicking a different SoundButton)
    // starts playing before srcA naturally finishes.
    playVoice('/audio/example_words/see.m4a');
    await vi.advanceTimersByTimeAsync(0);

    // Even after the would-be gap elapses, srcB must never play — playing
    // it now would interrupt the sound the user actually asked to hear.
    await vi.advanceTimersByTimeAsync(1000);
    expect(playVoice).not.toHaveBeenCalledWith('/audio/phonemes/ih.wav');

    await promise;
    vi.useRealTimers();
  });
});
