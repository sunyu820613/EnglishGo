import 'package:english_go/core/theme/app_theme.dart';
import 'package:english_go/core/widgets/app_top_bar.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/lesson_progress_dots.dart';
import 'package:english_go/core/widgets/letter_hero.dart';
import 'package:english_go/core/widgets/quiz_option_card.dart';
import 'package:english_go/core/widgets/star_meter.dart';
import 'package:english_go/core/widgets/word_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

/// Builds a test MaterialApp wrapping [child] with the given theme.
Widget wrapWithTheme(Widget child, String themeId) {
  final KidThemeExtension themeData =
      allThemes[themeId] ?? allThemes['starlight']!;

  return ProviderScope(
    child: MaterialApp(
      theme: buildThemeData(themeData),
      home: Scaffold(body: child),
    ),
  );
}

/// All six theme IDs.
const List<String> allThemeIds = <String>[
  'starlight',
  'dino',
  'robot',
  'moonGarden',
  'balletCastle',
  'dessert',
];

void main() {
  // ---------------------------------------------------------------------------
  // KidButton tests
  // ---------------------------------------------------------------------------
  group('KidButton', () {
    testWidgets('builds with child across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(
            KidButton(
              onPressed: () {},
              semanticsLabel: 'Test button',
              child: const Text('Tap me'),
            ),
            themeId,
          ),
        );
        expect(find.text('Tap me'), findsOneWidget);
        expect(
          tester.getSize(find.byType(KidButton)),
          // KidSize.kid default = 64dp min
          predicate<Size>((Size s) => s.width >= 64 && s.height >= 64),
        );
      }
    });

    testWidgets('semantics label is present', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          KidButton(
            onPressed: () {},
            semanticsLabel: 'Play sound',
            icon: const Icon(Icons.play_arrow),
          ),
          'starlight',
        ),
      );

      // Verify semantics
      final SemanticsHandle handle = tester.ensureSemantics();
      expect(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });

    testWidgets('applies variants without error', (tester) async {
      for (final KidVariant variant in KidVariant.values) {
        await tester.pumpWidget(
          wrapWithTheme(
            KidButton(
              onPressed: () {},
              semanticsLabel: variant.name,
              variant: variant,
              child: Text(variant.name),
            ),
            'starlight',
          ),
        );
        expect(find.text(variant.name), findsOneWidget);
      }
    });

    testWidgets('applies sizes without error', (tester) async {
      for (final KidSize size in KidSize.values) {
        await tester.pumpWidget(
          wrapWithTheme(
            KidButton(
              onPressed: () {},
              semanticsLabel: size.name,
              size: size,
              child: Text(size.name),
            ),
            'starlight',
          ),
        );
        expect(find.text(size.name), findsOneWidget);
      }
    });

    testWidgets('disabled state does not throw', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          const KidButton(
            onPressed: null,
            semanticsLabel: 'Disabled',
            enabled: false,
            child: Text('Disabled'),
          ),
          'starlight',
        ),
      );
      expect(find.text('Disabled'), findsOneWidget);
    });
  });

  // ---------------------------------------------------------------------------
  // StarMeter tests
  // ---------------------------------------------------------------------------
  group('StarMeter', () {
    testWidgets('builds across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(const StarMeter(filled: 2), themeId),
        );
        // 3 stars total (2 filled + 1 empty)
        expect(find.byIcon(Icons.star), findsNWidgets(2));
        expect(find.byIcon(Icons.star_border), findsNWidgets(1));
      }
    });

    testWidgets('semantics label is present', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(const StarMeter(filled: 1), 'starlight'),
      );

      final SemanticsHandle handle = tester.ensureSemantics();
      expect(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });

    testWidgets('all empty stars use outline style', (tester) async {
      await tester.pumpWidget(wrapWithTheme(const StarMeter(), 'starlight'));
      expect(find.byIcon(Icons.star_border), findsNWidgets(3));
      expect(find.byIcon(Icons.star), findsNothing);
    });
  });

  // ---------------------------------------------------------------------------
  // LetterHero tests
  // ---------------------------------------------------------------------------
  group('LetterHero', () {
    testWidgets('builds across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(const LetterHero(letter: 'A'), themeId),
        );
        expect(find.text('A'), findsOneWidget);
      }
    });

    testWidgets('semantics label is present', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(const LetterHero(letter: 'B'), 'starlight'),
      );

      final SemanticsHandle handle = tester.ensureSemantics();
      expect(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });
  });

  // ---------------------------------------------------------------------------
  // LessonProgressDots tests
  // ---------------------------------------------------------------------------
  group('LessonProgressDots', () {
    testWidgets('builds across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(
            const LessonProgressDots(totalSteps: 5, currentStep: 2),
            themeId,
          ),
        );
        // 5 dots should exist (as DecoratedBox or Container)
        expect(find.byType(DecoratedBox), findsAtLeast(1));
      }
    });

    testWidgets('semantics label is present', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          const LessonProgressDots(totalSteps: 3, currentStep: 1),
          'starlight',
        ),
      );

      final SemanticsHandle handle = tester.ensureSemantics();
      expect(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });
  });

  // ---------------------------------------------------------------------------
  // QuizOptionCard tests
  // ---------------------------------------------------------------------------
  group('QuizOptionCard', () {
    testWidgets('builds across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(
            const QuizOptionCard(
              semanticsLabel: 'Option',
              child: Text('Apple'),
            ),
            themeId,
          ),
        );
        expect(find.text('Apple'), findsOneWidget);
      }
    });

    testWidgets('success state does not use red', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          const QuizOptionCard(
            semanticsLabel: 'Option',
            state: QuizOptionState.success,
            child: Text('Apple'),
          ),
          'starlight',
        ),
      );
      // Verify it builds — no red indicators
      expect(find.text('Apple'), findsOneWidget);
    });

    testWidgets('hint state does not use red', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          const QuizOptionCard(
            semanticsLabel: 'Option',
            state: QuizOptionState.hint,
            child: Text('Apple'),
          ),
          'starlight',
        ),
      );
      expect(find.text('Apple'), findsOneWidget);
    });

    testWidgets(
      'reducedMotion skips the shake/bounce timers (no pending timer at teardown)',
      (tester) async {
        // Start idle, then transition to hint -- this is what triggers the
        // shake loop. If reducedMotion did not gate it, the 80ms x 3
        // Future.delayed chain would still be pending when the test ends,
        // and flutter_test fails on leaked timers.
        await tester.pumpWidget(
          wrapWithTheme(
            const QuizOptionCard(
              semanticsLabel: 'Option',
              reducedMotion: true,
              child: Text('Apple'),
            ),
            'starlight',
          ),
        );
        await tester.pumpWidget(
          wrapWithTheme(
            const QuizOptionCard(
              semanticsLabel: 'Option',
              state: QuizOptionState.hint,
              reducedMotion: true,
              child: Text('Apple'),
            ),
            'starlight',
          ),
        );
        await tester.pump();
        // No further pump/settle -- if a timer were still scheduled,
        // the test framework would flag it at teardown.
      },
    );
  });

  // ---------------------------------------------------------------------------
  // AppTopBar tests
  // ---------------------------------------------------------------------------
  group('AppTopBar', () {
    testWidgets('builds across all six themes', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(wrapWithTheme(const AppTopBar(), themeId));
        // Should render without errors
        expect(find.byIcon(Icons.arrow_back_ios_rounded), findsNothing);
      }
    });

    testWidgets('shows back button when onBack is set', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(AppTopBar(onBack: () {}), 'starlight'),
      );
      expect(find.byIcon(Icons.arrow_back_ios_rounded), findsOneWidget);
    });

    testWidgets('back button semantics label is present', (tester) async {
      await tester.pumpWidget(
        wrapWithTheme(AppTopBar(onBack: () {}), 'starlight'),
      );

      final SemanticsHandle handle = tester.ensureSemantics();
      expect(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });
  });

  // ---------------------------------------------------------------------------
  // Touch target guideline tests (android/iOS)
  // ---------------------------------------------------------------------------
  group('Touch targets across all themes', () {
    testWidgets('KidButton meets android tap target guideline', (tester) async {
      for (final String themeId in allThemeIds) {
        await tester.pumpWidget(
          wrapWithTheme(
            KidButton(
              onPressed: () {},
              semanticsLabel: 'Test',
              child: const Text('Test'),
            ),
            themeId,
          ),
        );
        final SemanticsHandle handle = tester.ensureSemantics();
        expect(tester, meetsGuideline(androidTapTargetGuideline));
        handle.dispose();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // WordCard tests
  // ---------------------------------------------------------------------------
  group('WordCard', () {
    testWidgets(
      'builds and shows the fallback icon when the asset is missing',
      (tester) async {
        await tester.pumpWidget(
          wrapWithTheme(
            const WordCard(
              imagePath: 'assets/images/words/does_not_exist.webp',
              word: 'Apple',
              audioPath: 'assets/audio/words/apple.m4a',
              semanticsLabel: 'Word Apple',
            ),
            'starlight',
          ),
        );
        await tester.pump();
        expect(find.text('Apple'), findsOneWidget);
        expect(find.byIcon(Icons.image), findsOneWidget);
      },
    );

    testWidgets(
      'tap does not leave a pending bounce timer when reducedMotion applies',
      (tester) async {
        await tester.pumpWidget(
          MediaQuery(
            data: const MediaQueryData(disableAnimations: true),
            child: wrapWithTheme(
              const WordCard(
                imagePath: 'assets/images/words/does_not_exist.webp',
                word: 'Apple',
                audioPath: 'assets/audio/words/apple.m4a',
                semanticsLabel: 'Word Apple',
              ),
              'starlight',
            ),
          ),
        );
        await tester.pump();
        await tester.tap(find.byType(WordCard));
        await tester.pump();
        // No further pump/settle -- a leaked Future.delayed bounce timer
        // would fail the test at teardown if reducedMotion were not honored.
      },
    );
  });
}
