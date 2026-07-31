import 'package:english_go/core/widgets/kid_button.dart';
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

  testWidgets(
    'the mascot+Play cluster is centered in the space above the footer '
    'row, not pinned near the top of the whole screen',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: MediaQuery(
              data: MediaQueryData(size: Size(375, 812)),
              child: HomePage(),
            ),
          ),
        ),
      );
      await tester.pump();

      final double playCenterY = tester
          .getCenter(find.widgetWithText(KidButton, 'Play'))
          .dy;
      final double footerTopY = tester.getTopLeft(find.text('Rewards')).dy;

      // The Play button's center should sit roughly halfway between the
      // top of the screen and the footer row -- not squeezed up near the
      // very top with a big dead gap below it before the footer.
      final double expectedMid = footerTopY / 2;
      expect((playCenterY - expectedMid).abs(), lessThan(footerTopY * 0.25));
    },
  );
}
