// KidThemeExtension -- ThemeExtension carrying 14 color roles + ThemeAssets.
// All six themes share this type; switch via ThemeController.

import 'package:flutter/material.dart';

import 'contrast_utils.dart';
import 'theme_assets.dart';

class KidThemeExtension extends ThemeExtension<KidThemeExtension> {
  const KidThemeExtension({
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.accent,
    required this.text,
    required this.textSoft,
    required this.outline,
    required this.shadowTint,
    required this.success,
    required this.focus,
    required this.assets,
  });

  // -- 14 semantic colour roles (THEME_SYSTEM 1) --
  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color primary;
  final Color onPrimary;
  final Color secondary;
  final Color onSecondary;
  final Color accent;
  final Color text;
  final Color textSoft;
  final Color outline;
  final Color shadowTint;
  final Color success;
  final Color focus;

  // -- Theme-specific assets --
  final ThemeAssets assets;

  /// Derived brightness hint based on background luminance.
  bool get isLight => relativeLuminance(background) > 0.179;

  @override
  KidThemeExtension copyWith({
    Color? background,
    Color? surface,
    Color? surfaceAlt,
    Color? primary,
    Color? onPrimary,
    Color? secondary,
    Color? onSecondary,
    Color? accent,
    Color? text,
    Color? textSoft,
    Color? outline,
    Color? shadowTint,
    Color? success,
    Color? focus,
    ThemeAssets? assets,
  }) {
    return KidThemeExtension(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      primary: primary ?? this.primary,
      onPrimary: onPrimary ?? this.onPrimary,
      secondary: secondary ?? this.secondary,
      onSecondary: onSecondary ?? this.onSecondary,
      accent: accent ?? this.accent,
      text: text ?? this.text,
      textSoft: textSoft ?? this.textSoft,
      outline: outline ?? this.outline,
      shadowTint: shadowTint ?? this.shadowTint,
      success: success ?? this.success,
      focus: focus ?? this.focus,
      assets: assets ?? this.assets,
    );
  }

  @override
  KidThemeExtension lerp(ThemeExtension<KidThemeExtension>? other, double t) {
    if (other is! KidThemeExtension) {
      return this;
    }
    return KidThemeExtension(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t)!,
      primary: Color.lerp(primary, other.primary, t)!,
      onPrimary: Color.lerp(onPrimary, other.onPrimary, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      onSecondary: Color.lerp(onSecondary, other.onSecondary, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      text: Color.lerp(text, other.text, t)!,
      textSoft: Color.lerp(textSoft, other.textSoft, t)!,
      outline: Color.lerp(outline, other.outline, t)!,
      shadowTint: Color.lerp(shadowTint, other.shadowTint, t)!,
      success: Color.lerp(success, other.success, t)!,
      focus: Color.lerp(focus, other.focus, t)!,
      assets: t < 0.5 ? assets : other.assets,
    );
  }
}
