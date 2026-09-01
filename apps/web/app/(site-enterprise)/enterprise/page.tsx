import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ENTERPRISE_PLANS, ENTERPRISE_TESTS } from '@/data/tests/enterprise';
import { JOB_FAMILIES, INDUSTRIES } from '@/data/roles/families';
import { RESOLVED_ROLES } from '@/lib/role-matching';

export const metadata = {
  title: '기업 서비스 — 직무 기준으로 후보를 정렬합니다',
  description:
    '직무별 요구 역량을 기준으로 지원자를 정렬합니다. 산출 근거를 열어 두고, 검증되지 않은 부분은 검증되지 않았다고 표시합니다.',
};

/*
 * 카피 방향
 *
 * 예전 문구는 "객관적이고 정밀한 인재 분석", "채용 적합도 예측"이었다.
 * 이 제품은 규준 표본이 없고 가중치도 준거 타당도로 검증되지 않았다.
 * 그런 상태에서 "예측"과 "정밀"을 파는 것은, 결과 화면에서 "맞히는 척하지
 * 않습니다"라고 적어 둔 것과 정면으로 부딪힌다.
 *
 * 그래서 파는 것을 바꿨다. 정확도를 파는 대신 "무엇을 근거로 정렬했는지
 * 설명할 수 있는 상태"를 판다. 채용 담당자에게 실제로 필요한 것이기도 하고,
 * 지원자가 설명을 요구했을 때 답할 수 있어야 하는 것이기도 하다.
 */

const HOW = [
  {
    n: '01',
    title: '직무를 고릅니다',
    body: `업종 ${INDUSTRIES.length}개 · 직군 ${JOB_FAMILIES.length}개 · 직무 ${RESOLVED_ROLES.length}개 중에서 고르면, 그 직무에서 중요한 역량이 초안으로 채워집니다.`,
  },
  {
    n: '02',
    title: '기준을 고칩니다',
    body: '초안을 그대로 쓰지 않습니다. 우리 팀 상황에 맞게 고친 값이 이 공고의 기준이 되고, 고쳤다는 사실도 함께 기록됩니다.',
  },
  {
    n: '03',
    title: '정렬해서 봅니다',
    body: '기준에 못 미치는 만큼만 감점합니다. 넘친다고 가점하지 않습니다. 무엇으로 계산했는지 항목별로 열어 둡니다.',
  },
];

const HONESTY = [
  {
    q: '규준이 없으면 백분위라고 부르지 않습니다',
    a: '표본이 쌓이기 전까지 점수는 지원자 내부의 상대적 크기입니다. 후보자 간 직접 비교에 쓰지 마시라고 화면에 적어 둡니다.',
  },
  {
    q: '생년월일과 성별은 채용 점수에 넣지 않습니다',
    a: '개인 결과 화면에는 사주·사상체질이 남지만, 기업으로 전달되는 능력치에서는 제외하고 다시 정규화합니다. 그래서 두 화면의 숫자가 다를 수 있고, 그 이유도 표시합니다.',
  },
  {
    q: '측정되지 않은 항목에 기본값을 넣지 않습니다',
    a: '컬처핏 문항에 답하지 않은 후보는 컬처핏이 계산에서 빠집니다. 중간값을 채워 넣으면 아무것도 모르는 후보가 중간 순위에 자리를 잡습니다.',
  },
  {
    q: '가중치는 아직 검증되지 않은 설정값입니다',
    a: '능력 60% · 컬처 25% · 조건 15%. 실제 채용 결과로 교정한 값이 아니라고 담당자 화면에도 그대로 적어 둡니다.',
  },
];

const FAQ = [
  {
    q: '이 점수만 보고 뽑아도 되나요',
    a: '안 됩니다. 정렬을 돕는 참고 지표입니다. 성격검사만으로 직무 성과를 예측하는 힘은 원래 약하고, 작업 표본이나 구조화 면접과 함께 쓰셔야 합니다. 자동 산출된 점수만으로 불합격을 결정하지 마세요.',
  },
  {
    q: '지원자가 설명을 요구하면',
    a: '적합도가 어떤 항목으로 계산됐는지, 각 항목 점수가 얼마인지 화면에서 그대로 보실 수 있습니다. 지원자는 자동화된 평가에 대해 설명과 사람의 재검토를 요청할 수 있습니다.',
  },
  {
    q: '기존 ATS와 같이 쓸 수 있나요',
    a: '전형 단계 관리는 내장되어 있습니다. 외부 ATS 연동은 Enterprise 플랜에서 논의합니다.',
  },
  {
    q: '후보자 데이터는 어떻게 관리되나요',
    a: '구직자가 프로필을 공개한 경우에만 노출되고, 공개 범위는 본인이 언제든 되돌릴 수 있습니다.',
  },
];

export default function EnterprisePage() {
  const testsByCategory = [
    { label: '인지능력', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'cognitive') },
    { label: '역량 평가', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'competency') },
    { label: '조직문화', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'culture') },
  ];

  return (
    <>
      {/* 히어로 */}
      <section className="shell py-16 lg:py-24">
        <div className="flex max-w-[46rem] flex-col items-start">
          <p className="eyebrow">기업 서비스</p>
          <h1 className="mt-4 text-display">
            직무 기준으로
            <br />
            후보를 정렬합니다
          </h1>
          <p className="mt-6 max-w-[42ch] text-lead text-muted-foreground">
            공고에 직무를 지정하면 그 직무에서 중요한 역량이 채워집니다. 지원자는 그 기준으로
            정렬되고, 무엇을 근거로 그렇게 정렬됐는지 항목별로 열려 있습니다.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/company/register">기업 가입하기</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/start">검사 먼저 해보기</Link>
            </Button>
          </div>

          <p className="mt-5 text-small text-muted-foreground">
            직무 {RESOLVED_ROLES.length}개 · 능력치 30개 · 조직문화 4축
          </p>
        </div>
      </section>

      <div className="shell">
        <div className="rule" />
      </div>

      {/* 어떻게 */}
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">어떻게 쓰나</p>
            <h2 className="mt-3 text-h2">공고 하나에 3분</h2>
            <p className="mt-4 max-w-[34ch] text-body text-muted-foreground">
              빈 체크박스를 주고 알아서 고르라고 하지 않습니다. 직무를 고르면 초안이 채워지고,
              담당자는 고치기만 하면 됩니다.
            </p>
          </div>

          <ol className="flex flex-col">
            {HOW.map((h) => (
              <li key={h.n} className="flex gap-5 border-t border-border py-6 last:border-b">
                <span className="stat-num w-7 shrink-0 text-small text-muted-foreground">
                  {h.n}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-h4">{h.title}</span>
                  <span className="max-w-[52ch] text-small leading-relaxed text-muted-foreground">
                    {h.body}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 정직성 — 이 페이지의 핵심 */}
      <section className="bg-sunk py-16 lg:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">먼저 밝힙니다</p>
              <h2 className="mt-3 text-h2">
                파는 것은 정확도가
                <br />
                아닙니다
              </h2>
              <p className="mt-4 max-w-[34ch] text-body text-muted-foreground">
                우리가 드릴 수 있는 것은 &ldquo;무엇을 근거로 정렬했는지 설명할 수 있는 상태&rdquo;입니다.
                지원자가 물었을 때 답할 수 있어야 하니까요.
              </p>
            </div>

            <dl className="flex flex-col">
              {HONESTY.map((h) => (
                <div key={h.q} className="border-t border-border py-6 last:border-b">
                  <dt className="text-h4">{h.q}</dt>
                  <dd className="mt-2 max-w-[60ch] text-body leading-relaxed text-muted-foreground">
                    {h.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 기업 전용 검사 */}
      <section className="shell py-16 lg:py-24">
        <p className="eyebrow">기업 플랜에서 추가되는 검사</p>
        <h2 className="mt-3 max-w-[24ch] text-h2">
          성격검사만으로는 부족한 부분을 채웁니다
        </h2>
        <p className="mt-4 max-w-[52ch] text-body text-muted-foreground">
          성격검사가 직무 성과를 설명하는 힘은 원래 크지 않습니다. 인지능력과 역량 평가를
          함께 보셔야 합니다.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {testsByCategory.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <h3 className="text-h4">{group.label}</h3>
              <ul className="flex flex-col gap-2">
                {group.tests.map((test) => (
                  <li key={test.name} className="flex flex-col gap-0.5">
                    <span className="text-small font-medium">{test.name}</span>
                    {test.description ? (
                      <span className="text-tiny text-muted-foreground">{test.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 요금제 */}
      <section className="shell py-16 lg:py-24">
        <p className="eyebrow">요금제</p>
        <h2 className="mt-3 text-h2">쓰는 만큼</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ENTERPRISE_PLANS.map((plan) => {
            const featured = plan.id === 'business';
            return (
              <div
                key={plan.id}
                className={
                  featured
                    ? 'flex flex-col gap-4 rounded-card bg-action px-7 py-8 text-action-foreground'
                    : 'flex flex-col gap-4 rounded-card border border-border px-7 py-8'
                }
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-h4">{plan.name}</h3>
                  {featured ? (
                    <span className="rounded-pill bg-action-foreground/15 px-2 py-0.5 text-micro font-semibold">
                      많이 선택
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="stat-num text-h3">{plan.price}</span>
                  {plan.pricePerTest ? (
                    <span
                      className={
                        featured
                          ? 'text-small text-action-foreground/70'
                          : 'text-small text-muted-foreground'
                      }
                    >
                      {plan.pricePerTest}
                    </span>
                  ) : null}
                </div>

                <ul className="flex flex-1 flex-col gap-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={
                        featured
                          ? 'flex items-start gap-2 text-small text-action-foreground/85'
                          : 'flex items-start gap-2 text-small text-muted-foreground'
                      }
                    >
                      <span
                        className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-60"
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  block
                  variant={featured ? undefined : 'outline'}
                  className={featured ? 'bg-action-foreground text-action hover:opacity-90' : undefined}
                >
                  <Link
                    href={
                      plan.id === 'enterprise'
                        ? 'mailto:enterprise@metaphoi.com'
                        : '/company/register'
                    }
                  >
                    {plan.id === 'enterprise' ? '문의하기' : '시작하기'}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">자주 묻는 것</p>
            <h2 className="mt-3 text-h2">먼저 답합니다</h2>
          </div>
          <dl className="flex flex-col">
            {FAQ.map((f) => (
              <div key={f.q} className="border-t border-border py-6 last:border-b">
                <dt className="text-h4">{f.q}</dt>
                <dd className="mt-2 max-w-[60ch] text-body leading-relaxed text-muted-foreground">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 마무리 */}
      <section className="shell pb-24 lg:pb-32">
        <div className="flex flex-col items-start gap-5 rounded-card bg-action px-8 py-14 text-action-foreground sm:px-14">
          <h2 className="max-w-[18ch] text-h1">공고 하나로 먼저 확인해 보세요</h2>
          <p className="max-w-[42ch] text-lead text-action-foreground/70">
            가입하고 공고를 하나 올리면, 직무 기준이 어떻게 채워지고 후보가 어떻게 정렬되는지
            바로 보실 수 있습니다.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-2 bg-action-foreground text-action hover:opacity-90"
          >
            <Link href="/company/register">기업 가입하기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
