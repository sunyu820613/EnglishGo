# THEME_SYSTEM — 六套主题系统

版本：1.0 ｜ 上游：[DESIGN.md](DESIGN.md)（结构性 Token 与颜色角色定义）
实现：`lib/core/theme/` 下每主题一个 `KidThemeExtension` 实例；六主题共享全部布局、信息架构、交互位置与可访问性，仅替换 Token 与资产。

## 0. 主题清单

| id | 名称 | 推荐标签* | 角色 | 场景气质 |
|---|---|---|---|---|
| `starlight` | 星际探索站 | 男孩 | 宇航狐狸 Foxo | 深空、星尘、磨砂金属、半透明玻璃 |
| `dino` | 恐龙自然博物馆 | 男孩 | 幼年三角龙 Trixie | 绘本纸张、岩石、木材、植物 |
| `robot` | 未来机器人实验室 | 男孩 | 圆润小机器人 Bolt | 高级玩具、软塑料、机械积木 |
| `moonGarden` | 月光魔法花园 | 女孩 | 月兔 Luna | 月光、花瓣、珍珠、萤火虫 |
| `balletCastle` | 云端芭蕾城堡 | 女孩 | 小天鹅 Odette | 丝带、薄纱、云朵、柔和金属 |
| `dessert` | 甜点艺术工坊 | 女孩 | 猫咪烘焙师 Mochi | 精品甜点店、陶瓷、奶油、烘焙纸 |

*推荐标签仅作主题选择页的默认排序参考，UI 不显示性别标签，不限制任何选择。

## 1. 颜色 Token（14 角色 × 6 主题）

对比度要求：`text`/`background` ≥ 7:1；`onPrimary`/`primary` ≥ 4.5:1；`textSoft` ≥ 3:1（仅 ≥24sp 大字）。实现时用测试锁定（见 TEST_PLAN §对比度）。

### starlight 星际探索站（深色底）
| 角色 | 值 | 备注 |
|---|---|---|
| background | `#1C2A4A` | 深海军蓝夜空 |
| surface | `#28395E` | 磨砂舱面板 |
| surfaceAlt | `#22314F` | |
| primary | `#53C7DE` | 青蓝 |
| onPrimary | `#0E2038` | |
| secondary | `#3D5480` | |
| onSecondary | `#EAF3FB` | |
| accent | `#F6C05C` | 暖金星光 |
| text | `#F2F6FC` | |
| textSoft | `#AFC0DC` | |
| outline | `#122038` | |
| shadowTint | `#0B1830` | |
| success | `#7FD8A4` | |
| focus | `#F6C05C` | |

### dino 恐龙自然博物馆（浅色底）
| 角色 | 值 |
|---|---|
| background | `#F5EFDE` ｜ surface `#FDFAF0` ｜ surfaceAlt `#EDE4CC` |
| primary | `#4A7C59` ｜ onPrimary `#F7FBF2` |
| secondary | `#C9A87C` ｜ onSecondary `#33291A` |
| accent | `#E8A33D` ｜ text `#332E24` ｜ textSoft `#6E6551` |
| outline | `#4A4234` ｜ shadowTint `#8A7A57` |
| success | `#5FA671` ｜ focus `#E8A33D` |

### robot 未来机器人实验室（浅色底）
| 角色 | 值 |
|---|---|
| background | `#EDF0F5` ｜ surface `#FBFCFE` ｜ surfaceAlt `#E1E6EE` |
| primary | `#2F5DD0` ｜ onPrimary `#F4F8FF` |
| secondary | `#8E99AB` ｜ onSecondary `#1D232E` |
| accent | `#F2762E` ｜ text `#272D38` ｜ textSoft `#5C6675` |
| outline | `#39404D` ｜ shadowTint `#7C8AA4` |
| success | `#3FA96E` ｜ focus `#F2762E` |

### moonGarden 月光魔法花园（深色底）
| 角色 | 值 |
|---|---|
| background | `#2B2144` ｜ surface `#3A2E58` ｜ surfaceAlt `#332950` |
| primary | `#A8C4A2` ｜ onPrimary `#1F2B1E` |
| secondary | `#584A7E` ｜ onSecondary `#F0EAF8` |
| accent | `#E8A98F` ｜ text `#F4EFFA` ｜ textSoft `#BDB0D6` |
| outline | `#1D1733` ｜ shadowTint `#170F2E` |
| success | `#9AD6A8` ｜ focus `#E8A98F` |

### balletCastle 云端芭蕾城堡（浅色底）
| 角色 | 值 |
|---|---|
| background | `#FAF6F2` ｜ surface `#FFFDFB` ｜ surfaceAlt `#F3EAE3` |
| primary | `#E793A9` ｜ onPrimary `#47202B` |
| secondary | `#D9C3A5` ｜ onSecondary `#3D3221` |
| accent | `#C9A227` ｜ text `#4A3D42` ｜ textSoft `#8A7880` |
| outline | `#5C4A50` ｜ shadowTint `#C9A9A0` |
| success | `#7CBC93` ｜ focus `#C9A227` |

### dessert 甜点艺术工坊（浅色底）
| 角色 | 值 |
|---|---|
| background | `#FBF4EA` ｜ surface `#FFFCF6` ｜ surfaceAlt `#F3E7D7` |
| primary | `#E8836F` ｜ onPrimary `#4B1F16` |
| secondary | `#8FC9B5` ｜ onSecondary `#1F3A30` |
| accent | `#B5714F` ｜ text `#3E3129` ｜ textSoft `#77655A` |
| outline | `#4A3A30` ｜ shadowTint `#C29B7B` |
| success | `#6FBF8E` ｜ focus `#B5714F` |

## 2. 每主题必须提供的资产/组件（`KidThemeExtension` 字段）

| 字段 | 说明 |
|---|---|
| `colors` | 上表 14 角色 |
| `backgroundScene` | 首页/地图/课程三档背景（分层视差 ≤3 层） |
| `frameDecoration` | 插画框与卡片边饰（星环/藤蔓/铆钉/花枝/丝带/奶油边） |
| `mascot` | 主角色资产 + 待机/庆祝/提示三动作 |
| `particle` | 粒子风格（星尘/落叶/小齿轮/萤火虫/羽毛/糖霜屑），密度上限 12 个/屏 |
| `celebration` | 完成动画（烟花星座/恐龙蛋孵化/机械礼花/花开月圆/幕布谢幕/蛋糕点烛） |
| `rewardChest` | 奖励箱样式（太空舱/化石箱/工具箱/月光宝盒/音乐盒/点心盒） |
| `mapPath` | 字母地图路径样式（星轨/化石小径/传送带/花园小路/云梯/甜点长桌） |
| `sfxSet` | 音效风格集（点击/正确/收集/翻页），同一事件六主题同语义不同音色 |
| `bgm` | 背景音乐（轻柔循环 ≥60s，可关） |

## 3. 主题切换规则

- 切换即时生效，全局动画淡入 320ms（`motion.standard`）
- 学习进度、星星、贴纸与主题无关，永不因切换丢失（进度存储不含主题命名空间；贴纸插画风格全主题统一，收藏册边框随主题）
- 主题选择持久化于 settings；默认 `starlight`
- 深色底主题（starlight/moonGarden）与浅色底主题共用同一套结构 Token，仅 `shadow.rest` 的内层高光在深色主题禁用（见 DESIGN §2.3）

## 4. 差异与一致性边界

同一坐标上的东西永远相同：返回按钮位置、发音按钮位置与尺寸、练习交互、星星结算逻辑、家长门入口。
允许不同的只有：Token 颜色、背景场景、角色、装饰、粒子、音色、庆祝动画、奖励箱与地图路径皮肤。
