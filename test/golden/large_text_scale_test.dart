import 'dart:convert';

import 'package:english_go/features/alphabet/alphabet_map_page.dart';
import 'package:english_go/features/home/home_page.dart';
import 'package:english_go/features/onboarding/onboarding_page.dart';
import 'package:english_go/features/parent_area/parent_area_page.dart';
import 'package:english_go/features/parent_area/parent_gate_page.dart';
import 'package:english_go/features/rewards/rewards_page.dart';
import 'package:english_go/features/themes/theme_selection_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ACCESSIBILITY.md requires the app to remain overflow-free at 200% system
// text scale. flutter_test surfaces RenderFlex overflow as a failing
// exception during pump, so these tests need no extra assertions beyond
// "it builds" -- a real overflow fails the test on its own.
void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
  });

  Widget wrapAt200(Widget child, {Size size = const Size(360, 780)}) {
    return ProviderScope(
      child: MediaQuery(
        data: MediaQueryData(
          size: size,
          textScaler: const TextScaler.linear(2.0),
        ),
        child: MaterialApp(home: child),
      ),
    );
  }

  testWidgets('HomePage has no overflow at 200% text scale', (tester) async {
    await tester.pumpWidget(wrapAt200(const HomePage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('OnboardingPage has no overflow at 200% text scale', (
    tester,
  ) async {
    await tester.pumpWidget(wrapAt200(const OnboardingPage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('ThemeSelectionPage has no overflow at 200% text scale', (
    tester,
  ) async {
    await tester.pumpWidget(wrapAt200(const ThemeSelectionPage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('RewardsPage has no overflow at 200% text scale', (tester) async {
    await tester.pumpWidget(wrapAt200(const RewardsPage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('ParentGatePage has no overflow at 200% text scale', (
    tester,
  ) async {
    await tester.pumpWidget(wrapAt200(const ParentGatePage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets('ParentAreaPage has no overflow at 200% text scale', (
    tester,
  ) async {
    await tester.pumpWidget(wrapAt200(const ParentAreaPage()));
    await tester.pump();
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'AlphabetMapPage has no overflow at 200% text scale, incl. a starred '
    'letter (grid cells are fixed-aspect, so a 3-star row is the risky '
    'case)',
    (tester) async {
      SharedPreferences.setMockInitialValues(<String, Object>{
        'progress.data': jsonEncode(<String, Object>{
          'schemaVersion': 1,
          'themeId': 'starlight',
          'letters': <String, Object>{
            'A': <String, Object>{'stars': 3},
          },
          'stickers': <String>[],
          'settings': <String, Object>{},
        }),
      });
      await tester.pumpWidget(wrapAt200(const AlphabetMapPage()));
      // Wait for alphabet.json + progress to load without pumpAndSettle
      // (a known flutter_test hazard with scrollables -- see
      // lesson_page_large_text_scale_test.dart).
      for (int i = 0; i < 6; i++) {
        await tester.pump(const Duration(milliseconds: 200));
      }
      expect(tester.takeException(), isNull);
    },
  );
}
