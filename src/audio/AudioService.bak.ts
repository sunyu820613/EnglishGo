/**
 * Manages all audio playback: voice, sfx, and background music.
 *
 * Rules (ported from lib/core/audio/audio_service.dart):
 * - One voice at a time; playing a new voice stops the previous one.
 * - BGM pauses while a voice is playing, and resumes where it left off.
 * - Missing/corrupted files degrade silently (console.warn, never throws).
 */
export type AudioChannel = 'voice' | 'sfx' | 'bgm';

export class AudioService {
  private readonly voiceEl: HTMLAudioElement;
  private readonly sfxEl: HTMLAudioElement;
  private readonly bgmEl: HTMLAudioElement;

  private bgmEnabled = true;
  private bgmBaseVolume = 1.0;
  private bgmPlaylist: string[] = [];
  private lastBgmTrack: string | null = null;
  private isPlayingVoice = false;
  private playingVoiceSrc: string | null = null;
  private readonly voiceListeners = new Set<(src: string | null) => void>();
  private audioCtx: AudioContext | null = null;
  private voiceGainNode: GainNode | null = null;
  private voiceSourceNode: MediaElementAudioSourceNode | null = null;
  /** Voice gain multiplier (>1 = louder). Applied via Web Audio GainNode. */
  private voiceGain = 1.8;

  /**
   * Bumped on every stopVoice()/stopAll() and every new playVoice() call.
   * Each playVoice() invocation captures the token value at its start and
   * checks it before mutating shared state in its play() then/catch — this
   * guards against a stale call's play() Promise settling (e.g. a real
   * browser rejecting an interrupted play() with AbortError) *after* a
   * newer playVoice() has already taken over, which would otherwise
   * incorrectly un-duck the BGM and clear the "now playing" state for the
   * voice that is actually still playing.
   */
  private playToken = 0;

  constructor(
    voiceEl: HTMLAudioElement = new Audio(),
    sfxEl: HTMLAudioElement = new Audio(),
    bgmEl: HTMLAudioElement = new Audio(),
  ) {
    this.voiceEl = voiceEl;
    this.sfxEl = sfxEl;
    this.bgmEl = bgmEl;
    this.bgmEl.loop = true;
  }

  /**
   * Lazily initialises a Web Audio GainNode for the voice channel so we
   * can boost volume beyond the HTMLAudioElement's 1.0 cap. Gracefully
   * degrades (no-op) when AudioContext is unavailable, e.g. in test
   * environments or older browsers.
   */
  private ensureVoiceGain(): void {
    if (this.voiceGainNode) return;
    try {
      const win = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();
      this.voiceGainNode = this.audioCtx.createGain();
      this.voiceGainNode.gain.value = this.voiceGain;
      this.voiceSourceNode = this.audioCtx.createMediaElementSource(this.voiceEl);
      this.voiceSourceNode.connect(this.voiceGainNode);
      this.voiceGainNode.connect(this.audioCtx.destination);
    } catch {
      // AudioContext not available — fall back to default volume
    }
  }

  /** Adjust the voice gain multiplier. Takes effect on the next playVoice call. */
  setVoiceGain(gain: number): void {
    this.voiceGain = gain;
    if (this.voiceGainNode) {
      this.voiceGainNode.gain.value = gain;
    }
  }

  /** Play a voice audio file. Stops any currently playing voice; ducks BGM. */
  async playVoice(src: string, fallbackSrc?: string): Promise<void> {
    this.ensureVoiceGain();
    // Resume AudioContext if browser suspended it (autoplay policy).
    if (this.audioCtx?.state === 'suspended') {
      void this.audioCtx.resume();
    }
    this.stopVoice();
    const token = ++this.playToken;
    this.isPlayingVoice = true;
    this.applyDucking();
    this.setPlayingVoiceSrc(src);

    this.voiceEl.onended = () => {
      if (token !== this.playToken) return; // superseded by a newer playVoice()/stop
      this.isPlayingVoice = false;
      this.restoreBgm();
      this.setPlayingVoiceSrc(null);
    };

    try {
      this.voiceEl.src = src;
      await this.voiceEl.play();
    } catch (e) {
      if (token !== this.playToken) return; // stale rejection, a newer call already took over
      if (fallbackSrc && fallbackSrc !== src) {
        console.warn(`[AudioService] Failed to play voice: ${src}, trying fallback`);
        this.voiceEl.src = fallbackSrc;
        try {
          await this.voiceEl.play();
          return;
        } catch (e2) {
          console.warn(`[AudioService] Fallback also failed: ${fallbackSrc}`, e2);
        }
      }
      console.warn(`[AudioService] Failed to play voice: ${src}`, e);
      this.isPlayingVoice = false;
      this.restoreBgm();
      this.setPlayingVoiceSrc(null);
    }
  }

  /**
   * Subscribe to which voice src (if any) is currently playing, so UI like
   * SoundButton can show/hide its "playing" pulse without owning audio
   * elements itself. Returns an unsubscribe function.
   */
  addVoiceListener(listener: (src: string | null) => void): () => void {
    this.voiceListeners.add(listener);
    return () => this.voiceListeners.delete(listener);
  }

  /** The src currently playing on the voice channel, if any. */
  getPlayingVoiceSrc(): string | null {
    return this.playingVoiceSrc;
  }

  /**
   * The underlying voice `<audio>` element, exposed read-only so callers
   * like usePhonemeAnimationSync can poll `currentTime`/`duration` to drive
   * animation timing. Playback must still only ever be started/stopped via
   * this service's methods, never by calling .play()/.pause() on the
   * returned element directly.
   */
  getVoiceElement(): HTMLAudioElement {
    return this.voiceEl;
  }

  private setPlayingVoiceSrc(src: string | null): void {
    this.playingVoiceSrc = src;
    for (const listener of this.voiceListeners) listener(src);
  }

  /** Play a short SFX file. Does not trigger BGM ducking. */
  async playSfx(src: string): Promise<void> {
    try {
      this.sfxEl.src = src;
      await this.sfxEl.play();
    } catch (e) {
      console.warn(`[AudioService] Failed to play sfx: ${src}`, e);
    }
  }

  /** Stop the currently playing voice. */
  stopVoice(): void {
    this.playToken++; // invalidate any in-flight playVoice() callbacks
    this.voiceEl.pause();
    this.voiceEl.currentTime = 0;
    this.isPlayingVoice = false;
    this.restoreBgm();
    this.setPlayingVoiceSrc(null);
  }

  /** Stop all audio (voice, sfx, bgm). */
  stopAll(): void {
    this.playToken++; // invalidate any in-flight playVoice() callbacks
    this.voiceEl.pause();
    this.sfxEl.pause();
    this.bgmEl.pause();
    this.isPlayingVoice = false;
    this.setPlayingVoiceSrc(null);
  }

  /** Set or change background music. Pass null to stop BGM. */
  async setBgm(src: string | null): Promise<void> {
    this.bgmEl.pause();
    if (src === null) return;

    try {
      this.bgmEl.src = src;
      this.bgmEl.volume = this.bgmEnabled ? this.bgmBaseVolume : 0;
      await this.bgmEl.play();
    } catch (e) {
      console.warn(`[AudioService] Failed to set BGM: ${src}`, e);
    }
  }

  /**
   * Play an endlessly-repeating shuffled playlist of BGM tracks (e.g. a
   * set of interchangeable loopable tracks) instead of one single looping
   * file. Picks a random track now, then a new random track (never the
   * same one twice in a row, when there's a choice) each time a track
   * finishes.
   */
  async playBgmPlaylist(srcs: string[]): Promise<void> {
    this.bgmPlaylist = srcs;
    this.bgmEl.loop = false;
    this.bgmEl.onended = () => {
      void this.playNextBgmTrack();
    };
    await this.playNextBgmTrack();
  }

  private async playNextBgmTrack(): Promise<void> {
    if (this.bgmPlaylist.length === 0) return;
    const pool =
      this.bgmPlaylist.length > 1
        ? this.bgmPlaylist.filter((src) => src !== this.lastBgmTrack)
        : this.bgmPlaylist;
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) {
      this.lastBgmTrack = next;
      await this.setBgm(next);
    }
  }

  /** Enable or disable BGM. When disabled, BGM is paused. */
  setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (this.isPlayingVoice) return; // ducking already has it paused; restoreBgm() re-checks bgmEnabled
    if (enabled) {
      this.restoreBgm();
    } else {
      this.bgmEl.pause();
    }
  }

  private applyDucking(): void {
    this.bgmEl.pause();
  }

  private restoreBgm(): void {
    if (this.bgmEnabled && this.bgmEl.src) {
      this.bgmEl.volume = this.bgmBaseVolume;
      void this.bgmEl.play().catch((e) => {
        console.warn('[AudioService] Failed to resume BGM', e);
      });
    }
  }
}

