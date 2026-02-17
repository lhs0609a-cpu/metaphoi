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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {placeholderItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-2 shrink-0" />
              <p className="text-muted-foreground/50 blur-[4px] select-none">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
