import 'package:english_go/main.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('App starts with loading state', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: EnglishGoApp()));
    // Should show loading indicator or the loading text
    expect(find.text('Loading...'), findsOneWidget);
  });
}
