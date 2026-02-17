'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DimensionBarProps {
  leftLabel: string;
  rightLabel: string;
  leftPercent: number;
  rightPercent: number;
  result: string;
}

function DimensionBar({ leftLabel, rightLabel, leftPercent, rightPercent, result }: DimensionBarProps) {
  const isLeft = leftLabel.charAt(0) === result;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={isLeft ? 'font-bold text-primary' : 'text-muted-foreground'}>
          {leftLabel}
        </span>
        <span className={!isLeft ? 'font-bold text-primary' : 'text-muted-foreground'}>
          {rightLabel}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
        <div
          className="bg-primary/70 rounded-l-full transition-all"
          style={{ width: `${leftPercent}%` }}
        />
        <div
          className="bg-primary/30 rounded-r-full transition-all"
          style={{ width: `${rightPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftPercent}%</span>
        <span>{rightPercent}%</span>
      </div>
    </div>
  );
}

interface ResultPreviewCardProps {
  typeCode: string;
  typeName: string;
  description: string;
  dimensions: {
    key: string;
    result: string;
    leftLabel: string;
    rightLabel: string;
    leftPercent: number;
    rightPercent: number;
  }[];
}

export function ResultPreviewCard({
  typeCode,
  typeName,
  description,
  dimensions,
}: ResultPreviewCardProps) {
  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="text-5xl font-bold tracking-wider text-primary mb-2">
          {typeCode}
        </div>
        <CardTitle className="text-2xl">{typeName}</CardTitle>
        <p className="text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {dimensions.map((dim) => (
          <DimensionBar
            key={dim.key}
            leftLabel={dim.leftLabel}
            rightLabel={dim.rightLabel}
            leftPercent={dim.leftPercent}
            rightPercent={dim.rightPercent}
            result={dim.result}
          />
        ))}
      </CardContent>
    </Card>
  );
}
