# ASSET_MANIFEST — 资源清单规范

版本：1.0 ｜ 数据文件：`assets/manifest.json`（唯一资源登记处）
规则：**不在 manifest 中登记的资源不得被代码引用**；启动自检 + 单元测试校验 manifest 与文件系统一致。

## 1. manifest.json Schema

```json
{
  "schemaVersion": 1,
  "assets": [
    {
      "file": "images/words/apple.webp",
      "kind": "wordImage",
      "letter": "A",
      "word": "apple",
      "theme": null,
      "source": "commissioned|generated|licensed",
      "sourceDetail": "artist/tool + brief id",
      "license": "proprietary|CC0|OFL|...",
      "width": 1024,
      "height": 1024,
      "bytes": 0,
      "sha256": "",
      "humanReviewed": false,
      "placeholder": false
    }
  ]
}
```

字段说明：
- `kind`: wordImage / letterAudio / phonicsAudio / wordAudio / phraseAudio / sfx / bgm / mascot / scene / decoration / font / animation
- `theme`: 六主题 id 或 null（全主题通用，如单词插画）
- `placeholder`: 开发期占位资源必须为 true，**质量门槛要求正式版全部为 false**
- `humanReviewed`: 人工检查（拼写/结构错误/水印/适龄）通过后置 true
- `sha256`/`bytes`: 由脚本 `tool/gen_manifest.ps1` 自动生成（保留已有条目的 humanReviewed/license 字段），防篡改与漂移

## 2. 资源规模预算

| 类别 | 数量 | 单件预算 | 小计 |
|---|---|---|---|
| 单词插画 | 52 | ≤120KB (webp 1024) | ≤6.2MB |
| 字母音频（名+拼读） | 52 | ≤40KB | ≤2.1MB |
| 单词/短句音频 | 104 | ≤60KB | ≤6.3MB |
| 主题场景/装饰 | 6 套 | ≤800KB/套 | ≤4.8MB |
| 角色（含动作） | 6 | ≤500KB/只 | ≤3MB |
| BGM | 6 | ≤700KB | ≤4.2MB |
| 音效 | ~30 | ≤25KB | ≤0.8MB |
| 字体 | 3 族 | subset 后 ≤1.5MB | ≤1.5MB |

目标安装包增量 ≤35MB（Phase 5 复核）。

## 3. 命名与目录

```
assets/
  data/alphabet.json
  manifests/manifest.json
  images/words/<word>.webp
  images/themes/<themeId>/{scene_home,scene_map,scene_lesson,frame,chest,...}.webp
  images/mascots/<themeId>/{idle,celebrate,hint}.webp (或 .riv 待定)
  audio/letters/<letter>_{name,phonics}.m4a
  audio/words/<word>.m4a
  audio/phrases/<letter>_is_for_<word>.m4a
  audio/sfx/<themeId>/{tap,correct,collect,page}.m4a
  audio/bgm/<themeId>.m4a
  fonts/{Baloo2,Nunito,Andika}/...
```

全部小写下划线；单词含空格/连字符时转下划线（ice_cream、x_ray、yo_yo）。
