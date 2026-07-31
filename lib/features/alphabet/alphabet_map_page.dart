import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/theme_controller.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/app_top_bar.dart';
import '../../core/widgets/kid_button.dart';
import '../../data/alphabet/alphabet_repository.dart';
import '../../data/alphabet/models.dart';
import '../../data/progress/progress_repository.dart';

/// Provider for alphabet data.
final alphabetFutureProvider = FutureProvider<List<LetterEntry>>((Ref ref) {
  return const AlphabetRepository().loadAlphabet();
});

/// Alphabet map page with A–Z nodes.
///
/// All 26 letters are freely enterable in any order (LEARNING_MODEL.md §1.5:
/// no locking; A→Z is a suggestion, not a requirement).
class AlphabetMapPage extends ConsumerWidget {
  const AlphabetMapPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final KidThemeExtension theme = ref.watch(currentThemeProvider);
    final AsyncValue<List<LetterEntry>> alphabetAsync = ref.watch(
      alphabetFutureProvider,
    );
    final ProgressData progress = ref.watch(progressProvider);

    return Scaffold(
      backgroundColor: theme.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            AppTopBar(
              onBack: () => popOrGo(context, '/home'),
              backSemanticsLabel: 'Back to home',
              actions: <Widget>[
                KidButton(
                  onPressed: () => context.push('/phonetics'),
                  semanticsLabel: 'Phonetics chart',
                  size: KidSize.icon,
                  variant: KidVariant.ghost,
                  icon: Icon(Icons.record_voice_over, color: theme.text),
                ),
              ],
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
                  onLetterTap: (String letter) =>
                      context.push('/lesson/$letter'),
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
    required this.onLetterTap,
  });

  final List<LetterEntry> letters;
  final ProgressData progress;
  final KidThemeExtension theme;
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
        final LetterProgress? lp = progress.letters[entry.letter];
        final int stars = lp?.stars ?? 0;

        return _MapNode(
          letter: entry.letter,
          stars: stars,
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
    required this.theme,
    required this.onTap,
  });

  final String letter;
  final int stars;
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
            color: theme.surface,
            borderRadius: BorderRadius.circular(KidRadius.lg),
            border: Border.all(
              color: theme.primary.withValues(alpha: 0.5),
              width: IconStroke.width,
            ),
            boxShadow: KidShadows.rest(
              theme.shadowTint,
              isLightTheme: theme.isLight,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text(
                letter,
                style: TextStyle(
                  fontFamily: FontFamily.teaching,
                  fontSize: TypeScale.title,
                  color: theme.text,
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
