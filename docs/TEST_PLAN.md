# TEST_PLAN — 测试计划

版本：1.0 ｜ 关联：[ACCESSIBILITY](ACCESSIBILITY.md) · [LEARNING_MODEL](LEARNING_MODEL.md) · 质量门槛（CLAUDE.md 十八）

## 1. 测试层级

| 层 | 工具 | 覆盖 |
|---|---|---|
| Unit | flutter_test | 内容加载与校验（26×2）、进度存取/迁移、三星规则、AudioService 状态机、对比度计算、manifest 一致性 |
| Widget | flutter_test | 核心组件六主题构建、触控尺寸/Semantics guideline、200% 字号无溢出、ReducedMotion、练习反馈流 |
| Golden | golden_toolkit 或内建 | A/B/C 课程页 + 首页 + 地图 × 6 主题 × {小手机 360×640、常规 412×915、iPhone 393×852、平板 1024×1366} |
| Integration | integration_test | 完整课程流（进入→10 步→奖励→进度落盘）、主题切换保进度、音频打断规则 |
| 真机清单 | 手动 | VoiceOver/TalkBack、真实触感、音频延迟、性能（TEST_PLAN §4） |

## 2. 关键用例（必须存在）

1. `alphabet.json`：恰好 26 字母、每字母恰好 2 词、全部资源在 manifest 且文件存在
2. X 字母数据含 `phonicsNote` 双读法；I/U 含长短音说明
3. 答错流程：第 1 次错 → 重播提示；第 2 次错 → 选项减 1；无“失败”终态
4. 三星规则各分支；重学补星；星星不减
5. 主题切换后 progress 完整；六主题 ThemeExtension 均满足对比度断言
6. 语音互斥：连点发音按钮不叠音；路由切换停音；BGM ducking
7. 家长门：长按 3s 成功；算术错 3 次冷却 30s；儿童快速点击不触发
8. 进度 schema 迁移：schemaVersion 1 → 未来版本的兼容读取
9. 200% textScale 下课程页/家长区无溢出
10. `disableAnimations` 下无循环动画 ticker 存活

## 3. CI（GitHub Actions，Phase 2 起）

`flutter analyze --fatal-infos` → `dart format --set-exit-if-changed` → `flutter test`（含 golden 比对）→（Phase 5 加 integration on emulator + build apk 体积报告）

## 4. 真机/性能检查（Phase 5）

- Android 中低端机（如 4GB RAM）：课程页稳定 60fps、冷启动 <3s、无内存增长
- iPhone + iPad：布局、VoiceOver、静音键行为
- 包体积：apk/aab 与 ipa 增量 ≤35MB 资源预算复核
