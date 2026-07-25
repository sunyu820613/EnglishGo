import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../data/progress/progress_repository.dart';

/// Rewards / collection page showing stickers and stars.
class RewardsPage extends ConsumerWidget {
  const RewardsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final ProgressData progress = ref.watch(progressProvider);

    int totalStars = 0;
    for (final LetterProgress lp in progress.letters.values) {
      totalStars += lp.stars;
    }

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        // A scrollable column (rather than Expanded sections) so the page
        // degrades gracefully instead of overflowing at large system text
        // scale (ACCESSIBILITY.md requires no overflow at 200%).
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              AppTopBar(onBack: () => context.pop()),
              Padding(
                padding: const EdgeInsets.all(Space.md),
                child: Text(
                  'My Collection',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: FontFamily.display,
                    fontSize: TypeScale.display,
                    color: theme.text,
                  ),
                ),
              ),
              Icon(Icons.star, color: theme.accent, size: 40),
              const SizedBox(height: Space.sm),
              Text(
                '$totalStars stars collected',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: FontFamily.body,
                  fontSize: TypeScale.body,
                  color: theme.textSoft,
                ),
              ),
              const SizedBox(height: Space.lg),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Space.md),
                child: Text(
                  'Stickers (${progress.stickers.length})',
                  style: TextStyle(
                    fontFamily: FontFamily.display,
                    fontSize: TypeScale.title,
                    color: theme.text,
                  ),
                ),
              ),
              const SizedBox(height: Space.sm),
              if (progress.stickers.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Space.md,
                    vertical: Space.xl,
                  ),
                  child: Text(
                    'Complete lessons to earn stickers!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FontFamily.body,
                      fontSize: TypeScale.body,
                      color: theme.textSoft,
                    ),
                  ),
                )
              else
                GridView.builder(
                  padding: const EdgeInsets.all(Space.md),
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    mainAxisSpacing: Space.sm,
                    crossAxisSpacing: Space.sm,
                  ),
                  itemCount: progress.stickers.length,
                  itemBuilder: (BuildContext context, int index) {
                    return DecoratedBox(
                      decoration: BoxDecoration(
                        color: theme.surface,
                        borderRadius: BorderRadius.circular(KidRadius.md),
                        border: Border.all(
                          color: theme.outline,
                          width: IconStroke.width,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.auto_awesome,
                          color: theme.accent,
                          size: 32,
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
