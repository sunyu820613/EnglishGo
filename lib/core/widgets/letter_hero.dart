import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// Displays a large letter in the Teaching (Andika) font at letterHero size.
///
/// Used in the lesson page to present the letter being learned.
class LetterHero extends StatelessWidget {
  const LetterHero({super.key, required this.letter, this.color});

  final String letter;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    return Semantics(
      label: 'Letter $letter',
      child: Text(
        letter,
        style: TextStyle(
          fontFamily: FontFamily.teaching,
          fontSize: TypeScale.letterHero,
          color: color ?? theme?.primary ?? Colors.black,
          fontWeight: FontWeight.bold,
          height: 1.2,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
