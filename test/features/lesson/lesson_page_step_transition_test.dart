import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/letter_hero.dart';
import 'package:english_go/features/lesson/lesson_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Kept in its own file: a second testWidgets in the same file that also
// drives LessonPage's real alphabet.json load hangs on rootBundle's
// second call in this process (see lesson_page_large_text_scale_test.dart
// for the same note).
void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets(
    'the outgoing step is removed immediately on Next, not left hanging '
    'around as a stale hit-testable widget during the fade transition '
    '(previously reproduced as "Next needs two taps")',
    (WidgetTester tester) async {
      final GoRouter router = GoRouter(
        initialLocation: '/lesson/A',
        routes: <RouteBase>[
          GoRoute(
            path: '/lesson/:letter',
            builder: (BuildContext context, GoRouterState state) =>
                const LessonPage(letter: 'A'),
          ),
        ],
      );
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp.router(
            theme: buildThemeData(allThemes['starlight']!),
            routerConfig: router,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(KidButton, 'Start'));
      await tester.pumpAndSettle();

      // Step 1 (letter name, has a LetterHero) -> step 2 (phonics, has
      // "... says ..." text but no LetterHero).
      await tester.tap(find.widgetWithText(KidButton, 'Next'));
      // A single short pump (not pumpAndSettle): if the outgoing step's
      // exit fade were still running (the pre-fix default), step 1's
      // LetterHero would still be in the tree right now, stacked under
      // step 2's incoming content.
      await tester.pump(const Duration(milliseconds: 16));

      expect(find.textContaining('says'), findsOneWidget);
      expect(find.byType(LetterHero), findsNothing);
    },
  );
}
