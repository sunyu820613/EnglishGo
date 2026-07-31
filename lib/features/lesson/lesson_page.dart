import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/accessibility/reduced_motion_policy.dart';
import '../../core/audio/audio_service.dart';
import '../../core/content/letter_name_ipa.dart';
import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../core/widgets/kid_button.dart';
import '../../core/widgets/lesson_progress_dots.dart';
import '../../core/widgets/letter_hero.dart';
import '../../core/widgets/phoneme_text.dart';
import '../../core/widgets/quiz_option_card.dart';
import '../../core/widgets/sound_button.dart';
import '../../core/widgets/star_meter.dart';
import '../../core/widgets/tracing_canvas.dart';
import '../../core/widgets/word_card.dart';
import '../../data/alphabet/models.dart';
import '../../data/progress/progress_repository.dart';
import '../alphabet/alphabet_map_page.dart';

/// Prefix asset paths from alphabet.json (relative) with 'assets/'.
String assetPath(String relativePath) => 'assets/$relativePath';

/// Plays a letter's own NAME pronunciation (e.g. A's /eɪ/) from the
/// recorded phoneme clips, replacing the old letterAudio recording.
Future<void> _playLetterName(AudioService audio, String letter) {
  final String? ipa = letterNameIpa[letter];
  if (ipa == null) return Future<void>.value();
  return playPhonemeRepeated(audio, ipa, repeatCount: 1);
}

/// Centers [child] but scrolls instead of overflowing when it's taller than
/// the available height -- e.g. LetterHero at large system text scale
/// (ACCESSIBILITY.md: no overflow at 200%).
class _ScrollSafeCenter extends StatelessWidget {
  const _ScrollSafeCenter({required this.child, this.padding});

  final Widget child;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        return SingleChildScrollView(
          padding: padding,
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(child: child),
          ),
        );
      },
    );
  }
}

/// The 10-step lesson page for one letter.
class LessonPage extends ConsumerStatefulWidget {
  const LessonPage({super.key, required this.letter});

  final String letter;

  @override
  ConsumerState<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends ConsumerState<LessonPage> {
  int _currentStep = 0;
  bool _word1Heard = false;
  bool _word2Heard = false;
  bool _quizCompleted = false;
  bool _matchCompleted = false;
  bool _traceCompleted = false;
  bool _lessonComplete = false;

  int _quizAttempts = 0;
  int _matchAttempts = 0;

  LetterEntry? _letterData;
  List<LetterEntry> _allLetters = const <LetterEntry>[];
  bool _loaded = false;

  bool _leaveConfirmPending = false;
  Timer? _leaveConfirmTimer;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loadLetterData();
    }
  }

  @override
  void dispose() {
    _leaveConfirmTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadLetterData() async {
    try {
      final List<LetterEntry> letters = await ref.read(
        alphabetFutureProvider.future,
      );
      final LetterEntry? found = letters
          .where((LetterEntry l) => l.letter == widget.letter)
          .firstOrNull;
      if (found != null && mounted) {
        setState(() {
          _letterData = found;
          _allLetters = letters;
          _loaded = true;
        });
      }
    } catch (_) {}
  }

  void _goBack() {
    if (_currentStep > 0 && !_lessonComplete) {
      // The snackbar's own copy ("Tap again to leave lesson") promised a
      // second tap would actually leave, but nothing here ever tracked
      // that a first tap had happened -- every tap re-showed the same
      // snackbar and none of them navigated back.
      if (_leaveConfirmPending) {
        _leaveConfirmTimer?.cancel();
        popOrGo(context, '/map');
        return;
      }
      _leaveConfirmPending = true;
      _leaveConfirmTimer?.cancel();
      _leaveConfirmTimer = Timer(const Duration(seconds: 2), () {
        if (mounted) setState(() => _leaveConfirmPending = false);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tap again to leave lesson'),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      popOrGo(context, '/map');
    }
  }

  void _nextStep() {
    if (_currentStep < 10) {
      setState(() {
        _currentStep++;
        if (_currentStep == 10) _lessonComplete = true;
      });
    }
  }

  void _skipTracing() {
    setState(() {
      _currentStep = 10;
      _lessonComplete = true;
    });
  }

  Future<void> _completeLesson() async {
    final ProgressRepository progress = ref.read(progressProvider.notifier);

    if (_word1Heard && _word2Heard) {
      await progress.addStar(widget.letter, 0);
    }
    if (_quizCompleted) {
      await progress.addStar(widget.letter, 1);
    }
    if (_matchCompleted || _traceCompleted) {
      await progress.addStar(widget.letter, 2);
    }

    if (_word1Heard && _letterData != null) {
      await progress.markWordHeard(widget.letter, _letterData!.words[0].id);
    }
    if (_word2Heard && _letterData != null) {
      await progress.markWordHeard(widget.letter, _letterData!.words[1].id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);

    if (!_loaded) {
      return Scaffold(
        backgroundColor: theme.background,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(
              onBack: _goBack,
              backSemanticsLabel: 'Leave lesson',
              actions: <Widget>[
                if (_currentStep == 9)
                  Semantics(
                    label: 'Skip tracing',
                    button: true,
                    child: GestureDetector(
                      onTap: _skipTracing,
                      child: Padding(
                        padding: const EdgeInsets.all(Space.sm),
                        child: Text(
                          'Skip',
                          style: TextStyle(
                            fontFamily: FontFamily.body,
                            fontSize: TypeScale.body,
                            color: theme.textSoft,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: Space.xs),
              child: LessonProgressDots(
                totalSteps: 11,
                currentStep: _currentStep.clamp(0, 10),
              ),
            ),
            Expanded(
              child: AnimatedSwitcher(
                duration: Motion.standard,
                // AnimatedSwitcher keeps the outgoing step hit-testable
                // for the whole fade-out by default, stacked under the
                // incoming one. A quick second tap (e.g. on "Next") can
                // land on that stale, soon-to-be-removed widget and get
                // dropped -- reproduced as "have to tap Next twice".
                // Removing the outgoing child instantly (no reverse fade)
                // closes that window; the enter fade is unaffected.
                reverseDuration: Duration.zero,
                child: _buildCurrentStep(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    if (_letterData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    switch (_currentStep) {
      case 0:
        return _StepMascotEntrance(
          key: const ValueKey<int>(0),
          letterData: _letterData!,
          onNext: _nextStep,
        );
      case 1:
        return _StepLetterName(
          key: const ValueKey<int>(1),
          letterData: _letterData!,
          onNext: _nextStep,
        );
      case 2:
        return _StepPhonics(
          key: const ValueKey<int>(2),
          letterData: _letterData!,
          onNext: _nextStep,
        );
      case 3:
        return _StepWord1(
          key: const ValueKey<int>(3),
          letterData: _letterData!,
          onNext: _nextStep,
        );
      case 4:
        return _StepWord1Tap(
          key: const ValueKey<int>(4),
          letterData: _letterData!,
          onNext: _nextStep,
          onHeard: () => setState(() => _word1Heard = true),
        );
      case 5:
        return _StepWord2(
          key: const ValueKey<int>(5),
          letterData: _letterData!,
          onNext: _nextStep,
        );
      case 6:
        return _StepWord2Tap(
          key: const ValueKey<int>(6),
          letterData: _letterData!,
          onNext: _nextStep,
          onHeard: () => setState(() => _word2Heard = true),
        );
      case 7:
        return _StepQuiz(
          key: const ValueKey<int>(7),
          letterData: _letterData!,
          allLetters: _allLetters,
          attemptCount: _quizAttempts,
          onAttempt: () {
            setState(() => _quizAttempts++);
          },
          onCompleted: () {
            setState(() {
              _quizCompleted = true;
              _currentStep++;
            });
          },
        );
      case 8:
        return _StepMatching(
          key: const ValueKey<int>(8),
          letterData: _letterData!,
          attemptCount: _matchAttempts,
          onAttempt: () {
            setState(() => _matchAttempts++);
          },
          onCompleted: () {
            setState(() {
              _matchCompleted = true;
              _currentStep++;
            });
          },
        );
      case 9:
        return _StepTracing(
          key: const ValueKey<int>(9),
          letterData: _letterData!,
          onSkip: _skipTracing,
          onTraceComplete: () => setState(() => _traceCompleted = true),
          onNext: _nextStep,
        );
      case 10:
        return _StepReward(
          key: const ValueKey<int>(10),
          letterData: _letterData!,
          onFinish: () {
            // Progress state updates synchronously before the disk write;
            // navigating away does not race the in-memory star count.
            unawaited(_completeLesson());
            context.go('/map');
          },
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

// ---------------------------------------------------------------------------
// Step Widgets
// ---------------------------------------------------------------------------

/// Step 0: Mascot entrance with letter display.
class _StepMascotEntrance extends StatelessWidget {
  const _StepMascotEntrance({
    super.key,
    required this.letterData,
    required this.onNext,
  });

  final LetterEntry letterData;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    return _ScrollSafeCenter(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: TouchSize.primary * 2,
            height: TouchSize.primary * 2,
            decoration: BoxDecoration(
              color: theme.surfaceAlt,
              borderRadius: BorderRadius.circular(KidRadius.full),
            ),
            child: Icon(
              Icons.face_rounded,
              size: TouchSize.primary,
              color: theme.primary,
            ),
          ),
          const SizedBox(height: Space.lg),
          LetterHero(letter: letterData.letter),
          const SizedBox(height: Space.lg),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Start lesson',
            size: KidSize.primary,
            child: const Text('Start'),
          ),
        ],
      ),
    );
  }
}

/// Step 1: Letter name with sound button and tappable letter.
class _StepLetterName extends ConsumerWidget {
  const _StepLetterName({
    super.key,
    required this.letterData,
    required this.onNext,
  });

  final LetterEntry letterData;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;

    return _ScrollSafeCenter(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // Labels this step vs. the next (phonics) one explicitly --
          // both play a sound for the same letter, and just seeing one
          // out of context (e.g. a screenshot) made it easy to assume
          // they were the same thing shown twice.
          Text(
            'Letter Name',
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontSize: TypeScale.body,
              color: theme.textSoft,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: Space.sm),
          SoundButton(
            // Plays the letter name's own recorded phoneme(s) (e.g. A's
            // /eɪ/) instead of the old letterAudio recording.
            onTap: (AudioService audio) =>
                _playLetterName(audio, letterData.letter),
            semanticsLabel: 'Listen to letter name',
            size: KidSize.primary,
          ),
          const SizedBox(height: Space.lg),
          GestureDetector(
            onTap: () => _playLetterName(
              ref.read(audioServiceProvider),
              letterData.letter,
            ),
            child: LetterHero(letter: letterData.letter),
          ),
          const SizedBox(height: Space.sm),
          // Small IPA caption for the letter's own NAME (distinct from the
          // phonics sound shown on the next step) -- audio-only was easy
          // to mistake for the phonics step when just glancing at the
          // lesson, since neither text nor a screenshot of this step
          // showed which sound is which.
          if (letterNameIpa[letterData.letter] != null)
            PhonemeText(
              ipa: letterNameIpa[letterData.letter]!,
              semanticsLabel:
                  'Letter name pronunciation, ${letterData.letter}',
              style: TextStyle(
                fontFamily: FontFamily.body,
                fontSize: TypeScale.body,
                color: theme.textSoft,
              ),
            ),
          const SizedBox(height: Space.lg),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 2: Phonics sound with IPA display.
class _StepPhonics extends ConsumerWidget {
  const _StepPhonics({
    super.key,
    required this.letterData,
    required this.onNext,
  });

  final LetterEntry letterData;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;

    return _ScrollSafeCenter(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // See _StepLetterName's matching label -- this is deliberately
          // a different sound (the phonics sound, not the letter's name)
          // for the same letter.
          Text(
            'Letter Sound',
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontSize: TypeScale.body,
              color: theme.textSoft,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: Space.sm),
          // phonicsAudio is now a spliced sentence: TTS carrier text
          // ("A says ... like in Apple!") with the recorded phoneme
          // clip inserted in place of the isolated sound
          // (tool/gen_phonics_sentence_audio.js) -- the full "X says
          // ... like in Word!" line, but the actual phoneme sound comes
          // from the real recording instead of synthesized speech.
          SoundButton(
            audioPath: assetPath(letterData.phonicsAudio),
            semanticsLabel: 'Listen to phonics sound',
            size: KidSize.primary,
          ),
          const SizedBox(height: Space.lg),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                '${letterData.letter} says ',
                style: TextStyle(
                  fontFamily: FontFamily.teaching,
                  fontSize: TypeScale.title,
                  color: theme.text,
                ),
              ),
              PhonemeText(
                ipa: letterData.phonicsIpa,
                semanticsLabel:
                    'Phonics sound for letter ${letterData.letter}',
                style: TextStyle(
                  fontFamily: FontFamily.teaching,
                  fontSize: TypeScale.title,
                  color: theme.text,
                ),
              ),
            ],
          ),
          const SizedBox(height: Space.sm),
          // CONTENT_GUIDE.md's teaching script is the full
          // "A says /æ/. /æ/ /æ/ Apple!" -- the audio (played above via
          // phonicsAudio) says all of that, but the on-screen text only
          // showed the first half. Anyone just reading the screen (or
          // muted) never got the concrete word that makes the IPA symbol
          // click, and mistook it for the letter's own name pronunciation.
          Text(
            'like in ${letterData.words[0].text}!',
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontSize: TypeScale.body,
              color: theme.textSoft,
            ),
            textAlign: TextAlign.center,
          ),
          if (letterData.phonicsNote != null) ...[
            const SizedBox(height: Space.sm),
            Text(
              letterData.phonicsNote!.replaceAll('_', ' '),
              style: TextStyle(
                fontFamily: FontFamily.body,
                fontSize: TypeScale.body,
                color: theme.textSoft,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          const SizedBox(height: Space.lg),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 3: Word 1 card display with audio.
class _StepWord1 extends StatelessWidget {
  const _StepWord1({super.key, required this.letterData, required this.onNext});

  final LetterEntry letterData;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final WordEntry word = letterData.words[0];
    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 240),
            child: WordCard(
              imagePath: assetPath(word.image),
              word: word.text,
              audioPath: assetPath(word.audio),
              semanticsLabel: 'Word ${word.text}',
            ),
          ),
          const SizedBox(height: Space.md),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 4: Tap word 1 to hear pronunciation (guided interaction).
class _StepWord1Tap extends StatelessWidget {
  const _StepWord1Tap({
    super.key,
    required this.letterData,
    required this.onNext,
    required this.onHeard,
  });

  final LetterEntry letterData;
  final VoidCallback onNext;
  final VoidCallback onHeard;

  @override
  Widget build(BuildContext context) {
    final WordEntry word = letterData.words[0];
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // Without this, this step looks pixel-identical to the
          // previous one (same card, same word, same Next button) --
          // easy to mistake for "my last tap on Next did nothing" and
          // tap it again.
          Text(
            'Tap the picture!',
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontSize: TypeScale.body,
              color: theme.textSoft,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: Space.sm),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 240),
            child: GestureDetector(
              onTap: onHeard,
              child: WordCard(
                imagePath: assetPath(word.image),
                word: word.text,
                audioPath: assetPath(word.audio),
                semanticsLabel: 'Tap to hear ${word.text}',
              ),
            ),
          ),
          const SizedBox(height: Space.md),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 5: Word 2 card display with audio.
class _StepWord2 extends StatelessWidget {
  const _StepWord2({super.key, required this.letterData, required this.onNext});

  final LetterEntry letterData;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final WordEntry word = letterData.words[1];
    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 240),
            child: WordCard(
              imagePath: assetPath(word.image),
              word: word.text,
              audioPath: assetPath(word.audio),
              semanticsLabel: 'Word ${word.text}',
            ),
          ),
          const SizedBox(height: Space.md),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 6: Tap word 2 to hear pronunciation (guided interaction).
class _StepWord2Tap extends StatelessWidget {
  const _StepWord2Tap({
    super.key,
    required this.letterData,
    required this.onNext,
    required this.onHeard,
  });

  final LetterEntry letterData;
  final VoidCallback onNext;
  final VoidCallback onHeard;

  @override
  Widget build(BuildContext context) {
    final WordEntry word = letterData.words[1];
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // See _StepWord1Tap's matching hint -- same reason.
          Text(
            'Tap the picture!',
            style: TextStyle(
              fontFamily: FontFamily.body,
              fontSize: TypeScale.body,
              color: theme.textSoft,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: Space.sm),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 240),
            child: GestureDetector(
              onTap: onHeard,
              child: WordCard(
                imagePath: assetPath(word.image),
                word: word.text,
                audioPath: assetPath(word.audio),
                semanticsLabel: 'Tap to hear ${word.text}',
              ),
            ),
          ),
          const SizedBox(height: Space.md),
          KidButton(
            onPressed: onNext,
            semanticsLabel: 'Next step',
            child: const Text('Next'),
          ),
        ],
      ),
    );
  }
}

/// Step 7: Listen & Pick quiz (3 options, gentle correction).
class _StepQuiz extends ConsumerStatefulWidget {
  const _StepQuiz({
    super.key,
    required this.letterData,
    required this.allLetters,
    required this.attemptCount,
    required this.onAttempt,
    required this.onCompleted,
  });

  final LetterEntry letterData;
  final List<LetterEntry> allLetters;
  final int attemptCount;
  final VoidCallback onAttempt;
  final VoidCallback onCompleted;

  @override
  ConsumerState<_StepQuiz> createState() => _StepQuizState();
}

class _StepQuizState extends ConsumerState<_StepQuiz> {
  int _selected = -1;
  bool _completed = false;
  bool _reduced = false;
  late List<WordEntry> _options;

  @override
  void initState() {
    super.initState();
    _options = _generateOptions();
  }

  // Third option is a real distractor word from a different letter (not a
  // blank placeholder) so the quiz always shows 3 genuine illustrations.
  List<WordEntry> _generateOptions() {
    final WordEntry correctWord = widget.letterData.words[0];
    final WordEntry secondWord = widget.letterData.words[1];
    final List<WordEntry> distractorPool = <WordEntry>[
      for (final LetterEntry entry in widget.allLetters)
        if (entry.letter != widget.letterData.letter) ...entry.words,
    ];
    final WordEntry distractor = distractorPool.isNotEmpty
        ? (distractorPool..shuffle(Random())).first
        : const WordEntry(
            id: 'blank',
            text: '?',
            audio: '',
            image: '',
            phrase: '',
          );

    final Set<WordEntry> set = <WordEntry>{correctWord, secondWord, distractor};
    return set.toList()..shuffle(Random());
  }

  void _onSelect(int index) {
    if (_completed) return;
    final WordEntry selected = _options[index];

    if (selected.id == widget.letterData.words[0].id) {
      setState(() {
        _completed = true;
        _selected = index;
      });
      widget.onCompleted();
    } else {
      widget.onAttempt();
      setState(() {
        _selected = index;
      });
      ref
          .read(audioServiceProvider)
          .playVoice('assets/audio/phrases/lets_listen_again.m4a');
      if (widget.attemptCount >= 2 && !_reduced) {
        setState(() => _reduced = true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    final bool reducedMotion = isReducedMotion(ref, context);

    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            'Listen and find!',
            style: TextStyle(
              fontFamily: FontFamily.display,
              fontSize: TypeScale.title,
              color: theme.text,
            ),
          ),
          const SizedBox(height: Space.md),
          SoundButton(
            audioPath: assetPath(widget.letterData.words[0].audio),
            semanticsLabel: 'Listen to word',
            size: KidSize.primary,
          ),
          const SizedBox(height: Space.lg),
          Wrap(
            spacing: Space.md,
            runSpacing: Space.md,
            children: List<Widget>.generate(_options.length, (int i) {
              if (_reduced &&
                  _options[i].id != widget.letterData.words[0].id &&
                  _options[i].id == 'blank') {
                return const SizedBox.shrink();
              }
              final WordEntry option = _options[i];
              QuizOptionState cardState = QuizOptionState.idle;
              if (_completed && option.id == widget.letterData.words[0].id) {
                cardState = QuizOptionState.success;
              } else if (_selected == i &&
                  option.id != widget.letterData.words[0].id) {
                cardState = QuizOptionState.hint;
              }

              return QuizOptionCard(
                semanticsLabel: 'Option ${option.text}',
                state: cardState,
                onTap: () => _onSelect(i),
                reducedMotion: reducedMotion,
                child: SizedBox(
                  width: 100,
                  height: 100,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(KidRadius.md),
                    child: option.image.isEmpty
                        ? ColoredBox(
                            color: theme.surfaceAlt,
                            child: Center(
                              child: Icon(
                                Icons.image,
                                size: 40,
                                color: theme.textSoft,
                              ),
                            ),
                          )
                        : Image.asset(
                            assetPath(option.image),
                            fit: BoxFit.cover,
                            errorBuilder:
                                (
                                  BuildContext context,
                                  Object error,
                                  StackTrace? stackTrace,
                                ) => ColoredBox(
                                  color: theme.surfaceAlt,
                                  child: Center(
                                    child: Icon(
                                      Icons.image,
                                      size: 40,
                                      color: theme.textSoft,
                                    ),
                                  ),
                                ),
                          ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

/// Step 8: Find the Letter matching game (3 options).
class _StepMatching extends ConsumerStatefulWidget {
  const _StepMatching({
    super.key,
    required this.letterData,
    required this.attemptCount,
    required this.onAttempt,
    required this.onCompleted,
  });

  final LetterEntry letterData;
  final int attemptCount;
  final VoidCallback onAttempt;
  final VoidCallback onCompleted;

  @override
  ConsumerState<_StepMatching> createState() => _StepMatchingState();
}

class _StepMatchingState extends ConsumerState<_StepMatching> {
  int _selected = -1;
  bool _reduced = false;
  int _hiddenIndex = -1;
  bool _completed = false;
  late List<String> _options;

  @override
  void initState() {
    super.initState();
    _options = _generateOptions();
  }

  List<String> _generateOptions() {
    final String target = widget.letterData.letter;
    final int code = target.codeUnitAt(0);
    final Set<String> letters = <String>{
      target,
      String.fromCharCode(((code - 65 + 3) % 26) + 65),
      String.fromCharCode(((code - 65 + 7) % 26) + 65),
    };
    return letters.toList()..shuffle(Random());
  }

  void _onSelect(int index) {
    if (_completed) return;
    final String selected = _options[index];

    if (selected == widget.letterData.letter) {
      setState(() {
        _completed = true;
        _selected = index;
      });
      widget.onCompleted();
    } else {
      widget.onAttempt();
      setState(() {
        _selected = index;
      });
      ref
          .read(audioServiceProvider)
          .playVoice('assets/audio/phrases/lets_listen_again.m4a');
      if (widget.attemptCount >= 2 && !_reduced) {
        setState(() {
          _reduced = true;
          _hiddenIndex = _options.indexWhere(
            (o) => o != widget.letterData.letter,
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    final bool reducedMotion = isReducedMotion(ref, context);

    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            'Find the letter ${widget.letterData.letter}!',
            style: TextStyle(
              fontFamily: FontFamily.display,
              fontSize: TypeScale.title,
              color: theme.text,
            ),
          ),
          const SizedBox(height: Space.md),
          LetterHero(letter: widget.letterData.letter),
          const SizedBox(height: Space.lg),
          Wrap(
            spacing: Space.md,
            runSpacing: Space.md,
            children: List<Widget>.generate(_options.length, (int i) {
              if (_reduced && i == _hiddenIndex) {
                return const SizedBox.shrink();
              }
              final String option = _options[i];
              QuizOptionState cardState = QuizOptionState.idle;
              if (_completed && option == widget.letterData.letter) {
                cardState = QuizOptionState.success;
              } else if (_selected == i && option != widget.letterData.letter) {
                cardState = QuizOptionState.hint;
              }

              return QuizOptionCard(
                semanticsLabel: 'Letter $option',
                state: cardState,
                onTap: () => _onSelect(i),
                reducedMotion: reducedMotion,
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: Center(
                    child: Text(
                      option,
                      style: TextStyle(
                        fontFamily: FontFamily.teaching,
                        fontSize: TypeScale.display,
                        color: theme.text,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

/// Step 9: Letter tracing (LEARNING_MODEL.md §4).
/// Always skippable via a prominent Skip button; completing tracing counts
/// toward the 3rd star the same as finishing the letter-matching game.
class _StepTracing extends ConsumerStatefulWidget {
  const _StepTracing({
    super.key,
    required this.letterData,
    required this.onSkip,
    required this.onTraceComplete,
    required this.onNext,
  });

  final LetterEntry letterData;
  final VoidCallback onSkip;
  final VoidCallback onTraceComplete;
  final VoidCallback onNext;

  @override
  ConsumerState<_StepTracing> createState() => _StepTracingState();
}

class _StepTracingState extends ConsumerState<_StepTracing> {
  bool _traced = false;

  void _handleTraceComplete() {
    setState(() => _traced = true);
    widget.onTraceComplete();
    ref
        .read(audioServiceProvider)
        .playVoice(assetPath(widget.letterData.phonicsAudio));
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    final bool reducedMotion = isReducedMotion(ref, context);

    return _ScrollSafeCenter(
      padding: const EdgeInsets.all(Space.md),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            'Trace the letter!',
            style: TextStyle(
              fontFamily: FontFamily.display,
              fontSize: TypeScale.title,
              color: theme.text,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: Space.md),
          TracingCanvas(
            letter: widget.letterData.letter,
            reducedMotion: reducedMotion,
            onComplete: _handleTraceComplete,
          ),
          const SizedBox(height: Space.lg),
          if (_traced)
            KidButton(
              onPressed: widget.onNext,
              semanticsLabel: 'Next step',
              size: KidSize.primary,
              child: const Text('Next'),
            )
          else
            KidButton(
              onPressed: widget.onSkip,
              semanticsLabel: 'Skip tracing',
              size: KidSize.primary,
              child: const Text('Skip'),
            ),
        ],
      ),
    );
  }
}

/// Step 10: Reward celebration with stars and completion.
class _StepReward extends ConsumerWidget {
  const _StepReward({
    super.key,
    required this.letterData,
    required this.onFinish,
  });

  final LetterEntry letterData;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;
    final ProgressData progress = ref.watch(progressProvider);
    final LetterProgress? lp = progress.letters[letterData.letter];
    final int totalStars = lp?.stars ?? 0;

    return _ScrollSafeCenter(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: TouchSize.primary * 2,
            height: TouchSize.primary * 2,
            decoration: BoxDecoration(
              color: theme.surfaceAlt,
              borderRadius: BorderRadius.circular(KidRadius.full),
            ),
            child: Icon(
              Icons.emoji_events_rounded,
              size: TouchSize.primary,
              color: theme.accent,
            ),
          ),
          const SizedBox(height: Space.lg),
          Text(
            'Wonderful!',
            style: TextStyle(
              fontFamily: FontFamily.display,
              fontSize: TypeScale.display,
              color: theme.text,
            ),
          ),
          const SizedBox(height: Space.md),
          StarMeter(filled: totalStars),
          const SizedBox(height: Space.lg),
          Text(
            'You learned ${letterData.letter}!',
            style: TextStyle(
              fontFamily: FontFamily.teaching,
              fontSize: TypeScale.title,
              color: theme.text,
            ),
          ),
          const SizedBox(height: Space.xl),
          KidButton(
            onPressed: onFinish,
            semanticsLabel: 'Return to map',
            size: KidSize.primary,
            child: const Text('Back to Map'),
          ),
        ],
      ),
    );
  }
}
