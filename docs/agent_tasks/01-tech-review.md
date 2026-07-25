# Task 01 — 独立技术审查（Tech Stack / Dependencies / Structure Review）

## 背景
EnglishGo：3～6 岁儿童英语字母学习 App（Flutter，Offline First，无后端）。Phase 1 文档已完成，代码尚未创建。在 `flutter create` 之前，需要 Codex 独立审查技术方案。

## 目标
对以下内容给出独立、批判性的审查意见（不实施任何修改）：
1. 技术栈选择：Riverpod、go_router、shared_preferences 存进度、本地 JSON 存课程内容、audioplayers vs just_audio、flutter_tts 作开发期占位
2. 目录结构（CLAUDE.md「架构速览」）是否合理、有无过度设计
3. 六主题 ThemeExtension 方案的可维护性
4. 资产预算（docs/ASSET_MANIFEST.md §2）与包体积目标 ≤35MB 是否现实
5. 测试计划（docs/TEST_PLAN.md）的缺口
6. 儿童应用红线（隐私、可访问性）在技术层面的遗漏
7. 当前 Flutter 3.41 / Dart 3.11 下，上述库的最新稳定版本与已知坑（若无法联网核实版本，注明假设）

## 允许修改范围
- 仅允许新建 `docs/agent_reports/01-tech-review-report.md`

## 禁止修改范围
- 其余全部文件

## 输入文件
CLAUDE.md、AGENTS.md、docs/PRODUCT_SPEC.md、docs/DESIGN.md、docs/THEME_SYSTEM.md、docs/COMPONENT_SYSTEM.md、docs/CONTENT_GUIDE.md、docs/ASSET_MANIFEST.md、docs/TEST_PLAN.md、docs/ACCESSIBILITY.md、docs/PRIVACY_AND_KIDS_POLICY.md

## 输出文件
`docs/agent_reports/01-tech-review-report.md`，结构：
- 总体结论（可行/需调整）
- 分项意见（对应目标 1–7，每项给出：同意/不同意 + 理由 + 替代建议）
- 风险清单（按严重度）
- 建议的 pubspec 依赖清单（含版本或版本策略）

## 验收条件
- 报告覆盖全部 7 项；意见具体可执行；不泛泛而谈
- 未修改任何其他文件

## 风险
无（只读审查）

## 回滚方法
删除报告文件即可
