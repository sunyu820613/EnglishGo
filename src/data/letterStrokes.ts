// 字母笔顺数据：定义四线三格的网格坐标，以及每个字母各笔画的标准路径点
// 数组顺序 = 书写顺序，新增字母时按此格式追加坐标即可（见文件底部使用说明）
//
// ponytail: 26 个字母的曲线笔画（碗形、拱形）均用圆弧近似真实字形，
// 装饰性细节（如 f/j 顶部小钩、q 尾巴卷曲）简化为直线段，
// 视觉上不是印刷体级别的精确曲线，但笔顺步骤数量、顺序、走向均正确。
// 如需更精细的字形，可将 line()/generateArcPoints() 替换为贝塞尔采样。

import type { Point } from "../features/tracing/canvasGeometry";

/** 四线三格的四条横线 y 坐标（从上到下），三个格子高度相等 */
export const GRID_LINES = {
  top: 60, // 上格线（大写字母顶部 / 带上升部小写字母顶部）
  upperMid: 120, // 中上格线（小写字母 x-height 顶部）
  lowerMid: 180, // 中下格线 = 基线 baseline
  bottom: 240, // 下格线（带下降部小写字母底部）
} as const;

export const CANVAS_WIDTH = 240;
export const CANVAS_HEIGHT = 300;

export interface LetterData {
  letter: string;
  strokes: Point[][];
}

/** 按圆弧参数方程生成一段椭圆弧上的采样点，用于拼出字母的曲线笔画 */
function generateArcPoints(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngleDeg: number,
  endAngleDeg: number,
  steps: number,
  rotationDeg: number = 0
): Point[] {
  const points: Point[] = [];
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const rotRad = (rotationDeg * Math.PI) / 180;
  for (let i = 0; i <= steps; i++) {
    const angle = startRad + ((endRad - startRad) * i) / steps;
    const x = radiusX * Math.cos(angle);
    const y = radiusY * Math.sin(angle);
    points.push({
      x: centerX + x * Math.cos(rotRad) - y * Math.sin(rotRad),
      y: centerY + x * Math.sin(rotRad) + y * Math.cos(rotRad),
    });
  }
  return points;
}


/** 生成一条两点直线笔画 */
function line(x1: number, y1: number, x2: number, y2: number): Point[] {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
}

/** 拼接多段路径点为一笔连续笔画（用于"拱形+竖线"这类不换笔的连续笔画） */
function join(...segments: Point[][]): Point[] {
  const result: Point[] = [];
  segments.forEach((segment, index) => {
    // 跳过与上一段末尾重复的起点，避免同一坐标绘制两次
    const start = index > 0 && result.length > 0 ? 1 : 0;
    result.push(...segment.slice(start));
  });
  return result;
}

const { top, upperMid, lowerMid } = GRID_LINES;

// ------------------------- 大写字母 A-Z -------------------------
// 大写字母统一占「上格线(top) - 中下格线(lowerMid，即基线)」，左右边界约 60-180，居中 120

const upperLetters: Record<string, Point[][]> = {
  A: [line(120, top, 75, lowerMid), line(120, top, 165, lowerMid), line(100, 135, 140, 135)],
  B: [
    line(90, top, 90, lowerMid),
    join(line(90, top, 105, top), generateArcPoints(105, 90, 41, 30, 270, 450, 16), line(105, upperMid, 90, upperMid)),
    join(
      line(90, upperMid, 105, upperMid),
      generateArcPoints(105, 150, 45, 30, 270, 450, 16),
      line(105, lowerMid, 90, lowerMid)
    ),
  ],
  C: [generateArcPoints(120, 120, 50, 60, 320, 40, 28)],
  D: [
    line(85, top, 85, lowerMid),
    join(
        line(85, top, 105, top),
        generateArcPoints(105, 120, 50, 60, 270, 450, 28),
        line(105, lowerMid, 85, lowerMid)
    ),
  ],
  E: [
    line(90, top, 90, lowerMid),
    line(90, top, 150, top),
    line(90, upperMid, 150, upperMid),
    line(90, lowerMid, 150, lowerMid),
  ],
  F: [line(90, top, 90, lowerMid), line(90, top, 150, top), line(90, upperMid, 150, upperMid)],
  G: [generateArcPoints(120, 120, 50, 60, 340, 30, 28), line(163, 145, 163, 180), line(163, 145, 145, 145)],
  H: [line(80, top, 80, lowerMid), line(160, top, 160, lowerMid), line(80, upperMid, 160, upperMid)],
  I: [line(120, top, 120, lowerMid)],
  J: [line(119, top, 143, top), join(line(131, top, 131, 168), generateArcPoints(114.26, 165.05, 17, 12, 0, 180, 20, 10))],
  K: [line(85, top, 85, lowerMid), line(145, top, 85, upperMid), line(85, upperMid, 155, lowerMid)],
  L: [line(90, top, 90, lowerMid), line(90, lowerMid, 150, lowerMid)],
  M: [line(54.77, 179.77, 65.23, 60.23), join(line(65.23, 60.23, 120, lowerMid), line(120, lowerMid, 174.77, 60.23)), line(174.77, 60.23, 185.23, 179.77)],
  N: [line(75, top, 75, lowerMid), line(75, top, 165, lowerMid), line(165, top, 165, lowerMid)],
  O: [generateArcPoints(120, 120, 50, 60, 270, 630, 32)],
  P: [
    line(90, top, 90, lowerMid),
    join(line(90, top, 105, top), generateArcPoints(105, 90, 41, 30, 270, 450, 16), line(105, upperMid, 90, upperMid)),
  ],
  Q: [generateArcPoints(120, 120, 50, 60, 270, 630, 32), line(140, 160, 170, 190)],
  R: [
    line(84, top, 84, lowerMid),
    join(line(84, top, 99, top), generateArcPoints(99, 90, 45, 30, 270, 450, 16), line(99, upperMid, 84, upperMid)),
    line(104, upperMid, 156, lowerMid),
  ],
  S: [
    // 一笔连续：右上起笔 → 顶部外凸 → 中线 → 底部外凸 → 左下收笔
    join(generateArcPoints(122, 90, 35, 30, -35, -267.33, 24),
         generateArcPoints(120, 150, 42, 30, -90, 145, 24)),
  ],
  T: [line(70, top, 170, top), line(120, top, 120, lowerMid)],
  U: [join(line(78, top, 78, 150), generateArcPoints(120, 150, 42, 30, 180, 0, 16), line(162, 150, 162, top))],
  V: [line(60, top, 120, lowerMid), line(120, lowerMid, 180, top)],
  W: [[
    { x: 55, y: top },
    { x: 90, y: lowerMid },
    { x: 120, y: top },
    { x: 150, y: lowerMid },
    { x: 185, y: top },
  ]],
  X: [line(60, top, 180, lowerMid), line(180, top, 60, lowerMid)],
  Y: [line(70, top, 120, 110), line(170, top, 120, 110), line(120, 110, 120, lowerMid)],
  Z: [line(65, top, 175, top), line(175, top, 65, lowerMid), line(65, lowerMid, 175, lowerMid)],
};

// ------------------------- 小写字母 a-z -------------------------
// x-height 主体占「中上格线(upperMid) - 中下格线(lowerMid)」，左右边界约 75-165，居中 120
// 带上升部（b/d/f/h/k/l/t）向上延伸至 top；带下降部（g/j/p/q/y）向下延伸至 bottom 附近

const lowerLetters: Record<string, Point[][]> = {
  a: [generateArcPoints(120, 150, 25, 30, 340, 20, 24, 10), join(line(146.89, 127.09, 143.83, 171.95), line(143.83, 171.95, 146.83, 178.95))],
  b: [line(104.80, 56.42, 94.34, 175.96), generateArcPoints(120.66, 148.24, 24, 34, 210, 510, 24, 5)],
  c: [generateArcPoints(120, 150, 25, 30, 310, 50, 24, 5)],
  d: [generateArcPoints(116.18, 140.45, 24, 34, 330, 30, 24, 5), join(line(149, top, 138, 165), line(138, 165, 141, 172))],
  e: [join(line(95.1, 150, 144.9, 150), generateArcPoints(120, 150, 25, 30, 360, 180, 12, 5), generateArcPoints(120, 150, 25, 30, 180, 50, 12, 5))],
  f: [
    join(generateArcPoints(131.02, 99.46, 15, 18, 270, 180, 10), line(116.07, 98.16, 108.93, 179.84), generateArcPoints(96.97, 178.8, 12, 12, 180, 360, 8, -175)),
    line(93.53, 128, 133.38, 128),
  ],
  g: [
    generateArcPoints(119.67, 148.81, 25, 30, 340, 20, 24, 5),
    join(line(146.49, 129.07, 138.48, 220.72), generateArcPoints(123.53, 219.41, 15, 15, 0, 140, 10, 5)),
  ],
  h: [line(103.82, 56.42, 93.36, 175.96), join(generateArcPoints(121.75, 138.29, 25, 20, 180, 360, 16, 5), line(146.65, 140.47, 143.17, 175.96))],
  i: [line(121.52, 120.11, 116.30, 179.89), line(123.70, 95.21, 123.70, 95.21)],
  j: [
    join(line(131.33, 122.73, 122.61, 222.35), generateArcPoints(107.67, 221.04, 15, 15, 0, 140, 10, 5)),
    line(131.51, 97.82, 131.52, 97.82),
  ],
  k: [line(96.77, 56.42, 86.31, 175.96), line(143.70, 105.57, 90.23, 131.14), line(90.23, 131.14, 141.06, 175.96)],
  l: [line(125.22, 60.34, 114.77, 179.89)],
  m: [
    line(72.52, 116.19, 67.29, 175.96),
    join(generateArcPoints(95.68, 138.29, 25, 20, 180, 360, 16, 5), line(120.58, 140.47, 117.10, 175.96)),
    join(generateArcPoints(145.49, 138.29, 25, 20, 180, 360, 16, 5), line(168.70, 138.29, 168.70, 175.96)),
  ],
  n: [line(98.59, 116.19, 93.36, 175.96), join(generateArcPoints(121.75, 138.29, 25, 20, 180, 360, 16, 5), line(146.65, 140.47, 143.17, 175.96))],
  o: [generateArcPoints(120, 150, 25, 30, 270, -90, 28, 5)],
  p: [line(100.73, 116.19, 92.01, 215.81), generateArcPoints(122.00, 148.69, 24, 30, 210, 510, 24, 5)],
  q: [generateArcPoints(117.00, 153.98, 24, 30, 260, -20, 24, 57), join(line(139.51, 134.39, 132.81, 226.84), generateArcPoints(142.77, 227.71, 10, 10, 180, 0, 32))],
  r: [
    join(generateArcPoints(102.02, 124.56, 10, 14, 180, 360, 14, 3), line(117.03, 120.23, 109.71, 179.77)),
    generateArcPoints(129.98, 123.09, 18, 14, 180, 360, 16, 3),
  ],
  s: [
    join(generateArcPoints(121.47, 135.09, 25, 15, -35, -267.33, 24, 5), generateArcPoints(117.70, 164.86, 25, 15, -90, 145, 24, 5)),
  ],
  t: [
    join(line(121.12, 85.16, 113.88, 167.84), generateArcPoints(121.54, 161.42, 14, 10, 270, 180, 10, 230)),
    line(94.50, 115, 145.50, 115),
  ],
  u: [join(line(93.91, 124.63, 91.99, 144.37), generateArcPoints(115.85, 158.50, 25, 20, 180, 0, 14, 5)), join(line(143.72, 124.63, 139.54, 174.62), generateArcPoints(148.00, 175.37, 8.5, 6, 180, 0, 10, 5))],
  v: [line(93.14, 120.11, 114.78, 179.89), line(114.78, 179.89, 146.87, 120.11)],
  w: [join(line(75.17, 120.11, 81.86, 171.89), generateArcPoints(89.86, 171.89, 8, 8, 180, 0, 8), line(97.86, 171.89, 119.99, 120.11), line(119.99, 120.11, 131.67, 171.89), generateArcPoints(139.67, 171.89, 8, 8, 180, 0, 8), line(147.67, 171.89, 164.82, 120.11))],
  x: [
    join(generateArcPoints(148.25, 110, 10, 10, 90, -90, 8, -45), line(148.25, 120, 92.25, 180), generateArcPoints(82.25, 176.5, 10, 10, 0, 180, 8)),
    join(generateArcPoints(91.75, 123.5, 10, 10, 0, 180, 8, -180), line(81.75, 123.5, 131.25, 176.5), generateArcPoints(141.25, 176.5, 10, 10, 180, 0, 8)),
  ],
  y: [line(95.60, 117.35, 123.51, 174.7), join(line(147.85, 118, 102.11, 219.62), generateArcPoints(92.15, 218.75, 10, 10, 360, 540, 8, 5))],
  z: [line(85, 120, 155, 120), line(155, 120, 85, 180), line(85, 180, 155, 180)],
};

function buildLetterData(letter: string, strokes: Point[][]): LetterData {
  return { letter, strokes };
}

export const LETTER_DATA: Record<string, LetterData> = {
  ...Object.fromEntries(
    Object.entries(upperLetters).map(([letter, strokes]) => [letter, buildLetterData(letter, strokes)])
  ),
  ...Object.fromEntries(
    Object.entries(lowerLetters).map(([letter, strokes]) => [letter, buildLetterData(letter, strokes)])
  ),
};

export function hasTracingData(letter: string): boolean {
  return letter.toUpperCase() in LETTER_DATA;
}

export function hasLowercaseTracingData(letter: string): boolean {
  return letter.toLowerCase() in LETTER_DATA;
}

/**
 * 新增 / 调整字母的方法：
 * 1. 大写字母加进 upperLetters，小写字母加进 lowerLetters，key 为字母本身；
 *    strokes 数组的顺序即笔顺；
 * 2. 直线笔画用 line(x1,y1,x2,y2)；曲线笔画用 generateArcPoints(centerX, centerY,
 *    radiusX, radiusY, 起始角度, 结束角度, 采样步数)（角度递增=顺时针，递减=逆时针，
 *    因为 canvas 的 y 轴向下）；需要"不换笔"连续绘制多段时用 join(...segments) 拼接；
 * 3. 坐标应落在 GRID_LINES 定义的四线区间内；
 * 4. 无需修改 LetterBoard 组件，切换 currentLetter 到新的 key 即可生效。
 */