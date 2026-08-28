import { NormStatusBadge } from '@/components/measure/honesty';

/*
 * 히어로 오른쪽에 놓는 결과 미리보기.
 *
 * 추상적인 그래픽 대신 실제로 받게 될 화면을 보여준다.
 * 랜딩에서 제품을 설명하는 가장 짧은 방법은 결과물을 그냥 보여주는 것이다.
 * 여기 쓰인 숫자는 예시이고, 규준 없음 배지도 실제 화면과 똑같이 달아 둔다.
 */

const AXES = [
  { name: '정신력', token: 'cat-mental', value: 78 },
  { name: '사회성', token: 'cat-social', value: 54 },
  { name: '업무역량', token: 'cat-work', value: 71 },
  { name: '신체/감각', token: 'cat-physical', value: 46 },
  { name: '잠재력', token: 'cat-potential', value: 83 },
];

const TOP = [
  { name: '성장가능성', value: 89 },
  { name: '분석력', value: 84 },
  { name: '회복탄력성', value: 81 },
];

export function StatPreview() {
  return (
    <div className="w-full max-w-[26rem] rounded-card border border-border bg-card p-6 shadow-e2 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="eyebrow">결과 미리보기</p>
          <p className="text-h4">능력치 요약</p>
        </div>
        <NormStatusBadge status="none" />
      </div>

      <ul className="mt-6 flex flex-col gap-3.5">
        {AXES.map((a, i) => (
          <li key={a.name} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-tiny text-muted-foreground">{a.name}</span>

            <span className="sunk h-1.5 min-w-[7rem] flex-1 overflow-hidden">
              <span
                className="anim-bar block h-full rounded-pill"
                style={
                  {
                    '--bar-width': `${a.value}%`,
                    width: `${a.value}%`,
                    backgroundColor: `hsl(var(--${a.token}))`,
                    animationDelay: `${120 + i * 70}ms`,
                  } as React.CSSProperties
                }
              />
            </span>

            <span className="stat-num w-7 shrink-0 text-right text-small" data-numeric>
              {a.value}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-border pt-5">
        <p className="eyebrow">상위 능력치</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {TOP.map((t) => (
            <li key={t.name} className="flex items-baseline justify-between gap-3">
              <span className="text-small">{t.name}</span>
              <span className="stat-num text-h4" data-numeric>
                {t.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
