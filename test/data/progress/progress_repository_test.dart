import 'dart:convert';

import 'package:english_go/data/progress/progress_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('LetterProgress', () {
    test('default values', () {
      const LetterProgress p = LetterProgress();
      expect(p.stars, 0);
      expect(p.wordsHeard, isEmpty);
      expect(p.quizDone, false);
      expect(p.matchDone, false);
      expect(p.traceDone, false);
      expect(p.listenRepeats, 0);
      expect(p.quizRetries, 0);
    });

    test('hasStar returns correct values', () {
      const LetterProgress p = LetterProgress(stars: 2);
      expect(p.hasStar(0), true);
      expect(p.hasStar(1), true);
      expect(p.hasStar(2), false);
    });

    test('copyWith updates fields', () {
      const p = LetterProgress(stars: 1, wordsHeard: ['apple']);
      final updated = p.copyWith(stars: 2, wordsHeard: ['apple', 'ant']);
      expect(updated.stars, 2);
      expect(updated.wordsHeard, ['apple', 'ant']);
      expect(updated.quizDone, false); // unchanged
    });

    test('JSON round-trip', () {
      const original = LetterProgress(
        stars: 3,
        wordsHeard: ['apple', 'ant'],
        quizDone: true,
        matchDone: true,
        listenRepeats: 5,
        quizRetries: 1,
      );
      final json = original.toJson();
      final restored = LetterProgress.fromJson(json);
      expect(restored.stars, original.stars);
      expect(restored.wordsHeard, original.wordsHeard);
      expect(restored.quizDone, original.quizDone);
      expect(restored.matchDone, original.matchDone);
      expect(restored.traceDone, original.traceDone);
      expect(restored.listenRepeats, original.listenRepeats);
      expect(restored.quizRetries, original.quizRetries);
    });

    test('fromJson handles null values gracefully', () {
      final restored = LetterProgress.fromJson(<String, dynamic>{});
      expect(restored.stars, 0);
      expect(restored.quizDone, false);
    });
  });

  group('ProgressData', () {
    test('default values', () {
      const data = ProgressData();
      expect(data.schemaVersion, 1);
      expect(data.themeId, 'starlight');
      expect(data.letters, isEmpty);
      expect(data.stickers, isEmpty);
      expect(data.settings.bgmOn, true);
      expect(data.settings.reducedMotion, false);
      expect(data.settings.accent, 'en-US');
    });

    test('JSON round-trip with data', () {
      const original = ProgressData(
        letters: <String, LetterProgress>{
          'A': LetterProgress(stars: 2, quizDone: true),
          'B': LetterProgress(),
        },
        stickers: <String>['apple', 'ant'],
        settings: SettingsData(bgmOn: false, reducedMotion: true),
      );
      final json = original.toJson();
      final restored = ProgressData.fromJson(json);
      expect(restored.themeId, original.themeId);
      expect(restored.letters['A']!.stars, 2);
      expect(restored.letters['B']!.stars, 0);
      expect(restored.stickers, ['apple', 'ant']);
      expect(restored.settings.bgmOn, false);
      expect(restored.settings.reducedMotion, true);
    });

    test('fromJson handles empty/missing fields', () {
      final restored = ProgressData.fromJson(<String, dynamic>{});
      expect(restored.schemaVersion, 1);
      expect(restored.letters, isEmpty);
      expect(restored.stickers, isEmpty);
    });
  });

  group('ProgressRepository', () {
    setUp(() {
      SharedPreferences.setMockInitialValues(<String, Object>{});
    });

    test('addStar persists and does not double-count', () async {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(progressProvider.notifier).addStar('A', 0);
      await container.read(progressProvider.notifier).addStar('A', 0);
      expect(container.read(progressProvider).letters['A']!.stars, 1);

      await container.read(progressProvider.notifier).addStar('A', 1);
      expect(container.read(progressProvider).letters['A']!.stars, 2);
    });

    test('addStar ignores out-of-range star index', () async {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(progressProvider.notifier).addStar('A', 5);
      expect(container.read(progressProvider).letters['A'], isNull);
    });

    test('mutations round-trip through SharedPreferences', () async {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(progressProvider.notifier).addStar('A', 0);
      await container
          .read(progressProvider.notifier)
          .markWordHeard('A', 'apple');
      await container.read(progressProvider.notifier).markQuizDone('A');

      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? raw = prefs.getString('progress.data');
      expect(raw, isNotNull);

      final ProgressData persisted = ProgressData.fromJson(
        json.decode(raw!) as Map<String, dynamic>,
      );
      expect(persisted.letters['A']!.stars, 1);
      expect(persisted.letters['A']!.wordsHeard, contains('apple'));
      expect(persisted.letters['A']!.quizDone, true);
    });

    test('markWordHeard is idempotent', () async {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      final ProgressRepository repo = container.read(progressProvider.notifier);
      await repo.markWordHeard('A', 'apple');
      await repo.markWordHeard('A', 'apple');
      expect(container.read(progressProvider).letters['A']!.wordsHeard, [
        'apple',
      ]);
    });

    test('loadProgress falls back to defaults on corrupted data', () async {
      SharedPreferences.setMockInitialValues(<String, Object>{
        'progress.data': 'not valid json {{{',
      });
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      final ProgressData loaded = await container
          .read(progressProvider.notifier)
          .loadProgress();
      expect(loaded.letters, isEmpty);
      expect(loaded.themeId, 'starlight');
    });

    test('loadProgress restores previously persisted data', () async {
      const ProgressData seed = ProgressData(
        letters: <String, LetterProgress>{'B': LetterProgress(stars: 3)},
      );
      SharedPreferences.setMockInitialValues(<String, Object>{
        'progress.data': json.encode(seed.toJson()),
      });
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      final ProgressData loaded = await container
          .read(progressProvider.notifier)
          .loadProgress();
      expect(loaded.letters['B']!.stars, 3);
    });

    test('setBgmOn persists the settings flag', () async {
      final ProviderContainer container = ProviderContainer();
      addTearDown(container.dispose);

      await container.read(progressProvider.notifier).setBgmOn(false);
      expect(container.read(progressProvider).settings.bgmOn, false);
    });
  });
}

// See widget test suite for integration coverage.
