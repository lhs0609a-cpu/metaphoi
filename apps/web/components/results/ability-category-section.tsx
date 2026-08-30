'use client';

import { type AbilityScore } from '@/data/tests/comprehensive';
import { getCategoryColor, getRank, RANK_CONFIG } from '@/lib/design-tokens';
import { StatBar } from './stat-bar';
import { useInView } from '@/hooks/use-in-view';

interface AbilityCategorySectionProps {
  category: string;
  abilities: AbilityScore[];
  isPaid: boolean;
  animate?: boolean;
}

export function AbilityCategorySection({
  category,
  abilities,
  isPaid,
  animate = true,
}: AbilityCategorySectionProps) {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const catColor = getCategoryColor(category);

  // Category average score
  const avg = abilities.length > 0
    ? Math.round(abilities.reduce((s, a) => s + a.score, 0) / abilities.length)
    : 0;
  const avgRank = getRank(avg);
  const rankCfg = RANK_CONFIG[avgRank];

  return (
    <div ref={ref}>
      {/* 카테고리 색은 왼쪽 점 하나로 충분하다. 굵은 세로선은 목록을 격자로 만든다 */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: `hsl(${catColor.hsl})` }}
          aria-hidden="true"
        />
        <h4 className="text-body font-semibold">{category}</h4>
        <span className={`stat-num rounded px-1.5 py-0.5 text-micro ${rankCfg.twBg} ${rankCfg.twColor}`}>
          {avgRank}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {isPaid ? (
          abilities.map((ability, i) => (
            <StatBar
              key={ability.key}
              label={ability.name}
              score={ability.score}
              category={category}
              animated={animate}
              delay={i * 80}
            />
          ))
        ) : (
          <>
            {abilities.slice(0, 2).map((ability, i) => (
              <StatBar
                key={ability.key}
                label={ability.name}
                score={ability.score}
                category={category}
                animated={animate}
                delay={i * 80}
              />
            ))}
            {abilities.length > 2 && (
              <p className="pl-4 pt-1 text-tiny text-muted-foreground">
                나머지 {abilities.length - 2}개는 전체 분석에서 볼 수 있습니다
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
