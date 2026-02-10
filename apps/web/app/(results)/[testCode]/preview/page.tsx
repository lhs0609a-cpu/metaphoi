'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultPreviewCard } from '@/components/results/result-preview-card';
import { PaywallOverlay } from '@/components/results/paywall-overlay';
import { LockedContent } from '@/components/results/locked-content';
import { getSession, type LocalTestSession } from '@/lib/test-session';
import { getTestMeta } from '@/data/tests';

export default function ResultPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const testCode = params.testCode as string;

  const [session, setSession] = useState<LocalTestSession | null>(null);
  const [loading, setLoading] = useState(true);

  const testMeta = getTestMeta(testCode);

  useEffect(() => {
    const s = getSession(testCode);
    if (!s?.result) {
      router.push(`/${testCode}`);
      return;
    }
    setSession(s);
    setLoading(false);
  }, [testCode, router]);

  if (loading || !session?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const { result } = session;
  const interp = result.interpretation as Record<string, any>;

  // MBTI 전용 렌더링
  const isMBTI = testCode === 'mbti';

  const dimensions = isMBTI
    ? [
        {
          key: 'E-I',
          result: interp.dimensions?.['E-I']?.result || '',
          leftLabel: interp.dimensions?.['E-I']?.E_label || 'E',
          rightLabel: interp.dimensions?.['E-I']?.I_label || 'I',
          leftPercent: interp.dimensions?.['E-I']?.percentage?.first || 50,
          rightPercent: interp.dimensions?.['E-I']?.percentage?.second || 50,
        },
        {
          key: 'S-N',
          result: interp.dimensions?.['S-N']?.result || '',
          leftLabel: interp.dimensions?.['S-N']?.S_label || 'S',
          rightLabel: interp.dimensions?.['S-N']?.N_label || 'N',
          leftPercent: interp.dimensions?.['S-N']?.percentage?.first || 50,
          rightPercent: interp.dimensions?.['S-N']?.percentage?.second || 50,
        },
        {
          key: 'T-F',
          result: interp.dimensions?.['T-F']?.result || '',
          leftLabel: interp.dimensions?.['T-F']?.T_label || 'T',
          rightLabel: interp.dimensions?.['T-F']?.F_label || 'F',
          leftPercent: interp.dimensions?.['T-F']?.percentage?.first || 50,
          rightPercent: interp.dimensions?.['T-F']?.percentage?.second || 50,
        },
        {
          key: 'J-P',
          result: interp.dimensions?.['J-P']?.result || '',
          leftLabel: interp.dimensions?.['J-P']?.J_label || 'J',
          rightLabel: interp.dimensions?.['J-P']?.P_label || 'P',
          leftPercent: interp.dimensions?.['J-P']?.percentage?.first || 50,
          rightPercent: interp.dimensions?.['J-P']?.percentage?.second || 50,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">다른 검사 해보기</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 상단: 공개 결과 */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            {testMeta?.name || testCode.toUpperCase()} 검사 결과
          </p>
          <h1 className="text-3xl font-bold">당신의 유형</h1>
        </div>

        {/* 유형 결과 카드 (무료 공개) */}
        {isMBTI && (
          <div className="mb-8">
            <ResultPreviewCard
              typeCode={interp.type || result.resultType}
              typeName={interp.typeName || ''}
              description={interp.description || ''}
              dimensions={dimensions}
            />
          </div>
        )}

        {/* 하단: 잠긴 콘텐츠 + 페이월 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">상세 분석</h2>
          <PaywallOverlay testCode={testCode}>
            <div className="space-y-4">
              <LockedContent
                title="상세 성격 분석"
                items={[
                  '당신의 성격 유형에 대한 심층적인 분석이 여기에 표시됩니다.',
                  '각 차원별 상세 해석과 일상생활에서의 영향을 확인하세요.',
                  '대인관계, 의사소통, 업무 스타일에 대한 구체적인 설명을 제공합니다.',
                ]}
              />
              <LockedContent
                title="강점 & 약점"
                items={[
                  '당신의 핵심 강점과 잠재적 약점을 상세히 분석합니다.',
                  '강점을 극대화하고 약점을 보완하는 전략을 제시합니다.',
                  '실생활에서 활용할 수 있는 구체적인 팁을 제공합니다.',
                ]}
              />
              <LockedContent
                title="능력치 스탯"
                items={[
                  '30가지 능력치 중 이 검사와 관련된 스탯을 확인하세요.',
                  '각 능력치의 점수와 상세 해석이 제공됩니다.',
                  '다른 유형과의 비교 분석도 포함됩니다.',
                ]}
              />
              <LockedContent
                title="직업 추천"
                items={[
                  '당신의 성격 유형에 가장 적합한 직업군을 추천합니다.',
                  '각 직업에 대한 적합도와 이유를 설명합니다.',
                  '커리어 성장을 위한 조언도 함께 제공됩니다.',
                ]}
              />
            </div>
          </PaywallOverlay>
        </div>

        {/* 하단 CTA */}
        <div className="text-center space-y-4 pb-8">
          <Link href={`/checkout?testCode=${testCode}`}>
            <Button size="lg" className="w-full max-w-md">
              전체 결과 보기 - 9,900원부터
            </Button>
          </Link>
          <div className="flex justify-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              다른 검사도 해보기
            </Link>
            <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              계정 만들기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
