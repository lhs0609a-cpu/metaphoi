import { PhoneFrame } from '@/components/marketing/device-frame';

/**
 * 랜딩에서 보여주는 "잘 맞는 직군" 미리보기.
 *
 * 실제 결과 화면의 RoleFit 과 같은 마크업 규칙을 쓴다. 다만 여기서는
 * 검사 결과가 없으므로 예시 값을 넣는다 — 그래서 별도 컴포넌트로 뒀다.
 * 실제 컴포넌트를 억지로 재사용하면 랜딩 때문에 결과 화면에 예시용
 * 분기가 생기고, 그런 분기는 반드시 언젠가 실서비스에서 새어 나온다.
 */

const SAMPLE = [
  { rank: 1, family: '소프트웨어 개발', industry: 'IT·소프트웨어', band: '매우 잘 맞음' },
  { rank: 2, family: '데이터 사이언스', industry: '데이터·AI', band: '매우 잘 맞음' },
  { rank: 3, family: '프로덕트 매니지먼트', industry: 'IT·소프트웨어', band: '잘 맞는 편' },
];

export function RoleFitPreview() {
  return (
    <PhoneFrame className="w-full max-w-[17rem]">
      <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">잘 맞는 직군</p>
          <p className="text-small leading-relaxed text-muted-foreground">
            흥미가 맞는다는 뜻이지, 잘한다는 뜻은 아닙니다
          </p>
        </div>

        <ul className="flex flex-col">
          {SAMPLE.map((s) => (
            <li key={s.rank} className="flex items-baseline gap-2.5 border-t border-border py-3">
              <span className="stat-num w-3 shrink-0 text-tiny text-muted-foreground">
                {s.rank}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-small font-semibold">{s.family}</span>
                <span className="text-micro text-muted-foreground">
                  {s.industry} · {s.band}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PhoneFrame>
  );
}
