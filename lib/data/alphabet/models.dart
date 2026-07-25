// Immutable data models for alphabet content.
// Parsed from assets/data/alphabet.json.

class WordEntry {
  const WordEntry({
    required this.id,
    required this.text,
    required this.audio,
    required this.image,
    required this.phrase,
  });

  factory WordEntry.fromJson(Map<String, dynamic> json) {
    return WordEntry(
      id: json['id'] as String,
      text: json['text'] as String,
      audio: json['audio'] as String,
      image: json['image'] as String,
      phrase: json['phrase'] as String,
    );
  }

  final String id;
  final String text;
  final String audio;
  final String image;
  final String phrase;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'id': id,
    'text': text,
    'audio': audio,
    'image': image,
    'phrase': phrase,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is WordEntry && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

class LetterEntry {
  const LetterEntry({
    required this.letter,
    required this.letterAudio,
    required this.phonicsAudio,
    required this.phonicsIpa,
    this.phonicsNote,
    required this.words,
  });

  factory LetterEntry.fromJson(Map<String, dynamic> json) {
    final List<dynamic> wordList = json['words'] as List<dynamic>;
    return LetterEntry(
      letter: json['letter'] as String,
      letterAudio: json['letterAudio'] as String,
      phonicsAudio: json['phonicsAudio'] as String,
      phonicsIpa: json['phonicsIpa'] as String,
      phonicsNote: json['phonicsNote'] as String?,
      words: wordList
          .map((w) => WordEntry.fromJson(w as Map<String, dynamic>))
          .toList(growable: false),
    );
  }

  final String letter;
  final String letterAudio;
  final String phonicsAudio;
  final String phonicsIpa;
  final String? phonicsNote;
  final List<WordEntry> words;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'letter': letter,
    'letterAudio': letterAudio,
    'phonicsAudio': phonicsAudio,
    'phonicsIpa': phonicsIpa,
    'phonicsNote': phonicsNote,
    'words': words.map((w) => w.toJson()).toList(),
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LetterEntry &&
          runtimeType == other.runtimeType &&
          letter == other.letter;

  @override
  int get hashCode => letter.hashCode;
}
