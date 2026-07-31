import 'package:english_go/core/content/letter_name_ipa.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('every A-Z letter has a non-empty IPA transcription', () {
    for (int code = 'A'.codeUnitAt(0); code <= 'Z'.codeUnitAt(0); code++) {
      final String letter = String.fromCharCode(code);
      expect(
        letterNameIpa[letter],
        isNotNull,
        reason: '$letter is missing a letter-name IPA entry',
      );
      expect(letterNameIpa[letter], isNotEmpty);
    }
  });
}
