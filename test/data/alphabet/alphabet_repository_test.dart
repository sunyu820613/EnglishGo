import 'package:english_go/data/alphabet/alphabet_repository.dart';
import 'package:english_go/data/alphabet/models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AlphabetRepository', () {
    late AlphabetRepository repository;

    setUp(() {
      repository = const AlphabetRepository();
    });

    test(
      'loadAlphabet loads the bundled asset: 26 letters, 2 words each',
      () async {
        final List<LetterEntry> letters = await repository.loadAlphabet();
        expect(letters, hasLength(26));
        expect(
          letters.map((l) => l.letter),
          containsAll(<String>['A', 'B', 'C', 'X', 'Y', 'Z']),
        );
        for (final LetterEntry entry in letters) {
          expect(
            entry.words,
            hasLength(2),
            reason: 'Letter "${entry.letter}" must have exactly 2 words',
          );
        }
      },
    );

    test('loadAlphabet surfaces the X letter phonics note', () async {
      final List<LetterEntry> letters = await repository.loadAlphabet();
      final LetterEntry x = letters.firstWhere((l) => l.letter == 'X');
      expect(x.phonicsNote, isNotNull);
      expect(
        x.words.map((w) => w.id),
        containsAll(<String>['xylophone', 'x_ray']),
      );
    });

    group('validateAssetPaths', () {
      test('returns empty list when all paths are present', () async {
        final List<LetterEntry> letters = <LetterEntry>[
          const LetterEntry(
            letter: 'A',
            letterAudio: 'audio/letters/a_name.m4a',
            phonicsAudio: 'audio/letters/a_phonics.m4a',
            phonicsIpa: 'æ',
            words: <WordEntry>[
              WordEntry(
                id: 'apple',
                text: 'Apple',
                audio: 'audio/words/apple.m4a',
                image: 'images/words/apple.webp',
                phrase: 'audio/phrases/a_is_for_apple.m4a',
              ),
              WordEntry(
                id: 'ant',
                text: 'Ant',
                audio: 'audio/words/ant.m4a',
                image: 'images/words/ant.webp',
                phrase: 'audio/phrases/a_is_for_ant.m4a',
              ),
            ],
          ),
        ];

        final Set<String> manifest = <String>{
          'audio/letters/a_name.m4a',
          'audio/letters/a_phonics.m4a',
          'audio/words/apple.m4a',
          'images/words/apple.webp',
          'audio/phrases/a_is_for_apple.m4a',
          'audio/words/ant.m4a',
          'images/words/ant.webp',
          'audio/phrases/a_is_for_ant.m4a',
        };

        final List<String> missing = await repository.validateAssetPaths(
          letters,
          manifest,
        );
        expect(missing, isEmpty);
      });

      test('returns missing paths when manifest is incomplete', () async {
        final List<LetterEntry> letters = <LetterEntry>[
          const LetterEntry(
            letter: 'A',
            letterAudio: 'audio/letters/a_name.m4a',
            phonicsAudio: 'audio/letters/a_phonics.m4a',
            phonicsIpa: 'æ',
            words: <WordEntry>[
              WordEntry(
                id: 'apple',
                text: 'Apple',
                audio: 'audio/words/apple.m4a',
                image: 'images/words/apple.webp',
                phrase: 'audio/phrases/a_is_for_apple.m4a',
              ),
            ],
          ),
        ];

        final List<String> missing = await repository.validateAssetPaths(
          letters,
          <String>{'audio/letters/a_name.m4a'},
        );
        expect(missing, hasLength(4));
        expect(missing, contains('audio/letters/a_phonics.m4a'));
        expect(missing, contains('audio/words/apple.m4a'));
      });
    });
  });
}
