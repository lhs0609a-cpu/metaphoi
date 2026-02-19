'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LockedContentProps {
  title: string;
  items?: string[];
}

export function LockedContent({ title, items }: LockedContentProps) {
  const placeholderItems = items || [
    '이 영역의 분석 결과가 여기에 표시됩니다.',
    '상세한 해석과 설명을 확인할 수 있습니다.',
    '개인화된 추천사항이 제공됩니다.',
  ];

  return (
    <Card className="overflow-hidden border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {placeholderItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground/50 blur-[3px] select-none">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
