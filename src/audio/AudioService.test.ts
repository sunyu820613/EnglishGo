import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AudioService } from './AudioService';

/** Minimal HTMLAudioElement stand-in so tests don't depend on jsdom's
 * (unimplemented) media playback. */
function createFakeAudioEl(): HTMLAudioElement {
  const el = {
    src: '',
    volume: 1,
    currentTime: 0,
    loop: false,
    onended: null as (() => void) | null,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
  };
  return el as unknown as HTMLAudioElement;
}

describe('AudioService', () => {
  let voiceEl: HTMLAudioElement;
  let sfxEl: HTMLAudioElement;
  let bgmEl: HTMLAudioElement;
  let service: AudioService;

  beforeEach(() => {
    voiceEl = createFakeAudioEl();
    sfxEl = createFakeAudioEl();
    bgmEl = createFakeAudioEl();
    service = new AudioService(voiceEl, sfxEl, bgmEl);
  });

  it('plays a voice file', async () => {
    await service.playVoice('/audio/letters/a_name.m4a');
    expect(voiceEl.src).toBe('/audio/letters/a_name.m4a');
    expect(voiceEl.play).toHaveBeenCalledTimes(1);
  });

  it('interrupts a currently playing voice when a new one starts', async () => {
    const first = service.playVoice('/audio/letters/a_name.m4a');
    const second = service.playVoice('/audio/letters/b_name.m4a');
    await Promise.all([first, second]);

    expect(voiceEl.pause).toHaveBeenCalled();
    expect(voiceEl.src).toBe('/audio/letters/b_name.m4a');
  });

  it('ducks bgm volume to 20% while a voice plays, and restores it on end', async () => {
    await service.setBgm('/audio/bgm/theme.m4a');
    expect(bgmEl.volume).toBe(1);

    await service.playVoice('/audio/letters/a_name.m4a');
    expect(bgmEl.volume).toBeCloseTo(0.2);

    // Simulate the voice finishing.
    voiceEl.onended?.(new Event('ended'));
    expect(bgmEl.volume).toBe(1);
  });

  it('does not duck bgm when bgm is disabled', async () => {
    await service.setBgm('/audio/bgm/theme.m4a');
    service.setBgmEnabled(false);
    expect(bgmEl.volume).toBe(0);

    await service.playVoice('/audio/letters/a_name.m4a');
    expect(bgmEl.volume).toBe(0);
  });

  it('degrades silently when playback fails (missing file)', async () => {
    voiceEl.play = vi.fn().mockRejectedValue(new Error('404'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(service.playVoice('/audio/missing.m4a')).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  // Regression test (found during M1 QA): when a stale playVoice() call's
  // play() promise rejects (e.g. real browsers reject with AbortError when
  // a newer .src is assigned mid-flight) AFTER a newer playVoice() call has
  // already started, its catch block must NOT clobber the newer call's
  // state — it must not un-duck BGM or mark "nothing playing" while the
  // newer voice is still audibly playing. Reproduces with rapid
  // double-taps on two different SoundButtons. Fixed via a per-call
  // request token checked before any state mutation in playVoice()'s
  // then/catch.
  it('does not clear state for a newer voice when an older play() rejects late', async () => {
    let rejectFirst!: (e: Error) => void;
    const firstPlayPromise = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    (voiceEl.play as ReturnType<typeof vi.fn>)
      .mockImplementationOnce(() => firstPlayPromise)
      .mockImplementationOnce(() => Promise.resolve(undefined));

    const first = service.playVoice('/audio/letters/a_name.m4a');
    const second = service.playVoice('/audio/letters/b_name.m4a');
    await second;
    expect(service.getPlayingVoiceSrc()).toBe('/audio/letters/b_name.m4a');

    rejectFirst(new Error('AbortError'));
    await first.catch(() => {});

    // Newer voice (b) should still be reported as playing.
    expect(service.getPlayingVoiceSrc()).toBe('/audio/letters/b_name.m4a');
  });

  it('stopAll pauses every channel', async () => {
    await service.setBgm('/audio/bgm/theme.m4a');
    await service.playVoice('/audio/letters/a_name.m4a');
    await service.playSfx('/audio/sfx/pop.m4a');

    service.stopAll();

    expect(voiceEl.pause).toHaveBeenCalled();
    expect(sfxEl.pause).toHaveBeenCalled();
    expect(bgmEl.pause).toHaveBeenCalled();
  });
});
