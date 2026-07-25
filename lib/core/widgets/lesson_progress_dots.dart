import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// Step progress indicator using dots.
///
/// Current step dot is scaled 1.3x.
/// No percentage or countdown text (child-friendly).
class LessonProgressDots extends StatelessWidget {
  const LessonProgressDots({
    super.key,
    required this.totalSteps,
    required this.currentStep,
    this.dotSize = 12,
  });

  final int totalSteps;
  final int currentStep;
  final double dotSize;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    return Semantics(
      label: 'Step $currentStep of $totalSteps',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List<Widget>.generate(totalSteps, (int i) {
          final bool isCurrent = i == currentStep;
          final bool isCompleted = i < currentStep;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: Space.xs / 2),
            child: AnimatedContainer(
              duration: Motion.standard,
              curve: Motion.standardCurve,
              width: isCurrent ? dotSize * 1.3 : dotSize,
              height: dotSize,
              decoration: BoxDecoration(
                color: isCompleted
                    ? (theme?.primary ?? Colors.blue)
                    : isCurrent
                    ? (theme?.accent ?? Colors.amber)
                    : (theme?.outline ?? Colors.grey).withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
            ),
          );
        }),
      ),
    );
  }
}
