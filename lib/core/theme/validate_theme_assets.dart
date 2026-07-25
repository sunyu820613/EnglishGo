import 'dart:developer' as developer;

import 'package:flutter/services.dart';

import 'app_theme.dart';

/// Validate that all theme asset paths exist in the bundled AssetManifest.
/// In debug mode missing assets are logged as warnings.
/// In release mode the function is silent.
/// Returns the list of missing asset paths for test assertions.
Future<List<String>> validateThemeAssets(AssetBundle bundle) async {
  final AssetManifest manifest = await AssetManifest.loadFromAssetBundle(
    bundle,
  );
  final Set<String> available = manifest.listAssets().toSet();

  final List<String> missing = <String>[];
  for (final KidThemeExtension theme in allThemes.values) {
    for (final String path in theme.assets.allPaths) {
      if (!available.contains(path)) {
        missing.add(path);
      }
    }
  }

  if (missing.isNotEmpty) {
    // ignore: avoid_print
    developer.log('validateThemeAssets: missing theme assets -- $missing');
    // Use debugPrint in debug mode.
    // ignore: avoid_print
    developer.log('validateThemeAssets:  ${missing.length} assets missing');
  }

  return missing;
}
