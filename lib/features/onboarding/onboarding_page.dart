import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../data/progress/progress_repository.dart';

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
    await ref.read(progressProvider.notifier).completeOnboarding();
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
          child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              return SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(child: _buildContent(theme)),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildContent(KidThemeExtension theme) {
    return Column(
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
        // Theme selection. A plain horizontal ListView always left-anchors
        // its content, which looks broken on wide viewports (desktop/
        // tablet landscape) where all 6 cards fit with room to spare --
        // everything else on this screen is centered. Center the row when
        // it fits; fall back to a left-anchored scroller when it doesn't
        // (narrow phone widths, where scrolling is expected anyway).
        SizedBox(
          height: TouchSize.primary * 2.5,
          child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              final List<Widget> cards = <Widget>[
                for (final String id in allThemes.keys)
                  _ThemeCard(
                    themeId: id,
                    themeData: allThemes[id]!,
                    isSelected: false,
                    onTap: () => _selectTheme(id),
                  ),
              ];
              final double contentWidth =
                  cards.length * (TouchSize.primary * 2) +
                  (cards.length - 1) * Space.sm;

              if (contentWidth <= constraints.maxWidth) {
                return Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      for (int i = 0; i < cards.length; i++) ...<Widget>[
                        if (i > 0) const SizedBox(width: Space.sm),
                        cards[i],
                      ],
                    ],
                  ),
                );
              }

              return ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: cards.length,
                separatorBuilder: (_, _) => const SizedBox(width: Space.sm),
                itemBuilder: (BuildContext context, int index) => cards[index],
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
