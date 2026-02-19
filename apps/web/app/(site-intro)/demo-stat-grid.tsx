'use client';

import { StatBar } from '@/components/results/stat-bar';
import { getCategoryColor } from '@/lib/design-tokens';

const CATEGORIES = [
  { category: '정신력', abilities: ['결단력', '침착성', '집중력', '창의성', '분석력', '적응력'] },
  { category: '사회성', abilities: ['소통능력', '협동심', '리더십', '공감능력', '영향력', '네트워킹'] },
  { category: '업무역량', abilities: ['실행력', '기획력', '문제해결', '시간관리', '꼼꼼함', '멀티태스킹'] },
  { category: '신체/감각', abilities: ['스트레스내성', '지구력', '직관력', '심미안', '공간지각', '언어능력'] },
  { category: '잠재력', abilities: ['성장가능성', '학습속도', '혁신성', '회복탄력성', '야망', '성실성'] },
];

// Generate pseudo-random scores for demo
function demoScore(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return 30 + Math.abs(hash % 60);
}

export function DemoStatGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {CATEGORIES.map((group) => {
        const catColor = getCategoryColor(group.category);
        return (
          <div key={group.category} className={`border-l-4 pl-3 ${catColor.borderClass}`}>
            <h4 className={`font-semibold text-sm mb-2 ${catColor.textClass}`}>
              {group.category}
            </h4>
            <div className="space-y-1.5">
              {group.abilities.map((ability, i) => (
                <StatBar
                  key={ability}
                  label={ability}
                  score={demoScore(ability)}
                  category={group.category}
                  animated
                  delay={i * 60}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
