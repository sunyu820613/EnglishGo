# Task 04 — A/B/C 可运行原型页面接线

状态：草稿（等待 Task 03 基础设施验收后定稿派发，勿提前执行）

## 背景
Task 03 完成后将提供：AlphabetRepository、ProgressRepository、AudioService、ReducedMotionPolicy、核心组件库（KidButton/SoundButton/WordCard/LetterHero/StarMeter/LessonProgressDots/QuizOptionCard/AppTopBar）。本任务在此之上接出可运行的页面流程，覆盖 A/B/C 三个字母的完整课程体验。

## 目标（按 USER_FLOW.md 路由表）
1. `lib/app/router.dart`：go_router 配置，路由表见 USER_FLOW.md §1
2. `features/onboarding`：主题选择页（六张 ThemeCard 横滑，选中即写入 ThemeController 并进首页）
3. `features/home`：主题场景背景 + 主角色（占位资产，可先用纯色/占位图形，等待正式美术）+ 进入地图主按钮 + 收藏册/主题切换/家长门次级入口
4. `features/alphabet`（地图）：A–Z 节点列表（本任务只需 A/B/C 可进入课程，D–Z 节点显示但点击后可先显示"敬请期待"占位或直接置灰不可点——由你决定并在报告中说明，不影响 P0 验收）
5. `features/lesson`：LEARNING_MODEL.md §2 的 10 步流程状态机（PageView 或自定义 controller），完整实现 A/B/C 三课：
   - 步骤 1–6：角色登场→字母名→拼读音→单词1→点击发音→单词2
   - 步骤 7：听音选图（3 选 1，含温和纠错：第1次错重播提示，第2次错减少选项）
   - 步骤 8：字母匹配（3 选 1，同纠错规则）
   - 步骤 9：描线——**本任务可跳过实际实现**，用一个"Coming soon, tap to skip"占位 + 明显跳过按钮（TracingCanvas 留给后续任务）
   - 步骤 10：奖励结算（StarMeter 动画 + 温和收尾语音）
6. `features/rewards`：收藏册基础页（显示已获贴纸/星星总数，占位布局即可，不要求主题化收藏册视觉）
7. `features/parent_area`：家长门（长按 3 秒或算术三选一，失败 3 次冷却 30 秒，冷却状态持久化）+ 家长区域基础页（已学字母列表、reset progress 按钮、bgm 开关）
8. `lib/main.dart`：接入 ProviderScope、路由、启动时 `loadTheme()` + `validateThemeAssets()`（debug 日志）+ 全局 `ErrorWidget.builder`（儿童友好占位，非默认红屏）+ `PlatformDispatcher.instance.onError` 捕获不崩溃

## 允许修改范围
- `lib/app/**`、`lib/features/**`、`lib/main.dart`
- `test/features/**`、`test/app/**`
- `integration_test/**`（新建，课程全流程集成测试）

## 禁止修改范围
- docs/**、lib/core/theme/**、lib/core/audio/**、lib/core/accessibility/**、lib/core/widgets/**（Task 03 产出，如发现缺口在报告中说明，不擅自扩展其接口）、lib/data/**、assets/data/alphabet.json

## 输入文件
CLAUDE.md、AGENTS.md、docs/USER_FLOW.md、docs/LEARNING_MODEL.md、docs/COMPONENT_SYSTEM.md、docs/REWARD_SYSTEM.md、docs/DESIGN.md、Task 03 产出的 lib/data、lib/core/audio、lib/core/accessibility、lib/core/widgets

## 输出文件
上述 lib/test/integration_test 文件 + docs/AGENT_HANDOFF.md 追加

## 验收条件
- `flutter analyze` 零错误零警告；`dart format .` 无变更；`flutter test` 全过
- 至少一个 integration_test 跑通 A 字母完整课程流（进入→10步→奖励→退出，进度落盘）
- 触控尺寸/Semantics 达标（复用 Task 03 组件即自动满足，新增交互元素需自查）
- 无红叉/失败音效/倒计时（LEARNING_MODEL §1 红线）

## 必须执行的测试
`flutter analyze` → `dart format .` → `flutter test` → `flutter test integration_test/`

## 风险
- 正式美术资产未就位，页面将大量使用占位（纯色块/占位图标），Phase 3 视觉审查前需替换关键位置
- 家长门算术题需要动态生成，注意题目难度适合成人快速验证但避免高风险计算逻辑 bug

## 回滚方法
`git checkout -- lib/app lib/features lib/main.dart test integration_test`
