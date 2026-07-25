import 'package:flutter/material.dart';

import '../kid_theme.dart';
import '../theme_assets.dart';

/// Robot -- future robotics lab (light background).
/// Mascot: Bolt the round robot.
const robotTheme = KidThemeExtension(
  background: Color(0xFFEDF0F5),
  surface: Color(0xFFFBFCFE),
  surfaceAlt: Color(0xFFE1E6EE),
  primary: Color(0xFF2F5DD0),
  onPrimary: Color(0xFFF4F8FF),
  secondary: Color(0xFF8E99AB),
  onSecondary: Color(0xFF1D232E),
  accent: Color(0xFFF2762E),
  text: Color(0xFF272D38),
  textSoft: Color(0xFF5C6675),
  outline: Color(0xFF39404D),
  shadowTint: Color(0xFF7C8AA4),
  success: Color(0xFF3FA96E),
  focus: Color(0xFFF2762E),
  assets: ThemeAssetSets.robot,
);
