import 'dart:convert';

import 'package:english_go/data/progress/progress_repository.dart';
import 'package:english_go/features/rewards/rewards_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets(
    'shows a locked story tile before A/B/C are mastered, and an unlocked '
    'one once all three reach 3 stars',
    (WidgetTester tester) async {
      SharedPreferences.setMockInitialValues(<String, Object>{
        'progress.data': jsonEncode(<String, Object>{
          'schemaVersion': 1,
          'themeId': 'starlight',
          'letters': <String, Object>{
            'A': <String, Object>{'stars': 3},
            'B': <String, Object>{'stars': 3},
            'C': <String, Object>{'stars': 2},
          },
          'stickers': <String>[],
          'settings': <String, Object>{},
        }),
      });

      // ProgressRepository.build() starts at defaults; only loadProgress()
      // (called once at real app boot in main.dart) reads persisted
      // SharedPreferences state, so reproduce that here.
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);
      await container.read(progressProvider.notifier).loadProgress();

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(home: RewardsPage()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Complete A, B, C to unlock'), findsOneWidget);
      expect(find.text('A Sunny Day'), findsNothing);
    },
  );
}
