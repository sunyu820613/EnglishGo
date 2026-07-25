# ACCESSIBILITY — 可访问性规范

版本：1.0 ｜ 关联：[DESIGN.md](DESIGN.md) §2.4/§3 · [TEST_PLAN](TEST_PLAN.md)

## 1. 硬性要求

| 项 | 标准 | 验证方式 |
|---|---|---|
| 触控区域 | 次级 ≥48dp，儿童常规 ≥64dp，主按钮 ≥88dp，间隙 ≥12dp | Widget Test + `meetsGuideline(androidTapTargetGuideline)` |
| Semantics | 全部图片按钮/图标有 label；插画有描述 | Widget Test `meetsGuideline(labeledTapTargetGuideline)` |
| 屏幕阅读 | VoiceOver/TalkBack 阅读顺序 = 视觉顺序 | 真机清单（TEST_PLAN） |
| 文字缩放 | 系统 200% 字号下无 RenderFlex Overflow | Widget Test（textScaleFactor 2.0）+ Golden |
| 降低动态效果 | `ReducedMotionPolicy` 全局生效（DESIGN §2.6） | Widget Test 注入 `disableAnimations` |
| 颜色对比 | text 7:1，onPrimary 4.5:1，textSoft 3:1（大字） | 单元测试计算全部主题色对 |
| 不只靠颜色 | 正误反馈=颜色+动效+语音三通道 | 设计审查 |
| 动画可跳过 | 庆祝/转场可点击跳过；永不阻塞输入 | Widget Test |
| 音频控制 | BGM 可关；语音可重复；切页停止 | 单元测试 AudioService |
| 布局 | 横屏/平板无溢出；安全区合规 | Golden 多尺寸 |

## 2. 实现要点

- `lib/core/accessibility/reduced_motion_policy.dart`：读取 `MediaQuery.disableAnimations` + 家长区“动画强度”设置，二者取更保守值
- 焦点环：`focus` Token 3dp，用于外接键盘/开关控制场景
- 语音引导本身是核心可访问通道：所有关键操作有语音提示，不依赖文字
- 家长区（成人 UI）遵循标准 WCAG AA：正文 ≥16sp、对比 4.5:1
- Semantics 文案使用英文（儿童侧）与家长区当前语言（家长侧）

## 3. Flutter Accessibility Guideline API 用法（测试模板）

```dart
testWidgets('lesson page meets a11y guidelines', (tester) async {
  final handle = tester.ensureSemantics();
  await tester.pumpWidget(app);
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
  await expectLater(tester, meetsGuideline(textContrastGuideline));
  handle.dispose();
});
```
