import 'dart:convert';

import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/core/widgets/quiz_option_card.dart';
import 'package:english_go/data/progress/progress_repository.dart';
import 'package:english_go/features/lesson/lesson_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Kept in its own file: running alongside lesson_page_test.dart in the same
// process causes a second rootBundle.loadString('alphabet.json') to hang
// (see lesson_page_large_text_scale_test.dart for the same note).
void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{
      'progress.data': jsonEncode(<String, Object>{
        'schemaVersion': 1,
        'themeId': 'starlight',
        'letters': <String, Object>{},
        'stickers': <String>[],
        'settings': <String, Object>{'reducedMotion': true},
      }),
    });
  });

  Future<Widget> wrapWithRouter() async {
    // ProgressRepository.build() starts at defaults; the real app loads
    // persisted settings once at boot via main.dart's explicit
    // loadProgress() call. Reproduce that here so the persisted
    // reducedMotion=true in setUp() actually reaches the provider.
    final ProviderContainer container = ProviderContainer();
    addTearDown(container.dispose);
    await container.read(progressProvider.notifier).loadProgress();

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
    return UncontrolledProviderScope(
      container: container,
      child: MaterialApp.router(
        theme: buildThemeData(allThemes['starlight']!),
        routerConfig: router,
      ),
    );
  }

  testWidgets('quiz step passes the persisted reducedMotion setting into every '
      'QuizOptionCard', (WidgetTester tester) async {
    await tester.pumpWidget(await wrapWithRouter());
    await tester.pumpAndSettle();

    Future<void> tapNext() async {
      await tester.tap(find.widgetWithText(KidButton, 'Next'));
      await tester.pumpAndSettle();
    }

    await tester.tap(find.widgetWithText(KidButton, 'Start'));
    await tester.pumpAndSettle();
    await tapNext(); // name -> phonics
    await tapNext(); // phonics -> word1
    await tapNext(); // word1 -> word1 tap
    await tapNext(); // word1 tap -> word2
    await tapNext(); // word2 -> word2 tap
    await tapNext(); // word2 tap -> quiz

    final Finder options = find.byType(QuizOptionCard);
    expect(options, findsNWidgets(3));

    // Verify the accessibility setting reaches QuizOptionCard rather than
    // driving a real answer tap: a wrong tap plays voice audio via
    // just_audio, which has no platform-channel mock in widget tests and
    // leaves an unrelated pending timer -- a test-environment artifact,
    // not something reducedMotion wiring should be blamed for.
    for (final Element element in options.evaluate()) {
      final QuizOptionCard card = element.widget as QuizOptionCard;
      expect(card.reducedMotion, isTrue);
    }
  });
}
