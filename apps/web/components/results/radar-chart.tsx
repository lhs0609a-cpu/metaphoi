'use client';

import { useInView } from '@/hooks/use-in-view';

interface RadarCategory {
  name: string;
  score: number;
  color: string;
}

interface RadarChartProps {
  categories: RadarCategory[];
  animate?: boolean;
  size?: number;
  showLabels?: boolean;
  grayscale?: boolean;
}

const GRID_LEVELS = [20, 40, 60, 80, 100];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
): string {
  return Array.from({ length: sides }, (_, i) => {
    const { x, y } = polarToCartesian(cx, cy, radius, (360 / sides) * i);
    return `${x},${y}`;
  }).join(' ');
}

export function RadarChart({
  categories,
  animate = true,
  size = 200,
  showLabels = true,
  grayscale = false,
}: RadarChartProps) {
  const [ref, isInView] = useInView({ threshold: 0.3 });
  const sides = categories.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  const dataPoints = categories.map((cat, i) => {
    const r = (cat.score / 100) * maxR;
    return polarToCartesian(cx, cy, r, (360 / sides) * i);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // approximate perimeter for stroke animation
  let perimeter = 0;
  for (let i = 0; i < dataPoints.length; i++) {
    const next = dataPoints[(i + 1) % dataPoints.length];
    const dx = next.x - dataPoints[i].x;
    const dy = next.y - dataPoints[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <div ref={ref} className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Grid rings */}
        {GRID_LEVELS.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(cx, cy, (level / 100) * maxR, sides)}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={level === 100 ? 1 : 0.5}
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, i) => {
          const pt = polarToCartesian(cx, cy, maxR, (360 / sides) * i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.4}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPolygon}
          fill={grayscale ? 'hsl(var(--muted-foreground) / 0.1)' : 'hsl(var(--primary) / 0.15)'}
          stroke={grayscale ? 'hsl(var(--muted-foreground) / 0.3)' : 'hsl(var(--primary))'}
          strokeWidth={2}
          strokeLinejoin="round"
          style={
            animate && isInView
              ? {
                  strokeDasharray: perimeter,
                  strokeDashoffset: 0,
                  '--radar-perimeter': `${perimeter}`,
                  animation: 'radar-draw 1.5s ease-out forwards',
                } as React.CSSProperties
              : animate
                ? { opacity: 0 }
                : {}
          }
        />

        {/* Vertex markers + labels */}
        {categories.map((cat, i) => {
          const labelR = maxR + 18;
          const pt = polarToCartesian(cx, cy, (cat.score / 100) * maxR, (360 / sides) * i);
          const labelPt = polarToCartesian(cx, cy, labelR, (360 / sides) * i);
          return (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={grayscale ? 'hsl(var(--muted-foreground))' : cat.color}
                opacity={animate && !isInView ? 0 : 1}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              {showLabels && (
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground"
                  fontSize={11}
                  fontWeight={600}
                >
                  {cat.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
