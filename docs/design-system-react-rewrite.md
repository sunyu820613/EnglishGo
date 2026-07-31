# EnglishGo React 重写 — 视觉设计系统与页面信息架构（M1）

状态：待评审 | 分支：`react-rewrite` | 撰写：frontend-designer
依据：`docs/phonetics-react-rewrite-scope.md`、`docs/architecture-react-rewrite.md`、`lib/core/theme/tokens.dart`、六主题 `KidThemeExtension` 实例
范围：仅覆盖 M1（字母学习 + Phonics + 项目导航结构），音位总览/详情页只做信息架构骨架，不含 M2 动画视觉细节。
本文档不创建 npm 项目、不写 React 组件代码，implementer 阶段据此实现。

---

## 1. 设计 Token 体系

### 1.1 命名原则

CSS 自定义属性统一挂在 `:root`，主题相关角色由 `:root[data-theme="xxx"]` 覆盖。结构性 token（间距/圆角/阴影语义/触控/字体/动效/层级）**六主题共享，不随主题变化**；颜色角色 token 随主题变化。命名格式：`--<domain>-<step>`，domain 与 `tokens.dart` 的类名一一对应，避免 implementer 需要在 Dart 命名和 CSS 命名之间做心理翻译。

### 1.2 间距（4/8 网格）

| CSS 变量 | 值 | 对应 Dart |
|---|---|---|
| `--space-xs` | 8px | `Space.xs` |
| `--space-sm` | 12px | `Space.sm` |
| `--space-md` | 16px | `Space.md` |
| `--space-lg` | 24px | `Space.lg` |
| `--space-xl` | 32px | `Space.xl` |
| `--space-xxl` | 48px | `Space.xxl` |
| `--space-page-mobile` | 24px | `Space.pageMobile` |
| `--space-page-tablet` | 40px | 原 `Space.pageTablet`(48px) 基础上按 Web 三档断点重新分配，见 §5 |
| `--space-page-desktop` | 64px | Web 新增（原项目无此档），桌面页面外边距，配合内容区 `max-width` 容器防止行长过长 |

### 1.3 圆角

| CSS 变量 | 值 |
|---|---|
| `--radius-sm` | 16px |
| `--radius-md` | 24px |
| `--radius-lg` | 32px |
| `--radius-xl` | 44px |
| `--radius-full` | 999px |

### 1.4 阴影（Soft-Clay 双层，色调来自主题 `--color-shadow`）

不直接写死颜色值，用 `color-mix()` 以 `--color-shadow` 为基底调不透明度，保证换主题时阴影色自动跟随：

| CSS 变量 | 定义 |
|---|---|
| `--shadow-rest` | `0 6px 18px color-mix(in srgb, var(--color-shadow) 22%, transparent)` |
| `--shadow-rest-highlight` | `0 -2px 6px rgb(255 255 255 / 35%)`（仅浅色主题使用，见 `--is-light` 判定） |
| `--shadow-raised` | `0 10px 28px color-mix(in srgb, var(--color-shadow) 28%, transparent)` |
| `--shadow-pressed` | `0 2px 8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` |

浅色主题（Dino/Robot/Ballet Castle/Dessert）叠加 `--shadow-rest-highlight`；深色主题（Starlight/Moon Garden）只用 `--shadow-rest`，不叠加高光层——通过每个主题 CSS 块里是否声明 `--shadow-rest-highlight: none` 控制，组件层无需 if/else 分支。

桌面 hover 态复用 `--shadow-raised` + `translateY(-2px)`，不新增第四层阴影语义。

### 1.5 触控尺寸

| CSS 变量 | 值 |
|---|---|
| `--touch-min` | 48px |
| `--touch-kid` | 64px |
| `--touch-primary` | 88px |
| `--touch-gap` | 12px |

### 1.6 字体族与字重

| CSS 变量 | 字族 | 用途 |
|---|---|---|
| `--font-display` | `'Baloo 2', system-ui, sans-serif` | 字母 Hero、页面标题、按钮文字 |
| `--font-body` | `'Nunito', system-ui, sans-serif` | 说明文字、导航标签、UI 控件文案 |
| `--font-teaching` | `'Andika', system-ui, sans-serif` | 仅用于"被朗读/被认读"的单词文本（WordCard 文字、拼读展示） |

### 1.7 字号阶（统一用 `rem`，基准 `html { font-size: 100%; }` = 16px）

| CSS 变量 | rem / px | 对应 Dart |
|---|---|---|
| `--text-letter-hero` | `clamp(4.5rem, 6vw + 2rem, 7.5rem)` / 最大 120px | `TypeScale.letterHero` |
| `--text-display` | `2.5rem` / 40px | `TypeScale.display` |
| `--text-title` | `1.75rem` / 28px | `TypeScale.title` |
| `--text-body` | `1.125rem` / 18px | `TypeScale.body` |
| `--text-caption` | `0.875rem` / 14px | `TypeScale.caption` |
| `--text-nav` | `1rem` / 16px | Web 新增：导航标签/次级按钮文案，原项目无此专用阶 |

`--text-letter-hero` 是全 token 体系中唯一使用 `clamp()` 的一档（仅字母 Hero 这一处需要在极窄手机竖屏与桌面大屏之间流式过渡），其余字号阶固定不做 fluid typography，避免可预测性下降。选用 `rem` 而非 `px` 是为了让浏览器/操作系统级字体缩放（用户无障碍设置）正确生效，直接规避原 Flutter 版"200% 文字缩放导致 RewardsPage 溢出"同类问题在 Web 端复现。

### 1.8 动效时长与缓动

| CSS 变量 | 值 | 对应 Dart Curve（近似换算） |
|---|---|---|
| `--duration-press` | 120ms | — |
| `--duration-micro` | 220ms | — |
| `--duration-standard` | 320ms | — |
| `--duration-page` | 420ms | — |
| `--duration-celebrate` | 800ms | — |
| `--duration-idle` | 2400ms | — |
| `--ease-press` | `cubic-bezier(0, 0, 0.58, 1)` | `Curves.easeOut` |
| `--ease-micro` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `Curves.easeOutBack` |
| `--ease-standard` | `cubic-bezier(0.33, 1, 0.68, 1)` | `Curves.easeOutCubic` |
| `--ease-page` | `cubic-bezier(0.65, 0, 0.35, 1)` | `Curves.easeInOutCubic` |
| `--ease-celebrate` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `Curves.bounceOut` 的单段近似，真实弹跳需多段 `@keyframes`，implementer 若做庆祝动效需手写 keyframes，不能只靠这个变量 |
| `--ease-idle` | `cubic-bezier(0.37, 0, 0.63, 1)` | `Curves.easeInOutSine` |

所有使用上述变量的 `transition`/`animation` 必须包裹在 `@media (prefers-reduced-motion: no-preference)` 内；`reduce` 分支降级为瞬时切换或仅保留 `opacity` 过渡（不能完全去除导致状态跳变生硬）。

### 1.9 其他

| CSS 变量 | 值 |
|---|---|
| `--stroke-width` | 2.5px（线性图标描边） |
| `--z-background` | 0 |
| `--z-decoration` | 1 |
| `--z-content` | 2 |
| `--z-character` | 3 |
| `--z-overlay` | 4 |
| `--z-dialog` | 5 |
| `--focus-ring-width` | 3px（对应 DESIGN.md "focus 3dp 焦点环"） |
| `--focus-ring-offset` | 2px |

### 1.10 六主题颜色角色覆盖表

14 个语义角色全部实现为 CSS 变量，值取自现有 `KidThemeExtension` 实例（未做改动，直接迁移）：

| CSS 变量 | Starlight | Dino | Robot | Moon Garden | Ballet Castle | Dessert |
|---|---|---|---|---|---|---|
| `--color-background` | `#1C2A4A` | `#F5EFDE` | `#EDF0F5` | `#2B2144` | `#FAF6F2` | `#FBF4EA` |
| `--color-surface` | `#28395E` | `#FDFAF0` | `#FBFCFE` | `#3A2E58` | `#FFFDFB` | `#FFFCF6` |
| `--color-surface-alt` | `#22314F` | `#EDE4CC` | `#E1E6EE` | `#332950` | `#F3EAE3` | `#F3E7D7` |
| `--color-primary` | `#53C7DE` | `#4A7C59` | `#2F5DD0` | `#A8C4A2` | `#E793A9` | `#E8836F` |
| `--color-on-primary` | `#0E2038` | `#F7FBF2` | `#F4F8FF` | `#1F2B1E` | `#47202B` | `#4B1F16` |
| `--color-secondary` | `#3D5480` | `#C9A87C` | `#8E99AB` | `#584A7E` | `#D9C3A5` | `#8FC9B5` |
| `--color-on-secondary` | `#EAF3FB` | `#33291A` | `#1D232E` | `#F0EAF8` | `#3D3221` | `#1F3A30` |
| `--color-accent` | `#F6C05C` | `#E8A33D` | `#F2762E` | `#E8A98F` | `#C9A227` | `#B5714F` |
| `--color-text` | `#F2F6FC` | `#332E24` | `#272D38` | `#F4EFFA` | `#4A3D42` | `#3E3129` |
| `--color-text-soft` | `#AFC0DC` | `#6E6551` | `#5C6675` | `#BDB0D6` | `#8A7880` | `#77655A` |
| `--color-outline` | `#122038` | `#4A4234` | `#39404D` | `#1D1733` | `#5C4A50` | `#4A3A30` |
| `--color-shadow` | `#0B1830` | `#8A7A57` | `#7C8AA4` | `#170F2E` | `#C9A9A0` | `#C29B7B` |
| `--color-success` | `#7FD8A4` | `#5FA671` | `#3FA96E` | `#9AD6A8` | `#7CBC93` | `#6FBF8E` |
| `--color-focus` | `#F6C05C` | `#E8A33D` | `#F2762E` | `#E8A98F` | `#C9A227` | `#B5714F` |

浅/深色判定：`--is-light` 由 implementer 在每个主题块里显式声明为 `1`/`0`（Starlight、Moon Garden 为 `0`，其余为 `1`），驱动 `--shadow-rest-highlight` 是否生效，不依赖 JS 运行时算亮度（保持与 Dart `isLight` getter 语义一致，但换成 CSS 声明式实现，避免 Web 端额外算色逻辑）。

---

## 2. 字体方案

**红线：必须自托管字体文件，不使用 Google Fonts 或任何外部 CDN link**（原始规范红线 + 儿童隐私政策已禁止第三方外链请求）。

### 2.1 来源与转换

现有 `assets/fonts/` 已包含：
- `Baloo2/Baloo2-VariableFont_wght.ttf`（可变字体，wght 轴）
- `Nunito/Nunito-VariableFont_wght.ttf`（可变字体，wght 轴）
- `Andika/Andika-Regular.ttf`、`Andika/Andika-Bold.ttf`（仅两个静态字重，无可变轴）

迁移动作（implementer 执行）：用 `fonttools`/`woff2_compress` 将上述 4 个 `.ttf` 转为 `.woff2`，落位 `public/fonts/{family}/`，作为唯一格式（不额外提供 `.woff`/`.ttf` 兜底——目标浏览器矩阵为现代移动/桌面浏览器，woff2 兼容性已足够，不为极老浏览器增加体积负担）。

### 2.2 `@font-face` 声明要点

```css
@font-face {
  font-family: 'Baloo 2';
  src: url('/fonts/baloo2/Baloo2-VariableFont_wght.woff2') format('woff2-variations');
  font-weight: 500 800; /* 可变轴范围 */
  font-display: swap;
}
@font-face {
  font-family: 'Nunito';
  src: url('/fonts/nunito/Nunito-VariableFont_wght.woff2') format('woff2-variations');
  font-weight: 400 800;
  font-display: swap;
}
@font-face {
  font-family: 'Andika';
  src: url('/fonts/andika/Andika-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Andika';
  src: url('/fonts/andika/Andika-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

`font-display: swap` 允许文字先用系统字体渲染再替换，避免首屏白屏，符合"字母学习是核心首屏内容不能被字体加载阻塞"的诉求。字母学习页可对 `--font-display` 字重 700（Hero 用）加 `<link rel="preload" as="font">`，其余页面不预加载。

### 2.3 字重与用途映射

| 字族 | 字重 | 用途 |
|---|---|---|
| Baloo 2 | 700–800 | 字母 Hero、页面主标题 |
| Baloo 2 | 600 | 按钮文字、次级标题 |
| Nunito | 700 | 强调说明文字、卡片标题 |
| Nunito | 400–600 | 正文说明、导航标签、辅助文案 |
| Andika | 400 | 单词正文（默认） |
| Andika | 700 | 单词正文中需要强调的字母/音节（如 Phonics 对比高亮） |

Andika 只有两个字重，不可用于展示级大标题（笔画设计是为初学识字优化的清晰度字体，不是展示字体），严格限制在"孩子要跟读/认读"的单词文本语境。

---

## 3. 核心页面信息架构

### 3.1 首页 / 导航入口 `/`

**用途**：品牌入口，进入学习模块，显示总体学习进度概览。

**关键区域**：
- 顶部条：App 品牌字（Baloo 2）+ 右侧主题切换入口图标 + 男女声全局偏好开关（小型 toggle，持久化到 `settingsStore`）
- 主视觉区：当前主题吉祥物 + 一句欢迎语（Nunito）
- 两个主入口大卡片：「Learn the Alphabet」「Phonics」，卡片内含图标+一句说明，Phonics 卡片同时承载"进入音位总览骨架页"入口
- 底部小型进度条：已学习字母数 / 26（纯展示，非评分/排行榜性质）

**响应式**：手机单列纵向堆叠两张入口卡片；平板双列横排，间距加大到 `--space-page-tablet`；桌面用 `max-width: 1040px` 居中容器，吉祥物与两张卡片可并排三栏，避免超宽屏幕下内容被拉得过散。

### 3.2 字母学习总览 `/alphabet`

**用途**：26 字母地图，进入单字母学习页。

**关键区域**：顶部返回+标题、进度概览（已学 x/26）、26 格网格（每格：大字母 + 已学/未学视觉区分，未学不做"锁定"式惩罚展示，只是弱化色调，不阻止点击——学习顺序不强制线性）。

**响应式**：手机 4 列网格；平板 6 列；桌面 8 列，网格整体 `max-width` 居中，避免视线跨度过宽导致扫视困难。

### 3.3 单个字母学习页 `/alphabet/:letter`

**用途**：核心学习单元——字母名读音、拼读音（含 IPA）、男女声切换、2 个例词发音+插画。

**关键区域**：
- 字母 Hero（`--text-letter-hero`）+ 字母名 SoundButton
- 拼读音 SoundButton + IPA 符号展示（Andika 字体）
- 男/女声切换 Toggle（切换后两个 SoundButton 均使用新声线，不需要为每个声线单独放按钮）
- 2 个 WordCard 横排（插画 1:1 + 单词 Andika 字体 + 点击播放例词发音）
- 上一字母 / 下一字母导航（不强制线性学习顺序，仅为方便连续学习）

**响应式**：手机——Hero 居中在上，2 个 WordCard 纵向堆叠；平板——Hero 固定左侧，右侧内容纵向排列，2 个 WordCard 并排；桌面——三栏布局（上一字母导航 | 内容居中定宽 | 下一字母导航），WordCard 保持并排，整体 `max-width` 容器防止 Hero 字号在超宽屏被过度拉伸。

### 3.4 主题选择页 `/themes`

**用途**：六主题预览与切换。

**关键区域**：当前主题大预览（背景色+吉祥物）、六宫格主题缩略卡（色板小样+吉祥物缩略图+主题名），选中态用 `--color-focus` 描边+勾选角标（非评分/星级形式）。

**响应式**：手机 2 列缩略卡；平板 3 列；桌面 3 列但整体 `max-width` 居中，缩略卡尺寸放大，避免大屏下卡片显得孤立分散。

### 3.5 音位总览页骨架 `/phonemes`（M2 铺垫，M1 只做信息架构）

**用途**：47 个音位按 6 个语言学分类分组展示（元音 10 / 双元音 5 / 儿化元音 6 / 清辅音 8 / 浊辅音 8 / 其余辅音 10），点击进入详情骨架页。

**关键区域**：6 个分类分区块（每区块标题+该类音位 IPA 符号 chip 网格）；M1 阶段每个 chip 仍可点击进入详情骨架页，但页面顶部有"内容制作中"的温和提示条，不做成 404/禁用态。

**响应式**：手机每个分类内 chip 3-4 列换行网格；平板 5-6 列；桌面按分类分区块横向排列，chip 网格 8-10 列，分区块之间用 `--space-xxl` 分隔以维持分类可读性。

### 3.6 音位详情页骨架 `/phonemes/:slug`（M2 铺垫，M1 只做信息架构）

**用途**：单音位学习单元的页面框架，为 M2 动画接入预留结构位。

**关键区域（骨架）**：
- 顶部：IPA 大符号 + 分类标签
- 音频控制区：男/女声、正常/慢速切换 UI 框架——M1 数据只有 1 条（neutral/normal），其余选项显式置灰 disabled 并非隐藏，让用户理解"未来会有更多选项"而非误以为功能缺失
- 双动画视图区：正面嘴型 + 侧面口腔剖面两个画布占位框，M1 显示"动画即将上线"占位插画（非错误态）
- 例词区：复用 WordCard 组件横排展示
- 对立音对区：M1 无数据时整块隐藏（不显示空标题），避免视觉噪音

**响应式**：手机纵向堆叠（符号 → 音频控制 → 动画占位×2 → 例词 → 对立音对）；平板双动画视图并排（2 列），其余保持纵向；桌面左右两栏布局——左栏放符号+音频控制+例词，右栏放双动画视图（并排或纵向堆叠，由 M2 实际动画宽高比决定），整体 `max-width` 居中容器。

---

## 4. 组件规范

### 4.1 按钮（对标 `KidButton`）

- 视觉权重三级：primary（`--color-primary` 底）/ secondary（`--color-secondary` 底）/ ghost（透明底+描边）
- 尺寸：`--touch-min`(48px 次要操作) / `--touch-kid`(64px 常规儿童操作) / `--touch-primary`(88px 页面主操作)
- 圆角：`--radius-md`
- 阴影：rest 用 `--shadow-rest`，桌面 hover 用 `--shadow-raised` + `translateY(-2px)`，pressed 用 `--shadow-pressed` + `scale(0.96)` + `--duration-press`
- disabled：不透明度降至约 45%，去除阴影，`cursor: not-allowed`，**不使用红色**表达禁用，仅靠降低饱和度/透明度
- focus-visible：`outline: var(--focus-ring-width) solid var(--color-focus)` + `outline-offset: var(--focus-ring-offset)`（键盘用户可见，鼠标点击不触发）

### 4.2 卡片（对标 `WordCard` / 通用内容卡）

- 圆角：常规卡 `--radius-md`，大容器/详情区块 `--radius-lg`
- 插画区：1:1 方形画幅，主体占比约 70%，留白 ≥15%（继承 DESIGN.md 既有规则，不新增标准）
- 阴影：rest 用 `--shadow-rest`（浅色主题叠加 `--shadow-rest-highlight`）
- 点击反馈：`scale(1.1)` 短促回弹（`--duration-micro` + `--ease-micro`），同时触发音频播放
- 桌面 hover：`--shadow-raised` + `scale(1.02)`，仅在 `@media (hover: hover) and (pointer: fine)` 下生效
- focus-visible：同按钮焦点环规则

### 4.3 音频播放控件（对标 `SoundButton`）

- 形态：圆形，默认尺寸 `--touch-kid`（64px），页面主发音按钮可用 `--touch-primary`
- 图标：线性图标（volume/play），描边宽度 `--stroke-width`
- 播放中状态：外圈脉动光环（`--duration-idle` + `--ease-idle` 循环），`prefers-reduced-motion: reduce` 时降级为静态高亮描边，不播放脉动动画
- rest / hover（桌面：轻微阴影提升，规则同卡片 hover）/ pressed（`scale(0.96)`）/ disabled（灰态，用于 M1 音位骨架页无对应音频变体时，禁止隐藏按钮，必须可见但不可点，配合 tooltip 说明"暂无此声线"）

### 4.4 主题切换器（六宫格组件）

- 每张缩略卡：主题主色色块（`--color-primary` 取样）+ 吉祥物缩略图 + 主题名（`--font-body`）
- 圆角：`--radius-lg`
- 触控区域：整卡可点，高度 ≥ `--touch-kid`
- 选中态：`--focus-ring-width` 描边（`--color-focus`）+ 右上角勾选角标（图形化对勾，非评分星级/百分比）
- 桌面 hover：`--shadow-raised` + `scale(1.03)`

---

## 5. 三档响应式断点定义

| 断点名 | 像素范围 | 布局差异要点 |
|---|---|---|
| 手机 | `< 768px` | 单列堆叠为主；页面外边距 `--space-page-mobile`(24px)；主操作按钮贯穿宽度或居中单个；卡片网格列数取较小值（如字母总览 4 列） |
| 平板 | `768px – 1199px` | 双列/多列网格出现；页面外边距 `--space-page-tablet`(40px)；内容不强制居中定宽（平板浏览器窗口通常接近内容宽度）；部分页面出现左右分栏（如字母详情页 Hero 固定+内容区） |
| 桌面 | `≥ 1200px` | 页面外边距 `--space-page-desktop`(64px)；核心内容区加 `max-width`（如 1040px–1200px，视页面而定）居中，避免行长/网格跨度过大；新增 hover 态全面生效（`@media (hover: hover) and (pointer: fine)` 判定，不单纯按断点判断，避免触屏笔记本误判） |

断点判定统一用 `min-width` 媒介查询（移动优先书写顺序：基础样式覆盖手机，逐步用 `min-width: 768px` / `min-width: 1200px` 覆盖），断点边界（767/768px、1199/1200px）必须实测确认组件无跳变错位（尤其字母详情页的分栏切换与音位详情页的双栏切换）。

---

## 6. 反 AI 模板感检查清单

1. **禁止紫色/蓝紫渐变作主背景或按钮底色**——任何新增渐变必须先在本文档登记为 token 才能使用；当前六主题背景均为纯色或极轻微同色系过渡，不引入跨色相渐变。
2. **禁止玻璃拟态（`backdrop-filter: blur` + 半透明白边框）**——层次感一律靠 §1.4 双层软陶土阴影 + 主题色块表达，卡片/导航不得叠加毛玻璃效果。
3. **禁止用 Emoji 充当核心图形或功能图标**（如用 🔤🎯⭐ 代替真实插画/图标）——按钮/导航图标必须是 `--stroke-width` 线性描边图标或主题定制插画；Emoji 仅允许出现在非语义承载的纯装饰边角，且需谨慎使用。
4. **禁止无意义粒子/星光铺屏动画背景**——装饰元素必须来自各主题既有资产清单（`theme_assets`），不得为营造"科技感/梦幻感"临时用 CSS 生成通用粒子效果。
5. **禁止原生控件裸用**——`<select>`、无样式 `<input type="range">`、任何 UI 库默认按钮/卡片样式，一律按 §4 组件规范定制外观，不得保留浏览器默认视觉。
6. **每个页面必须能一句话说清视觉焦点**——如字母页焦点是 Hero 字母、音位总览页焦点是分类网格；若同一页面出现两个以上同等视觉权重的强调区域，视为设计失败需返工。
7. **禁止插画/图标风格混搭**——3D 渲染贴图与手绘扁平混用、不同描边粗细混用，均不允许；新页面的插画气质必须与既有六主题资产基线保持一致。
8. **禁止空状态/错误状态使用红色叉号、感叹号三角、倒计时类图形语言**——延续 CLAUDE.md 红线，一律用主题吉祥物 + 温和文案 + 可执行的下一步按钮呈现（参考 §"状态设计"）。

---

## 状态设计

- **空状态**：M1 音位骨架页无内容时，展示主题吉祥物 + "Phonics sounds are coming soon — let's learn some letters first!" 式温和文案 + 一个返回字母学习的 CTA 按钮；不使用错误图标/感叹号。
- **加载中**：字体/图片资源加载期间用骨架屏（轻微呼吸透明度动效，`reduced-motion` 时降级为纯灰底静态），音频请求中的 SoundButton 显示小型 loading 指示，但不缩小其触控区域。
- **错误状态**：图片/音频 404 时按架构文档"静默降级"规则，不弹错误弹窗；UI 侧退回主题默认插画占位，按钮切换为 disabled 灰态并附小提示"暂时听不到声音哦"，不使用红色/警报图标。
- **同步中**：本项目为纯本地 `localStorage` 持久化，无云同步，不存在"同步中"状态；不需要为此设计过渡态 UI。
- **冲突状态**：无账户体系，不存在多端/多用户数据冲突。唯一相关场景是"切换主题时是否打断正在播放的语音"——规则：切换主题只切换视觉变量，不中断正在播放的音频，避免打断儿童正在进行的听觉学习动作。

---

## 给 implementer 的实现要求

1. 所有颜色/间距/圆角/阴影/字体/动效数值必须使用 §1 定义的 CSS 变量；出现本文档未覆盖的一次性数值时，先回来扩充 token，不得在组件样式中硬编码色值/px 数值绕过。
2. 六主题切换只通过根元素 `data-theme` 属性覆盖 CSS 变量实现；组件树内不得出现"if 当前主题 == xxx"式条件分支样式。
3. 字体必须自托管在 `public/fonts/`，不得引入 Google Fonts 等外部 CDN link；四个字体文件需从现有 `.ttf` 转换为 `.woff2`，`@font-face` 使用 `font-display: swap`。
4. 字号阶统一使用 `rem`，不使用 `px`，保证浏览器/操作系统字体缩放正确生效，规避原 Flutter 版 200% 文字缩放溢出问题在 Web 端重演。
5. 三档断点严格按 §5 定义（`<768px` / `768–1199px` / `≥1200px`），断点边界必须实测无跳变错位。
6. 桌面 hover 态必须包裹在 `@media (hover: hover) and (pointer: fine)` 内，避免触屏设备出现"点击后 hover 态卡住不消失"的常见 bug。
7. 所有可点击元素触控目标 ≥48px，且必须是真实可点击区域（`min-width`/`min-height`），不能靠 `padding` 凑；儿童主操作/播放类按钮 ≥64px。
8. M1 阶段音位总览/详情骨架页必须用"内容制作中"式空状态呈现，不得用 404/error page 模式，不得阻断用户返回导航。
9. `prefers-reduced-motion: reduce` 必须让所有关键帧/过渡降级为瞬时切换或仅保留 `opacity` 过渡，不能简单粗暴地完全移除动效导致状态跳变生硬。
10. 六主题颜色值直接采用 §1.10 表格数值迁移，不得在 Web 端重新调色或"优化"色板——视觉一致性是六主题系统存在的前提。

---

## 总结

本文档将 `tokens.dart` 的间距/圆角/阴影/字体/字号/动效体系 1:1 转译为 CSS 变量，新增桌面 hover 态、`rem` 字号（规避文字缩放溢出）、三档响应式断点（<768/768–1199/≥1200px）。六主题 14 色角色表直接沿用现有 Flutter 数值，字体自托管禁用 CDN。字母学习/字母详情/主题选择三页给出完整 IA 与响应式布局；音位总览/详情页仅做骨架，M1 用"内容制作中"温和空状态承接，不阻断导航。附 8 条可核查反 AI 模板感规则供后续审查使用。
