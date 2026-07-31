import 'dart:convert';

import 'package:flutter/services.dart';

import 'models.dart';

export 'models.dart';

/// Errors thrown when stories.json fails schema validation.
class StoryDataException implements Exception {
  const StoryDataException(this.message);
  final String message;

  @override
  String toString() => 'StoryDataException: $message';
}

/// Loads and parses stories.json.
class StoryRepository {
  const StoryRepository();

  static const String _storiesAsset = 'assets/data/stories.json';

  Future<List<MiniStory>> loadStories() async {
    final String rawJson = await rootBundle.loadString(_storiesAsset);

    final Map<String, dynamic> data;
    try {
      data = json.decode(rawJson) as Map<String, dynamic>;
    } catch (e) {
      throw StoryDataException('Failed to parse stories.json: $e');
    }

    if (data['schemaVersion'] is! int) {
      throw const StoryDataException(
        'Missing or invalid schemaVersion in stories.json',
      );
    }

    final List<dynamic> storiesJson = data['stories'] as List<dynamic>;
    final List<MiniStory> stories = storiesJson
        .map((s) => MiniStory.fromJson(s as Map<String, dynamic>))
        .toList(growable: false);

    for (final MiniStory story in stories) {
      if (story.pages.isEmpty) {
        throw StoryDataException('Story "${story.id}" has no pages');
      }
      if (story.requiredLetters.isEmpty) {
        throw StoryDataException('Story "${story.id}" has no requiredLetters');
      }
    }

    return stories;
  }
}
