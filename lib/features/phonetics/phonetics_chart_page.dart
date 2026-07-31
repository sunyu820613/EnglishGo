import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/audio/audio_service.dart';
import '../../core/content/phoneme_audio_slugs.dart';
import '../../core/content/phoneme_example_words.dart';
import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';

class _PhonemeGroup {
  const _PhonemeGroup(this.title, this.symbols);
  final String title;
  final List<String> symbols;
}

/// Full American English IPA phoneme inventory, grouped to match the
/// reference chart: vowels, diphthongs, r-colored vowels, then consonants
/// split into voiceless/voiced pairs plus the remaining sonorants.
/// Each symbol maps to a recording at assets/audio/phonemes/{symbol}.wav.
const List<_PhonemeGroup> _phonemeGroups = <_PhonemeGroup>[
  _PhonemeGroup('Vowels', <String>[
    'iː', 'ɪ', 'ɛ', 'æ', 'ɑ', 'ɔː', 'ʊ', 'uː', 'ʌ', 'ə',
  ]),
  _PhonemeGroup('Diphthongs', <String>['eɪ', 'aɪ', 'aʊ', 'ɔɪ', 'oʊ']),
  _PhonemeGroup('R-colored Vowels', <String>[
    'ɝ', 'ɚ', 'ɑr', 'ɛr', 'ɪr', 'ɔr',
  ]),
  _PhonemeGroup('Voiceless Consonants', <String>[
    'p', 't', 'k', 'tʃ', 'f', 'θ', 's', 'ʃ',
  ]),
  _PhonemeGroup('Voiced Consonants', <String>[
    'b', 'd', 'g', 'dʒ', 'v', 'ð', 'z', 'ʒ',
  ]),
  _PhonemeGroup('Other Consonants', <String>[
    'm', 'n', 'ŋ', 'l', 'w', 'j', 'h', 'r', 'ʔ', 'ɾ',
  ]),
];

/// Reference IPA phoneme chart page (parent/advanced-learner tool).
class PhoneticsChartPage extends ConsumerWidget {
  const PhoneticsChartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(onBack: () => popOrGo(context, '/parent')),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Space.md),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Phonetics Chart',
                  style: TextStyle(
                    fontFamily: FontFamily.display,
                    fontSize: TypeScale.title,
                    color: theme.text,
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(Space.md),
                itemCount: _phonemeGroups.length,
                itemBuilder: (BuildContext context, int index) {
                  return _PhonemeGroupSection(
                    group: _phonemeGroups[index],
                    theme: theme,
                    colorIndex: index,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhonemeGroupSection extends StatelessWidget {
  const _PhonemeGroupSection({
    required this.group,
    required this.theme,
    required this.colorIndex,
  });

  final _PhonemeGroup group;
  final KidThemeExtension theme;
  final int colorIndex;

  @override
  Widget build(BuildContext context) {
    final Color tileColor = colorIndex.isEven ? theme.primary : theme.secondary;
    final Color onTileColor = colorIndex.isEven
        ? theme.onPrimary
        : theme.onSecondary;

    return Padding(
      padding: const EdgeInsets.only(bottom: Space.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            group.title,
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontWeight: FontWeight.w700,
              fontSize: TypeScale.body,
              color: theme.textSoft,
            ),
          ),
          const SizedBox(height: Space.sm),
          Column(
            children: <Widget>[
              for (final String symbol in group.symbols)
                Padding(
                  padding: const EdgeInsets.only(bottom: Space.sm),
                  child: Row(
                    children: <Widget>[
                      _PhonemeTile(
                        symbol: symbol,
                        background: tileColor,
                        foreground: onTileColor,
                        shadowTint: theme.shadowTint,
                        isLightTheme: theme.isLight,
                      ),
                      const SizedBox(width: Space.sm),
                      Expanded(
                        child: Row(
                          children: <Widget>[
                            for (final WordExample example
                                in phonemeExampleWords[symbol] ??
                                    const <WordExample>[])
                              Expanded(
                                child: _ExampleWord(
                                  example: example,
                                  textColor: theme.text,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// One example word, with the letters that spell the phoneme highlighted
/// in red. Tapping plays that word's own recording.
class _ExampleWord extends ConsumerWidget {
  const _ExampleWord({required this.example, required this.textColor});

  final WordExample example;
  final Color textColor;

  static const Color _highlightColor = Color(0xFFD32F2F);
  // Shared by both the plain and highlighted TextSpans below (differing
  // only in color via .copyWith) so they can never end up different
  // sizes -- explicit sharing instead of relying on TextSpan style
  // inheritance.
  static const TextStyle _baseStyle = TextStyle(
    fontFamily: FontFamily.body,
    fontSize: 22,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final String word = example.word;
    final int start = example.highlightStart;
    final int end = start + example.highlightLength;

    return Semantics(
      label: 'Example word $word',
      button: true,
      child: GestureDetector(
        onTap: () => ref
            .read(audioServiceProvider)
            .playVoice('assets/audio/example_words/${example.audioSlug}.m4a'),
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: const BoxConstraints(minHeight: TouchSize.min),
          alignment: Alignment.centerLeft,
          child: RichText(
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            text: TextSpan(
              style: _baseStyle.copyWith(color: textColor),
              children: <TextSpan>[
                if (start > 0) TextSpan(text: word.substring(0, start)),
                TextSpan(
                  text: word.substring(start, end),
                  style: _baseStyle.copyWith(color: _highlightColor),
                ),
                if (end < word.length) TextSpan(text: word.substring(end)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PhonemeTile extends ConsumerStatefulWidget {
  const _PhonemeTile({
    required this.symbol,
    required this.background,
    required this.foreground,
    required this.shadowTint,
    required this.isLightTheme,
  });

  final String symbol;
  final Color background;
  final Color foreground;
  final Color shadowTint;
  final bool isLightTheme;

  @override
  ConsumerState<_PhonemeTile> createState() => _PhonemeTileState();
}

class _PhonemeTileState extends ConsumerState<_PhonemeTile> {
  bool _isPlaying = false;

  void _handleTap() {
    final String? slug = phonemeAudioSlugs[widget.symbol];
    if (slug == null) return;
    final AudioService audio = ref.read(audioServiceProvider);
    setState(() => _isPlaying = true);
    unawaited(
      audio.playVoice('assets/audio/phonemes/$slug.wav').then((_) {
        if (mounted) setState(() => _isPlaying = false);
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Phoneme ${widget.symbol}',
      button: true,
      // UnconstrainedBox frees this from Wrap's bounded (but not
      // shrink-to-content) width -- without it, Container's `alignment`
      // below expands to fill that ambient width instead of shrink-
      // wrapping to its own content, same root cause as the Play button
      // stretching bug fixed in kid_button.dart.
      child: UnconstrainedBox(
        constrainedAxis: Axis.vertical,
        child: GestureDetector(
          onTap: _handleTap,
          behavior: HitTestBehavior.opaque,
          child: Container(
            constraints: const BoxConstraints(
              minWidth: TouchSize.kid,
              minHeight: TouchSize.kid,
            ),
            padding: const EdgeInsets.symmetric(horizontal: Space.sm),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: widget.background,
              borderRadius: BorderRadius.circular(KidRadius.md),
              boxShadow: KidShadows.rest(
                widget.shadowTint,
                isLightTheme: widget.isLightTheme,
              ),
              border: _isPlaying
                  ? Border.all(
                      color: Colors.white.withValues(alpha: 0.6),
                      width: 3,
                    )
                  : null,
            ),
            child: Text(
              widget.symbol,
              // Deliberately not using FontFamily.display/body here: the
              // IPA Extensions glyphs used across this chart (ɝ ɾ ʃ ʒ θ ð
              // ŋ etc.) aren't fully covered by those two webfonts.
              // Also deliberately not left as an unset/default font: on
              // this platform's default sans-serif fallback, IPA 'ɑ'
              // (open back vowel) rendered visually identical to a plain
              // 'a', making the /ɑ/ tile look like it displayed the
              // wrong symbol. A serif fallback renders 'ɑ' with its
              // proper hooked/looped shape, clearly distinct from 'a'.
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 22,
                color: widget.foreground,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
