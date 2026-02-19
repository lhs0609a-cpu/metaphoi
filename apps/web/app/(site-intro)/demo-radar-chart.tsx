'use client';

import { RadarChart } from '@/components/results/radar-chart';
import { CATEGORY_COLORS } from '@/lib/design-tokens';

const DEMO_DATA = [
  { name: '정신력', score: 72, color: `hsl(${CATEGORY_COLORS['정신력'].hsl})` },
  { name: '사회성', score: 85, color: `hsl(${CATEGORY_COLORS['사회성'].hsl})` },
  { name: '업무역량', score: 63, color: `hsl(${CATEGORY_COLORS['업무역량'].hsl})` },
  { name: '신체/감각', score: 58, color: `hsl(${CATEGORY_COLORS['신체/감각'].hsl})` },
  { name: '잠재력', score: 78, color: `hsl(${CATEGORY_COLORS['잠재력'].hsl})` },
];

export function DemoRadarChart() {
  return <RadarChart categories={DEMO_DATA} animate size={220} />;
}
