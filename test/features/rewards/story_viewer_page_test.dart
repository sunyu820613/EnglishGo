import 'dart:async';

import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/features/rewards/story_viewer_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

// Overrides storiesFutureProvider with fixture data instead of loading the
// real stories.json asset: this file is testing StoryViewerPage's own
// paging/navigation logic, not StoryRepository's parsing (already covered
// by story_repository_test.dart). Image paths below point at real bundled
// files to avoid Image.asset load-retry loops during pumpAndSettle().
//
// IMPORTANT: GoRouter.push()'s returned Future resolves only when the
// pushed route is later popped (Navigator.push semantics) -- awaiting it
// here would deadlock forever, since we need to interact with the pushed
// page (tap Next/Finish) before it ever pops. Use unawaited() instead.
const List<MiniStory> _fixtureStories = <MiniStory>[
  MiniStory(
    id: 'story_abc',
    title: 'A Sunny Day',
    requiredLetters: <String>['A', 'B', 'C'],
    pages: <StoryPage>[
      StoryPage(
        text: 'Cat has a red ball.',
        image: 'images/stories/story_abc_1.webp',
      ),
      StoryPage(
        text: 'Bear has a big apple.',
        image: 'images/stories/story_abc_2.webp',
      ),
      StoryPage(
        text: 'Then they ride home in the car. "That was fun!"',
        image: 'images/stories/story_abc_5.webp',
      ),
    ],
  ),
];

void main() {
  GoRouter buildRouter() {
    return GoRouter(
      initialLocation: '/rewards',
      routes: <RouteBase>[
        GoRoute(
          path: '/rewards',
          builder: (BuildContext context, GoRouterState state) =>
              const Scaffold(body: Text('Rewards')),
        ),
        GoRoute(
          path: '/story/:id',
          builder: (BuildContext context, GoRouterState state) =>
              StoryViewerPage(storyId: state.pathParameters['id']!),
        ),
      ],
    );
  }

  Widget wrapWithRouter(GoRouter router) {
    return ProviderScope(
      overrides: [
        storiesFutureProvider.overrideWith((Ref ref) async => _fixtureStories),
      ],
      child: MaterialApp.router(routerConfig: router),
    );
  }

  testWidgets('steps through every page and pops on Finish', (
    WidgetTester tester,
  ) async {
    final GoRouter router = buildRouter();
    await tester.pumpWidget(wrapWithRouter(router));
    await tester.pumpAndSettle();
    unawaited(router.push('/story/story_abc'));
    await tester.pumpAndSettle();

    expect(find.text('Cat has a red ball.'), findsOneWidget);

    for (int i = 0; i < 2; i++) {
      await tester.tap(find.widgetWithText(KidButton, 'Next'));
      await tester.pumpAndSettle();
    }

    expect(
      find.text('Then they ride home in the car. "That was fun!"'),
      findsOneWidget,
    );
    expect(find.widgetWithText(KidButton, 'The End'), findsOneWidget);

    await tester.tap(find.widgetWithText(KidButton, 'The End'));
    await tester.pumpAndSettle();

    // Popped back to the previous route.
    expect(find.text('Rewards'), findsOneWidget);
  });

  testWidgets('shows a not-found message for an unknown story id', (
    WidgetTester tester,
  ) async {
    final GoRouter router = buildRouter();
    await tester.pumpWidget(wrapWithRouter(router));
    await tester.pumpAndSettle();
    unawaited(router.push('/story/does_not_exist'));
    await tester.pumpAndSettle();

    expect(find.text('Story not found.'), findsOneWidget);
  });
}
