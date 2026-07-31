import 'package:english_go/core/tracing/letter_paths.dart';
import 'package:english_go/core/widgets/tracing_canvas.dart';
import 'package:flutter_test/flutter_test.dart';

import 'widgets_test.dart' show wrapWithTheme;

void main() {
  testWidgets(
    'dragging along every stroke of the letter path calls onComplete',
    (WidgetTester tester) async {
      int completedCount = 0;
      const double size = 260;

      await tester.pumpWidget(
        wrapWithTheme(
          TracingCanvas(letter: 'L', onComplete: () => completedCount++),
          'starlight',
        ),
      );
      await tester.pump();

      final Offset topLeft = tester.getTopLeft(find.byType(TracingCanvas));
      const double scale = size / 100;
      Offset toGlobal(Offset unit) => topLeft + unit * scale;

      for (final List<Offset> stroke in letterStrokes['L']!) {
        final List<Offset> points = <Offset>[
          for (int i = 0; i <= 20; i++)
            Offset.lerp(stroke.first, stroke.last, i / 20)!,
        ];
        final TestGesture gesture = await tester.startGesture(
          toGlobal(points.first),
        );
        for (final Offset p in points.skip(1)) {
          await gesture.moveTo(toGlobal(p));
          await tester.pump();
        }
        await gesture.up();
        await tester.pump();
      }

      expect(completedCount, 1);
    },
  );

  testWidgets(
    'a touch far off the path does not advance progress or complete',
    (WidgetTester tester) async {
      int completedCount = 0;
      const double size = 260;

      await tester.pumpWidget(
        wrapWithTheme(
          TracingCanvas(letter: 'I', onComplete: () => completedCount++),
          'starlight',
        ),
      );
      await tester.pump();

      final Offset topLeft = tester.getTopLeft(find.byType(TracingCanvas));
      // Letter I's stroke runs down the vertical center; drag far to the
      // right edge instead, well outside the 24dp tolerance corridor.
      final TestGesture gesture = await tester.startGesture(
        topLeft + const Offset(size - 5, 10),
      );
      await gesture.moveTo(topLeft + const Offset(size - 5, size - 10));
      await tester.pump();
      await gesture.up();
      await tester.pump();

      expect(completedCount, 0);
    },
  );
}
