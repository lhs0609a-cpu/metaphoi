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
    <div ref={ref} className={`border-l-4 pl-4 ${catColor.borderClass}`}>
      <div className="flex items-center gap-2 mb-3">
        <h4 className={`text-sm font-bold ${catColor.textClass}`}>{category}</h4>
        <span
          className={`text-xs stat-num font-bold px-1.5 py-0.5 rounded ${rankCfg.twBg} ${rankCfg.twColor}`}
        >
          {avgRank}
        </span>
      </div>
      <div className="space-y-2">
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
            {abilities.slice(0, 1).map((ability) => (
              <StatBar
                key={ability.key}
                label={ability.name}
                score={ability.score}
                category={category}
                animated={animate}
              />
            ))}
            {abilities.length > 1 && (
              <div className="relative">
                <div className="blur-sm select-none pointer-events-none space-y-2">
                  {abilities.slice(1).map((ability, i) => (
                    <StatBar
                      key={ability.key}
                      label={ability.name}
                      score={ability.score}
                      category={category}
                      animated={false}
                      delay={i * 80}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                    +{abilities.length - 1}개 잠금
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
