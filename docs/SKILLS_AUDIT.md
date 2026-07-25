# Skills 审计报告（SKILLS_AUDIT）

审计日期：2026-07-25
审计人：Claude（项目总负责人）
环境：Windows 11 Pro for Workstations / Flutter 3.41.3 stable / Dart 3.11.1 / Node 24.18.0 / npm 11.6.1 / Git 2.51.0 / Codex CLI 0.144.4

## 一、环境检查结果

| 项目 | 结果 |
|---|---|
| Flutter | 3.41.3 stable（channel stable，通过 `flutter doctor` 无任何问题） |
| Dart | 3.11.1 stable |
| Android toolchain | Android SDK 36.1.0，正常 |
| iOS | 本机为 Windows，iOS 构建需另行使用 macOS/远程构建（Phase 5 处理） |
| 设备 | 3 个可用设备（含 Windows/Chrome） |
| Node / npm | v24.18.0 / 11.6.1 |
| Git | 2.51.0.windows.2，已在项目根目录 `git init -b main` |
| Codex CLI | codex-cli 0.144.4，可用 |

## 二、已安装 Skills 清单

### 1. Flutter 官方 Agent Skills

- 来源：`flutter/agent-plugins`（GitHub 官方仓库，经 `npx skills@1.5.17` 安装）
- 版本：skills CLI 1.5.17 拉取的当前最新版本（2026-07-25）
- 安装位置：`D:\AI\EnglishGo\.agents\skills\flutter-*`（项目级，universal agent，Claude 与 Codex 共用）
- 包含技能：flutter-apply-architecture-best-practices、flutter-build-responsive-layout、flutter-fix-layout-issues、flutter-implement-json-serialization、flutter-setup-declarative-routing、flutter-setup-localization、flutter-use-http-package、flutter-add-widget-test、flutter-add-widget-preview、flutter-add-integration-test
- 适用阶段：Phase 2～5（架构、路由、布局、测试）
- 调用方式：Claude/Codex 在实施对应任务时自动读取；任务说明中显式引用技能名
- 安全性：纯 Markdown 指导文档，无可执行脚本、无遥测、无远程下载。官方来源（flutter.dev），BSD 风格许可证
- 验证结果：安装成功，文件齐全 ✅

### 2. Dart 官方 Agent Skills

- 来源：`dart-lang/skills`（GitHub 官方仓库）
- 版本：skills CLI 1.5.17 拉取的当前最新版本（2026-07-25）
- 安装位置：`D:\AI\EnglishGo\.agents\skills\dart-*`（项目级，universal）
- 包含技能：dart-add-unit-test、dart-build-cli-app、dart-collect-coverage、dart-fix-runtime-errors、dart-generate-test-mocks、dart-migrate-to-checks-package、dart-resolve-package-conflicts、dart-run-static-analysis、dart-setup-ffi-assets、dart-use-ffigen、dart-use-pattern-matching、dart-use-primary-constructors
- 适用阶段：Phase 2～5（静态分析、单元测试、依赖冲突解决）
- 调用方式：同上
- 安全性：纯 Markdown，无脚本、无遥测。官方来源，BSD 许可证
- 验证结果：安装成功 ✅

### 3. UI UX Pro Max

- 来源：`uipro-cli`（npm 全局安装）+ `uipro init --ai claude` / `--ai codex`
- 版本：uipro-cli 当前最新（npm，2026-07-25 安装）
- 安装位置：项目级 `.claude\skills\ui-ux-pro-max`、`.codex\skills\ui-ux-pro-max`；用户级 `~\.claude\skills\ui-ux-pro-max` 也已存在
- 适用阶段：Phase 1～3（Design System、主题 Token、字体、色彩、间距、圆角、阴影、组件规则）
- 调用方式：Claude 通过 Skill 工具调用 `ui-ux-pro-max`；Codex 读取 `.codex/skills`
- 职责边界：**唯一负责 Design Token 体系与组件规则**；其它设计类 Skill 不得推翻其确定的 Token
- 安全性：本地检索型技能（CSV/脚本本地搜索），无上传行为；已在用户环境长期使用
- 验证结果：`uipro init` 两次均输出 success ✅

### 4. Anthropic Frontend Design

- 来源：Claude Code 官方插件市场 `frontend-design@claude-plugins-official`
- 安装位置：Claude Code 插件（用户级已安装，会话内可用技能 `frontend-design:frontend-design`）
- 适用阶段：Phase 1～3（艺术方向、构图、层次、质感、动画气质、去 AI 味）
- 调用方式：Claude 通过 Skill 工具调用 `frontend-design:frontend-design`
- 职责边界：只负责艺术方向与审美判断，**不允许修改已确定的 Design Token**
- 安全性：Anthropic 官方插件，可信
- 验证结果：已在本会话技能列表中确认可用 ✅（无需重复安装）

### 5. Mobile App UI/UX Design

- 来源：`ceorkm/mobile-app-ui-design`（第三方 GitHub 仓库）
- 版本：skills CLI 1.5.17 拉取的当前最新版本
- 安装位置：`D:\AI\EnglishGo\.agents\skills\mobile-app-ui-design`
- 适用阶段：Phase 1～3（触控尺寸、拇指区域、移动导航、儿童操作路径、反馈、动效节奏、错误恢复）
- 调用方式：Claude/Codex 在移动端交互设计任务中读取
- 职责边界：只负责移动端交互与触控规范，不负责视觉 Token
- 安全性审查：**仅包含单个 SKILL.md（纯 Markdown 设计指导）**，无 package.json、无安装脚本、无网络请求、无遥测、无全局配置修改。内容为通用移动 UI 设计原则（排版、60/30/10 配色、8pt 网格等）。审查通过
- 验证结果：安装成功 ✅

## 三、职责边界总览

| Skill | 负责 | 禁止 |
|---|---|---|
| UI UX Pro Max | Design System、Token、字体、色彩、间距、圆角、阴影、组件规则、页面级主题覆盖 | — |
| Anthropic Frontend Design | 艺术方向、构图、层次、质感、动画气质、去 AI 味 | 修改已确定 Token |
| Mobile App UI/UX Design | 触控尺寸、拇指区域、导航、儿童操作路径、反馈、动效节奏、错误恢复 | 视觉 Token 决策 |
| Flutter 官方 Skills | 分层架构、响应式布局、路由、本地化、Widget Preview/Test、Integration Test | 设计决策 |
| Dart 官方 Skills | 静态分析、单元测试、依赖管理、语言特性 | 设计决策 |

冲突裁决顺序：DESIGN.md（唯一真源）> UI UX Pro Max > Frontend Design > Mobile App UI/UX Design。技术实现冲突以 Flutter/Dart 官方 Skills 为准。

## 四、辅助协作 Skills（已存在，非本次安装）

- `claudemain` / `codex`（用户级）：Claude Code 与 Codex CLI 串行协作模式，用于第十六章协作机制
- `superpowers` 系列：brainstorming、writing-plans、test-driven-development、verification-before-completion 等，按需使用

## 五、结论

所需 5 类 Skills 全部安装并验证通过，无安全风险。可进入 Phase 1（产品与设计文档）。
