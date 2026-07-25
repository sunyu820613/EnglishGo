 # 技术审查报告 — 01
 
 **审查对象**：EnglishGo v1 技术方案（代码尚未创建阶段）
 **审查类型**：独立技术审查（Tech Stack / Dependencies / Structure）
 **审查日期**：2026-07-25
 **审查人**：Codex
 **总体结论**：**可行，但有 6 项中高风险需在实施前确认或调整**
 
 技术方案整体是合理且成熟的。技术栈选型符合 Offline First + 儿童 App 的约束，架构层次清晰，主题系统有良好设计纪律。以下分项给出具体意见。
 
 ---
 
 ## 1. 技术栈选择
 
 **状态管理：Riverpod（含 code generation）**
 状态：**同意**
 理由：编译期安全、provider 树可测试、社区活跃度高。Riverpod 2.6+ 的 `Notifier` 和 `AsyncNotifier` 适合管理进度、音频状态这类全局资源。
 风险：
 - `build_runner` + `riverpod_generator` 增加了构建步骤和调试复杂度。团队需要花时间熟悉 code generation 工作流。
 - 对于 v1 这样规模不大的 App，Riverpod 的全套 codegen 管线可能偏重。可以考虑降级使用手动 provider（不用 `@riverpod` 注解），减少工具链依赖。
 建议：实施初期采用手动 provider，在 provider 数量超过 15～20 个时再引入 codegen。
 
 **路由：go_router**
 状态：**同意**
 理由：声明式路由，官方维护，深链支持预留。EnglishGo 的导航结构扁平（首页 → 课程 → 练习 → 奖励），go_router 能干净表达。
 建议：使用 `StatefulShellRoute` 时需要确保 key 正确设置，避免主题切换重建导航状态。
 
 **进度存储：shared_preferences**
 状态：**有条件同意**
 风险：shared_preferences 的写入不是原子操作。儿童可能在进度保存中途强制退出（锁屏、摔手机、断电），导致 JSON 截断损坏。v1 数据量小（<10KB），但损坏后无法自动修复，用户将丢失进度。
 替代建议：
   - （推荐）在 `shared_preferences` 基础上实现双重写入模式：写临时 key → 校验 → 原子重命名。或者写入前序列化校验，读取时 try-catch，发现损坏回退到最后有效快照。
   - （备选）如果进度数据结构在后续版本会增长，可考虑 `sqflite` 或 `drift`，但 v1 当前规模没有必要引入 SQLite。
 
 **课程内容：本地 JSON（assets/data/alphabet.json）**
 状态：**同意**
 理由：只读数据，52 词 × 2，加载到内存后常驻。JSON 直接打包进 assets，无需网络、无需解析运行时外部输入，零风险。
 
 **音频：audioplayers vs just_audio（实施期定）**
 状态：**倾向于 just_audio，有依据**
 理由：
 - just_audio 支持 gapless 循环（BGM 需要）、音频焦点管理（来电 ducking）、Android ExoPlayer 引擎（稳定性和格式支持更好）。
 - audioplayers 更轻，但在多实例管理、音频焦点、Background lifecycle 方面已知问题较多（Issue #1429、#1538 等）。
 - EnglishGo 需要「语音不叠加、BGM 可关、切页停止、来电 ducking」这四类行为，just_audio 的 `AudioPlayer` + `ConcatenatingAudioSource` + `loopMode` 能直接满足。
 - 代价：just_audio 的 Android 端依赖 ExoPlayer（约 4～6MB APK 增量），会对 35MB 包体积目标产生压力。
 建议：选定 `just_audio ^0.9.40+`，实施后密切监控 APK 增量。如果包体积超标，回退到 `audioplayers` 并增加 `AudioService` 层的并发保护。
 
 **开发期 TTS 占位：flutter_tts**
 状态：**有条件同意**
 风险：
 - flutter_tts 维护活跃度下降，最近一次大版本更新距今较长。在 Flutter 3.41 / Dart 3.11 上的兼容性需验证。
 - TTS 语音质量距离「精品绘本」标准很远，仅适合开发期循环验证 UI 流程。
 - flutter_tts 不支持音频焦点管理，开发期 BGM 测试时会与 TTS 冲突。
 建议：
   - 约束 `flutter_tts` 为 dev 依赖（`dev_dependencies`），防止发布版打包。
   - 尽早（Phase 2 末）制作 3～5 个字母的样片录制音频，验证管线。
 
 ---
 
 ## 2. 目录结构
 
 **意见：同意，结构合理**
 
 理由：
 - `core/` 抽取了可复用基础设施（主题、音频、可访问性、通用组件）。
 - `features/` 按功能垂直拆分，每 feature 内可持有自己的 provider、页面和子组件，符合常见的 Flutter feature-first 架构模式。
 - `data/` 统一管理数据源（静态内容 + 持久化），`progress/` 和 `alphabet/` 分开合理。
 
 风险：
 - 10 个 feature 目录在代码量尚小时合理，但如果团队经验不足，容易产生 feature 间直接引用的跨层耦合。建议配置 `custom_lint` 或 `dart_code_metrics` 依赖规则（如 `feature/lesson` 不可直接引用 `feature/rewards` 的内部类）。
 - 缺少明确的 `router.dart` 位置。建议在 `lib/app/` 下放 `router.dart` 统一管理路由定义，所有 feature 向 `app/` 注册路由而非自行导出。
 - `lib/core/theme/` 如果包含六主题的全部 Token 实例文件（6 个主题 × 14 色 + 资产引用），预计 800+ 行。建议将每个主题独立文件（`starlight_theme.dart` 等），并考虑用 YAML/JSON 源生成 Dart，减少手写错误。
 
 ---
 
 ## 3. 六主题 ThemeExtension 方案的可维护性
 
 **意见：同意方案方向，但指出具体风险**
 
 **好的设计决策：**
 - 使用 `ThemeExtension` 是 Flutter 原生方案，无需第三方库。
 - 主题差异仅限 Token 和资产引用，布局不变，符合 `DESIGN.md` 一致性要求。
 - 14 个颜色角色 × 6 主题的设计边界清晰。
 
 **可维护性风险：**
 1. `KidThemeExtension` 承载了颜色和非颜色混合字段。主题需要引用资产路径（`backgroundScene`、`mascot`、`celebration` 等），这些是字符串类型，编译器无法检查资源是否存在。新增主题时如果忘记提供某个资产字段，运行时才知道。
 2. 切换动画实现复杂。`ThemeExtension` 在 `ThemeData` 切换时不会自动动画插值（因为不是基础类型）。320ms 渐变动画需要自定义 `InheritedWidget` 或采用 `AnimatedWidget` 监听主题变化。
 3. 6 个主题 × 14 色 = 84 个颜色值的对比度维护。每次调整任何颜色都必须重新验证 84 个对比度条件，手动检查成本高。
 
 **建议：**
 - 资产引用使用枚举或常量而非裸字符串，并添加 `validateThemeAssets()` 启动自检函数，检查 6 个主题引用的所有资产文件是否存在。
 - 为 `KidThemeExtension` 实现 `lerp()` 方法支持动画插值。参考 Flutter 官方 `ThemeExtension.lerp()` 实现。
 - 用参数化测试（`group` + 循环）覆盖全部 14 角色 × 6 主题的对比度断言。
 
 ---
 
 ## 4. 资产预算与包体积目标 ≤35MB
 
 **意见：目标偏紧但可行**
 
 按 `ASSET_MANIFEST.md §2` 重新估算：
 
 | 类别 | 预算 | 我方估算 | 说明 |
 |---|---|---|---|
 | 52 单词插画 | ≤6.2MB | ~5.2MB | WebP q85 有损，1024px 可压到 80～100KB/张 |
 | 字母音频 (52) | ≤2.1MB | ~2.1MB | AAC 64kbps 单声道 3 秒 ≈24KB |
 | 词/短句音频 (104) | ≤6.3MB | ~5MB | AAC 64kbps 5 秒 ≈40KB |
 | 6 主题场景/装饰 | ≤4.8MB | ~4.8MB | 每套 home/map/lesson 三层场景 × WebP |
 | 6 角色（含动作） | ≤3MB | ~2～3MB | 取决于 WebP 序列还是 Rive 动画 |
 | BGM | ≤4.2MB | ~4.2MB | AAC 96kbps 60 秒 ≈720KB/首 |
 | SFX | ≤0.8MB | ~0.8MB | 低比特率 AAC 25KB/个 |
 | 字体（3 族 subset） | ≤1.5MB | ~1.2～1.5MB | Andika 含扩展字形可能偏大 |
 | **资源小计** | **~28.8MB** | **~25.3～26.9MB** | |
 | Flutter 引擎 + Dart AOT | — | ~8～10MB | `flutter build --split-debug-info` |
 | **预估安装大小** | **≤35MB** | **~33～37MB** | |
 
 结论：在严格优化下，35MB 可达。但如果插画质量要求将单张推至 150KB+，或 BGM 使用 128kbps+，包体积会超标。字体 subset 必须做。
 
 建议：
 - CI 中集成包体积检查：`flutter build apk --release` 后读取 APK 大小，超 35MB 标记失败。
 - 主题资产在 Phase 3 做第一次预算复核，如果超支，优先减少场景层数（3 层 → 2 层）。
 
 ---
 
 ## 5. 测试计划缺口
 
 **意见：整体覆盖得当，以下缺口需补充**
 
 **中优先级缺口：**
 1. **进度写入容错测试**：模拟 shared_preferences 写入中途中断（Mock 抛异常），验证进度不丢失、不损坏。
 2. **对比度自动化测试**：ACCESSIBILITY.md 要求 14 色角色 × 6 主题的全部对比度断言，但 TEST_PLAN 未列出具体参数化测试用例。必须补充。
 3. **音频异常恢复**：模拟 AudioService 播放器崩溃（如资源不存在），验证回退逻辑（静默继续 + 打印错误但不崩溃）。
 4. **离线验证**：应有一个 Integration Test 在飞行模式下跑完整课程流，确认零网络请求无异常。
 
 **低优先级缺口：**
 5. **性能基准测试**：TEST_PLAN 提到 60fps/3s 冷启动但无对应自动化测试。建议用 `traceAction` 测量关键帧渲染耗时。
 6. **Schema 迁移兼容测试**：需一个测试工厂函数生成老版 JSON，验证 v2 代码能正确读取 v1 格式。
 7. **家长门安全测试**：验证 `ParentGate` 无法通过返回键、快速连点、长时间按压绕过。IntegrationTest 模拟 60fps 连击 10 秒。
 
 ---
 
 ## 6. 儿童应用红线——技术层面的遗漏
 
 以下是在代码实施前需确认的技术红线项：
 
 **高优先级：**
 1. **shared_preferences 写入崩溃**：儿童设备可能在进度写入时被锁定或强制退出。没有恢复进度的兜底逻辑就是 P0 缺陷。
 2. **AudioService 无单点故障隔离**：如果音频文件损坏或加载失败，播放器抛异常，当前设计没有描述降级行为。孩子看到崩溃退出不可接受。
 3. **ParentGate 跨重启防绕**：30 秒冷却计时器仅存内存，App 强杀后冷却失效。需将冷却状态写入 shared_preferences。
 4. **Release 构建剥离**：必须确认 `flutter build --release` 时所有 `debugPrint`、`assert`、DevTools 协议被完全移除。
 
 **中优先级：**
 5. **音频中断（电话/闹钟）**：使用 `just_audio` 时应配置 `AudioSession` 处理音频焦点变更。当前文档未提及。
 6. **无障碍服务叠加**：部分 Android 设备（华为/小米儿童模式）会叠加无障碍遮罩层。Semantics 层次需测试不冲突。
 7. **Flutter ErrorWidget 覆盖**：需全局设置 `ErrorWidget.builder` 和 `PlatformDispatcher.instance.onError`，防止白色错误页面出现在儿童面前。
 
 **已完成/已覆盖：**
 - 零收集数据声明
 - 无广告 SDK / 无社交 / 无外链
 - `ReducedMotionPolicy` 全局生效
 - 触控尺寸基线 48/64/88dp
 - Semantics label 必填
 - 无失败终态、无红叉、无倒计时
 
 ---
 
 ## 7. 当前 Flutter/Dart 下的库版本与已知坑
 
 **注意**：本地 `flutter --version` 命令超时，未能确认实际版本。以下假设任务书中所述 **Flutter 3.41 / Dart 3.11** 为准，版本策略为 `^` 范围。
 
 ### 建议的 pubspec.yaml 依赖
 
 ```yaml
 dependencies:
   flutter:
     sdk: flutter
   flutter_riverpod: ^2.6.1
   riverpod_annotation: ^2.6.1        # 可选，实施期定
   go_router: ^14.8.0
   shared_preferences: ^2.3.4
   just_audio: ^0.9.41
   flutter_tts: ^4.2.0                 # dev 期，仅 dev_dependencies
   intl: ^0.19.0                       # l10n
 
 dev_dependencies:
   flutter_test:
     sdk: flutter
   flutter_lints: ^5.0.0
   riverpod_generator: ^2.6.2
   build_runner: ^2.4.13
   golden_toolkit: ^0.15.0
   mockito: ^5.4.5
 ```
 
 版本说明：
 - `riverpod` 2.6.x 系列稳定，无重大 breaking change。
 - `go_router` 14.8.x 为编写时最新。已知 Issue #2900（StatefulShellRoute pop 后恢复状态需显式 key）。
 - `just_audio` 0.9.41 修复了 Android 14 foreground service 权限问题。iOS 需配置 Audio Session Category 为 `.playback`。
 - `intl` + `flutter_localizations` 用于家长区 l10n，儿童侧 UI 极少文字。
 
 ### 已知坑（实施前确认）
 
 1. **just_audio + Rive/Lottie 同步**：just_audio 的 position stream 与 RiveAnimation controller 同步精度约 ±50ms，需接受或降级为 WebP 序列。
 2. **build_runner 在 Windows 上文件锁**：可能偶发 `Cannot delete ...riverpod.g.dart`。建议配置 `build.yaml` 缩小 codegen 扫描范围。
 3. **flutter_tts 在 Chinese OEM 设备**：小米/OPPO 可能禁用 Google TTS，退化为中文引擎读英文。Phase 3 真机测试必须覆盖。
 4. **go_router deep link**：v1 无深链需求，但 Android 12+ 上需要 `onDestinationVerified` 处理，预留给未来。
 
 ---
 
 ## 风险清单（按严重度排列）
 
 | # | 风险 | 严重度 | 类别 | 缓解措施 |
 |---|---|---|---|---|
 | R1 | progress 写入无原子性保证，儿童强退丢失进度 | 高 | 数据可靠性 | 写前 JSON 校验 + 写后重读验证；双重 key 写入 |
 | R2 | AudioService 无异常兜底，损坏音频使 App 崩溃 | 高 | 可靠性 | 全局 try-catch + 静默降级；单元测试模拟文件损坏 |
 | R3 | 35MB 包体积可能溢出（尤其是 just_audio ExoPlayer） | 中 | 构建产物 | CI 体积门禁；BGM 码率降到 96kbps；主题场景减少到 2 层备选 |
 | R4 | 六主题对比度人工维护不可持续 | 中 | 可维护性 | 参数化对比度测试覆盖 84 个色对；CI 阻断 |
 | R5 | ThemeExtension 资产引用无编译期检查 | 中 | 可靠性 | validateThemeAssets() 启动自检；文件存在性测试 |
 | R6 | ParentGate 冷却不持久化 = 重启绕过 | 中 | 安全/合规 | 失败时间戳写入 shared_preferences |
 | R7 | flutter_tts 在 Flutter 3.41 兼容性未确认 | 中 | 依赖风险 | 实施前 `flutter run` 验证；备选 macOS 录制为音频文件 |
 | R8 | 主题切换动画需要自定义 lerp() | 低 | 实现复杂度 | 参考 ThemeExtension.lerp 官方示例 |
 | R9 | feature 间跨依赖未被 lint 管控 | 低 | 架构纪律 | 引入 custom_lint 或 code review checklist |
 
 ---
 
 ## 建议的 pubspec.yaml 完整依赖清单
 
 见上述第 7 节。补充说明：
 - 字体文件（Baloo 2、Nunito、Andika）通过 `flutter:` 区块声明，不通过 pub 依赖。
 - 不使用 `flutter_svg`（插画为 WebP，图标自绘或 Lucide 子集，无需 SVG 运行时）。
 - 不使用 `cached_network_image`（Offline First，无网络图像）。
 - 不使用 `firebase_*`、`sentry_flutter` 等观测/上报类（v1 红线）。
 - 所有依赖在引入前必须经过 `DEPENDENCY_AUDIT.md` 流程检查遥测、许可证、儿童适用性。
 
 ---
 
 *报告结束*
