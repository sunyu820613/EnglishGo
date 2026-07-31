import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../data/progress/progress_repository.dart';
import 'story_viewer_page.dart';

/// Rewards / collection page showing stickers and stars.
class RewardsPage extends ConsumerWidget {
  const RewardsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final ProgressData progress = ref.watch(progressProvider);
    final AsyncValue<List<MiniStory>> storiesAsync = ref.watch(
      storiesFutureProvider,
    );

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
              AppTopBar(onBack: () => popOrGo(context, '/home')),
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
              const SizedBox(height: Space.lg),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Space.md),
                child: Text(
                  'Mini Stories',
                  style: TextStyle(
                    fontFamily: FontFamily.display,
                    fontSize: TypeScale.title,
                    color: theme.text,
                  ),
                ),
              ),
              const SizedBox(height: Space.sm),
              storiesAsync.when(
                data: (List<MiniStory> stories) => _StoryList(
                  stories: stories,
                  progress: progress,
                  theme: theme,
                ),
                loading: () => const SizedBox.shrink(),
                error: (Object error, StackTrace? stack) =>
                    const SizedBox.shrink(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StoryList extends StatelessWidget {
  const _StoryList({
    required this.stories,
    required this.progress,
    required this.theme,
  });

  final List<MiniStory> stories;
  final ProgressData progress;
  final KidThemeExtension theme;

  @override
  Widget build(BuildContext context) {
    final Map<String, int> starsByLetter = <String, int>{
      for (final MapEntry<String, LetterProgress> e in progress.letters.entries)
        e.key: e.value.stars,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: Space.md),
      child: Column(
        children: <Widget>[
          for (final MiniStory story in stories) ...<Widget>[
            _StoryTile(
              story: story,
              unlocked: story.isUnlockedBy(starsByLetter),
              theme: theme,
            ),
            const SizedBox(height: Space.sm),
          ],
        ],
      ),
    );
  }
}

class _StoryTile extends StatelessWidget {
  const _StoryTile({
    required this.story,
    required this.unlocked,
    required this.theme,
  });

  final MiniStory story;
  final bool unlocked;
  final KidThemeExtension theme;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: unlocked
          ? 'Story: ${story.title}'
          : 'Locked story. Complete ${story.requiredLetters.join(', ')} to unlock',
      button: unlocked,
      child: GestureDetector(
        onTap: unlocked ? () => context.push('/story/${story.id}') : null,
        child: Container(
          padding: const EdgeInsets.all(Space.md),
          decoration: BoxDecoration(
            color: unlocked
                ? theme.surface
                : theme.surface.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(KidRadius.md),
            border: Border.all(color: theme.outline, width: IconStroke.width),
          ),
          child: Row(
            children: <Widget>[
              Icon(
                unlocked ? Icons.auto_stories_rounded : Icons.lock_rounded,
                color: unlocked ? theme.accent : theme.textSoft,
              ),
              const SizedBox(width: Space.sm),
              Expanded(
                child: Text(
                  unlocked
                      ? story.title
                      : 'Complete ${story.requiredLetters.join(', ')} to unlock',
                  style: TextStyle(
                    fontFamily: FontFamily.body,
                    fontSize: TypeScale.body,
                    color: unlocked ? theme.text : theme.textSoft,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
