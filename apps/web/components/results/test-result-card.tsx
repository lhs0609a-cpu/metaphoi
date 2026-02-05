'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TestResultCardProps {
  testCode: string;
  testName: string;
  resultType: string;
  completedAt: string;
  processedResult: Record<string, any>;
}

const TEST_COLORS: Record<string, string> = {
  mbti: 'bg-purple-500',
  disc: 'bg-blue-500',
  enneagram: 'bg-green-500',
  tci: 'bg-orange-500',
  gallup: 'bg-yellow-500',
  holland: 'bg-pink-500',
  iq: 'bg-indigo-500',
  mmpi: 'bg-red-500',
  tarot: 'bg-violet-500',
  htp: 'bg-cyan-500',
  saju: 'bg-amber-500',
  sasang: 'bg-emerald-500',
  face: 'bg-rose-500',
  blood: 'bg-sky-500',
};

const TEST_DESCRIPTIONS: Record<string, string> = {
  mbti: '16가지 성격 유형',
  disc: '행동 유형 분석',
  enneagram: '9가지 성격 유형',
  tci: '기질과 성격',
  gallup: '강점 테마',
  holland: '직업 흥미',
  iq: '지능 지수',
  mmpi: '다면적 인성',
  tarot: '잠재의식 분석',
  htp: '그림 심리',
  saju: '사주 분석',
  sasang: '사상체질',
  face: '관상 분석',
  blood: '혈액형 성격',
};

export function TestResultCard({
  testCode,
  testName,
  resultType,
  completedAt,
  processedResult,
}: TestResultCardProps) {
  const colorClass = TEST_COLORS[testCode] || 'bg-gray-500';
  const description = TEST_DESCRIPTIONS[testCode] || '';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 검사별 결과 렌더링
  const renderResult = () => {
    switch (testCode) {
      case 'mbti':
        return <MBTIResult data={processedResult} />;
      case 'disc':
        return <DISCResult data={processedResult} />;
      case 'enneagram':
        return <EnneagramResult data={processedResult} />;
      case 'iq':
        return <IQResult data={processedResult} />;
      default:
        return <GenericResult data={processedResult} resultType={resultType} />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${colorClass}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{testName}</CardTitle>
          <Badge variant="secondary">{resultType}</Badge>
        </div>
        <CardDescription>
          {description} • {formatDate(completedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderResult()}</CardContent>
    </Card>
  );
}

// MBTI 결과 컴포넌트
function MBTIResult({ data }: { data: Record<string, any> }) {
  const dimensions = data.dimensions || {};
  const traits = data.type_traits || [];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl font-bold text-primary">{data.type || 'XXXX'}</span>
      </div>

      {Object.entries(dimensions).map(([key, values]: [string, any]) => {
        const left = key[0];
        const right = key[1];
        const leftScore = values?.left || 50;
        const rightScore = values?.right || 50;

        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{left}</span>
              <span>{right}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-primary"
                style={{ width: `${leftScore}%` }}
              />
              <div
                className="bg-secondary"
                style={{ width: `${rightScore}%` }}
              />
            </div>
          </div>
        );
      })}

      {traits.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {traits.slice(0, 4).map((trait: string, idx: number) => (
            <Badge key={idx} variant="outline">
              {trait}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// DISC 결과 컴포넌트
function DISCResult({ data }: { data: Record<string, any> }) {
  const scores = data.scores || {};
  const type = data.type || '';
  const description = data.description || '';

  const labels: Record<string, string> = {
    D: '주도형',
    I: '사교형',
    S: '안정형',
    C: '신중형',
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-3xl font-bold text-primary">{type}</span>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      {['D', 'I', 'S', 'C'].map((key) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{labels[key]} ({key})</span>
            <span>{scores[key] || 0}%</span>
          </div>
          <Progress value={scores[key] || 0} />
        </div>
      ))}
    </div>
  );
}

// Enneagram 결과 컴포넌트
function EnneagramResult({ data }: { data: Record<string, any> }) {
  const type = data.type || 0;
  const wing = data.wing || null;
  const typeName = data.type_name || '';
  const scores = data.all_scores || {};

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl font-bold text-primary">
          {type}유형 {wing && `w${wing}`}
        </span>
        <p className="text-muted-foreground mt-1">{typeName}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div
            key={num}
            className={`text-center p-2 rounded ${
              num === type ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <span className="font-bold">{num}</span>
            <span className="text-xs block">{scores[num] || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// IQ 결과 컴포넌트
function IQResult({ data }: { data: Record<string, any> }) {
  const score = data.score || 100;
  const percentile = data.percentile || 50;
  const domainScores = data.domain_scores || {};

  const domainLabels: Record<string, string> = {
    verbal: '언어',
    numerical: '수리',
    spatial: '공간',
    pattern: '패턴',
    memory: '기억',
    speed: '처리속도',
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-5xl font-bold text-primary">{score}</span>
        <p className="text-muted-foreground text-sm mt-1">
          상위 {100 - percentile}%
        </p>
      </div>

      {Object.entries(domainScores).map(([key, value]: [string, any]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{domainLabels[key] || key}</span>
            <span>{value}점</span>
          </div>
          <Progress value={(value / 20) * 100} />
        </div>
      ))}
    </div>
  );
}

// 일반 결과 컴포넌트
function GenericResult({
  data,
  resultType,
}: {
  data: Record<string, any>;
  resultType: string;
}) {
  const strengths = data.strengths || [];
  const weaknesses = data.weaknesses || data.growth_areas || [];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-2xl font-bold text-primary">{resultType}</span>
      </div>

      {strengths.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">강점</p>
          <div className="flex flex-wrap gap-2">
            {strengths.slice(0, 4).map((s: string, idx: number) => (
              <Badge key={idx} variant="default">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">성장 영역</p>
          <div className="flex flex-wrap gap-2">
            {weaknesses.slice(0, 3).map((w: string, idx: number) => (
              <Badge key={idx} variant="outline">
                {w}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
