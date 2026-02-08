import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const testCategories = [
  {
    category: '성격 검사',
    tests: [
      { code: 'mbti', name: 'MBTI', description: '16가지 성격 유형 분석', questions: 48 },
      { code: 'disc', name: 'DISC', description: '행동 유형 분석', questions: 28 },
      { code: 'enneagram', name: '에니어그램', description: '9가지 성격 유형', questions: 36 },
      { code: 'tci', name: 'TCI', description: '기질 및 성격 검사', questions: 140 },
    ],
  },
  {
    category: '적성/역량 검사',
    tests: [
      { code: 'gallup', name: 'Gallup 강점', description: '34개 강점 테마', questions: 34 },
      { code: 'holland', name: 'Holland', description: '직업 흥미 유형', questions: 42 },
      { code: 'iq', name: 'IQ 테스트', description: '논리/패턴 분석', questions: 30 },
      { code: 'mmpi', name: 'MMPI 간이', description: '다면적 인성 검사', questions: 50 },
    ],
  },
  {
    category: '전통/특수 검사',
    tests: [
      { code: 'tarot', name: '타로', description: '이미지 선택 기반', questions: 10 },
      { code: 'htp', name: 'HTP', description: '그림 심리 검사', questions: 3 },
      { code: 'saju', name: '사주', description: '생년월일시 분석', questions: 1 },
      { code: 'sasang', name: '사상체질', description: '체질 유형 분석', questions: 20 },
      { code: 'face', name: '관상', description: '얼굴 분석', questions: 1 },
      { code: 'blood', name: '혈액형', description: '혈액형 성격 분석', questions: 5 },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          <span className="text-primary">Metaphoi</span>
          <span className="text-muted-foreground"> 메타포이</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하고,
          AI 분석 기반 리포트를 제공하는 종합 인재 평가 플랫폼
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">시작하기</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              로그인
            </Button>
          </Link>
        </div>
      </section>

      {/* Tests Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">14가지 검사</h2>
        <div className="space-y-12">
          {testCategories.map((category) => (
            <div key={category.category}>
              <h3 className="text-xl font-semibold mb-6 text-primary">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.tests.map((test) => (
                  <Card key={test.code} className="hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {test.questions}문항
                      </p>
                      <Link href={`/${test.code}`}>
                        <Button variant="secondary" size="sm" className="w-full">
                          검사하기
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

      {/* Abilities Section */}
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
                  <li key={ability} className="text-sm text-muted-foreground">
                    • {ability}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">리포트 가격</h2>
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
              className={plan.recommended ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                {plan.recommended && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    추천
                  </span>
                )}
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
                        className="w-4 h-4 mr-2 text-primary"
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
                <Button
                  className="w-full mt-6"
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  선택하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          © 2024 Metaphoi. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
