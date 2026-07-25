import 'package:english_go/core/theme/app_theme.dart';
import 'package:english_go/core/theme/contrast_utils.dart';
import 'package:english_go/core/theme/kid_theme.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  // Expected thresholds per DESIGN.md §3 and THEME_SYSTEM §1.
  const double textBackgroundThreshold = 7.0;
  const double onPrimaryPrimaryThreshold = 4.5;
  const double textSoftBackgroundThreshold = 3.0;

  const Map<String, KidThemeExtension> themes = allThemes;

  for (final MapEntry<String, KidThemeExtension> entry in themes.entries) {
    final String id = entry.key;
    final KidThemeExtension t = entry.value;

    group('$id contrast ratios', () {
      test('text / background >= 7.0', () {
        final double ratio = contrastRatio(t.text, t.background);
        expect(
          ratio,
          greaterThanOrEqualTo(textBackgroundThreshold),
          reason: '$id text/background = $ratio (need >= 7.0)',
        );
      });

      test('onPrimary / primary >= 4.5', () {
        final double ratio = contrastRatio(t.onPrimary, t.primary);
        expect(
          ratio,
          greaterThanOrEqualTo(onPrimaryPrimaryThreshold),
          reason: '$id onPrimary/primary = $ratio (need >= 4.5)',
        );
      });

      test('textSoft / background >= 3.0', () {
        final double ratio = contrastRatio(t.textSoft, t.background);
        expect(
          ratio,
          greaterThanOrEqualTo(textSoftBackgroundThreshold),
          reason: '$id textSoft/background = $ratio (need >= 3.0)',
        );
      });
    });
  }
}
