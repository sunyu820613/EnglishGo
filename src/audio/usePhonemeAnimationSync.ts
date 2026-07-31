import { useEffect, useRef, useState } from 'react';
import {
  IDLE_FRONT_POSE,
  IDLE_SIDE_POSE,
  resolveFullPoseAtFrame,
} from '../data/phonemeAnimationRigs';
import type { FrontMouthPose, PhonemeAnimationRig, SideProfilePose } from '../data/phonemes.types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * Mirrors --duration-standard (docs/design-system-react-rewrite.md §1.8) —
 * the one-off transition back to the idle mouth shape after playback ends,
 * per docs/phoneme-animation-spec.md §4 "播放结束后的收尾".
 */
const IDLE_RETURN_MS = 320;

export interface PhonemeAnimationState {
  front: FrontMouthPose;
  side: SideProfilePose;
  /** How long (ms) the SVG rig should CSS-transition into this pose. 0 under reduced motion. */
  transitionMs: number;
}

function idleState(reducedMotion: boolean): PhonemeAnimationState {
  return {
    front: IDLE_FRONT_POSE,
    side: IDLE_SIDE_POSE,
    transitionMs: reducedMotion ? 0 : IDLE_RETURN_MS,
  };
}

/**
 * Drives the 4-keyframe (t=0/0.15/0.85/1) rig timeline
 * (docs/phoneme-animation-spec.md §4) from an actively-playing
 * `<audio>` element's progress. Callers only pass a non-null `audioEl` while
 * *this* phoneme's audio is the one currently on the voice channel — see
 * AudioService.getVoiceElement() / getPlayingVoiceSrc().
 *
 * Implementation note: rather than re-interpolating on every animation
 * frame, this polls playback progress via requestAnimationFrame but only
 * updates state when the audio crosses into a new keyframe segment, then
 * lets CSS `transition` (duration = that segment's real playback time) ease
 * between the two keyframes' resolved poses — the "simple CSS-transition"
 * approach docs/phoneme-animation-spec.md and the M2 task explicitly allow,
 * instead of a full per-frame tween loop.
 */
export function usePhonemeAnimationSync(
  audioEl: HTMLAudioElement | null,
  rig: PhonemeAnimationRig | undefined,
): PhonemeAnimationState {
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState<PhonemeAnimationState>(() => idleState(reducedMotion));
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioEl || !rig || rig.keyframes.length === 0) {
      lastIndexRef.current = null;
      setState(idleState(reducedMotion));
      return;
    }

    const frames = rig.keyframes;
    let frameId: number;

    const tick = () => {
      const duration = audioEl.duration;
      const hasDuration = Number.isFinite(duration) && duration > 0;
      const t = hasDuration ? audioEl.currentTime / duration : 0;
      const clamped = Math.min(1, Math.max(0, t));

      let toIndex = frames.findIndex((kf) => kf.t >= clamped);
      if (toIndex === -1) toIndex = frames.length - 1;

      if (toIndex !== lastIndexRef.current) {
        lastIndexRef.current = toIndex;
        const currentFrame = frames[toIndex];
        if (!currentFrame) {
          frameId = requestAnimationFrame(tick);
          return;
        }
        const fromT = toIndex > 0 ? (frames[toIndex - 1]?.t ?? currentFrame.t) : currentFrame.t;
        const toT = currentFrame.t;
        const segmentSeconds = hasDuration ? (toT - fromT) * duration : 0;
        const pose = resolveFullPoseAtFrame(rig, toIndex);
        setState({
          front: pose.front,
          side: pose.side,
          transitionMs: reducedMotion ? 0 : Math.max(0, segmentSeconds * 1000),
        });
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [audioEl, rig, reducedMotion]);

  return state;
}
