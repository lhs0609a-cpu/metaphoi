'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RadarChartProps {
  data?: {
    categories: Array<{
      category: string;
      abilities: Array<{
        code: string;
        name: string;
        score: number;
        max_score: number;
      }>;
    }>;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  mental: '#8884d8',
  social: '#82ca9d',
  work: '#ffc658',
  physical: '#ff7300',
  potential: '#00C49F',
};

const CATEGORY_NAMES: Record<string, string> = {
  mental: '정신력',
  social: '사회성',
  work: '업무역량',
  physical: '신체/감각',
  potential: '잠재력',
};

export function RadarChart({ data }: RadarChartProps) {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  // Transform data for category-based radar chart
  const categoryData = data.categories.map((cat) => {
    const avgScore =
      cat.abilities.reduce((sum, ab) => sum + ab.score, 0) / cat.abilities.length;
    return {
      category: CATEGORY_NAMES[cat.category] || cat.category,
      score: avgScore,
      fullMark: 20,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart data={categoryData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 20]} tick={{ fontSize: 10 }} />
        <Radar
          name="능력치"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.5}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)} / 20`, '점수']}
        />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

// Detailed radar chart showing all 30 abilities
export function DetailedRadarChart({ data }: RadarChartProps) {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.categories.map((cat) => {
        const chartData = cat.abilities.map((ab) => ({
          name: ab.name,
          score: ab.score,
          fullMark: ab.max_score,
        }));

        const color = CATEGORY_COLORS[cat.category] || '#8884d8';

        return (
          <div key={cat.category} className="h-[300px]">
            <h4 className="text-center font-semibold mb-2">
              {CATEGORY_NAMES[cat.category] || cat.category}
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 20]} tick={{ fontSize: 8 }} />
                <Radar
                  name={CATEGORY_NAMES[cat.category] || cat.category}
                  dataKey="score"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.5}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} / 20`, '점수']}
                />
              </RechartsRadarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
