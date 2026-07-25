import 'package:english_go/core/theme/app_theme.dart';
import 'package:english_go/core/theme/kid_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final KidThemeExtension a = allThemes['starlight']!;
  final KidThemeExtension b = allThemes['dessert']!;

  group('KidThemeExtension 14 colours', () {
    for (final MapEntry<String, KidThemeExtension> entry in allThemes.entries) {
      final String id = entry.key;
      final KidThemeExtension theme = entry.value;

      test('$id has all 14 colour roles non-null', () {
        expect(theme.background, isNotNull);
        expect(theme.surface, isNotNull);
        expect(theme.surfaceAlt, isNotNull);
        expect(theme.primary, isNotNull);
        expect(theme.onPrimary, isNotNull);
        expect(theme.secondary, isNotNull);
        expect(theme.onSecondary, isNotNull);
        expect(theme.accent, isNotNull);
        expect(theme.text, isNotNull);
        expect(theme.textSoft, isNotNull);
        expect(theme.outline, isNotNull);
        expect(theme.shadowTint, isNotNull);
        expect(theme.success, isNotNull);
        expect(theme.focus, isNotNull);
      });

      test('$id has non-null assets', () {
        expect(theme.assets, isNotNull);
      });
    }
  });

  group('KidThemeExtension.isLight', () {
    test('starlight (dark) is false', () {
      expect(allThemes['starlight']!.isLight, isFalse);
    });

    test('dino (light) is true', () {
      expect(allThemes['dino']!.isLight, isTrue);
    });

    test('robot (light) is true', () {
      expect(allThemes['robot']!.isLight, isTrue);
    });

    test('moonGarden (dark) is false', () {
      expect(allThemes['moonGarden']!.isLight, isFalse);
    });

    test('balletCastle (light) is true', () {
      expect(allThemes['balletCastle']!.isLight, isTrue);
    });

    test('dessert (light) is true', () {
      expect(allThemes['dessert']!.isLight, isTrue);
    });
  });

  group('KidThemeExtension.copyWith', () {
    test('returns same instance when no args', () {
      final KidThemeExtension copied = a.copyWith();
      expect(copied.background, a.background);
      expect(copied.assets, a.assets);
    });

    test('overrides requested field', () {
      const Color newBg = Color(0xFF000000);
      final KidThemeExtension copied = a.copyWith(background: newBg);
      expect(copied.background, newBg);
      expect(copied.surface, a.surface); // unchanged
    });
  });

  group('KidThemeExtension.lerp', () {
    test('lerp(0) returns this', () {
      final KidThemeExtension result = a.lerp(b, 0.0);
      expect(result.background, a.background);
      expect(result.assets, a.assets);
    });

    test('lerp(1) returns other', () {
      final KidThemeExtension result = a.lerp(b, 1.0);
      expect(result.background, b.background);
      expect(result.assets, b.assets);
    });

    test('lerp(0.5) interpolates colours', () {
      final KidThemeExtension result = a.lerp(b, 0.5);
      // At midpoint colours should differ from both endpoints.
      expect(result.background, isNot(a.background));
      expect(result.background, isNot(b.background));
    });

    test('lerp(0.5) uses this.assets (t < 0.5)', () {
      final KidThemeExtension result = a.lerp(b, 0.49);
      expect(result.assets, a.assets);
    });

    test('lerp(0.5) uses other.assets (t >= 0.5)', () {
      final KidThemeExtension result = a.lerp(b, 0.5);
      expect(result.assets, b.assets);
    });

    test('lerp with non-KidThemeExtension returns this', () {
      final KidThemeExtension result = a.lerp(null, 0.5);
      expect(result.background, a.background);
    });
  });

  group('KidThemeExtension identity', () {
    test('starlight and dino have different colours', () {
      expect(
        allThemes['starlight']!.background,
        isNot(allThemes['dino']!.background),
      );
    });
  });
}
