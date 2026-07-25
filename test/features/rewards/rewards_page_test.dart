import 'package:english_go/features/rewards/rewards_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  testWidgets('RewardsPage shows empty state', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: RewardsPage())),
    );
    await tester.pump();

    expect(find.text('My Collection'), findsOneWidget);
    expect(find.textContaining('stars collected'), findsOneWidget);
    expect(find.textContaining('Complete lessons'), findsOneWidget);
  });
}
