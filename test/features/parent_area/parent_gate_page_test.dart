import 'package:english_go/core/widgets/kid_button.dart';
import 'package:english_go/features/parent_area/parent_gate_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ParentGatePage', () {
    testWidgets('shows arithmetic challenge', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: ParentGatePage())),
      );

      expect(find.textContaining('Hold 3 seconds'), findsOneWidget);
      expect(find.textContaining('+'), findsOneWidget);
      expect(find.textContaining('='), findsOneWidget);
      expect(find.byType(KidButton), findsWidgets);
    });
  });
}
