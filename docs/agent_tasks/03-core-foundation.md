# Task 03 — 核心基础设施（组件库 / AudioService / 数据仓库）

## 背景
六主题 Token 系统（Task 02）已完成并验收通过（`flutter analyze` 0 issues，`flutter test` 65/65，六主题对比度全部达标）。现在需要在此之上搭建 Phase 2c（A/B/C 可运行原型）所需的基础设施层，供后续页面接线任务（Task 04）使用。

## 目标

### 1. 数据层
- `lib/data/alphabet/alphabet_repository.dart`：加载解析 `assets/data/alphabet.json`（含 `assets/manifests/manifest.json` 交叉校验，资源路径必须存在于 manifest）。模型类 `LetterEntry` / `WordEntry`（immutable，`fromJson`）。加载失败（schema 不符/字母数≠26/某字母词数≠2）抛出明确异常，便于单元测试捕获
- `lib/data/progress/progress_repository.dart`：LEARNING_MODEL.md §6 的 progress JSON 模型（`LetterProgress` 含 stars/wordsHeard/quizDone/matchDone/traceDone/listenRepeats/quizRetries），基于 shared_preferences 持久化。**必须实现双写容错**（Task 01 R1）：写入前完整序列化到字符串，写入后立即回读校验；若回读失败保留内存态不落盘并抛出可捕获异常，不得让调用方崩溃。提供 `addStar(letter, starIndex)`（幂等，不重复计已获得的星）、`markWordHeard`、`markQuizDone`、`markMatchDone`、`markTraceDone`
- `lib/data/progress/progress_repository.dart` 同时管理 settings（`themeId` 已由 Task 02 的 ThemeController 管理，此处新增 `bgmOn`、`reducedMotion`、`accent`）

### 2. AudioService（core/audio）
- `lib/core/audio/audio_service.dart`：基于 just_audio + audio_session 封装。Riverpod Notifier 或普通 service class 均可（建议 Notifier 便于测试注入 mock player）
- 行为要求（USER_FLOW.md §4，AGENTS.md 红线）：
  - 同一时刻仅一条语音；播放新语音前停止当前语音（不叠加）
  - 提供 `playVoice(String assetPath)`、`playSfx(String assetPath)`、`stopVoice()`、`setBgm(String? assetPath)`（null 表示停止）、`setBgmEnabled(bool)`
  - 语音播放时 BGM ducking 至 20% 音量，语音结束恢复
  - 音频文件缺失/损坏：捕获异常，静默降级（不崩溃），debug 模式打印警告
  - iOS 使用 `audio_session` 配置为 `.playback` category；来电/系统打断时暂停 BGM
- 单元测试：mock `AudioPlayer`（用接口抽象或依赖注入，禁止直接测试真实文件 I/O），验证互斥播放、ducking 状态转换、异常降级不抛出

### 3. 可访问性
- `lib/core/accessibility/reduced_motion_policy.dart`：读取 `MediaQuery.disableAnimations` 与 progress settings 的 `reducedMotion`，取更保守值（任一为 true 则 reduced）。提供 Riverpod provider `reducedMotionProvider(BuildContext)` 或等价 hook 供 widget 消费

### 4. 核心组件库（lib/core/widgets/，消费 Task 02 的 Token，禁止硬编码样式值）
按 COMPONENT_SYSTEM.md 实现：
- `KidButton`（primary/secondary/ghost 三变体，尺寸档 primary/kid/icon，按下 scale 0.96 + shadow.pressed，120ms，Semantics 必填）
- `SoundButton`（继承/组合 KidButton，播放中显示波纹态，点击调用 AudioService.playVoice，防重复叠加）
- `WordCard`（1:1 插画占位 Image.asset + 单词文本 Teaching 字体，点击触发发音+微动画 scale 弹跳）
- `LetterHero`（大字母展示，Teaching 字体，type.letterHero）
- `StarMeter`（三星，空星描边非灰色实心，获星 celebrate 动画）
- `LessonProgressDots`（步骤点，当前点放大 1.3x）
- `QuizOptionCard`（正确 success 描边+弹跳；提示态摇头 6°×2 次，无红色）
- `AppTopBar`（左返回 48dp 轻确认回调，透明底，非 Material AppBar 默认样式）
- 每个组件至少一个 Widget Test：六主题下可构建无溢出、触控尺寸达标（`meetsGuideline`）、Semantics label 存在

## 允许修改范围
- `lib/data/**`、`lib/core/audio/**`、`lib/core/accessibility/**`、`lib/core/widgets/**`
- `test/data/**`、`test/core/audio/**`、`test/core/accessibility/**`、`test/core/widgets/**`
- `pubspec.yaml`（仅 assets 段，如需新增测试专用资源目录）

## 禁止修改范围
- docs/**、lib/core/theme/**（Task 02 已验收，不得改动）、lib/features/**、lib/main.dart、assets/data/alphabet.json、assets/manifests/manifest.json

## 输入文件
CLAUDE.md、AGENTS.md、docs/LEARNING_MODEL.md §6、docs/COMPONENT_SYSTEM.md、docs/USER_FLOW.md §4、docs/DESIGN.md、docs/ACCESSIBILITY.md、docs/agent_reports/01-tech-review-report.md（R1/R2 风险)、assets/data/alphabet.json、assets/manifests/manifest.json

## 输出文件
上述 lib/test 文件 + docs/AGENT_HANDOFF.md 追加条目

## 验收条件
- `flutter analyze` 零错误零警告
- `dart format .` 无变更
- `flutter test` 全部通过，覆盖：
  - alphabet_repository：正常加载、schema 校验失败场景（26 字母/2 词约束）
  - progress_repository：正常读写、写入中断模拟（Task 01 R1）、addStar 幂等
  - AudioService：互斥播放、ducking、异常降级
  - 全部核心组件的六主题构建 + a11y guideline 测试

## 必须执行的测试
`flutter analyze` → `dart format .` → `flutter test`

## 风险
- just_audio 在测试环境可能需要平台 mock；若无法在纯 Dart test 环境测试真实播放，允许通过抽象接口 + fake 实现测试逻辑分支，并在报告中说明
- 若发现 alphabet.json 或 manifest.json 实际结构与预期 schema 有出入，不得自行修改这两个数据文件，在报告中说明差异

## 回滚方法
`git checkout -- lib/data lib/core/audio lib/core/accessibility lib/core/widgets test pubspec.yaml`
