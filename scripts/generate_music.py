#!/usr/bin/env python
"""
generate_music.py — Procedurally synthesizes 3 original children's background
music tracks for EnglishGo, adapted from public-domain American folk melodies
(Skip to My Lou, Pop Goes the Weasel, Yankee Doodle).

Everything audible is generated in this file from first principles with
numpy/scipy: plucked-string (Karplus-Strong), mallet/bell instruments
(additive synthesis with inharmonic partials), drum/percussion (filtered
noise + envelopes), and a whistle lead (sine + vibrato + breath noise). No
samples, loops, soundfonts, or third-party recordings are used anywhere.

Pipeline per track:
  1. Compose melody/chords/bass/drums as note-event lists (also exported as
     a MIDI "source" file via mido, for reference/documentation).
  2. Render every note with the from-scratch synth functions into a stereo
     float buffer, mixed with a synthesized (not sampled) reverb.
  3. Write a raw intermediate WAV, then hand off to ffmpeg's two-pass
     `loudnorm` filter for broadcast-style mastering to ~-14 LUFS / -1 dBTP,
     producing the final WAV (44.1kHz/16-bit/stereo) and OGG (q6).
  4. Check the loop seam (last vs. first samples) for discontinuities.

Run: python scripts/generate_music.py
"""

from __future__ import annotations

import json
import math
import os
import struct
import subprocess
import wave
from dataclasses import dataclass, field

import numpy as np
from scipy.signal import fftconvolve, butter, lfilter

import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage, bpm2tempo

SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT_DIR = os.path.join(ROOT, "assets", "audio", "music")
SRC_DIR = os.path.join(OUT_DIR, "source")
TMP_DIR = os.path.join(OUT_DIR, "_tmp")
os.makedirs(SRC_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

RNG = np.random.default_rng(20260804)  # fixed seed: reproducible builds

# ---------------------------------------------------------------------------
# Music theory helpers
# ---------------------------------------------------------------------------

NOTE_NAMES = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
    "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11,
}
MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]  # scale degree -> semitone offset


def note_to_midi(name: str, octave: int) -> int:
    return 12 * (octave + 1) + NOTE_NAMES[name]


def midi_to_freq(m: float) -> float:
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def scale_degree_to_midi(root_name: str, root_octave: int, degree: int) -> int:
    """degree is 1-based; degrees beyond 7 (e.g. 9) go into the next octave;
    degree 0 or negative go into the previous octave."""
    root_midi = note_to_midi(root_name, root_octave)
    idx = degree - 1
    octave_shift, step_idx = divmod(idx, 7)
    return root_midi + 12 * octave_shift + MAJOR_STEPS[step_idx]


def chord_midi(root_name: str, root_octave: int, degree: int, quality="major") -> list[int]:
    """Triad built on the given scale degree of the major scale."""
    root = scale_degree_to_midi(root_name, root_octave, degree)
    if quality == "major":
        return [root, root + 4, root + 7]
    if quality == "minor":
        return [root, root + 3, root + 7]
    return [root]


# ---------------------------------------------------------------------------
# From-scratch instrument synthesis (numpy/scipy only, no samples)
# ---------------------------------------------------------------------------

def _env_adsr(n, sr, attack, decay, sustain_level, release):
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


def karplus_strong(freq, duration, sr=SR, decay=0.9965, seed=None):
    """Plucked string (ukulele/bass) via the classic Karplus-Strong algorithm."""
    n_delay = max(2, int(sr / freq))
    rng = np.random.default_rng(seed) if seed is not None else RNG
    buf = rng.uniform(-1, 1, n_delay)
    n_out = int(duration * sr) + n_delay
    out = np.empty(n_out)
    prev = 0.0
    for i in range(n_out):
        idx = i % n_delay
        val = buf[idx]
        out[i] = val
        buf[idx] = decay * 0.5 * (val + prev)
        prev = val
    out = out[:int(duration * sr)]
    env = np.exp(-np.linspace(0, 1, len(out)) * 1.2)
    return out * env


def pluck_ukulele(freq, duration, sr=SR, brightness=1.0):
    body = karplus_strong(freq, duration, sr, decay=0.9955)
    # a touch of the octave-up harmonic layered in for ukulele "chime"
    harm = karplus_strong(freq * 2, duration * 0.6, sr, decay=0.992) * 0.25 * brightness
    harm = np.pad(harm, (0, max(0, len(body) - len(harm))))[: len(body)]
    return body + harm


def pluck_bass(freq, duration, sr=SR):
    return karplus_strong(freq, duration, sr, decay=0.9975) * 1.3


def mallet_tone(freq, duration, sr=SR, partial_ratios=(1.0, 2.76, 5.4), partial_gains=(1.0, 0.35, 0.12), decay_rate=9.0):
    """Xylophone-style bar tone: inharmonic partials, fast exponential decay."""
    n = int(duration * sr)
    t = np.arange(n) / sr
    out = np.zeros(n)
    for ratio, gain in zip(partial_ratios, partial_gains):
        out += gain * np.sin(2 * np.pi * freq * ratio * t)
    out *= np.exp(-decay_rate * t)
    # short noisy click on attack (mallet strike)
    click_n = min(n, int(0.006 * sr))
    click = RNG.uniform(-1, 1, click_n) * np.exp(-np.linspace(0, 1, click_n) * 8)
    out[:click_n] += click * 0.2
    return out


def toy_piano_tone(freq, duration, sr=SR):
    """Bright, slightly metallic/detuned tone with a hammer-click attack."""
    n = int(duration * sr)
    t = np.arange(n) / sr
    detune = 1.006
    out = (
        0.6 * np.sin(2 * np.pi * freq * t)
        + 0.3 * np.sin(2 * np.pi * freq * detune * t)
        + 0.15 * np.sin(2 * np.pi * freq * 3.0 * t)
        + 0.08 * np.sin(2 * np.pi * freq * 4.2 * t)
    )
    out *= np.exp(-6.0 * t)
    click_n = min(n, int(0.004 * sr))
    out[:click_n] += RNG.uniform(-1, 1, click_n) * 0.25
    return out


def whistle_lead(freq, duration, sr=SR, vibrato_rate=5.0, vibrato_depth=0.012, breath=0.05):
    n = int(duration * sr)
    t = np.arange(n) / sr
    vibrato = 1.0 + vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
    tone = np.sin(2 * np.pi * freq * vibrato * t)
    tone += 0.06 * np.sin(2 * np.pi * freq * 2 * vibrato * t)
    noise = RNG.uniform(-1, 1, n)
    b, a = butter(2, 2000 / (sr / 2), btype="high")
    noise = lfilter(b, a, noise) * breath
    out = tone + noise
    out *= _env_adsr(n, sr, attack=0.02, decay=0.05, sustain_level=0.85, release=0.05)
    return out


def kick(duration, sr=SR):
    n = int(duration * sr)
    t = np.arange(n) / sr
    freq = 150 * np.exp(-t * 28) + 45
    phase = 2 * np.pi * np.cumsum(freq) / sr
    out = np.sin(phase) * np.exp(-t * 16)
    click_n = min(n, int(0.003 * sr))
    out[:click_n] += RNG.uniform(-1, 1, click_n) * 0.5
    return out


def snare(duration, sr=SR):
    n = int(duration * sr)
    t = np.arange(n) / sr
    noise = RNG.uniform(-1, 1, n)
    b, a = butter(2, [1500 / (sr / 2), 8000 / (sr / 2)], btype="band")
    noise = lfilter(b, a, noise) * np.exp(-t * 22)
    tone = 0.35 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return noise * 0.8 + tone


def clap(duration, sr=SR):
    n = int(duration * sr)
    out = np.zeros(n)
    b, a = butter(2, [900 / (sr / 2), 6000 / (sr / 2)], btype="band")
    for offset in (0, 0.008, 0.016, 0.028):
        start = int(offset * sr)
        if start >= n:
            continue
        burst_n = min(n - start, int(0.03 * sr))
        burst = RNG.uniform(-1, 1, burst_n)
        burst = lfilter(b, a, burst)
        burst *= np.exp(-np.linspace(0, 1, burst_n) * 18)
        out[start : start + burst_n] += burst
    return out * 0.9


def tambourine(duration, sr=SR):
    n = int(duration * sr)
    t = np.arange(n) / sr
    noise = RNG.uniform(-1, 1, n)
    b, a = butter(2, 5500 / (sr / 2), btype="high")
    noise = lfilter(b, a, noise)
    jingles = np.zeros(n)
    for f in (3800, 5200, 6600, 8200):
        jingles += 0.15 * np.sin(2 * np.pi * f * t)
    out = (noise * 0.6 + jingles) * np.exp(-t * 14)
    return out


def handdrum(duration, sr=SR):
    """Light hand-drum / frame-drum hit used in sunny_parade in place of a kit kick."""
    n = int(duration * sr)
    t = np.arange(n) / sr
    freq = 220 * np.exp(-t * 20) + 90
    phase = 2 * np.pi * np.cumsum(freq) / sr
    tone = np.sin(phase) * np.exp(-t * 18)
    noise = RNG.uniform(-1, 1, n) * np.exp(-t * 40) * 0.15
    return tone + noise


# ---------------------------------------------------------------------------
# Synthetic reverb (no impulse-response samples — generated noise-tail IR)
# ---------------------------------------------------------------------------

def synth_reverb_ir(duration=0.9, sr=SR, seed=7):
    rng = np.random.default_rng(seed)
    n = int(duration * sr)
    t = np.arange(n) / sr
    noise = rng.uniform(-1, 1, n)
    b, a = butter(2, 6000 / (sr / 2), btype="low")
    noise = lfilter(b, a, noise)
    ir = noise * np.exp(-t * 4.5)
    ir[0] = 1.0  # dry spike so convolution preserves the direct sound level
    return ir


REVERB_IR = synth_reverb_ir()


def apply_reverb(buf_stereo, wet=0.16):
    l = fftconvolve(buf_stereo[:, 0], REVERB_IR, mode="full")[: len(buf_stereo)]
    r = fftconvolve(buf_stereo[:, 1], REVERB_IR, mode="full")[: len(buf_stereo)]
    wet_stereo = np.stack([l, r], axis=1)
    return buf_stereo * (1 - wet) + wet_stereo * wet


# ---------------------------------------------------------------------------
# Sequencing
# ---------------------------------------------------------------------------

@dataclass
class NoteEvent:
    start_beat: float
    dur_beats: float
    midi_note: int
    instrument: str
    velocity: float = 0.85
    pan: float = 0.0


@dataclass
class Composition:
    name: str
    bpm: int
    key_root: str
    key_octave: int
    total_bars: int
    events: list = field(default_factory=list)

    def sec_per_beat(self):
        return 60.0 / self.bpm

    def total_beats(self):
        return self.total_bars * 4

    def total_seconds(self):
        return self.total_beats() * self.sec_per_beat()


INSTRUMENTS = {
    "ukulele": (pluck_ukulele, dict()),
    "bass": (pluck_bass, dict()),
    "xylophone": (mallet_tone, dict()),
    "toy_piano": (toy_piano_tone, dict()),
    "whistle": (whistle_lead, dict()),
}
PERCUSSION = {
    "kick": kick,
    "snare": snare,
    "clap": clap,
    "tambourine": tambourine,
    "handdrum": handdrum,
}

GM_PROGRAM = {  # for the exported MIDI reference file only
    "ukulele": 24, "bass": 32, "xylophone": 13, "toy_piano": 9, "whistle": 74,
}
GM_DRUM_NOTE = {"kick": 36, "snare": 38, "clap": 39, "tambourine": 54, "handdrum": 63}


def render_composition(comp: Composition) -> np.ndarray:
    n_samples = int(comp.total_seconds() * SR) + SR  # +1s tail for note decay
    stereo = np.zeros((n_samples, 2))
    spb = comp.sec_per_beat()

    for ev in comp.events:
        start_sample = int(ev.start_beat * spb * SR)
        dur_sec = ev.dur_beats * spb
        if ev.instrument in PERCUSSION:
            audio = PERCUSSION[ev.instrument](dur_sec)
        else:
            fn, kwargs = INSTRUMENTS[ev.instrument]
            freq = midi_to_freq(ev.midi_note)
            audio = fn(freq, dur_sec, **kwargs)
        audio = audio * ev.velocity
        end_sample = start_sample + len(audio)
        if end_sample > n_samples:
            audio = audio[: n_samples - start_sample]
            end_sample = n_samples
        left_gain = 1.0 - max(0.0, ev.pan)
        right_gain = 1.0 + min(0.0, ev.pan)
        stereo[start_sample:end_sample, 0] += audio * left_gain
        stereo[start_sample:end_sample, 1] += audio * right_gain

    stereo = apply_reverb(stereo)

    # soft-knee limiter to tame synthesis peaks before ffmpeg mastering
    peak = np.max(np.abs(stereo)) + 1e-9
    stereo = np.tanh(stereo / peak * 1.6) * 0.92

    # trim to exact loop length (drop the decay tail so the export loops
    # cleanly on the beat), then apply a 4ms declick fade at both ends
    loop_samples = int(comp.total_seconds() * SR)
    stereo = stereo[:loop_samples]
    fade_n = int(0.004 * SR)
    fade_in = np.linspace(0, 1, fade_n)
    fade_out = np.linspace(1, 0, fade_n)
    stereo[:fade_n] *= fade_in[:, None]
    stereo[-fade_n:] *= fade_out[:, None]

    return stereo


def write_wav(path, stereo, sr=SR):
    stereo = np.clip(stereo, -1.0, 1.0)
    pcm = (stereo * 32767).astype("<i2")
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


def write_midi(comp: Composition, path):
    mid = MidiFile(ticks_per_beat=480)
    tempo = bpm2tempo(comp.bpm)
    by_instrument: dict[str, list[NoteEvent]] = {}
    for ev in comp.events:
        by_instrument.setdefault(ev.instrument, []).append(ev)

    meta_track = MidiTrack()
    mid.tracks.append(meta_track)
    meta_track.append(MetaMessage("set_tempo", tempo=tempo, time=0))
    meta_track.append(MetaMessage("track_name", name=comp.name, time=0))

    channel = 0
    for instrument, evs in by_instrument.items():
        track = MidiTrack()
        mid.tracks.append(track)
        track.append(MetaMessage("track_name", name=instrument, time=0))
        is_drum = instrument in PERCUSSION
        chan = 9 if is_drum else channel
        if not is_drum:
            track.append(Message("program_change", program=GM_PROGRAM.get(instrument, 0), channel=chan, time=0))
            channel = (channel + 1) % 9  # avoid channel 9 (drums)

        evs = sorted(evs, key=lambda e: e.start_beat)
        ticks_per_beat = 480
        last_tick = 0
        msgs = []
        for ev in evs:
            note = GM_DRUM_NOTE.get(instrument, 60) if is_drum else ev.midi_note
            start_tick = round(ev.start_beat * ticks_per_beat)
            end_tick = round((ev.start_beat + ev.dur_beats) * ticks_per_beat)
            vel = max(1, min(127, round(ev.velocity * 100)))
            msgs.append((start_tick, Message("note_on", note=note, velocity=vel, channel=chan)))
            msgs.append((end_tick, Message("note_off", note=note, velocity=0, channel=chan)))
        msgs.sort(key=lambda m: m[0])
        for tick, msg in msgs:
            delta = tick - last_tick
            track.append(msg.copy(time=max(0, delta)))
            last_tick = tick
    mid.save(path)


# ---------------------------------------------------------------------------
# Song data: melody / chords / bass / drums, adapted from the traditional
# public-domain tunes named in each track's docstring. These are original,
# simplified arrangements capturing each tune's well-known contour — not a
# transcription of any specific modern recording or sheet-music edition.
# ---------------------------------------------------------------------------

def build_phrase(events, start_beat, degrees_durs, root, octave, instrument, velocity=0.85, pan=0.0, octave_add=0):
    """degrees_durs: list of (degree, beats). degree 0 = rest."""
    b = start_beat
    for degree, dur in degrees_durs:
        if degree != 0:
            midi = scale_degree_to_midi(root, octave + octave_add, degree)
            events.append(NoteEvent(b, dur * 0.94, midi, instrument, velocity, pan))
        b += dur
    return b


def add_chord_bar(events, start_beat, root, octave, degree, quality, instrument="ukulele", velocity=0.5, pan=0.0):
    notes = chord_midi(root, octave, degree, quality)
    for i, n in enumerate(notes):
        events.append(NoteEvent(start_beat, 3.8, n, instrument, velocity * (0.9 if i == 0 else 0.6), pan))


def add_bass_bar(events, start_beat, root, octave, degree, pattern="root_fifth"):
    r = scale_degree_to_midi(root, octave, degree)
    fifth = r + 7
    if pattern == "root_fifth":
        events.append(NoteEvent(start_beat, 1.8, r, "bass", 0.9))
        events.append(NoteEvent(start_beat + 2, 1.8, fifth - 12 if fifth - 12 > r - 12 else fifth, "bass", 0.75))
    else:
        events.append(NoteEvent(start_beat, 3.8, r, "bass", 0.9))


DRUM_PATTERNS = {
    "basic": [("kick", 0), ("snare", 2), ("kick", 2.5), ("clap", 2), ("tambourine", 1), ("tambourine", 3)],
    "sparse": [("kick", 0), ("tambourine", 2)],
    "full": [
        ("kick", 0), ("snare", 1), ("clap", 1), ("kick", 1.5), ("snare", 2), ("clap", 2),
        ("kick", 2.5), ("snare", 3), ("tambourine", 0.5), ("tambourine", 1.5), ("tambourine", 2.5), ("tambourine", 3.5),
    ],
    "parade": [
        ("handdrum", 0), ("snare", 1), ("handdrum", 2), ("snare", 3),
        ("tambourine", 0.5), ("tambourine", 1.5), ("tambourine", 2.5), ("tambourine", 3.5),
    ],
    "parade_sparse": [("handdrum", 0), ("handdrum", 2)],
    "none": [],
}


def add_drum_bar(events, start_beat, pattern_name, velocity=0.8):
    for inst, offset in DRUM_PATTERNS[pattern_name]:
        events.append(NoteEvent(start_beat + offset, 0.4, 0, inst, velocity))


# ---- Track 1: happy_skip — adapted from "Skip to My Lou" ------------------

def compose_happy_skip():
    root, octv = "G", 4
    bpm = 138
    bar_sec = 4 * 60 / bpm
    total_bars = 44  # ~76.5s: intro2 + 4x10 sections + loop2
    comp = Composition("happy_skip", bpm, root, octv, total_bars)
    ev = comp.events

    # main 4-bar melody phrase (2 statements per section)
    phrase_a = [(3, 0.75), (3, 0.75), (3, 0.5), (2, 0.5), (3, 0.5), (4, 1)]
    phrase_a2 = [(5, 2), (0, 1), (5, 1)]
    phrase_b1 = [(4, 0.75), (4, 0.75), (4, 0.5), (3, 0.5), (2, 0.5), (1, 1)]
    phrase_b2 = [(1, 2), (0, 2)]
    chord_seq = [(1, "major"), (4, "major"), (5, "major"), (1, "major")]

    bar = 0

    def melody_section(n_bars, drum_pattern, with_harmony=False, lead_inst="whistle"):
        nonlocal bar
        b = bar
        bars_done = 0
        while bars_done < n_bars:
            for (deg, q) in chord_seq:
                if bars_done >= n_bars:
                    break
                start = b * 4
                add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.42)
                add_bass_bar(ev, start, root, octv - 1, deg)
                add_drum_bar(ev, start, drum_pattern)
                bar_phrase = phrase_a + phrase_a2 if bars_done % 2 == 0 else phrase_b1 + phrase_b2
                build_phrase(ev, start, bar_phrase, root, octv, lead_inst, 0.8)
                if with_harmony:
                    build_phrase(ev, start, bar_phrase, root, octv - 1, "xylophone", 0.35, pan=-0.4)
                b += 1
                bars_done += 1
        bar = b

    # intro: 2 bars, chords + drums only, no lead — sets the groove
    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 2]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.4)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "sparse")
        bar += 1

    melody_section(10, "basic", with_harmony=False, lead_inst="whistle")       # A
    melody_section(10, "full", with_harmony=True, lead_inst="whistle")        # A' (xylophone doubling added)
    melody_section(10, "basic", with_harmony=False, lead_inst="toy_piano")    # B (lead instrument swap for contrast)
    melody_section(10, "full", with_harmony=True, lead_inst="whistle")        # A return, full band

    # 2-bar loop connector: thin back down to the intro's sparse texture
    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 2]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.4)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "sparse")
        bar += 1

    assert bar == total_bars, (bar, total_bars)
    return comp


# ---- Track 2: playful_pop — adapted from "Pop Goes the Weasel" ------------

def compose_playful_pop():
    root, octv = "C", 4
    bpm = 145
    total_bars = 36  # ~59.6s
    comp = Composition("playful_pop", bpm, root, octv, total_bars)
    ev = comp.events

    phrase_a = [(1, 1), (1, 1), (2, 1), (3, 1)]
    phrase_a2 = [(1, 1), (1, 1), (2, 1), (3, 1)]
    phrase_run = [(3, 0.5), (4, 0.5), (5, 1), (5, 0.5), (4, 0.5), (3, 0.5), (2, 0.5)]
    phrase_resolve = [(3, 1), (2, 1), (1, 1), (1, 1)]
    # the "Pop!" moment: an octave-up surprise leap, original bounce sound
    phrase_pop = [(0, 1), (9, 0.5), (0, 0.5), (5, 1), (3, 1)]
    chord_seq = [(1, "major"), (1, "major"), (4, "major"), (5, "major")]

    bar = 0

    def toy_bounce(start_beat):
        """An original 'bounce' effect for the 'Pop!' hit — a fast synthesized
        pitch-up chirp, not an external sample."""
        n = int(0.18 * SR)
        t = np.arange(n) / SR
        freq = 500 + 2200 * (t / t[-1])
        phase = 2 * np.pi * np.cumsum(freq) / SR
        chirp = np.sin(phase) * np.exp(-t * 10)
        ev.append(NoteEvent(start_beat, 0.18, 0, "_bounce_precomputed", 1.0))
        return chirp

    def melody_section(n_bars, drum_pattern, lead_inst="toy_piano", with_pop=False):
        nonlocal bar
        b = bar
        bars_done = 0
        while bars_done < n_bars:
            start = b * 4
            deg, q = chord_seq[bars_done % 4]
            add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.4)
            add_bass_bar(ev, start, root, octv - 1, deg)
            add_drum_bar(ev, start, drum_pattern)
            if with_pop and bars_done % 4 == 3:
                build_phrase(ev, start, phrase_pop, root, octv, lead_inst, 0.85)
            else:
                p = [phrase_a, phrase_a2, phrase_run, phrase_resolve][bars_done % 4]
                build_phrase(ev, start, p, root, octv, lead_inst, 0.85)
            build_phrase(ev, start, [phrase_a, phrase_a2, phrase_run, phrase_resolve][bars_done % 4],
                         root, octv - 1, "xylophone", 0.3, pan=0.4)
            b += 1
            bars_done += 1
        bar = b

    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 4]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.35)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "sparse")
        bar += 1

    melody_section(8, "basic", lead_inst="toy_piano", with_pop=False)   # A
    melody_section(8, "full", lead_inst="toy_piano", with_pop=True)     # A' with the Pop! hits
    melody_section(8, "basic", lead_inst="xylophone", with_pop=False)   # B (lead swapped to xylophone)
    melody_section(8, "full", lead_inst="toy_piano", with_pop=True)     # A return

    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 4]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.35)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "sparse")
        bar += 1

    assert bar == total_bars, (bar, total_bars)
    return comp, toy_bounce


# ---- Track 3: sunny_parade — adapted from "Yankee Doodle" -----------------

def compose_sunny_parade():
    root, octv = "D", 4
    bpm = 132
    total_bars = 40  # ~72.7s
    comp = Composition("sunny_parade", bpm, root, octv, total_bars)
    ev = comp.events

    phrase_a1 = [(1, 1), (1, 1), (2, 1), (3, 1)]
    phrase_a2 = [(1, 1), (3, 1), (2, 1), (5, 1)]
    phrase_b1 = [(1, 1), (1, 1), (2, 1), (3, 1)]
    phrase_b2 = [(1, 1), (2, 1), (6, 1), (1, 2)]
    chord_seq = [(1, "major"), (1, "major"), (5, "major"), (1, "major")]

    bar = 0

    def melody_section(n_bars, drum_pattern, lead_inst="whistle", with_ukulele_double=False):
        nonlocal bar
        b = bar
        bars_done = 0
        while bars_done < n_bars:
            start = b * 4
            deg, q = chord_seq[bars_done % 4]
            add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.38)
            add_bass_bar(ev, start, root, octv - 1, deg)
            add_drum_bar(ev, start, drum_pattern)
            p = [phrase_a1, phrase_a2, phrase_b1, phrase_b2][bars_done % 4]
            build_phrase(ev, start, p, root, octv, lead_inst, 0.85)
            if with_ukulele_double:
                build_phrase(ev, start, p, root, octv, "ukulele", 0.3, pan=0.5)
            b += 1
            bars_done += 1
        bar = b

    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 4]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.35)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "parade_sparse")
        bar += 1

    melody_section(9, "parade_sparse", lead_inst="whistle", with_ukulele_double=False)  # A
    melody_section(9, "parade", lead_inst="whistle", with_ukulele_double=True)          # A'
    melody_section(9, "parade", lead_inst="toy_piano", with_ukulele_double=False)       # B
    melody_section(9, "parade", lead_inst="whistle", with_ukulele_double=True)          # A return

    for i in range(2):
        start = bar * 4
        deg, q = chord_seq[i % 4]
        add_chord_bar(ev, start, root, octv, deg, q, "ukulele", 0.35)
        add_bass_bar(ev, start, root, octv - 1, deg)
        add_drum_bar(ev, start, "parade_sparse")
        bar += 1

    assert bar == total_bars, (bar, total_bars)
    return comp


# ---------------------------------------------------------------------------
# Rendering with the special "Pop!" bounce effect patched in
# ---------------------------------------------------------------------------

def render_playful_pop(comp: Composition, bounce_fn) -> np.ndarray:
    # Render normally, but replace the placeholder "_bounce_precomputed"
    # events with the synthesized chirp computed alongside composition.
    real_events = [e for e in comp.events if e.instrument != "_bounce_precomputed"]
    bounce_events = [e for e in comp.events if e.instrument == "_bounce_precomputed"]
    comp.events = real_events
    stereo = render_composition(comp)
    spb = comp.sec_per_beat()
    for e in bounce_events:
        chirp = bounce_fn(e.start_beat)
        start_sample = int(e.start_beat * spb * SR)
        end_sample = min(len(stereo), start_sample + len(chirp))
        seg = chirp[: end_sample - start_sample]
        stereo[start_sample:end_sample, 0] += seg * 0.6
        stereo[start_sample:end_sample, 1] += seg * 0.6
    comp.events = real_events + bounce_events
    peak = np.max(np.abs(stereo)) + 1e-9
    if peak > 0.98:
        stereo = stereo / peak * 0.95
    return stereo


# ---------------------------------------------------------------------------
# ffmpeg mastering (two-pass loudnorm to ~-14 LUFS / -1 dBTP) + OGG export
# ---------------------------------------------------------------------------

def ffprobe_json(path):
    out = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", path],
        capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def _extract_loudnorm_json(stderr: str) -> dict:
    start = stderr.rfind("{")
    end = stderr.find("}", start) + 1
    return json.loads(stderr[start:end])


def master_with_loudnorm(raw_wav, final_wav, final_ogg, target_lufs=-14.0, target_tp=-1.0):
    # Pass 1: measure
    measure = subprocess.run(
        ["ffmpeg", "-y", "-i", raw_wav, "-af",
         f"loudnorm=I={target_lufs}:TP={target_tp}:LRA=11:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    stats = _extract_loudnorm_json(measure.stderr)

    # Pass 2: apply measured stats for a precise, single-pass-quality result
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


def measure_final_loudness(path):
    measure = subprocess.run(
        ["ffmpeg", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    return _extract_loudnorm_json(measure.stderr)


def check_loop_seam(wav_path, window_ms=15):
    with wave.open(wav_path, "rb") as wf:
        sr = wf.getframerate()
        n = wf.getnframes()
        wf.setpos(0)
        head = np.frombuffer(wf.readframes(int(sr * window_ms / 1000)), dtype="<i2")
        wf.setpos(max(0, n - int(sr * window_ms / 1000)))
        tail = np.frombuffer(wf.readframes(int(sr * window_ms / 1000)), dtype="<i2")
    head_edge = head[0] if len(head) else 0
    tail_edge = tail[-1] if len(tail) else 0
    max_val = 32767
    discontinuity = abs(int(tail_edge) - int(head_edge)) / max_val
    return {
        "tail_last_sample": int(tail_edge),
        "head_first_sample": int(head_edge),
        "discontinuity_ratio": round(float(discontinuity), 5),
        "ok": discontinuity < 0.08,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    results = []

    print("Composing happy_skip (Skip to My Lou) ...")
    comp1 = compose_happy_skip()
    write_midi(comp1, os.path.join(SRC_DIR, "happy_skip.mid"))
    audio1 = render_composition(comp1)
    raw1 = os.path.join(TMP_DIR, "happy_skip_raw.wav")
    write_wav(raw1, audio1)

    print("Composing playful_pop (Pop Goes the Weasel) ...")
    comp2, bounce_fn = compose_playful_pop()
    write_midi(comp2, os.path.join(SRC_DIR, "playful_pop.mid"))
    audio2 = render_playful_pop(comp2, bounce_fn)
    raw2 = os.path.join(TMP_DIR, "playful_pop_raw.wav")
    write_wav(raw2, audio2)

    print("Composing sunny_parade (Yankee Doodle) ...")
    comp3 = compose_sunny_parade()
    write_midi(comp3, os.path.join(SRC_DIR, "sunny_parade.mid"))
    audio3 = render_composition(comp3)
    raw3 = os.path.join(TMP_DIR, "sunny_parade_raw.wav")
    write_wav(raw3, audio3)

    for comp, raw in ((comp1, raw1), (comp2, raw2), (comp3, raw3)):
        name = comp.name
        print(f"Mastering {name} with ffmpeg loudnorm ...")
        final_wav = os.path.join(OUT_DIR, f"{name}.wav")
        final_ogg = os.path.join(OUT_DIR, f"{name}.ogg")
        stats = master_with_loudnorm(raw, final_wav, final_ogg)

        final_stats = measure_final_loudness(final_wav)
        seam = check_loop_seam(final_wav)
        probe = ffprobe_json(final_wav)
        stream = probe["streams"][0]

        results.append({
            "file_wav": f"assets/audio/music/{name}.wav",
            "file_ogg": f"assets/audio/music/{name}.ogg",
            "source_midi": f"assets/audio/music/source/{name}.mid",
            "bpm": comp.bpm,
            "key": f"{comp.key_root} major",
            "duration_sec": round(comp.total_seconds(), 2),
            "duration_sec_ffprobe": round(float(probe["format"]["duration"]), 2),
            "sample_rate": int(stream["sample_rate"]),
            "channels": int(stream["channels"]),
            "bit_depth": 16,
            "integrated_lufs": float(final_stats.get("input_i", "nan")),
            "true_peak_dbtp": float(final_stats.get("input_tp", "nan")),
            "loop_seam_check": seam,
            "melody_source": {
                "happy_skip": "Skip to My Lou (traditional, public domain)",
                "playful_pop": "Pop Goes the Weasel (traditional, public domain)",
                "sunny_parade": "Yankee Doodle (traditional, public domain)",
            }[name],
            "tools_used": ["python", "numpy", "scipy", "mido", "ffmpeg (loudnorm, libvorbis)"],
            "third_party_dependencies": [
                {"name": "numpy", "license": "BSD-3-Clause"},
                {"name": "scipy", "license": "BSD-3-Clause"},
                {"name": "mido", "license": "MIT"},
                {"name": "ffmpeg", "license": "LGPL/GPL (used as an external tool, not linked)"},
            ],
        })
        print(f"  {name}: {results[-1]['duration_sec_ffprobe']}s, "
              f"{results[-1]['integrated_lufs']} LUFS, seam_ok={seam['ok']}")

    with open(os.path.join(OUT_DIR, "music_metadata.json"), "w", encoding="utf-8") as f:
        json.dump({"generated_by": "scripts/generate_music.py", "tracks": results}, f, indent=2)

    for f in (raw1, raw2, raw3):
        os.remove(f)
    os.rmdir(TMP_DIR)

    print("\nAll tracks generated. See assets/audio/music/music_metadata.json")


if __name__ == "__main__":
    main()
