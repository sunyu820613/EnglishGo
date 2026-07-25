import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app_theme.dart';
import 'kid_theme.dart';

/// Persistent theme selection via shared_preferences.
/// Key: `settings.themeId`, default: `starlight`.
/// Corrupted / unknown values fall back to default.
class ThemeController extends Notifier<String> {
  @override
  String build() => 'starlight';

  static const String _prefsKey = 'settings.themeId';

  static const List<String> _validThemes = <String>[
    'starlight',
    'dino',
    'robot',
    'moonGarden',
    'balletCastle',
    'dessert',
  ];

  /// Load persisted theme. Call once at app startup.
  Future<void> loadTheme() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? saved = prefs.getString(_prefsKey);
    if (saved != null && _validThemes.contains(saved)) {
      state = saved;
    }
    // Invalid / null values keep the default.
  }

  /// Switch theme and persist.
  Future<void> setTheme(String themeId) async {
    if (!_validThemes.contains(themeId)) return;
    state = themeId;
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, themeId);
  }
}

final NotifierProvider<ThemeController, String> themeControllerProvider =
    NotifierProvider<ThemeController, String>(ThemeController.new);

/// Convenience: the current [KidThemeExtension] derived from theme id.
final Provider<KidThemeExtension> currentThemeProvider =
    Provider<KidThemeExtension>((Ref ref) {
      final String themeId = ref.watch(themeControllerProvider);
      return allThemes[themeId] ?? allThemes['starlight']!;
    });
