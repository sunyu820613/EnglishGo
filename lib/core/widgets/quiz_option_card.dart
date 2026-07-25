import 'dart:async';

import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// A quiz answer option card.
///
/// States:
///   - [QuizOptionState.idle]: default appearance.
///   - [QuizOptionState.success]: success outline + bounce animation.
///   - [QuizOptionState.hint]: shake 6 degrees x 2, no red color.
class QuizOptionCard extends StatefulWidget {
  const QuizOptionCard({
    super.key,
    required this.child,
    required this.semanticsLabel,
    this.state = QuizOptionState.idle,
    this.onTap,
  });

  final Widget child;
  final String semanticsLabel;
  final QuizOptionState state;
  final VoidCallback? onTap;

  @override
  State<QuizOptionCard> createState() => _QuizOptionCardState();
}

class _QuizOptionCardState extends State<QuizOptionCard>
    with SingleTickerProviderStateMixin {
  double _scale = 1.0;
  double _rotation = 0.0;

  @override
  void didUpdateWidget(QuizOptionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.state != widget.state) {
      if (widget.state == QuizOptionState.success) {
        _playSuccessAnimation();
      } else if (widget.state == QuizOptionState.hint) {
        _playHintAnimation();
      }
    }
  }

  void _playSuccessAnimation() {
    setState(() => _scale = 1.08);
    unawaited(
      Future<void>.delayed(Motion.micro, () {
        if (mounted) setState(() => _scale = 1.0);
      }),
    );
  }

  void _playHintAnimation() {
    // Shake: 6 degrees x 2
    const double shakeAngle = 6.0;
    unawaited(
      Future.doWhile(() async {
        setState(() => _rotation = shakeAngle);
        await Future<void>.delayed(const Duration(milliseconds: 80));
        if (!mounted) return false;
        setState(() => _rotation = -shakeAngle);
        await Future<void>.delayed(const Duration(milliseconds: 80));
        if (!mounted) return false;
        setState(() => _rotation = 0.0);
        await Future<void>.delayed(const Duration(milliseconds: 80));
        if (!mounted) return false;
        return false; // Run only once (2 shakes total).
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    final Color borderColor;
    switch (widget.state) {
      case QuizOptionState.success:
        borderColor = theme?.success ?? Colors.green;
      case QuizOptionState.hint:
        borderColor = theme?.outline ?? Colors.grey;
      case QuizOptionState.idle:
        borderColor = theme?.outline ?? Colors.grey;
    }

    final double borderWidth;
    switch (widget.state) {
      case QuizOptionState.success:
        borderWidth = 3;
      case QuizOptionState.hint:
        borderWidth = IconStroke.width;
      case QuizOptionState.idle:
        borderWidth = IconStroke.width;
    }

    return Semantics(
      label: widget.semanticsLabel,
      button: widget.onTap != null,
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _scale,
          duration: Motion.micro,
          curve: Motion.microCurve,
          child: Transform.rotate(
            angle: _rotation * (3.14159 / 180.0),
            child: AnimatedContainer(
              duration: Motion.standard,
              decoration: BoxDecoration(
                color: theme?.surface ?? Colors.white,
                borderRadius: BorderRadius.circular(KidRadius.lg),
                border: Border.all(color: borderColor, width: borderWidth),
              ),
              padding: const EdgeInsets.all(Space.md),
              child: widget.child,
            ),
          ),
        ),
      ),
    );
  }
}

enum QuizOptionState { idle, success, hint }
