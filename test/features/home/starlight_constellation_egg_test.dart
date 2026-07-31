import 'package:english_go/core/theme/theme_controller.dart';
import 'package:english_go/features/home/starlight_constellation_egg.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return ProviderScope(
      child: MaterialApp(
        theme: buildThemeData(allThemes['starlight']!),
        home: Scaffold(body: SizedBox(width: 360, height: 640, child: child)),
      ),
    );
  }

  testWidgets('tapping the 3 hidden stars in order reveals the constellation', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      wrap(const StarlightConstellationEgg(reducedMotion: true)),
    );
    await tester.pump();

    final Finder stars = find.bySemanticsLabel('Hidden star');
    expect(stars, findsNWidgets(3));

    for (int i = 0; i < 3; i++) {
      await tester.tap(stars.at(i));
      await tester.pump();
    }

    expect(tester.takeException(), isNull);
  });

  testWidgets('tapping out of order resets silently (no exception, no crash)', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      wrap(const StarlightConstellationEgg(reducedMotion: true)),
    );
    await tester.pump();

    final Finder stars = find.bySemanticsLabel('Hidden star');
    // Tap star 2 first (wrong -- correct order starts at star 0).
    await tester.tap(stars.at(2));
    await tester.pump();
    await tester.tap(stars.at(0));
    await tester.pump();

    expect(tester.takeException(), isNull);
  });
}
