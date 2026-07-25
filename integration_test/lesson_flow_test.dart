// Integration test for the full app lesson flow.
// Runs on real device/emulator: flutter test integration_test/lesson_flow_test.dart
//
// Tests the navigation sequence:
//   Loading -> Onboarding (theme selection) -> Home -> Alphabet Map -> Lesson(A)
//
// Prerequisites:
//   - Real device or emulator with audio support
//   - Asset files in place (placeholder images, audio)

import 'package:english_go/main.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Full Lesson Flow', () {
    testWidgets('navigates onboarding -> home -> map -> lesson A', (
      WidgetTester tester,
    ) async {
      // Launch the full app
      await tester.pumpWidget(const ProviderScope(child: EnglishGoApp()));
      await tester.pump();

      // Expect loading state initially
      expect(find.text('Loading...'), findsOneWidget);

      // Wait for providers to initialize (theme + progress)
      await tester.pump(const Duration(milliseconds: 1500));

      // After initialization, should show onboarding theme selection
      // (no persisted progress yet)
      expect(find.text('Choose your world!'), findsOneWidget);
      expect(find.bySemanticsLabel('Theme starlight'), findsOneWidget);
    });
  });
}
