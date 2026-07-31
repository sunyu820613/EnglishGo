import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../core/widgets/kid_button.dart';
import '../../data/stories/story_repository.dart';

export '../../data/stories/story_repository.dart';

final Provider<StoryRepository> storyRepositoryProvider =
    Provider<StoryRepository>((Ref ref) => const StoryRepository());

/// Provider for mini-story content.
final FutureProvider<List<MiniStory>> storiesFutureProvider =
    FutureProvider<List<MiniStory>>((Ref ref) {
      return ref.watch(storyRepositoryProvider).loadStories();
    });

/// Page-by-page viewer for one mini story (REWARD_SYSTEM.md: "收藏册（故事页）").
class StoryViewerPage extends ConsumerStatefulWidget {
  const StoryViewerPage({super.key, required this.storyId});

  final String storyId;

  @override
  ConsumerState<StoryViewerPage> createState() => _StoryViewerPageState();
}

class _StoryViewerPageState extends ConsumerState<StoryViewerPage> {
  int _pageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final AsyncValue<List<MiniStory>> storiesAsync = ref.watch(
      storiesFutureProvider,
    );

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(onBack: () => popOrGo(context, '/rewards')),
            Expanded(
              child: storiesAsync.when(
                data: (List<MiniStory> stories) =>
                    _buildStory(context, theme, stories),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (Object error, StackTrace? stack) => Center(
                  child: Text(
                    'Could not load story.',
                    style: TextStyle(color: theme.textSoft),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStory(
    BuildContext context,
    KidThemeExtension theme,
    List<MiniStory> stories,
  ) {
    final MiniStory? story = stories
        .where((MiniStory s) => s.id == widget.storyId)
        .firstOrNull;
    if (story == null) {
      return Center(
        child: Text(
          'Story not found.',
          style: TextStyle(color: theme.textSoft),
        ),
      );
    }

    final StoryPage page = story.pages[_pageIndex];
    final bool isLast = _pageIndex == story.pages.length - 1;

    // Scroll instead of overflowing at large system text scale
    // (ACCESSIBILITY.md: no overflow at 200%), matching lesson_page.dart's
    // _ScrollSafeCenter pattern.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(Space.md),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(KidRadius.lg),
                    child: Image.asset(
                      'assets/${page.image}',
                      width: 260,
                      height: 260,
                      fit: BoxFit.cover,
                      errorBuilder:
                          (
                            BuildContext context,
                            Object error,
                            StackTrace? stackTrace,
                          ) => Container(
                            width: 260,
                            height: 260,
                            color: theme.surfaceAlt,
                            child: Icon(
                              Icons.image,
                              color: theme.textSoft,
                              size: 48,
                            ),
                          ),
                    ),
                  ),
                  const SizedBox(height: Space.lg),
                  Text(
                    page.text,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: FontFamily.teaching,
                      fontSize: TypeScale.title,
                      color: theme.text,
                    ),
                  ),
                  const SizedBox(height: Space.xl),
                  KidButton(
                    onPressed: () {
                      if (isLast) {
                        popOrGo(context, '/rewards');
                      } else {
                        setState(() => _pageIndex++);
                      }
                    },
                    semanticsLabel: isLast ? 'Finish story' : 'Next page',
                    size: KidSize.primary,
                    child: Text(isLast ? 'The End' : 'Next'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
