'use client';

import { RadarChart } from '@/components/results/radar-chart';

const EMPTY_DATA = [
  { name: '정신력', score: 0, color: 'hsl(var(--muted-foreground))' },
  { name: '사회성', score: 0, color: 'hsl(var(--muted-foreground))' },
  { name: '업무역량', score: 0, color: 'hsl(var(--muted-foreground))' },
  { name: '신체/감각', score: 0, color: 'hsl(var(--muted-foreground))' },
  { name: '잠재력', score: 0, color: 'hsl(var(--muted-foreground))' },
];

export function EmptyRadarOutline() {
  return (
    <div className="opacity-40">
      <RadarChart
        categories={EMPTY_DATA}
        size={180}
        showLabels
        grayscale
        animate={false}
      />
    </div>
  );
}
