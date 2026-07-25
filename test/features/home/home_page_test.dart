import 'package:english_go/features/home/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets('HomePage renders core navigation', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: HomePage())),
    );
    await tester.pump();

    expect(find.text('Play'), findsOneWidget);
    expect(find.text('Rewards'), findsOneWidget);
    expect(find.text('Themes'), findsOneWidget);
    expect(find.text('Parents'), findsOneWidget);
    expect(find.bySemanticsLabel('Home mascot'), findsOneWidget);
    handle.dispose();
  });
}
