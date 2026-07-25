import 'package:english_go/app/router.dart';
import 'package:english_go/data/progress/progress_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Regression test for a real deadlock: the redirect logic used to gate
// every non-onboarding route on "does the user have lesson progress?",
// but a first-time user can only earn progress by reaching a lesson, which
// itself requires passing through /home and /map first. That combination
// made it impossible to ever leave onboarding. The fix tracks onboarding
// completion as its own explicit flag (SettingsData.onboardingComplete).
class _RouterHost extends ConsumerStatefulWidget {
  const _RouterHost();

  @override
  ConsumerState<_RouterHost> createState() => _RouterHostState();
}

class _RouterHostState extends ConsumerState<_RouterHost> {
  late final GoRouter router = buildRouter(ref);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(routerConfig: router);
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets(
    'a first-time user is redirected to onboarding, and completing it unlocks /home',
    (WidgetTester tester) async {
      await tester.pumpWidget(const ProviderScope(child: _RouterHost()));
      await tester.pumpAndSettle();

      final _RouterHostState hostState = tester.state(find.byType(_RouterHost));
      final GoRouter router = hostState.router;

      // Fresh install: /home must redirect to /onboarding, not get stuck.
      expect(
        router.routerDelegate.currentConfiguration.uri.toString(),
        '/onboarding',
      );

      // Completing onboarding must actually unlock /home going forward.
      final ProviderContainer container = ProviderScope.containerOf(
        tester.element(find.byType(_RouterHost)),
      );
      await container.read(progressProvider.notifier).completeOnboarding();
      router.go('/home');
      await tester.pumpAndSettle();

      expect(
        router.routerDelegate.currentConfiguration.uri.toString(),
        '/home',
      );
    },
  );
}
