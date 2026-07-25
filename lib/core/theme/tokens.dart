// Structural design tokens -- single source of truth for layout values.
// All values match DESIGN.md §2 exactly.
// No hardcoded colors, radii, shadows, durations, or spacing
// outside this file and ThemeExtension instances.

import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// 2.1 Spacing (4/8 grid, child-friendly density)
// ---------------------------------------------------------------------------
class Space {
  Space._();
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static double page({required bool isTablet}) =>
      isTablet ? pageTablet : pageMobile;
  static const double pageMobile = 24;
  static const double pageTablet = 48;
}

// ---------------------------------------------------------------------------
// 2.2 Border radius
// ---------------------------------------------------------------------------
class KidRadius {
  KidRadius._();
  static const double sm = 16;
  static const double md = 24;
  static const double lg = 32;
  static const double xl = 44;
  static const double full = 999;
}

// ---------------------------------------------------------------------------
// 2.3 Shadows (Soft-Clay double layer, tint from theme shadowTint)
// ---------------------------------------------------------------------------
class KidShadows {
  KidShadows._();

  /// Rest state: outer drop + inner highlight (light themes only).
  static List<BoxShadow> rest(Color shadowTint, {required bool isLightTheme}) {
    return [
      BoxShadow(
        offset: const Offset(0, 6),
        blurRadius: 18,
        color: shadowTint.withValues(alpha: 0.22),
      ),
      if (isLightTheme)
        BoxShadow(
          offset: const Offset(0, -2),
          blurRadius: 6,
          color: const Color(0xFFFFFFFF).withValues(alpha: 0.35),
        ),
    ];
  }

  /// Raised / hover state.
  static List<BoxShadow> raised(Color shadowTint) {
    return [
      BoxShadow(
        offset: const Offset(0, 10),
        blurRadius: 28,
        color: shadowTint.withValues(alpha: 0.28),
      ),
    ];
  }

  /// Pressed state (paired with scale 0.96).
  static List<BoxShadow> pressed(Color shadowTint) {
    return [
      BoxShadow(
        offset: const Offset(0, 2),
        blurRadius: 8,
        color: shadowTint.withValues(alpha: 0.18),
      ),
    ];
  }
}

// ---------------------------------------------------------------------------
// 2.4 Touch target sizes
// ---------------------------------------------------------------------------
class TouchSize {
  TouchSize._();
  static const double min = 48;
  static const double kid = 64;
  static const double primary = 88;
  static const double gap = 12;
}

// ---------------------------------------------------------------------------
// 2.5 Typography
// ---------------------------------------------------------------------------
class FontFamily {
  FontFamily._();
  static const String display = 'Baloo2';
  static const String body = 'Nunito';
  static const String teaching = 'Andika';
}

class TypeScale {
  TypeScale._();
  static const double letterHero = 120;
  static const double display = 40;
  static const double title = 28;
  static const double body = 18;
  static const double caption = 14; // parent area only
}

// ---------------------------------------------------------------------------
// 2.6 Motion
// ---------------------------------------------------------------------------
class Motion {
  Motion._();

  // Durations (ms)
  static const Duration press = Duration(milliseconds: 120);
  static const Duration micro = Duration(milliseconds: 220);
  static const Duration standard = Duration(milliseconds: 320);
  static const Duration page = Duration(milliseconds: 420);
  static const Duration celebrate = Duration(milliseconds: 800);
  static const Duration idle = Duration(milliseconds: 2400);

  // Curves
  static const Curve pressCurve = Curves.easeOut;
  static const Curve microCurve = Curves.easeOutBack;
  static const Curve standardCurve = Curves.easeOutCubic;
  static const Curve pageCurve = Curves.easeInOutCubic;
  static const Curve celebrateCurve = Curves.bounceOut;
  static const Curve idleCurve = Curves.easeInOutSine;
}

// ---------------------------------------------------------------------------
// 2.7 Stroke width
// ---------------------------------------------------------------------------
class IconStroke {
  IconStroke._();
  static const double width = 2.5;
}

// ---------------------------------------------------------------------------
// 2.8 Z-index layers
// ---------------------------------------------------------------------------
class Layer {
  Layer._();
  static const int background = 0;
  static const int decoration = 1;
  static const int content = 2;
  static const int character = 3;
  static const int overlay = 4;
  static const int dialog = 5;
}
