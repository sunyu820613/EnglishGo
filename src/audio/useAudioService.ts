import { AudioService } from './AudioService';

/**
 * Module-level singleton, shared by every component and store.
 * This is the only audio output for the whole app — components must not
 * `new Audio()` directly.
 */
export const audioService = new AudioService();

export function useAudioService(): AudioService {
  return audioService;
}
