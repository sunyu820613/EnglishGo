import 'package:flutter/material.dart';

import '../kid_theme.dart';
import '../theme_assets.dart';

/// Starlight -- space exploration station (dark background).
/// Mascot: Foxo the astronaut fox.
const starlightTheme = KidThemeExtension(
  background: Color(0xFF1C2A4A),
  surface: Color(0xFF28395E),
  surfaceAlt: Color(0xFF22314F),
  primary: Color(0xFF53C7DE),
  onPrimary: Color(0xFF0E2038),
  secondary: Color(0xFF3D5480),
  onSecondary: Color(0xFFEAF3FB),
  accent: Color(0xFFF6C05C),
  text: Color(0xFFF2F6FC),
  textSoft: Color(0xFFAFC0DC),
  outline: Color(0xFF122038),
  shadowTint: Color(0xFF0B1830),
  success: Color(0xFF7FD8A4),
  focus: Color(0xFFF6C05C),
  assets: ThemeAssetSets.starlight,
);
