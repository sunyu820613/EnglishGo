import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/progress/progress_repository.dart';
import '../features/alphabet/alphabet_map_page.dart';
import '../features/home/home_page.dart';
import '../features/lesson/lesson_page.dart';
import '../features/onboarding/onboarding_page.dart';
import '../features/parent_area/parent_area_page.dart';
import '../features/parent_area/parent_gate_page.dart';
import '../features/rewards/rewards_page.dart';
import '../features/themes/theme_selection_page.dart';

/// GoRouter configuration for EnglishGo.
final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>(
  debugLabel: 'root',
);

GoRouter buildRouter(WidgetRef ref) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/home',
    redirect: (BuildContext context, GoRouterState state) {
      final String uri = state.uri.toString();
      if (uri == '/onboarding' || uri == '/parent-gate') return null;

      final ProgressData progress = ref.read(progressProvider);
      final bool hasProgress =
          progress.letters.isNotEmpty || progress.stickers.isNotEmpty;
      if (!hasProgress && !uri.startsWith('/onboarding')) {
        return '/onboarding';
      }
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/onboarding',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const OnboardingPage(),
      ),
      GoRoute(
        path: '/home',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const HomePage(),
      ),
      GoRoute(
        path: '/themes',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const ThemeSelectionPage(),
      ),
      GoRoute(
        path: '/map',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const AlphabetMapPage(),
      ),
      GoRoute(
        path: '/lesson/:letter',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) {
          final String letter = state.pathParameters['letter'] ?? 'A';
          return LessonPage(letter: letter);
        },
      ),
      GoRoute(
        path: '/rewards',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const RewardsPage(),
      ),
      GoRoute(
        path: '/parent-gate',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const ParentGatePage(),
      ),
      GoRoute(
        path: '/parent',
        parentNavigatorKey: rootNavigatorKey,
        builder: (BuildContext context, GoRouterState state) =>
            const ParentAreaPage(),
      ),
    ],
  );
}
