import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';

/// starlight home-screen easter egg (EASTER_EGGS.md §2 starlight #3):
/// tap 3 hidden stars in the night sky in the right order to connect them
/// into a constellation. Wrong order resets silently -- no fail feedback
/// (EASTER_EGGS.md §1: sequence eggs never show failure).
///
/// Positioned in the decoration layer only; never overlaps the mascot or
/// Play button, and adds no learning-progress requirement.
class StarlightConstellationEgg extends ConsumerStatefulWidget {
  const StarlightConstellationEgg({super.key, this.reducedMotion = false});

  final bool reducedMotion;

  @override
  ConsumerState<StarlightConstellationEgg> createState() =>
      _StarlightConstellationEggState();
}

class _StarlightConstellationEggState
    extends ConsumerState<StarlightConstellationEgg>
    with SingleTickerProviderStateMixin {
  // Three fixed positions in the sky, well clear of the centered mascot
  // and Play button. Order here is the required tap order.
  static const List<Alignment> _starAlignments = <Alignment>[
    Alignment(-0.82, -0.78),
    Alignment(0.8, -0.85),
    Alignment(0.0, -0.62),
  ];

  final List<int> _tapped = <int>[];
  bool _revealed = false;
  late final AnimationController _reveal;

  @override
  void initState() {
    super.initState();
    _reveal = AnimationController(vsync: this, duration: Motion.celebrate);
  }

  @override
  void dispose() {
    _reveal.dispose();
    super.dispose();
  }

  void _handleStarTap(int index) {
    if (_revealed) return;
    final int expectedNext = _tapped.length;
    if (index != expectedNext) {
      setState(() => _tapped.clear());
      return;
    }
    setState(() => _tapped.add(index));
    if (_tapped.length == _starAlignments.length) {
      _revealed = true;
      if (widget.reducedMotion) {
        _reveal.value = 1;
      } else {
        _reveal.forward(from: 0);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);

    return Stack(
      children: <Widget>[
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _reveal,
            builder: (BuildContext context, Widget? child) {
              return CustomPaint(
                painter: _ConstellationPainter(
                  alignments: _starAlignments,
                  progress: _reveal.value,
                  color: theme.accent,
                ),
              );
            },
          ),
        ),
        for (int i = 0; i < _starAlignments.length; i++)
          Align(
            alignment: _starAlignments[i],
            child: Semantics(
              label: 'Hidden star',
              button: true,
              child: GestureDetector(
                onTap: () => _handleStarTap(i),
                child: SizedBox(
                  width: TouchSize.min,
                  height: TouchSize.min,
                  child: Center(
                    child: Icon(
                      Icons.star,
                      size: 14,
                      color: theme.accent.withValues(
                        alpha: _tapped.contains(i) || _revealed ? 0.9 : 0.35,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ConstellationPainter extends CustomPainter {
  _ConstellationPainter({
    required this.alignments,
    required this.progress,
    required this.color,
  });

  final List<Alignment> alignments;
  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0) return;
    final List<Offset> points = alignments
        .map((Alignment a) => a.alongSize(size))
        .toList(growable: false);

    final Paint linePaint = Paint()
      ..color = color.withValues(alpha: 0.8)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    final double totalSegments = (points.length - 1).toDouble();
    for (int i = 0; i < points.length - 1; i++) {
      final double segmentStart = i / totalSegments;
      final double segmentEnd = (i + 1) / totalSegments;
      if (progress <= segmentStart) break;
      final double localT =
          ((progress - segmentStart) / (segmentEnd - segmentStart)).clamp(
            0.0,
            1.0,
          );
      final Offset end = Offset.lerp(points[i], points[i + 1], localT)!;
      canvas.drawLine(points[i], end, linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _ConstellationPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}
