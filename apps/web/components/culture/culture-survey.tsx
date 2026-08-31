'use client';

import { useState } from 'react';
import {
  CULTURE_ITEMS,
  CULTURE_DIMENSIONS,
  scoreCultureResponses,
  type CultureKey,
  type CultureProfile,
} from '@/data/culture/cvf';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * 배점 방식
 *
 * 원 도구(OCAI)는 문항마다 100점을 네 항목에 나눠 배분하게 한다.
 * 그대로 옮기면 휴대폰에서 슬라이더 네 개를 24번 조작해야 해서 아무도
 * 끝까지 답하지 않는다.
 *
 * 그래서 "가장 가까운 것"과 "그 다음"만 고르게 하고 나머지 둘은 같은
 * 몫으로 나눈다. 문항당 두 번, 총 열두 번이면 끝난다.
 *
 * 강제배분의 핵심 — "다 중요하다"고 답할 수 없게 하는 것 — 은 그대로
 * 유지된다. 잃는 것은 3위와 4위 사이의 해상도인데, 네 사분면 프로필을
 * 만드는 데는 1·2위가 사실상 다 결정한다.
 */
const FIRST_POINTS = 40;
const SECOND_POINTS = 30;
const REST_POINTS = 15;

type Audience = 'seeker' | 'company';

interface CultureSurveyProps {
  audience: Audience;
  initial?: Record<string, Partial<CultureProfile>>;
  onComplete: (result: {
    profile: CultureProfile;
    responses: Record<string, Partial<CultureProfile>>;
  }) => void;
  onCancel?: () => void;
}

export function CultureSurvey({ audience, initial, onComplete, onCancel }: CultureSurveyProps) {
  const [picks, setPicks] = useState<Record<string, CultureKey[]>>(() => {
    // 저장된 응답이 있으면 상위 두 개를 복원한다
    const restored: Record<string, CultureKey[]> = {};
    Object.entries(initial ?? {}).forEach(([id, dist]) => {
      const ordered = (Object.entries(dist) as [CultureKey, number][])
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .slice(0, 2)
        .map(([k]) => k);
      if (ordered.length === 2) restored[id] = ordered;
    });
    return restored;
  });

  const answered = CULTURE_ITEMS.filter((i) => (picks[i.id]?.length ?? 0) === 2).length;
  const done = answered === CULTURE_ITEMS.length;

  function toggle(itemId: string, key: CultureKey) {
    setPicks((prev) => {
      const cur = prev[itemId] ?? [];
      if (cur.includes(key)) return { ...prev, [itemId]: cur.filter((k) => k !== key) };
      if (cur.length >= 2) return { ...prev, [itemId]: [cur[1], key] }; // 오래된 선택을 밀어낸다
      return { ...prev, [itemId]: [...cur, key] };
    });
  }

  function submit() {
    const responses: Record<string, Partial<CultureProfile>> = {};

    CULTURE_ITEMS.forEach((item) => {
      const chosen = picks[item.id] ?? [];
      if (chosen.length !== 2) return;
      const dist: Partial<CultureProfile> = {};
      CULTURE_DIMENSIONS.forEach(({ key }) => {
        dist[key] =
          key === chosen[0] ? FIRST_POINTS : key === chosen[1] ? SECOND_POINTS : REST_POINTS;
      });
      responses[item.id] = dist;
    });

    const profile = scoreCultureResponses(responses);
    if (profile) onComplete({ profile, responses });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">조직문화</p>
          <span className="stat-num text-tiny text-muted-foreground" data-numeric>
            {answered} / {CULTURE_ITEMS.length}
          </span>
        </div>
        <p className="text-small leading-relaxed text-muted-foreground">
          {audience === 'seeker'
            ? '문항마다 가장 가까운 것과 그 다음을 순서대로 골라 주세요. 정답은 없고, 어느 쪽이 더 편한지를 봅니다.'
            : '이상적인 모습이 아니라 지금 실제 모습을 골라 주세요. 실제와 다르게 답하면 맞지 않는 사람이 매칭됩니다.'}
        </p>
      </div>

      {CULTURE_ITEMS.map((item) => {
        const chosen = picks[item.id] ?? [];
        return (
          <fieldset key={item.id} className="flex flex-col gap-3">
            <legend className="flex flex-col gap-1">
              <span className="text-tiny text-muted-foreground">{item.aspect}</span>
              <span className="text-body font-semibold">
                {audience === 'seeker' ? item.seekerPrompt : item.companyPrompt}
              </span>
            </legend>

            <div className="flex flex-col gap-2">
              {CULTURE_DIMENSIONS.map(({ key }) => {
                const rank = chosen.indexOf(key);
                const selected = rank >= 0;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(item.id, key)}
                    className={cn(
                      'flex items-center gap-3 rounded-control border px-4 py-3.5 text-left text-small',
                      'transition-[background-color,border-color] duration-fast ease-std',
                      selected
                        ? 'border-action bg-action text-action-foreground'
                        : 'border-border hover:border-border-strong hover:bg-sunk'
                    )}
                  >
                    <span
                      className={cn(
                        'stat-num flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-micro',
                        selected
                          ? 'bg-action-foreground text-action'
                          : 'border border-border text-transparent'
                      )}
                      aria-hidden="true"
                    >
                      {selected ? rank + 1 : '0'}
                    </span>
                    {item.options[key]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row-reverse">
        <Button size="lg" onClick={submit} disabled={!done} block={!onCancel}>
          {done ? '저장하기' : `${CULTURE_ITEMS.length - answered}문항 남음`}
        </Button>
        {onCancel && (
          <Button size="lg" variant="ghost" onClick={onCancel}>
            나중에 하기
          </Button>
        )}
      </div>
    </div>
  );
}

/** 저장된 프로필을 읽기 전용으로 보여준다 */
export function CultureProfileView({
  profile,
  className,
}: {
  profile: CultureProfile;
  className?: string;
}) {
  const max = Math.max(...CULTURE_DIMENSIONS.map((d) => profile[d.key] ?? 0), 1);

  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {CULTURE_DIMENSIONS.map((d) => {
        const v = profile[d.key] ?? 0;
        return (
          <li key={d.key} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-tiny text-muted-foreground">{d.name}</span>
            <span className="sunk h-1.5 min-w-[4rem] flex-1 overflow-hidden">
              <span
                className="block h-full rounded-pill bg-foreground/70"
                style={{ width: `${(v / max) * 100}%` }}
              />
            </span>
            <span className="stat-num w-7 shrink-0 text-right text-tiny" data-numeric>
              {v}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
