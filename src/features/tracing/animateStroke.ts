// 笔顺动画工具：路径采样 + 基于 requestAnimationFrame 的逐帧播放

import type { Point } from "./canvasGeometry";

/**
 * 对笔画路径按弧长均匀重采样，返回 sampleCount 个点，用于流畅的动画播放
 * 若原始路径点数过少（<2），直接返回原路径
 */
export function sampleStrokePath(path: Point[], sampleCount: number): Point[] {
  if (path.length < 2 || sampleCount < 2) return path;

  // 计算每一段的长度与累计长度，得到路径总长
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const length = Math.hypot(path[i + 1]!.x - path[i]!.x, path[i + 1]!.y - path[i]!.y);
    segmentLengths.push(length);
    totalLength += length;
  }

  if (totalLength === 0) return path;

  const result: Point[] = [];
  let segmentIndex = 0;
  let lengthBeforeSegment = 0;

  for (let i = 0; i < sampleCount; i++) {
    const targetLength = (totalLength * i) / (sampleCount - 1);

    // 找到目标弧长所在的线段
    while (
      segmentIndex < segmentLengths.length - 1 &&
      lengthBeforeSegment + segmentLengths[segmentIndex]! < targetLength
    ) {
      lengthBeforeSegment += segmentLengths[segmentIndex]!;
      segmentIndex++;
    }

    const segmentLength = segmentLengths[segmentIndex] || 1;
    const ratioInSegment = Math.min(
      1,
      Math.max(0, (targetLength - lengthBeforeSegment) / segmentLength)
    );
    const a = path[segmentIndex]!;
    const b = path[segmentIndex + 1]!;
    result.push({
      x: a.x + (b.x - a.x) * ratioInSegment,
      y: a.y + (b.y - a.y) * ratioInSegment,
    });
  }

  return result;
}

export interface PlayStrokeOptions {
  /** 采样后的路径点 */
  points: Point[];
  /** 播放总时长（毫秒） */
  durationMs: number;
  /** 每一帧回调，传入当前已经绘制到的点集合（从第一个点到当前进度） */
  onFrame: (drawnPoints: Point[]) => void;
  /** 播放完成回调 */
  onComplete: () => void;
}

/**
 * 播放单个笔画的示范动画，基于 requestAnimationFrame 按时间进度逐步显示路径点
 * 返回取消函数，调用后可随时中止动画
 */
export function playStrokeAnimation(options: PlayStrokeOptions): () => void {
  const { points, durationMs, onFrame, onComplete } = options;
  let rafId = 0;
  let startTime = 0;
  let cancelled = false;

  const step = (timestamp: number): void => {
    if (cancelled) return;
    if (startTime === 0) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const visibleCount = Math.max(1, Math.round(points.length * progress));
    onFrame(points.slice(0, visibleCount));

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onComplete();
    }
  };

  rafId = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}
