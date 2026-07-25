import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/audio/audio_service.dart';
import '../../core/theme/tokens.dart';
import '../../core/widgets/kid_button.dart';
import '../../data/progress/progress_repository.dart';

/// Parent area: learned letters list, reset progress, BGM toggle.
class ParentAreaPage extends ConsumerWidget {
  const ParentAreaPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ProgressData progress = ref.watch(progressProvider);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Parent Area'),
        backgroundColor: Colors.grey.shade100,
        foregroundColor: Colors.black87,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(Space.md),
        children: <Widget>[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(Space.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text(
                    'Settings',
                    style: TextStyle(
                      fontFamily: 'Nunito',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: Space.md),
                  SwitchListTile(
                    title: const Text('Background Music'),
                    value: progress.settings.bgmOn,
                    onChanged: (bool value) async {
                      await ref.read(progressProvider.notifier).setBgmOn(value);
                      await ref.read(audioServiceProvider).setBgmEnabled(value);
                    },
                  ),
                  SwitchListTile(
                    title: const Text('Reduced Motion'),
                    value: progress.settings.reducedMotion,
                    onChanged: (bool value) {
                      ref
                          .read(progressProvider.notifier)
                          .setReducedMotion(value);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: Space.md),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(Space.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Learned Letters (${progress.letters.length})',
                    style: const TextStyle(
                      fontFamily: 'Nunito',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: Space.sm),
                  if (progress.letters.isEmpty)
                    const Text(
                      'No letters studied yet.',
                      style: TextStyle(color: Colors.black54),
                    )
                  else
                    ...progress.letters.entries.map((
                      MapEntry<String, LetterProgress> entry,
                    ) {
                      return ListTile(
                        title: Text('Letter ${entry.key}'),
                        subtitle: Text(
                          '${entry.value.stars}/3 stars, '
                          '${entry.value.wordsHeard.length} words heard',
                        ),
                        leading: StarIcon(entry.value.stars),
                      );
                    }),
                ],
              ),
            ),
          ),
          const SizedBox(height: Space.md),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(Space.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text(
                    'Data',
                    style: TextStyle(
                      fontFamily: 'Nunito',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: Space.sm),
                  KidButton(
                    onPressed: () => _showResetDialog(context, ref),
                    semanticsLabel: 'Reset all progress',
                    variant: KidVariant.ghost,
                    child: const Text(
                      'Reset All Progress',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showResetDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Reset All Progress?'),
          content: const Text(
            'This will clear all stars, stickers, and learned letters. '
            'This action cannot be undone.',
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                final SharedPreferences prefs =
                    await SharedPreferences.getInstance();
                await prefs.remove('progress.data');
                ref.invalidate(progressProvider);
                if (dialogContext.mounted) {
                  Navigator.of(dialogContext).pop();
                  context.go('/home');
                }
              },
              child: const Text('Reset', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}

class StarIcon extends StatelessWidget {
  const StarIcon(this.stars, {super.key});
  final int stars;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List<Widget>.generate(
        3,
        (int i) => Icon(
          i < stars ? Icons.star : Icons.star_border,
          size: 20,
          color: i < stars ? Colors.amber : Colors.grey,
        ),
      ),
    );
  }
}
