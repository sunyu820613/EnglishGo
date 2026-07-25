import 'package:english_go/core/theme/tokens.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Space tokens', () {
    test('values match DESIGN.md 2.1', () {
      expect(Space.xs, 8);
      expect(Space.sm, 12);
      expect(Space.md, 16);
      expect(Space.lg, 24);
      expect(Space.xl, 32);
      expect(Space.xxl, 48);
      expect(Space.pageMobile, 24);
      expect(Space.pageTablet, 48);
    });

    test('page returns mobile value when isTablet is false', () {
      expect(Space.page(isTablet: false), Space.pageMobile);
    });

    test('page returns tablet value when isTablet is true', () {
      expect(Space.page(isTablet: true), Space.pageTablet);
    });
  });

  group('KidRadius tokens', () {
    test('values match DESIGN.md 2.2', () {
      expect(KidRadius.sm, 16);
      expect(KidRadius.md, 24);
      expect(KidRadius.lg, 32);
      expect(KidRadius.xl, 44);
      expect(KidRadius.full, 999);
    });
  });

  group('TouchSize tokens', () {
    test('values match DESIGN.md 2.4', () {
      expect(TouchSize.min, 48);
      expect(TouchSize.kid, 64);
      expect(TouchSize.primary, 88);
      expect(TouchSize.gap, 12);
    });
  });

  group('TypeScale tokens', () {
    test('values match DESIGN.md 2.5', () {
      expect(TypeScale.letterHero, 120);
      expect(TypeScale.display, 40);
      expect(TypeScale.title, 28);
      expect(TypeScale.body, 18);
      expect(TypeScale.caption, 14);
    });
  });

  group('FontFamily tokens', () {
    test('values match DESIGN.md 2.5', () {
      expect(FontFamily.display, 'Baloo2');
      expect(FontFamily.body, 'Nunito');
      expect(FontFamily.teaching, 'Andika');
    });
  });

  group('Motion tokens', () {
    test('durations match DESIGN.md 2.6', () {
      expect(Motion.press, const Duration(milliseconds: 120));
      expect(Motion.micro, const Duration(milliseconds: 220));
      expect(Motion.standard, const Duration(milliseconds: 320));
      expect(Motion.page, const Duration(milliseconds: 420));
      expect(Motion.celebrate, const Duration(milliseconds: 800));
      expect(Motion.idle, const Duration(milliseconds: 2400));
    });
  });

  group('Layer tokens', () {
    test('values match DESIGN.md 2.8', () {
      expect(Layer.background, 0);
      expect(Layer.decoration, 1);
      expect(Layer.content, 2);
      expect(Layer.character, 3);
      expect(Layer.overlay, 4);
      expect(Layer.dialog, 5);
    });
  });
}
