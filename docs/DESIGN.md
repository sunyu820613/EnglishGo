# DESIGN — 设计系统（唯一真源 / Single Source of Truth）

版本：1.0 ｜ 所有页面、组件、主题必须引用本文档 Token。
禁止在页面代码中硬编码颜色、圆角、阴影、动画时长、间距。
主题差异只能通过 [THEME_SYSTEM](THEME_SYSTEM.md) 定义的 ThemeExtension Token 表达。
Dart 侧对应文件：`lib/core/theme/tokens.dart`（结构性 Token）+ `lib/core/theme/app_theme.dart`（六主题实例）。

## 1. 艺术方向

**“精品绘本 × 柔软玩具”**：Soft-Clay 质感（柔和 3D、圆润、可捏感）+ 绘本式手绘插画 + 统一暖光。
- 不是：廉价早教机、荧光霓虹、默认 Material Demo、成人奢侈品风、赛博紫蓝渐变
- 是：Sago Mini / Toca Boca 的工艺水准 + 高质量绘本的色彩纪律
- 每个界面有**一个**明确视觉焦点；装饰永远让位于学习内容
- 光源统一：左上 45°，暖白光；阴影带主题色调（不用纯黑灰）

## 2. 结构性 Token（全主题共享，命名即 Dart 常量名）

### 2.1 间距（4/8 网格，儿童宽松密度）

| Token | 值 (dp) | 用途 |
|---|---|---|
| `space.xs` | 8 | 图标与文字间隙 |
| `space.sm` | 12 | 紧凑元素间 |
| `space.md` | 16 | 组件内边距基准 |
| `space.lg` | 24 | 组件之间 |
| `space.xl` | 32 | 区块之间 |
| `space.xxl` | 48 | 页面大区块 |
| `space.page` | 24（手机）/ 48（平板 ≥600dp） | 页面横向边距 |

### 2.2 圆角

| Token | 值 (dp) | 用途 |
|---|---|---|
| `radius.sm` | 16 | 小标签、进度点 |
| `radius.md` | 24 | 按钮、输入 |
| `radius.lg` | 32 | 卡片、插画框 |
| `radius.xl` | 44 | 大面板、底部弹层 |
| `radius.full` | 999 | 圆形按钮、头像 |

### 2.3 阴影（Soft-Clay 双层，颜色由主题 `shadowTint` 提供）

| Token | 定义 |
|---|---|
| `shadow.rest` | 外层：y+6 blur 18 tint@22%；内层高光：y-2 blur 6 white@35%（仅浅色主题） |
| `shadow.raised` | 外层：y+10 blur 28 tint@28% |
| `shadow.pressed` | 外层：y+2 blur 8 tint@18%（配合 scale 0.96） |

### 2.4 触控尺寸（儿童标准，高于平台最低值）

| Token | 值 (dp) | 用途 |
|---|---|---|
| `touch.min` | 48 | 绝对下限（次级图标按钮） |
| `touch.kid` | 64 | 儿童常规按钮下限 |
| `touch.primary` | 88 | 主发音按钮 / 主 CTA |
| `touch.gap` | 12 | 相邻可点目标最小间隙 |

### 2.5 字体（全主题共用字族，主题只调整颜色/个别字重）

| 角色 | 字族 | 许可 | 用途 |
|---|---|---|---|
| Display | **Baloo 2** | OFL | 大字母展示、标题、按钮文字 |
| Body | **Nunito** | OFL | 家长区正文、次级说明 |
| Teaching | **Andika** | SIL OFL | 教学字形（单层 a/g，为初学阅读儿童设计）：课程内字母与单词拼写展示 |

字号阶（sp，随系统缩放）：

| Token | 值 | 用途 |
|---|---|---|
| `type.letterHero` | 120 | 课程页主字母 |
| `type.display` | 40 | 页面标题 |
| `type.title` | 28 | 卡片标题、单词 |
| `type.body` | 18 | 家长区正文（≥16 下限） |
| `type.caption` | 14 | 家长区辅助文字（仅成人界面允许） |

儿童界面禁止 <18sp 文字；正文行高 1.5；不使用全大写正文。

### 2.6 动效

| Token | 时长 | 曲线 | 用途 |
|---|---|---|---|
| `motion.press` | 120ms | easeOut | 按下 scale→0.96 |
| `motion.micro` | 220ms | easeOutBack | 弹跳、图标反馈 |
| `motion.standard` | 320ms | easeOutCubic | 页面元素进出 |
| `motion.page` | 420ms | easeInOutCubic | 路由转场 |
| `motion.celebrate` | 800ms | spring (damping 12) | 奖励/完成动画 |
| `motion.idle` | 2400ms 循环 | easeInOutSine | 角色待机呼吸 ±3% |

规则：进快出慢的反向禁止（退出 ≈ 进入 × 0.7）；同屏最多 2 个主动动画元素 + 低频粒子；所有动效经 `ReducedMotionPolicy`（系统“减少动态效果”开启时：粒子关闭、循环动画停止、转场改淡入淡出 150ms、庆祝动画换静态插画）。动画永不阻塞输入、可被点击打断。

### 2.7 图标与描边

- 图标风格：圆头描边 2.5dp，单一风格族（自绘或 Lucide 圆润子集），禁止 Emoji 作为图标/插画
- 插画描边：主体 3–4dp 深色轮廓（颜色为主题 `outline` Token，非纯黑）

### 2.8 层级（z-index 语义）

`background(0) → decoration(1) → content(2) → character(3) → overlay/celebration(4) → dialog(5)`
角色与粒子严禁进入 content 层遮挡学习内容。

## 3. 语义颜色角色（每主题必须提供全部 14 个，值见 THEME_SYSTEM）

| 角色 Token | 说明 |
|---|---|
| `background` | 页面底色/场景基色 |
| `surface` | 卡片/面板 |
| `surfaceAlt` | 次级面板、描线画布 |
| `primary` / `onPrimary` | 主按钮及其上内容（对比 ≥4.5:1） |
| `secondary` / `onSecondary` | 次级按钮 |
| `accent` | 强调点缀（星星、高亮），小面积使用 |
| `text` / `textSoft` | 主文字（≥4.5:1）/ 次级文字（≥3:1，仅大字） |
| `outline` | 插画与组件描边 |
| `shadowTint` | 阴影色（主题色调，非黑灰） |
| `success` | 正确反馈（须伴随动效+音效，不单靠颜色） |
| `focus` | 键盘/开关焦点环（3dp） |

正误反馈规范：正确 = success 色 + 弹跳 + 愉悦音；提示 = 摇头动画 + 语音，**永不使用红色大叉与警报音**。红色系仅家长区破坏性操作（重置进度）使用。

## 4. 布局与响应式

- 断点：手机 <600dp / 平板 ≥600dp（`space.page` 与栅格列数切换）；课程页平板采用居中 720dp 内容列
- 竖屏优先，横屏与平板必须无溢出（Golden/Widget Test 覆盖）
- 安全区：所有固定元素避开刘海、手势条；主按钮距屏幕边缘 ≥24dp
- 插画统一：主体占画面 ~70%，正方形 1:1 画幅，统一视角（微俯视 10°），留白 ≥15%

## 5. 反 AI 味清单（视觉审查硬性项）

- 禁止大面积紫蓝渐变、玻璃拟态滥用、无意义粒子铺屏
- 禁止默认 Material 组件裸用（AppBar/ElevatedButton 默认样式）
- 禁止插画风格混搭（3D 渲染与扁平混用等）
- 每页可指出“视觉焦点是什么”，否则不通过
- 装饰元素必须来自主题资产清单，不允许临时生成填充
