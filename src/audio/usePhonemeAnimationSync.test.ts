import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { phonemeAnimationRigs } from '../data/phonemeAnimationRigs';
import { usePhonemeAnimationSync } from './usePhonemeAnimationSync';

/** Minimal HTMLAudioElement stand-in, same pattern as AudioService.test.ts. */
function createFakeAudioEl(duration: number, currentTime: number): HTMLAudioElement {
  return { duration, currentTime } as unknown as HTMLAudioElement;
}

function setMatches(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe('usePhonemeAnimationSync', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let callbacks: FrameRequestCallback[];

  beforeEach(() => {
    setMatches(false);
    callbacks = [];
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    rafSpy.mockRestore();
  });

  function flush() {
    act(() => {
      const pending = callbacks;
      callbacks = [];
      for (const cb of pending) cb(0);
    });
  }

  it('returns the idle pose when there is no audio element', () => {
    const rig = phonemeAnimationRigs.i;
    const { result } = renderHook(() => usePhonemeAnimationSync(null, rig));
    expect(result.current.front.lipSpread).toBe(0);
    expect(result.current.side.voicing).toBe(false);
    expect(result.current.transitionMs).toBe(320); // --duration-standard idle-return
  });

  it('returns the idle pose when there is no rig', () => {
    const el = createFakeAudioEl(1, 0);
    const { result } = renderHook(() => usePhonemeAnimationSync(el, undefined));
    expect(result.current.front).toEqual({
      jawOpen: 0,
      lipRound: 0,
      lipSpread: 0,
      lipCompression: 0,
      cornerPull: 0,
      teethVisible: 0,
      tonguePeek: 0,
    });
  });

  it('resolves the sustain-in pose once playback crosses t=0.15', () => {
    const rig = phonemeAnimationRigs.i;
    const el = createFakeAudioEl(1, 0);
    const { result, rerender } = renderHook(({ audioEl }) => usePhonemeAnimationSync(audioEl, rig), {
      initialProps: { audioEl: el },
    });

    flush(); // first tick, t=0 -> onset keyframe
    expect(result.current.front.lipSpread).toBeCloseTo(0.8 * 0.7);

    el.currentTime = 0.5; // 50% through -> past t=0.15, still before t=0.85
    rerender({ audioEl: el });
    flush();
    expect(result.current.front.lipSpread).toBeCloseTo(0.8);
    expect(result.current.side.voicing).toBe(true);
    expect(result.current.transitionMs).toBeGreaterThan(0);
  });

  it('under reduced motion, jumps between keyframes instantly (transitionMs=0)', () => {
    setMatches(true);
    const rig = phonemeAnimationRigs.i;
    const el = createFakeAudioEl(1, 0.5);
    const { result } = renderHook(() => usePhonemeAnimationSync(el, rig));

    flush();
    expect(result.current.transitionMs).toBe(0);
    expect(result.current.front.lipSpread).toBeCloseTo(0.8);
  });
});
