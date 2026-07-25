# AGENTS.md — Claude 与 Codex 共同守则

本文件对 Claude Code 与 Codex 同时生效。语言：协作沟通用中文；代码中除注释与 UI 文案外仅用英文。

## 角色分工

- **Claude（总负责人）**：产品规划、学习体验、设计系统、架构决策、任务拆解、代码审查、视觉与最终验收
- **Codex（实施者）**：资料核查、Flutter 代码实施、自动化测试、性能检查、问题修复

## 文档权威级

1. `docs/DESIGN.md` — 设计唯一真源，任何样式值必须引用其 Token
2. `docs/THEME_SYSTEM.md` / `docs/COMPONENT_SYSTEM.md` — 主题与组件规范
3. `docs/PRODUCT_SPEC.md` / `docs/LEARNING_MODEL.md` / `docs/CONTENT_GUIDE.md` — 产品与内容
4. 其余 docs/*.md

## Codex 禁改文件（除非任务书明确允许）

docs/PRODUCT_SPEC.md · docs/DESIGN.md · docs/THEME_SYSTEM.md · docs/CONTENT_GUIDE.md · docs/PRIVACY_AND_KIDS_POLICY.md · CLAUDE.md · AGENTS.md

## Codex 执行任务的固定流程

1. 读 CLAUDE.md → AGENTS.md → 任务书（docs/agent_tasks/NN-*.md）→ 任务书列出的设计文档
2. **开工前确认当前工作目录为项目根目录**（`D:\AI\EnglishGo`），尤其是同一会话中曾操作过其他子目录时；所有文件写入路径必须是相对项目根的路径（如 `lib/...`、`test/...`），禁止出现 `tool/xxx/lib/...` 这类误落地
3. 仅在"允许修改范围"内改动；发现需越界时停止并在报告中说明
4. 实施 + 补测试；禁止占位 Emoji 冒充插画；禁止硬编码样式值；测试断言必须验证真实行为，禁止 `expect(x, isNotNull)`/`expect(true, isTrue)` 这类空断言充数
5. 每次交付前必须执行并通过：`flutter analyze`（零错误）、`dart format .`、`flutter test`；**若沙箱环境无法运行这些命令，必须在交付说明中明确声明"未自行验证"，不得推断或声称已通过**
6. 完成后自查 `git status` / `find lib test -newer <上次提交>`，确认文件落点与改动范围符合任务书
7. 更新 docs/AGENT_HANDOFF.md（完成项/未完成项/风险/测试结果）

## 通用工程规则

- 小步提交；提交信息英文祈使句；不使用 `--no-verify`
- 新依赖必须先记录 docs/DEPENDENCY_AUDIT.md（维护状态/许可证/遥测/儿童适用性/体积）
- 儿童隐私红线（PRIVACY_AND_KIDS_POLICY §1）任何改动不得违反
- 儿童体验红线：无失败警报、无红叉、无倒计时、答错温和处理（LEARNING_MODEL §1）
- 所有交互组件 Semantics label 必填；触控 ≥48dp（儿童常规 ≥64dp）
- 音频一律经 AudioService；组件禁止直接实例化播放器

## 质量门槛

见 CLAUDE.md 第十八章。任何一项不满足不得宣布完成。
