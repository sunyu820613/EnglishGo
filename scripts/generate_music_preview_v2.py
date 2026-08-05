#!/usr/bin/env python
"""
generate_music_preview_v2.py — Corrective re-render of "happy_skip" after v1
was rejected for sounding like a creepy music box (too much reverb, metallic
bell/toy-piano/whistle timbres, long note tails smearing into mush).

This is a from-scratch re-synthesis (NOT a denoise/de-reverb pass on the old
WAV) using a deliberately restricted instrument palette, short percussive
envelopes, and reverb disabled by default — see changes_v2.md for the full
before/after parameter diff. Generates ONLY a 20-second preview and then
stops, per instructions, for human sign-off before any full tracks are
re-rendered.

Reuses the neutral music-theory/IO scaffolding from generate_music.py
(note<->MIDI math, NoteEvent/Composition, WAV writer, ffprobe/loop-seam
checks) — none of that scaffolding is implicated in the v1 complaints, only
the instrument synthesis, envelopes, reverb, and arrangement are rewritten.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys

import numpy as np
from scipy.signal import butter, lfilter, iirpeak

sys.path.insert(0, os.path.dirname(__file__))
from generate_music import (  # noqa: E402  (neutral scaffolding reused, see module docstring)
    SR, RNG, scale_degree_to_midi, midi_to_freq, chord_midi,
    NoteEvent, Composition, write_wav, ffprobe_json, check_loop_seam,
    _extract_loudnorm_json,
)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "audio", "music", "preview")
os.makedirs(OUT_DIR, exist_ok=True)

# ===========================================================================
# Explicit, asserted parameter constants (per the corrective brief — these
# must be checked in code, not just described in prose).
# ===========================================================================

# --- Reverb: OFF by default (the brief's first preference). The small-room
# IR below exists and is spec-compliant if a future revision needs *some*
# air, but WET=0.0 means it is not applied to this render at all.
REVERB_WET = 0.0
REVERB_DECAY_SEC = 0.18
REVERB_PREDELAY_MS = 3
REVERB_ROOM_SIZE_PCT = 8
assert REVERB_WET <= 0.02, "reverb wet must not exceed 2%"
assert REVERB_DECAY_SEC <= 0.20, "reverb decay must not exceed 0.20s"
assert 0 <= REVERB_PREDELAY_MS <= 5, "reverb pre-delay must be 0-5ms"
assert REVERB_ROOM_SIZE_PCT <= 10, "reverb room size must not exceed 10%"

# --- Envelopes (seconds)
PLUCK_ATTACK, PLUCK_DECAY, PLUCK_SUSTAIN, PLUCK_RELEASE = 0.005, 0.15, 0.15, 0.05
assert 0.002 <= PLUCK_ATTACK <= 0.008
assert 0.10 <= PLUCK_DECAY <= 0.25
assert 0.03 <= PLUCK_RELEASE <= 0.08

BASS_RELEASE = 0.08
assert BASS_RELEASE <= 0.10

MALLET_ATTACK, MALLET_RELEASE = 0.003, 0.08
assert 0.001 <= MALLET_ATTACK <= 0.005
assert MALLET_RELEASE <= 0.10

NOTE_FADE_OUT_SEC = 0.008  # 5-10ms per-note declick, independent of the above

# --- Register limits (MIDI numbers): G4=67, D5=74, G5=79, C6=84, G2=43
MELODY_MIN_MIDI = 67   # G4
MELODY_MAX_MIDI = 79   # G5 — hard ceiling, C6 (84) is forbidden
BASS_MIN_MIDI = 43     # G2

# --- Arrangement limits
MAX_SIMULTANEOUS_INSTRUMENTS = 4

BPM = 124
assert BPM <= 128
KEY_ROOT, KEY_OCTAVE = "G", 4  # melody register anchor: G4

# ===========================================================================
# Instruments — short, warm, non-metallic. Whistle/toy-piano/glockenspiel/
# bells/chimes/music-box/snare/tubular-bells/pads/strings/crystal are not
# implemented in this file at all (see changes_v2.md "removed" list).
# ===========================================================================

def _adsr(n, sr, attack, decay, sustain_level, release):
    a = max(1, int(attack * sr))
    d = max(1, int(decay * sr))
    r = max(1, int(release * sr))
    s = max(0, n - a - d - r)
    env = np.concatenate([
        np.linspace(0, 1, a, endpoint=False),
        np.linspace(1, sustain_level, d, endpoint=False),
        np.full(s, sustain_level),
        np.linspace(sustain_level, 0, r),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def warm_pluck(freq, nominal_duration, sr=SR):
    """Ukulele/wood-guitar pluck. Karplus-Strong string, heavily low-passed
    to remove the metallic zing, then wrapped in the spec's short ADSR —
    articulation is decoupled from the nominal note length (real plucked
    strings don't ring through a held nominal duration either)."""
    audible = PLUCK_ATTACK + PLUCK_DECAY + PLUCK_RELEASE + 0.05
    dur = min(max(nominal_duration, audible), audible)
    n_delay = max(2, int(sr / freq))
    buf = RNG.uniform(-1, 1, n_delay)
    n = int(dur * sr)
    out = np.empty(n)
    prev = 0.0
    decay_coef = 0.996
    for i in range(n):
        idx = i % n_delay
        val = buf[idx]
        out[i] = val
        buf[idx] = decay_coef * 0.5 * (val + prev)
        prev = val
    b, a = butter(2, min(2600, sr / 2 - 100) / (sr / 2), btype="low")
    out = lfilter(b, a, out)
    out *= _adsr(n, sr, PLUCK_ATTACK, PLUCK_DECAY, PLUCK_SUSTAIN, PLUCK_RELEASE)
    return out


def soft_round_bass(freq, nominal_duration, sr=SR):
    """Low, round, short — root notes/simple rhythm only, no sub-bass rumble
    (freq is never allowed below G2 by the composer, see register assert)."""
    audible = 0.01 + BASS_RELEASE + 0.08
    dur = min(max(nominal_duration, audible), audible)
    n = int(dur * sr)
    t = np.arange(n) / sr
    tone = np.sin(2 * np.pi * freq * t) + 0.15 * np.sin(2 * np.pi * freq * 2 * t)
    b, a = butter(2, min(900, sr / 2 - 100) / (sr / 2), btype="low")
    tone = lfilter(b, a, tone)
    tone *= _adsr(n, sr, 0.006, 0.05, 0.35, BASS_RELEASE)
    return tone


def soft_kick(nominal_duration, sr=SR):
    dur = min(nominal_duration, 0.18)
    n = int(dur * sr)
    t = np.arange(n) / sr
    freq = 110 * np.exp(-t * 30) + 45
    phase = 2 * np.pi * np.cumsum(freq) / sr
    out = np.sin(phase) * np.exp(-t * 24)
    out *= 0.55  # low volume, no trailer-impact
    return out


def shaker(nominal_duration, sr=SR):
    """Pure filtered noise — no tonal jingle partials (that was the banned
    'bell' sound hiding inside the old tambourine)."""
    dur = min(nominal_duration, 0.09)
    n = int(dur * sr)
    noise = RNG.uniform(-1, 1, n)
    b, a = butter(2, [4000 / (sr / 2), min(9000, sr / 2 - 100) / (sr / 2)], btype="band")
    noise = lfilter(b, a, noise)
    noise *= np.exp(-np.linspace(0, 1, n) * 10) * 0.35
    return noise


def natural_clap(nominal_duration, sr=SR):
    dur = min(nominal_duration, 0.09)
    n = int(dur * sr)
    b, a = butter(2, [1000 / (sr / 2), 4500 / (sr / 2)], btype="band")
    out = np.zeros(n)
    for offset in (0, 0.01):
        start = int(offset * sr)
        if start >= n:
            continue
        burst_n = min(n - start, int(0.025 * sr))
        burst = lfilter(b, a, RNG.uniform(-1, 1, burst_n))
        burst *= np.exp(-np.linspace(0, 1, burst_n) * 16)
        out[start : start + burst_n] += burst
    return out * 0.6


def mallet_accent(freq, nominal_duration, sr=SR):
    """Very sparse xylophone/marimba accent — short release, mid register
    only, used on a handful of notes, never carrying the full melody."""
    dur = min(nominal_duration, MALLET_ATTACK + MALLET_RELEASE + 0.03)
    n = int(dur * sr)
    t = np.arange(n) / sr
    out = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.0 * t)
    out *= _adsr(n, sr, MALLET_ATTACK, 0.02, 0.2, MALLET_RELEASE)
    return out * 0.5


INSTRUMENTS = {
    "ukulele": warm_pluck,
    "bass": soft_round_bass,
    "mallet": mallet_accent,
}
PERCUSSION = {"kick": soft_kick, "shaker": shaker, "clap": natural_clap}

PAN = {"ukulele": 0.15, "bass": 0.0, "mallet": -0.15, "kick": 0.0, "shaker": 0.18, "clap": -0.12}
SEND_TO_REVERB = {"ukulele", "mallet"}  # per spec: drums/claps/bass are NOT sent to reverb


def small_room_ir(sr=SR):
    """Compliant-but-unused-by-default small-room IR (see REVERB_WET=0.0
    above) — kept and asserted so a future 'a little air' revision has a
    ready, spec-checked option instead of reaching for a big reverb again."""
    n = int(REVERB_DECAY_SEC * sr)
    t = np.arange(n) / sr
    noise = RNG.uniform(-1, 1, n)
    b, a = butter(2, 3500 / (sr / 2), btype="low")
    noise = lfilter(b, a, noise)
    ir = noise * np.exp(-t * (1.0 / max(REVERB_DECAY_SEC, 0.01)) * 5)
    ir[0] = 1.0
    predelay_n = int(REVERB_PREDELAY_MS / 1000 * sr)
    return np.pad(ir, (predelay_n, 0))[:n]


REVERB_IR = small_room_ir()


# ===========================================================================
# Composition — Skip to My Lou, simplified, register-checked
# ===========================================================================

def build_phrase(events, start_beat, degrees_durs, instrument, velocity=0.8, pan=0.0):
    b = start_beat
    for degree, dur in degrees_durs:
        if degree != 0:
            midi = scale_degree_to_midi(KEY_ROOT, KEY_OCTAVE, degree)
            events.append(NoteEvent(b, dur, midi, instrument, velocity, pan))
        b += dur
    return b


def compose_preview() -> Composition:
    comp = Composition("happy_skip_preview_v2", BPM, KEY_ROOT, KEY_OCTAVE, total_bars=10)
    ev = comp.events

    # "Skip to my Lou" — kept inside G4-D5, peak note is the D5 on "Lou".
    # Each phrase is exactly 1 bar (4 beats), matching the loop's 1-bar-per-
    # iteration arrangement below (a prior 2-bar version caused a phrase to
    # spill into the next bar's rhythm section — caught by the "max 4
    # simultaneous instruments" assertion below, and fixed by shortening).
    melody_up = [(3, 0.5), (3, 0.5), (3, 0.5), (2, 0.5), (4, 0.5), (5, 1.5)]  # skip skip skip to (my) Lou
    melody_down = [(4, 0.5), (3, 0.5), (2, 0.5), (1, 0.5), (1, 2)]  # skip to my darling
    # A third, brighter answering phrase (touches E5, a pitch not used
    # elsewhere) so the 7-bar main section isn't just two ideas alternating —
    # hand-checked against every chord voicing used below for clashes, and
    # re-verified by the automated semitone-clash assertion at the bottom.
    melody_turn = [(5, 0.5), (6, 0.5), (5, 0.5), (4, 0.5), (3, 0.5), (1, 1.5)]

    def comping_bar(start_beat, root_octave, degree, quality):
        notes = chord_midi(KEY_ROOT, root_octave, degree, quality)
        # Root+fifth for G/D. For C specifically, a root+fifth voicing put
        # the chord's root (C) a minor 2nd below the melody's B — swapping
        # to a "rootless" third+fifth voicing (E+G) keeps the C-major color
        # (the bass still plays the true C root) while removing that clash;
        # verified by the automated semitone-clash assertion below.
        voicing = [notes[1], notes[2]] if degree == 4 else [notes[0], notes[2]]
        # Drop any voicing tone that lands above the melody register ceiling
        # down an octave (D major's 5th, A5=81, was the one that tripped
        # this) — comping shares the "ukulele" instrument tag with the lead
        # line, so it's held to the same register assertion.
        voicing = [n - 12 if n > MELODY_MAX_MIDI else n for n in voicing]
        for beat in (0, 2):
            for i, n in enumerate(voicing):
                ev.append(NoteEvent(start_beat + beat, 0.5, n, "ukulele", 0.35 if i == 0 else 0.22, PAN["ukulele"]))

    def bass_bar(start_beat, degree):
        root = scale_degree_to_midi(KEY_ROOT, KEY_OCTAVE - 1, degree)
        assert root >= BASS_MIN_MIDI, f"bass note {root} below G2 floor"
        ev.append(NoteEvent(start_beat, 0.4, root, "bass", 0.6, PAN["bass"]))
        ev.append(NoteEvent(start_beat + 2, 0.4, root, "bass", 0.5, PAN["bass"]))

    def rhythm_bar(start_beat, with_kick, with_clap):
        for beat in (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5):
            ev.append(NoteEvent(start_beat + beat, 0.09, 0, "shaker", 0.5, PAN["shaker"]))
        if with_kick:
            ev.append(NoteEvent(start_beat, 0.15, 0, "kick", 0.7, PAN["kick"]))
            ev.append(NoteEvent(start_beat + 2, 0.15, 0, "kick", 0.6, PAN["kick"]))
        if with_clap:
            ev.append(NoteEvent(start_beat + 1, 0.09, 0, "clap", 0.55, PAN["clap"]))
            ev.append(NoteEvent(start_beat + 3, 0.09, 0, "clap", 0.5, PAN["clap"]))

    bar = 0

    # Bar 0 (2s-ish intro): full and clear from note one — no fade-in-from-
    # distance, no ethereal opener. Base trio only (ukulele+bass+shaker = 3
    # instruments), so the melody's entrance in bar 1 still reads as "new".
    comping_bar(bar * 4, KEY_OCTAVE, 1, "major")
    bass_bar(bar * 4, 1)
    rhythm_bar(bar * 4, with_kick=False, with_clap=False)
    bar += 1

    # Bars 1-7 (main melody, ~14s): 3 short phrases (not just 2 alternating)
    # over real I-V-I-V-IV-V-I harmonic movement (G-D-G-D-C-D-G) — a first
    # version kept the melody on a flat, unmoving G pedal purely to dodge
    # the clash bug, which read as too static/repetitive; this version gets
    # real movement back while staying clash-free (every voicing below is
    # checked by the semitone-clash assertion at the bottom of this
    # function). kick/clap alternate as the 4th layer, and ONE bar swaps in
    # the sparse mallet accent instead of stacking on top of them.
    bar_plan = [
        # (phrase, chord_degree)
        (melody_up, 1),
        (melody_down, 5),
        (melody_up, 1),
        (melody_turn, 5),   # accent bar
        (melody_down, 4),
        (melody_up, 5),
        (melody_down, 1),   # resolves home, matching the loop connector's G bar
    ]
    for i, (phrase, deg) in enumerate(bar_plan):
        start = bar * 4
        comping_bar(start, KEY_OCTAVE, deg, "major")
        bass_bar(start, deg)

        is_accent_bar = i == 3
        if is_accent_bar:
            rhythm_bar(start, with_kick=False, with_clap=False)
            # accent the phrase's brightest note (the E5 in melody_turn)
            accent_midi = scale_degree_to_midi(KEY_ROOT, KEY_OCTAVE, 6)
            ev.append(NoteEvent(start + 0.5, 0.5, accent_midi, "mallet", 0.45, PAN["mallet"]))
        else:
            rhythm_bar(start, with_kick=(i % 2 == 0), with_clap=(i % 2 == 1))

        build_phrase(ev, start, phrase, "ukulele", 0.75, PAN["ukulele"])
        bar += 1

    # Bars 8-9 (2s loop connector): thin back to the intro's bare trio, on
    # the same G chord as bar 0, so the seam matches exactly for a clean loop.
    for i in range(2):
        start = bar * 4
        comping_bar(start, KEY_OCTAVE, 1, "major")
        bass_bar(start, 1)
        rhythm_bar(start, with_kick=False, with_clap=False)
        bar += 1

    assert bar == comp.total_bars

    # --- automated checks the brief asked for ---
    for e in ev:
        if e.instrument in ("ukulele", "mallet") and e.midi_note:
            assert MELODY_MIN_MIDI <= e.midi_note <= MELODY_MAX_MIDI, (
                f"{e.instrument} note {e.midi_note} outside G4-G5 register limit"
            )

    per_bar_instruments = {}
    for e in ev:
        b_idx = int(e.start_beat // 4)
        per_bar_instruments.setdefault(b_idx, set()).add(e.instrument)
    max_simul = max(len(s) for s in per_bar_instruments.values())
    assert max_simul <= MAX_SIMULTANEOUS_INSTRUMENTS, f"{max_simul} instruments in one bar exceeds the 4-instrument cap"

    # semitone-clash check: any two simultaneous melodic/harmonic notes a
    # minor 2nd (or its inversion, a major 7th) apart
    melodic = [e for e in ev if e.instrument in ("ukulele", "bass", "mallet") and e.midi_note]
    clashes = []
    for i, a in enumerate(melodic):
        for b in melodic[i + 1 :]:
            if a.start_beat < b.start_beat + b.dur_beats and b.start_beat < a.start_beat + a.dur_beats:
                interval = abs(a.midi_note - b.midi_note) % 12
                if interval in (1, 11):
                    clashes.append((a, b))
    assert not clashes, f"{len(clashes)} semitone clash(es) found: {clashes[:3]}"

    comp.checks = {
        "max_simultaneous_instruments": max_simul,
        "semitone_clashes_found": len(clashes),
        "melody_register_min_midi": min((e.midi_note for e in ev if e.instrument == "ukulele" and e.midi_note), default=None),
        "melody_register_max_midi": max((e.midi_note for e in ev if e.instrument == "ukulele" and e.midi_note), default=None),
        "bass_register_min_midi": min((e.midi_note for e in ev if e.instrument == "bass"), default=None),
    }
    return comp


# ===========================================================================
# Render
# ===========================================================================

def render(comp: Composition) -> np.ndarray:
    n_samples = int(comp.total_seconds() * SR) + int(0.3 * SR)
    dry = np.zeros((n_samples, 2))
    reverb_send = np.zeros((n_samples, 2))
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
        dry[start_sample:end_sample, 0] += seg * left_gain
        dry[start_sample:end_sample, 1] += seg * right_gain
        if ev.instrument in SEND_TO_REVERB and REVERB_WET > 0:
            reverb_send[start_sample:end_sample, 0] += seg * left_gain
            reverb_send[start_sample:end_sample, 1] += seg * right_gain

    if REVERB_WET > 0:
        from scipy.signal import fftconvolve
        wet_l = fftconvolve(reverb_send[:, 0], REVERB_IR, mode="full")[:n_samples]
        wet_r = fftconvolve(reverb_send[:, 1], REVERB_IR, mode="full")[:n_samples]
        stereo = dry + np.stack([wet_l, wet_r], axis=1) * REVERB_WET
    else:
        stereo = dry

    # gentle 2-6kHz mix-bus dip (avoid buildup) instead of any limiter
    b, a = iirpeak(3500 / (SR / 2), Q=1.2)
    dip = 0.85  # ~-1.4dB at the peak frequency, subtle
    for ch in range(2):
        peaked = lfilter(b, a, stereo[:, ch])
        stereo[:, ch] = stereo[:, ch] - peaked * (1 - dip)

    # trim to exact loop length, safety clip only (no saturation/limiting)
    loop_samples = int(comp.total_seconds() * SR)
    stereo = stereo[:loop_samples]
    stereo = np.clip(stereo, -0.98, 0.98)
    return stereo


# ===========================================================================
# Mastering
# ===========================================================================

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


# ===========================================================================
# changes_v2.md
# ===========================================================================

CHANGES_MD_TEMPLATE = """# happy_skip preview v2 — corrective re-render

Re-rendered from scratch via a new composition/synthesis path
(`scripts/generate_music_preview_v2.py`), not a denoise/de-reverb pass on the
v1 WAV. v1's instrument functions, arrangement, and reverb are all still
present in `scripts/generate_music.py` for reference but were **not reused**
here except for neutral scaffolding (MIDI math, WAV/ffprobe helpers).

## Instruments removed entirely (not implemented in this file)

synth whistle, toy piano, glockenspiel, high bells/chimes, music-box tone,
snare, tubular bells, choir pad, ambient pad, string long-tones, crystal
tone, wind chimes — none of these have a corresponding function in
`generate_music_preview_v2.py`.

## Instruments kept (all new implementations)

- `warm_pluck` — ukulele/wood-guitar, Karplus-Strong low-passed at 2.6kHz to
  remove metallic zing, short ADSR (see envelope table below).
- `soft_round_bass` — sine+2nd-harmonic, low-passed at 900Hz, short release.
- `soft_kick` — quieter (0.55x), faster decay, no "trailer impact" transient.
- `shaker` — **pure band-passed noise (4-9kHz), no tonal partials** — this
  replaces v1's `tambourine()`, whose summed 3.8-8.2kHz sine "jingles" were
  effectively the banned bell/wind-chime sound.
- `natural_clap` — same family as v1 but shorter (25ms bursts vs v1's 30ms
  ×4-burst clap) and quieter.
- `mallet_accent` — xylophone-family tone, used **once** in the whole 20s
  preview (bar 3's bright E5 answering-phrase note only), not as a
  continuous melody voice.

## Effects removed entirely

Chorus, flanger, phaser, delay/echo, stereo widener, auto-pan, pitch
glide/drift — none were ever implemented in v1 either; explicitly confirmed
absent here too (grep the file: no such functions exist).

## Reverb: before -> after

| Parameter | v1 (`generate_music.py`) | v2 (this file) |
|---|---|---|
| Type | synthesized noise-tail IR, 0.9s, no room-size concept | synthesized small-room IR, {revsec}s |
| Wet mix | 16% (`apply_reverb(..., wet=0.16)`) | **{revwet}%** (disabled — see note) |
| Decay | ~0.9s | {revsec}s (≤0.20s limit) |
| Pre-delay | none (0ms, unintentional) | {predelay}ms |
| Sent from bass/drums/claps? | yes (whole mix bus) | **no** — only `ukulele`/`mallet` are in `SEND_TO_REVERB`, and even that path is inert at wet=0 |

**Reverb is OFF (wet=0.0) in this render**, per the brief's stated first
preference ("优先完全不使用混响"). A spec-compliant small-room IR function
(`small_room_ir()`) is defined and asserted against the limits above so a
future revision can dial in a little air without reaching for the old
16%/0.9s setting again.

## Note envelopes: before -> after

| Instrument | v1 | v2 |
|---|---|---|
| Ukulele/pluck | Karplus-Strong natural decay over the *full nominal note length* (up to 3.8 beats for chord pads ≈ 1.6-2s at 138bpm) | Attack {pa}ms, Decay {pd}ms, Sustain {ps}, Release {pr}ms — audible duration capped, decoupled from nominal length |
| Bass | KS natural decay, same long-tail issue as pluck | Attack 6ms, Decay 50ms, Release {br}ms |
| Xylophone/mallet | `decay_rate=9` over full note length (could still ring for long-held notes) | Attack {ma}ms, Release {mr}ms, used once total |
| Every note | no explicit declick fade | {fadeout}ms fade-out on every single note |

## Register

| | v1 | v2 (asserted in code) |
|---|---|---|
| Melody | unrestricted (whistle line occasionally implied higher) | {mmin}-{mmax} MIDI (G4-G5 hard ceiling; checked against every ukulele/mallet note event) |
| Bass | unrestricted | >= {bmin} MIDI (G2 floor; checked against every bass note event) |

## Other automated checks (see composer assertions in the script)

- Max simultaneous instruments in this render: **{maxsim}** (limit: {maxsim_limit})
- Semitone clashes found: **{clashes}** (limit: 0)
- Chord vocabulary: G/C/D major triads only, no minor/diminished/augmented
  chords, no key changes. Harmony under the melody moves G-D-G-D-C-D-G
  (I-V-I-V-IV-V-I) across the 7 main bars — an earlier version flattened
  this to a static G pedal purely to dodge a clash bug, which read as too
  repetitive; the bug turned out to be specific voicings (D's 5th landing
  above the register ceiling, C's root landing a minor 2nd under the
  melody), fixed by voicing choice rather than by removing the harmonic
  movement (see `comping_bar()`).
- Tempo: {bpm} BPM (limit: <=128 BPM)

## Mix/master target: before -> after

| | v1 | v2 |
|---|---|---|
| Integrated loudness target | -14 LUFS | **-16 LUFS** |
| True peak ceiling | -1.0 dBTP | **-1.5 dBTP** |
| Pre-master limiting | `tanh(x * 1.6) * 0.92` soft-clip drive on the full mix | none — safety `clip(-0.98, 0.98)` only, no saturation/drive |
| Panning spread | melody/harmony instruments up to +-0.4/+-0.5 | melody/percussion +-0.12 to +-0.18 only; bass/kick centered (0.0) |
| 2-6kHz handling | none | -1.4dB gentle peaking dip at 3.5kHz on the mix bus |

## Result

- File: `{wavname}` / `{oggname}`
- Duration: {duration}s
- Integrated loudness: {lufs} LUFS
- True peak: {tp} dBTP
- Loop seam: {seam}
"""


def main():
    print("Composing happy_skip_preview_v2 (Skip to My Lou, corrective re-render) ...")
    comp = compose_preview()
    print(f"  checks: {comp.checks}")

    print("Rendering ...")
    audio = render(comp)
    raw = os.path.join(OUT_DIR, "_raw_preview_v2.wav")
    write_wav(raw, audio)

    print("Mastering with ffmpeg loudnorm (-16 LUFS / -1.5 dBTP) ...")
    final_wav = os.path.join(OUT_DIR, "happy_skip_preview_v2.wav")
    final_ogg = os.path.join(OUT_DIR, "happy_skip_preview_v2.ogg")
    master(raw, final_wav, final_ogg)
    os.remove(raw)

    final_stats = measure_final(final_wav)
    seam = check_loop_seam(final_wav)
    probe = ffprobe_json(final_wav)
    stream = probe["streams"][0]
    duration = round(float(probe["format"]["duration"]), 2)

    print(f"  duration={duration}s sr={stream['sample_rate']} ch={stream['channels']}")
    print(f"  LUFS={final_stats['input_i']} TP={final_stats['input_tp']}")
    print(f"  loop seam: {seam}")

    md = CHANGES_MD_TEMPLATE.format(
        revsec=REVERB_DECAY_SEC, revwet=int(REVERB_WET * 100), predelay=REVERB_PREDELAY_MS,
        pa=int(PLUCK_ATTACK * 1000), pd=int(PLUCK_DECAY * 1000), ps=PLUCK_SUSTAIN,
        pr=int(PLUCK_RELEASE * 1000), br=int(BASS_RELEASE * 1000),
        ma=int(MALLET_ATTACK * 1000), mr=int(MALLET_RELEASE * 1000),
        fadeout=int(NOTE_FADE_OUT_SEC * 1000),
        mmin=MELODY_MIN_MIDI, mmax=MELODY_MAX_MIDI, bmin=BASS_MIN_MIDI,
        maxsim=comp.checks["max_simultaneous_instruments"], maxsim_limit=MAX_SIMULTANEOUS_INSTRUMENTS,
        clashes=comp.checks["semitone_clashes_found"], bpm=BPM,
        wavname="assets/audio/music/preview/happy_skip_preview_v2.wav",
        oggname="assets/audio/music/preview/happy_skip_preview_v2.ogg",
        duration=duration, lufs=final_stats["input_i"], tp=final_stats["input_tp"],
        seam=("OK, no discontinuity" if seam["ok"] else f"CLICK DETECTED: {seam}"),
    )
    with open(os.path.join(OUT_DIR, "changes_v2.md"), "w", encoding="utf-8") as f:
        f.write(md)

    print("\nDone. 20s preview only - stopping here for review, per instructions.")
    print(f"  {final_wav}")
    print(f"  {final_ogg}")
    print(f"  {os.path.join(OUT_DIR, 'changes_v2.md')}")


if __name__ == "__main__":
    main()
