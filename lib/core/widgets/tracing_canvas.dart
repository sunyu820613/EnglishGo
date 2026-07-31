import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';
import '../tracing/letter_paths.dart';

/// Interactive letter-tracing canvas (COMPONENT_SYSTEM.md: TracingCanvas).
///
/// Shows the letter's stroke outline with a start dot and a direction
/// arrow for the active stroke. The finger traces along a wide tolerance
/// corridor (LEARNING_MODEL.md §4: ~24dp); drifting off the path never
/// counts as failure -- the drawn ink simply doesn't advance until the
/// finger comes back within tolerance ("gently snaps back", not rejected).
class TracingCanvas extends StatefulWidget {
  const TracingCanvas({
    super.key,
    required this.letter,
    required this.onComplete,
    this.reducedMotion = false,
    this.size = 260,
  });

  final String letter;
  final VoidCallback onComplete;
  final bool reducedMotion;
  final double size;

  @override
  State<TracingCanvas> createState() => _TracingCanvasState();
}

class _TracingCanvasState extends State<TracingCanvas>
    with SingleTickerProviderStateMixin {
  static const double _toleranceDp = 24;
  static const double _sampleSpacing = 1.5;
  static const double _lookaheadUnits = 30;

  late List<_StrokeSampler> _samplers;
  int _strokeIndex = 0;
  int _sampleIndex = 0;
  bool _completed = false;
  late final AnimationController _glowController;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: Motion.celebrate,
    );
    _buildSamplers();
  }

  @override
  void didUpdateWidget(TracingCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.letter != widget.letter) {
      _strokeIndex = 0;
      _sampleIndex = 0;
      _completed = false;
      _glowController.reset();
      _buildSamplers();
    }
  }

  void _buildSamplers() {
    final List<List<Offset>> strokes =
        letterStrokes[widget.letter.toUpperCase()] ?? const <List<Offset>>[];
    _samplers = strokes
        .map((List<Offset> points) => _StrokeSampler(points, _sampleSpacing))
        .toList(growable: false);
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  double get _scale => widget.size / 100;

  void _handleTouch(Offset localPosition) {
    if (_completed || _samplers.isEmpty) return;
    final Offset unit = localPosition / _scale;
    final _StrokeSampler sampler = _samplers[_strokeIndex];
    final double toleranceUnits = _toleranceDp / _scale;
    final int windowEnd = math.min(
      sampler.samples.length - 1,
      sampler.indexAfterDistance(_sampleIndex, _lookaheadUnits),
    );

    int bestIndex = -1;
    double bestDistance = double.infinity;
    for (int i = _sampleIndex; i <= windowEnd; i++) {
      final double distance = (sampler.samples[i] - unit).distance;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    if (bestIndex < 0 || bestDistance > toleranceUnits) return;

    setState(() {
      _sampleIndex = bestIndex;
      if (_sampleIndex >= sampler.samples.length - 1) {
        _advanceStroke();
      }
    });
  }

  void _advanceStroke() {
    if (_strokeIndex >= _samplers.length - 1) {
      _completed = true;
      if (!widget.reducedMotion) {
        _glowController.forward(from: 0);
      } else {
        _glowController.value = 1;
      }
      widget.onComplete();
    } else {
      _strokeIndex++;
      _sampleIndex = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = Theme.of(
      context,
    ).extension<KidThemeExtension>()!;

    return Semantics(
      label: _completed
          ? 'Letter ${widget.letter} traced'
          : 'Trace the letter ${widget.letter}',
      child: GestureDetector(
        onPanStart: (DragStartDetails d) => _handleTouch(d.localPosition),
        onPanUpdate: (DragUpdateDetails d) => _handleTouch(d.localPosition),
        child: SizedBox(
          width: widget.size,
          height: widget.size,
          child: AnimatedBuilder(
            animation: _glowController,
            builder: (BuildContext context, Widget? child) {
              return CustomPaint(
                painter: _TracingPainter(
                  samplers: _samplers,
                  strokeIndex: _strokeIndex,
                  sampleIndex: _sampleIndex,
                  completed: _completed,
                  glow: _glowController.value,
                  scale: _scale,
                  guideColor: theme.outline,
                  inkColor: theme.primary,
                  successColor: theme.success,
                  accentColor: theme.accent,
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Precomputes evenly-spaced points along a stroke's polyline so touch
/// matching and progress can work in constant-ish time per frame instead
/// of re-walking raw control points.
class _StrokeSampler {
  _StrokeSampler(List<Offset> rawPoints, double spacing)
    : samples = _sample(rawPoints, spacing);

  final List<Offset> samples;

  static List<Offset> _sample(List<Offset> raw, double spacing) {
    if (raw.length < 2) return List<Offset>.of(raw);
    final List<Offset> out = <Offset>[raw.first];
    for (int i = 0; i < raw.length - 1; i++) {
      final Offset a = raw[i];
      final Offset b = raw[i + 1];
      final double segmentLength = (b - a).distance;
      final int steps = math.max(1, (segmentLength / spacing).round());
      for (int s = 1; s <= steps; s++) {
        out.add(Offset.lerp(a, b, s / steps)!);
      }
    }
    return out;
  }

  /// Index reached by walking forward from [start] up to [maxDistance]
  /// (in unit space) along the sampled polyline.
  int indexAfterDistance(int start, double maxDistance) {
    double travelled = 0;
    int i = start;
    while (i < samples.length - 1 && travelled < maxDistance) {
      travelled += (samples[i + 1] - samples[i]).distance;
      i++;
    }
    return i;
  }
}

class _TracingPainter extends CustomPainter {
  _TracingPainter({
    required this.samplers,
    required this.strokeIndex,
    required this.sampleIndex,
    required this.completed,
    required this.glow,
    required this.scale,
    required this.guideColor,
    required this.inkColor,
    required this.successColor,
    required this.accentColor,
  });

  final List<_StrokeSampler> samplers;
  final int strokeIndex;
  final int sampleIndex;
  final bool completed;
  final double glow;
  final double scale;
  final Color guideColor;
  final Color inkColor;
  final Color successColor;
  final Color accentColor;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(scale, scale);

    final Paint guidePaint = Paint()
      ..color = guideColor.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    for (final _StrokeSampler sampler in samplers) {
      canvas.drawPath(_pathFor(sampler.samples), guidePaint);
    }

    if (completed && glow > 0) {
      final Paint glowPaint = Paint()
        ..color = successColor.withValues(alpha: 0.35 * glow)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
      canvas.drawCircle(const Offset(50, 50), 55, glowPaint);
    }

    final Paint inkPaint = Paint()
      ..color = completed ? successColor : inkColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 9
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    for (int i = 0; i < strokeIndex; i++) {
      canvas.drawPath(_pathFor(samplers[i].samples), inkPaint);
    }
    if (strokeIndex < samplers.length) {
      final List<Offset> progressPoints = samplers[strokeIndex].samples.sublist(
        0,
        math.min(sampleIndex + 1, samplers[strokeIndex].samples.length),
      );
      if (progressPoints.length > 1) {
        canvas.drawPath(_pathFor(progressPoints), inkPaint);
      }

      // Start dot: only while the active stroke hasn't been started yet.
      if (sampleIndex == 0 && !completed) {
        canvas.drawCircle(
          samplers[strokeIndex].samples.first,
          5,
          Paint()..color = accentColor,
        );
        _drawDirectionArrow(canvas, samplers[strokeIndex].samples, accentColor);
      }
    }

    canvas.restore();
  }

  void _drawDirectionArrow(Canvas canvas, List<Offset> samples, Color color) {
    if (samples.length < 2) return;
    final int tipIndex = math.min(samples.length - 1, samples.length ~/ 3);
    final Offset tip = samples[tipIndex];
    final Offset from = samples[math.max(0, tipIndex - 1)];
    final double angle = (tip - from).direction;
    const double arrowLength = 6;
    final Path arrow = Path()
      ..moveTo(tip.dx, tip.dy)
      ..lineTo(
        tip.dx - arrowLength * math.cos(angle - math.pi / 6),
        tip.dy - arrowLength * math.sin(angle - math.pi / 6),
      )
      ..moveTo(tip.dx, tip.dy)
      ..lineTo(
        tip.dx - arrowLength * math.cos(angle + math.pi / 6),
        tip.dy - arrowLength * math.sin(angle + math.pi / 6),
      );
    canvas.drawPath(
      arrow,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round,
    );
  }

  Path _pathFor(List<Offset> points) {
    final Path path = Path()..moveTo(points.first.dx, points.first.dy);
    for (final Offset p in points.skip(1)) {
      path.lineTo(p.dx, p.dy);
    }
    return path;
  }

  @override
  bool shouldRepaint(covariant _TracingPainter oldDelegate) {
    return oldDelegate.strokeIndex != strokeIndex ||
        oldDelegate.sampleIndex != sampleIndex ||
        oldDelegate.completed != completed ||
        oldDelegate.glow != glow;
  }
}
