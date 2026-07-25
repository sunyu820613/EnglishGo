import 'package:english_go/core/theme/app_theme.dart';
import 'package:english_go/features/themes/theme_selection_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets('shows all six themes', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ThemeSelectionPage())),
    );
    await tester.pump();

    expect(find.text('Choose Theme'), findsOneWidget);
    // The grid is lazily built, so scroll through it to reach every card
    // rather than assuming all six are simultaneously on-screen.
    for (final String id in allThemes.keys) {
      await tester.scrollUntilVisible(
        find.text(id),
        200,
        scrollable: find.byType(Scrollable),
      );
      expect(find.text(id), findsWidgets);
    }
  });
}
