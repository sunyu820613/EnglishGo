/**
 * Manages all audio playback: voice, sfx, and background music.
 *
 * Rules (ported from lib/core/audio/audio_service.dart):
 * - One voice at a time; playing a new voice stops the previous one.
 * - BGM ducks to 20% volume while a voice is playing.
 * - Missing/corrupted files degrade silently (console.warn, never throws).
 */
export type AudioChannel = 'voice' | 'sfx' | 'bgm';

const BGM_DUCKED_VOLUME = 0.2;

export class AudioService {
  private readonly voiceEl: HTMLAudioElement;
  private readonly sfxEl: HTMLAudioElement;
  private readonly bgmEl: HTMLAudioElement;

  private bgmEnabled = true;
  private bgmBaseVolume = 1.0;
  private isPlayingVoice = false;
  private playingVoiceSrc: string | null = null;
  private readonly voiceListeners = new Set<(src: string | null) => void>();

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

  /** Play a voice audio file. Stops any currently playing voice; ducks BGM. */
  async playVoice(src: string): Promise<void> {
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

  /** Enable or disable BGM. When disabled, BGM volume is set to 0. */
  setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    this.bgmEl.volume = enabled && !this.isPlayingVoice ? this.bgmBaseVolume : 0;
  }

  private applyDucking(): void {
    if (this.bgmEnabled) {
      this.bgmEl.volume = this.bgmBaseVolume * BGM_DUCKED_VOLUME;
    }
  }

  private restoreBgm(): void {
    if (this.bgmEnabled) {
      this.bgmEl.volume = this.bgmBaseVolume;
    }
  }
}
