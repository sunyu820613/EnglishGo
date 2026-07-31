import { audioService } from '../../../audio/useAudioService';

/**
 * Mirrors --duration-page (docs/design-system-react-rewrite.md §1.8) — the
 * pause between the two sounds in a minimal-pair "play both" comparison
 * (docs/phoneme-animation-spec.md §6.2).
 */
const PAIR_GAP_MS = 420;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for `src` to finish playing on the AudioService voice channel.
 * Resolves `true` if it finished naturally (playback ended on its own),
 * or `false` if it was preempted — some *other* sound started on the voice
 * channel before `src` naturally ended (e.g. the user clicked a different
 * SoundButton mid-playback). AudioService.playVoice() always calls
 * stopVoice() (which fires a `null` notification) immediately before it
 * starts the new src, so a `null` notification alone doesn't tell us which
 * case we're in — we defer to a microtask to see whether a different src
 * claims the voice channel right after, in the same synchronous
 * stopVoice()+playVoice() sequence, before deciding it was a natural end.
 */
function waitForVoiceToFinish(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    let sawSrcPlaying = false;
    let settled = false;

    const settle = (finishedNaturally: boolean) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(finishedNaturally);
    };

    const unsubscribe = audioService.addVoiceListener((playingSrc) => {
      if (playingSrc === src) {
        sawSrcPlaying = true;
        return;
      }
      if (!sawSrcPlaying) return; // notification from before our src ever started

      if (playingSrc === null) {
        // Could be a natural end, or the "stopVoice()" half of a
        // stopVoice()+playVoice(otherSrc) pair triggered by something else
        // preempting us — check again after the current synchronous work
        // finishes to see which one it was.
        queueMicrotask(() => settle(audioService.getPlayingVoiceSrc() === null));
      } else {
        // A different sound has taken over the voice channel.
        settle(false);
      }
    });

    void audioService.playVoice(src);
  });
}

/**
 * Plays `srcA` then, after it finishes and a short gap, `srcB` — always
 * sequentially on the single AudioService voice channel, never overlapping
 * (docs/phoneme-animation-spec.md §6.2 / implementation requirement 8). If
 * `srcA` gets preempted by some other sound before it naturally finishes,
 * `srcB` is not played — it would otherwise interrupt whatever the user
 * actually asked to hear.
 */
export async function playSequentialPair(srcA: string, srcB: string): Promise<void> {
  const finishedNaturally = await waitForVoiceToFinish(srcA);
  if (!finishedNaturally) return;
  await delay(PAIR_GAP_MS);
  await audioService.playVoice(srcB);
}
