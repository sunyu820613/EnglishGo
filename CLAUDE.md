# CLAUDE.md — EnglishGo 项目指令（Claude 与 Codex 都必须先读）

面向 3～6 岁（核心 4 岁）儿童的英语字母/单词学习 App。Flutter · Android/iOS/iPad · Offline First · v1 无后端/账户/广告/内购/云同步。
视觉定位：高质量儿童绘本 × 精品动画 × 精致实体玩具；禁止廉价早教机感与 AI 生成界面感。

## 必读文档（按优先级）

1. [AGENTS.md](AGENTS.md) — 协作守则与禁改清单
2. [docs/DESIGN.md](docs/DESIGN.md) — 设计唯一真源（Token；禁止硬编码样式）
3. [docs/THEME_SYSTEM.md](docs/THEME_SYSTEM.md) — 六主题 Token 与资产
4. [docs/COMPONENT_SYSTEM.md](docs/COMPONENT_SYSTEM.md) — 组件规范
5. [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) · [docs/LEARNING_MODEL.md](docs/LEARNING_MODEL.md) · [docs/USER_FLOW.md](docs/USER_FLOW.md)
6. [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) — 固定单词表/发音/插画规范（X 双读法特例）
7. [docs/REWARD_SYSTEM.md](docs/REWARD_SYSTEM.md) · [docs/EASTER_EGGS.md](docs/EASTER_EGGS.md)
8. [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) · [docs/PRIVACY_AND_KIDS_POLICY.md](docs/PRIVACY_AND_KIDS_POLICY.md)
9. [docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md) · [docs/TEST_PLAN.md](docs/TEST_PLAN.md)

## 架构速览

```
lib/
  app/            # App 入口、路由 (go_router)
  core/
    accessibility/  # ReducedMotionPolicy
    audio/          # AudioService（唯一音频出口）
    constants/
    theme/          # tokens.dart + KidThemeExtension × 6
    widgets/        # KidButton, SoundButton, WordCard, ...
  data/
    alphabet/       # 内容 Repository（assets/data/alphabet.json）
    progress/       # 进度 Repository（shared_preferences）
  features/
    onboarding/ home/ alphabet/ lesson/ tracing/ rewards/ collection/ parent_area/ settings/
  l10n/
```

状态管理 Riverpod；路由 go_router；依赖版本见 docs/DEPENDENCY_AUDIT.md（新依赖先审计后引入）。

## 每次改代码后的硬性检查

```
flutter analyze   # 零错误
dart format .
flutter test      # 全部通过
```

## 红线（违反即打回）

- 样式硬编码（颜色/圆角/阴影/时长/间距必须走 Token）
- Emoji 冒充插画/图标；未登记 manifest 的资源
- 失败警报/红叉/倒计时/排行榜/惩罚式反馈
- 任何数据采集、广告 SDK、儿童侧外链
- 触控 <48dp；缺 Semantics label；音频绕过 AudioService
- Codex 修改禁改清单文件（见 AGENTS.md）

## 质量门槛（宣布完成前逐项核对）

flutter analyze 零错 / flutter test 全过 / A–Z 数据完整（26×2 词）/ 全部资源存在且入 manifest / 六主题可切换且进度不丢 / 音频不叠加 / 离线全流程可用 / 触控达标 / 无溢出 / 无未授权资源 / 无广告与采集 / 家长门有效 / 彩蛋不挡学习 / 无占位页面 / DESIGN.md 与实现一致 / README 完整。
