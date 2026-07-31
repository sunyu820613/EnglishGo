import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// Pops the current route, or navigates to [fallback] if there's nothing
/// to pop -- e.g. the page was opened directly (deep link, page refresh
/// while on it) with no navigation history, where `context.pop()` would
/// otherwise silently do nothing and leave the back button looking dead.
void popOrGo(BuildContext context, String fallback) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go(fallback);
  }
}

/// Top bar for children's pages.
///
/// - Left: back button (48dp) with light confirmation callback.
/// - Right: optional action widgets.
/// - Transparent background — not the default Material AppBar.
class AppTopBar extends StatelessWidget {
  const AppTopBar({
    super.key,
    this.onBack,
    this.actions,
    this.backSemanticsLabel = 'Back',
  });

  final VoidCallback? onBack;
  final List<Widget>? actions;
  final String backSemanticsLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      child: Padding(
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
        child: SizedBox(
          height: TouchSize.kid + Space.sm,
          child: Row(
            children: <Widget>[
              // Back button (left)
              if (onBack != null)
                Semantics(
                  label: backSemanticsLabel,
                  button: true,
                  child: GestureDetector(
                    onTap: onBack,
                    behavior: HitTestBehavior.opaque,
                    child: Container(
                      width: TouchSize.min,
                      height: TouchSize.min,
                      alignment: Alignment.center,
                      margin: const EdgeInsets.all(Space.sm),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(KidRadius.full),
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_rounded,
                        size: TouchSize.min / 2,
                        color: Theme.of(
                          context,
                        ).extension<KidThemeExtension>()?.text,
                      ),
                    ),
                  ),
                ),
              const Spacer(),
              // Optional right actions
              if (actions != null) ...actions!,
              const SizedBox(width: Space.sm),
            ],
          ),
        ),
      ),
    );
  }
}
