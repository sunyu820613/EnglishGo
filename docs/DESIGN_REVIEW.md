# DESIGN_REVIEW — Phase 3 设计与儿童体验审查

版本：1.0（2026-07-25）｜ 关联：[DESIGN.md](DESIGN.md) · [ACCESSIBILITY.md](ACCESSIBILITY.md) · [AGENT_HANDOFF.md](AGENT_HANDOFF.md)

本文档记录 Phase 3 审查中通过自动化测试实际验证过的问题，而非人工目测走查（真机/多设备走查仍是 Phase 5 待办，见文末）。分类：**Blocking**（阻塞发布）、**Major**（明显影响体验，应发布前修）、**Minor**（体验瑕疵）、**Polish**（锦上添花，可延后）。

## 已发现并修复

| 级别 | 问题 | 位置 | 修复方式 | 验证 |
|---|---|---|---|---|
| Blocking | Onboarding 死循环，新用户永远无法进入 App | `router.dart` | 用独立 `onboardingComplete` 字段替代"是否有学习进度"的代理判断 | `test/app/router_test.dart` |
| Blocking | `AssetManifest.json` 404，首帧无法渲染 | `validate_theme_assets.dart` | 改用官方 `AssetManifest.loadFromAssetBundle()` API | `validate_theme_assets_test.dart` |
| Major | `RewardsPage` 用单字母 3 星组件误显示最多 78 星贴纸总数，横向溢出 2320px | `rewards_page.dart` | 移除误用组件，改单星标+数字文案 | `large_text_scale_test.dart` |
| Major | 课程 10 个步骤在 200% 系统字体下全部有溢出风险（`_StepLetterName` 实测溢出 3px） | `lesson_page.dart` | 统一提取 `_ScrollSafeCenter`（滚动兜底），10 个步骤全部套用 | `lesson_page_large_text_scale_test.dart` |
| Major | `WordCard` 无自身尺寸约束，矮视口下纵向溢出 | `word_card.dart` + 各调用点 | 组件级加 `ConstrainedBox`，从源头修复而非逐个调用点打补丁 | `widgets_test.dart` |
| Major | 测验（quiz）/配对（matching）步骤的抖动·弹跳动效未接入"减弱动效"设置，家长在设置里关闭动效后仍会触发 | `lesson_page.dart` (`_StepQuiz`/`_StepMatching`) | 接入既有的 `isReducedMotion(ref, context)`，传给 `QuizOptionCard.reducedMotion` | `lesson_page_reduced_motion_test.dart` |
| Major | `AlphabetMapPage` 硬编码仅 A/B/C 可进入，D–Z 显示 "coming soon"，违反 LEARNING_MODEL.md §1.5（"全部可自由进入，不锁定"） | `alphabet_map_page.dart` | 确认全部 26 字母音频+插画资产就绪后移除限制 | `alphabet_map_page_test.dart` |
| Minor | `AlphabetMapPage` 固定宽高比网格在 3 星满星状态下有溢出风险（未实际复现，但属高风险路径，补测试固化结论） | `alphabet_map_page.dart` | 无需改代码；补充覆盖该场景的回归测试 | `large_text_scale_test.dart` |

## 已核实无问题的项目（Phase 3 覆盖范围内）

- `HomePage` / `OnboardingPage` / `ThemeSelectionPage` / `ParentGatePage` / `ParentAreaPage`：200% 系统字体下无溢出
- 六主题色彩对比度：已在 `kid_theme_test.dart` 中做参数化对比度校验
- 触控热区、`Semantics` 标签：各核心交互组件（`KidButton`/`SoundButton`/`QuizOptionCard`/字母节点）均已带 `Semantics(label:...)`
- 依赖/隐私：`pubspec.yaml` 运行时依赖只有 5 个（`audio_session`/`cupertino_icons`/`flutter_riverpod`/`go_router`/`just_audio`/`shared_preferences`），全项目无网络请求、无 SDK 级数据采集、无广告代码（`grep` 全量核查确认）
- 插画生成密钥（DashScope API Key）未出现在任何仓库内文件中，只读取环境变量

## 已知未覆盖 / 遗留给 Phase 4 或 Phase 5

**内容与功能完整性（Phase 4 范畴，需要新功能开发，本轮未实现）：**
- `_StepTracing`（课程步骤 9）目前仍是"Coming soon, tap to skip"占位页，真实的手指描线画布（TracingCanvas）未实现——这是任务书本身已知的缺口（见 `docs/agent_tasks/04-abc-screens.md`），非本轮新发现
- `docs/EASTER_EGGS.md` 描述的六主题彩蛋交互均未实现
- `docs/PRODUCT_SPEC.md` 提到的"迷你故事解锁"、收藏书等奖励延伸功能均未实现

**需要真实环境才能完成的项（Phase 5 范畴，本工具环境无法代为完成）：**
- 真机走查（iOS/Android/iPad 实机，VoiceOver/TalkBack 实测）——本环境只有 Windows 桌面 + Web 构建可用，`integration_test` 已写好但无可用移动设备/模拟器运行
- 正式配音替换当前 Windows SAPI 占位音频——需要真人录音棚资源
- 插画语义/文化适宜性人工复核——已提供 52 张总览拼图给用户确认（用户已确认可用），但 `manifest.json` 中 `humanReviewed` 字段仍为 `false`，正式发布前建议逐张最终核对一遍
- DashScope 生成图片的商用授权条款——已核实（见 `AGENT_HANDOFF.md` 对应条目），结论是可商用但平台不做版权担保，风险自担
- App Store / Google Play 商店素材、隐私清单申报、儿童类别合规审查——需要开发者账号，无法在当前环境完成

## 验证方式说明

本文档中"已验证"均指自动化 widget test 在 flutter_test 环境下的验证（模拟 200% 字体缩放、模拟持久化设置等），**不等同于真机走查**。flutter_test 的渲染管线、字体度量、触控行为与真实设备存在已知差异（例如本轮就发现了 `rootBundle` 二次加载卡死这类纯测试环境问题），因此 Phase 5 的真机走查仍是发布前的必要步骤，不能被本文档替代。
