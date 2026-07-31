import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/quiz_option_card.dart';
import 'package:english_go/features/lesson/lesson_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Kept in its own file (rootBundle double-load hang, see
// lesson_page_large_text_scale_test.dart).
void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets('tapping Next repeatedly with only a short pump between each tap '
      '(not pumpAndSettle -- simulating a real user tapping quickly, '
      'mid-transition) still advances exactly once per tap, landing on the '
      'quiz after Start + 6 Nexts', (WidgetTester tester) async {
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

    Future<void> rapidTap(String label) async {
      await tester.tap(find.widgetWithText(KidButton, label));
      // Short pump only, well inside Motion.standard (320ms) -- the
      // outgoing step's exit fade would still be mid-flight here if
      // reverseDuration weren't zero.
      await tester.pump(const Duration(milliseconds: 50));
    }

    await rapidTap('Start'); // mascot -> name
    await rapidTap('Next'); // name -> phonics
    await rapidTap('Next'); // phonics -> word1
    await rapidTap('Next'); // word1 -> word1 tap
    await rapidTap('Next'); // word1 tap -> word2
    await rapidTap('Next'); // word2 -> word2 tap
    await rapidTap('Next'); // word2 tap -> quiz
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.byType(QuizOptionCard), findsNWidgets(3));
  });
}
