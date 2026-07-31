import { describe, expect, it } from 'vitest';
import { IDLE_FRONT_POSE, IDLE_SIDE_POSE, phonemeAnimationRigs, resolveFullPoseAtFrame } from './phonemeAnimationRigs';

describe('phonemeAnimationRigs', () => {
  it('has exactly the 5 M2 sample phonemes', () => {
    expect(Object.keys(phonemeAnimationRigs).sort()).toEqual(['ae', 'i', 'ng', 'r', 'th']);
  });

  it('every rig has the 4 fixed keyframes at t=0/0.15/0.85/1', () => {
    for (const rig of Object.values(phonemeAnimationRigs)) {
      expect(rig.keyframes.map((k) => k.t)).toEqual([0, 0.15, 0.85, 1]);
    }
  });

  it('/iː/ sustain pose matches docs/phoneme-animation-spec.md §3 (spread high front vowel)', () => {
    const rig = phonemeAnimationRigs.i;
    const { front, side } = resolveFullPoseAtFrame(rig, 1); // sustain-in (t=0.15)
    expect(front.lipSpread).toBeCloseTo(0.8);
    expect(front.lipRound).toBe(0);
    expect(side.tongueBodyHeight).toBeCloseTo(0.9);
    expect(side.voicing).toBe(true);
    expect(side.airflow).toBe('none');
  });

  it('/θ/ sustain pose is voiceless with continuous airflow and a visible tongue peek', () => {
    const rig = phonemeAnimationRigs.th;
    const { front, side } = resolveFullPoseAtFrame(rig, 1);
    expect(front.tonguePeek).toBeCloseTo(0.85);
    expect(side.voicing).toBe(false);
    expect(side.airflow).toBe('continuous');
  });

  it('/ŋ/ sustain pose opens the velum and raises the tongue root together', () => {
    const rig = phonemeAnimationRigs.ng;
    const { side } = resolveFullPoseAtFrame(rig, 1);
    expect(side.velumOpen).toBe(1);
    expect(side.tongueRootHeight).toBeCloseTo(0.9);
    expect(side.airflow).toBe('continuous');
  });

  it('onset (t=0) numeric values are 70% of the sustain target', () => {
    const rig = phonemeAnimationRigs.ae;
    const onset = resolveFullPoseAtFrame(rig, 0);
    const sustain = resolveFullPoseAtFrame(rig, 1);
    expect(onset.front.jawOpen).toBeCloseTo(sustain.front.jawOpen * 0.7);
    expect(onset.side.tongueBodyAdvance).toBeCloseTo(sustain.side.tongueBodyAdvance * 0.7);
  });

  it('release (t=1) numeric values ease back to 90% of the sustain target', () => {
    const rig = phonemeAnimationRigs.r;
    const sustain = resolveFullPoseAtFrame(rig, 1);
    const release = resolveFullPoseAtFrame(rig, 3);
    expect(release.front.lipRound).toBeCloseTo(sustain.front.lipRound * 0.9);
    expect(release.side.tongueTipHeight).toBeCloseTo(sustain.side.tongueTipHeight * 0.9);
  });

  it('voicing/airflow declared at sustain-in carry forward to sustain-out and release', () => {
    const rig = phonemeAnimationRigs.i;
    for (const frameIndex of [1, 2, 3]) {
      const { side } = resolveFullPoseAtFrame(rig, frameIndex);
      expect(side.voicing).toBe(true);
      expect(side.airflow).toBe('none');
    }
  });

  it('resolveFullPoseAtFrame(-1)-equivalent (index below 0) still returns the idle pose', () => {
    const rig = phonemeAnimationRigs.i;
    const { front, side } = resolveFullPoseAtFrame(rig, -1);
    expect(front).toEqual(IDLE_FRONT_POSE);
    expect(side).toEqual(IDLE_SIDE_POSE);
  });
});
