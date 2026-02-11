import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ENTERPRISE_PLANS, ENTERPRISE_TESTS } from '@/data/tests/enterprise';

export const metadata = {
  title: 'Metaphoi for Enterprise - 기업 채용 & 인재 분석',
  description: '과학적 심리검사 기반 채용 솔루션. 종합 성격 분석 + 인지능력 + 역량 평가로 최적의 인재를 선발하세요.',
};

export default function EnterprisePage() {
  const testsByCategory = [
    { label: '인지능력', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'cognitive') },
    { label: '역량 평가', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'competency') },
    { label: '조직문화', tests: ENTERPRISE_TESTS.filter((t) => t.category === 'culture') },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              개인 검사
            </Link>
            <Link href="/company/login">
              <Button variant="outline" size="sm">기업 로그인</Button>
            </Link>
            <Link href="/company/register">
              <Button size="sm">기업 가입</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
          Enterprise
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 leading-tight">
          데이터 기반
          <br />
          <span className="text-primary">채용 혁신</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
          7가지 종합 심리검사 + 인지능력 + 역량 평가로
          <br className="hidden sm:block" />
          <strong className="text-foreground">객관적이고 정밀한 인재 분석</strong>을 제공합니다.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          채용 적합도 예측 | 팀 조합 최적화 | ATS 연동 지원
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/company/register">
            <Button size="lg" className="text-lg px-8 py-6">
              기업 가입하기
            </Button>
          </Link>
          <Link href="/test">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              무료 체험 (개인 검사)
            </Button>
          </Link>
        </div>
      </section>

      {/* 일반 vs 기업 비교 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">일반 검사 vs 기업 검사</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>일반 종합 검사</CardTitle>
              <CardDescription>개인 자기이해용</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  '53문항 종합 검사',
                  '7가지 성격/적성 분석',
                  '30가지 기본 능력치',
                  '직업 추천',
                  '사주 & 사상체질',
                ].map((item) => (
                  <li key={item} className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <span className="text-xs font-semibold text-primary">Enterprise</span>
              <CardTitle>기업 채용 검사</CardTitle>
              <CardDescription>채용/인재관리 최적화</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  '일반 종합 검사 전체 포함',
                  '+ 인지능력 검사 (논리/수리/언어)',
                  '+ 역량 평가 (리더십/팀워크/문제해결)',
                  '+ 조직문화 적합도',
                  '30가지 정밀 능력치 (심층 보정)',
                  '채용 적합도 등급 (A+~D)',
                  '팀 분석 & API 연동',
                ].map((item) => (
                  <li key={item} className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 기업 전용 추가 검사 */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-4">기업 전용 심층 검사</h2>
        <p className="text-center text-muted-foreground mb-12">
          기본 종합 검사에 추가하여 더 정밀한 인재 분석이 가능합니다
        </p>
        <div className="space-y-8 max-w-4xl mx-auto">
          {testsByCategory.map((group) => (
            <div key={group.label}>
              <h3 className="text-lg font-semibold text-primary mb-4">{group.label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {group.tests.map((test) => (
                  <Card key={test.code}>
                    <CardContent className="pt-6">
                      <h4 className="font-bold mb-1">{test.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {test.questionCount}문항 | 약 {test.estimatedMinutes}분
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 채용 리포트 예시 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">채용 리포트 미리보기</h2>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-6">
            {/* 종합 등급 */}
            <div className="text-center p-6 bg-primary/5 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">종합 채용 적합도</p>
              <p className="text-5xl font-bold text-primary">A</p>
              <p className="text-sm text-muted-foreground mt-2">상위 15%</p>
            </div>

            {/* 영역별 점수 예시 */}
            <div className="space-y-3">
              {[
                { label: '성격/행동 적합도', score: 85 },
                { label: '인지능력', score: 78 },
                { label: '역량 평가', score: 82 },
                { label: '조직문화 적합도', score: 91 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm w-32 shrink-0">{item.label}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8">{item.score}</span>
                </div>
              ))}
            </div>

            {/* 추천 직무 */}
            <div>
              <p className="text-sm font-medium mb-2">추천 직무</p>
              <div className="flex flex-wrap gap-2">
                {['프로덕트 매니저', '전략 기획', 'UX 리서처'].map((role) => (
                  <span key={role} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              * 위 데이터는 예시입니다. 실제 리포트는 지원자별로 개별 생성됩니다.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 기업 요금제 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">기업 요금제</h2>
        <p className="text-center text-muted-foreground mb-12">
          규모에 맞는 플랜을 선택하세요
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ENTERPRISE_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={plan.recommended ? 'border-primary shadow-lg relative' : ''}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  추천
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  {plan.price}
                </CardDescription>
                <p className="text-sm text-muted-foreground">{plan.pricePerTest}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.id === 'enterprise' ? 'mailto:enterprise@metaphoi.com' : '/company/register'}>
                  <Button
                    className="w-full mt-6"
                    variant={plan.recommended ? 'default' : 'outline'}
                  >
                    {plan.id === 'enterprise' ? '문의하기' : '기업 가입'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
        <div className="space-y-6 max-w-2xl mx-auto">
          {[
            {
              q: '기존 ATS와 연동할 수 있나요?',
              a: 'Business 플랜 이상에서 API를 제공합니다. 그린하우스, 레버 등 주요 ATS와의 연동을 지원합니다.',
            },
            {
              q: '지원자가 검사를 조작할 수 있나요?',
              a: '일관성 검증 알고리즘이 내장되어 있어 일관되지 않은 응답 패턴을 자동으로 감지합니다.',
            },
            {
              q: '맞춤형 역량 모델을 만들 수 있나요?',
              a: 'Enterprise 플랜에서 귀사의 핵심 역량에 맞는 맞춤형 평가 모델을 함께 설계합니다.',
            },
            {
              q: '기존 종합 검사 데이터를 활용할 수 있나요?',
              a: '네. 지원자가 이미 Metaphoi 종합 검사를 완료한 경우, 추가 심층 검사만 진행하면 됩니다.',
            },
          ].map((item) => (
            <div key={item.q}>
              <h3 className="font-bold mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">채용의 정확도를 높이세요</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          과학적 검사 기반 인재 분석으로 채용 실패 비용을 줄이고 팀 성과를 극대화하세요.
        </p>
        <Link href="/company/register">
          <Button size="lg" className="text-lg px-10 py-7">
            기업 가입하기
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Metaphoi. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              개인 검사
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              로그인
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
