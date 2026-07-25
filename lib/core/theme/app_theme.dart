import 'package:flutter/material.dart';

import 'kid_theme.dart';
import 'themes/ballet_castle_theme.dart';
import 'themes/dessert_theme.dart';
import 'themes/dino_theme.dart';
import 'themes/moon_garden_theme.dart';
import 'themes/robot_theme.dart';
import 'themes/starlight_theme.dart';
import 'tokens.dart';

/// All six theme extensions keyed by their string identifier.
const Map<String, KidThemeExtension> allThemes = <String, KidThemeExtension>{
  'starlight': starlightTheme,
  'dino': dinoTheme,
  'robot': robotTheme,
  'moonGarden': moonGardenTheme,
  'balletCastle': balletCastleTheme,
  'dessert': dessertTheme,
};

/// Assemble a full [ThemeData] from a [KidThemeExtension].
ThemeData buildThemeData(KidThemeExtension kidTheme) {
  final ColorScheme colorScheme = ColorScheme(
    brightness: kidTheme.isLight ? Brightness.light : Brightness.dark,
    primary: kidTheme.primary,
    onPrimary: kidTheme.onPrimary,
    secondary: kidTheme.secondary,
    onSecondary: kidTheme.onSecondary,
    surface: kidTheme.surface,
    onSurface: kidTheme.text,
    error: const Color(0xFFD32F2F),
    onError: const Color(0xFFFFFFFF),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    fontFamily: FontFamily.body,
    extensions: <ThemeExtension<KidThemeExtension>>[kidTheme],
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontFamily: FontFamily.display,
        fontSize: TypeScale.display,
      ),
      headlineLarge: TextStyle(
        fontFamily: FontFamily.display,
        fontSize: TypeScale.title,
      ),
      bodyLarge: TextStyle(
        fontFamily: FontFamily.body,
        fontSize: TypeScale.body,
      ),
      bodyMedium: TextStyle(
        fontFamily: FontFamily.body,
        fontSize: TypeScale.body,
      ),
      bodySmall: TextStyle(
        fontFamily: FontFamily.body,
        fontSize: TypeScale.body,
      ),
      labelSmall: TextStyle(
        fontFamily: FontFamily.body,
        fontSize: TypeScale.caption,
      ),
    ),
  );
}
