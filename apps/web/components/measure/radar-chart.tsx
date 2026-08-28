'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface RadarAxis {
  label: string;
  /** 0–100 */
  value: number;
  /** 축 색. 보통 카테고리 색을 그대로 넘긴다 */
  color?: string;
  /** 신뢰구간 반폭(점수 단위). showCI일 때 값 주위에 띠로 그린다 */
  ci?: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  /** 정사각 SVG 한 변 */
  size?: number;
  /** 신뢰구간 띠를 그린다. 규준이 없으면 띠가 넓어 보이는 게 정직하다 */
  showCI?: boolean;
  /** 각 꼭짓점 옆에 숫자를 적는다 */
  showValues?: boolean;
  /** 축 라벨 표시 */
  showLabels?: boolean;
  animate?: boolean;
  className?: string;
}

const RINGS = [25, 50, 75, 100];

/**
 * 능력 카테고리 레이더.
 * 눈금 링을 25점 간격으로 항상 그린다 — 격자 없는 레이더는 모양만 남고 크기를 잃는다.
 */
export function RadarChart({
  axes,
  size = 240,
  showCI = false,
  showValues = false,
  showLabels = true,
  animate = true,
  className,
}: RadarChartProps) {
  const uid = useId().replace(/[:]/g, '');
  const n = axes.length;

  if (n < 3) return null;

  const pad = showLabels ? 34 : 10;
  const c = size / 2;
  const r = c - pad;

  // 12시 방향에서 시계 방향으로
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [c + Math.cos(a) * r * ratio, c + Math.sin(a) * r * ratio] as const;
  };
  const polygon = (ratios: number[]) =>
    ratios.map((ratio, i) => point(i, ratio).join(',')).join(' ');

  const clamp = (v: number) => Math.max(0, Math.min(100, v)) / 100;

  const values = axes.map((a) => clamp(a.value));
  const ciOuter = axes.map((a) => clamp(a.value + (a.ci ?? 0)));
  const ciInner = axes.map((a) => clamp(a.value - (a.ci ?? 0)));

  const hasCI = showCI && axes.some((a) => (a.ci ?? 0) > 0);

  // 다각형 둘레 — stroke-dashoffset 그리기 애니메이션 길이
  const perimeter = values.reduce((sum, ratio, i) => {
    const [x1, y1] = point(i, ratio);
    const [x2, y2] = point((i + 1) % n, values[(i + 1) % n]);
    return sum + Math.hypot(x2 - x1, y2 - y1);
  }, 0);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn('overflow-visible', className)}
      role="img"
      aria-label={axes.map((a) => `${a.label} ${Math.round(a.value)}`).join(', ')}
    >
      <defs>
        <linearGradient id={`radar-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* 눈금 링 */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygon(Array(n).fill(ring / 100))}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
      ))}

      {/* 축선 */}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />;
      })}

      {/* 신뢰구간 띠 — 바깥에서 안쪽을 도려낸다 */}
      {hasCI ? (
        <path
          d={`M ${polygon(ciOuter).replace(/ /g, ' L ')} Z M ${polygon(ciInner).replace(/ /g, ' L ')} Z`}
          fillRule="evenodd"
          fill="hsl(var(--primary))"
          opacity="0.14"
        />
      ) : null}

      {/* 값 다각형 */}
      <polygon
        points={polygon(values)}
        fill={`url(#radar-fill-${uid})`}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinejoin="round"
        style={
          animate
            ? ({
                '--radar-perimeter': perimeter,
                strokeDasharray: perimeter,
                animation: 'radar-draw var(--dur-slow) var(--ease) both',
              } as React.CSSProperties)
            : undefined
        }
      />

      {/* 꼭짓점 */}
      {axes.map((a, i) => {
        const [x, y] = point(i, values[i]);
        return (
          <circle
            key={a.label}
            cx={x}
            cy={y}
            r="3.5"
            fill={a.color ?? 'hsl(var(--primary))'}
            stroke="hsl(var(--card))"
            strokeWidth="1.5"
          />
        );
      })}

      {/* 라벨 */}
      {showLabels
        ? axes.map((a, i) => {
            const [x, y] = point(i, 1.16);
            const anchor = Math.abs(x - c) < 4 ? 'middle' : x > c ? 'start' : 'end';
            return (
              <text
                key={a.label}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="hsl(var(--muted-foreground))"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {a.label}
                {showValues ? (
                  <tspan fill={a.color ?? 'hsl(var(--foreground))'} dx="4" style={{ fontWeight: 700 }}>
                    {Math.round(a.value)}
                  </tspan>
                ) : null}
              </text>
            );
          })
        : null}
    </svg>
  );
}
