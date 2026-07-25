// WCAG 2.1 relative luminance and contrast ratio utilities.
// Shared by KidThemeExtension.isLight and the contrast test suite.

import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Linearize an sRGB channel value (0.0-1.0).
double linearizeChannel(double c) {
  return c <= 0.03928
      ? c / 12.92
      : math.pow((c + 0.055) / 1.055, 2.4).toDouble();
}

/// WCAG 2.1 relative luminance of an sRGB [Color].
double relativeLuminance(Color color) {
  final double r = linearizeChannel(color.r);
  final double g = linearizeChannel(color.g);
  final double b = linearizeChannel(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/// WCAG 2.1 contrast ratio between two colours (range 1:1 to 21:1).
double contrastRatio(Color a, Color b) {
  final double l1 = relativeLuminance(a);
  final double l2 = relativeLuminance(b);
  final double lighter = l1 > l2 ? l1 : l2;
  final double darker = l1 > l2 ? l2 : l1;
  return (lighter + 0.05) / (darker + 0.05);
}
