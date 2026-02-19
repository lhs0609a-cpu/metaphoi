import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DemoRadarChart } from './demo-radar-chart';
import { DemoStatGrid } from './demo-stat-grid';

export const metadata = {
  title: 'Metaphoi - 7가지 심리검사로 나를 발견하다',
  description: '브랜드 스토리: 성격, 행동, 동기, 적성, 체질, 운명, 기질 — 7가지 관점을 하나로 융합한 종합 심리검사 서비스입니다.',
};

const TEST_PERSPECTIVES = [
  {
    name: '성격 유형',
    desc: '16가지 성격 패턴 분석',
    color: 'violet',
    borderClass: 'border-t-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: '행동 패턴',
    desc: '상황별 행동 스타일',
    color: 'blue',
    borderClass: 'border-t-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    name: '내면 동기',
    desc: '9가지 핵심 동기',
    color: 'amber',
    borderClass: 'border-t-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    name: '직업 적성',
    desc: '6가지 직업 흥미 유형',
    color: 'green',
    borderClass: 'border-t-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    name: '체질 분석',
    desc: '4가지 체질 유형',
    color: 'rose',
    borderClass: 'border-t-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: '운명 분석',
    desc: '생년월일시 기반 기질',
    color: 'indigo',
    borderClass: 'border-t-indigo-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    name: '기질 유형',
    desc: '혈액형 기질 패턴',
    color: 'pink',
    borderClass: 'border-t-pink-500',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 2.4-5 6.6-5 10a5 5 0 0010 0c0-3.4-3.8-7.6-5-10z" />
      </svg>
    ),
  },
  {
    name: '30가지 스탯',
    desc: '모든 분석을 하나로',
    highlight: true,
    borderClass: 'border-t-primary',
    iconBg: 'bg-primary/10 text-primary',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero with Radar Chart */}
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
          성격, 행동, 동기, 적성, 체질, 운명, 기질
          <br className="hidden sm:block" />
          <strong className="text-foreground">7가지 관점을 하나로 융합한 종합 분석.</strong> 약 50문항으로 당신을 입체적으로 파악합니다.
        </p>

        {/* Demo Radar Chart */}
        <div className="my-8">
          <DemoRadarChart />
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          약 10~15분 소요 | 로그인 불필요 | 결과 즉시 확인
        </p>
        <Link href="/start">
          <Button size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <span className="relative z-10">캐릭터 분석 시작하기</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </Button>
        </Link>
      </section>

      {/* 7 Perspectives Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">7가지 관점, 하나의 분석</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          서양 심리학과 동양 지혜를 융합한 독자적 분석 프레임워크입니다
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {TEST_PERSPECTIVES.map((item) => (
            <Card
              key={item.name}
              className={`text-center border-t-2 ${item.borderClass} ${item.highlight ? 'border-primary bg-primary/5' : ''}`}
            >
              <CardContent className="pt-6 pb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-lg mx-auto">
          * 국제적으로 검증된 심리학 이론과 전통 분석법을 기반으로 자체 개발된 문항을 사용합니다
        </p>
      </section>

      {/* Why Combined */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">왜 종합 분석인가</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: '한 가지 관점만으로는 부족합니다',
              description: '하나의 검사로 사람을 판단할 수 없습니다. 7가지 관점에서 교차 분석하여 정말 나다운 모습을 찾아드립니다.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              ),
              title: 'RPG처럼 보는 내 능력치',
              description: '검사 결과를 30개 능력치로 수치화합니다. 결단력, 창의성, 소통능력 등 나의 스탯을 한눈에 확인하세요.',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: '동양 + 서양 통합',
              description: '서양 심리학 이론과 동양 지혜를 결합한 세계 유일의 종합 분석 서비스입니다.',
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

      {/* 30 Stats Demo Grid */}
      <section className="container mx-auto px-4 py-16 bg-card rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-4">30가지 능력치</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          검사 결과를 기반으로 당신만의 캐릭터 스탯을 산출합니다
        </p>
        <DemoStatGrid />
        <div className="text-center mt-10">
          <Link href="/start">
            <Button variant="outline" size="lg">
              나의 능력치 확인하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Target Audience */}
      <section className="container mx-auto px-4 py-16">
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
                <Link href="/start">
                  <Button variant="outline" size="sm">{item.cta}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">검사는 이렇게 진행됩니다</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { step: '1', title: '기본 정보 입력', description: '이름, 생년월일, 혈액형 등 기본 정보를 입력합니다' },
            { step: '2', title: '약 50개 질문 응답', description: '직관적으로 느끼는 대로 답변하세요. 정답은 없습니다' },
            { step: '3', title: '7가지 분석', description: '성격, 행동, 적성, 체질, 사주까지 종합 분석됩니다' },
            { step: '4', title: '결과 확인', description: '나만의 유형과 능력치를 바로 확인하세요' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-mono-stat font-bold">
                {item.step}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">나를 가장 정확하게 아는 것, 여기서 시작됩니다</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          약 50개 질문, 10~15분이면 7가지 관점에서 나를 입체적으로 분석할 수 있습니다.
        </p>
        <Link href="/start">
          <Button size="lg" className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
            <span className="relative z-10">캐릭터 분석 시작하기</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </Button>
        </Link>
      </section>
    </>
  );
}
