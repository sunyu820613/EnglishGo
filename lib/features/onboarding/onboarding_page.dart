import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';

/// Onboarding page: theme selection (2 steps max, zero text dependency).
///
/// Step 1: default mascot waves + voice welcome (placeholder visual).
/// Step 2: six theme cards horizontally scrollable.
/// Selecting a theme writes it and navigates to /home.
class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});

  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  Future<void> _selectTheme(String themeId) async {
    await ref.read(themeControllerProvider.notifier).setTheme(themeId);
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Space.lg),
          child: Column(
            children: <Widget>[
              const Spacer(flex: 2),
              // Mascot welcome area (placeholder)
              Semantics(
                label: 'Welcome mascot',
                child: Container(
                  width: TouchSize.primary * 2,
                  height: TouchSize.primary * 2,
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
              const SizedBox(height: Space.lg),
              Text(
                'Hi! Let\'s learn ABC!',
                style: TextStyle(
                  fontFamily: FontFamily.display,
                  fontSize: TypeScale.display,
                  color: theme.text,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              // Theme selection
              SizedBox(
                height: TouchSize.primary * 2.5,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: allThemes.length,
                  separatorBuilder: (_, _) => const SizedBox(width: Space.sm),
                  itemBuilder: (BuildContext context, int index) {
                    final String id = allThemes.keys.elementAt(index);
                    final KidThemeExtension cardTheme = allThemes[id]!;
                    return _ThemeCard(
                      themeId: id,
                      themeData: cardTheme,
                      isSelected: false,
                      onTap: () => _selectTheme(id),
                    );
                  },
                ),
              ),
              const SizedBox(height: Space.xl),
              Text(
                'Choose your world!',
                style: TextStyle(
                  fontFamily: FontFamily.display,
                  fontSize: TypeScale.title,
                  color: theme.textSoft,
                ),
              ),
              const Spacer(),
            ],
          ),
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
      label: 'Theme $themeId',
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: Motion.standard,
          width: TouchSize.primary * 2,
          height: TouchSize.primary * 2,
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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: themeData.primary,
                  borderRadius: BorderRadius.circular(KidRadius.full),
                ),
                child: Icon(Icons.star, color: themeData.onPrimary),
              ),
              const SizedBox(height: Space.xs),
              Text(
                themeId,
                style: TextStyle(
                  fontFamily: FontFamily.display,
                  fontSize: TypeScale.caption,
                  color: themeData.text,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
