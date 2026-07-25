import 'package:english_go/core/accessibility/reduced_motion_policy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ReducedMotionPolicy', () {
    test('shouldReduce returns false when both are false', () {
      const policy = ReducedMotionPolicy();
      expect(
        policy.shouldReduce(
          systemDisableAnimations: false,
          userReducedMotion: false,
        ),
        false,
      );
    });

    test('shouldReduce returns true when system animations disabled', () {
      const policy = ReducedMotionPolicy();
      expect(
        policy.shouldReduce(
          systemDisableAnimations: true,
          userReducedMotion: false,
        ),
        true,
      );
    });

    test('shouldReduce returns true when user prefers reduced motion', () {
      const policy = ReducedMotionPolicy();
      expect(
        policy.shouldReduce(
          systemDisableAnimations: false,
          userReducedMotion: true,
        ),
        true,
      );
    });

    test('shouldReduce returns true when both sources agree', () {
      const policy = ReducedMotionPolicy();
      expect(
        policy.shouldReduce(
          systemDisableAnimations: true,
          userReducedMotion: true,
        ),
        true,
      );
    });
  });
}
