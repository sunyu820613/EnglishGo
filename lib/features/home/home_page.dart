import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/accessibility/reduced_motion_policy.dart';
import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/kid_button.dart';
import '../../core/widgets/mascot_tap_easter_egg.dart';
import 'starlight_constellation_egg.dart';

/// Home page — full-screen themed background with mascot area
/// and primary Play button plus secondary entries.
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final String themeId = ref.watch(themeControllerProvider);
    final bool reducedMotion = isReducedMotion(ref, context);

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Stack(
          children: <Widget>[
            // Background layer: placeholder
            Positioned.fill(child: ColoredBox(color: theme.background)),
            // Decoration layer: corner decorations
            Positioned(
              top: -40,
              right: -40,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  color: theme.surfaceAlt.withValues(alpha: 0.3),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            // Easter egg layer: decoration only, never blocks learning
            // buttons (EASTER_EGGS.md §1). Per-theme eggs land here one at
            // a time -- starlight's constellation is the first.
            if (themeId == 'starlight')
              Positioned.fill(
                child: StarlightConstellationEgg(reducedMotion: reducedMotion),
              ),
            // Content layer. The mascot+Play cluster is centered in the
            // space above the secondary-icon row rather than sharing flex
            // weight with it -- with both in one Spacer-separated Column,
            // the row's own height pulled the "center of mass" of the
            // whole block upward, so the mascot always looked stuck near
            // the top with a big dead gap above the row instead of truly
            // centered.
            Column(
              children: <Widget>[
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        // Mascot area (tapping 5x plays a hidden silly
                        // wiggle -- EASTER_EGGS.md §1 universal egg).
                        MascotTapEasterEgg(
                          semanticsLabel: 'Home mascot',
                          reducedMotion: reducedMotion,
                          child: Container(
                            width: TouchSize.primary * 2.5,
                            height: TouchSize.primary * 2.5,
                            decoration: BoxDecoration(
                              color: theme.surfaceAlt,
                              borderRadius: BorderRadius.circular(
                                KidRadius.full,
                              ),
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Image.asset(
                              theme.assets.mascot,
                              fit: BoxFit.cover,
                              errorBuilder:
                                  (
                                    BuildContext context,
                                    Object error,
                                    StackTrace? stackTrace,
                                  ) => Icon(
                                    Icons.face_rounded,
                                    size: TouchSize.primary,
                                    color: theme.primary,
                                  ),
                            ),
                          ),
                        ),
                        const SizedBox(height: Space.lg),
                        // Play / Enter map button
                        KidButton(
                          onPressed: () => context.push('/map'),
                          semanticsLabel: 'Play',
                          size: KidSize.primary,
                          child: Text(
                            'Play',
                            style: TextStyle(
                              fontFamily: FontFamily.display,
                              fontSize: TypeScale.title,
                              color: theme.onPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Secondary entries, pinned near the bottom as a footer.
                Padding(
                  padding: const EdgeInsets.only(
                    left: Space.xxl,
                    right: Space.xxl,
                    bottom: Space.xl,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: <Widget>[
                      _SecondaryIcon(
                        icon: Icons.collections_bookmark_rounded,
                        label: 'Rewards',
                        theme: theme,
                        onTap: () => context.push('/rewards'),
                      ),
                      _SecondaryIcon(
                        icon: Icons.palette_rounded,
                        label: 'Themes',
                        theme: theme,
                        onTap: () => context.push('/themes'),
                      ),
                      _SecondaryIcon(
                        icon: Icons.lock_rounded,
                        label: 'Parents',
                        theme: theme,
                        onTap: () => context.push('/parent-gate'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SecondaryIcon extends StatelessWidget {
  const _SecondaryIcon({
    required this.icon,
    required this.label,
    required this.theme,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final KidThemeExtension theme;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: TouchSize.min,
              height: TouchSize.min,
              decoration: BoxDecoration(
                color: theme.surface,
                borderRadius: BorderRadius.circular(KidRadius.full),
                boxShadow: KidShadows.rest(
                  theme.shadowTint,
                  isLightTheme: theme.isLight,
                ),
              ),
              child: Icon(icon, color: theme.textSoft, size: 24),
            ),
            const SizedBox(height: Space.xs / 2),
            Text(
              label,
              style: TextStyle(
                fontFamily: FontFamily.body,
                fontSize: TypeScale.caption,
                color: theme.textSoft,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
