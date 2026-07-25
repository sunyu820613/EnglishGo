# CONTENT_GUIDE — 内容规范

版本：1.0 ｜ 关联：[LEARNING_MODEL](LEARNING_MODEL.md) · [ASSET_MANIFEST](ASSET_MANIFEST.md)

## 1. 固定单词表（A–Z，每字母恰好 2 词，不可改动）

A: Apple, Ant ｜ B: Ball, Bear ｜ C: Cat, Car ｜ D: Dog, Duck ｜ E: Egg, Elephant ｜ F: Fish, Frog ｜ G: Goat, Grapes ｜ H: Hat, Horse ｜ I: Ice cream, Iguana ｜ J: Juice, Jellyfish ｜ K: Kite, Koala ｜ L: Lion, Leaf ｜ M: Moon, Monkey ｜ N: Nest, Nose ｜ O: Orange, Owl ｜ P: Panda, Pig ｜ Q: Queen, Quail ｜ R: Rabbit, Robot ｜ S: Sun, Star ｜ T: Tiger, Train ｜ U: Umbrella, Unicorn ｜ V: Van, Violin ｜ W: Whale, Watch ｜ X: Xylophone, X-ray ｜ Y: Yak, Yo-yo ｜ Z: Zebra, Zoo

## 2. 发音规范（美式英语 en-US）

每个字母提供：
- **字母名**（letter name）：如 A = /eɪ/
- **主要自然拼读音**（primary phonics sound）：短元音优先（A=/æ/, E=/ɛ/, I=/ɪ/, O=/ɑ/, U=/ʌ/）；辅音取最常见音（C=/k/, G=/g/, Q 教学句式 “Q says /kw/ (with u)”）
- 教学句式：`"A says /æ/. /æ/ /æ/ Apple!"`

特例（不得说成相同拼读音）：
- **X**：温和展示两种读法 —— “X can sound like /z/, like in Xylophone. At the end of words it sounds like /ks/, like in fox and X-ray!” X-ray 的 X 读字母名 /eks/。
- **I 组**：Ice cream 为长音 /aɪ/，Iguana 为短音 /ɪ/；语音脚本用 “I says /ɪ/, and sometimes says its name /aɪ/, like Ice cream!” 呈现，不混淆。
- **U 组**：Umbrella 短音 /ʌ/；Unicorn 为 /ju/（字母名音），同 I 的处理方式。
- **O 组**：Orange /ɔr/、Owl /aʊ/，教学以 O 短音 /ɑ/（octopus 类）为主音，单词发音按真实读音，不强行统一。
- **G**：Goat/Grapes 均为硬音 /g/，正确。
- **C**：Cat/Car 均为 /k/，正确。

## 3. 内容五检（每条内容必须通过）

1. 拼写检查（en-US 拼写，Ice cream 两词、X-ray 连字符、Yo-yo 连字符）
2. 发音检查（音标与音频一致，X/I/U/O 特例正确）
3. 儿童适龄检查（无恐怖、暴力、成人暗示；动物形象友好圆润）
4. 插画-语义一致性（Bat 不可画成球棒类混淆项；Watch 画手表不画“看”）
5. 母语表达检查（教学句式为地道美式英语，由母语审校/权威语料复核）

## 4. 音频资产规范

- 采样率 44.1kHz，单声道，AAC(m4a) 或 OGG（实施期定），响度归一 -16 LUFS
- 语速：单词约 0.8× 常速，词前后各留 200ms 静音
- 命名：`audio/letters/a_name.m4a`、`a_phonics.m4a`；`audio/words/apple.m4a`；`audio/phrases/a_is_for_apple.m4a`
- 开发期占位：flutter_tts 系统 TTS，代码处标记 `// TODO(audio): replace with licensed native recording`，并在 manifest 中 `"placeholder": true`
- 正式版：授权美式母语者录音（儿童友好音色），许可证记录于 manifest

## 5. 插画规范（52 张核心单词图 + 主题资产）

- 画幅 1:1，导出 WebP（无损→有损 q90 择优），基准 1024×1024，同时出 512 缩略
- 风格：手绘绘本质感 + 柔和体积光影（与 Soft-Clay 呼应）；统一左上 45° 暖光；微俯视 10°；主体占比 ~70%；描边 3–4dp 主题 outline 色系
- 背景：单色柔和底 + 轻纹理，不与六主题任何一个绑定（贴纸/插画全主题通用）
- 禁止：AI 结构错误（手指/眼睛畸形）、水印、版权角色相似形象、风格混搭
- 流程：先 A/B/C 六张样板 → 视觉审查通过 → 锁定风格提示词/画师规范 → 批量
- 每张插画入 `assets/manifest.json` 并标记 `humanReviewed: true` 后方可用于正式版

## 6. 课程数据 JSON Schema（assets/data/alphabet.json）

```json
{
  "schemaVersion": 1,
  "letters": [
    {
      "letter": "A",
      "letterAudio": "audio/letters/a_name.m4a",
      "phonicsAudio": "audio/letters/a_phonics.m4a",
      "phonicsIpa": "æ",
      "phonicsNote": null,
      "words": [
        { "id": "apple", "text": "Apple", "audio": "audio/words/apple.m4a", "image": "images/words/apple.webp", "phrase": "audio/phrases/a_is_for_apple.m4a" }
      ]
    }
  ]
}
```
X 的 `phonicsNote` 填双读法教学脚本 id。加载时校验：26 字母 × 恰好 2 词、资源文件存在（启动自检 + 单元测试）。
