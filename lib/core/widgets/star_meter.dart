import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// Displays three stars representing lesson progress.
///
/// Empty stars use outline style (not grey solid) to avoid "failure" feel.
/// Stars animate with celebrate motion when earned.
class StarMeter extends StatelessWidget {
  const StarMeter({
    super.key,
    this.filled = 0,
    this.total = 3,
    this.size = TouchSize.kid,
  });

  final int filled;
  final int total;
  final double size;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    return Semantics(
      label: 'Stars: $filled of $total',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List<Widget>.generate(total, (int i) {
          final bool isFilled = i < filled;
          return Padding(
            padding: const EdgeInsets.all(Space.xs / 2),
            child: Icon(
              isFilled ? Icons.star : Icons.star_border,
              size: size,
              color: isFilled
                  ? (theme?.accent ?? Colors.amber)
                  : (theme?.outline ?? Colors.grey),
            ),
          );
        }),
      ),
    );
  }
}
