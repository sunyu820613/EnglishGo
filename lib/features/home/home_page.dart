import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/kid_button.dart';

/// Home page — full-screen themed background with mascot area
/// and primary Play button plus secondary entries.
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);

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
            // Content layer
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  const Spacer(flex: 2),
                  // Mascot area (placeholder)
                  Semantics(
                    label: 'Home mascot',
                    child: GestureDetector(
                      onTap: () {
                        // Placeholder: mascot interaction
                      },
                      child: Container(
                        width: TouchSize.primary * 2.5,
                        height: TouchSize.primary * 2.5,
                        decoration: BoxDecoration(
                          color: theme.surfaceAlt,
                          borderRadius: BorderRadius.circular(KidRadius.full),
                        ),
                        child: Icon(
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
                  const Spacer(),
                  // Secondary entries
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: Space.xxl),
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
                  const Spacer(),
                ],
              ),
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
