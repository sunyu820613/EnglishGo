import 'dart:async';

import 'package:english_go/core/theme/validate_theme_assets.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('validateThemeAssets', () {
    test('returns all asset paths when none are in manifest', () async {
      final TestAssetBundle bundle = TestAssetBundle(<String, Object?>{});
      final List<String> missing = await validateThemeAssets(bundle);
      // All 6 themes x 9 asset fields = 54 paths should be missing.
      expect(missing.length, 54);
    });

    test('returns empty list when all assets are present', () async {
      final List<String> allPaths = <String>[
        'assets/themes/starlight/background_scene.webp',
        'assets/themes/starlight/frame_decoration.webp',
        'assets/themes/starlight/mascot.webp',
        'assets/themes/starlight/particle.webp',
        'assets/themes/starlight/celebration.webp',
        'assets/themes/starlight/reward_chest.webp',
        'assets/themes/starlight/map_path.webp',
        'assets/themes/starlight/sfx/',
        'assets/themes/starlight/bgm.m4a',
        'assets/themes/dino/background_scene.webp',
        'assets/themes/dino/frame_decoration.webp',
        'assets/themes/dino/mascot.webp',
        'assets/themes/dino/particle.webp',
        'assets/themes/dino/celebration.webp',
        'assets/themes/dino/reward_chest.webp',
        'assets/themes/dino/map_path.webp',
        'assets/themes/dino/sfx/',
        'assets/themes/dino/bgm.m4a',
        'assets/themes/robot/background_scene.webp',
        'assets/themes/robot/frame_decoration.webp',
        'assets/themes/robot/mascot.webp',
        'assets/themes/robot/particle.webp',
        'assets/themes/robot/celebration.webp',
        'assets/themes/robot/reward_chest.webp',
        'assets/themes/robot/map_path.webp',
        'assets/themes/robot/sfx/',
        'assets/themes/robot/bgm.m4a',
        'assets/themes/moon_garden/background_scene.webp',
        'assets/themes/moon_garden/frame_decoration.webp',
        'assets/themes/moon_garden/mascot.webp',
        'assets/themes/moon_garden/particle.webp',
        'assets/themes/moon_garden/celebration.webp',
        'assets/themes/moon_garden/reward_chest.webp',
        'assets/themes/moon_garden/map_path.webp',
        'assets/themes/moon_garden/sfx/',
        'assets/themes/moon_garden/bgm.m4a',
        'assets/themes/ballet_castle/background_scene.webp',
        'assets/themes/ballet_castle/frame_decoration.webp',
        'assets/themes/ballet_castle/mascot.webp',
        'assets/themes/ballet_castle/particle.webp',
        'assets/themes/ballet_castle/celebration.webp',
        'assets/themes/ballet_castle/reward_chest.webp',
        'assets/themes/ballet_castle/map_path.webp',
        'assets/themes/ballet_castle/sfx/',
        'assets/themes/ballet_castle/bgm.m4a',
        'assets/themes/dessert/background_scene.webp',
        'assets/themes/dessert/frame_decoration.webp',
        'assets/themes/dessert/mascot.webp',
        'assets/themes/dessert/particle.webp',
        'assets/themes/dessert/celebration.webp',
        'assets/themes/dessert/reward_chest.webp',
        'assets/themes/dessert/map_path.webp',
        'assets/themes/dessert/sfx/',
        'assets/themes/dessert/bgm.m4a',
      ];
      final Map<String, Object?> manifest = <String, Object?>{
        for (final String p in allPaths)
          p: <Map<Object?, Object?>>[
            <Object?, Object?>{'asset': p},
          ],
      };
      final TestAssetBundle bundle = TestAssetBundle(manifest);
      final List<String> missing = await validateThemeAssets(bundle);
      expect(missing, isEmpty);
    });
  });
}

/// Minimal test stub that serves a fake `AssetManifest.bin`, matching the
/// binary format the real `AssetManifest.loadFromAssetBundle` API expects
/// (Flutter no longer ships the legacy `AssetManifest.json`).
class TestAssetBundle extends AssetBundle {
  TestAssetBundle(Map<String, Object?> manifest)
    : _manifestBytes = const StandardMessageCodec().encodeMessage(manifest)!;

  final ByteData _manifestBytes;

  @override
  Future<ByteData> load(String key) async {
    if (key == 'AssetManifest.bin') return _manifestBytes;
    throw UnimplementedError('Not needed for this test: $key');
  }

  @override
  Future<T> loadStructuredBinaryData<T>(
    String key,
    FutureOr<T> Function(ByteData data) parser,
  ) async {
    final ByteData data = await load(key);
    return parser(data);
  }
}
