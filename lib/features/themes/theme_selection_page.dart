import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';

/// Full theme selection page (accessible from home).
class ThemeSelectionPage extends ConsumerWidget {
  const ThemeSelectionPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension currentTheme = ref.watch(currentThemeProvider);
    final String currentThemeId = ref.watch(themeControllerProvider);

    return Scaffold(
      backgroundColor: currentTheme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(onBack: () => popOrGo(context, '/home')),
            Padding(
              padding: const EdgeInsets.all(Space.md),
              child: Text(
                'Choose Theme',
                style: TextStyle(
                  fontFamily: FontFamily.display,
                  fontSize: TypeScale.display,
                  color: currentTheme.text,
                ),
              ),
            ),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(Space.md),
                // A fixed cross-axis count stretches each card to fill
                // half the available width; on wide viewports without an
                // outer max-width cap that made cards balloon to hundreds
                // of dp. Cap each card's own extent instead, so it looks
                // right regardless of what's constraining it from outside.
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 200,
                  mainAxisSpacing: Space.md,
                  crossAxisSpacing: Space.md,
                  childAspectRatio: 1.2,
                ),
                itemCount: allThemes.length,
                itemBuilder: (BuildContext context, int index) {
                  final String id = allThemes.keys.elementAt(index);
                  final KidThemeExtension cardTheme = allThemes[id]!;
                  final bool isSelected = id == currentThemeId;

                  return _ThemeCard(
                    themeId: id,
                    themeData: cardTheme,
                    isSelected: isSelected,
                    onTap: () {
                      unawaited(
                        ref.read(themeControllerProvider.notifier).setTheme(id),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ThemeCard extends StatelessWidget {
  const _ThemeCard({
    required this.themeId,
    required this.themeData,
    required this.isSelected,
    required this.onTap,
  });

  final String themeId;
  final KidThemeExtension themeData;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Theme $themeId${isSelected ? ', selected' : ''}',
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: Motion.standard,
          decoration: BoxDecoration(
            color: themeData.surface,
            borderRadius: BorderRadius.circular(KidRadius.lg),
            border: Border.all(
              color: isSelected ? themeData.accent : themeData.outline,
              width: isSelected ? 3 : IconStroke.width,
            ),
            boxShadow: KidShadows.rest(
              themeData.shadowTint,
              isLightTheme: themeData.isLight,
            ),
          ),
          // Capping the grid cell's own extent (see gridDelegate above)
          // means this content must scale down gracefully if the cell
          // ends up too small for it -- e.g. at 200% system text scale,
          // where the label alone can exceed a small cell's height.
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Padding(
              padding: const EdgeInsets.all(Space.sm),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: themeData.primary,
                      borderRadius: BorderRadius.circular(KidRadius.full),
                    ),
                    child: Icon(
                      isSelected ? Icons.check : Icons.star,
                      color: themeData.onPrimary,
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: Space.sm),
                  Text(
                    themeId,
                    style: TextStyle(
                      fontFamily: FontFamily.display,
                      fontSize: TypeScale.body,
                      color: themeData.text,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
