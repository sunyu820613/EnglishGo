# COMPONENT_SYSTEM — 组件系统

版本：1.0 ｜ 上游：[DESIGN.md](DESIGN.md)（Token）· [THEME_SYSTEM.md](THEME_SYSTEM.md)
实现位置：`lib/core/widgets/`，全部组件只消费 Token，不出现字面量样式值。

## 核心组件清单

| 组件 | 规格要点 |
|---|---|
| `KidButton` | Soft-Clay 按钮。尺寸档：primary(≥88dp)/kid(≥64dp)/icon(≥48dp)。按下 scale 0.96 + `shadow.pressed`，120ms。必填 `semanticsLabel`。变体：primary/secondary/ghost |
| `SoundButton` | 发音按钮（喇叭图标）。播放中出现波纹动画状态；重复点击重播不叠加（经 AudioService）。默认 primary 尺寸 |
| `WordCard` | 单词插画卡：1:1 插画 + Teaching 字体单词 + `frameDecoration` 边饰。点击 → 发音 + 微动画（插画弹跳 `motion.micro`） |
| `LetterHero` | 课程页大字母（`type.letterHero`，Teaching 字体 + Display 字体双形态切换：教学形态用 Andika 字形） |
| `StarMeter` | 三星显示。获星动画 `motion.celebrate`；空星为描边星（不是灰色实心，避免“失败感”） |
| `LessonProgressDots` | 顶部步骤点，当前点放大 1.3x，无百分比、无倒计时 |
| `QuizOptionCard` | 练习选项卡。正确：success 描边 + 弹跳；提示态：轻微摇头 6°×2 次 + 缩回，无红色 |
| `MascotStage` | 角色舞台（层级 3）。待机呼吸 `motion.idle`；点击触发动作；`ReducedMotion` 时静止 |
| `ThemeCard` | 主题选择卡：场景缩略 + 角色 + 选中态 focus 环 + 语音播报主题名 |
| `MapNode` | 字母地图节点 ≥64dp：字母 + 星数；无锁图标 |
| `RewardChestPanel` | 结算面板：星星入槽 → 贴纸飞入收藏册动画 |
| `ParentGate` | 家长门：长按 3s 进度环 或 算术三选一；失败 3 次冷却 30s |
| `TracingCanvas` | 描线画布：笔顺起点圆点 + 方向箭头 + 24dp 容差走廊；CustomPainter 实现 |
| `AppTopBar` | 儿童页顶栏：左返回（48dp，轻确认）＋右侧可选功能位。透明底，不用 Material AppBar 默认样式 |
| `BgmToggle` | 背景音乐开关小图标（首页），状态图标区分 + Semantics |

## 通用规则

1. 所有交互组件：按下反馈 ≤100ms；`Semantics` label 必填；禁用态透明度 0.4 且不可点。
2. 所有组件必须在六主题下通过 Widget Test（构建无溢出）与 Golden Test（A/B/C 样板页）。
3. 组件不得直接读 `MediaQuery` 做主题判断；断点逻辑集中在 `lib/core/widgets/responsive.dart`。
4. 音频触发一律走 `AudioService`，组件内禁止直接实例化播放器。
5. 彩蛋交互挂在 `MascotStage` 与场景装饰层，不得占用 content 层（见 [EASTER_EGGS](EASTER_EGGS.md)）。
