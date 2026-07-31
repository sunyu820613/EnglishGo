import 'package:english_go/core/widgets/mascot_tap_easter_egg.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'widgets_test.dart' show wrapWithTheme;

void main() {
  testWidgets('taps below the threshold do not throw or leave pending timers', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      wrapWithTheme(
        const MascotTapEasterEgg(
          semanticsLabel: 'Mascot',
          child: SizedBox(width: 80, height: 80),
        ),
        'starlight',
      ),
    );
    await tester.pump();

    for (int i = 0; i < 4; i++) {
      await tester.tap(find.byType(MascotTapEasterEgg), warnIfMissed: false);
      await tester.pump();
    }
    expect(tester.takeException(), isNull);
  });

  testWidgets('the 5th tap plays the wiggle without throwing', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      wrapWithTheme(
        const MascotTapEasterEgg(
          semanticsLabel: 'Mascot',
          child: SizedBox(width: 80, height: 80),
        ),
        'starlight',
      ),
    );
    await tester.pump();

    for (int i = 0; i < 5; i++) {
      await tester.tap(find.byType(MascotTapEasterEgg), warnIfMissed: false);
      await tester.pump();
    }
    // Let the wiggle animation run to completion so no timer/ticker leaks.
    await tester.pump(const Duration(milliseconds: 900));
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'reducedMotion still acknowledges the 5th tap with no pending animation',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithTheme(
          const MascotTapEasterEgg(
            semanticsLabel: 'Mascot',
            reducedMotion: true,
            child: SizedBox(width: 80, height: 80),
          ),
          'starlight',
        ),
      );
      await tester.pump();

      for (int i = 0; i < 5; i++) {
        await tester.tap(find.byType(MascotTapEasterEgg), warnIfMissed: false);
        await tester.pump();
      }
      expect(tester.takeException(), isNull);
    },
  );
}
