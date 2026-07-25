// Immutable data models for learning progress.
// Persisted as JSON via shared_preferences.
// Schema matches LEARNING_MODEL.md 6.

class LetterProgress {
  const LetterProgress({
    this.stars = 0,
    this.wordsHeard = const <String>[],
    this.quizDone = false,
    this.matchDone = false,
    this.traceDone = false,
    this.listenRepeats = 0,
    this.quizRetries = 0,
  });

  factory LetterProgress.fromJson(Map<String, dynamic> json) {
    return LetterProgress(
      stars: (json['stars'] as num?)?.toInt() ?? 0,
      wordsHeard:
          (json['wordsHeard'] as List<dynamic>?)?.cast<String>() ??
          const <String>[],
      quizDone: json['quizDone'] as bool? ?? false,
      matchDone: json['matchDone'] as bool? ?? false,
      traceDone: json['traceDone'] as bool? ?? false,
      listenRepeats: (json['listenRepeats'] as num?)?.toInt() ?? 0,
      quizRetries: (json['quizRetries'] as num?)?.toInt() ?? 0,
    );
  }

  final int stars;
  final List<String> wordsHeard;
  final bool quizDone;
  final bool matchDone;
  final bool traceDone;
  final int listenRepeats;
  final int quizRetries;

  static const int maxStars = 3;

  LetterProgress copyWith({
    int? stars,
    List<String>? wordsHeard,
    bool? quizDone,
    bool? matchDone,
    bool? traceDone,
    int? listenRepeats,
    int? quizRetries,
  }) {
    return LetterProgress(
      stars: stars ?? this.stars,
      wordsHeard: wordsHeard ?? this.wordsHeard,
      quizDone: quizDone ?? this.quizDone,
      matchDone: matchDone ?? this.matchDone,
      traceDone: traceDone ?? this.traceDone,
      listenRepeats: listenRepeats ?? this.listenRepeats,
      quizRetries: quizRetries ?? this.quizRetries,
    );
  }

  /// Returns true if starIndex (0-based) is already earned.
  bool hasStar(int starIndex) => starIndex < stars;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'stars': stars,
    'wordsHeard': wordsHeard,
    'quizDone': quizDone,
    'matchDone': matchDone,
    'traceDone': traceDone,
    'listenRepeats': listenRepeats,
    'quizRetries': quizRetries,
  };
}

class SettingsData {
  const SettingsData({
    this.bgmOn = true,
    this.reducedMotion = false,
    this.accent = 'en-US',
    this.onboardingComplete = false,
  });

  factory SettingsData.fromJson(Map<String, dynamic> json) {
    return SettingsData(
      bgmOn: json['bgmOn'] as bool? ?? true,
      reducedMotion: json['reducedMotion'] as bool? ?? false,
      accent: json['accent'] as String? ?? 'en-US',
      onboardingComplete: json['onboardingComplete'] as bool? ?? false,
    );
  }

  final bool bgmOn;
  final bool reducedMotion;
  final String accent;
  final bool onboardingComplete;

  SettingsData copyWith({
    bool? bgmOn,
    bool? reducedMotion,
    String? accent,
    bool? onboardingComplete,
  }) {
    return SettingsData(
      bgmOn: bgmOn ?? this.bgmOn,
      reducedMotion: reducedMotion ?? this.reducedMotion,
      accent: accent ?? this.accent,
      onboardingComplete: onboardingComplete ?? this.onboardingComplete,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'bgmOn': bgmOn,
    'reducedMotion': reducedMotion,
    'accent': accent,
    'onboardingComplete': onboardingComplete,
  };
}

class ProgressData {
  const ProgressData({
    this.schemaVersion = 1,
    this.themeId = 'starlight',
    this.letters = const <String, LetterProgress>{},
    this.stickers = const <String>[],
    this.settings = const SettingsData(),
  });

  factory ProgressData.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> lettersJson =
        json['letters'] as Map<String, dynamic>? ?? const <String, dynamic>{};
    final Map<String, LetterProgress> letters = lettersJson.map(
      (key, value) =>
          MapEntry(key, LetterProgress.fromJson(value as Map<String, dynamic>)),
    );

    return ProgressData(
      schemaVersion: (json['schemaVersion'] as num?)?.toInt() ?? 1,
      themeId: json['themeId'] as String? ?? 'starlight',
      letters: letters,
      stickers:
          (json['stickers'] as List<dynamic>?)?.cast<String>() ??
          const <String>[],
      settings: json['settings'] != null
          ? SettingsData.fromJson(json['settings'] as Map<String, dynamic>)
          : const SettingsData(),
    );
  }

  final int schemaVersion;
  final String themeId;
  final Map<String, LetterProgress> letters;
  final List<String> stickers;
  final SettingsData settings;

  ProgressData copyWith({
    int? schemaVersion,
    String? themeId,
    Map<String, LetterProgress>? letters,
    List<String>? stickers,
    SettingsData? settings,
  }) {
    return ProgressData(
      schemaVersion: schemaVersion ?? this.schemaVersion,
      themeId: themeId ?? this.themeId,
      letters: letters ?? this.letters,
      stickers: stickers ?? this.stickers,
      settings: settings ?? this.settings,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'schemaVersion': schemaVersion,
    'themeId': themeId,
    'letters': letters.map((k, v) => MapEntry(k, v.toJson())),
    'stickers': stickers,
    'settings': settings.toJson(),
  };
}
