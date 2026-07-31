# EnglishGo React 重写 — M1 技术架构方案

状态：待评审 | 分支：`react-rewrite` | 依据：`docs/phonetics-react-rewrite-scope.md`（2026-07-31）
撰写：architect | 本文档不涉及任何实际写入 `lib/`、`pubspec.yaml` 或 npm 项目初始化操作

---

## 架构目标

1. 在同一个仓库（`react-rewrite` 分支）内落地一个纯前端 React + TS + Vite 项目，且不能出现"Flutter 项目和 React 项目并存、需要分别启动"的双头局面。
2. 定义可支撑 M1（字母学习+Phonics）并且能被 M2/M3（47 音位 + 动画 + 男女声/慢速矩阵）无痛扩展的数据模型与目录结构，避免 M1 做完后 M2 要推倒重来。
3. 现在就把 M2 最大技术风险——参数化 SVG 嘴型/口腔剖面 rig 的数据 schema 与音画同步机制——设计清楚并写死接口，即使 M1 不实现，也不允许后续里程碑随意改动这个契约。
4. 定义发音评分代理服务的最小 API 形状与部署方式，保证 Azure Key 不进前端。
5. 给出资产迁移（复制 + `.ogg→.m4a` 转码）的可执行方案。
6. 一切技术选型服从"能简单实现的不设复杂框架"，不引入本阶段用不上的依赖（如 Redux、Tailwind、Storybook、Capacitor）。

---

## 推荐方案

### 1. 仓库内新项目落位方案

**结论：新 Vite 项目落在仓库根目录，不新建 `web/` 子目录；旧 Flutter 项目结构从 `react-rewrite` 分支的工作区中移除（历史仍完整保留在 `main` 分支 `e7c13c2`）。**

理由：
- 用户已明确"`main` 分支仅作历史存档，不再并行维护，后续开发全部在 `react-rewrite` 进行"（scope 文档 §6.5）。既然旧项目不再并行开发，就没有理由在工作区里继续保留一份不会再被启动的 Flutter 骨架——那样会造成"两个项目挤在一个仓库、IDE 索引两套依赖、CI 配置暧昧"的长期维护负担，与规则"避免出现两个需要分别启动的项目"直接冲突。
- 若改用 `web/` 子目录方案，代价是多一层路径间接（`cd web && npm run dev`），且仓库根目录仍残留 `pubspec.yaml`/`android/`/`ios/` 等文件，视觉上仍是"两个项目"，没有解决根本问题，只是从"必须分别启动"降级为"容易被误解成需要分别启动"，不划算。根目录方案更简单，符合"简单优先"。
- Vercel/Cloudflare 等静态托管平台默认按仓库根目录识别 `package.json` 构建，根目录布局也让后续 `api/` serverless 目录（M4 用）天然生效，无需额外配置 `root`/`monorepo` 选项。

**执行顺序（implementer 阶段执行，architect 本次不动手）：**

1. 确认 `react-rewrite` 分支已包含 scope 文档，且 `main` 分支在 `e7c13c2` 的状态已作为可回溯存档（`git log main` 可查）。
2. 在 `react-rewrite` 分支删除以下 Flutter 专属路径：
   `lib/`、`android/`、`ios/`、`test/`、`integration_test/`（如有）、`macos/`、`linux/`、`windows/`（如有）、`pubspec.yaml`、`pubspec.lock`、`analysis_options.yaml`、`.metadata`、`build/`（构建产物，理论上不应被提交，清理时一并从 git 移除并补 `.gitignore`）。
   **保留**：`docs/`、`CLAUDE.md`、`AGENTS.md`、`.git*`、`assets/`（作为迁移脚本的原始数据源，见第 6 节，迁移完成并校验无误后再删除）。
3. 在仓库根目录执行：
   ```bash
   npm create vite@latest . -- --template react-ts
   ```
   （在已有 `docs/`、`assets/` 等非空目录中初始化，Vite 支持在非空目录下用 `.` 初始化，会提示确认，属预期行为。）
4. 补装依赖（见第 2 节技术选型），跑通 `npm run dev`。
5. `assets/` 内容经迁移脚本复制/转码进 `public/` 并校验完整后，删除根目录 `assets/`（历史版本仍可从 `main` 分支取回，不丢失）。

**目标目录结构（M1 完成后）：**

```
EnglishGo/                          # 仓库根目录 = Vite 项目根目录
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.cjs (或 eslint.config.js，视 ESLint 版本)
├── .env.example                    # 记录需要哪些环境变量，不含真实密钥
├── api/                            # Vercel serverless functions，M4 才有内容
│   └── pronunciation-assessment.ts
├── public/
│   ├── audio/
│   │   ├── letters/                # {x}_name.m4a, {x}_phonics.m4a
│   │   │   ├── male/                # letter_{x}_male.m4a（转码后）
│   │   │   └── female/
│   │   ├── words/
│   │   ├── phrases/
│   │   ├── phonemes/                # 47 个 .wav（M1 过渡，M2/M3 扩充矩阵）
│   │   └── example_words/
│   └── images/
│       └── words/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   └── router.tsx
│   ├── theme/
│   │   ├── tokens.css
│   │   ├── themes/
│   │   │   ├── starlight.css
│   │   │   ├── dino.css
│   │   │   ├── robot.css
│   │   │   ├── moon-garden.css
│   │   │   ├── ballet-castle.css
│   │   │   └── dessert.css
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   ├── audio/
│   │   ├── AudioService.ts
│   │   └── useAudioService.ts
│   ├── data/
│   │   ├── alphabet.ts
│   │   ├── alphabet.types.ts
│   │   ├── phonemeAudioSlugs.ts
│   │   ├── phonemeExampleWords.ts
│   │   └── phonemes.types.ts
│   ├── features/
│   │   ├── alphabet/
│   │   ├── phonics/
│   │   └── progress/
│   ├── store/
│   │   ├── progressStore.ts
│   │   └── settingsStore.ts
│   ├── components/
│   │   ├── KidButton.tsx
│   │   ├── SoundButton.tsx
│   │   ├── WordCard.tsx
│   │   └── ...
│   └── test/
│       └── setup.ts
├── tests/
│   └── e2e/
│       └── alphabet.spec.ts
├── scripts/
│   └── migrate-assets.mjs
├── docs/                           # 保留，含本文档及既有产品文档
├── CLAUDE.md
├── AGENTS.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

### 2. 技术选型

| 领域 | 选择 | 理由 |
|---|---|---|
| 状态管理 | **Zustand** | 相比 Context+useReducer：避免"进度/设置/音频播放状态"这类高频变化值通过 Context 触发大范围重渲染；相比 Redux Toolkit：本项目状态面很小（主题 id、进度、设置、当前播放状态），不需要中间件生态和 DevTools 时间旅行这类重量级能力。Zustand 的 store 可在 React 树外被 `AudioService` 等纯 TS 类直接读写，天然适合"音频服务是单例、但要驱动 UI 高亮"的场景，且自带 `persist` 中间件可直接对接 `localStorage`，与 Flutter 版 `shared_preferences` 语义对齐。体积 ~1KB，不构成依赖负担。 |
| 路由 | **React Router v6**（`createBrowserRouter` + `RouterProvider`） | 声明式路由树对齐现有 `go_router` 心智模型，implementer 迁移路由结构时认知成本低。M1-M3 无需网络数据加载，`loader`/`action` 特性可以不用，避免过度设计；路由文件保持"纯路径→组件映射"的最简形态。 |
| 样式方案 | **CSS 自定义属性（CSS Variables）+ CSS Modules**，主题切换用根元素 `data-theme` 属性 | `tokens.dart` 本质是一组标量常数（间距/圆角/阴影/字号/时长），可以 1:1 映射为 CSS 变量，不需要 Tailwind 的原子类生成层——本项目的"软陶土双层阴影"等定制视觉语言用工具类拼接反而啰嗦，直接写语义化 CSS 更贴近原设计语言。CSS Modules 是 Vite 内置能力，零额外依赖，解决类名冲突问题。六主题通过 `:root[data-theme="dino"] { --color-primary: ...; }` 覆盖变量实现瞬时切换，无需重新渲染 React 树，性能优于对每个主题维护一份 JS 主题对象再用 CSS-in-JS 库下发。 |
| 音频播放 | **原生 `HTMLAudioElement`**（不用 Web Audio API 的 `AudioContext` 图，除非未来需要音频可视化/混音） | 三通道模型（voice/sfx/bgm）本质是"独立播放、独立音量控制、互不干扰"，`<audio>` 元素的 `play()/pause()/volume/currentTime` 已完全满足；`AudioContext` 图（GainNode 等）能做的音量渐变本项目用不到（原 Dart 实现也是直接 `setVolume`，非渐变）。三个 `HTMLAudioElement` 实例分别对应 voice/sfx/bgm，接口设计见下方"数据流"章节。 |
| 测试 | **Vitest**（单元/组件测试）+ **Playwright**（端到端） | Vitest 与 Vite 共享配置和转换管线，无需额外配置 Babel/webpack；Playwright 覆盖"移动端/平板视口无溢出""音频打断不重叠""主题切换后进度不丢"等验收标准中明确要求端到端验证的项。两者职责不重叠：Vitest 测纯逻辑（AudioService 规则、数据映射函数），Playwright 测关键用户路径。 |

**测试文件落位与 CI：**

- 单元测试与被测文件同目录，命名 `*.test.ts(x)`（如 `src/audio/AudioService.test.ts`）。
- 端到端测试统一在 `tests/e2e/`，用 Playwright 的 `webServer` 配置自动拉起 `npm run preview`。
- `package.json` 脚本：`dev` / `build` / `preview` / `typecheck`（`tsc --noEmit`）/ `lint`（eslint）/ `test`（vitest run）/ `test:e2e`（playwright test）。
- CI（`.github/workflows/ci.yml`）串行执行：`install → typecheck → lint → test → build → test:e2e`，任一步失败即红。对标 `CLAUDE.md` 中"flutter analyze 零错/flutter test 全过"的等价物是"tsc 零错/eslint 零错/vitest 全过"。

---

### 3. 音频服务接口设计（三通道规则移植）

```ts
// src/audio/AudioService.ts
export type AudioChannel = 'voice' | 'sfx' | 'bgm';

export class AudioService {
  private voice = new Audio();
  private sfx = new Audio();
  private bgm = new Audio();
  private bgmEnabled = true;
  private bgmBaseVolume = 1.0;

  /** 播放语音，自动打断上一条语音；播放期间 BGM 闪避到 20% 音量。*/
  async playVoice(src: string): Promise<void> { /* stop current voice → set src → duck bgm → play → on end/error restore bgm */ }

  /** 播放音效，不触发闪避。*/
  async playSfx(src: string): Promise<void> { /* ... */ }

  stopVoice(): void { /* ... */ }
  stopAll(): void { /* ... */ }

  /** 设置/切换 BGM，传 null 停止。*/
  async setBgm(src: string | null): Promise<void> { /* ... */ }
  setBgmEnabled(enabled: boolean): void { /* ... */ }
}
```

- 静默降级：`play()` 失败（文件缺失/解码失败）一律 `console.warn`，不抛出到调用方、不弹错误 UI，对齐原 Dart 版"静默降级"红线。
- 单例：`src/audio/useAudioService.ts` 导出模块级单例（`const audioService = new AudioService()`），供组件与 Zustand store 共用同一实例，等价于原 Riverpod `Provider<AudioService>` 的单例语义。
- 已知平台约束：浏览器自动播放策略要求首次 `play()` 必须源自用户手势（本项目所有播放均由按钮点击触发，天然满足，无需特殊处理）。

---

### 4. IPA 音位数据模型

基于 scope 文档核实的真实数据：47 个音位（元音 10 + 双元音 5 + 儿化元音 6 + 清辅音 8 + 浊辅音 8 + 其余辅音 10），`phonemeAudioSlugs` 映射表与 `phonemeExampleWords` 数据表已存在，直接迁移为 TS 数据源，延续 ASCII slug 命名约定（规避 Web 端 IPA 字符 URL 编码坑，原项目已验证过）。

```ts
// src/data/phonemes.types.ts
export type PhonemeCategory =
  | 'vowel'              // 10
  | 'diphthong'          // 5
  | 'rColoredVowel'      // 6
  | 'voicelessConsonant' // 8
  | 'voicedConsonant'    // 8
  | 'otherConsonant';    // 10  合计 47

export interface WordExample {
  word: string;
  highlightStart: number;   // 高亮起始字符位置
  highlightLength: number;  // 高亮长度
  audioSlug: string;        // 对应 public/audio/example_words/{audioSlug}.m4a
}

export type VoiceGender = 'male' | 'female' | 'neutral';
export type PlaybackSpeed = 'normal' | 'slow';

export interface PhonemeAudioVariant {
  voice: VoiceGender;
  speed: PlaybackSpeed;
  src: string; // 相对 public/audio/phonemes/ 的路径
}

export interface PhonemeDefinition {
  ipa: string;                       // 如 'iː'
  slug: string;                      // 如 'i'（来自 phonemeAudioSlugs）
  category: PhonemeCategory;
  exampleWords: WordExample[];       // M1 迁移已有数据，≥1 条即可，M2+ 补足 ≥2 条
  audio: PhonemeAudioVariant[];      // M1: 仅 1 条 { voice: 'neutral', speed: 'normal' }；M2 起补齐 4 条矩阵
  minimalPairs?: string[];           // 对立音对，M3 内容，M1 留空
  animationRig?: PhonemeAnimationRig; // 见第 5 节，M1 为 undefined
}
```

```ts
// src/data/alphabet.types.ts
export interface AlphabetWordExample {
  id: string;
  text: string;
  audio: string;   // audio/words/{id}.m4a
  image: string;   // images/words/{id}.webp
  phrase: string;  // audio/phrases/{letter}_is_for_{id}.m4a
}

export interface AlphabetLetter {
  letter: string;              // 'A'..'Z'
  letterAudio: string;         // audio/letters/{x}_name.m4a（中性/默认）
  letterAudioMale?: string;    // audio/letters/male/letter_{x}_male.m4a（转码后）
  letterAudioFemale?: string;  // audio/letters/female/letter_{x}_female.m4a
  phonicsAudio: string;        // audio/letters/{x}_phonics.m4a（当前无男女分轨）
  phonicsIpa: string;          // 拼读音 IPA，已有数据
  letterNameIpa?: string;      // 字母名 IPA，新增字段，M1 允许为空（非阻塞）
  phonicsNote: string | null;
  words: [AlphabetWordExample, AlphabetWordExample];
}
```

**迁移方式**：`assets/data/alphabet.json` → `src/data/alphabet.ts`（`import raw from './alphabet.json'` + 类型断言，或直接手写 TS 字面量数组，二选一由 implementer 按数据量决定；`letterNameIpa` 字段先全部置 `undefined`，UI 对缺失值做优雅降级——不显示对比行，不报错）。`phoneme_audio_slugs.dart`/`phoneme_example_words.dart` 的映射逻辑原样迁移为 `phonemeAudioSlugs: Record<string, string>` 与 `phonemeExampleWords: Record<string, WordExample[]>` 两个常量导出，字段语义不变。

**音频缺失优先级说明（供组件读取音频变体时使用）**：
1. 优先请求用户设置中选择的 `voice`/`speed` 组合。
2. 若该组合不存在（M1 阶段 phonics/phonemes 音频只有 `neutral`+`normal`），回退到 `neutral`/`normal`。
3. 找不到任何匹配项时静默跳过播放（沿用 AudioService 静默降级规则），不阻塞其余 UI。

---

### 5. 参数化 SVG 发音动画数据 Schema（M2 前置设计，M1 不实现但接口锁定）

**设计目标**：一套 rig 参数序列同时驱动"正面嘴型"和"侧面口腔剖面"两个 SVG 视图，且能在男/女声、正常/慢速四种音频变体下复用同一份关键帧数据，不需要为每个变体单独绘制动画。

**核心思路：归一化时间轴 + 关键帧插值。** 关键帧的时间坐标 `t` 取值 `[0, 1]`，代表在"该音位音频片段"播放进度中的相对位置，而非绝对毫秒数。播放时用 `requestAnimationFrame` 轮询 `audioElement.currentTime / audioElement.duration` 得到当前归一化进度，在相邻两个关键帧之间做线性插值（数值参数直接 lerp，布尔类参数取最近关键帧值），驱动 SVG 属性更新。这样同一份 rig 数据无需关心某条具体音频文件的真实时长，男声 0.6 秒的 `/θ/` 和女声 0.8 秒的 `/θ/` 用同一组 `t∈[0,1]` 关键帧即可正确同步——这是比 Azure Viseme 时间戳方案更轻量、但足以满足"音频时间点触发动画状态"要求的机制。

**前提假设（需在资产制作规范中注明）**：音位录音需去除首尾静音（trim），保证 `t=0` 对应发音真正开始、`t=1` 对应发音真正结束；慢速版本假定为近似等比例时间拉伸（保留相对事件时序），这是一个可接受的近似，若 M3 实测发现慢速版本关键事件（如塞音爆破点）相对位置漂移明显，再引入"每变体独立关键帧"的 fallback（架构上预留 `PhonemeAnimationRig.perVariantOverrides` 字段，M1/M2 不使用）。

```ts
// src/data/phonemes.types.ts（续）

/** 正面嘴型视图参数，取值范围均为 [0,1]（除注明外）。*/
export interface FrontMouthPose {
  jawOpen: number;        // 下颌开合度
  lipRound: number;       // 唇部圆展（0=展唇，1=圆唇）
  lipSpread: number;      // 唇部横向拉伸
  lipCompression: number; // 唇部闭合压紧程度（塞音 /p/ /b/ 用）
  cornerPull: number;     // 嘴角上扬/后拉
  teethVisible: number;   // 牙齿可见度
  tonguePeek: number;     // 舌尖可见度（齿间音 /θ/ /ð/ 用）
}

/** 侧面口腔剖面视图参数。*/
export interface SideProfilePose {
  jawOpen: number;
  tongueTipHeight: number;    // 舌尖高度
  tongueTipAdvance: number;   // 舌尖前后位置（0=后，1=前）
  tongueBodyHeight: number;   // 舌面高度
  tongueBodyAdvance: number;  // 舌面前后位置
  tongueRootHeight: number;   // 舌根高度（/k/ /g/ /ŋ/ 用）
  velumOpen: number;          // 软腭开合（0=闭合口腔通道，1=打开鼻腔通道——鼻音用）
  lipRound: number;
  airflow: 'none' | 'continuous' | 'burst'; // 无气流 / 持续气流（擦音、鼻音）/ 爆破气流（塞音）
  voicing: boolean;           // 声带是否振动（浊音 true / 清音 false）
}

export interface PhonemeAnimationKeyframe {
  t: number; // 归一化时间 [0,1]
  front: Partial<FrontMouthPose>;
  side: Partial<SideProfilePose>;
}

export interface PhonemeAnimationRig {
  phonemeSlug: string;
  keyframes: PhonemeAnimationKeyframe[]; // 至少含 t=0 与 t=1 两帧
  loop?: boolean; // 元音类音位是否在到达 t=1 后循环回 t=0（用于"按住试听"场景，默认 false）
}
```

**音画同步执行器接口（M2 实现，M1 只需预留调用位）**：

```ts
// src/audio/usePhonemeAnimationSync.ts（M2 交付）
export function usePhonemeAnimationSync(
  audioEl: HTMLAudioElement | null,
  rig: PhonemeAnimationRig | undefined,
): { front: FrontMouthPose; side: SideProfilePose } // 每帧返回插值结果供 SVG 组件消费
```

**M2 需要新增的开发工具（简单方案，避免引入 Storybook 等重量依赖）**：在 `import.meta.env.DEV` 保护下的一个内部调试路由 `/dev/rig-preview`，直接复用正式的 SVG rig 渲染组件 + 一个滑块面板手动拖拽 `t`，用于内容制作者（无论是外包还是 AI 辅助）预览并调参关键帧，不新增独立工具链。

---

### 6. 发音评分后端接口设计

**推荐运行时：Vercel Serverless Function（Node runtime），落位 `api/pronunciation-assessment.ts`。**

理由：
- Vite 静态站点 + Vercel 是零配置组合，`api/` 目录下的文件自动成为 serverless function，前端 `fetch('/api/pronunciation-assessment')` 同源调用，无需额外配置 CORS 或单独部署流水线，符合"轻量代理"定位与"简单优先"原则。
- 只需用 `fetch` 直接调用 Azure Speech REST API（`POST https://{region}.stt.speech.microsoft.com/speech/recognition/...` + `Pronunciation-Assessment` header），不依赖 Azure Speech SDK 的 Node 原生绑定，因此即使未来想换成 Cloudflare Workers（Edge runtime，无 Node API）也可平滑迁移；当前先选 Vercel 是因为它对"偶发流量、无需高并发"的儿童教育类小应用运维成本最低（免费额度通常够用，Git push 即部署，无需管理容器/Worker 配置）。
- 若后续实测 Vercel Hobby 计划 10 秒函数超时不够用（正常 Azure 评分请求应在几秒内完成，风险低），再评估升级或迁移 Cloudflare Workers，不在 M1/M4 初版阻塞。

**最小 API 形状：**

```
POST /api/pronunciation-assessment
Content-Type: multipart/form-data

字段：
  audio: Blob (wav/webm, 用户录音)
  referenceText: string (期望朗读的单词/短语)
  phonemeSlug?: string (可选，用于按音位维度反馈，M4 增强用)

响应 200:
{
  "success": true,
  "scores": { "accuracy": number, "fluency": number, "completeness": number, "pronScore": number }
}

响应 200（Key 未配置/服务不可用，非报错，供前端展示"暂不可用"）:
{ "success": false, "reason": "unavailable" }

响应 4xx/5xx（真正的请求错误，如音频过大/格式非法）:
{ "success": false, "reason": "invalid-audio" | "server-error" }
```

**安全约束**：
- `SPEECH_KEY`、`SPEECH_REGION` 只作为 Vercel 项目环境变量存在，不写入任何提交到仓库的文件（`.env.example` 只列变量名，不含值）。
- function 内部校验音频大小上限（如 5MB）与超时（如 8 秒），防止被滥用刷 Azure 配额；儿童应用无登录体系，简单加一个基于来源 Referer/Origin 的白名单校验即可，不需要引入完整的鉴权体系（过度设计）。
- Azure 调用失败（网络错误/超时/Key 失效）一律返回 `{ success: false, reason: 'unavailable' }`，前端据此静默降级为"仅录音回放对比"，不崩溃、不报错弹窗，对齐 M4 验收标准第 3 条。

---

### 7. 资产迁移脚本方案

**脚本**：`scripts/migrate-assets.mjs`（Node，用 `fs/promises` + 系统 `ffmpeg`，通过 `ffmpeg-static` 或要求本机已装 `ffmpeg` 二选一，implementer 阶段决定）。

**流程**：
1. 直接复制（无需转码）：`assets/audio/letters/*.m4a`、`assets/audio/words/`、`assets/audio/phrases/`、`assets/audio/example_words/`、`assets/audio/phonemes/*.wav`（**排除** `_male_b_test.wav`/`_male_d_test.wav`/`_male_g_test.wav` 三个测试遗留文件）、`assets/images/words/*.webp` → 对应 `public/audio/...`、`public/images/...` 路径，文件名保持不变。
2. 转码：`assets/audio/letters/male/letter_{x}_male.ogg` 与 `female/letter_{x}_female.ogg`（各 26 个）→ ffmpeg 转 AAC `.m4a`，输出到 `public/audio/letters/male/letter_{x}_male.m4a` / `.../female/letter_{x}_female.m4a`。转码命令示例（脚本内以子进程调用）：
   ```
   ffmpeg -i input.ogg -c:a aac -b:a 96k output.m4a
   ```
3. 校验：脚本读取 `src/data/alphabet.ts`（或迁移后的 alphabet 数据）与 `phonemeAudioSlugs`/`phonemeExampleWords`，对每一条数据引用的音频/图片路径做存在性检查，任一缺失即 `exit(1)` 并打印清单，防止"复制脚本跑完了但漏了文件"这种静默错误——机制对标现有 `docs/ASSET_MANIFEST.md` 的登记校验精神。
4. 脚本运行方式：`node scripts/migrate-assets.mjs`，作为一次性迁移工具（非每次 `npm run dev` 都跑），迁移完成、校验通过、`public/` 内容经人工抽查确认后，implementer 再执行删除根目录 `assets/` 的操作（见第 1 节步骤 5）。

**M1 阶段不需要处理**：`assets/themes/*`（六主题美术资产）、`assets/images/stories/*`（故事模块非本次范围）——这些资产的迁移时机由 frontend-designer 在实现六主题视觉系统时另行确定路径规范，本文档不预设。

---

## 可选方案对比

### 状态管理

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **Zustand**（推荐） | 极轻量、可在 React 树外读写、自带 persist 中间件 | 缺乏 Redux 生态的时间旅行调试（本项目用不到） | 采用 |
| Context + useReducer | 零依赖 | 频繁更新（音频播放状态）会导致大范围 Context 消费者重渲染，需要手动拆分多个 Context 才能规避，增加样板代码；`AudioService` 类无法自然地从 React 树外读写 Context | 不采用 |
| Redux Toolkit | 生态成熟、DevTools 强 | 对本项目状态面（主题/进度/设置/播放状态）而言过重，模板代码多，与"避免不必要抽象"原则冲突 | 不采用 |

### 样式方案

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **CSS Variables + CSS Modules**（推荐） | 零额外依赖、六主题切换只需换根属性、与 `tokens.dart` 标量语义直接对应 | 需要手写更多 CSS（无原子类可拼） | 采用 |
| Tailwind CSS | 开发速度快、约束一致性 | 需要额外配置 `tailwind.config` 六套主题的 `extend` 映射，且本项目的软陶土阴影/精确间距值更适合直接写具名 CSS 变量，用工具类反而绕远；引入新依赖与构建步骤，收益不明显 | 不采用（不排除后续按需引入） |
| CSS-in-JS（如 styled-components） | 组件与样式共处一文件 | 运行时开销、SSR 无关此项目（纯 SPA）、与"不引入不必要大型依赖"冲突 | 不采用 |

### 发音评分后端运行时

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **Vercel Serverless Function**（推荐） | 与 Vite 静态站零配置整合、Git push 即部署、免费额度够用 | 冷启动延迟、Hobby 计划有函数时长限制 | 采用 |
| Cloudflare Workers | 更快冷启动、更慷慨免费额度 | 需要额外的 `wrangler` 部署配置与账号体系，与前端部署分离，增加运维面 | 备选（若 Vercel 限制成为实际瓶颈时切换，接口设计已保证可平滑迁移） |
| 独立 Node/Express 服务 | 完全掌控 | 需要单独选主机、维护进程存活、证书、扩缩容，对"轻量代理"目标而言过重 | 不采用 |

---

## 模块划分

| 模块 | 职责 | 关键文件 |
|---|---|---|
| **theme** | 六主题 token 定义与切换，CSS 变量注入，`data-theme` 属性管理，主题选择持久化 | `src/theme/*` |
| **audio** | 三通道播放规则（打断/闪避/静默降级）、音位动画音画同步执行器（M2起） | `src/audio/*` |
| **data** | 字母/音位静态数据源与类型定义，从 Flutter 资产迁移而来的唯一数据真源 | `src/data/*` |
| **store** | 进度（学过的字母/音位、收藏、最近学习）、设置（主题 id、声线/速度偏好）的持久化状态 | `src/store/*` |
| **features/alphabet** | 26 字母学习页面与交互 | `src/features/alphabet/*` |
| **features/phonics** | 字母名 IPA vs 拼读音 IPA 对比展示 | `src/features/phonics/*` |
| **features/progress**（M1 基础版） | 学习进度可视化的最小实现（"学过哪些字母"） | `src/features/progress/*` |
| **components** | 跨 feature 复用的展示组件（KidButton/SoundButton/WordCard 等），对标原 `core/widgets` | `src/components/*` |
| **api（M4）** | 发音评分代理 serverless function | `api/pronunciation-assessment.ts` |
| **scripts** | 一次性资产迁移与校验工具 | `scripts/migrate-assets.mjs` |

---

## 数据流

```
用户交互（点击字母/音位/主题按钮）
        │
        ▼
React 组件（features/*） ──读取──▶ src/data/*.ts（静态数据源，构建时打包）
        │                                   │
        │                                   └──▶ 引用 public/audio、public/images 下的静态资源路径
        │
        ├──调用──▶ audioService.playVoice(src) ──▶ HTMLAudioElement 播放
        │              （三通道规则：打断/闪避/静默降级）
        │
        ├──读写──▶ Zustand store（progressStore / settingsStore）
        │              └──persist 中间件──▶ localStorage（对标原 shared_preferences）
        │
        └──（M2起）驱动──▶ usePhonemeAnimationSync(audioEl, rig)
                       └──▶ requestAnimationFrame 轮询播放进度 → 插值 → SVG rig 组件重绘

（M4，可选）
录音 Blob ──▶ fetch('/api/pronunciation-assessment', FormData)
                ──▶ Vercel Function ──▶ Azure Speech REST（Key 仅存在于函数环境变量）
                ──▶ 返回评分 JSON ──▶ 前端展示反馈（失败则静默降级为纯回放对比）

构建产出：`npm run build` → 纯静态资源（HTML/JS/CSS + public/ 原样拷贝）→ 部署到 Vercel 静态托管 + api/ function
```

---

## 风险点

1. **动画音画同步在慢速/变声版本下可能漂移**：归一化时间轴假设各音频变体保持相对事件时序一致，实际人声录音无法做到数学精确。规避：M2 用 5 个样板音位实测，若发现明显漂移（如塞音爆破点感知错位），在不改动 `PhonemeAnimationRig` 对外接口的前提下，用预留的 `perVariantOverrides` 字段做局部微调，不推翻整体方案。
2. **SVG rig 内容制作是全新美术工作，制作工具/人力未定（scope 文档阻塞项 3）**：架构上已把"内容作者需要什么参数"定义清楚（第 5 节 schema），但谁来产出 47×2 套关键帧数据仍是产品/内容层面的未决问题，不是本架构能单独解决的，需 project-manager 跟进。
3. **`.wav` 音位文件体积较大、`.ogg` 转 `.m4a` 转码质量需人工抽查**：转码后建议至少抽听 5-10 个文件确认无明显失真/音量差异，避免机器转码引入不可感知却真实存在的音质回退。
4. **Vercel 免费额度/函数超时对 Azure 评分请求的实际适配性未经验证**：M4 实现前应先用真实 Azure Key 做一次端到端联调，确认延迟在可接受范围，若超时则评估 `maxDuration` 配置或迁移 Cloudflare Workers。
5. **浏览器自动播放策略**：确保所有音频播放路径都由用户手势直接触发（按钮 `onClick` 同步调用 `audioService.playVoice`，不经过额外的 `await` 链导致失去用户手势上下文），否则部分浏览器会静默拒绝播放。
6. **`localStorage` 容量与多标签页同步不是本项目关注点**：进度数据量小（26 字母 + 47 音位的布尔/时间戳级别记录），不会触及 `localStorage` 容量上限，故不需要 IndexedDB，保持方案最简。

---

## 给 implementer 的实现要求

1. **严格按第 1 节步骤执行仓库改造顺序**：先删除 Flutter 专属文件、再 `npm create vite`、再补依赖，不要在 Flutter 与 React 结构并存的状态下长期停留（允许迁移过程中的短暂中间态，但不得作为一个 commit 落地）。
2. **`src/data/*.ts` 是字母/音位数据的唯一真源**，组件不得在业务代码里硬编码音频路径或 IPA 符号字符串，一律从 data 层导入。
3. **`AudioService` 是唯一音频出口**，任何组件不得直接 `new Audio()` 播放语音/音效/BGM，必须经由 `useAudioService()` 单例，保证三通道规则全局一致（对齐原 `AGENTS.md` 红线"音频绕过 AudioService"）。
4. **不得为 M1 引入 M2/M3 才需要的依赖**（如 SVG 动画库、Azure SDK），`PhonemeAnimationRig`/`api/pronunciation-assessment.ts` 在 M1 阶段只需类型定义/占位文件存在，不需要实现。
5. **主题切换必须通过 CSS 变量 + `data-theme` 属性**，不得为每个主题单独维护一套组件样式分支（对齐"六主题共享同一组件树，只换视觉变量"的既有设计约束）。
6. **触控目标最小 48px、语义化标签（`aria-label` 等价物）、`prefers-reduced-motion` 遵循**：延续原项目无障碍红线，用 CSS `@media (prefers-reduced-motion: reduce)` 结合 token 里的 `Motion` 时长做降级，不得跳过。
7. **进度/设置持久化必须走 Zustand `persist` 中间件**，key 命名沿用 `englishgo.` 前缀 + 版本号（如 `englishgo.progress.v1`），预留 schema 迁移空间，不得直接裸写 `localStorage.setItem`。
8. **资产迁移脚本必须包含存在性校验且失败即报错退出**，不允许"复制完就算完成"，避免重蹈原项目"manifest 未登记资源"类问题。
9. **M1 验收标准以 scope 文档 §3 "M1" 小节的 7 条为唯一验收依据**，不得擅自扩大范围（如提前实现动画/评分），也不得遗漏其中任何一条（尤其"男女声切换生效""刷新后进度保留""触控≥48px"三条容易被忽略）。
10. **每次改动后跑 `tsc --noEmit`、`eslint`、`vitest run`**，作为 M1 版的"flutter analyze/flutter test"等价硬性检查，全部零错误/全过才可宣布任务完成。

---

## 总结

React 项目落在仓库根目录，删除并存的 Flutter 结构（历史存于 `main` 分支），避免双项目局面。技术栈：Zustand（状态）+ React Router v6（路由）+ CSS 变量/CSS Modules（六主题样式，`data-theme` 切换）+ 原生 `HTMLAudioElement`（三通道音频服务）+ Vitest/Playwright（测试）。数据层以 `src/data/*.ts` 为唯一真源，迁移自 `alphabet.json`/`phoneme_audio_slugs.dart`/`phoneme_example_words.dart`。M2 最大风险点——参数化 SVG 发音动画——已锁定归一化时间轴关键帧 schema（`PhonemeAnimationRig`），M1 只留接口不实现。发音评分用 Vercel Serverless Function 代理 Azure REST 调用，Key 只存服务端环境变量。资产迁移脚本负责复制+转码+存在性校验，通过后再清理旧 `assets/` 目录。
