import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

export 'models.dart';

/// Manages learning progress persistence with double-write fault tolerance.
///
/// ## Double-write protocol (Task 01 R1):
/// 1. Serialize full state to JSON string.
/// 2. Write string to shared_preferences.
/// 3. Immediately read back and verify checksum (JSON round-trip).
/// 4. If read-back fails, keep in-memory state (no data loss) and throw.
/// 5. Caller may catch the exception and retry on next operation.
class ProgressRepository extends Notifier<ProgressData> {
  @override
  ProgressData build() => const ProgressData();

  static const String _prefsKey = 'progress.data';

  // ---- Initialization ----

  /// Load progress from shared_preferences.
  /// Returns the persisted data, or default if none exists or corrupted.
  Future<ProgressData> loadProgress() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString(_prefsKey);
    if (raw == null) return const ProgressData();

    try {
      final Map<String, dynamic> decoded =
          json.decode(raw) as Map<String, dynamic>;
      final ProgressData data = ProgressData.fromJson(decoded);
      state = data;
      return data;
    } catch (e) {
      // Corrupted data: keep default state, discard corrupted data silently.
      // In debug mode, surface the error for developer attention.
      // ignore: avoid_print
      print('[ProgressRepository] Corrupted progress data, using defaults: $e');
      return const ProgressData();
    }
  }

  // ---- Double-write persistence ----

  /// Persist current state with double-write verification.
  ///
  /// Throws [ProgressWriteException] if write-back verification fails.
  /// The in-memory state is preserved so no data is lost.
  Future<void> _persist() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    // Step 1: Serialize to string.
    final String serialized = json.encode(state.toJson());

    // Step 2: Write.
    final bool writeOk = await prefs.setString(_prefsKey, serialized);
    if (!writeOk) {
      throw const ProgressWriteException('Failed to write progress data');
    }

    // Step 3: Read back and verify round-trip.
    final String? readBack = prefs.getString(_prefsKey);
    if (readBack != serialized) {
      // Write verification failed — data on disk may be stale.
      // In-memory state is intact; throw so caller can handle.
      throw const ProgressWriteException(
        'Write verification failed: read-back mismatch',
      );
    }
  }

  // ---- Mutation methods ----

  /// Award a star for a letter. Idempotent — does not double-count.
  /// [starIndex] is 0-based (0, 1, 2).
  Future<void> addStar(String letter, int starIndex) async {
    if (starIndex < 0 || starIndex >= LetterProgress.maxStars) return;

    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    if (current.hasStar(starIndex)) return; // Already earned.

    final LetterProgress updated = current.copyWith(stars: current.stars + 1);
    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = updated,
    );
    await _persist();
  }

  /// Mark a word as heard. Idempotent.
  Future<void> markWordHeard(String letter, String wordId) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    if (current.wordsHeard.contains(wordId)) return;

    final LetterProgress updated = current.copyWith(
      wordsHeard: [...current.wordsHeard, wordId],
    );
    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = updated,
    );
    await _persist();
  }

  /// Mark quiz as done.
  Future<void> markQuizDone(String letter) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    if (current.quizDone) return;

    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = current.copyWith(quizDone: true),
    );
    await _persist();
  }

  /// Mark matching game as done.
  Future<void> markMatchDone(String letter) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    if (current.matchDone) return;

    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = current.copyWith(matchDone: true),
    );
    await _persist();
  }

  /// Mark tracing as done.
  Future<void> markTraceDone(String letter) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    if (current.traceDone) return;

    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = current.copyWith(traceDone: true),
    );
    await _persist();
  }

  /// Increment listen repeat counter.
  Future<void> incrementListenRepeats(String letter) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = current.copyWith(listenRepeats: current.listenRepeats + 1),
    );
    await _persist();
  }

  /// Increment quiz retry counter.
  Future<void> incrementQuizRetries(String letter) async {
    final LetterProgress current =
        state.letters[letter] ?? const LetterProgress();
    state = state.copyWith(
      letters: Map<String, LetterProgress>.from(state.letters)
        ..[letter] = current.copyWith(quizRetries: current.quizRetries + 1),
    );
    await _persist();
  }

  // ---- Settings ----

  Future<void> setBgmOn(bool value) async {
    state = state.copyWith(settings: state.settings.copyWith(bgmOn: value));
    await _persist();
  }

  Future<void> setReducedMotion(bool value) async {
    state = state.copyWith(
      settings: state.settings.copyWith(reducedMotion: value),
    );
    await _persist();
  }

  Future<void> setAccent(String value) async {
    state = state.copyWith(settings: state.settings.copyWith(accent: value));
    await _persist();
  }
}

/// Exception thrown when progress write verification fails.
class ProgressWriteException implements Exception {
  const ProgressWriteException(this.message);
  final String message;

  @override
  String toString() => 'ProgressWriteException: $message';
}

final NotifierProvider<ProgressRepository, ProgressData> progressProvider =
    NotifierProvider<ProgressRepository, ProgressData>(ProgressRepository.new);
