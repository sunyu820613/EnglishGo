# Task 02 — Design Token 与六主题 ThemeExtension 实现

状态：已定稿（含 Task 01 审查结论）

## 背景
Flutter 骨架已创建；依赖已定（flutter_riverpod 3.3.2 / go_router 17.3.0 / shared_preferences 2.5.5 / just_audio 0.10.6 / audio_session 0.2.4，见 docs/DEPENDENCY_AUDIT.md）。需要把 docs/DESIGN.md 与 docs/THEME_SYSTEM.md 的 Token 落成代码。注意：Riverpod 为 3.x API（Notifier/NotifierProvider），不使用 codegen。

## 目标
1. `lib/core/theme/tokens.dart`：结构性 Token（间距/圆角/阴影/触控/字号/动效时长曲线/层级），常量命名与 DESIGN.md §2 一一对应（如 `Space.md`、`KidRadius.lg`、`TouchSize.primary`、`Motion.micro`）
2. `lib/core/theme/kid_theme.dart`：`KidThemeExtension extends ThemeExtension<KidThemeExtension>`：
   - 14 个颜色角色（THEME_SYSTEM §1）
   - 资产引用字段用强类型 `ThemeAssets` 类（路径常量集中于 `lib/core/theme/theme_assets.dart`，禁止裸字符串散落）
   - 实现 `copyWith` 与 `lerp()`（颜色插值，资产字段阶跃切换）——主题切换 320ms 渐变的基础
3. 每主题独立文件：`lib/core/theme/themes/{starlight,dino,robot,moon_garden,ballet_castle,dessert}_theme.dart`，色值严格取自 THEME_SYSTEM §1
4. `lib/core/theme/app_theme.dart`：`ThemeData` 装配（fontFamily 常量：Baloo2/Nunito/Andika，字体文件已在 `assets/fonts/`，需在 pubspec 声明三字族：Baloo2 变量字体、Nunito 变量字体、Andika Regular+Bold）
5. `lib/core/theme/theme_controller.dart`：Riverpod 3 `Notifier` 主题状态 + shared_preferences 持久化（key `settings.themeId`，默认 `starlight`），带读取容错（损坏值回退默认）
6. `lib/core/theme/validate_theme_assets.dart`：`validateThemeAssets()` 启动自检骨架（当前资产未就位，函数遍历六主题 ThemeAssets 路径并对照 AssetManifest 检查；缺失时 debug 模式打印警告清单、release 静默，返回缺失列表供测试断言用——测试中允许当前全部缺失，只验证机制）
7. 测试（test/core/theme/）：
   - 六主题 14 色齐备（参数化 group 循环）
   - 对比度断言：text/background ≥7.0、onPrimary/primary ≥4.5、textSoft/background ≥3.0（WCAG 相对亮度公式，自实现工具函数）
   - lerp(0)/lerp(1)/lerp(0.5) 行为
   - theme_controller 持久化读写与损坏值回退

## 允许修改范围
- `lib/core/theme/**`、`lib/core/constants/**`
- `test/core/**`
- `pubspec.yaml`（仅 fonts 与 assets 声明段）

## 禁止修改范围
- docs/**、lib/features/**、lib/main.dart、analysis_options.yaml、assets/data/**

## 输入文件
docs/DESIGN.md、docs/THEME_SYSTEM.md、docs/COMPONENT_SYSTEM.md、AGENTS.md、docs/DEPENDENCY_AUDIT.md

## 输出文件
上述 lib/test 文件、pubspec 字体声明、docs/AGENT_HANDOFF.md 更新（追加条目）

## UI 规范
无 UI 页面。Token 值与文档零偏差；theme 目录之外不得出现任何色值字面量。

## 验收条件
- `flutter analyze` 零错误零警告；`dart format .` 无变更；`flutter test` 全过
- 若某色对不达标：不得自行改色值，在 HANDOFF 报告中列出实测比值与最小修正建议，由 Claude 定夺

## 必须执行的测试
`flutter analyze` → `dart format .` → `flutter test`

## 风险
对比度个别不达标（预期 textSoft 在深色主题可能临界）→ 按验收条件上报

## 回滚方法
`git checkout -- lib test pubspec.yaml`
