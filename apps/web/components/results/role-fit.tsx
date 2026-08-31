'use client';

import Link from 'next/link';
import {
  BAND_LABEL,
  isDiscriminative,
  matchFamiliesForSeeker,
  matchIndustriesForSeeker,
} from '@/lib/role-matching';
import type { RiasecProfile } from '@/data/roles/types';
import { cn } from '@/lib/utils';

interface RoleFitProps {
  /** 검사에서 나온 Holland 원점수 */
  holland: Record<string, number>;
}

const BAND_TONE: Record<string, string> = {
  high: 'text-ok',
  good: 'text-foreground',
  fair: 'text-muted-foreground',
  low: 'text-muted-foreground',
};

/**
 * 잘 맞는 직군.
 *
 * 순위를 직무가 아니라 직군으로 매긴다. 같은 직군의 직무들은 흥미코드를
 * 공유해서 상관이 같게 나오는데, 그걸 "1위 백엔드 2위 프론트엔드"로
 * 세우면 모델이 구분하지 못하는 것을 구분한 척하게 된다.
 *
 * 흥미만 본다. 능력치는 규준이 없어 사람 사이 비교에 쓸 수 없으므로
 * 순위에 섞지 않는다.
 */
export function RoleFit({ holland }: RoleFitProps) {
  const riasec = {
    R: holland.R ?? 0,
    I: holland.I ?? 0,
    A: holland.A ?? 0,
    S: holland.S ?? 0,
    E: holland.E ?? 0,
    C: holland.C ?? 0,
  } as RiasecProfile;

  if (!isDiscriminative(riasec)) {
    return (
      <section className="mt-10">
        <h2 className="text-h3">잘 맞는 직군</h2>
        <div className="mt-4 rounded-card bg-sunk px-5 py-4">
          <p className="text-small leading-relaxed text-muted-foreground">
            여섯 가지 흥미 축의 점수가 서로 비슷해서 어느 쪽이 더 맞는다고 말하기 어렵습니다.
            이럴 때 순위를 매기면 근거 없는 결과가 나오므로 표시하지 않습니다.
            직업 흥미 검사를 따로 더 해 보시면 구분이 뚜렷해집니다.
          </p>
        </div>
      </section>
    );
  }

  const families = matchFamiliesForSeeker(riasec, { limit: 5 });
  const industries = matchIndustriesForSeeker(riasec).slice(0, 3);

  return (
    <section className="mt-10">
      <h2 className="text-h3">잘 맞는 직군</h2>
      <p className="mt-1 max-w-[52ch] text-small text-muted-foreground">
        Holland 직업 흥미 유형을 직업별 흥미 프로필과 대조한 결과입니다. 흥미가 맞는다는 뜻이지,
        그 일을 잘한다는 뜻은 아닙니다.
      </p>

      <ul className="mt-5 flex flex-col">
        {families.map((m, i) => (
          <li
            key={m.family.id}
            className="flex flex-col gap-2 border-t border-border py-4 last:border-b sm:flex-row sm:items-baseline sm:gap-5"
          >
            <span className="stat-num w-4 shrink-0 text-small text-muted-foreground">{i + 1}</span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-body font-semibold">{m.family.name}</span>
                <span className="text-tiny text-muted-foreground">{m.industryName}</span>
                <span className={cn('text-tiny font-semibold', BAND_TONE[m.band])}>
                  {BAND_LABEL[m.band]}
                </span>
              </div>
              <p className="text-small text-muted-foreground">{m.family.summary}</p>
              <p className="text-tiny text-muted-foreground">
                {m.roles
                  .slice(0, 4)
                  .map((r) => r.name)
                  .join(' · ')}
                {m.roles.length > 4 ? ` 외 ${m.roles.length - 4}개` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {industries.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow">업종으로 보면</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {industries.map((x) => (
              <li
                key={x.industry.id}
                className="rounded-pill bg-sunk px-3 py-1.5 text-small"
              >
                {x.industry.name}
                <span className={cn('ml-2 text-tiny font-semibold', BAND_TONE[x.band])}>
                  {BAND_LABEL[x.band]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-5 text-tiny leading-relaxed text-muted-foreground">
        직업별 흥미 프로필은 미국 노동부 O*NET이 공개한 Holland 흥미코드를 기준으로 했습니다.
        직군별 요구 역량 수치는 아직 실측 데이터로 교체되기 전의 잠정값입니다.
      </p>

      <div className="mt-5">
        <Link href="/jobs" className="text-small font-semibold text-primary underline-offset-4 hover:underline">
          이 직군의 채용 공고 보기 →
        </Link>
      </div>
    </section>
  );
}
