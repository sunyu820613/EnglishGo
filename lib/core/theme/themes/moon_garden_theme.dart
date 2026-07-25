import 'package:flutter/material.dart';

import '../kid_theme.dart';
import '../theme_assets.dart';

/// Moon Garden -- moonlight magic garden (dark background).
/// Mascot: Luna the moon rabbit.
const moonGardenTheme = KidThemeExtension(
  background: Color(0xFF2B2144),
  surface: Color(0xFF3A2E58),
  surfaceAlt: Color(0xFF332950),
  primary: Color(0xFFA8C4A2),
  onPrimary: Color(0xFF1F2B1E),
  secondary: Color(0xFF584A7E),
  onSecondary: Color(0xFFF0EAF8),
  accent: Color(0xFFE8A98F),
  text: Color(0xFFF4EFFA),
  textSoft: Color(0xFFBDB0D6),
  outline: Color(0xFF1D1733),
  shadowTint: Color(0xFF170F2E),
  success: Color(0xFF9AD6A8),
  focus: Color(0xFFE8A98F),
  assets: ThemeAssetSets.moonGarden,
);
