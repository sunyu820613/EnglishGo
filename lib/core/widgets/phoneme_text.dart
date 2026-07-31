import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../audio/audio_service.dart';
import '../content/phoneme_audio_slugs.dart';
import '../theme/tokens.dart';

/// Splits an IPA string into recorded phoneme symbols (the keys of
/// [phonemeAudioSlugs]). Three vowels are recorded with their length mark
/// as part of the key ('iː', 'uː', 'ɔː'); stress (ˈ) and any other
/// unrecognized mark is just skipped. Two-character symbols are matched
/// before their single-character prefixes (e.g. 'ɔɪ' before 'ɔ', or 'iː'
/// before a bare 'i' that isn't itself a recorded key) or the
/// diphthong/long-vowel recording would get split into two separate,
/// wrong single-phoneme clips.
List<String> tokenizePhonemes(String ipa) {
  final List<String> tokens = <String>[];
  int i = 0;
  while (i < ipa.length) {
    final String two = i + 2 <= ipa.length ? ipa.substring(i, i + 2) : '';
    if (two.length == 2 && phonemeAudioSlugs.containsKey(two)) {
      tokens.add(two);
      i += 2;
      continue;
    }
    final String one = ipa.substring(i, i + 1);
    if (phonemeAudioSlugs.containsKey(one)) {
      tokens.add(one);
    }
    i += 1;
  }
  return tokens;
}

/// Plays an IPA string's recorded phoneme(s) [repeatCount] times, with
/// [gap] silence between repeats (not between tokens within one repeat,
/// so a combo like Q's /kw/ still plays as one connected utterance).
Future<void> playPhonemeRepeated(
  AudioService audio,
  String ipa, {
  int repeatCount = 3,
  Duration gap = const Duration(milliseconds: 500),
}) async {
  final List<String> tokens = tokenizePhonemes(ipa);
  if (tokens.isEmpty) return;
  for (int rep = 0; rep < repeatCount; rep++) {
    for (final String token in tokens) {
      final String? slug = phonemeAudioSlugs[token];
      if (slug == null) continue;
      await audio.playVoice('assets/audio/phonemes/$slug.wav');
    }
    if (rep < repeatCount - 1) {
      await Future<void>.delayed(gap);
    }
  }
}

/// Renders `/ipa/` and plays its recorded phoneme(s) in sequence on tap.
/// Multi-phoneme strings (a letter's full name, or a combo like Q's /kw/)
/// play each recognized symbol's own clip back to back.
class PhonemeText extends ConsumerStatefulWidget {
  const PhonemeText({
    super.key,
    required this.ipa,
    required this.style,
    this.semanticsLabel,
  });

  final String ipa;
  final TextStyle style;
  final String? semanticsLabel;

  @override
  ConsumerState<PhonemeText> createState() => _PhonemeTextState();
}

class _PhonemeTextState extends ConsumerState<PhonemeText> {
  bool _isPlaying = false;

  Future<void> _handleTap() async {
    if (_isPlaying) return;
    final List<String> tokens = tokenizePhonemes(widget.ipa);
    if (tokens.isEmpty) return;

    final AudioService audio = ref.read(audioServiceProvider);
    setState(() => _isPlaying = true);
    for (final String token in tokens) {
      final String? slug = phonemeAudioSlugs[token];
      if (slug == null) continue;
      await audio.playVoice('assets/audio/phonemes/$slug.wav');
    }
    if (mounted) setState(() => _isPlaying = false);
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.semanticsLabel ?? 'Phonetic symbol ${widget.ipa}',
      button: true,
      child: GestureDetector(
        onTap: _handleTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: const BoxConstraints(minHeight: TouchSize.min),
          alignment: Alignment.center,
          child: Text(
            '/${widget.ipa}/',
            style: widget.style.copyWith(
              // A serif fallback renders IPA 'ɑ' (open back vowel) with
              // its proper hooked/looped shape -- on this platform's
              // sans-serif fallback it was visually identical to a
              // plain 'a' (see PhoneticsChartPage's matching fix).
              fontFamily: 'serif',
              decoration: TextDecoration.underline,
              decorationColor: (widget.style.color ?? Colors.black)
                  .withValues(alpha: 0.35),
            ),
          ),
        ),
      ),
    );
  }
}
