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
          child: AnimatedContainer(
            duration: Motion.press,
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
    );
  }
}

enum KidVariant { primary, secondary, ghost }

enum KidSize { primary, kid, icon }
