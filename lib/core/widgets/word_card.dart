import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../audio/audio_service.dart';
import '../theme/kid_theme.dart';
import '../theme/tokens.dart';

/// A word card with 1:1 illustration area, word text in Teaching font,
/// and tap-to-hear behaviour with micro bounce animation.
class WordCard extends ConsumerStatefulWidget {
  const WordCard({
    super.key,
    required this.imagePath,
    required this.word,
    required this.audioPath,
    required this.semanticsLabel,
  });

  final String imagePath;
  final String word;
  final String audioPath;
  final String semanticsLabel;

  @override
  ConsumerState<WordCard> createState() => _WordCardState();
}

class _WordCardState extends ConsumerState<WordCard>
    with SingleTickerProviderStateMixin {
  double _scale = 1.0;

  void _handleTap() {
    unawaited(ref.read(audioServiceProvider).playVoice(widget.audioPath));
    setState(() => _scale = 1.1);
    unawaited(
      Future<void>.delayed(Motion.micro, () {
        if (mounted) setState(() => _scale = 1.0);
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final KidThemeExtension? theme = Theme.of(
      context,
    ).extension<KidThemeExtension>();

    return Semantics(
      label: widget.semanticsLabel,
      button: true,
      child: GestureDetector(
        onTap: _handleTap,
        child: AnimatedScale(
          scale: _scale,
          duration: Motion.micro,
          curve: Motion.microCurve,
          child: Container(
            decoration: BoxDecoration(
              color: theme?.surface ?? Colors.white,
              borderRadius: BorderRadius.circular(KidRadius.lg),
              border: Border.all(
                color: theme?.outline ?? Colors.grey,
                width: IconStroke.width,
              ),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // 1:1 illustration area
                AspectRatio(
                  aspectRatio: 1.0,
                  child: Image.asset(
                    widget.imagePath,
                    fit: BoxFit.cover,
                    errorBuilder:
                        (
                          BuildContext context,
                          Object error,
                          StackTrace? stackTrace,
                        ) => ColoredBox(
                          color: theme?.surfaceAlt ?? Colors.grey.shade200,
                          child: Icon(
                            Icons.image,
                            size: TouchSize.primary,
                            color: theme?.textSoft ?? Colors.grey,
                          ),
                        ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(Space.sm),
                  child: Text(
                    widget.word,
                    style: TextStyle(
                      fontFamily: FontFamily.teaching,
                      fontSize: TypeScale.title,
                      color: theme?.text ?? Colors.black,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
