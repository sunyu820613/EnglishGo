import 'dart:async';

import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/core/widgets/kid_button.dart';
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

  testWidgets('tapping the back arrow once shows a confirm snackbar without '
      'leaving; a second tap actually leaves (the snackbar promised this, '
      'but nothing tracked the first tap having happened)', (
    WidgetTester tester,
  ) async {
    final GoRouter router = GoRouter(
      initialLocation: '/map',
      routes: <RouteBase>[
        GoRoute(
          path: '/map',
          builder: (BuildContext context, GoRouterState state) =>
              const Scaffold(body: Text('Map')),
        ),
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
    unawaited(router.push('/lesson/A'));
    await tester.pumpAndSettle();

    // Advance past step 0 so _goBack's confirm-before-leaving path
    // actually applies (it's a no-op on the very first step).
    await tester.tap(find.widgetWithText(KidButton, 'Start'));
    await tester.pumpAndSettle();

    final Finder backButton = find.bySemanticsLabel('Leave lesson');
    expect(backButton, findsOneWidget);

    await tester.tap(backButton);
    await tester.pump();
    expect(find.text('Tap again to leave lesson'), findsOneWidget);
    expect(find.text('Map'), findsNothing); // still on the lesson

    await tester.tap(backButton);
    await tester.pumpAndSettle();

    expect(find.text('Map'), findsOneWidget);
  });
}
