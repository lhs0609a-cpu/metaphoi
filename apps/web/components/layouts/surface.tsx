import { cn } from '@/lib/utils';

type SurfaceMode = 'play' | 'ops';

interface SurfaceProps {
  /**
   * play — B2C. 검사·결과·공유. 항상 어두운 발광 세계, 큰 모션.
   * ops  — B2B 및 작업 화면. 사용자 테마를 따르고, 밀도가 촘촘하다.
   */
  mode: SurfaceMode;
  className?: string;
  children: React.ReactNode;
}

/**
 * 표면 경계. data-surface 하나로 globals.css의 토큰 세트가 통째로 바뀐다.
 * 바뀌는 것은 밀도(--row-h)·곡률(--radius-*)·고도(--shadow-*)·모션(--motion-scale)
 * 네 가지뿐이고, 색·타입·간격 스케일은 두 모드가 공유한다.
 */
export function Surface({ mode, className, children }: SurfaceProps) {
  return (
    <div data-surface={mode} className={cn('min-h-screen', className)}>
      {children}
    </div>
  );
}
