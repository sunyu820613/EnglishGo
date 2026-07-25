import 'package:english_go/core/audio/audio_service.dart';
import 'package:flutter_test/flutter_test.dart';

// A plain `flutter test` run has no real just_audio platform implementation
// registered. AudioService's own try/catch blocks already degrade
// MissingPluginException silently for its awaited calls, but just_audio
// schedules some per-player platform channel activity (dynamically named
// `com.ryanheise.just_audio.methods.<uuid>` channels) outside that awaited
// chain once setAsset()/play() are invoked. Those cannot be intercepted with
// a static MethodChannel mock and surface as unhandled zone errors that fail
// whichever test happens to be running -- an environment limitation, not a
// bug in AudioService. Per docs/agent_reports/01-tech-review-report.md (R2)
// and docs/agent_tasks/03-core-foundation.md, real playback behaviour
// (mutual exclusion, ducking) is exercised in integration_test instead; this
// suite only covers the code paths that do not require a live audio backend.
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AudioService (no live audio backend)', () {
    late AudioService service;

    setUp(() {
      service = AudioService();
    });

    tearDown(() async {
      await service.dispose();
    });

    test('constructs and disposes without throwing', () {
      expect(service, isNotNull);
    });

    test('stopVoice is a no-op when nothing is playing', () async {
      await service.stopVoice();
    });

    test('stopAll is a no-op when nothing is playing', () async {
      await service.stopAll();
    });

    test('setBgmEnabled no-ops when no BGM track is loaded', () async {
      // Regression test: setBgmEnabled(true) must not call play() on an
      // unloaded player, which would hang awaiting a completion event that
      // never arrives (see AudioService._bgmLoaded guard).
      await service.setBgmEnabled(false);
      await service.setBgmEnabled(true);
    });

    test('setBgm(null) stops BGM without requiring a prior track', () async {
      await service.setBgm(null);
    });
  });
}
