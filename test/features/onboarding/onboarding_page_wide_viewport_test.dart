import 'package:english_go/features/onboarding/onboarding_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets('the theme card row is centered (not left-anchored) on a wide '
      'viewport where all 6 cards fit without scrolling', (
    WidgetTester tester,
  ) async {
    tester.view.physicalSize = const Size(1884, 840);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: OnboardingPage())),
    );
    await tester.pump();

    // No scrollable should be in play once everything fits -- confirms
    // the centered-Row branch was taken, not the ListView fallback.
    expect(find.byType(ListView), findsNothing);

    final Finder cards = find.text('starlight');
    final double leftEdge = tester.getTopLeft(cards).dx;
    final double rightEdgeOfLastCard = tester
        .getTopRight(find.text('dessert'))
        .dx;
    final double screenWidth = tester.view.physicalSize.width;

    final double leadingGap = leftEdge;
    final double trailingGap = screenWidth - rightEdgeOfLastCard;

    // Centered means both gaps are roughly equal, not "leading gap ~24
    // (the screen padding) and trailing gap ~800 (the rest of a wide
    // screen)" as it was before the fix.
    expect((leadingGap - trailingGap).abs(), lessThan(80));
  });
}
