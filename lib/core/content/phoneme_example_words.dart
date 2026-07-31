/// One example word for a phoneme, with the substring that spells the
/// sound (so the UI can highlight it) and its own recorded pronunciation.
class WordExample {
  const WordExample(this.word, this.highlightStart, this.highlightLength);

  final String word;
  final int highlightStart;
  final int highlightLength;

  /// Filename slug for assets/audio/example_words/{slug}.m4a.
  String get audioSlug => word.replaceAll('-', '_');
}

/// Three example words per recorded IPA symbol, shown alongside the
/// phoneme tiles on PhoneticsChartPage. Each word's highlighted range is
/// the specific letter(s) that spell that phoneme in that word.
const Map<String, List<WordExample>> phonemeExampleWords =
    <String, List<WordExample>>{
      // Vowels
      'iː': <WordExample>[
        WordExample('see', 1, 2),
        WordExample('tree', 2, 2),
        WordExample('key', 1, 2),
      ],
      'ɪ': <WordExample>[
        WordExample('sit', 1, 1),
        WordExample('fish', 1, 1),
        WordExample('big', 1, 1),
      ],
      'ɛ': <WordExample>[
        WordExample('bed', 1, 1),
        WordExample('red', 1, 1),
        WordExample('ten', 1, 1),
      ],
      'æ': <WordExample>[
        WordExample('cat', 1, 1),
        WordExample('hat', 1, 1),
        WordExample('apple', 0, 1),
      ],
      'ɑ': <WordExample>[
        WordExample('hot', 1, 1),
        WordExample('sock', 1, 1),
        WordExample('top', 1, 1),
      ],
      'ɔː': <WordExample>[
        WordExample('ball', 1, 1),
        WordExample('saw', 1, 2),
        WordExample('tall', 1, 1),
      ],
      'ʊ': <WordExample>[
        WordExample('book', 1, 2),
        WordExample('foot', 1, 2),
        WordExample('put', 1, 1),
      ],
      'uː': <WordExample>[
        WordExample('blue', 2, 2),
        WordExample('moon', 1, 2),
        WordExample('food', 1, 2),
      ],
      'ʌ': <WordExample>[
        WordExample('cup', 1, 1),
        WordExample('sun', 1, 1),
        WordExample('run', 1, 1),
      ],
      'ə': <WordExample>[
        WordExample('about', 0, 1),
        WordExample('sofa', 3, 1),
        WordExample('banana', 1, 1),
      ],

      // Diphthongs
      'eɪ': <WordExample>[
        WordExample('day', 1, 2),
        WordExample('rain', 1, 2),
        WordExample('eight', 0, 4),
      ],
      'aɪ': <WordExample>[
        WordExample('eye', 0, 3),
        WordExample('pie', 1, 2),
        WordExample('fly', 2, 1),
      ],
      'aʊ': <WordExample>[
        WordExample('house', 1, 2),
        WordExample('cow', 1, 2),
        WordExample('mouth', 1, 2),
      ],
      'ɔɪ': <WordExample>[
        WordExample('boy', 1, 2),
        WordExample('toy', 1, 2),
        WordExample('coin', 1, 2),
      ],
      'oʊ': <WordExample>[
        WordExample('go', 1, 1),
        WordExample('boat', 1, 2),
        WordExample('snow', 2, 2),
      ],

      // R-colored vowels
      'ɝ': <WordExample>[
        WordExample('bird', 1, 2),
        WordExample('girl', 1, 2),
        WordExample('first', 1, 2),
      ],
      'ɚ': <WordExample>[
        WordExample('mother', 4, 2),
        WordExample('teacher', 5, 2),
        WordExample('dinner', 4, 2),
      ],
      'ɑr': <WordExample>[
        WordExample('car', 1, 2),
        WordExample('star', 2, 2),
        WordExample('far', 1, 2),
      ],
      'ɛr': <WordExample>[
        WordExample('hair', 1, 3),
        WordExample('bear', 1, 3),
        WordExample('chair', 2, 3),
      ],
      'ɪr': <WordExample>[
        WordExample('ear', 0, 3),
        WordExample('deer', 1, 3),
        WordExample('here', 1, 3),
      ],
      'ɔr': <WordExample>[
        WordExample('door', 1, 3),
        WordExample('four', 1, 3),
        WordExample('corn', 1, 2),
      ],

      // Voiceless consonants
      'p': <WordExample>[
        WordExample('pen', 0, 1),
        WordExample('cup', 2, 1),
        WordExample('apple', 1, 2),
      ],
      't': <WordExample>[
        WordExample('top', 0, 1),
        WordExample('cat', 2, 1),
        WordExample('stop', 1, 1),
      ],
      'k': <WordExample>[
        WordExample('cat', 0, 1),
        WordExample('key', 0, 1),
        WordExample('book', 3, 1),
      ],
      'tʃ': <WordExample>[
        WordExample('chair', 0, 2),
        WordExample('cheese', 0, 2),
        WordExample('watch', 2, 3),
      ],
      'f': <WordExample>[
        WordExample('fish', 0, 1),
        WordExample('leaf', 3, 1),
        WordExample('coffee', 2, 2),
      ],
      'θ': <WordExample>[
        WordExample('think', 0, 2),
        WordExample('teeth', 3, 2),
        WordExample('bath', 2, 2),
      ],
      's': <WordExample>[
        WordExample('sun', 0, 1),
        WordExample('bus', 2, 1),
        WordExample('snake', 0, 1),
      ],
      'ʃ': <WordExample>[
        WordExample('shoe', 0, 2),
        WordExample('fish', 2, 2),
        WordExample('wash', 2, 2),
      ],

      // Voiced consonants
      'b': <WordExample>[
        WordExample('ball', 0, 1),
        WordExample('baby', 0, 1),
        WordExample('tub', 2, 1),
      ],
      'd': <WordExample>[
        WordExample('dog', 0, 1),
        WordExample('red', 2, 1),
        WordExample('bed', 2, 1),
      ],
      'g': <WordExample>[
        WordExample('go', 0, 1),
        WordExample('dog', 2, 1),
        WordExample('egg', 1, 2),
      ],
      'dʒ': <WordExample>[
        WordExample('jump', 0, 1),
        WordExample('juice', 0, 1),
        WordExample('orange', 4, 1),
      ],
      'v': <WordExample>[
        WordExample('van', 0, 1),
        WordExample('love', 2, 1),
        WordExample('seven', 2, 1),
      ],
      'ð': <WordExample>[
        WordExample('this', 0, 2),
        WordExample('mother', 2, 2),
        WordExample('bathe', 2, 2),
      ],
      'z': <WordExample>[
        WordExample('zoo', 0, 1),
        WordExample('lazy', 2, 1),
        WordExample('nose', 2, 1),
      ],
      'ʒ': <WordExample>[
        WordExample('vision', 2, 2),
        WordExample('treasure', 4, 1),
        WordExample('measure', 3, 1),
      ],

      // Other consonants
      'm': <WordExample>[
        WordExample('moon', 0, 1),
        WordExample('mom', 0, 1),
        WordExample('swim', 3, 1),
      ],
      'n': <WordExample>[
        WordExample('nose', 0, 1),
        WordExample('sun', 2, 1),
        WordExample('banana', 2, 1),
      ],
      'ŋ': <WordExample>[
        WordExample('sing', 2, 2),
        WordExample('ring', 2, 2),
        WordExample('king', 2, 2),
      ],
      'l': <WordExample>[
        WordExample('lion', 0, 1),
        WordExample('ball', 2, 2),
        WordExample('apple', 3, 1),
      ],
      'w': <WordExample>[
        WordExample('water', 0, 1),
        WordExample('wet', 0, 1),
        WordExample('away', 1, 1),
      ],
      'j': <WordExample>[
        WordExample('yes', 0, 1),
        WordExample('yellow', 0, 1),
        WordExample('yard', 0, 1),
      ],
      'h': <WordExample>[
        WordExample('hat', 0, 1),
        WordExample('house', 0, 1),
        WordExample('hello', 0, 1),
      ],
      'r': <WordExample>[
        WordExample('run', 0, 1),
        WordExample('zero', 2, 1),
        WordExample('rabbit', 0, 1),
      ],
      'ʔ': <WordExample>[
        WordExample('uh-oh', 2, 1),
        WordExample('button', 2, 2),
        WordExample('kitten', 2, 2),
      ],
      'ɾ': <WordExample>[
        WordExample('butter', 2, 2),
        WordExample('water', 2, 1),
        WordExample('ladder', 2, 2),
      ],
    };
