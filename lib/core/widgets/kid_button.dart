import 'package:flutter/material.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// Soft-Clay styled button for children's UI.
///
/// Variants: [KidVariant.primary], [KidVariant.secondary], [KidVariant.ghost].
/// Sizes: [KidSize.primary] (88dp), [KidSize.kid] (64dp), [KidSize.icon] (48dp).
///
/// Press feedback: scale 0.96 + [KidShadows.pressed], 120ms.
/// Semantics label is required.
class KidButton extends StatefulWidget {
  const KidButton({
    super.key,
    required this.onPressed,
    required this.semanticsLabel,
    this.variant = KidVariant.primary,
    this.size = KidSize.kid,
    this.child,
    this.icon,
    this.enabled = true,
  }) : assert(child != null || icon != null, 'child or icon must be provided');

  final VoidCallback? onPressed;
  final String semanticsLabel;
  final KidVariant variant;
  final KidSize size;
  final Widget? child;
  final Widget? icon;
  final bool enabled;

  @override
  State<KidButton> createState() => _KidButtonState();
}

class _KidButtonState extends State<KidButton>
    with SingleTickerProviderStateMixin {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    final Color bgColor;
    final Color fgColor;
    final Color? borderColor;

    switch (widget.variant) {
      case KidVariant.primary:
        bgColor = theme?.primary ?? Colors.blue;
        fgColor = theme?.onPrimary ?? Colors.white;
        borderColor = null;
      case KidVariant.secondary:
        bgColor = theme?.secondary ?? Colors.grey;
        fgColor = theme?.onSecondary ?? Colors.black;
        borderColor = null;
      case KidVariant.ghost:
        bgColor = Colors.transparent;
        fgColor = theme?.text ?? Colors.black;
        borderColor = theme?.outline ?? Colors.grey;
    }

    final double sizeValue;
    switch (widget.size) {
      case KidSize.primary:
        sizeValue = TouchSize.primary;
      case KidSize.kid:
        sizeValue = TouchSize.kid;
      case KidSize.icon:
        sizeValue = TouchSize.min;
    }

    return Semantics(
      label: widget.semanticsLabel,
      button: true,
      enabled: widget.enabled,
      child: GestureDetector(
        onTapDown: widget.enabled && widget.onPressed != null
            ? (_) => setState(() => _scale = 0.96)
            : null,
        onTapUp: widget.enabled && widget.onPressed != null
            ? (_) => setState(() => _scale = 1.0)
            : null,
        onTapCancel: () => setState(() => _scale = 1.0),
        onTap: widget.enabled ? widget.onPressed : null,
        child: AnimatedScale(
          scale: _scale,
          duration: Motion.press,
          curve: Motion.pressCurve,
          // UnconstrainedBox frees this subtree's width from the ambient
          // constraint -- without it, Container's `alignment` below asks
          // "is my incoming constraint bounded?" to decide whether to
          // shrink-wrap or fill, and in a bounded-width ambient context
          // (e.g. inside a Column) it would fill all the way to that
          // unrelated ambient width instead of just the button's own
          // content/min size (reproduced as the Play button stretching
          // edge-to-edge on HomePage). `constrainedAxis: Axis.vertical`
          // frees only the width; height was already unbounded in every
          // real usage (Column gives non-expanded children loose height),
          // so it's left alone.
          //
          // Deliberately NOT IntrinsicWidth/IntrinsicHeight: that family
          // does a dry "measure, then relayout" pass that has repeatedly
          // conflicted with AnimatedSwitcher elsewhere in the app
          // (mis-hit-tests the outgoing vs incoming child during a step
          // transition -- reproduced as "Next needs two taps").
          // UnconstrainedBox achieves the same result with a plain
          // single-pass RenderObject that carries none of that risk.
          child: UnconstrainedBox(
            constrainedAxis: Axis.vertical,
            child: AnimatedContainer(
              duration: Motion.press,
              // Without an explicit alignment, Container skips wrapping
              // its child in Align -- when the enforced minWidth/
              // minHeight below is bigger than the content's natural
              // size (e.g. short button text), the child ends up
              // anchored top-left inside the padding box instead of
              // centered, leaving dead space at the bottom/right.
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: bgColor.withValues(alpha: widget.enabled ? 1.0 : 0.4),
                borderRadius: BorderRadius.circular(KidRadius.md),
                border: borderColor != null
                    ? Border.all(color: borderColor, width: 2)
                    : null,
                boxShadow: KidShadows.rest(
                  theme?.shadowTint ?? Colors.black,
                  isLightTheme: theme?.isLight ?? true,
                ),
              ),
              padding: EdgeInsets.symmetric(
                horizontal: widget.size == KidSize.icon ? Space.sm : Space.md,
                vertical: Space.sm,
              ),
              constraints: BoxConstraints(
                minWidth: sizeValue,
                minHeight: sizeValue,
              ),
              child:
                  widget.child ??
                  DefaultTextStyle.merge(
                    style: TextStyle(
                      color: fgColor.withValues(
                        alpha: widget.enabled ? 1.0 : 0.4,
                      ),
                      fontFamily: FontFamily.display,
                      fontSize: TypeScale.body,
                      fontWeight: FontWeight.w700,
                    ),
                    child: widget.icon ?? const SizedBox.shrink(),
                  ),
            ),
          ),
        ),
      ),
    );
  }
}

enum KidVariant { primary, secondary, ghost }

enum KidSize { primary, kid, icon }
