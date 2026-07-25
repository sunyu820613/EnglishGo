import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/progress/progress_repository.dart';

/// Determines whether reduced motion should be applied.
///
/// Reads from both:
///   1. System-level [MediaQuery.disableAnimations] (user accessibility setting).
///   2. App-level [ProgressRepository] `reducedMotion` setting.
///
/// Returns `true` if **either** source is true (conservative: reduce motion
/// whenever any source requests it).
///
/// Usage:
/// ```dart
/// final bool reduced = ref.watch(reducedMotionProvider(context));
/// ```
final Provider<ReducedMotionPolicy> reducedMotionPolicyProvider =
    Provider<ReducedMotionPolicy>((Ref ref) {
      return const ReducedMotionPolicy();
    });

class ReducedMotionPolicy {
  const ReducedMotionPolicy();

  /// Evaluate whether reduced motion is active for the given context
  /// and user preference.
  ///
  /// [systemDisableAnimations] comes from `MediaQuery.disableAnimations`.
  /// [userReducedMotion] comes from the progress settings.
  bool shouldReduce({
    required bool systemDisableAnimations,
    required bool userReducedMotion,
  }) {
    return systemDisableAnimations || userReducedMotion;
  }
}

/// Convenience provider that evaluates reduced motion for a given build context.
///
/// Depends on [MediaQuery] and a [userReducedMotion] parameter you supply
/// from your progress/settings provider.
final Provider<bool Function(BuildContext, bool)> reducedMotionEvaluator =
    Provider<bool Function(BuildContext, bool)>((Ref ref) {
      return (BuildContext context, bool userReducedMotion) {
        final bool systemDisabled = MediaQuery.disableAnimationsOf(context);
        return systemDisabled || userReducedMotion;
      };
    });

/// A convenience widget that wraps [AnimatedBuilder] or animation controllers
/// to disable animations when reduced motion is active.
///
/// Extend this to centralize the check.
mixin ReducedMotionMixin<T extends StatefulWidget> on State<T> {
  /// Override to return false when reduced motion is active.
  bool isReducedMotion(BuildContext context) {
    return MediaQuery.disableAnimationsOf(context);
  }
}

/// Combines the system accessibility setting with the user's in-app
/// preference (`ProgressData.settings.reducedMotion`, set from the parent
/// area). Widgets that run custom animations (shake loops, bounce timers,
/// idle loops) must check this and skip/shorten their motion accordingly --
/// Flutter's implicit-animation curves do not automatically respect
/// `MediaQuery.disableAnimations` for anything driven by raw `Future.delayed`
/// or `AnimationController` loops.
bool isReducedMotion(WidgetRef ref, BuildContext context) {
  final bool systemReduced = MediaQuery.disableAnimationsOf(context);
  final bool userReduced = ref.read(progressProvider).settings.reducedMotion;
  return systemReduced || userReduced;
}
