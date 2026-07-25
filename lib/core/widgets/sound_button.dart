import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../audio/audio_service.dart';
import '../theme/tokens.dart';
import 'kid_button.dart';

/// A button that plays a voice via [AudioService].
///
/// Shows a ripple/outline animation while playing.
/// Repeated clicks restart the voice (non-stacking via AudioService).
class SoundButton extends ConsumerStatefulWidget {
  const SoundButton({
    super.key,
    required this.audioPath,
    required this.semanticsLabel,
    this.size = KidSize.kid,
    this.onPlayingChanged,
  });

  final String audioPath;
  final String semanticsLabel;
  final KidSize size;
  final ValueChanged<bool>? onPlayingChanged;

  @override
  ConsumerState<SoundButton> createState() => _SoundButtonState();
}

class _SoundButtonState extends ConsumerState<SoundButton> {
  bool _isPlaying = false;

  void _handleTap() {
    final AudioService audio = ref.read(audioServiceProvider);

    setState(() => _isPlaying = true);
    widget.onPlayingChanged?.call(true);

    unawaited(
      audio.playVoice(widget.audioPath).then((_) {
        if (mounted) {
          setState(() => _isPlaying = false);
          widget.onPlayingChanged?.call(false);
        }
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return KidButton(
      onPressed: _handleTap,
      semanticsLabel: widget.semanticsLabel,
      size: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: <Widget>[
          Icon(
            _isPlaying ? Icons.volume_up : Icons.volume_up_outlined,
            size: TouchSize.min,
          ),
          if (_isPlaying)
            Positioned.fill(
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(KidRadius.md),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.5),
                      width: 3,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
