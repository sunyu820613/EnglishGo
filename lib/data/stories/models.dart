// Immutable data models for mini-story content.
// Parsed from assets/data/stories.json.
// REWARD_SYSTEM.md: "迷你故事 | 完成 A/B/C、D/E/F… 每 3 字母一段".

class StoryPage {
  const StoryPage({required this.text, required this.image});

  factory StoryPage.fromJson(Map<String, dynamic> json) {
    return StoryPage(
      text: json['text'] as String,
      image: json['image'] as String,
    );
  }

  final String text;
  final String image;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'text': text,
    'image': image,
  };
}

class MiniStory {
  const MiniStory({
    required this.id,
    required this.title,
    required this.requiredLetters,
    required this.pages,
  });

  factory MiniStory.fromJson(Map<String, dynamic> json) {
    final List<dynamic> letters = json['requiredLetters'] as List<dynamic>;
    final List<dynamic> pages = json['pages'] as List<dynamic>;
    return MiniStory(
      id: json['id'] as String,
      title: json['title'] as String,
      requiredLetters: letters.cast<String>(),
      pages: pages
          .map((p) => StoryPage.fromJson(p as Map<String, dynamic>))
          .toList(growable: false),
    );
  }

  final String id;
  final String title;
  final List<String> requiredLetters;
  final List<StoryPage> pages;

  /// A story unlocks once every required letter has reached 3 stars
  /// (REWARD_SYSTEM.md: same mastery bar as the letter badge).
  bool isUnlockedBy(Map<String, int> starsByLetter) {
    return requiredLetters.every(
      (String letter) => (starsByLetter[letter] ?? 0) >= 3,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'id': id,
    'title': title,
    'requiredLetters': requiredLetters,
    'pages': pages.map((p) => p.toJson()).toList(),
  };
}
