import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* GNB */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex items-center gap-4">
            <Link href="/seeker/companies" className="text-sm text-muted-foreground hover:text-primary">
              채용
            </Link>
            <Link href="/enterprise" className="text-sm text-muted-foreground hover:text-primary">
              기업 솔루션
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              로그인
            </Link>
            <Link href="/company/login" className="text-sm text-muted-foreground hover:text-primary">
              기업 로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
          회원가입 없이 무료 시작
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 leading-tight">
          나를 가장 정확하게
          <br />
          <span className="text-primary">파악하는 방법</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
          MBTI, DISC, 에니어그램, Holland, 사상체질, 사주, 혈액형
          <br className="hidden sm:block" />
          <strong className="text-foreground">7가지 검사를 한 번에.</strong> 53문항으로 당신을 종합 분석합니다.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          약 10~15분 소요 | 로그인 불필요 | 결과 즉시 확인
        </p>
        <Link href="/test">
          <Button size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow">
            무료 종합 검사 시작하기
          </Button>
        </Link>
      </section>

      {/* 포함된 검사 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">7가지 검사, 하나의 결과</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          단편적인 검사 하나로는 알 수 없는 진짜 나를 발견하세요.
          여러 관점의 검사를 통합하여 입체적으로 분석합니다.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { name: 'MBTI', desc: '16가지 성격 유형', icon: '🧠' },
            { name: 'DISC', desc: '행동 유형 분석', icon: '🎯' },
            { name: '에니어그램', desc: '9가지 내면 유형', icon: '🔮' },
            { name: 'Holland', desc: '직업 흥미 유형', icon: '💼' },
            { name: '사상체질', desc: '체질 유형 분석', icon: '🌿' },
            { name: '사주', desc: '생년월일시 분석', icon: '🌙' },
            { name: '혈액형', desc: '혈액형 성격', icon: '🩸' },
            { name: '종합 능력치', desc: '30개 스탯 산출', icon: '📊', highlight: true },
          ].map((test) => (
            <Card
              key={test.name}
              className={`text-center ${test.highlight ? 'border-primary bg-primary/5' : ''}`}
            >
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl mb-2">{test.icon}</div>
                <h3 className="font-bold text-sm">{test.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{test.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 왜 해야 하는가 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">왜 종합 검사인가</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: 'MBTI만으로는 부족합니다',
              description: '하나의 검사로 사람을 판단할 수 없습니다. 7가지 관점에서 교차 분석하여 정말 나다운 모습을 찾아드립니다.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              ),
              title: '게임처럼 보는 내 능력치',
              description: '검사 결과를 30개 능력치로 수치화합니다. 결단력, 창의성, 소통능력 등 나의 스탯을 한눈에 확인하세요.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: '동양 + 서양 통합',
              description: '서양 심리학(MBTI, DISC)과 동양 지혜(사주, 사상체질)를 결합한 세계 유일의 종합 분석 서비스입니다.',
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

      {/* 이런 분들에게 */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12">이런 분들에게 추천합니다</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: '취업 준비생', description: '나에게 맞는 직업과 직무가 뭔지 알고 싶다면', cta: '적성 찾기' },
            { title: '자기 이해가 필요한 분', description: '진짜 나는 누구인지, 내면을 깊이 들여다보고 싶다면', cta: '나를 알기' },
            { title: '팀 리더 & HR', description: '팀원의 성향을 파악하고 조직 소통을 개선하고 싶다면', cta: '팀 분석' },
          ].map((item) => (
            <Card key={item.title} className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 pb-4">
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Link href="/test">
                  <Button variant="outline" size="sm">{item.cta}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 검사 과정 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">검사는 이렇게 진행됩니다</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { step: '1', title: '기본 정보 입력', description: '이름, 생년월일, 혈액형 등 기본 정보를 입력합니다' },
            { step: '2', title: '53개 질문 응답', description: '직관적으로 느끼는 대로 답변하세요. 정답은 없습니다' },
            { step: '3', title: '7가지 분석', description: '성격, 행동, 적성, 체질, 사주까지 종합 분석됩니다' },
            { step: '4', title: '결과 확인', description: '기본 결과는 무료, 상세 분석은 유료로 확인하세요' },
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

      {/* 능력치 미리보기 */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-4">30가지 능력치</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          검사 결과를 기반으로 당신만의 캐릭터 스탯을 산출합니다
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            { category: '정신력', abilities: ['결단력', '침착성', '집중력', '창의성', '분석력', '적응력'] },
            { category: '사회성', abilities: ['소통능력', '협동심', '리더십', '공감능력', '영향력', '네트워킹'] },
            { category: '업무역량', abilities: ['실행력', '기획력', '문제해결', '시간관리', '꼼꼼함', '멀티태스킹'] },
            { category: '신체/감각', abilities: ['스트레스내성', '지구력', '직관력', '심미안', '공간지각', '언어능력'] },
            { category: '잠재력', abilities: ['성장가능성', '학습속도', '혁신성', '회복탄력성', '야망', '성실성'] },
          ].map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="font-semibold text-primary text-sm">{group.category}</h4>
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
        <div className="text-center mt-10">
          <Link href="/test">
            <Button variant="outline" size="lg">
              나의 능력치 확인하기
            </Button>
          </Link>
        </div>
      </section>

      {/* 가격 안내 */}
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
              features: ['유형별 상세 해석', '30개 능력치 점수', '레이더 차트'],
            },
            {
              tier: 'Pro',
              price: '29,900원',
              features: ['Basic 전체 포함', '교차 심층 분석', '맞춤 직업 추천 TOP 10', 'PDF 리포트 내보내기'],
              recommended: true,
            },
            {
              tier: 'Premium',
              price: '59,900원',
              features: ['Pro 전체 포함', '성장 로드맵', 'AI 1:1 맞춤 상담', '기업용 리포트'],
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
                      <svg className="w-4 h-4 mr-2 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout">
                  <Button className="w-full mt-6" variant={plan.recommended ? 'default' : 'outline'}>
                    선택하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 채용 마켓플레이스 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">검사 결과로 채용까지</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          종합 검사 결과를 기반으로 나에게 딱 맞는 기업을 찾아보세요.
          기업도 데이터 기반으로 최적의 인재를 만날 수 있습니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">구직자</h3>
              <p className="text-sm text-muted-foreground mb-4">
                무료 검사 완료 후 구직자 프로필을 등록하면 나의 30가지 능력치와 7가지 유형을
                기반으로 기업과 매칭됩니다. 실명은 매칭 후에만 공개됩니다.
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  능력치 기반 기업 매칭
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  양방향 관심 표시 & 매칭
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  실시간 지원 현황 추적
                </div>
              </div>
              <Link href="/test">
                <Button className="w-full">무료 검사 시작 & 프로필 등록</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">기업</h3>
              <p className="text-sm text-muted-foreground mb-4">
                검증된 심리검사 데이터로 인재를 분석하세요.
                능력치 핏, 문화 핏, 조건 핏을 종합한 매칭 점수로 최적의 후보자를 추천합니다.
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  3차원 매칭 알고리즘
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  풀 ATS (면접/평가/채용)
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  팀 프로필 & 문화 핏 분석
                </div>
              </div>
              <Link href="/company/register">
                <Button variant="outline" className="w-full">기업 가입하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          53개 질문, 약 15분이면 7가지 관점에서 나를 완벽하게 분석할 수 있습니다.
        </p>
        <Link href="/test">
          <Button size="lg" className="text-lg px-10 py-7 shadow-lg">
            무료 종합 검사 시작하기
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
            <Link href="/seeker/companies" className="text-sm text-muted-foreground hover:text-primary">
              채용
            </Link>
            <Link href="/enterprise" className="text-sm text-muted-foreground hover:text-primary">
              기업 솔루션
            </Link>
            <Link href="/company/register" className="text-sm text-muted-foreground hover:text-primary">
              기업 가입
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              로그인
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
