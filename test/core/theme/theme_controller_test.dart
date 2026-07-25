import 'package:english_go/core/theme/app_theme.dart';
import 'package:english_go/core/theme/kid_theme.dart';
import 'package:english_go/core/theme/theme_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('ThemeController', () {
    test('default theme is starlight', () {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      expect(container.read(themeControllerProvider), 'starlight');
    });

    test('loadTheme restores saved theme from SharedPreferences', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{
        'settings.themeId': 'dino',
      });
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(themeControllerProvider.notifier).loadTheme();
      expect(container.read(themeControllerProvider), 'dino');
    });

    test('loadTheme falls back to default for invalid value', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{
        'settings.themeId': 'unknown_theme',
      });
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(themeControllerProvider.notifier).loadTheme();
      expect(container.read(themeControllerProvider), 'starlight');
    });

    test('loadTheme falls back to default when no prefs saved', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(themeControllerProvider.notifier).loadTheme();
      expect(container.read(themeControllerProvider), 'starlight');
    });

    test('setTheme updates state and persists', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(themeControllerProvider.notifier).setTheme('robot');
      expect(container.read(themeControllerProvider), 'robot');
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      expect(prefs.getString('settings.themeId'), 'robot');
    });

    test('setTheme ignores invalid theme id', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container
          .read(themeControllerProvider.notifier)
          .setTheme('invalid');
      expect(container.read(themeControllerProvider), 'starlight');
    });

    test('currentThemeProvider resolves to correct KidThemeExtension', () {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      final KidThemeExtension theme = container.read(currentThemeProvider);
      expect(theme, allThemes['starlight']);
    });

    test('currentThemeProvider follows themeController changes', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{});
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container
          .read(themeControllerProvider.notifier)
          .setTheme('dessert');
      final KidThemeExtension theme = container.read(currentThemeProvider);
      expect(theme, allThemes['dessert']);
    });
  });
}
