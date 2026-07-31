import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Wraps a mascot visual with a low-interference easter egg
/// (EASTER_EGGS.md §1: "连点主角色 5 次 → 隐藏动作", one per theme).
///
/// Tapping [child] [tapsRequired] times within a few seconds plays a
/// silly wiggle-and-bounce. It never blocks or replaces the mascot's own
/// tap handling -- callers can still layer their own [GestureDetector]
/// around this widget for other interactions.
class MascotTapEasterEgg extends StatefulWidget {
  const MascotTapEasterEgg({
    super.key,
    required this.child,
    required this.semanticsLabel,
    this.tapsRequired = 5,
    this.reducedMotion = false,
  });

  final Widget child;
  final String semanticsLabel;
  final int tapsRequired;
  final bool reducedMotion;

  @override
  State<MascotTapEasterEgg> createState() => _MascotTapEasterEggState();
}

class _MascotTapEasterEggState extends State<MascotTapEasterEgg>
    with SingleTickerProviderStateMixin {
  static const Duration _tapWindow = Duration(seconds: 3);

  int _taps = 0;
  DateTime? _lastTap;
  late final AnimationController _wiggle;

  @override
  void initState() {
    super.initState();
    _wiggle = AnimationController(vsync: this, duration: Motion.celebrate);
  }

  @override
  void dispose() {
    _wiggle.dispose();
    super.dispose();
  }

  void _handleTap() {
    final DateTime now = DateTime.now();
    if (_lastTap != null && now.difference(_lastTap!) > _tapWindow) {
      _taps = 0;
    }
    _lastTap = now;
    _taps++;
    if (_taps >= widget.tapsRequired) {
      _taps = 0;
      if (widget.reducedMotion) {
        _wiggle.value = 1;
      } else {
        _wiggle.forward(from: 0);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.semanticsLabel,
      button: true,
      child: GestureDetector(
        onTap: _handleTap,
        child: AnimatedBuilder(
          animation: _wiggle,
          builder: (BuildContext context, Widget? child) {
            final double t = _wiggle.value;
            final double decay = 1 - t;
            final double angle = math.sin(t * math.pi * 4) * 0.18 * decay;
            final double scale = 1 + math.sin(t * math.pi * 2) * 0.08 * decay;
            return Transform.rotate(
              angle: angle,
              child: Transform.scale(scale: scale, child: child),
            );
          },
          child: widget.child,
        ),
      ),
    );
  }
}
