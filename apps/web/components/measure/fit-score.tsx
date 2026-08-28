import { cn } from '@/lib/utils';

export interface Fit {
  total: number;
  /** 능력치 적합도 — 가중치 60% */
  ability?: number;
  /** 팀 성향 궁합 — 25% */
  culture?: number;
  /** 근무 조건 일치 — 15% */
  condition?: number;
}

/** 가중치는 아직 준거 데이터로 검증되지 않은 설정값이다. 화면에도 그대로 적는다. */
const PARTS: { key: keyof Omit<Fit, 'total'>; label: string; weight: number }[] = [
  { key: 'ability', label: '능력', weight: 60 },
  { key: 'culture', label: '컬처', weight: 25 },
  { key: 'condition', label: '조건', weight: 15 },
];

function toneOf(total: number) {
  if (total >= 80) return { text: 'text-ok', bar: 'hsl(var(--ok))' };
  if (total >= 60) return { text: 'text-primary', bar: 'hsl(var(--primary))' };
  if (total >= 40) return { text: 'text-warn', bar: 'hsl(var(--warn))' };
  return { text: 'text-muted-foreground', bar: 'hsl(var(--muted-foreground))' };
}

interface FitScoreProps {
  fit: Fit;
  size?: 'sm' | 'md';
  /** 산출 근거 고지. 채용 화면에서는 기본으로 켜 둔다 */
  showNote?: boolean;
  className?: string;
}

/**
 * 적합도 분해 표시. 총점만 크게 띄우고 끝내지 않고 무엇이 그 점수를 만들었는지 같이 보여준다.
 * 총점 하나만 보이면 사람은 그것을 결론으로 읽는다.
 */
export function FitScore({ fit, size = 'md', showNote = true, className }: FitScoreProps) {
  const total = Math.round(fit.total);
  const tone = toneOf(total);
  const parts = PARTS.filter((p) => fit[p.key] != null);

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn('stat-num', tone.text, size === 'sm' ? 'text-h4' : 'text-h2')}
          data-numeric
        >
          {total}
        </span>
        <span className="text-tiny text-muted-foreground">/ 100 적합도</span>
      </div>

      {parts.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {parts.map((p) => {
            const v = Math.max(0, Math.min(100, Math.round(fit[p.key] as number)));
            return (
              <li key={p.key} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-micro text-muted-foreground">{p.label}</span>
                <span className="sunk h-1 flex-1 overflow-hidden">
                  <span
                    className="anim-bar block h-full rounded-pill"
                    style={
                      { '--bar-width': `${v}%`, width: `${v}%`, backgroundColor: tone.bar } as React.CSSProperties
                    }
                  />
                </span>
                <span className="stat-num w-6 shrink-0 text-right text-micro text-muted-foreground" data-numeric>
                  {v}
                </span>
                <span className="w-10 shrink-0 text-right text-micro text-muted-foreground/70">
                  ×{p.weight}%
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {showNote ? (
        <p className="text-micro leading-relaxed text-muted-foreground">
          가중치는 검증 전 설정값입니다. 정렬 참고용으로만 쓰고, 이 점수만으로 불합격을 결정하지 마세요.
        </p>
      ) : null}
    </div>
  );
}

interface FitScoreInlineProps {
  total: number;
  className?: string;
}

/** 리스트 한 줄에 끼워 넣는 축약형. 분해 없이 총점만 — 대신 '참고' 라벨을 떼지 않는다 */
export function FitScoreInline({ total, className }: FitScoreInlineProps) {
  const v = Math.round(total);
  const tone = toneOf(v);

  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className={cn('stat-num text-small', tone.text)} data-numeric>
        {v}
      </span>
      <span className="text-micro text-muted-foreground">적합도(참고)</span>
    </span>
  );
}
