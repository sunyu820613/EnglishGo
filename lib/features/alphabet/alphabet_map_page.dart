import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../data/alphabet/alphabet_repository.dart';
import '../../data/alphabet/models.dart';
import '../../data/progress/progress_repository.dart';

/// Provider for alphabet data.
final alphabetFutureProvider = FutureProvider<List<LetterEntry>>((Ref ref) {
  return const AlphabetRepository().loadAlphabet();
});

/// Alphabet map page with A–Z nodes.
///
/// A/B/C are fully interactive; D–Z show a "Coming soon" placeholder
/// on tap and are styled with lower opacity.
class AlphabetMapPage extends ConsumerWidget {
  const AlphabetMapPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final AsyncValue<List<LetterEntry>> alphabetAsync = ref.watch(
      alphabetFutureProvider,
    );
    final ProgressData progress = ref.watch(progressProvider);
    final List<String> availableLetters = <String>['A', 'B', 'C'];

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(
              onBack: () => context.pop(),
              backSemanticsLabel: 'Back to home',
            ),
            Padding(
              padding: const EdgeInsets.all(Space.md),
              child: Text(
                'Alphabet Map',
                style: TextStyle(
                  fontFamily: FontFamily.display,
                  fontSize: TypeScale.display,
                  color: theme.text,
                ),
              ),
            ),
            Expanded(
              child: alphabetAsync.when(
                data: (List<LetterEntry> letters) => _AlphabetGrid(
                  letters: letters,
                  progress: progress,
                  theme: theme,
                  availableLetters: availableLetters,
                  onLetterTap: (String letter) {
                    if (availableLetters.contains(letter)) {
                      context.push('/lesson/$letter');
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('$letter coming soon!'),
                          duration: const Duration(seconds: 1),
                          behavior: SnackBarBehavior.floating,
                          backgroundColor: theme.surface,
                        ),
                      );
                    }
                  },
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (Object error, StackTrace? stack) => Center(
                  child: Text(
                    'Could not load alphabet data.',
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
}

class _AlphabetGrid extends StatelessWidget {
  const _AlphabetGrid({
    required this.letters,
    required this.progress,
    required this.theme,
    required this.availableLetters,
    required this.onLetterTap,
  });

  final List<LetterEntry> letters;
  final ProgressData progress;
  final KidThemeExtension theme;
  final List<String> availableLetters;
  final void Function(String letter) onLetterTap;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(Space.md),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 6,
        mainAxisSpacing: Space.sm,
        crossAxisSpacing: Space.sm,
      ),
      itemCount: letters.length,
      itemBuilder: (BuildContext context, int index) {
        final LetterEntry entry = letters[index];
        final bool isAvailable = availableLetters.contains(entry.letter);
        final LetterProgress? lp = progress.letters[entry.letter];
        final int stars = lp?.stars ?? 0;

        return _MapNode(
          letter: entry.letter,
          stars: stars,
          isAvailable: isAvailable,
          theme: theme,
          onTap: () => onLetterTap(entry.letter),
        );
      },
    );
  }
}

class _MapNode extends StatelessWidget {
  const _MapNode({
    required this.letter,
    required this.stars,
    required this.isAvailable,
    required this.theme,
    required this.onTap,
  });

  final String letter;
  final int stars;
  final bool isAvailable;
  final KidThemeExtension theme;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Letter $letter, $stars stars',
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: Motion.standard,
          decoration: BoxDecoration(
            color: isAvailable
                ? theme.surface
                : theme.surface.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(KidRadius.lg),
            border: Border.all(
              color: isAvailable
                  ? theme.primary.withValues(alpha: 0.5)
                  : theme.outline.withValues(alpha: 0.3),
              width: IconStroke.width,
            ),
            boxShadow: isAvailable
                ? KidShadows.rest(theme.shadowTint, isLightTheme: theme.isLight)
                : null,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text(
                letter,
                style: TextStyle(
                  fontFamily: FontFamily.teaching,
                  fontSize: TypeScale.title,
                  color: isAvailable ? theme.text : theme.textSoft,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (stars > 0)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List<Widget>.generate(
                    stars,
                    (int i) => Icon(Icons.star, size: 14, color: theme.accent),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
