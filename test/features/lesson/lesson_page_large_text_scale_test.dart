import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/quiz_option_card.dart';
import 'package:english_go/features/lesson/lesson_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Kept in its own file (rather than alongside lesson_page_test.dart):
// running two testWidgets blocks that both drive LessonPage's real
// alphabet.json load in the same test process causes the second
// rootBundle.loadString call to hang indefinitely (a flutter_test
// asset-cache quirk unrelated to app code). Separate files run in
// separate processes, which sidesteps it.
void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  Widget wrapWithRouter({double textScale = 1.0}) {
    final GoRouter router = GoRouter(
      initialLocation: '/lesson/A',
      routes: <RouteBase>[
        GoRoute(
          path: '/lesson/:letter',
          builder: (BuildContext context, GoRouterState state) =>
              const LessonPage(letter: 'A'),
        ),
        GoRoute(
          path: '/map',
          builder: (BuildContext context, GoRouterState state) =>
              const Scaffold(body: Text('Map')),
        ),
      ],
    );
    return ProviderScope(
      child: MaterialApp.router(
        theme: buildThemeData(allThemes['starlight']!),
        routerConfig: router,
        builder: (BuildContext context, Widget? child) {
          return MediaQuery(
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: TextScaler.linear(textScale)),
            child: child ?? const SizedBox.shrink(),
          );
        },
      ),
    );
  }

  testWidgets('steps 0-7 have no overflow at 200% text scale', (
    WidgetTester tester,
  ) async {
    // Bounded pump() calls rather than pumpAndSettle(): the scroll-safety
    // wrapper added for large-text-scale support keeps a scrollbar-fade
    // animation alive briefly, which is a known source of pumpAndSettle
    // non-convergence with scrollables and unrelated to overflow
    // correctness (the thing this test actually checks).
    Future<void> settle() async {
      for (int i = 0; i < 6; i++) {
        await tester.pump(const Duration(milliseconds: 200));
      }
    }

    await tester.pumpWidget(wrapWithRouter(textScale: 2.0));
    await settle();
    expect(tester.takeException(), isNull);

    Future<void> tapNextChecked(String label) async {
      final Finder button = find.widgetWithText(KidButton, label);
      // At 2x text scale some steps are taller than the viewport and the
      // button sits below the fold inside a scroll view; scroll it into
      // view first so the tap lands on it instead of missing silently.
      await tester.ensureVisible(button);
      await settle();
      await tester.tap(button, warnIfMissed: false);
      await settle();
      expect(tester.takeException(), isNull);
    }

    await tapNextChecked('Start');
    await tapNextChecked('Next'); // name -> phonics
    await tapNextChecked('Next'); // phonics -> word1
    await tapNextChecked('Next'); // word1 -> word1 tap
    await tapNextChecked('Next'); // word1 tap -> word2
    await tapNextChecked('Next'); // word2 -> word2 tap
    await tapNextChecked('Next'); // word2 tap -> quiz

    expect(find.byType(QuizOptionCard), findsNWidgets(3));
  });
}
