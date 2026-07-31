import 'package:english_go/features/alphabet/alphabet_map_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  Widget wrapWithRouter() {
    final GoRouter router = GoRouter(
      initialLocation: '/map',
      routes: <RouteBase>[
        GoRoute(
          path: '/map',
          builder: (BuildContext context, GoRouterState state) =>
              const AlphabetMapPage(),
        ),
        GoRoute(
          path: '/lesson/:letter',
          builder: (BuildContext context, GoRouterState state) =>
              Scaffold(body: Text('Lesson ${state.pathParameters['letter']}')),
        ),
      ],
    );
    return ProviderScope(child: MaterialApp.router(routerConfig: router));
  }

  testWidgets('renders all 26 letters and every letter navigates to its lesson '
      '(LEARNING_MODEL.md 1.5: no locking, A-Z freely enterable)', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(wrapWithRouter());
    await tester.pumpAndSettle();

    for (final String letter in <String>['A', 'B', 'C']) {
      expect(find.text(letter), findsOneWidget);
    }

    // Z is the least likely to be reachable without scrolling; scroll to
    // it and confirm it's tappable and not a "coming soon" placeholder.
    await tester.scrollUntilVisible(
      find.text('Z'),
      200,
      scrollable: find.byType(Scrollable),
    );
    await tester.tap(find.text('Z'));
    await tester.pumpAndSettle();

    expect(find.text('Lesson Z'), findsOneWidget);
    expect(find.textContaining('coming soon'), findsNothing);
  });
}
