import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/quiz_option_card.dart';
import 'package:english_go/features/lesson/lesson_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

  testWidgets('steps from mascot entrance through to the quiz', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(wrapWithRouter());
    // Wait for alphabet.json to load via AlphabetRepository.
    await tester.pumpAndSettle();

    // Step 0: mascot entrance shows a letter and a Start button.
    expect(find.text('A'), findsWidgets);
    expect(find.widgetWithText(KidButton, 'Start'), findsOneWidget);

    Future<void> tapNext() async {
      await tester.tap(find.widgetWithText(KidButton, 'Next'));
      await tester.pumpAndSettle();
    }

    await tester.tap(find.widgetWithText(KidButton, 'Start'));
    await tester.pumpAndSettle();

    // Steps 1-2: letter name, phonics.
    await tapNext(); // name -> phonics
    await tapNext(); // phonics -> word1

    // Steps 3-6: word1 display/tap, word2 display/tap.
    await tapNext(); // word1 -> word1 tap
    await tapNext(); // word1 tap -> word2
    await tapNext(); // word2 -> word2 tap
    await tapNext(); // word2 tap -> quiz

    // Step 7: quiz shows three answer options, all three rendering real
    // illustrations -- the letter's own 2 words plus a real cross-letter
    // distractor (not the old hardcoded placeholder icon / blank option).
    expect(find.byType(QuizOptionCard), findsNWidgets(3));
    expect(find.byType(Image), findsNWidgets(3));
    expect(tester.takeException(), isNull);
  });
}
