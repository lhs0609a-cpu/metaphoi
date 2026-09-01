'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, Select, Textarea } from '@/components/ui/field';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton, SkeletonRows } from '@/components/ui/states';
import { TableFrame, Table, THead, TBody, Tr, Th, Td } from '@/components/ui/table';
import { NormStatusBadge } from '@/components/measure/honesty';
import { StatBarCompact } from '@/components/measure/stat-bar';
import { FitScore } from '@/components/measure/fit-score';
import { PageHeader, StatTile } from '@/components/layouts/page-header';
import { ABILITY_CATALOG } from '@/lib/abilities-scoring';
import { CULTURE_DIMENSIONS } from '@/data/culture/cvf';
import { INDUSTRIES, JOB_FAMILIES } from '@/data/roles/families';
import { RESOLVED_ROLES } from '@/lib/role-matching';

/**
 * 디자인 시스템 스펙.
 *
 * 왜 문서가 아니라 페이지인가
 *   규칙을 마크다운에 적어 두면 코드가 바뀔 때 같이 바뀌지 않는다.
 *   6개월 뒤에는 문서가 틀린 말을 하고 있고, 그때부터 아무도 문서를
 *   보지 않는다. 여기서는 실제 토큰과 실제 컴포넌트를 그대로 렌더링한다.
 *   Button 의 variant 를 고치면 이 페이지의 견본도 같이 바뀐다.
 *
 * 색인에서 제외한다. 내부용이고 검색 결과에 나올 이유가 없다.
 */

const TYPE_SCALE = [
  { cls: 'text-display', name: 'display', use: '랜딩 히어로 한 곳' },
  { cls: 'text-h1', name: 'h1', use: '페이지 제목' },
  { cls: 'text-h2', name: 'h2', use: '섹션 제목' },
  { cls: 'text-h3', name: 'h3', use: '하위 섹션' },
  { cls: 'text-h4', name: 'h4', use: '카드 제목' },
  { cls: 'text-lead', name: 'lead', use: '제목 아래 설명' },
  { cls: 'text-body', name: 'body', use: '본문 (16px)' },
  { cls: 'text-small', name: 'small', use: '보조 설명, 표 내용' },
  { cls: 'text-tiny', name: 'tiny', use: '캡션, 라벨' },
  { cls: 'text-micro', name: 'micro', use: '각주, 고지' },
];

const SURFACE_TOKENS = [
  { token: '--background', use: '페이지 바탕' },
  { token: '--card', use: '카드 면' },
  { token: '--sunk', use: '한 단계 들어간 면 — 표 헤더, 막대 트랙' },
  { token: '--border', use: '기본 경계' },
  { token: '--border-strong', use: '강조 경계 — outline 버튼' },
  { token: '--muted-foreground', use: '보조 글자' },
];

const CATEGORY_TOKENS = [
  { token: 'cat-mental', name: '정신력' },
  { token: 'cat-social', name: '사회성' },
  { token: 'cat-work', name: '업무역량' },
  { token: 'cat-physical', name: '신체/감각' },
  { token: 'cat-potential', name: '잠재력' },
];

const SEMANTIC = [
  { name: 'ok', use: '성공, 활성, 좋은 상태' },
  { name: 'warn', use: '주의 — 잠정값, 응답 일관성 낮음' },
  { name: 'danger', use: '실패, 되돌릴 수 없는 동작' },
  { name: 'info', use: '중립 안내' },
];

const BUTTON_VARIANTS = ['primary', 'outline', 'ghost', 'subtle', 'danger', 'link'] as const;
const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12">
      <h2 className="text-h2">{title}</h2>
      {lead && <p className="mt-2 max-w-[62ch] text-body text-muted-foreground">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border-l-2 border-foreground bg-sunk px-5 py-4">
      <p className="text-small leading-relaxed">{children}</p>
    </div>
  );
}

export default function DesignSystemPage() {
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');

  return (
    <div className="shell max-w-[64rem] py-14">
      <header className="flex flex-col items-start gap-3 pb-10">
        <p className="eyebrow">내부 문서</p>
        <h1 className="text-h1">Metaphoi 디자인 시스템</h1>
        <p className="max-w-[58ch] text-lead text-muted-foreground">
          이 페이지는 실제 토큰과 실제 컴포넌트를 그대로 렌더링합니다. 코드를 고치면 여기
          견본도 같이 바뀌므로, 문서가 틀린 말을 하게 되지 않습니다.
        </p>
        <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {[
            ['principles', '원칙'],
            ['type', '타이포'],
            ['color', '색'],
            ['space', '간격·곡률·밀도'],
            ['buttons', '버튼'],
            ['forms', '입력'],
            ['data', '데이터 표시'],
            ['honesty', '측정 정직성'],
            ['taxonomy', '직무 택소노미'],
            ['antipatterns', '하지 않는 것'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* ── 원칙 ─────────────────────────────────────────────── */}
      <Section
        id="principles"
        title="세 가지 원칙"
        lead="나머지 규칙은 전부 이 셋에서 나옵니다. 판단이 갈릴 때 여기로 돌아옵니다."
      >
        <div className="flex flex-col gap-4">
          <Rule>
            <strong>색은 데이터의 것이다.</strong> 장식에 쓰지 않는다. 동작(버튼)은 잉크 블랙,
            강조와 링크는 시그널 청록, 능력 카테고리 5색은 오직 그 다섯 축에만. 청록을 버튼에
            쓰면 화면에서 가장 눈에 띄는 색이 &ldquo;누르는 곳&rdquo;이 되고, 정작 색으로 말해야 할
            능력치와 적합도가 뒤로 밀린다.
          </Rule>
          <Rule>
            <strong>위계는 타이포가 만든다.</strong> 테두리와 배경색으로 만들지 않는다.
            크기·굵기·색농도 셋으로 층을 나누고 그 이상은 쓰지 않는다. 카드가 열 장 쌓이면
            무엇이 중요한지 알 수 없다.
          </Rule>
          <Rule>
            <strong>모르는 것은 모른다고 말한다.</strong> 측정되지 않은 값에 기본값을 채워 넣지
            않고, 구분하지 못하는 것에 순위를 매기지 않는다. 이 제품은 사람을 재서 채용에
            쓰이므로, 근거의 질을 숨기면 사람이 다친다.
          </Rule>
        </div>
      </Section>

      {/* ── 타이포 ───────────────────────────────────────────── */}
      <Section
        id="type"
        title="타이포그래피"
        lead="Pretendard Variable 한 벌. 라틴과 한글을 한 골격으로 통일합니다."
      >
        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-border p-5">
              <p className="eyebrow">본문·제목</p>
              <p className="mt-2 text-h4">Pretendard Variable</p>
              <p className="mt-1 text-small text-muted-foreground">
                CDN dynamic-subset. 쓰인 글자만 내려받습니다.
              </p>
            </div>
            <div className="rounded-card border border-border p-5">
              <p className="eyebrow">숫자</p>
              <p className="stat-num mt-2 text-h4">0123456789</p>
              <p className="mt-1 text-small text-muted-foreground">
                별도 mono 를 쓰지 않고 <code className="text-tiny">.stat-num</code> 이
                tabular-nums 를 켭니다. 본문과 같은 골격이라 화면이 조용해집니다.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">스케일</p>
            <ul className="flex flex-col">
              {TYPE_SCALE.map((t) => (
                <li
                  key={t.cls}
                  className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-border py-4 last:border-b"
                >
                  <code className="w-28 shrink-0 text-tiny text-muted-foreground">{t.cls}</code>
                  <span className={`${t.cls} min-w-0 flex-1 truncate`}>
                    사람을 숫자로 옮깁니다
                  </span>
                  <span className="text-tiny text-muted-foreground">{t.use}</span>
                </li>
              ))}
            </ul>
          </div>

          <Rule>
            제목이 커질수록 자간을 더 조인다 (h4 −0.018em → display −0.04em). 한글 큰 글씨는
            기본 자간이면 성기게 보인다. display 와 h1 은 <code>clamp()</code> 로 뷰포트를
            따른다 — 모바일에서 헤드라인이 네 줄로 깨지는 것이 큰 글씨보다 나쁘다.
          </Rule>
        </div>
      </Section>

      {/* ── 색 ───────────────────────────────────────────────── */}
      <Section id="color" title="색" lead="역할이 정해져 있습니다. 예쁘다고 가져다 쓰지 않습니다.">
        <div className="flex flex-col gap-8">
          <div>
            <p className="eyebrow mb-3">동작과 강조</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-border p-5">
                <div className="h-12 rounded-control bg-action" />
                <p className="mt-3 text-small font-semibold">action — 주 버튼</p>
                <p className="mt-1 text-tiny text-muted-foreground">
                  라이트에서 잉크, 다크에서 흰색으로 자동 반전. 반드시{' '}
                  <code>bg-action / text-action-foreground</code> 쌍으로 쓴다.
                </p>
              </div>
              <div className="rounded-card border border-border p-5">
                <div className="h-12 rounded-control bg-primary" />
                <p className="mt-3 text-small font-semibold">primary — 링크·활성·데이터 강조</p>
                <p className="mt-1 text-tiny text-muted-foreground">
                  시그널 청록. 버튼 배경으로는 쓰지 않는다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">능력 카테고리 5색 — 이 다섯 축에만</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {CATEGORY_TOKENS.map((c) => (
                <div key={c.token} className="rounded-card border border-border p-4">
                  <div
                    className="h-10 rounded-control"
                    style={{ backgroundColor: `hsl(var(--${c.token}))` }}
                  />
                  <p className="mt-2 text-tiny font-semibold">{c.name}</p>
                  <code className="text-micro text-muted-foreground">--{c.token}</code>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">의미 색</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {SEMANTIC.map((s) => (
                <div key={s.name} className="rounded-card border border-border p-4">
                  <div className="flex gap-2">
                    <div
                      className="h-10 flex-1 rounded-control"
                      style={{ backgroundColor: `hsl(var(--${s.name}))` }}
                    />
                    <div
                      className="h-10 flex-1 rounded-control"
                      style={{ backgroundColor: `hsl(var(--${s.name}-soft))` }}
                    />
                  </div>
                  <p className="mt-2 text-tiny font-semibold">{s.name}</p>
                  <p className="text-micro text-muted-foreground">{s.use}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">표면 토큰</p>
            <ul className="flex flex-col">
              {SURFACE_TOKENS.map((t) => (
                <li
                  key={t.token}
                  className="flex flex-wrap items-baseline gap-x-5 border-t border-border py-3 last:border-b"
                >
                  <code className="w-40 shrink-0 text-tiny">{t.token}</code>
                  <span className="text-small text-muted-foreground">{t.use}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── 간격·곡률·밀도 ───────────────────────────────────── */}
      <Section
        id="space"
        title="간격 · 곡률 · 밀도"
        lead="표면(surface)이 밀도를 결정합니다. 색과 타입 스케일은 두 모드가 완전히 공유합니다."
      >
        <div className="flex flex-col gap-6">
          <TableFrame>
            <Table>
              <THead>
                <Tr>
                  <Th>토큰</Th>
                  <Th>play (B2C)</Th>
                  <Th>ops (B2B·목록)</Th>
                  <Th>쓰는 곳</Th>
                </Tr>
              </THead>
              <TBody>
                {[
                  ['--row-h', '3.5rem', '2.75rem', '표·리스트 한 줄'],
                  ['--radius-card', '1.25rem', '0.875rem', '카드'],
                  ['--radius-control', '0.875rem', '0.625rem', '버튼·입력'],
                  ['--pad-inline', '1.5rem', '1.125rem', '카드 좌우 여백'],
                  ['--motion-scale', '1', '0.45', '모션 크기 배율'],
                ].map((r) => (
                  <Tr key={r[0]}>
                    <Td>
                      <code className="text-tiny">{r[0]}</code>
                    </Td>
                    <Td>{r[1]}</Td>
                    <Td>{r[2]}</Td>
                    <Td>{r[3]}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableFrame>

          <Rule>
            <code>&lt;Surface mode=&quot;play|ops&quot;&gt;</code> 로 감싸면 그 안쪽 전체가 바뀐다.
            play 는 랜딩·검사·결과, ops 는 기업 화면·채용 목록. 밀도만 다르고 색은 같으므로
            두 세계를 오가도 다른 서비스처럼 보이지 않는다.
          </Rule>

          <div>
            <p className="eyebrow mb-3">고도 — 그림자로 위계를 만들지 않는다</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {['e1', 'e2', 'e3'].map((e) => (
                <div key={e} className={`rounded-card bg-card p-6 shadow-${e}`}>
                  <code className="text-tiny">shadow-{e}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 버튼 ─────────────────────────────────────────────── */}
      <Section
        id="buttons"
        title="버튼"
        lead="주 동작은 화면당 하나입니다. 두 개가 같은 무게로 나란히 있으면 무엇을 눌러야 할지 알 수 없습니다."
      >
        <div className="flex flex-col gap-8">
          <div>
            <p className="eyebrow mb-3">variant</p>
            <div className="flex flex-wrap items-center gap-3">
              {BUTTON_VARIANTS.map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">size — 최소 타깃 44px 아래로 내리지 않는다</p>
            <div className="flex flex-wrap items-center gap-3">
              {BUTTON_SIZES.map((s) => (
                <Button key={s} size={s}>
                  size {s}
                </Button>
              ))}
              <Button size="icon" variant="outline" aria-label="아이콘 버튼">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">상태</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
              <Button block className="max-w-xs">
                block
              </Button>
            </div>
          </div>

          <Rule>
            버튼 위를 쓸고 지나가는 광택이나 맥박 애니메이션을 쓰지 않는다. 결제 직전 화면에서
            시선을 끌어야 하는 것은 가격과 무엇을 받는지이지 버튼의 반짝임이 아니다.
          </Rule>
        </div>
      </Section>

      {/* ── 입력 ─────────────────────────────────────────────── */}
      <Section
        id="forms"
        title="입력"
        lead="선택 상태는 브랜드색이 아니라 잉크로 채웁니다. 브랜드색이 '선택됨'과 '누를 수 있음' 두 뜻을 동시에 가지면 안 됩니다."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Field label="기본" htmlFor="ds-a" hint="설명은 컨트롤 아래에" required>
              <Input id="ds-a" placeholder="입력하세요" />
            </Field>
            <Field label="오류" htmlFor="ds-b" error="이미 사용 중인 이메일입니다">
              <Input id="ds-b" defaultValue="hr@company.com" invalid />
            </Field>
            <Field label="선택" htmlFor="ds-c">
              <Select id="ds-c" defaultValue="1">
                <option value="1">첫 번째</option>
                <option value="2">두 번째</option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-5">
            <Field label="Segmented" hint="선택지가 넷 이하일 때">
              <Segmented
                options={[
                  { value: 'a', label: '하나' },
                  { value: 'b', label: '둘' },
                  { value: 'c', label: '셋' },
                ]}
                value={seg}
                onChange={setSeg}
                aria-label="예시"
              />
            </Field>
            <Field label="긴 글" htmlFor="ds-d" aside="0자">
              <Textarea id="ds-d" rows={3} placeholder="여러 줄" />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── 데이터 표시 ──────────────────────────────────────── */}
      <Section id="data" title="데이터 표시">
        <div className="flex flex-col gap-10">
          <div>
            <p className="eyebrow mb-3">Badge</p>
            <div className="flex flex-wrap items-center gap-2">
              {(['neutral', 'signal', 'ok', 'warn', 'danger', 'info', 'outline'] as const).map((t) => (
                <Badge key={t} tone={t} size="sm" dot>
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">StatTile</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="활성 공고" value={12} unit="건" hint="모집 중" />
              <StatTile label="지원자" value={48} unit="명" hint="전형 진행 중" tone="warn" />
              <StatTile label="매칭" value={7} unit="명" hint="적합도 상위" tone="ok" />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">능력치 막대</p>
              <div className="max-w-sm">
                {ABILITY_CATALOG.slice(0, 4).map((a, i) => (
                  <StatBarCompact
                    key={a.key}
                    name={a.name}
                    percentile={[78, 54, 71, 46][i]}
                    category={a.category}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">적합도 — 총점만 보여주지 않는다</p>
              <FitScore fit={{ total: 78, ability: 82, culture: 71, condition: 74 }} />
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">빈 상태 · 오류 · 로딩</p>
            <div className="flex flex-col gap-4">
              <ErrorState title="공고를 등록하지 못했습니다" detail="필수 항목이 비어 있습니다" />
              <div className="grid gap-4 lg:grid-cols-2">
                <EmptyState
                  title="등록된 공고가 없습니다"
                  description="첫 공고를 올리면 적합한 후보를 찾아 드립니다."
                  action={{ label: '새 공고 등록', href: '#' }}
                />
                <TableFrame>
                  <SkeletonRows rows={3} />
                </TableFrame>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 측정 정직성 ──────────────────────────────────────── */}
      <Section
        id="honesty"
        title="측정 정직성"
        lead="이 제품의 규칙 중 가장 중요합니다. 사람을 재서 채용에 쓰기 때문입니다."
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <NormStatusBadge status="none" />
            <NormStatusBadge status="provisional" />
            <NormStatusBadge status="established" />
          </div>

          <Rule>
            <strong>규준이 없으면 백분위라고 부르지 않는다.</strong> 점수를 처음 보는 자리
            — 결과 화면 머리 — 에 배지를 단다. 각주로 숨기면 숨긴 것이 된다.
          </Rule>
          <Rule>
            <strong>측정되지 않은 항목에 기본값을 넣지 않는다.</strong> 예전 매칭은 데이터가
            없으면 50을 채웠다. 그러면 &ldquo;재보니 보통&rdquo;과 &ldquo;아직 안 쟀음&rdquo;이 같은 값이 되고,
            아무것도 모르는 후보가 중간 순위에 자리를 잡는다. 지금은 항목을 빼고 남은
            가중치로 다시 정규화하며, 무엇으로 계산했는지 함께 돌려준다.
          </Rule>
          <Rule>
            <strong>구분하지 못하면 순위를 매기지 않는다.</strong> 흥미 축이 평평한 사람에게
            나오는 1·2·3위는 배열 순서일 뿐이다(<code>isDiscriminative</code>). 같은 이유로
            직무가 아니라 직군 단위로 순위를 매긴다.
          </Rule>
          <Rule>
            <strong>퍼센트로 부풀리지 않는다.</strong> 상관 0.77 을 (r+1)/2×100 으로 펴면
            89% 가 된다. 네 구간 밴드로만 말한다.
          </Rule>
          <Rule>
            <strong>채용 경로에서 생년월일·성별을 뺀다.</strong> 사주·사상체질이 능력치 30개 중
            20개에 영향을 주고 있었다(지구력 60%). B2C 결과 화면에는 남기되, 기업으로 나가는
            값은 <code>computeHiringAbilities</code> 로 제외하고 재정규화한다.
          </Rule>
          <Rule>
            <strong>근거의 질을 데이터에 기록한다.</strong> <code>source</code> 필드
            (onet / onet-code / worknet / provisional / manual). 실측치와 손으로 적은 값이
            같은 칸에 있으면 6개월 뒤에 아무도 구분하지 못한다.
          </Rule>
        </div>
      </Section>

      {/* ── 택소노미 ─────────────────────────────────────────── */}
      <Section
        id="taxonomy"
        title="직무 택소노미"
        lead="업종 → 직군 → 직무 3단계. 직군에 프로필을 두고 직무는 상속받습니다."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="업종" value={INDUSTRIES.length} unit="개" />
          <StatTile label="직군" value={JOB_FAMILIES.length} unit="개" hint="프로필을 두는 단위" />
          <StatTile label="직무" value={RESOLVED_ROLES.length} unit="개" hint="직군을 상속" />
        </div>
        <div className="mt-5 flex flex-col gap-4">
          <Rule>
            직무를 하나씩 손으로 채우면 {RESOLVED_ROLES.length}개 프로필의 품질을 아무도
            관리하지 못한다. 검토 가능한 단위인 직군 {JOB_FAMILIES.length}개에 프로필을 두고
            직무는 다른 부분만 덮어쓴다.
          </Rule>
          <Rule>
            흥미(RIASEC)와 역량을 한 점수로 합치지 않는다. 하고 싶은 것과 할 수 있는 것은
            다르고 실제로 상관도 낮다. 합치면 두 경우가 같은 숫자가 된다.
          </Rule>
          <div>
            <p className="eyebrow mb-3">조직문화 4축 — 양쪽을 같은 척도로 잰다</p>
            <div className="flex flex-wrap gap-2">
              {CULTURE_DIMENSIONS.map((d) => (
                <span key={d.key} className="rounded-pill bg-sunk px-3 py-1.5 text-small">
                  {d.name}
                  <span className="ml-2 text-tiny text-muted-foreground">{d.short}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 안티패턴 ─────────────────────────────────────────── */}
      <Section
        id="antipatterns"
        title="하지 않는 것"
        lead="전부 이 저장소에 실제로 있었고 걷어낸 것들입니다."
      >
        <ul className="flex flex-col">
          {[
            ['무지개 카드', '검사 7종을 7색으로 칠하면 무엇이 중요한지가 아니라 색이 몇 개인지만 보인다'],
            ['가짜 숫자', '"지금까지 12,847명이 검사를 완료했습니다" — 하드코딩된 값이었다. API가 값을 못 주면 아무 말도 하지 않는다'],
            ['흐림으로 유혹하기', '잠긴 내용을 흐릿하게 깔아 두지 않는다. 무엇이 잠겼는지 글자로 적는 편이 결제 판단에 도움이 된다'],
            ['버튼 광택·맥박', 'animate-shimmer, pulse-scale. 시선을 끌 것은 내용이지 버튼이 아니다'],
            ['가운데 정렬 남용', '짧은 히어로를 넘어가면 리듬을 잃는다. 섹션 제목과 본문은 왼쪽 정렬'],
            ['그림자로 위계 만들기', '테두리 하나로 충분하다. 그림자까지 겹치면 지저분해진다'],
            ['화면마다 자기 목록 들기', '능력치 목록이 화면에 복제돼 있었고 키 5개가 실제와 달라 매칭이 무력화됐다. 출처는 하나만'],
          ].map(([title, why]) => (
            <li key={title} className="flex flex-col gap-1 border-t border-border py-4 last:border-b">
              <span className="text-body font-semibold">{title}</span>
              <span className="text-small text-muted-foreground">{why}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
