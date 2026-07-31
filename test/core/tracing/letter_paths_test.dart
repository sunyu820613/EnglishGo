import 'package:english_go/core/tracing/letter_paths.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('every A-Z letter has at least one stroke with at least 2 points', () {
    for (int code = 'A'.codeUnitAt(0); code <= 'Z'.codeUnitAt(0); code++) {
      final String letter = String.fromCharCode(code);
      final List<List<Offset>>? strokes = letterStrokes[letter];
      expect(strokes, isNotNull, reason: '$letter is missing stroke data');
      expect(strokes, isNotEmpty, reason: '$letter has no strokes');
      for (final List<Offset> stroke in strokes!) {
        expect(
          stroke.length,
          greaterThanOrEqualTo(2),
          reason: '$letter has a stroke with fewer than 2 points',
        );
      }
    }
  });

  test('all points stay within the normalized 100x100 unit square', () {
    for (final MapEntry<String, List<List<Offset>>> entry
        in letterStrokes.entries) {
      for (final List<Offset> stroke in entry.value) {
        for (final Offset point in stroke) {
          expect(
            point.dx >= 0 && point.dx <= 100,
            isTrue,
            reason: '${entry.key} has an x coordinate out of bounds: $point',
          );
          expect(
            point.dy >= 0 && point.dy <= 100,
            isTrue,
            reason: '${entry.key} has a y coordinate out of bounds: $point',
          );
        }
      }
    }
  });
}
