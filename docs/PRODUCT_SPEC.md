# PRODUCT_SPEC — EnglishGo 产品规格说明

版本：1.0 ｜ 状态：Phase 1 已定稿 ｜ 负责人：Claude（产品）
关联文档：[LEARNING_MODEL](LEARNING_MODEL.md) · [USER_FLOW](USER_FLOW.md) · [DESIGN](DESIGN.md) · [THEME_SYSTEM](THEME_SYSTEM.md)

## 1. 产品定位

面向 3～6 岁（核心 4 岁）学龄前儿童的英语字母与单词启蒙 App。
一句话：**像一本会说话的精品绘本，让孩子在 6 个梦幻世界里认识 26 个字母和 52 个单词。**

- 平台：Android + iOS（含 iPad 自适应），Flutter 单代码库
- 模式：Offline First，无后端、无账户、无广告、无内购、无云同步（v1）
- 语言：教学内容为美式英语；UI 文案极少并以图标/语音为主；家长区域支持中文/英文/日文（l10n 预留）

## 2. 目标用户

| 角色 | 特征 | 需求 |
|---|---|---|
| 儿童（3～6 岁） | 不识字、精细动作发展中、注意力 3～5 分钟、会误触 | 大按钮、语音引导、即时温和反馈、无挫败感 |
| 家长 | 关注学习效果与屏幕安全 | 进度可见、无广告、无诱导消费、数据本地化 |

## 3. 核心功能范围（v1）

### 必须（P0）
1. 26 个字母课程：字母名 + 自然拼读音 + 2 个单词 + 插画 + 微动画（详见 [LEARNING_MODEL](LEARNING_MODEL.md)）
2. 每课两个小练习：听音选图、字母匹配；可选字母描线
3. 六套可切换主题（详见 [THEME_SYSTEM](THEME_SYSTEM.md)）
4. 奖励系统：星星、贴纸、收藏册（详见 [REWARD_SYSTEM](REWARD_SYSTEM.md)）
5. 字母地图（学习进度导航）
6. 本地进度保存（切主题不丢进度）
7. 家长区域 + 家长门
8. Onboarding（首次主题选择，≤2 步，无文字依赖）
9. 音频系统：语音不叠加、切页停止、可重复播放、BGM 可关

### 可选（P1，v1 内做但可降级）
- 字母描线练习（每课第 9 步，可跳过）
- 迷你故事解锁（完成 A/B/C 等字母组后）
- 字母音乐会（完成 A–Z 后）

### 明确不做（v1）
后端、账户、云同步、广告、内购、订阅、推送营销、社交/排行榜、聊天、UGC、外部网页（家长门后的隐私政策除外）、多用户档案。

## 4. 成功标准（v1 验收）

- 4 岁儿童可在无家长帮助下完成一节字母课（可用性测试）
- 单节课时长 2～4 分钟
- 全部核心学习流程离线可完成
- 满足 CLAUDE.md 第十八章全部质量门槛
- 通过 Apple Kids Category / Google Play Families 政策自查（[PRIVACY_AND_KIDS_POLICY](PRIVACY_AND_KIDS_POLICY.md)）

## 5. 技术决策摘要

| 决策 | 选择 | 理由 |
|---|---|---|
| 状态管理 | Riverpod（hooks 不强制） | 编译期安全、可测试、社区活跃 |
| 路由 | go_router | 声明式、深链预留、官方维护 |
| 课程内容 | 本地 JSON（assets/data/alphabet.json） | 只读内容，无需数据库 |
| 进度存储 | shared_preferences（轻量 JSON 序列化） | 数据量小（<10KB），无需 SQLite |
| 音频 | audioplayers 或 just_audio（实施期审计后定） | 由 AudioService 统一封装 |
| 动画 | Flutter 内建 + 自绘（CustomPainter/隐式动画）；Rive/Lottie 仅在资产管线确定后引入 | 控制包体积与风格一致性 |
| 主题 | ThemeExtension × 6 | 详见 THEME_SYSTEM |

依赖版本在实施时查询最新稳定版并记录于 docs/DEPENDENCY_AUDIT.md，不在本文档硬编码。

## 6. 风险

| 风险 | 等级 | 缓解 |
|---|---|---|
| 52 张插画风格统一难 | 高 | 先做 A/B/C 样板 + 插画规范（CONTENT_GUIDE），验证后批量 |
| 正式音频授权 | 高 | 开发期系统 TTS（标记 TODO），发布前替换预录音 |
| 六主题工作量大 | 中 | Token 化 + 组件复用，主题只换 Token/资产不换布局 |
| Windows 开发机无法构建 iOS | 中 | Phase 5 用 macOS/云构建；开发期以 Android + 桌面预览为主 |
| 儿童可用性无法纯靠代码验证 | 中 | Phase 3 截图审查 + 真机测试清单（TEST_PLAN） |
