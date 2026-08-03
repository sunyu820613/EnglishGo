// 几何工具函数：点、线段距离计算与笔迹校验

export interface Point {
  x: number;
  y: number;
}

/**
 * 计算点到线段的最短距离
 */
export function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // 线段退化为一个点
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  // 将 p 投影到线段所在直线上，t 为投影位置比例，并夹紧到 [0,1] 范围内
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared)
  );
  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  return Math.hypot(p.x - closestX, p.y - closestY);
}

/**
 * 判断某个点是否足够靠近目标笔画路径（在容错阈值范围内）
 * 逐段计算点到路径各线段的最短距离，取全局最小值与阈值比较
 */
export function isPointNearStroke(
  point: Point,
  strokePath: Point[],
  threshold: number
): boolean {
  if (strokePath.length === 0) return false;
  if (strokePath.length === 1) {
    return Math.hypot(point.x - strokePath[0]!.x, point.y - strokePath[0]!.y) <= threshold;
  }

  for (let i = 0; i < strokePath.length - 1; i++) {
    const distance = pointToSegmentDistance(point, strokePath[i]!, strokePath[i + 1]!);
    if (distance <= threshold) {
      return true;
    }
  }
  return false;
}
