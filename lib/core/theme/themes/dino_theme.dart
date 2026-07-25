import 'package:flutter/material.dart';

import '../kid_theme.dart';
import '../theme_assets.dart';

/// Dino -- dinosaur natural history museum (light background).
/// Mascot: Trixie the triceratops.
const dinoTheme = KidThemeExtension(
  background: Color(0xFFF5EFDE),
  surface: Color(0xFFFDFAF0),
  surfaceAlt: Color(0xFFEDE4CC),
  primary: Color(0xFF4A7C59),
  onPrimary: Color(0xFFF7FBF2),
  secondary: Color(0xFFC9A87C),
  onSecondary: Color(0xFF33291A),
  accent: Color(0xFFE8A33D),
  text: Color(0xFF332E24),
  textSoft: Color(0xFF6E6551),
  outline: Color(0xFF4A4234),
  shadowTint: Color(0xFF8A7A57),
  success: Color(0xFF5FA671),
  focus: Color(0xFFE8A33D),
  assets: ThemeAssetSets.dino,
);
