import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const testCategories = [
  {
    category: '성격 검사',
    tests: [
      { code: 'mbti', name: 'MBTI', description: '16가지 성격 유형 분석', questions: 48, available: true, popular: true },
      { code: 'disc', name: 'DISC', description: '행동 유형 분석', questions: 28, available: true },
      { code: 'enneagram', name: '에니어그램', description: '9가지 성격 유형', questions: 36, available: true },
      { code: 'tci', name: 'TCI', description: '기질 및 성격 검사', questions: 140, available: false },
    ],
  },
  {
    category: '적성/역량 검사',
    tests: [
      { code: 'gallup', name: 'Gallup 강점', description: '34개 강점 테마', questions: 34, available: false },
      { code: 'holland', name: 'Holland', description: '직업 흥미 유형', questions: 42, available: true },
      { code: 'iq', name: 'IQ 테스트', description: '논리/패턴 분석', questions: 30, available: false },
      { code: 'mmpi', name: 'MMPI 간이', description: '다면적 인성 검사', questions: 50, available: false },
    ],
  },
  {
    category: '전통/특수 검사',
    tests: [
      { code: 'tarot', name: '타로', description: '이미지 선택 기반', questions: 10, available: false },
      { code: 'htp', name: 'HTP', description: '그림 심리 검사', questions: 3, available: false },
      { code: 'saju', name: '사주', description: '생년월일시 사주팔자', questions: 5, available: true },
      { code: 'sasang', name: '사상체질', description: '체질 유형 분석', questions: 20, available: true },
      { code: 'face', name: '관상', description: '얼굴 분석', questions: 1, available: false },
      { code: 'blood', name: '혈액형', description: '혈액형 성격 분석', questions: 5, available: true },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
          로그인 없이 무료로 시작하세요
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          나를 가장 정확하게
          <br />
          <span className="text-primary">파악하는 방법</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          14가지 과학적 심리검사로 30개 능력치를 발견하세요.
          <br className="hidden sm:block" />
          회원가입 없이 바로 검사를 시작할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#tests">
            <Button size="lg" className="text-lg px-8 py-6">
              무료 종합 검사 시작하기
            </Button>
          </a>
          <Link href="/saju">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              사주로 나를 알아보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">왜 이 검사를 해야 하는가</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: '단편적 검사는 그만',
              description: 'MBTI만으로는 부족합니다. 14가지 검사를 통합 분석하여 입체적인 자기 이해를 제공합니다.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              ),
              title: '숫자로 보는 나의 능력치',
              description: '검사 결과를 30개 능력치 스탯으로 변환. 게임 캐릭터처럼 나의 강점과 약점을 한눈에.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'AI 기반 맞춤 분석',
              description: '단순 결과가 아닌 AI가 분석한 개인화된 성장 로드맵과 직업 추천을 받아보세요.',
            },
          ].map((item) => (
            <Card key={item.title} className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Target Audience */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">이런 분들에게 추천합니다</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { emoji: '🎯', title: '취업 준비생', description: '나에게 맞는 직업과 직무는 무엇일까?' },
            { emoji: '🔍', title: '자기 이해가 필요한 분', description: '진짜 나는 누구인지 깊이 알고 싶다면' },
            { emoji: '👥', title: '팀 리더', description: '팀원의 성향을 파악하고 소통을 개선하고 싶다면' },
          ].map((item) => (
            <Card key={item.title} className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">검사 진행 방법</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '1', title: '무료 검사 선택', description: '로그인 없이 바로 원하는 검사를 시작하세요' },
            { step: '2', title: '질문에 응답', description: '직관적으로 떠오르는 대로 답변하세요' },
            { step: '3', title: '결과 확인', description: '기본 유형 결과는 무료, 상세 분석은 유료로 확인' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tests Section */}
      <section id="tests" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">14가지 검사</h2>
        <p className="text-center text-muted-foreground mb-12">
          로그인 없이 무료로 시작하세요
        </p>
        <div className="space-y-12">
          {testCategories.map((category) => (
            <div key={category.category}>
              <h3 className="text-xl font-semibold mb-6 text-primary">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.tests.map((test) => (
                  <Card
                    key={test.code}
                    className={`hover:border-primary transition-colors relative ${
                      !test.available ? 'opacity-60' : ''
                    } ${'popular' in test && test.popular ? 'border-primary shadow-md' : ''}`}
                  >
                    {'popular' in test && test.popular && (
                      <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        인기
                      </span>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {test.questions}문항 {test.available ? '' : '· 준비 중'}
                      </p>
                      <Link href={test.available ? `/${test.code}` : '#'}>
                        <Button
                          variant={test.available ? 'default' : 'secondary'}
                          size="sm"
                          className="w-full"
                          disabled={!test.available}
                        >
                          {test.available ? '무료로 시작' : '준비 중'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Abilities Preview */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6">30가지 능력치</h2>
        <p className="text-center text-muted-foreground mb-12">
          종합 검사 결과를 바탕으로 30가지 핵심 능력치를 산출합니다
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { category: '정신력', abilities: ['결단력', '침착성', '집중력', '창의성', '분석력', '적응력'] },
            { category: '사회성', abilities: ['소통능력', '협동심', '리더십', '공감능력', '영향력', '네트워킹'] },
            { category: '업무역량', abilities: ['실행력', '기획력', '문제해결', '시간관리', '꼼꼼함', '멀티태스킹'] },
            { category: '신체/감각', abilities: ['스트레스내성', '지구력', '직관력', '심미안', '공간지각', '언어능력'] },
            { category: '잠재력', abilities: ['성장가능성', '학습속도', '혁신성', '회복탄력성', '야망', '성실성'] },
          ].map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="font-semibold text-primary">{group.category}</h4>
              <ul className="space-y-1">
                {group.abilities.map((ability) => (
                  <li key={ability} className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {ability}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/mbti">
            <Button variant="outline" size="lg">
              나의 능력치 확인하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">가격 안내</h2>
        <p className="text-center text-muted-foreground mb-12">
          검사는 무료, 상세 분석은 유료입니다
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              tier: 'Basic',
              price: '9,900원',
              features: ['30개 능력치 점수', '레이더 차트', '검사별 결과 요약'],
            },
            {
              tier: 'Pro',
              price: '29,900원',
              features: ['Basic 전체 포함', '상세 분석', '직업 추천', 'PDF 내보내기'],
              recommended: true,
            },
            {
              tier: 'Premium',
              price: '59,900원',
              features: ['Pro 전체 포함', '성장 로드맵', 'AI 1:1 상담'],
            },
          ].map((plan) => (
            <Card
              key={plan.tier}
              className={plan.recommended ? 'border-primary shadow-lg relative' : ''}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  추천
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.tier}</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 mr-2 text-primary shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout">
                  <Button
                    className="w-full mt-6"
                    variant={plan.recommended ? 'default' : 'outline'}
                  >
                    선택하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Metaphoi. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              로그인
            </Link>
            <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary">
              회원가입
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
              대시보드
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
