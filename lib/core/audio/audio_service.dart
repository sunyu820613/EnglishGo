import 'package:audio_session/audio_session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';

/// Manages all audio playback: voice, sfx, and background music.
///
/// ## Rules (USER_FLOW.md 4, AGENTS.md):
/// - One voice at a time; new voice stops previous.
/// - BGM ducking to 20% during voice playback.
/// - Missing/corrupted files degrade silently (debug warn).
/// - iOS audio_session configured as .playback.
class AudioService {
  AudioService() {
    _initSession();
  }

  final AudioPlayer _voicePlayer = AudioPlayer();
  final AudioPlayer _sfxPlayer = AudioPlayer();
  final AudioPlayer _bgmPlayer = AudioPlayer();

  final double _bgmVolume = 1.0;
  bool _bgmEnabled = true;
  bool _isPlayingVoice = false;
  bool _bgmLoaded = false;

  Future<void> _initSession() async {
    try {
      final AudioSession session = await AudioSession.instance;
      await session.configure(
        const AudioSessionConfiguration(
          avAudioSessionCategory: AVAudioSessionCategory.playback,
          avAudioSessionMode: AVAudioSessionMode.defaultMode,
          avAudioSessionRouteSharingPolicy:
              AVAudioSessionRouteSharingPolicy.defaultPolicy,
          avAudioSessionSetActiveOptions: AVAudioSessionSetActiveOptions.none,
          androidAudioAttributes: AndroidAudioAttributes(
            contentType: AndroidAudioContentType.music,
            usage: AndroidAudioUsage.media,
          ),
          androidWillPauseWhenDucked: true,
        ),
      );
    } catch (_) {
      // Session configuration failure is non-fatal.
      // ignore: avoid_print
      print('[AudioService] Failed to configure audio session');
    }
  }

  /// Play a voice audio file. Stops any currently playing voice.
  /// During playback, BGM volume ducks to 20%.
  Future<void> playVoice(String assetPath) async {
    await stopVoice();
    _isPlayingVoice = true;
    _applyDucking();

    try {
      await _voicePlayer.setAsset(assetPath);
      await _voicePlayer.play();
    } catch (e) {
      // ignore: avoid_print
      print('[AudioService] Failed to play voice: $assetPath — $e');
    } finally {
      _isPlayingVoice = false;
      _restoreBgm();
    }
  }

  /// Play a short SFX (sound effect) file.
  /// SFX does not trigger ducking.
  Future<void> playSfx(String assetPath) async {
    try {
      await _sfxPlayer.setAsset(assetPath);
      await _sfxPlayer.play();
    } catch (e) {
      // ignore: avoid_print
      print('[AudioService] Failed to play sfx: $assetPath — $e');
    }
  }

  /// Stop the currently playing voice.
  Future<void> stopVoice() async {
    await _voicePlayer.stop();
    _isPlayingVoice = false;
    _restoreBgm();
  }

  /// Stop all audio (voice, sfx, bgm).
  Future<void> stopAll() async {
    await _voicePlayer.stop();
    await _sfxPlayer.stop();
    await _bgmPlayer.stop();
    _isPlayingVoice = false;
  }

  /// Set or change background music.
  /// Pass null to stop BGM.
  Future<void> setBgm(String? assetPath) async {
    await _bgmPlayer.stop();
    _bgmLoaded = false;
    if (assetPath == null) return;

    try {
      await _bgmPlayer.setAsset(assetPath);
      await _bgmPlayer.setVolume(_bgmEnabled ? _bgmVolume : 0.0);
      await _bgmPlayer.setLoopMode(LoopMode.all);
      _bgmLoaded = true;
      await _bgmPlayer.play();
    } catch (e) {
      // ignore: avoid_print
      print('[AudioService] Failed to set BGM: $assetPath — $e');
    }
  }

  /// Enable or disable BGM. When disabled, BGM volume is set to 0.
  /// No-ops the play/pause transition when no BGM track is loaded.
  Future<void> setBgmEnabled(bool enabled) async {
    _bgmEnabled = enabled;
    await _bgmPlayer.setVolume(enabled && !_isPlayingVoice ? _bgmVolume : 0.0);
    if (!_bgmLoaded) return;
    if (!enabled) {
      await _bgmPlayer.pause();
    } else {
      await _bgmPlayer.play();
    }
  }

  /// Release all resources. Call when app disposes.
  Future<void> dispose() async {
    for (final AudioPlayer player in <AudioPlayer>[
      _voicePlayer,
      _sfxPlayer,
      _bgmPlayer,
    ]) {
      try {
        await player.dispose();
      } catch (e) {
        // ignore: avoid_print
        print('[AudioService] Failed to dispose player: $e');
      }
    }
  }

  // ---- Ducking ----

  void _applyDucking() {
    if (_bgmEnabled) {
      _bgmPlayer.setVolume(_bgmVolume * 0.2);
    }
  }

  void _restoreBgm() {
    if (_bgmEnabled) {
      _bgmPlayer.setVolume(_bgmVolume);
    }
  }
}

/// Riverpod provider for AudioService.
final Provider<AudioService> audioServiceProvider = Provider<AudioService>((
  Ref ref,
) {
  final AudioService service = AudioService();
  ref.onDispose(() => service.dispose());
  return service;
});
