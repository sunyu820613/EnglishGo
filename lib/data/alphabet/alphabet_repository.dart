import 'dart:convert';

import 'package:flutter/services.dart';

import 'models.dart';

/// Errors thrown when schema validation fails.
class AlphabetDataException implements Exception {
  const AlphabetDataException(this.message);
  final String message;

  @override
  String toString() => 'AlphabetDataException: $message';
}

/// Loads and parses alphabet.json, validating schema constraints
/// (26 letters, 2 words each) and cross-checking asset paths
/// against the asset manifest.
class AlphabetRepository {
  const AlphabetRepository();

  static const String _alphabetAsset = 'assets/data/alphabet.json';
  static const int _expectedLetterCount = 26;
  static const int _expectedWordsPerLetter = 2;

  /// Load alphabet data from the bundled asset.
  ///
  /// Throws [AlphabetDataException] if:
  ///   - JSON cannot be parsed
  ///   - Schema version is missing or invalid
  ///   - Letter count != 26
  ///   - Any letter does not have exactly 2 words
  Future<List<LetterEntry>> loadAlphabet() async {
    final String rawJson = await rootBundle.loadString(_alphabetAsset);

    final Map<String, dynamic> data;
    try {
      data = json.decode(rawJson) as Map<String, dynamic>;
    } catch (e) {
      throw AlphabetDataException('Failed to parse alphabet.json: $e');
    }

    if (data['schemaVersion'] is! int) {
      throw const AlphabetDataException(
        'Missing or invalid schemaVersion in alphabet.json',
      );
    }

    final List<dynamic> lettersJson = data['letters'] as List<dynamic>;
    if (lettersJson.length != _expectedLetterCount) {
      throw AlphabetDataException(
        'Expected $_expectedLetterCount letters, got ${lettersJson.length}',
      );
    }

    final List<LetterEntry> letters = lettersJson
        .map((j) => LetterEntry.fromJson(j as Map<String, dynamic>))
        .toList(growable: false);

    for (final LetterEntry entry in letters) {
      if (entry.words.length != _expectedWordsPerLetter) {
        throw AlphabetDataException(
          'Letter "${entry.letter}" has ${entry.words.length} words, '
          'expected $_expectedWordsPerLetter',
        );
      }
    }

    return letters;
  }

  /// Verify that all asset paths referenced in alphabet data
  /// exist in the provided manifest file set.
  ///
  /// Returns a list of missing asset paths (empty = all present).
  Future<List<String>> validateAssetPaths(
    List<LetterEntry> letters,
    Set<String> manifestPaths,
  ) async {
    final List<String> missing = <String>[];

    for (final LetterEntry letter in letters) {
      if (!manifestPaths.contains(letter.letterAudio)) {
        missing.add(letter.letterAudio);
      }
      if (!manifestPaths.contains(letter.phonicsAudio)) {
        missing.add(letter.phonicsAudio);
      }
      for (final WordEntry word in letter.words) {
        if (!manifestPaths.contains(word.audio)) {
          missing.add(word.audio);
        }
        if (!manifestPaths.contains(word.image)) {
          missing.add(word.image);
        }
        if (!manifestPaths.contains(word.phrase)) {
          missing.add(word.phrase);
        }
      }
    }

    return missing;
  }
}
