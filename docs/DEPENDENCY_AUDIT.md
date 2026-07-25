# DEPENDENCY_AUDIT — 依赖审计

审计日期：2026-07-25 ｜ 环境：Flutter 3.41.3 / Dart 3.11.1
规则：新依赖引入前必须在此登记（维护状态/许可证/遥测/儿童适用性/体积），并经 Claude 批准。
版本策略：`^` 最新稳定版（pub 实际解析为准）；Codex Task 01 报告中的版本号系其训练数据，已按 pub 解析结果修正。

## 已批准依赖（dependencies）

| 包 | 版本 | 许可证 | 维护 | 遥测 | 儿童适用 | 体积影响 | 用途/备注 |
|---|---|---|---|---|---|---|---|
| flutter_riverpod | ^3.3.2 | MIT | 官方活跃（Remi/Invertase） | 无 | ✅ | 小 | 状态管理；v1 手写 provider，不上 codegen（Task 01 建议采纳） |
| go_router | ^17.3.0 | BSD-3 | Flutter 官方 | 无 | ✅ | 小 | 路由；深链 v1 不启用 |
| shared_preferences | ^2.5.5 | BSD-3 | Flutter 官方 | 无 | ✅ | 小 | 进度/设置存储；需实现双写容错（R1） |
| just_audio | ^0.10.6 | MIT | 活跃（ryanheise） | 无 | ✅ | 中（Android ExoPlayer +4~6MB，R3 监控） | 全部音频播放；经 AudioService 封装 |
| audio_session | ^0.2.4 | MIT | 活跃（同上） | 无 | ✅ | 小 | 音频焦点/来电 ducking/iOS playback category |
| cupertino_icons | ^1.0.8 | MIT | 官方 | 无 | ✅ | 小 | 模板自带；正式图标自绘后评估移除 |

## 已批准依赖（dev_dependencies）

| 包 | 版本 | 用途 |
|---|---|---|
| flutter_lints | ^6.0.0（模板解析版本为准） | 静态分析基线 |
| flutter_test / integration_test | SDK | 测试 |

## 明确不引入（v1）

- `flutter_tts`：**否决**（Task 01 R7 的最终裁决）。占位音频改为构建期脚本用 Windows SAPI 离线生成 wav 文件入 assets（manifest 标记 `placeholder: true`），App 运行时只经 just_audio 播放文件。理由：dev_dependencies 无法在运行时使用；运行时 TTS 在 OEM 设备行为不可控；发布版无需剔除逻辑
- `firebase_*` / `sentry_flutter` / 任何统计上报：儿童隐私红线
- `flutter_svg` / `cached_network_image` / `sqflite` / `drift`：v1 无需求，避免体积与复杂度
- `riverpod_generator` + `build_runner`：provider 数 >15 时再评估

## 待评估（后续 Phase）

| 包 | 触发条件 |
|---|---|
| rive 或 lottie | 角色动画管线确定时（对比 WebP 序列帧的体积/效果） |
| golden_toolkit（或内建 golden） | Phase 3 视觉回归时定 |
| custom_lint | feature 间耦合失控时（R9） |
