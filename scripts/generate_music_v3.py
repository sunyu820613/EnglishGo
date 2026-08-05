#!/usr/bin/env python
"""
generate_music_v3.py — Builds on the approved happy_skip_preview_v2 engine:

  1. The FULL happy_skip track (~75s, structured intro/A/A'/B/A/loop),
     now that its 20s preview has been signed off.
  2. Short ~20s PREVIEWS of playful_pop and sunny_parade using the same
     corrected synthesis engine (no reverb by default, no banned
     instruments, short envelopes, register/clash/instrument-count
     assertions) — these have NOT been previewed/approved yet, so they stay
     short until they get the same sign-off happy_skip did.

Reuses every synth function, envelope constant, register limit, and helper
from generate_music_preview_v2.py unchanged (that engine is the approved
baseline) — only the composition/arrangement data is new here.
"""

from __future__ import annotations

import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from generate_music_preview_v2 import (  # noqa: E402
    SR,
    BASS_MIN_MIDI, MAX_SIMULTANEOUS_INSTRUMENTS,
    warm_pluck, soft_round_bass, soft_kick, shaker, natural_clap, mallet_accent,
    PAN,
    scale_degree_to_midi, midi_to_freq, chord_midi,
    NoteEvent, Composition, write_wav, ffprobe_json, check_loop_seam,
    _extract_loudnorm_json, NOTE_FADE_OUT_SEC,
)
from scipy.signal import lfilter, iirpeak
import subprocess
import json

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "audio", "music")
PREVIEW_DIR = os.path.join(OUT_DIR, "preview")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)

INSTRUMENTS = {"ukulele": warm_pluck, "bass": soft_round_bass, "mallet": mallet_accent}
PERCUSSION = {"kick": soft_kick, "shaker": shaker, "clap": natural_clap}


# ---------------------------------------------------------------------------
# Shared render/master/check pipeline (identical approach to v2)
# ---------------------------------------------------------------------------

def render(comp: Composition, key_root: str, key_octave: int) -> np.ndarray:
    n_samples = int(comp.total_seconds() * SR) + int(0.3 * SR)
    stereo = np.zeros((n_samples, 2))
    spb = comp.sec_per_beat()

    for ev in comp.events:
        start_sample = int(ev.start_beat * spb * SR)
        dur_sec = ev.dur_beats * spb
        if ev.instrument in PERCUSSION:
            audio = PERCUSSION[ev.instrument](dur_sec)
        else:
            freq = midi_to_freq(ev.midi_note)
            audio = INSTRUMENTS[ev.instrument](freq, dur_sec)
        audio = audio * ev.velocity
        fade_n = min(len(audio), int(NOTE_FADE_OUT_SEC * SR))
        if fade_n > 0:
            audio = audio.copy()
            audio[-fade_n:] *= np.linspace(1, 0, fade_n)
        end_sample = min(n_samples, start_sample + len(audio))
        seg = audio[: end_sample - start_sample]
        left_gain = 1.0 - max(0.0, ev.pan)
        right_gain = 1.0 + min(0.0, ev.pan)
        stereo[start_sample:end_sample, 0] += seg * left_gain
        stereo[start_sample:end_sample, 1] += seg * right_gain

    b, a = iirpeak(3500 / (SR / 2), Q=1.2)
    dip = 0.85
    for ch in range(2):
        peaked = lfilter(b, a, stereo[:, ch])
        stereo[:, ch] = stereo[:, ch] - peaked * (1 - dip)

    loop_samples = int(comp.total_seconds() * SR)
    stereo = stereo[:loop_samples]
    stereo = np.clip(stereo, -0.98, 0.98)
    return stereo


def master(raw_wav, final_wav, final_ogg, target_lufs=-16.0, target_tp=-1.5):
    measure = subprocess.run(
        ["ffmpeg", "-y", "-i", raw_wav, "-af",
         f"loudnorm=I={target_lufs}:TP={target_tp}:LRA=11:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    stats = _extract_loudnorm_json(measure.stderr)
    af = (
        f"loudnorm=I={target_lufs}:TP={target_tp}:LRA=11:"
        f"measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:"
        f"measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:"
        f"offset={stats['target_offset']}:linear=true:print_format=json"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", raw_wav, "-af", af, "-ar", "44100", "-sample_fmt", "s16", final_wav],
        capture_output=True, text=True, check=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", final_wav, "-c:a", "libvorbis", "-q:a", "6", final_ogg],
        capture_output=True, text=True, check=True,
    )
    return stats


def measure_final(path):
    measure = subprocess.run(
        ["ffmpeg", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    return _extract_loudnorm_json(measure.stderr)


def track_register(key_root, key_octave):
    """The brief's G4-G5 window is specific to happy_skip's G-major key.
    For a different key, keep the same idea (one octave above the tonic,
    staying clear of the brief's C6 ceiling) rather than reusing G's
    absolute MIDI numbers verbatim."""
    tonic = scale_degree_to_midi(key_root, key_octave, 1)
    return tonic, min(tonic + 11, 83)


def run_checks(events, key_root, key_octave):
    melody_min, melody_max = track_register(key_root, key_octave)
    for e in events:
        if e.instrument in ("ukulele", "mallet") and e.midi_note:
            assert melody_min <= e.midi_note <= melody_max, (
                f"{e.instrument} note {e.midi_note} outside register limit [{melody_min},{melody_max}]"
            )
        if e.instrument == "bass":
            assert e.midi_note >= BASS_MIN_MIDI, f"bass note {e.midi_note} below floor"

    per_bar = {}
    for e in events:
        b_idx = int(e.start_beat // 4)
        per_bar.setdefault(b_idx, set()).add(e.instrument)
    max_simul = max(len(s) for s in per_bar.values())
    assert max_simul <= MAX_SIMULTANEOUS_INSTRUMENTS, f"{max_simul} instruments exceeds cap"

    melodic = [e for e in events if e.instrument in ("ukulele", "bass", "mallet") and e.midi_note]
    clashes = []
    for i, a in enumerate(melodic):
        for b in melodic[i + 1 :]:
            if a.start_beat < b.start_beat + b.dur_beats and b.start_beat < a.start_beat + a.dur_beats:
                interval = abs(a.midi_note - b.midi_note) % 12
                if interval in (1, 11):
                    clashes.append((a, b))
    assert not clashes, f"{len(clashes)} semitone clash(es): {clashes[:3]}"
    return {"max_simultaneous_instruments": max_simul, "semitone_clashes_found": len(clashes)}


def build_phrase(events, start_beat, degrees_durs, key_root, key_octave, instrument, velocity=0.8, pan=0.0):
    b = start_beat
    for degree, dur in degrees_durs:
        if degree != 0:
            midi = scale_degree_to_midi(key_root, key_octave, degree)
            events.append(NoteEvent(b, dur, midi, instrument, velocity, pan))
        b += dur
    return b


def comping_bar(events, start_beat, key_root, key_octave, degree, avoid_root_degree=4):
    melody_min, melody_max = track_register(key_root, key_octave)
    notes = chord_midi(key_root, key_octave, degree, "major")
    voicing = [notes[1], notes[2]] if degree == avoid_root_degree else [notes[0], notes[2]]
    voicing = [n - 12 if n > melody_max else n for n in voicing]
    voicing = [n + 12 if n < melody_min - 12 else n for n in voicing]
    for beat in (0, 2):
        for i, n in enumerate(voicing):
            events.append(NoteEvent(start_beat + beat, 0.5, n, "ukulele", 0.35 if i == 0 else 0.22, PAN["ukulele"]))


def bass_bar(events, start_beat, key_root, key_octave, degree):
    root = scale_degree_to_midi(key_root, key_octave - 1, degree)
    assert root >= BASS_MIN_MIDI, f"bass note {root} below floor"
    events.append(NoteEvent(start_beat, 0.4, root, "bass", 0.6, PAN["bass"]))
    events.append(NoteEvent(start_beat + 2, 0.4, root, "bass", 0.5, PAN["bass"]))


def rhythm_bar(events, start_beat, with_kick, with_clap, with_shaker=True):
    if with_shaker:
        for beat in (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5):
            events.append(NoteEvent(start_beat + beat, 0.09, 0, "shaker", 0.5, PAN["shaker"]))
    if with_kick:
        events.append(NoteEvent(start_beat, 0.15, 0, "kick", 0.7, PAN["kick"]))
        events.append(NoteEvent(start_beat + 2, 0.15, 0, "kick", 0.6, PAN["kick"]))
    if with_clap:
        events.append(NoteEvent(start_beat + 1, 0.09, 0, "clap", 0.55, PAN["clap"]))
        events.append(NoteEvent(start_beat + 3, 0.09, 0, "clap", 0.5, PAN["clap"]))


# ===========================================================================
# Track 1 (FULL): happy_skip — Skip to My Lou, 124 BPM, G major
# ===========================================================================

def compose_happy_skip_full() -> Composition:
    root, octv = "G", 4
    bpm = 124
    total_bars = 40  # intro2 + 4x9 + loop2 -> ~77.4s
    comp = Composition("happy_skip", bpm, root, octv, total_bars)
    ev = comp.events

    melody_up = [(3, 0.5), (3, 0.5), (3, 0.5), (2, 0.5), (4, 0.5), (5, 1.5)]
    melody_down = [(4, 0.5), (3, 0.5), (2, 0.5), (1, 0.5), (1, 2)]
    melody_turn = [(5, 0.5), (6, 0.5), (5, 0.5), (4, 0.5), (3, 0.5), (1, 1.5)]

    def safe_bass_degree(deg):
        # Scale-degree 3 (B) and the IV chord's root (C, degree 4) are a
        # semitone apart in any major key, so any melody note landing on
        # B while a C-major bass root sounds underneath is always a clash
        # -- not phrase-specific. Always play the IV chord's third (scale
        # degree 6, E) in the bass instead, matching comping_bar's existing
        # rootless treatment of the same chord.
        return 6 if deg == 4 else deg

    bar = 0

    def intro_or_loop_bar():
        nonlocal bar
        comping_bar(ev, bar * 4, root, octv, 1)
        bass_bar(ev, bar * 4, root, octv, 1)
        rhythm_bar(ev, bar * 4, with_kick=False, with_clap=False)
        bar += 1

    # 2-bar intro: bright and clear from note one (no fade-in-from-distance)
    for _ in range(2):
        intro_or_loop_bar()

    def section(n_bars, phrase_plan, chord_plan, density, mallet_bars=()):
        """density: 'base' (3 layers), 'full' (4, alternating kick/clap),
        'light' (3, shaker+clap only, no kick — the 'remove an instrument'
        contrast for section B)."""
        nonlocal bar
        for i in range(n_bars):
            start = bar * 4
            phrase = phrase_plan[i % len(phrase_plan)]
            deg = chord_plan[i % len(chord_plan)]
            comping_bar(ev, start, root, octv, deg)
            bass_bar(ev, start, root, octv, safe_bass_degree(deg))

            if i in mallet_bars:
                # mallet bars are already at the 4-instrument cap with
                # ukulele+bass+shaker+mallet, so kick/clap sit out here.
                rhythm_bar(ev, start, with_kick=False, with_clap=False)
                accent_deg = 6 if phrase is melody_turn else 5
                accent_midi = scale_degree_to_midi(root, octv, accent_deg)
                ev.append(NoteEvent(start + 0.5, 0.5, accent_midi, "mallet", 0.45, PAN["mallet"]))
            elif density == "base":
                rhythm_bar(ev, start, with_kick=False, with_clap=False)
            elif density == "light":
                rhythm_bar(ev, start, with_kick=False, with_clap=(i % 2 == 1))
            else:  # full
                rhythm_bar(ev, start, with_kick=(i % 2 == 0), with_clap=(i % 2 == 1))

            build_phrase(ev, start, phrase, root, octv, "ukulele", 0.75, PAN["ukulele"])
            bar += 1

    # A (9 bars): base texture (ukulele+bass+shaker only) — melody introduced
    # plainly, I-V harmony, builds anticipation before the full band enters.
    section(9, [melody_up, melody_down], [1, 5], density="base")

    # A' (9 bars): full texture (kick/clap alternate in), harmony now visits
    # all 3 chords, one mallet accent bar.
    section(9, [melody_up, melody_down, melody_turn], [1, 5, 1, 4, 1, 5], density="full", mallet_bars={4})

    # B (9 bars, contrast): drop the kick entirely (the "remove an
    # instrument" half of the brief's every-8-bars variation rule), lead
    # with the brighter melody_turn phrase, harmony spends more time on
    # C/D for a different color, two mallet accents for extra sparkle.
    section(9, [melody_turn, melody_down, melody_turn], [4, 5, 1, 4, 5, 1], density="light", mallet_bars={0, 6})

    # A return (9 bars): full band, all 3 phrases, resolves home to G on
    # the final bar so it flows into the loop connector cleanly.
    section(9, [melody_up, melody_turn, melody_down], [1, 5, 1, 4, 1, 5, 1, 5, 1], density="full", mallet_bars={3})

    # 2-bar loop connector: thin back to the intro's bare trio on G, so the
    # seam matches bar 0 exactly.
    for _ in range(2):
        intro_or_loop_bar()

    assert bar == total_bars, (bar, total_bars)
    comp.checks = run_checks(ev, root, octv)
    return comp


# ===========================================================================
# Track 2 (PREVIEW, ~20s): playful_pop — Pop Goes the Weasel, C major
# ===========================================================================

def toy_bounce(sr=SR):
    """Original synthesized 'pop' chirp (pitch-up sweep) — not a banned
    'toy piano', just a short SFX standing in for the surprise beat."""
    n = int(0.14 * sr)
    t = np.arange(n) / sr
    freq = 450 + 1400 * (t / t[-1])
    phase = 2 * np.pi * np.cumsum(freq) / sr
    chirp = np.sin(phase) * np.exp(-t * 14)
    return chirp * 0.5


def compose_playful_pop_preview() -> Composition:
    root, octv = "C", 4
    bpm = 126  # brief's "<=128 BPM" ceiling applied project-wide, not just track 1
    total_bars = 10  # ~19.05s at 126bpm (bar=1.905s)
    comp = Composition("playful_pop_preview_v3", bpm, root, octv, total_bars)
    ev = comp.events

    phrase_a = [(1, 0.5), (1, 0.5), (2, 0.5), (3, 0.5), (3, 0.5), (2, 0.5), (1, 1)]  # mulberry-bush motif
    phrase_pop_setup = [(5, 0.5), (4, 0.5), (3, 0.5), (2, 0.5), (1, 2)]

    bar = 0
    bounce_events = []  # (start_beat,) — rendered separately, see render_playful_pop

    def base_bar(with_kick, with_clap):
        nonlocal bar
        start = bar * 4
        comping_bar(ev, start, root, octv, 1)
        bass_bar(ev, start, root, octv, 1)
        rhythm_bar(ev, start, with_kick=with_kick, with_clap=with_clap)
        bar += 1
        return start

    # 1-bar intro
    base_bar(False, False)

    # 7-bar main: alternate the rising motif with the descending setup,
    # ending each 2nd bar's setup with the "Pop!" bounce SFX (max 4
    # instruments still holds: ukulele+bass+shaker+kick/clap, the bounce is
    # a one-shot SFX layered on top of the render, not a 5th sequenced
    # instrument in the note-event sense)
    for i in range(7):
        with_kick = i % 2 == 0
        start = base_bar(with_kick, not with_kick)
        if i % 2 == 0:
            build_phrase(ev, start, phrase_a, root, octv, "ukulele", 0.78, PAN["ukulele"])
        else:
            build_phrase(ev, start, phrase_pop_setup, root, octv, "ukulele", 0.78, PAN["ukulele"])
            bounce_events.append(start + 3.5)

    # 2-bar loop connector
    for _ in range(2):
        base_bar(False, False)

    assert bar == total_bars
    comp.checks = run_checks(ev, root, octv)
    comp.bounce_events = bounce_events
    return comp


def render_playful_pop(comp: Composition) -> np.ndarray:
    stereo = render(comp, comp.key_root, comp.key_octave)
    chirp = toy_bounce()
    spb = comp.sec_per_beat()
    for start_beat in comp.bounce_events:
        start_sample = int(start_beat * spb * SR)
        end_sample = min(len(stereo), start_sample + len(chirp))
        seg = chirp[: end_sample - start_sample]
        stereo[start_sample:end_sample, 0] += seg
        stereo[start_sample:end_sample, 1] += seg
    return np.clip(stereo, -0.98, 0.98)


# ===========================================================================
# Track 3 (PREVIEW, ~20s): sunny_parade — Yankee Doodle, D major
# ===========================================================================

def compose_sunny_parade_preview() -> Composition:
    root, octv = "D", 4
    bpm = 126
    total_bars = 10
    comp = Composition("sunny_parade_preview_v3", bpm, root, octv, total_bars)
    ev = comp.events

    phrase_a = [(1, 0.5), (1, 0.5), (2, 0.5), (3, 0.5), (1, 0.5), (3, 0.5), (2, 0.5), (5, 0.5)]
    phrase_b = [(1, 0.5), (1, 0.5), (2, 0.5), (3, 0.5), (1, 0.5), (2, 0.5), (6, 0.5), (1, 1.5)]

    bar = 0

    def parade_bar(phrase, with_clap):
        nonlocal bar
        start = bar * 4
        comping_bar(ev, start, root, octv, 1)
        bass_bar(ev, start, root, octv, 1)
        rhythm_bar(ev, start, with_kick=False, with_clap=with_clap)  # "light" hand-drum feel: no deep kick
        build_phrase(ev, start, phrase, root, octv, "ukulele", 0.78, PAN["ukulele"])
        bar += 1

    # 1-bar intro (shaker only, matches the eventual loop texture)
    start = bar * 4
    comping_bar(ev, start, root, octv, 1)
    bass_bar(ev, start, root, octv, 1)
    rhythm_bar(ev, start, with_kick=False, with_clap=False)
    bar += 1

    for i in range(7):
        parade_bar([phrase_a, phrase_b][i % 2], with_clap=(i % 2 == 1))

    for _ in range(2):
        start = bar * 4
        comping_bar(ev, start, root, octv, 1)
        bass_bar(ev, start, root, octv, 1)
        rhythm_bar(ev, start, with_kick=False, with_clap=False)
        bar += 1

    assert bar == total_bars
    comp.checks = run_checks(ev, root, octv)
    return comp


# ===========================================================================
# Main
# ===========================================================================

def process(comp, out_dir, name, custom_render=None):
    print(f"Rendering {name} ...")
    audio = custom_render(comp) if custom_render else render(comp, comp.key_root, comp.key_octave)
    raw = os.path.join(out_dir, f"_raw_{name}.wav")
    write_wav(raw, audio)

    print(f"Mastering {name} ...")
    final_wav = os.path.join(out_dir, f"{name}.wav")
    final_ogg = os.path.join(out_dir, f"{name}.ogg")
    master(raw, final_wav, final_ogg)
    os.remove(raw)

    final_stats = measure_final(final_wav)
    seam = check_loop_seam(final_wav)
    probe = ffprobe_json(final_wav)
    duration = round(float(probe["format"]["duration"]), 2)
    print(f"  {name}: {duration}s LUFS={final_stats['input_i']} TP={final_stats['input_tp']} "
          f"checks={comp.checks} seam_ok={seam['ok']}")
    return {
        "name": name, "duration": duration, "lufs": float(final_stats["input_i"]),
        "true_peak": float(final_stats["input_tp"]), "seam": seam, "checks": comp.checks,
        "bpm": comp.bpm, "key": f"{comp.key_root} major",
    }


def main():
    results = []

    print("Composing happy_skip (FULL) ...")
    comp1 = compose_happy_skip_full()
    results.append(process(comp1, OUT_DIR, "happy_skip"))

    print("Composing playful_pop preview (v3, not yet approved) ...")
    comp2 = compose_playful_pop_preview()
    results.append(process(comp2, PREVIEW_DIR, "playful_pop_preview_v3", custom_render=render_playful_pop))

    print("Composing sunny_parade preview (v3, not yet approved) ...")
    comp3 = compose_sunny_parade_preview()
    results.append(process(comp3, PREVIEW_DIR, "sunny_parade_preview_v3"))

    with open(os.path.join(OUT_DIR, "music_metadata_v3.json"), "w", encoding="utf-8") as f:
        json.dump({"generated_by": "scripts/generate_music_v3.py", "tracks": results}, f, indent=2)

    print("\nDone.")
    for r in results:
        print(f"  {r['name']}: {r['duration']}s")


if __name__ == "__main__":
    main()
