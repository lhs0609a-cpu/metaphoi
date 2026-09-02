import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatPreview } from './stat-preview';
import { BrowserFrame, MockupStage, PhoneFrame } from '@/components/marketing/device-frame';
import { RoleFitPreview } from './role-fit-preview';

export const metadata = {
  title: '성격검사 7개를 겹쳐 능력치 30개로',
  description:
    'MBTI, DISC, 에니어그램, Holland, 사주, 사상체질, 혈액형. 서로 다른 7가지 관점을 한 사람 위에 겹치면 취향이 아니라 수치가 남습니다. 53문항, 약 12분, 회원가입 없이.',
};

/* 검사 7종. 색을 주지 않는다 — 일곱 개를 일곱 색으로 칠하면
   무엇이 중요한지가 아니라 색이 몇 개인지만 보인다. */
const PERSPECTIVES = [
  { no: '01', name: 'MBTI', what: '성격 유형', detail: '정보를 받아들이고 결정하는 방식' },
  { no: '02', name: 'DISC', what: '행동 패턴', detail: '압박이 있을 때 나오는 반응' },
  { no: '03', name: '에니어그램', what: '내면 동기', detail: '움직이게 만드는 두려움과 욕구' },
  { no: '04', name: 'Holland', what: '직업 적성', detail: '오래 붙잡고 있어도 지치지 않는 일' },
  { no: '05', name: '사주', what: '기질', detail: '타고난 기운의 균형' },
  { no: '06', name: '사상체질', what: '체질', detail: '몸이 감당하는 방식' },
  { no: '07', name: '혈액형', what: '기질 보정', detail: '보조 지표로만 사용' },
];

const CATEGORIES = [
  { name: '정신력', token: 'cat-mental', items: '결단력 · 침착성 · 집중력 · 창의성 · 분석력 · 적응력' },
  { name: '사회성', token: 'cat-social', items: '소통능력 · 협동심 · 리더십 · 공감능력 · 영향력 · 네트워킹' },
  { name: '업무역량', token: 'cat-work', items: '실행력 · 기획력 · 문제해결 · 시간관리 · 꼼꼼함 · 멀티태스킹' },
  { name: '신체/감각', token: 'cat-physical', items: '스트레스내성 · 지구력 · 직관력 · 심미안 · 공간지각 · 언어능력' },
  { name: '잠재력', token: 'cat-potential', items: '성장가능성 · 학습속도 · 혁신성 · 회복탄력성 · 야망 · 성실성' },
];

export default function IntroPage() {
  return (
    <>
      {/* ================================================================
          히어로 — 가운데 정렬하지 않는다.
          왼쪽에 말, 오른쪽에 결과물. 무엇을 받게 되는지 첫 화면에서 보인다.
          ================================================================ */}
      <section className="shell grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div className="anim-rise flex flex-col items-start">
          <p className="eyebrow">무료 · 회원가입 없이 · 약 12분</p>

          <h1 className="mt-4 text-display">
            성격검사 7개를 겹쳐
            <br />
            <span className="text-primary">능력치 30개</span>로
          </h1>

          <p className="mt-6 max-w-[34ch] text-lead text-muted-foreground">
            검사 하나로는 사람이 설명되지 않습니다. 서로 다른 7가지 관점을 한 사람 위에 겹치면,
            취향이 아니라 수치가 남습니다.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/start">무료로 검사 시작하기</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/jobs">채용 플랫폼 둘러보기</Link>
            </Button>
          </div>

          <p className="mt-5 text-small text-muted-foreground">
            53문항 · 결과 즉시 확인 · 이메일 없이 시작
          </p>
        </div>

        {/* 추상 그래픽 대신 실제로 받게 될 화면을 기기 안에 넣어 보여준다 */}
        <MockupStage className="anim-rise w-full lg:justify-self-end">
          <BrowserFrame path="metaphoi.com/results">
            <div className="p-5 sm:p-6">
              <StatPreview bare />
            </div>
          </BrowserFrame>
        </MockupStage>
      </section>

      {/* 세 걸음 — 랜딩에서 가장 먼저 이해시켜야 하는 것은
          "무엇을 하면 무엇을 받는가"다. 글로 설명하면 스크롤을 한참 내려야
          알 수 있어서, 히어로 바로 아래에 한 줄로 놓는다 */}
      <section className="shell pb-16 lg:pb-20">
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            { n: '1', t: '문항 53개', d: '약 12분, 회원가입 없이' },
            { n: '2', t: '능력치 30개', d: '다섯 영역으로 정리' },
            { n: '3', t: '맞는 직군', d: '그 직군의 채용 공고까지' },
          ].map((s, i) => (
            <li
              key={s.n}
              className="flex items-baseline gap-3 rounded-card border border-border px-5 py-4"
            >
              <span className="stat-num shrink-0 text-small text-muted-foreground">{s.n}</span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-body font-semibold">{s.t}</span>
                <span className="text-tiny text-muted-foreground">{s.d}</span>
              </div>
              {i < 2 ? (
                <span className="ml-auto hidden shrink-0 text-muted-foreground sm:block" aria-hidden="true">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="shell">
        <div className="rule" />
      </div>

      {/* ================================================================
          검사 7종 — 카드가 아니라 목록.
          일곱 개를 나열하는 데 카드 일곱 장은 과하다.
          ================================================================ */}
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">무엇을 재는가</p>
            <h2 className="mt-3 text-h2">일곱 개의 서로 다른 질문</h2>
            <p className="mt-4 max-w-[36ch] text-body text-muted-foreground">
              같은 사람을 일곱 번 다르게 묻습니다. 답이 겹치는 곳이 그 사람의 단단한 부분이고,
              어긋나는 곳이 상황을 타는 부분입니다.
            </p>
          </div>

          <ul className="flex flex-col">
            {PERSPECTIVES.map((p) => (
              <li
                key={p.no}
                className="flex items-baseline gap-4 border-t border-border py-5 last:border-b sm:gap-6"
              >
                <span className="stat-num w-7 shrink-0 text-small text-muted-foreground">{p.no}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="w-28 shrink-0 text-body font-semibold">{p.name}</span>
                  <span className="w-20 shrink-0 text-small text-muted-foreground">{p.what}</span>
                  <span className="text-small text-muted-foreground">{p.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          결과 — 여기서만 색을 쓴다. 다섯 축에 다섯 색.
          ================================================================ */}
      <section className="bg-sunk py-16 lg:py-24">
        <div className="shell">
          <p className="eyebrow">무엇이 남는가</p>
          <h2 className="mt-3 max-w-[20ch] text-h2">
            문항 53개가 능력치 30개로 정리됩니다
          </h2>

          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${c.token}))` }}
                    aria-hidden="true"
                  />
                  <h3 className="text-h4">{c.name}</h3>
                  <span className="stat-num text-small text-muted-foreground">6</span>
                </div>
                <p className="text-small leading-relaxed text-muted-foreground">{c.items}</p>
              </div>
            ))}

            <div className="flex flex-col justify-center gap-3 rounded-card border border-border bg-card p-6">
              <p className="text-small text-muted-foreground">내 능력치는 어떻게 나올까</p>
              <Button asChild block>
                <Link href="/start">검사하고 확인하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          실제 화면 — 무엇을 받는지는 말보다 화면이 빠르다
          ================================================================ */}
      <section className="shell py-16 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="flex flex-col items-start">
            <p className="eyebrow">검사가 끝나면</p>
            <h2 className="mt-3 max-w-[18ch] text-h2">
              흥미와 맞는 직군까지 이어집니다
            </h2>
            <p className="mt-4 max-w-[42ch] text-body text-muted-foreground">
              능력치만 보여주고 끝내지 않습니다. Holland 직업 흥미를 직업별 흥미 프로필과
              대조해 어떤 직군이 맞는지, 그 직군에 어떤 공고가 있는지까지 연결합니다.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {[
                '능력치 30개와 다섯 영역 요약',
                '잘 맞는 직군과 업종',
                '그 직군의 채용 공고',
              ].map((t) => (
                <li key={t} className="flex items-baseline gap-2.5 text-body">
                  <span
                    className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <RoleFitPreview />
          </div>
        </div>
      </section>

      {/* ================================================================
          정직성 — 이 제품의 진짜 차별점.
          대부분의 성격검사가 하지 않는 말을 여기서 한다.
          ================================================================ */}
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">우리가 말하지 않는 것</p>
            <h2 className="mt-3 text-h2">
              맞히는 척하지
              <br />
              않습니다
            </h2>
          </div>

          <dl className="flex flex-col">
            {[
              {
                q: '이 점수는 백분위가 아닙니다',
                a: '규준 표본이 쌓이기 전까지는 순위를 낼 수 없습니다. 지금 숫자는 당신 안에서의 상대적 크기이고, 화면에도 그렇게 적어 둡니다.',
              },
              {
                q: '사주와 혈액형은 보조 지표입니다',
                a: '근거의 무게가 다르므로 같은 비중으로 섞지 않습니다. 채용에 쓰이는 값에서는 아예 뺍니다.',
              },
              {
                q: '적합도만으로 사람을 거르지 마세요',
                a: '매칭 점수는 정렬을 돕는 참고 지표입니다. 가중치가 아직 검증되지 않았다고 채용 담당자 화면에도 적어 둡니다.',
              },
            ].map((item) => (
              <div key={item.q} className="border-t border-border py-6 last:border-b">
                <dt className="text-h4">{item.q}</dt>
                <dd className="mt-2 max-w-[60ch] text-body text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================================================================
          두 갈래 — 개인과 기업
          ================================================================ */}
      <section className="shell pb-16 lg:pb-24">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-card border border-border p-8">
            <p className="eyebrow">개인</p>
            <h3 className="text-h3">나를 숫자로 봅니다</h3>
            <p className="flex-1 text-body text-muted-foreground">
              검사하고 결과를 받고, 원하면 프로필을 공개해 기업의 제안을 받습니다.
              공개 범위는 언제든 되돌릴 수 있습니다.
            </p>
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href="/start">검사 시작하기</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-card border border-border p-8">
            <p className="eyebrow">기업</p>
            <h3 className="text-h3">능력치로 후보를 찾습니다</h3>
            <p className="flex-1 text-body text-muted-foreground">
              공고에 요구 능력치를 설정하면 적합도 순으로 후보가 정렬됩니다.
              팀 성향을 등록하면 컬처핏까지 계산합니다.
            </p>
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href="/enterprise">기업 서비스 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          마무리
          ================================================================ */}
      <section className="shell pb-24 lg:pb-32">
        <div className="flex flex-col items-start gap-6 rounded-card bg-action px-8 py-14 text-action-foreground sm:px-14 lg:py-20">
          <h2 className="max-w-[16ch] text-h1">
            12분이면 내가 숫자로 보입니다
          </h2>
          <p className="max-w-[40ch] text-lead text-action-foreground/70">
            회원가입도, 이메일도 필요 없습니다. 결과가 마음에 들면 그때 저장하세요.
          </p>
          <Button asChild size="lg" variant="subtle" className="mt-2 bg-action-foreground text-action hover:opacity-90">
            <Link href="/start">무료로 검사 시작하기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
