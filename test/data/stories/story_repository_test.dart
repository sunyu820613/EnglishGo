import 'package:english_go/data/stories/story_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('loads stories.json and parses the ABC story', () async {
    final List<MiniStory> stories = await const StoryRepository().loadStories();

    expect(stories, isNotEmpty);
    final MiniStory abc = stories.firstWhere((s) => s.id == 'story_abc');
    expect(abc.requiredLetters, <String>['A', 'B', 'C']);
    expect(abc.pages, isNotEmpty);
    for (final StoryPage page in abc.pages) {
      expect(page.text, isNotEmpty);
      expect(page.image, startsWith('images/stories/'));
    }
  });

  test('isUnlockedBy requires 3 stars on every required letter', () {
    const MiniStory story = MiniStory(
      id: 'x',
      title: 'x',
      requiredLetters: <String>['A', 'B', 'C'],
      pages: <StoryPage>[StoryPage(text: 't', image: 'i')],
    );

    expect(story.isUnlockedBy(<String, int>{'A': 3, 'B': 3, 'C': 3}), isTrue);
    expect(story.isUnlockedBy(<String, int>{'A': 3, 'B': 3, 'C': 2}), isFalse);
    expect(story.isUnlockedBy(<String, int>{}), isFalse);
  });
}
