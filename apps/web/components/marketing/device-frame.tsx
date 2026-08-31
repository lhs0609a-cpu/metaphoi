import { cn } from '@/lib/utils';

/**
 * 기기 프레임
 * ============================================================================
 *
 * 랜딩에 스톡 사진이나 3D 오브젝트를 놓지 않는다.
 *
 * 이 제품이 파는 것은 "결과 화면"이다. 그러면 그 화면을 그대로 보여주는
 * 것이 가장 강한 설명이고, 실제로 좋은 SaaS 랜딩들이 하는 방식이다.
 * 추상적인 일러스트는 무엇을 받게 되는지 알려주지 못하고, 스톡 사진은
 * 어느 서비스에 붙여도 말이 되기 때문에 아무것도 구별해 주지 못한다.
 *
 * 여기 프레임 안에는 실제 컴포넌트를 넣는다. 스크린샷 이미지가 아니라
 * 살아 있는 마크업이라서 — 화면을 고치면 랜딩의 목업도 같이 바뀐다.
 * 목업이 낡아서 실제와 달라지는 흔한 문제가 생기지 않는다.
 */

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  /** 주소창에 보일 경로 */
  path?: string;
}

/** 브라우저 창 */
export function BrowserFrame({ children, className, path = 'metaphoi.com/results' }: FrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-border bg-card shadow-e3',
        // 위쪽 테두리를 한 겹 밝게 — 빛이 위에서 온다는 신호 하나로
        // 판이 떠 있는 느낌이 생긴다. 그림자를 키우는 것보다 조용하다
        'ring-1 ring-inset ring-foreground/[0.04]',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-sunk px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        </span>
        <span className="ml-1 flex-1 truncate rounded-pill bg-background px-3 py-1 text-micro text-muted-foreground">
          {path}
        </span>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

/** 휴대폰 */
export function PhoneFrame({ children, className }: Omit<FrameProps, 'path'>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[2rem] border-[6px] border-foreground/85 bg-background shadow-e3',
        className
      )}
    >
      {/* 노치 — 기기라는 것을 알리는 최소한의 신호 */}
      <div className="flex justify-center bg-background pt-2.5" aria-hidden="true">
        <span className="h-1.5 w-16 rounded-pill bg-foreground/20" />
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

/**
 * 목업을 놓는 자리.
 *
 * 살짝 기울여서 판이 공간에 놓인 것처럼 보이게 한다. 각도가 크면
 * 내용이 읽히지 않으므로 아주 조금만 준다 — 여기서는 읽히는 것이 먼저다.
 * 모바일에서는 기울이지 않는다. 좁은 화면에서 기울이면 잘려 나간다.
 */
export function MockupStage({
  children,
  className,
  tilt = true,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  return (
    <div className={cn('relative', className)}>
      {/* 뒤에 깔리는 빛 — 배경과 목업 사이에 공기를 만든다 */}
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div
        className={cn(
          'transition-transform duration-slow ease-std',
          tilt && 'lg:[transform:perspective(1600px)_rotateY(-7deg)_rotateX(2deg)]'
        )}
      >
        {children}
      </div>
    </div>
  );
}
